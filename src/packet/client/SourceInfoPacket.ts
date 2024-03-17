import { Bot } from "mineflayer";
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
	playerInfo: VoicePlayerInfo;
};
export default class SourceInfoPacket extends PacketClientBase<SourceInfoPacketData> {
	constructor(bot: Bot) {
		super(bot, "SourceInfoPacket");
	}
}
