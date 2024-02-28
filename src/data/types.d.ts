interface UUID {
	mostSignificantBits: bigint;
	lessSignificantBits: bigint;
}

interface VoicePlayerInfo {
	playerId: UUID;
	playerNick: string;
	muted: boolean;
	voiceDisabled: boolean;
	microphoneMuted: boolean;
}

interface PlayerDisconnectPacket {
	playerId: UUID;
}
