import { Bot } from "mineflayer";
import PlasmoVoice, { log } from "./lib";

/** The function for changing the logging level, by default - 4, and these are warnings, errors and fatal */
export function setLoggingLevel(level: number = 4) {
	log.settings.minLevel = level;
}

export function plugin(bot: Bot) {
	bot.plasmovoice = new PlasmoVoice(bot);
}

export * from "./lib";

export default {
	plugin,
	setLoggingLevel,
};

declare module "mineflayer" {
	interface Bot {
		plasmovoice: PlasmoVoice;
	}
	interface BotEvents {
		plasmovoice_voice: (data: {
			player: string;
			distance: number;
			sequenceNumber: BigInt;
			data: Buffer;
		}) => void;
		plasmovoice_voice_end: (data: {
			player: string;
			sequenceNumber: BigInt;
		}) => void;
		plasmovoice_connected: () => void;
		plasmovoice_audio_end: () => void;
	}
}
