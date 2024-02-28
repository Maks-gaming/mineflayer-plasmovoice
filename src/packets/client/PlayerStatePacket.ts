import { Bot } from "mineflayer";
import ClientPlasmoVoicePacket from "./ClientPlasmoVoicePacket";

export type PlayerStatePacketData = {
	voiceDisabled: boolean;
	microphoneMuted: boolean;
};
export default class PlayerStatePacket extends ClientPlasmoVoicePacket<PlayerStatePacketData> {
	constructor(bot: Bot) {
		super(bot, "PlayerStatePacket");
	}
}
