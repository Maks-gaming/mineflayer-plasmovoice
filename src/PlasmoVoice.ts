// Libraries
import VoiceServer from "./VoiceServer";
import PacketManager from "./PacketManager";
import fs from "fs";

// Types
import { Bot } from "mineflayer";
import VoiceRecoder from "./VoiceRecoder";
import Utils from "./Utils";

export let debug = false;

export default class PlasmoVoice {

    // System variables
    public readonly bot: Bot;

    // Class initialization
    constructor(bot: Bot) {
        this.bot = bot;

        // Initialize packet manager
        PacketManager.init(this.bot);
        // Initialize voice server
        VoiceServer.init(this.bot);

        // Listen plugin channels
        this.bot._client.on("plasmo:voice/v2", async (packet) => {
            if (!packet) { return; }

            Utils.debug(`[plasmo:voice/v2] Recieved ${packet.id}`);

            if (packet.id == 'PlayerInfoRequestPacket') {
                // PlayerInfoPacket
                Utils.debug("[plasmo:voice/v2] Sending PlayerInfoPacket");
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

                // LanguageRequestPacket (probably useless)
                Utils.debug("[plasmo:voice/v2] Sending LanguageRequestPacket")
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
            } else if (packet.id == "PlayerListPacket") {
                // Save players from packet
                const players: VoicePlayerInfo[] = packet.data.players;
                PacketManager.players = players;
                return;
            } else if (packet.id == "PlayerInfoUpdatePacket") {
                // Ignore this packet if no players
                if (PacketManager.players.length == 0) { return; }
    
                const data: VoicePlayerInfo = packet['data'];

                // Delete player from list
                PacketManager.players = PacketManager.players.filter(e => !Utils.findPlayerByPlayerId(data.playerId));

                // Add new data
                PacketManager.players.push(data);
    
                return;
            } else if (packet.id == 'PlayerDisconnectPacket') {
                // Ignore this packet if no players
                if (PacketManager.players.length == 0) { return; }

                // Delete player from list
                const data: PlayerDisconnectPacket = packet.data;
                PacketManager.players = PacketManager.players.filter(e => !Utils.findPlayerByPlayerId(data.playerId));

                return;
            } else if (packet.id == 'SelfAudioInfoPacket') {
                //return;
            } else if (packet.id == 'SourceInfoPacket') {
                /* TODO: Player Listening
                
                const request = Utils.findPlayerBySourceId(packet.data.sourceId);
                
                Utils.debug(Utils.uuidBytesToString(packet.data.sourceId));
                if (request != undefined) {
                    Utils.debug(1)
                    if (request.playerId) {
                        return;
                    }
                    Utils.debug(2)

                    // Delete old from list
                    PacketManager.sourceById = PacketManager.sourceById.filter(e => !Utils.findPlayerBySourceId(packet.data.sourceId))

                    // Push new data
                    PacketManager.sourceById.push({
                        "sourceId": packet.data.sourceId,
                        "playerId": packet.data.playerInfo.playerId
                    })

                    console.log(PacketManager.sourceById)
                    Utils.debug("SourceInfoPacket parsed");
                }
                */
                
                return;
            }

            Utils.debug(`[plasmo:voice/v2] Skipped ${packet.id}`);
        })
    }

    async sendAudio(file: string, distance: number = 16, speed: number = 1.0, isStereo: boolean = false) {
        if (!fs.existsSync(file)) {
            throw new Error("File not found");
        }

        Utils.debug("[sendAudio] Converting given soundfile to PCM")
        var ffmpeg = VoiceRecoder.convertToPCM(file, PacketManager.configPacketData.captureInfo.sampleRate, speed, isStereo);
        ffmpeg.on('close', (code) => {
            this.sendPCM("output.pcm", distance, isStereo);
        });
    }

    async sendPCM(file: string, distance: number = 16, isStereo: boolean = false) {
        VoiceServer.sendPCM(fs.readFileSync(file), distance, isStereo);
    }

    async enableDebug() {
        debug = true;
    }
}
