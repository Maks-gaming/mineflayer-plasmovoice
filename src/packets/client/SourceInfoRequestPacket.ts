import { Bot } from "mineflayer";
import ClientPlasmoVoicePacket from "./ClientPlasmoVoicePacket";

export type SourceInfoRequestPacketData = {
	sourceId: UUID;
};

export default class SourceInfoRequestPacket extends ClientPlasmoVoicePacket<SourceInfoRequestPacketData> {
	constructor(bot: Bot) {
		super(bot, "SourceInfoRequestPacket");
	}
}
