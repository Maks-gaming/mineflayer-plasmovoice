import { Bot } from "mineflayer";
import ByteArrayDataInput from "../../data/encoder/ByteArrayDataInput";
import ByteArrayDataOutput from "../../data/encoder/ByteArrayDataOutput";
import PacketUtil from "../../data/encoder/PacketUtil";
import PacketClientBase from "./ClientPacketBase";

export type ConnectionPacketData = {
	secret: UUID;
	ip: string;
	port: number;
};

export default class ConnectionPacket extends PacketClientBase<ConnectionPacketData> {
	constructor(bot: Bot) {
		super(bot, 1, "ConnectionPacket");
	}

	public deserialize(packet: ByteArrayDataInput): ConnectionPacketData {
		return {
			secret: PacketUtil.readUUID(packet),
			ip: packet.readUTF(),
			port: packet.readInt(),
		};
	}

	public serialize(): ByteArrayDataOutput {
		throw "Not required for client-side";
	}
}
