import { Bot } from "mineflayer";
import PacketClientBase from "./ClientPacketBase";

export type PlayerStatePacketData = {
	voiceDisabled: boolean;
	microphoneMuted: boolean;
};
export default class PlayerStatePacket extends PacketClientBase<PlayerStatePacketData> {
	constructor(bot: Bot) {
		super(bot, "PlayerStatePacket");
	}
}
