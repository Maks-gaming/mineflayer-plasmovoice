import { Bot } from "mineflayer";
import { generateRSA, registerChannel } from "./PacketUtils";
//import dgram from "dgram";
import { PacketMeta } from "minecraft-protocol";
import SchemaEncoder from "./PacketEncoder/schemaEncoder";
import { PlasmoVoiceSchemas2 } from "./PacketEncoder/schemas";

export default class PacketSenderVersion2 {

    private readonly bot: Bot;
    //private udp_proxy: dgram.Socket = dgram.createSocket('udp4');
    private publicKey = "";
    //private privateKey = "";

    constructor (bot: Bot) {
        this.bot = bot;
    }

    async Initialize() {
        console.log("init")
        this.RegisterChannels();
        this.bot._client.on("packet", this.handle.bind(this));
    }

    async RegisterChannels() {
        console.log("Registering plasmo-voice 2.0 channels");
        registerChannel(this.bot, "plasmo:voice/v2");
        registerChannel(this.bot, "plasmo:voice/v2/installed");
        registerChannel(this.bot, "plasmo:voice/v2/service");
        console.log("Registered");
    }

    buf2hex(buffer: Buffer) { // buffer is an ArrayBuffer
        return [...new Uint8Array(buffer)]
            .map(x => x.toString(16).padStart(2, '0'))
            .join('');
      }

    async sendPlayerInfoPacket() {
        let key = Buffer.alloc(256);
        key.write(this.publicKey);

        var rawPacket = {
            packet_type: 10,
            minecraftVersion: this.bot.version,
            protocol_version: "1.0.0",
            version: "2.0.3",
            publicKey: Buffer.from(this.publicKey),
            voiceDisabled: false,
            microphoneDisabled: false
        };

        let encoder = new SchemaEncoder(PlasmoVoiceSchemas2.PlayerInfoPacket);
        let encodedPacket = encoder.encode(rawPacket);

        console.log(this.buf2hex(encodedPacket));

        this.bot._client.write("custom_payload", {
            channel: "plasmo:voice/v2",
            data: encodedPacket
        })
        console.log("[plasmovoice] connected")

    }

    private async handle(data: any, packetMeta : PacketMeta, buffer: Buffer, fullBuffer: Buffer) {
        if (packetMeta.name != "custom_payload") { return; }
        
        if (data["channel"] == "plasmo:voice/v2") {
            console.log(data.data)
            const packetContent: Buffer = data["data"];
            // Detecting request-packet
            if (data["data"].length == 1) {
                const packetID = packetContent.readInt8();
                console.log(packetID);
                switch (packetID) {
                    // PlayerInfoRequestPacket
                    case (2) : {
                        console.log("PlayerInfoRequestPacket")
                        const keys = await generateRSA();
                        //this.privateKey = keys.privateKey;
                        this.publicKey = keys.publicKey;
    
                        await this.sendPlayerInfoPacket();
                    }
                }
            }
        }
    }
}