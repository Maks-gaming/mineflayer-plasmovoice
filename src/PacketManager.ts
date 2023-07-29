// Libraries
import crypto from "crypto";
import { ProtoDef } from "protodef";

// Types
import { Bot } from "mineflayer";
import { Client } from "minecraft-protocol";
import protocol from "./data/protocol";

const UDP_MAGIC_NUMBER: number = 1318061289;

export default class PacketManager {
    static protoDef = new ProtoDef(false);
    
    static publicKey: Buffer;
    static privateKey: string;
    static aesKey: Buffer;

    static configPacketData: ConfigPacket;
    static players: VoicePlayerInfo[];
    static sourceById: {sourceId: UUID, playerId: UUID | null}[] = [];

    static async init(bot: Bot) {

        // Add types to ProtoDef
        this.protoDef.addProtocol(protocol, ["login", "toClient"]);
        this.protoDef.addProtocol(protocol, ["udp"]);
        this.protoDef.addTypes(protocol.types);

        // Register plasmo types & channels in ProtoDef on client login
        bot.once("login", async () => {
            await this.registerPlasmoChannels(bot._client);
            await this.registerPlasmoTypes(bot._client);
        })

        // Generate RSA keys
        crypto.generateKeyPair('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'der'
            },
            privateKeyEncoding: {
                type: 'pkcs1',
                format: 'pem'
            }
        }, (err, publicKey, privateKey) => {
            // Handle errors
            if (err) {
                throw new Error(`Failed to generate RSA Key: ${err}`);
            }

            // Save keys
            this.publicKey = publicKey;
            this.privateKey = privateKey;
        });
    }

    // Register channels
    private static async registerPlasmoChannels(client: Client) {
        client.registerChannel("plasmo:voice/v2/installed", undefined, true); // TODO: Channel types & catch data
        client.registerChannel("plasmo:voice/v2/service", undefined, true); // TODO: Channel types & catch data
        client.registerChannel("plasmo:voice/v2", this.protoDef.types.plasmovoice_packet, true);
    }

    // FIXME: Find out if it is possible to do this differently
    private static async registerPlasmoTypes(client: Client) {
        for (const [key, value] of Object.entries(this.protoDef.types)) {
            client.registerChannel(key, value);
        }
    }

    // Encode data for UDP protocol messaging
    static async encodeUDP(data: object, type: string, secret: UUID): Promise<Buffer> {
        let out = this.protoDef.createPacketBuffer("plasmovoiceudp_packet", {
            "id": type,
            "secret": secret,
            "currentTime": BigInt(Date.now()),
            "magic_number": UDP_MAGIC_NUMBER,
            "data": data
        })
        return out
    }

    // FIXME: plasmovoice has support for multiple algorithms,
    // but there is only one what has been supported by original mod.
    // we should probably add support for multiple algorithms (c) cralix

    static async getAESKey() {
        if (!this.configPacketData) { throw new Error("ConfigPacket not recieved!"); }

        const decrypted = crypto.privateDecrypt(
            { 
                key: this.privateKey,
                padding: crypto.constants.RSA_PKCS1_PADDING
            }, this.configPacketData.encryptionInfo.data);
        return decrypted;
    }

    static async encryptVoice(data: Buffer): Promise<Buffer> {
        const iv = crypto.randomBytes(16);
        
        const cipher = crypto.createCipheriv('aes-128-cbc', this.aesKey, iv);
        const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);

        return Buffer.concat([iv, encrypted]);
    }

    static async decryptVoice(encrypted: Buffer): Promise<Buffer> {
        if (!this.configPacketData) { throw new Error("ConfigPacket not recieved!"); }

        const iv = encrypted.slice(0, 16);
        const data = encrypted.slice(16);

        const decipher = crypto.createDecipheriv('aes-128-cbc', this.aesKey, iv);
        const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);

        return decrypted;
    }
}