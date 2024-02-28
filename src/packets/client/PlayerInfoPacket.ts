import { Bot } from "mineflayer";
import ClientPlasmoVoicePacket from "./ClientPlasmoVoicePacket";

export type PlayerInfoPacketData = {
	voiceDisabled: boolean;
	microphoneMuted: boolean;
	minecraftVersion: string;
	version: string;
	publicKey: Buffer;
};
export default class PlayerInfoPacket extends ClientPlasmoVoicePacket<PlayerInfoPacketData> {
	constructor(bot: Bot) {
		super(bot, "PlayerInfoPacket");
	}
}
