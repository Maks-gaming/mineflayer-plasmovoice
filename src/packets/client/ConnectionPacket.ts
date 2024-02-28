import { Bot } from "mineflayer";
import ClientPlasmoVoicePacket from "./ClientPlasmoVoicePacket";
import PlasmoVoice from "../../PlasmoVoice";

export default class ConnectionPacket extends ClientPlasmoVoicePacket<{
	secret: UUID;
	ip: string;
	port: number;
}> {
	constructor(bot: Bot) {
		super(bot, "ConnectionPacket");
	}
}
