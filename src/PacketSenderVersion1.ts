import { Bot } from "mineflayer";
import dgram from "dgram";
import { PacketMeta } from "minecraft-protocol";
import { registerChannel } from "./PacketUtils";
import { PlasmoVoiceSchemas1 } from "./PacketEncoder/schemas";
import CursoredBuffer from "./PacketEncoder/cursoredBuffer";
import SchemaEncoder from "./PacketEncoder/schemaEncoder";
import SchemaDecoder from "./PacketEncoder/schemaDecoder";

import { OpusEncoder } from '@discordjs/opus';

export default class PacketSenderVersion1 {

    private readonly bot: Bot;
    private udp_proxy: dgram.Socket = dgram.createSocket('udp4');
    private host: string = "";
    private port: number = 0;
    private breaker: boolean = false;
    public sample_rate = -1;

    private PACKET_TIMEOUT_MS : number = 7;
    private voicePacketEncoder = new SchemaEncoder(PlasmoVoiceSchemas1.voicePacket);
    private voiceEndPacketEncoder = new SchemaEncoder(PlasmoVoiceSchemas1.voiceEndPacket);

    constructor (bot: Bot) {
        this.bot = bot;
    }

    async Initialize() {
        this.RegisterChannels();
        this.bot._client.on("packet", this.handle.bind(this));
    }

    async RegisterChannels() {
        registerChannel(this.bot, "plasmo:voice");
    }

    async sendClientConnectPacket(token: string) {
        var rawPacket = {
            packet_type: 7,
            token: token,
            protocol_version: "1.0.0",
        }

        let encoder = new SchemaEncoder(PlasmoVoiceSchemas1.clientConnectPacket)
        let encodedPacket = encoder.encode(rawPacket)

        this.bot._client.write("custom_payload", {
            channel: "plasmo:voice",
            data: encodedPacket
        })
        console.log("[plasmovoice] connected")

    }

    async sendPacketUDP(packet: Buffer) {
        this.udp_proxy.send(packet, 0, packet.length, this.port, this.host, (err) => {
            if (err) { throw err }
        })
    }

    async sendAuthPacketUDP(token: string) {

        var rawPacket = {
            packet_type: 2,
            token: token,
        }

        // Encoding
        let encoder = new SchemaEncoder(PlasmoVoiceSchemas1.authPacketUDP);
        let encodedPacket = encoder.encode(rawPacket);

        // Sending
        this.sendPacketUDP(encodedPacket);

        this.udp_proxy.on('message', (rawData, remote) => {

            // Ping packet emit
            if (rawData.length == 1) {
                this.sendPacketUDP(rawData);
            }

        });
    }

    async startUDP(host: string, port: number, sample_rate: number = 48000) {
        this.host = host;
        this.port = port;

        process.on('SIGINT', () => {
            this.udp_proxy.close(() => {
                console.log('[plasmovoice] socket closed');
            });
        });
    }

    async stopSending() {
        this.breaker = true
        await new Promise(r => setTimeout(r, 500));
        this.breaker = false
    }

    async SendPCM(pcmBuffer: Buffer, distance: number = 16) {
        var opus_encoder = new OpusEncoder(this.sample_rate, 1);
        var frameSize = (this.sample_rate / 1000) * 2 * 20;

        if (!this.host || !this.port) {
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
            this.sendPacketUDP(packet);

            seq_num += 1;
            await new Promise(r => setTimeout(r, this.PACKET_TIMEOUT_MS));

            if (i === frames.length - 2 || this.breaker == true) {
                
                const packetDataEnd: any = {
                    'packet_type': 4,
                    'distance': 0,
                };
                const encodedPacketEnd = this.voiceEndPacketEncoder.encode(packetDataEnd);
                this.sendPacketUDP(encodedPacketEnd);

                // @ts-expect-error
                this.bot.emit("voicechat_audio_end");
                this.breaker = false;

                break;
            }
        }
    }

    async handle(data: any, packetMeta : PacketMeta, buffer: Buffer, fullBuffer: Buffer) {
        if (packetMeta.name != "custom_payload") { return; }
        if (data.channel != "plasmo:voice") { return; }

        // Getting packet number
        var packetHeaderCursoredBuffer = new CursoredBuffer(data.data, null);
        var packetHeaderDecoder = new SchemaDecoder(PlasmoVoiceSchemas1.packetHeader);
        var packetHeader: any = packetHeaderDecoder.decode(packetHeaderCursoredBuffer);
        var voicePacketType: number = packetHeader["packet_type"];

        if (voicePacketType == 6) {

            // serverConnectPacket
            var packetCursoredBuffer = new CursoredBuffer(data.data, null);
            var packetDecoder = new SchemaDecoder(PlasmoVoiceSchemas1.serverConnectPacket);
            var data: any = packetDecoder.decode(packetCursoredBuffer);

            this.sendClientConnectPacket(data["token"]);
            this.startUDP(data["host"], data["port"]);
            this.sendAuthPacketUDP(data["token"]);

        } else if (voicePacketType == 5) {

            // configPacket
            var packetCursoredBuffer = new CursoredBuffer(data.data, null);
            var packetDecoder = new SchemaDecoder(PlasmoVoiceSchemas1.configPacket);
            var data: any = packetDecoder.decode(packetCursoredBuffer);

            this.sample_rate = data["sample_rate"];
            
            // @ts-expect-error
            this.bot.emit("voicechat_connected");
        }
    }
}