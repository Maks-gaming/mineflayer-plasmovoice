import Core from "../Core";
import Utils from "../Utils";
import { log } from "../lib";
import PacketClientEncoder from "./PacketClientEncoder";
import ConfigPacket from "./client/ConfigPacket";
import ConnectionPacket from "./client/ConnectionPacket";
import PlayerInfoPacket from "./client/PlayerInfoPacket";
import PlayerInfoRequestPacket from "./client/PlayerInfoRequestPacket";
import PlayerStatePacket from "./client/PlayerStatePacket";
import SourceAudioEndPacket from "./client/SourceAudioEndPacket";
import SourceInfoPacket from "./client/SourceInfoPacket";
import SourceInfoRequestPacket from "./client/SourceInfoRequestPacket";

export default class PacketClientHandler {
	private readonly core;

	readonly packetEncoder;

	// Packets
	readonly playerInfoRequestPacket;
	readonly playerInfoPacket;
	readonly connectionPacket;
	readonly configPacket;
	readonly sourceInfoPacket;
	readonly sourceAudioEndPacket;
	readonly playerStatePacket;
	readonly sourceInfoRequestPacket;

	constructor(core: Core) {
		this.core = core;

		log.debug("Registering client packet encoder");
		this.packetEncoder = new PacketClientEncoder(this.core);

		log.debug("Registering client packets");
		this.playerInfoRequestPacket = new PlayerInfoRequestPacket(
			this.core.bot,
		);
		this.playerInfoPacket = new PlayerInfoPacket(this.core.bot);
		this.connectionPacket = new ConnectionPacket(this.core.bot);
		this.configPacket = new ConfigPacket(this.core.bot);
		this.sourceInfoPacket = new SourceInfoPacket(this.core.bot);
		this.sourceAudioEndPacket = new SourceAudioEndPacket(this.core.bot);
		this.playerStatePacket = new PlayerStatePacket(this.core.bot);
		this.sourceInfoRequestPacket = new SourceInfoRequestPacket(
			this.core.bot,
		);

		this.playerInfoRequestPacket.on("packet", (data) => {
			this.playerInfoPacket.send({
				voiceDisabled: false,
				microphoneMuted: false,
				minecraftVersion: this.core.bot.version,
				version: "2.1.2",
				publicKey: this.core.storedData.keyPair.publicKey,
			});
		});

		this.connectionPacket.on("packet", (data) => {
			this.core.packetSocketHandler.connect(
				data.ip,
				data.port,
				data.secret,
			);
		});

		this.configPacket.on("packet", (data) => {
			this.core.storedData.config = data;

			// Checking for supported encryption
			if (this.core.storedData.config!.hasEncryptionInfo == false) {
				// FEAT: Support disabled encryption
				log.fatal(new Error(`Encryption is disabled`));
				return;
			}

			if (
				this.core.storedData.config!.encryptionInfo.algorithm !=
				"AES/CBC/PKCS5Padding"
			) {
				log.fatal(
					new Error(
						`Unsupported encryption type "${this.core.storedData.config!.encryptionInfo.algorithm}"`,
					),
				);
				return;
			}

			this.core.packetSocketHandler.packetEncoder.prepare();

			this.core.bot.emit("plasmovoice_connected");
		});

		this.sourceInfoPacket.on("packet", (data) => {
			// Don't save a player, if it's exists
			if (
				this.core.storedData.sourceById.some(
					(item) => item.playerName == data.playerInfo.playerNick,
				)
			)
				return;
			// Save player
			this.core.storedData.sourceById.push({
				sourceId: data.id,
				playerName: data.playerInfo.playerNick,
			});
		});

		this.sourceAudioEndPacket.on("packet", (data) => {
			const sourceData = this.core.storedData.sourceById.find((item) =>
				Utils.objectEquals(item.sourceId, data.sourceId),
			);

			if (!sourceData) {
				log.warn(
					`Unknown sourceId in SourceAudioEndPacket: ${data.sourceId}, ignoring`,
				);
				return;
			}
			this.core.bot.emit("plasmovoice_voice_end", {
				player: sourceData.playerName,
				sequenceNumber: data.sequenceNumber,
			});
		});
	}
}
