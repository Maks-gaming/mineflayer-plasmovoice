import dgram from "dgram";
import Core from "../Core";
import Utils from "../Utils";
import { log } from "../lib";
import PacketSocketEncoder from "./PacketSocketEncoder";
import PingPacket from "./socket/PingPacket";
import PlayerAudioPacket from "./socket/PlayerAudioPacket";
import SourceAudioPacket from "./socket/SourceAudioPacket";

export default class PacketSocketHandler {
	private readonly core;

	readonly packetEncoder;

	pingPacket: PingPacket | undefined;
	playerAudioPacket: PlayerAudioPacket | undefined;
	sourceAudioPacket: SourceAudioPacket | undefined;

	ip: string | undefined;
	port: number | undefined;
	secret: UUID | undefined;

	socket: dgram.Socket | undefined;

	constructor(core: Core) {
		this.core = core;

		log.debug("Registering socket packet encoder");
		this.packetEncoder = new PacketSocketEncoder(this.core);
	}

	connect(ip: string, port: number, secret: UUID) {
		this.ip =
			ip == "0.0.0.0"
				? ((this.core.bot._client.socket as any)._host ??
					this.core.bot._client.socket.remoteAddress)
				: ip;
		this.port = port ?? this.core.bot._client.socket.remotePort ?? 25565;
		this.secret = secret;

		this.socket = dgram.createSocket("udp4");

		this.socket.on("connect", () => {
			log.getSubLogger({ name: "Socket" }).debug(
				"Connected to the socket",
			);

			this.setupPackets();

			const connector = setInterval(() => {
				if (this.core.storedData.config === undefined) {
					this.pingPacket!.send({
						currentTime: BigInt(Date.now()),
						serverIp: this.ip!,
						serverPort: this.port!,
					});
				} else {
					clearInterval(connector);
				}
			}, 500);
		});

		this.socket.on("close", () => {
			log.warn(`Socket closed`);
		});

		this.socket.on("error", (err) => {
			log.fatal(`Socket error: ${err.message}`);
		});

		this.socket.connect(this.port!, this.ip!);
	}

	setupPackets() {
		if (!this.socket) throw new Error("Socket is not up");

		this.pingPacket = new PingPacket(this.core);
		this.playerAudioPacket = new PlayerAudioPacket(this.core);
		this.sourceAudioPacket = new SourceAudioPacket(this.core);

		this.pingPacket.on("packet", () => {
			this.pingPacket!.send({
				currentTime: BigInt(Date.now()),
			});
		});

		this.sourceAudioPacket.on("packet", (data) => {
			if (
				this.core.storedData.sourceById.some((item) =>
					Utils.objectEquals(item.sourceId, data.sourceId),
				)
			) {
				// Sound event
				const sourceData = this.core.storedData.sourceById.find(
					(item) => Utils.objectEquals(item.sourceId, data.sourceId),
				);

				if (!sourceData) {
					return;
				}

				this.core.bot.emit("plasmovoice_voice", {
					player: sourceData.playerName,
					distance: data.distance,
					sequenceNumber: data.sequenceNumber,
					data: this.packetEncoder.decodePCM(
						this.packetEncoder.decryptOpus(data.data),
					),
				});
			} else {
				// Requesting source info
				this.core.packetClientHandler.sourceInfoRequestPacket.send({
					sourceId: data.sourceId,
				});
			}

			return;
		});
	}
}
