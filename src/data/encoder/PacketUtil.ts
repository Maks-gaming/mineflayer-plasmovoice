import ByteArrayDataInput from "./ByteArrayDataInput";
import ByteArrayDataOutput from "./ByteArrayDataOutput";

export default class PacketUtil {
	static readUUID(packet: ByteArrayDataInput): UUID {
		return {
			mostSignificantBits: packet.readLong(),
			leastSignificantBits: packet.readLong(),
		};
	}

	static writeUUID(
		packet: ByteArrayDataOutput,
		uuid: UUID,
	): ByteArrayDataOutput {
		packet.writeLong(uuid.mostSignificantBits);
		packet.writeLong(uuid.leastSignificantBits);
		return packet;
	}

	static readIntList(packet: ByteArrayDataInput): number[] {
		const size = packet.readInt();
		const list: number[] = [];
		for (let i = 0; i < size; i++) list.push(packet.readInt());
		return list;
	}
}
