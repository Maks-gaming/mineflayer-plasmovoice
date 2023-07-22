// Libraries
import VoiceServer from "./VoiceServer";
import PacketManager from "./PacketManager";
import fs from "fs";

// Types
import { Bot } from "mineflayer";
import VoiceRecoder from "./VoiceRecoder";

export default class PlasmoVoice {

    // System variables
    public readonly bot: Bot;

    // Class initialization
    constructor(bot: Bot) {
        this.bot = bot;

        if (!bot) { return; }

        // Initialize packet manager
        PacketManager.init(this.bot);
        // Initialize voice server
        VoiceServer.init(this.bot);

        // Listen plugin channels
        this.bot._client.on("plasmo:voice/v2", async (packet) => {
            if (!packet) { return; }

            //console.log(packet.id)

            if (packet.id == 'PlayerInfoRequestPacket') {
                // PlayerInfoPacket
                this.bot._client.writeChannel("plasmo:voice/v2",
                    {
                        "id": "PlayerInfoPacket",
                        "data": {
                            voiceDisabled: false,
                            microphoneMuted: false,
                            minecraftVersion: "1.19.4",
                            version: "2.0.3",
                            publicKey: PacketManager.publicKey
                        }
                    }
                );
                return;
            } else if (packet.id == 'ConnectionPacket') {
                // Save data & create voice server
                if (packet["data"]["secret"] && packet["data"]["port"] && packet["data"]["ip"]) {
                    await VoiceServer.connect(packet["data"]["ip"], packet["data"]["port"], packet["data"]["secret"]);
                } else {
                    throw new Error("ConnectionPacket is invalid");
                }
                return;
            } else if (packet.id == 'ConfigPacket') {
                // Save data from this packet
                PacketManager.configPacketData = packet["data"];
                PacketManager.aesKey = await PacketManager.getAESKey();

                // Check for correct encryption
                if (packet["data"]["hasEncryptionInfo"] == false) {
                    throw new Error(`Encryption is disabled`);
                } else if (packet["data"]["encryptionInfo"]["algorithm"] != "AES/CBC/PKCS5Padding") {
                    throw new Error(`Unsupported encryption type "${packet["data"]["encryptionInfo"]["algorithm"]}"`);
                }

                // LanguageRequestPacket
                this.bot._client.writeChannel("plasmo:voice/v2",
                    {
                        "id": "LanguageRequestPacket",
                        "data": {
                            language: "en_US"
                        }
                    }
                ); 

                // @ts-expect-error
                this.bot.emit("plasmovoice_connected");
                
                return;
            }
        })
    }

    async sendAudio(file: string, speed: number = 1.0) {
        if (!fs.existsSync(file)) {
            throw new Error("File not found");
        }

        var ffmpeg = VoiceRecoder.convert_audio_to_pcm(file, PacketManager.configPacketData.captureInfo.sampleRate, speed);
        ffmpeg.on('close', (code) => {
            this.sendPCM("output.pcm");
        });
    }

    async sendPCM(file: string) {
        VoiceServer.sendPCM(fs.readFileSync(file));
    }
}
