import { Bot } from "mineflayer";
import ClientPlasmoVoicePacket from "./ClientPlasmoVoicePacket";
import PlasmoVoice from "../../PlasmoVoice";

export default class SourceAudioEndPacket extends ClientPlasmoVoicePacket<{
	sourceId: UUID;
	sequenceNumber: BigInt;
}> {
	constructor(bot: Bot) {
		super(bot, "SourceAudioEndPacket");
	}
}
