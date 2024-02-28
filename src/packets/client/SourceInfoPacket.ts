import { Bot } from "mineflayer";
import ClientPlasmoVoicePacket from "./ClientPlasmoVoicePacket";
import PlasmoVoice from "../../PlasmoVoice";

export default class SourceInfoPacket extends ClientPlasmoVoicePacket<{
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
}> {
	constructor(bot: Bot) {
		super(bot, "SourceInfoPacket");
	}
}
