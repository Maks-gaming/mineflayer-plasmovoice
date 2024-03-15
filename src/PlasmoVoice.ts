import { Bot } from "mineflayer";
import { Logger } from "tslog";
import SoundConverter from "./converter";
import PacketManager from "./packets/PacketManager";

export const log = new Logger({ minLevel: 4 });

export default class PlasmoVoice {
	private readonly bot;
	private readonly packetManager;

	constructor(bot: Bot) {
		this.bot = bot;
		this.packetManager = new PacketManager(this.bot);
	}

	/** The method that interrupts sending audio to voice chat */
	async stopTalking() {
		if (!this.packetManager.config) {
			log.error(new Error("Voice chat is not launched!"));
			return;
		}

		return await this.packetManager.socketPacketManager.stopTalking();
	}

	/** A method that checks if audio is being sent at the moment */
	isTalking() {
		if (!this.packetManager.config) {
			log.error(new Error("Voice chat is not launched!"));
			return;
		}

		return this.packetManager.socketPacketManager.isTalking();
	}

	/** Allows you to turn off and turn on the microphone / listening to other players */
	setState(microphoneMuted: boolean, voiceDisabled: boolean) {
		this.packetManager.playerStatePacket.send({
			voiceDisabled: voiceDisabled,
			microphoneMuted: microphoneMuted,
		});
	}

	/** Returns a list of Activations (channels where the plugin can send an audio stream) */
	getActivations(): string[] {
		if (!this.packetManager.config) {
			log.error(new Error("Voice chat is not launched!"));
			return [];
		}

		return this.packetManager.config.activations.map((item) => item.name);
	}

	/** Returns the sampling rate of all sounds. By default it is `48_000` Hz */
	getSampleRate(): number {
		if (!this.packetManager.config) {
			log.error(new Error("Voice chat is not launched!"));
			return -1;
		}

		return this.packetManager.config.captureInfo.sampleRate;
	}

	/** Returns the default distance around the player
	 * @argument activation by default is "proximity"
	 */
	getDefaultDistance(activation?: string | undefined) {
		if (!this.packetManager.config) {
			log.error(new Error("Voice chat is not launched!"));
			return -1;
		}

		const activationData = this.packetManager.config.activations.find(
			(value) => value.name === activation ?? "proximity",
		)!;

		return activationData.defaultDistance;
	}

	/** Returns allowed distances for activation
	 * @argument activation by default is "proximity"
	 */
	getAllowedDistances(activation?: string | undefined) {
		if (!this.packetManager.config) {
			log.error(new Error("Voice chat is not launched!"));
			return [];
		}

		const activationData = this.packetManager.config.activations.find(
			(value) => value.name === activation ?? "proximity",
		)!;

		return activationData.distances;
	}

	async sendAudio(
		audio: string,
		distance?: number | undefined,
		activation?: string | undefined,
	) {
		if (!this.packetManager.config) {
			log.error(new Error("Voice chat is not launched!"));
			return;
		}

		if (
			distance &&
			!this.getAllowedDistances(activation ?? "proximity").includes(
				distance,
			)
		) {
			log.error(new Error(`Distance ${distance} is not allowed!`));
			return;
		}

		this.packetManager.socketPacketManager.sendPCM(
			await SoundConverter.convertToPCM(
				audio,
				this.packetManager.config!.captureInfo.sampleRate,
			),
			distance ?? this.getDefaultDistance(activation ?? "proximity"),
			activation ?? "proximity",
		);
	}
}
