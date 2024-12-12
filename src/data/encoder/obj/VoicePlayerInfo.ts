import ByteArrayDataInput from "../ByteArrayDataInput";
import PacketUtil from "../PacketUtil";

export type VoicePlayerInfoData = {
	playerId: UUID;
	playerNick: string;
	muted: boolean;
	voiceDisabled: boolean;
	microphoneMuted: boolean;
};

export namespace VoicePlayerInfo {
	export function deserialize(
		packet: ByteArrayDataInput,
	): VoicePlayerInfoData {
		return {
			playerId: PacketUtil.readUUID(packet),
			playerNick: packet.readUTF(),
			muted: packet.readBoolean(),
			voiceDisabled: packet.readBoolean(),
			microphoneMuted: packet.readBoolean(),
		};
	}
}
