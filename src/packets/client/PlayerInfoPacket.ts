import { Bot } from "mineflayer";
import ClientPlasmoVoicePacket from "./ClientPlasmoVoicePacket";
import PlasmoVoice from "../../PlasmoVoice";

export default class PlayerInfoPacket extends ClientPlasmoVoicePacket<{
	voiceDisabled: boolean;
	microphoneMuted: boolean;
	minecraftVersion: string;
	version: string;
	publicKey: Buffer;
}> {
	constructor(bot: Bot) {
		super(bot, "PlayerInfoPacket");
	}
}
