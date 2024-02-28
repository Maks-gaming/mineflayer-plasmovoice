import { Bot } from "mineflayer";
import ClientPlasmoVoicePacket from "./ClientPlasmoVoicePacket";

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
export default class SourceInfoPacket extends ClientPlasmoVoicePacket<SourceInfoPacketData> {
	constructor(bot: Bot) {
		super(bot, "SourceInfoPacket");
	}
}
