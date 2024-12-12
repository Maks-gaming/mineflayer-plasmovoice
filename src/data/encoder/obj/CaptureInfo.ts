import ByteArrayDataInput from "../ByteArrayDataInput";
import { CodecInfo, CodecInfoData } from "./CodecInfo";

export type CaptureInfoData = {
	sampleRate: number;
	mtuSize: number;
	hasEncoderInfo: boolean;
	encoderInfo: CodecInfoData | undefined;
};

export namespace CaptureInfo {
	export function deserialize(packet: ByteArrayDataInput): CaptureInfoData {
		// Capture Info
		const sampleRate = packet.readInt();
		const mtuSize = packet.readInt();
		const hasEncoderInfo = packet.readBoolean();

		let encoderInfo;
		if (hasEncoderInfo) {
			encoderInfo = CodecInfo.deserialize(packet);
		}

		return {
			sampleRate,
			mtuSize,
			hasEncoderInfo,
			encoderInfo: hasEncoderInfo ? encoderInfo : undefined,
		};
	}
}
