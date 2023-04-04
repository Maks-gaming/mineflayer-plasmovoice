const packetHeader = {
    'packet_type': 'u8',
}

const serverConnectPacket = {
    'packet_type': 'u8',
    'token': 'string',
    'host': 'string',
    'port': 'i32',
    'priority': 'boolean',
}

const clientConnectPacket = {
    'packet_type': 'u8',
    'token': 'string',
    'protocol_version': 'string',
}

const authPacketUDP = {
    'packet_type': 'u8',
    'token': 'string',
}

const configPacket = {
    'packet_type': 'u8',
    'sample_rate': 'i32',
}

const voicePacket = {
    'distance': 'i16',
    'sequence_number': 'i64',
}

const voiceEndPacket = {
    'packet_type': 'u8',
    'distance': 'i16'
}

export {voiceEndPacket, voicePacket, packetHeader, serverConnectPacket, clientConnectPacket, authPacketUDP, configPacket}