// Libraries
import crypto from "crypto";
import { ProtoDef } from "protodef";

// Types
import { Bot } from "mineflayer";
import { Client } from "minecraft-protocol";
import protocol from "./data/protocol";

const UDP_MAGIC_NUMBER: number = 1318061289;

export default class PacketManager {
    static bot: Bot;
    static protoDef = new ProtoDef(false);
    
    static publicKey: Buffer;
    static privateKey: string;
    static aesKey: Buffer;

    static configPacketData: ConfigPacket;
    static sourceById: {sourceId: UUID, playerName: string}[] = [];

    static async init(bot: Bot) {
        this.bot = bot;

        // Add types to ProtoDef
        this.protoDef.addProtocol(protocol, ["login", "toClient"]);
        this.protoDef.addProtocol(protocol, ["udp"]);
        this.protoDef.addTypes(protocol.types);

        // Register plasmo types & channels in ProtoDef on client login
        bot.once("login", async () => {
            this.registerAll();
        })

        // Generate RSA keys
        const keys = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'der'
            },
            privateKeyEncoding: {
                type: 'pkcs1',
                format: 'pem'
            }
        })

        this.publicKey = keys.publicKey;
        this.privateKey = keys.privateKey;
    }

    static async registerAll() {
        await this.registerPlasmoChannels(this.bot._client);
        await this.registerPlasmoTypes(this.bot._client);
    }

    static async getProximityActivation() {
        return this.configPacketData.activations.find(element => element.proximity === true);
    }
    

    // Register channels
    private static async registerPlasmoChannels(client: Client) {
        // This is just flag-channels, no types
        client.registerChannel("plasmo:voice/v2/installed", undefined, true);
        client.registerChannel("plasmo:voice/v2/service", undefined, true);
        
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
        const aesKey = crypto.privateDecrypt(
            { 
                key: this.privateKey,
                padding: crypto.constants.RSA_PKCS1_PADDING
            }, 
            this.configPacketData.encryptionInfo.data
        );

        return aesKey;
    }

    static async encryptVoice(data: Buffer): Promise<Buffer> {
        const iv = crypto.randomBytes(16);
        
        const cipher = crypto.createCipheriv('aes-128-cbc', this.aesKey, iv);
        const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);

        return Buffer.concat([iv, encrypted]);
    }

    // Unused
    static async decryptVoice(encrypted: Buffer): Promise<Buffer> {
        const iv = encrypted.slice(0, 16);
        const data = encrypted.slice(16);

        const decipher = crypto.createDecipheriv('aes-128-cbc', this.aesKey, iv);
        const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);

        return decrypted;
    }
}