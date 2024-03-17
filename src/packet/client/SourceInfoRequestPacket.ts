import { Bot } from "mineflayer";
import PacketClientBase from "./ClientPacketBase";

export type SourceInfoRequestPacketData = {
	sourceId: UUID;
};

export default class SourceInfoRequestPacket extends PacketClientBase<SourceInfoRequestPacketData> {
	constructor(bot: Bot) {
		super(bot, "SourceInfoRequestPacket");
	}
}
