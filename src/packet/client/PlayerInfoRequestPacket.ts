import { Bot } from "mineflayer";
import PacketClientBase from "./ClientPacketBase";

export default class PlayerInfoRequestPacket extends PacketClientBase<{}> {
	constructor(bot: Bot) {
		super(bot, "PlayerInfoRequestPacket");
	}
}
