import { Bot } from "mineflayer";
import ByteArrayDataInput from "../../data/encoder/ByteArrayDataInput";
import ByteArrayDataOutput from "../../data/encoder/ByteArrayDataOutput";
import {
	CaptureInfo,
	CaptureInfoData,
} from "../../data/encoder/obj/CaptureInfo";
import {
	EncryptionInfo,
	EncryptionInfoData,
} from "../../data/encoder/obj/EncryptionInfo";
import {
	VoiceActivation,
	VoiceActivationData,
} from "../../data/encoder/obj/VoiceActivation";
import {
	VoiceSourceLine,
	VoiceSourceLineData,
} from "../../data/encoder/obj/VoiceSourceLine";
import PacketUtil from "../../data/encoder/PacketUtil";
import PacketClientBase from "./ClientPacketBase";

export type ConfigPacketData = {
	serverId: UUID;
	captureInfo: CaptureInfoData;
	hasEncryptionInfo: boolean;
	encryptionInfo: EncryptionInfoData | undefined;
	sourceLines: Set<VoiceSourceLineData>;
	activations: Set<VoiceActivationData>;
};

export default class ConfigPacket extends PacketClientBase<ConfigPacketData> {
	constructor(bot: Bot) {
		super(bot, 3, "ConfigPacket");
	}

	public serialize(): ByteArrayDataOutput {
		throw "Not required for client-side";
	}

	public deserialize(packet: ByteArrayDataInput): ConfigPacketData {
		const serverId = PacketUtil.readUUID(packet);

		const captureInfo = CaptureInfo.deserialize(packet);

		const hasEncryptionInfo = packet.readBoolean();
		const encryptionInfo = hasEncryptionInfo
			? EncryptionInfo.deserialize(packet)
			: undefined;

		// Source Lines
		let sourceLines = new Set<VoiceSourceLineData>();
		const size = packet.readInt();
		for (let i = 0; i < size; i++) {
			sourceLines.add(VoiceSourceLine.deserialize(packet));
		}

		// Activations
		let activations = new Set<VoiceActivationData>();
		const activationsSize = packet.readInt();
		for (let i = 0; i < activationsSize; i++) {
			activations.add(VoiceActivation.deserialize(packet));
		}

		return {
			serverId,
			captureInfo,
			hasEncryptionInfo,
			encryptionInfo,
			sourceLines,
			activations,
		};
	}
}
