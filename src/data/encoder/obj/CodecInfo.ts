import ByteArrayDataInput from "../ByteArrayDataInput";

export type CodecInfoData = {
	name: string;
	params: Map<string, string>;
};

export namespace CodecInfo {
	export function deserialize(packet: ByteArrayDataInput): CodecInfoData {
		const name = packet.readUTF();

		const params = new Map<string, string>();
		const size = packet.readInt();
		for (let i = 0; i < size; i++) {
			params.set(packet.readUTF(), packet.readUTF());
		}

		return {
			name,
			params,
		};
	}
}
