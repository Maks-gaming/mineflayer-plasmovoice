import SchemaEncoder from "./PacketEncoder/schemaEncoder";
import { PlasmoVoiceSchemas2 } from "./PacketEncoder/schemas";

function buf2hex(buffer: Buffer) { // buffer is an ArrayBuffer
    return [...new Uint8Array(buffer)]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('');
  }

export default function test() { 
    var rawPacket = {
        packet_type: 10,
        minecraftVersion: "1.19.4",
        protocol_version: "1.0.0",
        version: "2.0.3",
        publicKey: Buffer.alloc(256),
        voiceDisabled: false,
        microphoneDisabled: false
    };

    let encoder = new SchemaEncoder(PlasmoVoiceSchemas2.PlayerInfoPacket);
    let encodedPacket = encoder.encode(rawPacket);

    console.log(buf2hex(encodedPacket));
}