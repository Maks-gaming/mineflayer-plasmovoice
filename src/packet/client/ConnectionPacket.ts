import { Bot } from "mineflayer";
import PacketClientBase from "./ClientPacketBase";

export type ConnectionPacketData = {
	secret: UUID;
	ip: string;
	port: number | undefined;
};
export default class ConnectionPacket extends PacketClientBase<ConnectionPacketData> {
	constructor(bot: Bot) {
		super(bot, "ConnectionPacket");
	}
}
