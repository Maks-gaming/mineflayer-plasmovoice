import { Bot } from "mineflayer";
import { Logger } from "tslog";
import Core from "./Core";
import SoundConverter from "./SoundConverter";

export const log = new Logger({ minLevel: 4 });

export default class PlasmoVoice {
	private readonly bot;

	/** **PRO-USERS ONLY** */
	public core;

	constructor(bot: Bot) {
		this.bot = bot;
		this.core = new Core(this.bot);
	}

	/** The method that interrupts sending audio to voice chat */
	async stopTalking(): Promise<void> {
		return await this.core.stopTalking();
	}

	/** The belief that plasovoice is up and running */
	isLaunched(): boolean {
		return this.core.storedData.config != undefined;
	}

	/** A method that checks if audio is being sent at the moment */
	isTalking(): boolean {
		return this.core.isTalking();
	}

	/** Allows you to turn off and turn on the microphone / listening to other players */
	setState(microphoneMuted: boolean, voiceDisabled: boolean): void {
		this.core.packetClientHandler.playerStatePacket.send({
			microphoneMuted: microphoneMuted,
			voiceDisabled: voiceDisabled,
		});
	}

	/** Returns a list of Activations (channels where the plugin can send an audio stream) */
	getActivations(): string[] {
		if (!this.isLaunched()) {
			throw log.error("Voice chat is not loaded!");
		}

		return this.core.storedData.config!.activations.map(
			(item) => item.name,
		);
	}

	/** Returns the sampling rate of all sounds. By default it is `48_000` Hz */
	getSampleRate(): number {
		if (!this.isLaunched()) {
			throw log.error("Voice chat is not loaded!");
		}

		return this.core.storedData.config!.captureInfo.sampleRate;
	}

	/** Returns the default distance around the player
	 * @argument activation by default is "proximity"
	 */
	getDefaultDistance(activation?: string | undefined): number {
		if (!this.isLaunched()) {
			throw log.error("Voice chat is not loaded!");
		}

		let activationData;
		if (activation) {
			activationData = this.core.storedData.config!.activations.find(
				(value) => value.name == (activation ?? "proximity"),
			);
		} else {
		}

		if (!activationData) {
			throw log.fatal("Activations not found! Server issue?");
		}

		return activationData.defaultDistance;
	}

	/** Returns allowed distances for activation
	 * @argument activation by default is "proximity"
	 */
	getAllowedDistances(activation?: string | undefined): number[] {
		if (!this.isLaunched()) {
			throw log.error("Voice chat is not loaded!");
		}

		let activationData;
		if (activation) {
			activationData = this.core.storedData.config!.activations.find(
				(value) => value.name == (activation ?? "proximity"),
			);
		} else {
			activationData = this.core.storedData.config!.activations.find(
				(value) => value.proximity == true,
			);
		}

		if (!activationData) {
			throw log.fatal("Activations not found! Server issue?");
		}

		return activationData.distances;
	}

	async sendAudio(
		audio: string,
		distance?: number | undefined,
		activation?: string | undefined,
	): Promise<void> {
		if (!this.isLaunched()) {
			throw log.error("Voice chat is not loaded!");
		}

		if (
			distance &&
			!this.getAllowedDistances(activation).includes(distance)
		) {
			log.error(new Error(`Distance ${distance} is not allowed!`));
			return;
		}

		if (!activation) {
			const proximity = this.core.storedData.config!.activations.find(
				(value) => value.proximity == true,
			);

			if (!proximity) {
				throw log.fatal(
					"Proximity activation not found! Choose something",
				);
			}

			activation = proximity.name;
		}

		this.core.sendPCM(
			await SoundConverter.convertToPCM(
				audio,
				this.core.storedData.config!.captureInfo.sampleRate,
			),
			distance ?? this.getDefaultDistance(activation),
			activation,
		);
	}
}
