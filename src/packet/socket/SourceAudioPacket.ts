import Core from "../../Core";
import ByteArrayDataInput from "../../data/encoder/ByteArrayDataInput";
import ByteArrayDataOutput from "../../data/encoder/ByteArrayDataOutput";
import PacketUtil from "../../data/encoder/PacketUtil";
import PacketSocketBase from "./PacketSocketBase";

export type SourceAudioPacketData = {
	sequenceNumber: bigint;
	data: Uint8Array;
	sourceId: UUID;
	sourceState: number;
	distance: number;
};

export default class SourceAudioPacket extends PacketSocketBase<SourceAudioPacketData> {
	constructor(core: Core) {
		super(core, 3, "SourceAudioPacket");
	}

	public deserialize(packet: ByteArrayDataInput): SourceAudioPacketData {
		return {
			sequenceNumber: packet.readLong(),
			data: packet.readBytes(packet.readInt()),
			sourceId: PacketUtil.readUUID(packet),
			sourceState: packet.readByte(),
			distance: packet.readShort(),
		};
	}

	public serialize(data: SourceAudioPacketData): ByteArrayDataOutput {
		throw "Not required for client-side";
	}
}
