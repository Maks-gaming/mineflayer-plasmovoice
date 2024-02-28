import { Bot } from "mineflayer";
import ClientPlasmoVoicePacket from "./ClientPlasmoVoicePacket";

export default class PlayerStatePacket extends ClientPlasmoVoicePacket<{
	voiceDisabled: boolean;
	microphoneMuted: boolean;
}> {
	constructor(bot: Bot) {
		super(bot, "PlayerStatePacket");
	}
}
