export default null;

export class PlasmoVoiceSchemas1 {
    static packetHeader = {
        'packet_type': 'u8',
    }

    static serverConnectPacket = {
        'packet_type': 'u8',
        'token': 'string',
        'host': 'string',
        'port': 'i32',
        'priority': 'boolean',
    }

    static configPacket = {
        'packet_type': 'u8',
        'sample_rate': 'i32',
    }

    static clientConnectPacket = {
        'packet_type': 'u8',
        'token': 'string',
        'protocol_version': 'string',
    }

    static authPacketUDP = {
        'packet_type': 'u8',
        'token': 'string',
    }

    static voicePacket = {
        'distance': 'i16',
        'sequence_number': 'i64',
    }
    
    static voiceEndPacket = {
        'packet_type': 'u8',
        'distance': 'i16'
    }
}

export class PlasmoVoiceSchemas2 {
    static PlayerInfoPacket = {
        'packet_type': 'u8',
        'minecraftVersion': 'string',
        'version': 'string',
        'publicKey': 'bytes[256]',
        'voiceDisabled': 'boolean',
        'microphoneDisabled': 'boolean'
    }
}