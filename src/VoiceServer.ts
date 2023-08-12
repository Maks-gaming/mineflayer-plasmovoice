// Libraries
import dgram from 'dgram';
import crypto from "crypto";
import PacketManager from './PacketManager';
import { OpusEncoder } from '@discordjs/opus';
import Utils from './Utils';
import hexToUuid from 'hex-to-uuid';

// Types
import { Bot } from "mineflayer";
import { debug } from './PlasmoVoice';

export default class VoiceServer {
    static bot: Bot;
    static host: string;
    static port: number;
    static udpSecret: UUID;
    static voiceLastTimestamp: number = 0;

    static udpClient = dgram.createSocket('udp4');
    
    static init(bot: Bot) {
        this.bot = bot
        this.udpClient = dgram.createSocket('udp4');

        this.udpClient.on("error", (err) => { throw new Error(`Failed to connect to UDP server: ${err}`); });
        this.udpClient.on("close", () => { Utils.debug("UDP Connection closed"); })
        this.udpClient.on("message", this.handler.bind(this));
    }

    // UDP Message handler
    private static async handler(msg: Buffer, _: dgram.RemoteInfo) {
        const packet = PacketManager.protoDef.parsePacketBuffer("plasmovoiceudp_packet", msg);

        if (packet.data.id == 'PingPacket') {
            // Answer on ping packets
            await this.ping();
            return;
        } else if (packet.data.id == 'SourceAudioPacket') {
            const data: SourceAudioPacket = packet.data.data;

            if (PacketManager.sourceById.some(item => Utils.objectEquals(item.sourceId, data.sourceId))) {
                // Sound event
                const sourceData = PacketManager.sourceById.find(item => Utils.objectEquals(item.sourceId, data.sourceId));

                // @ts-expect-error
                this.bot.emit("voicechat_voice", {
                    "player": sourceData?.playerName,
                    "distance": data.distance,
                    "sequenceNumber": data.sequenceNumber,
                    "data": await PacketManager.decryptVoice(data.data)
                })
            } else {
                // SourceInfoRequestPacket (unknown sourceId)
                this.bot._client.writeChannel("plasmo:voice/v2",
                {
                    "id": "SourceInfoRequestPacket",
                    "data": {
                        "sourceId": data.sourceId
                    }
                });
            }

            return;
        }

        Utils.debug(`[UDP] Recieved ${packet.data.id} packet`);
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

        Utils.debug("[UDP] Sent first ping packet");

        // Stop UDP when program finish (for some reasons UDP can break after restart)
        process.on('SIGINT', () => {
            this.udpClient.close(() => {
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
    private static nameUUIDFromBytes(input: Buffer) {
        var md5Bytes = crypto.createHash('md5').update(input).digest();
        md5Bytes[6] &= 0x0f;  // clear version        
        md5Bytes[6] |= 0x30;  // set to version 3     
        md5Bytes[8] &= 0x3f;  // clear variant        
        md5Bytes[8] |= 0x80;  // set to IETF variant  
        return hexToUuid(md5Bytes.toString('hex'))
    }

    static async sendPCM(pcmBuffer: Buffer, distance: number = 16, isStereo: boolean = false) {

        // Throw an error, if previous voice is sending
        if (Date.now() - this.voiceLastTimestamp < 3 * 1.5) {
            if (!debug) {
                throw new Error("Voice channel is busy");
            } else {
                Utils.debug("[Error] Voice channel is busy");
            }
        }

        const opusEncoder = new OpusEncoder(PacketManager.configPacketData.captureInfo.sampleRate, isStereo ? 2 : 1);
        const frameSize = (PacketManager.configPacketData.captureInfo.sampleRate / 1_000) * 20;

        const activationName: Buffer = Buffer.from("proximity" + "_activation", "utf-8");
        const activationId: string = this.nameUUIDFromBytes(activationName);
        const activationUUID: UUID = Utils.uuidStrToSigBits(activationId);

        // Cut pcm to frames
        const frames = [];
        for (let i = 0; i < pcmBuffer.length; i += frameSize) {
            const frame = pcmBuffer.slice(i, i + frameSize);
            frames.push(frame);
        }

        // TODO: Fix sending opus
        // Since now sending the stream is most likely not quite correct

        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i];

            // Last frame (by default is empty or silent)
            if (frame.length !== frameSize) {
                break;
            }
            
            const opus = opusEncoder.encode(frame);
            const ecryptedOpus = await PacketManager.encryptVoice(opus);

            // PlayerAudioPacket
            let voicePacket = {
                "sequenceNumber": BigInt(i),
                "data": ecryptedOpus,
                "activationId": activationUUID,
                "distance": distance,
                "stereo": isStereo
            }

            const encodedVoicePacket = await PacketManager.encodeUDP(voicePacket, "PlayerAudioPacket", this.udpSecret);
            this.sendBuffer(encodedVoicePacket);
            this.voiceLastTimestamp = Date.now();

            await new Promise(r => setTimeout(r, 3));
        }

        // @ts-expect-error
        this.bot.emit("voicechat_audio_end");
    }
}