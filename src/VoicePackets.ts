import { Bot } from "mineflayer";

import SchemaEncoder from "./packetsUtils/schemaEncoder";
import * as schemas from './packetsUtils/schemas' ;

import dgram from 'dgram';
import { Buffer } from 'node:buffer';

import { OpusEncoder } from '@discordjs/opus';

// TODO AES TOKEN FOR 2.0.0-xxxxxxxxx

export class VoicePackets {

    // System variables
    private readonly bot: Bot;

    // Class initialization
    constructor(bot: Bot)
    {
        this.bot = bot;
    }

    // Plugin Channels
    async ChannelRegistration(): Promise<void>
    {
        this.bot._client.write("custom_payload", {
            channel: "minecraft:register",
            data: Buffer.from("plasmo:voice", "utf8")
        })
    }

    async ClientConnectPacket(token: string): Promise<void> {
        var rawPacket = {
            packet_type: 7,
            token: token,
            protocol_version: "1.0.0",
        }

        let encoder = new SchemaEncoder(schemas.clientConnectPacket)
        let encodedPacket = encoder.encode(rawPacket)

        this.bot._client.write("custom_payload", {
            channel: "plasmo:voice",
            data: encodedPacket
        })
        console.log("[plasmovoice] connected")

        // @ts-expect-error
        this.bot.emit("voicechat_connected");
    }

    async ConfigPacket(microphoneEnabled: boolean) {
        // TODO
    }

    // UDP channels

    private udp_addr : string | undefined;
    private udp_port : number | undefined;
    private udp_client = dgram.createSocket('udp4');

    private sendUdpPacket(packet: Buffer) {
        this.udp_client.send(packet, 0, packet.length, this.udp_port, this.udp_addr, (err) => {
            if (err) { throw err }
        })
    }

    async wakeUDP(host: string, port: number, sample_rate: number = 48000) {
        this.udp_addr = host;
        this.udp_port = port;

        process.on('SIGINT', () => {
            this.udp_client.close(() => {
                console.log('[plasmovoice] socket closed');
            });
        });
    }

    private PACKET_TIMEOUT_MS : number = 7;
    private voicePacketEncoder = new SchemaEncoder(schemas.voicePacket);
    private voiceEndPacketEncoder = new SchemaEncoder(schemas.voiceEndPacket);

    // TODO - fix audio lags
    async SendPCM(pcmBuffer: Buffer, distance: number = 16, sample_rate: number) {
        var opus_encoder = new OpusEncoder(sample_rate, 1);
        var frameSize = (sample_rate / 1000) * 2 * 20;

        if (!this.udp_addr || !this.udp_port) {
            throw new Error("Connection is not established");
        }

        const frames = [];
        for (let i = 0; i < pcmBuffer.length; i += frameSize) {
            const frame = pcmBuffer.slice(i, i + frameSize);
            frames.push(frame);
        }

        const opusLength = Buffer.alloc(5);

        let seq_num: number = 0;
        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i];
            if (frame.length !== frameSize) {
                return;
            }
            
            const opus = opus_encoder.encode(frame);
            opusLength.writeInt32BE(opus.length, 1);

            const packetData: any = {
                'distance': distance,
                'sequence_number': seq_num,
            };
            const encodedPacket = this.voicePacketEncoder.encode(packetData);
            const packet = Buffer.concat([opusLength, opus, encodedPacket]);
            this.sendUdpPacket(packet);

            seq_num += 1;
            if (i === frames.length - 2) {
                
                const packetDataEnd: any = {
                    'packet_type': 4,
                    'distance': 0,
                };
                const encodedPacketEnd = this.voiceEndPacketEncoder.encode(packetDataEnd);
                this.sendUdpPacket(encodedPacketEnd);

                // @ts-expect-error
                this.bot.emit("voicechat_audio_end");

                return;
            }

            await new Promise(r => setTimeout(r, this.PACKET_TIMEOUT_MS));
        }
    }

    async AuthPacketUDP(token: string) {

        var rawPacket = {
            packet_type: 2,
            token: token,
        }

        // Encoding
        let encoder = new SchemaEncoder(schemas.authPacketUDP);
        let encodedPacket = encoder.encode(rawPacket);

        // Sending
        this.sendUdpPacket(encodedPacket);

        this.udp_client.on('message',  (rawData, remote) => {

            // Ping packet emit
            if (rawData.length == 1) {
                this.sendUdpPacket(rawData);
            }

        });
        
        console.log("[plasmovoice] Authorized")
    }
}
