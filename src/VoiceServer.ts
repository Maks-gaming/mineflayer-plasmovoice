// Libraries
import dgram from 'dgram';
import crypto from "crypto";
import PacketManager from './PacketManager';
import { OpusEncoder } from '@discordjs/opus';
import Utils from './Utils';
import hexToUuid from 'hex-to-uuid';
import PlasmoVoice from './PlasmoVoice';

// Types
import { Bot } from "mineflayer";

export default class VoiceServer {
    static bot: Bot;
    static host: string;
    static port: number;
    static udpSecret: UUID;

    static udpClient = dgram.createSocket('udp4');
    
    static init(bot: Bot) {
        this.bot = bot
        this.udpClient = dgram.createSocket('udp4');

        this.udpClient.on("error", (err) => { throw new Error(`Failed to connect to UDP server: ${err}`) });
        this.udpClient.on("message", this.handler.bind(this));
    }

    // UDP Message handler
    private static async handler(msg: Buffer, rinfo: dgram.RemoteInfo) {
        let packet = PacketManager.protoDef.parsePacketBuffer("plasmovoiceudp_packet", msg);
        if (packet['data']['id'] == 'PingPacket') {
            await this.ping();
            return;
        }
        //console.log(`udp ${packet['data']['id']}`)
    }
    
    // Send plasmovoice ping packet
    private static async ping() {
        let pingPacket = await PacketManager.encodeUDP({
            "currentTime": BigInt(Date.now())
        }, "PingPacket", this.udpSecret);
        this.sendBuffer(pingPacket);
    }

    // Connect to UDP server
    static async connect(host: string, port: number, udpSecret: UUID) {
        // Stop exists connection if exists
        this.host = host;
        this.port = port;
        this.udpSecret = udpSecret;

        this.ping();

        process.on('SIGINT', () => {
            this.udpClient.close(() => {
                console.log('socket closed');
                process.exit(0);
            });
        });
    }

    // Closes UDP connection
    static terminate() {
        // Init re-created server
        this.init(this.bot);
    }

    static sendBuffer(buffer: Buffer) {
        this.udpClient.send(buffer, 0, buffer.length, this.port, this.host, (err) => {
            if (err) {
                console.error(`Error sending UDP message: ${err}`);
            }
        });
    }

    // UUID.nameUUIDFromBytes() in Java
    private static generateId(input: Buffer) {
        var md5Bytes = crypto.createHash('md5').update(input).digest()
        md5Bytes[6] &= 0x0f;  // clear version        
        md5Bytes[6] |= 0x30;  // set to version 3     
        md5Bytes[8] &= 0x3f;  // clear variant        
        md5Bytes[8] |= 0x80;  // set to IETF variant  
        return hexToUuid(md5Bytes.toString('hex'))
    }

    static async sendPCM(pcmBuffer: Buffer) {
        const opusEncoder = new OpusEncoder(PacketManager.configPacketData.captureInfo.sampleRate, 1);
        const frameSize = (PacketManager.configPacketData.captureInfo.sampleRate / 1000) * 20;

        const activationName = Buffer.from(PacketManager.configPacketData.activations[0].name + "_activation", "utf-8");
        const activationUUID = await this.generateId(activationName);
        const activationId: UUID = Utils.uuidStrToSigBits(activationUUID);

        // Cut pcm to frames
        const frames = [];
        for (let i = 0; i < pcmBuffer.length; i += frameSize) {
            const frame = pcmBuffer.slice(i, i + frameSize);
            frames.push(frame);
        }

        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i];
            if (frame.length !== frameSize) {
                return;
            }
            
            const opus = opusEncoder.encode(frame);
            const encodedOpus = await PacketManager.encryptVoice(opus);

            // PlayerAudioPacket
            const voicePacket = {
                "sequenceNumber": BigInt(i),
                "data": encodedOpus,
                "activationId": activationId,
                "distance": 8,
                "stereo": false
            }
            const encodedVoicePacket = await PacketManager.encodeUDP(voicePacket, "PlayerAudioPacket", this.udpSecret);
            await this.sendBuffer(encodedVoicePacket);

            console.log(i);

            await new Promise(r => setTimeout(r, 3));
        }

        // @ts-expect-error
        this.bot.emit("voicechat_audio_end");
    }
}