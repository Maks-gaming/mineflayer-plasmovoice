import { Bot } from "mineflayer";
import { ProtoDef } from "protodef";

import { log } from "../PlasmoVoice";
import Utils from "../Utils";
import protocol from "../data/protocol";
import PacketEncoder from "./PacketEncoder";
import SocketPacketManager from "./SocketPacketManager";
import ConfigPacket, { ConfigPacketData } from "./client/ConfigPacket";
import ConnectionPacket from "./client/ConnectionPacket";
import PlayerInfoPacket from "./client/PlayerInfoPacket";
import PlayerInfoRequestPacket from "./client/PlayerInfoRequestPacket";
import PlayerStatePacket from "./client/PlayerStatePacket";
import SourceAudioEndPacket from "./client/SourceAudioEndPacket";
import SourceInfoPacket from "./client/SourceInfoPacket";
import SourceInfoRequestPacket from "./client/SourceInfoRequestPacket";

export default class PacketManager {
	private readonly bot;
	private readonly protoDef = new ProtoDef(false);
	private readonly packetEncoder: PacketEncoder = undefined!;
	readonly socketPacketManager;

	// Data
	config: ConfigPacketData | undefined;
	sourceById: { sourceId: UUID; playerName: string }[] = [];

	// Client packets
	readonly playerInfoRequestPacket;
	readonly playerInfoPacket;
	readonly connectionPacket;
	readonly configPacket;
	readonly sourceInfoPacket;
	readonly sourceAudioEndPacket;
	readonly playerStatePacket;
	readonly sourceInfoRequestPacket;

	constructor(bot: Bot) {
		this.bot = bot;

		this.playerInfoRequestPacket = new PlayerInfoRequestPacket(this.bot);
		this.playerInfoPacket = new PlayerInfoPacket(this.bot);
		this.connectionPacket = new ConnectionPacket(this.bot);
		this.configPacket = new ConfigPacket(this.bot);
		this.sourceInfoPacket = new SourceInfoPacket(this.bot);
		this.sourceAudioEndPacket = new SourceAudioEndPacket(this.bot);
		this.playerStatePacket = new PlayerStatePacket(this.bot);
		this.sourceInfoRequestPacket = new SourceInfoRequestPacket(this.bot);

		this.initialize();

		this.socketPacketManager = new SocketPacketManager(
			this.bot,
			this.packetEncoder,
			this,
		);

		this.bot.once("login", () => {
			this.initializeTypesPhase2();
		});
	}

	private initializeTypesPhase1() {
		log.info("Initializing types [1]..");

		this.protoDef.addProtocol(protocol, ["login", "toClient"]);
		this.protoDef.addProtocol(protocol, ["udp"]);
		this.protoDef.addTypes(protocol.types);

		log.info("Initializing types [1].. [OK]");
	}

	private initializeTypesPhase2() {
		log.info("Initializing types [2]..");

		// Channels
		this.bot._client.registerChannel(
			"plasmo:voice/v2/installed",
			undefined,
			true,
		);
		this.bot._client.registerChannel(
			"plasmo:voice/v2/service",
			undefined,
			true,
		);
		this.bot._client.registerChannel(
			"plasmo:voice/v2",
			this.protoDef.types.plasmovoice_packet,
			true,
		);

		// Types
		for (const [key, value] of Object.entries(this.protoDef.types)) {
			this.bot._client.registerChannel(key, value);
		}

		log.info("Initializing types [2].. [OK]");
	}

	private initializePacketEvents() {
		log.info("Initializing client packet events..");

		// receiving PlayerInfoRequestPacket => sending PlayerInfoPacket
		this.playerInfoRequestPacket.received(() => {
			this.playerInfoPacket.send({
				voiceDisabled: false,
				microphoneMuted: false,
				minecraftVersion: this.bot.version,
				version: "2.0.8",
				publicKey: this.packetEncoder.keyPair.publicKey,
			});
		});

		// receiving ConnectionPacket => connecting to Socket
		this.connectionPacket.received((data) => {
			this.socketPacketManager.connect(data.ip, data.port, data.secret);
		});

		// receiving ConfigPacket => plasmovoice is ready
		this.configPacket.received((data) => {
			this.config = data;

			// Checking for supported encryption
			if (this.config.hasEncryptionInfo == false) {
				// FEAT: Support disabled encryption
				log.fatal(new Error(`Encryption is disabled`));
				return;
			}

			if (
				this.config.encryptionInfo.algorithm != "AES/CBC/PKCS5Padding"
			) {
				log.fatal(
					new Error(
						`Unsupported encryption type "${this.config.encryptionInfo.algorithm}"`,
					),
				);
				return;
			}

			if (!this.config!.activations[0].proximity) {
				log.fatal(new Error(`Proximity activation not found`));
				return;
			}

			this.packetEncoder.initialize(data);

			this.bot.emit("plasmovoice_connected");
		});

		// receiving SourceInfoPacket => saving source info to know which player is speaking
		this.sourceInfoPacket.received((data) => {
			// Don't save a player, if it's exists
			if (
				this.sourceById.some(
					(item) => item.playerName == data.playerInfo.playerNick,
				)
			)
				return;

			// Save player
			this.sourceById.push({
				sourceId: data.id,
				playerName: data.playerInfo.playerNick,
			});
		});

		// receiving SourceAudioEndPacket => the event when the player stopped talking
		this.sourceAudioEndPacket.received((data) => {
			const sourceData = this.sourceById.find((item) =>
				Utils.objectEquals(item.sourceId, data.sourceId),
			);

			if (!sourceData) {
				console.log(
					`Unknown sourceId in SourceAudioEndPacket: ${data.sourceId}`,
				);
				return;
			}

			this.bot.emit("plasmovoice_voice_end", {
				player: sourceData.playerName,
				sequenceNumber: data.sequenceNumber,
			});
		});

		log.info("Initializing client packet events.. [OK]");
	}

	private initialize() {
		this.initializeTypesPhase1();

		(this.packetEncoder as PacketEncoder) = new PacketEncoder(
			this.protoDef,
		);

		(this.packetEncoder as PacketEncoder) = new PacketEncoder(
			this.protoDef,
		);

		this.initializePacketEvents();
	}
}
