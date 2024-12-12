import ByteArrayDataInput from "../ByteArrayDataInput";
import PacketUtil from "../PacketUtil";
import { CodecInfo, CodecInfoData } from "./CodecInfo";

export type VoiceActivationData = {
	name: string;
	translation: string;
	icon: string;
	distances: number[];
	defaultDistance: number;
	proximity: boolean;
	transitive: boolean;
	stereoSupported: boolean;
	hasEncoderInfo: boolean;
	encoderInfo: CodecInfoData | undefined;
	weight: number;
};

export namespace VoiceActivation {
	export function deserialize(
		packet: ByteArrayDataInput,
	): VoiceActivationData {
		const name = packet.readUTF();
		const translation = packet.readUTF();
		const icon = packet.readUTF();
		const distances = PacketUtil.readIntList(packet);
		const defaultDistance = packet.readInt();
		const proximity = packet.readBoolean();
		const transitive = packet.readBoolean();
		const stereoSupported = packet.readBoolean();
		const hasEncoderInfo = packet.readBoolean();
		let encoderInfo;
		if (hasEncoderInfo) {
			encoderInfo = CodecInfo.deserialize(packet);
		}
		const weight = packet.readInt();

		return {
			name,
			translation,
			icon,
			distances,
			defaultDistance,
			proximity,
			transitive,
			stereoSupported,
			hasEncoderInfo,
			encoderInfo: hasEncoderInfo ? encoderInfo : undefined,
			weight,
		};
	}
}
