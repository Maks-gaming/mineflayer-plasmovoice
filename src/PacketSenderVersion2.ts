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
    private privateKey = "";

    constructor (bot: Bot) {
        this.bot = bot;
    }

    async Initialize() {
        this.RegisterChannels();
        this.bot._client.on("packet", this.handle);
    }

    async RegisterChannels() {
        console.log("Registering plasmo-voice 2.0 channels");
        registerChannel(this.bot, "plasmo:voice/v2");
        registerChannel(this.bot, "plasmo:voice/v2/installed");
        registerChannel(this.bot, "plasmo:voice/v2/service");
    }

    /*async connectUDP() {
        this.udp_proxy.connect(this.bot._client.socket.remotePort || 0, this.bot._client.socket.remoteAddress, () => {});
        this.udp_proxy.on("connect", () => { console.log("UDP connected") });
        this.udp_proxy.on("message", console.log);
        this.udp_proxy.on("listening", () => { console.log("Listening") });
        this.udp_proxy.on("error", console.log);
    }*/

    async sendPlayerInfoPacket() {
        var rawPacket = {
            packet_type: 10,
            minecraftVersion: this.bot.version,
            protocol_version: "1.0.0",
        }

        let encoder = new SchemaEncoder(PlasmoVoiceSchemas2.PlayerInfoPacket)
        let encodedPacket = encoder.encode(rawPacket)

        this.bot._client.write("custom_payload", {
            channel: "plasmo:voice/v2",
            data: encodedPacket
        })
        console.log("[plasmovoice] connected")

    }

    private async handle(data: any, packetMeta : PacketMeta, buffer: Buffer, fullBuffer: Buffer) {
        if (packetMeta.name != "custom_payload") { return; }

        const packetContent: Buffer = data["data"];
        
        if (data["channel"] == "plasmo:voice/v2") {
            // Detecting request-packet
            if (data["data"].length == 1) {
                const packetID = packetContent.readInt8();

                switch (packetID) {
                    // PlayerInfoRequestPacket
                    case (2) : {
                        const keys = await generateRSA();
                        this.privateKey = keys.privateKey;
                        this.publicKey = keys.publicKey;
    
                        await this.sendPlayerInfoPacket();
                    }
                }
            }
        }
    }
}