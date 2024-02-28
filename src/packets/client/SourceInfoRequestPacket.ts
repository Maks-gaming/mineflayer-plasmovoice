import { Bot } from "mineflayer";
import ClientPlasmoVoicePacket from "./ClientPlasmoVoicePacket";

export default class SourceInfoRequestPacket extends ClientPlasmoVoicePacket<{
	sourceId: UUID;
}> {
	constructor(bot: Bot) {
		super(bot, "SourceInfoRequestPacket");
	}
}
