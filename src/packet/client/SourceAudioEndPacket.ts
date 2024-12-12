import { Bot } from "mineflayer";
import ByteArrayDataInput from "../../data/encoder/ByteArrayDataInput";
import ByteArrayDataOutput from "../../data/encoder/ByteArrayDataOutput";
import PacketUtil from "../../data/encoder/PacketUtil";
import PacketClientBase from "./ClientPacketBase";

export type SourceAudioEndPacketData = {
	sourceId: UUID;
	sequenceNumber: bigint;
};
export default class SourceAudioEndPacket extends PacketClientBase<SourceAudioEndPacketData> {
	constructor(bot: Bot) {
		super(bot, 18, "SourceAudioEndPacket");
	}

	public deserialize(packet: ByteArrayDataInput): SourceAudioEndPacketData {
		return {
			sourceId: PacketUtil.readUUID(packet),
			sequenceNumber: packet.readLong(),
		};
	}

	public serialize(data: SourceAudioEndPacketData): ByteArrayDataOutput {
		const output = new ByteArrayDataOutput();

		PacketUtil.writeUUID(output, data.sourceId);
		output.writeLong(data.sequenceNumber);

		return output;
	}
}
