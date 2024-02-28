import { Bot } from "mineflayer";
import ClientPlasmoVoicePacket from "./ClientPlasmoVoicePacket";

export type ConnectionPacketData = {
	secret: UUID;
	ip: string;
	port: number;
};
export default class ConnectionPacket extends ClientPlasmoVoicePacket<ConnectionPacketData> {
	constructor(bot: Bot) {
		super(bot, "ConnectionPacket");
	}
}
