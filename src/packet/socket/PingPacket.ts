import Core from "../../Core";
import ByteArrayDataInput from "../../data/encoder/ByteArrayDataInput";
import ByteArrayDataOutput from "../../data/encoder/ByteArrayDataOutput";
import PacketSocketBase from "./PacketSocketBase";

export type PingPacketData = {
	currentTime: bigint;
	serverIp?: string;
	serverPort?: number;
};

export default class PingPacket extends PacketSocketBase<PingPacketData> {
	constructor(core: Core) {
		super(core, 1, "PingPacket");
	}

	public deserialize(packet: ByteArrayDataInput): PingPacketData {
		return {
			currentTime: packet.readLong(),
		};
	}

	public serialize(data: PingPacketData): ByteArrayDataOutput {
		const out = new ByteArrayDataOutput();
		out.writeLong(data.currentTime);

		if (data.serverIp && data.serverPort) {
			out.writeUTF(data.serverIp);
			out.writeShort(data.serverPort);
		}

		return out;
	}
}
