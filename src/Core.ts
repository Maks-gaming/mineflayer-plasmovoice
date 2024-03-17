import { Bot } from "mineflayer";
import Utils from "./Utils";
import { log } from "./lib";
import PacketClientHandler from "./packet/PacketClientHandler";
import PacketSocketHandler from "./packet/PacketSocketHandler";
import StoredData from "./packet/StoredData";

export default class Core {
	readonly bot;

	readonly packetClientHandler;
	readonly packetSocketHandler;
	readonly storedData;

	private lastPlayerAudioPacketTimestamp = 0;
	private stopFlag = false;

	constructor(bot: Bot) {
		this.bot = bot;

		this.packetClientHandler = new PacketClientHandler(this);
		this.packetSocketHandler = new PacketSocketHandler(this);
		this.storedData = new StoredData();

		process.on("SIGINT", () => {
			if (this.packetSocketHandler.socket?.address()) {
				this.packetSocketHandler.socket.close();
				delete this.packetSocketHandler.socket;
			}
			process.exit(0);
		});
	}

	isTalking() {
		return Date.now() - this.lastPlayerAudioPacketTimestamp < 15 * 1.5;
	}

	async stopTalking(): Promise<void> {
		if (!this.isTalking()) {
			return;
		}

		this.stopFlag = true;
		return await new Promise((resolve) =>
			this.bot.once("plasmovoice_audio_end", () => {
				this.stopFlag = false;
				resolve(undefined);
			}),
		);
	}

	async sendPCM(pcmBuffer: Buffer, distance: number, activation: string) {
		this.stopFlag = false;

		if (this.isTalking()) {
			log.error(new Error("Voice channel is busy"));
			return;
		}

		const frameSize =
			(this.storedData.config!.captureInfo.sampleRate / 1_000) * 40;

		const activationUUID = Utils.getActivationUUID(activation);

		// Cut pcm to frames
		const frames = [];
		for (let i = 0; i < pcmBuffer.length; i += frameSize) {
			const frame = pcmBuffer.subarray(i, i + frameSize);
			frames.push(frame);
		}

		for (let i = 0; i < frames.length; i++) {
			// Stopping method
			if (this.stopFlag) {
				log.info("Voice interrupted");
				break;
			}

			const frame = frames[i];

			// Last frame (by default is empty or silent)
			if (frame.length !== frameSize) {
				break;
			}

			const opus =
				this.packetSocketHandler.packetEncoder.encodePCM(frame);
			const ecryptedOpus =
				this.packetSocketHandler.packetEncoder.encryptOpus(opus);

			this.packetSocketHandler.playerAudioPacket!.send({
				sequenceNumber: BigInt(i),
				data: ecryptedOpus,
				activationId: activationUUID,
				distance: distance,
				stereo: false,
			});

			this.lastPlayerAudioPacketTimestamp = Date.now();

			await new Promise((r) => setTimeout(r, 10));
		}

		this.bot.emit("plasmovoice_audio_end");
	}
}
