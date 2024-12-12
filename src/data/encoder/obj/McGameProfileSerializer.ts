import ByteArrayDataInput from "../ByteArrayDataInput";
import PacketUtil from "../PacketUtil";

export type McGameProfileSerializerData = {
	id: UUID;
	name: string;
	properties: Set<string[]>;
};

export namespace McGameProfileSerializer {
	export function deserialize(
		packet: ByteArrayDataInput,
	): McGameProfileSerializerData {
		const id = PacketUtil.readUUID(packet);
		const name = packet.readUTF();

		const length = packet.readInt();
		const properties = new Set<string[]>();
		for (let k = 0; k < length; k++) {
			properties.add([
				packet.readUTF(),
				packet.readUTF(),
				packet.readUTF(),
			]);
		}
		return {
			id,
			name,
			properties,
		};
	}
}
