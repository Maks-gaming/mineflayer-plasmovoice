import { Bot } from "mineflayer";
import PacketClientBase from "./ClientPacketBase";

export default class SourceAudioEndPacket extends PacketClientBase<{
	sourceId: UUID;
	sequenceNumber: BigInt;
}> {
	constructor(bot: Bot) {
		super(bot, "SourceAudioEndPacket");
	}
}
