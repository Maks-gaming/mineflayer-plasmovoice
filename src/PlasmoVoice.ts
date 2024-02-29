import { Bot } from "mineflayer";
import { Logger } from "tslog";
import PacketManager from "./PacketManager";
import SoundConverter from "./converter";

export const log = new Logger({ minLevel: 4 });

export default class PlasmoVoice {
	private readonly bot;
	private readonly packetManager;

	constructor(bot: Bot) {
		this.bot = bot;
		this.packetManager = new PacketManager(this.bot);
	}

	/** The method that interrupts sending audio to voice chat */
	stopTalking() {
		if (!this.packetManager.socketPacketManager) {
			log.error("Voice chat has not been launched yet!");
			return;
		}

		return this.packetManager.socketPacketManager.stopTalking();
	}

	/** A method that checks if audio is being sent at the moment */
	isTalking() {
		if (!this.packetManager.socketPacketManager) {
			log.error("Voice chat has not been launched yet!");
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

	// TODO: Improve this
	async sendAudio(audio: string) {
		if (!this.packetManager.socketPacketManager) {
			log.error("Voice chat has not been launched yet!");
			return;
		}

		this.packetManager.socketPacketManager.sendPCM(
			await SoundConverter.convertToPCM(
				audio,
				this.packetManager.config!.captureInfo.sampleRate,
			),
			16,
		);
	}
}
