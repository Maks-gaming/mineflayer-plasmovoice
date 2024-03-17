import { Bot } from "mineflayer";
import PacketClientBase from "./ClientPacketBase";

export type PlayerInfoPacketData = {
	voiceDisabled: boolean;
	microphoneMuted: boolean;
	minecraftVersion: string;
	version: string;
	publicKey: Buffer;
};
export default class PlayerInfoPacket extends PacketClientBase<PlayerInfoPacketData> {
	constructor(bot: Bot) {
		super(bot, "PlayerInfoPacket");
	}
}
