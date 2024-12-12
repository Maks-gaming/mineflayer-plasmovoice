import { Bot } from "mineflayer";
import ByteArrayDataInput from "../../data/encoder/ByteArrayDataInput";
import ByteArrayDataOutput from "../../data/encoder/ByteArrayDataOutput";
import PacketUtil from "../../data/encoder/PacketUtil";
import { CodecInfo } from "../../data/encoder/obj/CodecInfo";
import {
	VoicePlayerInfo,
	VoicePlayerInfoData,
} from "../../data/encoder/obj/VoicePlayerInfo";
import PacketClientBase from "./ClientPacketBase";

export type SourceInfoPacketData = {
	sourceType: string;
	addonId: string;
	id: UUID;
	hasSourceName: boolean;
	sourceName: string | undefined;
	state: number;
	hasDecoderInfo: boolean;
	decoderInfo: any;
	stereo: boolean;
	lineId: UUID;
	iconVisible: boolean;
	angle: number;
	playerInfo: VoicePlayerInfoData;
};
export default class SourceInfoPacket extends PacketClientBase<SourceInfoPacketData> {
	constructor(bot: Bot) {
		super(bot, 16, "SourceInfoPacket");
	}

	public deserialize(packet: ByteArrayDataInput): SourceInfoPacketData {
		const sourceType = packet.readUTF();
		const addonId = packet.readUTF();
		const id = PacketUtil.readUUID(packet);
		const hasSourceName = packet.readBoolean();
		const sourceName = hasSourceName ? packet.readUTF() : undefined;
		const state = packet.readByte();
		const hasDecoderInfo = packet.readBoolean();
		const decoderInfo = hasDecoderInfo
			? CodecInfo.deserialize(packet)
			: undefined;
		const stereo = packet.readBoolean();
		const lineId = PacketUtil.readUUID(packet);
		const iconVisible = packet.readBoolean();
		const angle = packet.readInt();
		const playerInfo = VoicePlayerInfo.deserialize(packet);
		return {
			sourceType,
			addonId,
			id,
			hasSourceName,
			sourceName,
			state,
			hasDecoderInfo,
			decoderInfo,
			stereo,
			lineId,
			iconVisible,
			angle,
			playerInfo,
		};
	}

	public serialize(): ByteArrayDataOutput {
		throw "Not required for client-side";
	}
}
