import ByteArrayDataInput from "../ByteArrayDataInput";

export type EncryptionInfoData = {
	algorithm: string;
	data: Uint8Array;
};

export namespace EncryptionInfo {
	export function deserialize(
		packet: ByteArrayDataInput,
	): EncryptionInfoData {
		const algorithm = packet.readUTF();

		const length = packet.readInt();
		const data = new Uint8Array(length);
		packet.readFully(data);

		return {
			algorithm,
			data,
		};
	}
}
