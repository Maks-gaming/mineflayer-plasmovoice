interface UUID {
    mostSignificantBits: bigint;
    lessSignificantBits: bigint;
}

interface ConfigPacket {
    serverId: UUID,
    captureInfo: {
        sampleRate: number,
        mtuSize: number,
        hasEncoderInfo: boolean,
        encoderInfo: Object
    },
    hasEncryptionInfo: boolean,
    encryptionInfo: {
        algorithm: string,
        data: Buffer
    },
    sourceLines: {
        name: string,
        translation: string,
        icon: string,
        defaultVolume: bigint,
        weight: number,
        hasPlayers: boolean,
        players: any
    }[],
    activations: {
        name: string,
        translation: string,
        icon: string,
        distances: number[],
        defaultDistance: number,
        proximity: boolean,
        transitive: boolean,
        stereoSupported: boolean,
        hasEncoderInfo: boolean,
        encoderInfo: any,
        weight: number
    }[]
    permissions: {
        key: string, 
        value: boolean 
    }[]
}

interface SourceAudioPacket {
    sequenceNumber: BigInt,
    data: Buffer,
    sourceId: UUID,
    sourceState: Buffer,
    distance: number
}

interface VoicePlayerInfo {
    playerId: UUID,
    playerNick: string,
    muted: boolean,
    voiceDisabled: boolean,
    microphoneMuted: boolean
}

interface PlayerDisconnectPacket {
    playerId: UUID
}

interface ConnectionPacket {
    secret: UUID,
    ip: string,
    port: number
}

interface SourceInfoPacket {
    sourceType: string,
    addonId: string,
    id: UUID,
    hasSourceName: boolean,
    sourceName: string | undefined,
    state: number
    hasDecoderInfo: boolean,
    decoderInfo: any,
    stereo: boolean,
    lineId: UUID,
    iconVisible: boolean,
    angle: number,
    playerInfo: VoicePlayerInfo
}

interface SourceAudioEndPacket {
    sourceId: UUID,
    sequenceNumber: BigInt
}