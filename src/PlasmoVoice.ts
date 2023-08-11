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
                const data: ConnectionPacket = packet.data;

                // Create voice server
                if (data.ip == "0.0.0.0") {
                    await VoiceServer.connect(Utils.getHost(this.bot), data.port, data.secret);
                } else {
                    await VoiceServer.connect(data.ip, data.port, data.secret);
                }

                return;
            } else if (packet.id == 'ConfigPacket') {
                const data: ConfigPacket = packet.data;

                // Save data from this packet
                PacketManager.configPacketData = data;
                PacketManager.aesKey = await PacketManager.getAESKey();

                // Check for correct encryption
                if (data.hasEncryptionInfo == false) {
                    throw new Error(`Encryption is disabled`);
                } else if (data.encryptionInfo.algorithm != "AES/CBC/PKCS5Padding") {
                    throw new Error(`Unsupported encryption type "${data.encryptionInfo.algorithm}"`);
                }

                // @ts-expect-error
                this.bot.emit("voicechat_connected");
                
                return;
            } else if (packet.id == "PlayerListPacket") {
                // Save players from packet
                const players: VoicePlayerInfo[] = packet.data.players;
                PacketManager.players = players;
                return;
            } else if (packet.id == "PlayerInfoUpdatePacket") {
                // TODO: Player data saving
                return;
                /*
                // Ignore this packet if no players
                if (PacketManager.players.length == 0) { return; }
    
                const data: VoicePlayerInfo = packet['data'];

                // Delete player from list
                PacketManager.players = PacketManager.players.filter(e => !Utils.findPlayerByPlayerId(data.playerId));

                // Add new data
                PacketManager.players.push(data);
    
                return;
                */
            } else if (packet.id == 'PlayerDisconnectPacket') {
                // TODO: Player data saving
                return;
                /*
                // Ignore this packet if no players
                if (PacketManager.players.length == 0) { return; }

                // Delete player from list
                const data: PlayerDisconnectPacket = packet.data;
                PacketManager.players = PacketManager.players.filter(e => !Utils.findPlayerByPlayerId(data.playerId));

                return;
                */
            } else if (packet.id == 'SourceInfoPacket') {
                // TODO: Source Info Saving
                return;
                /*
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
                
                return;
                */
            }

            Utils.debug(`[plasmo:voice/v2] Skipped ${packet.id}`);
        })
    }

    async sendAudio(file: string, distance: number = 16, speed: number = 1.0, isStereo: boolean = false) {
        if (!fs.existsSync(file)) {
            throw new Error("File not found");
        }

        Utils.debug("[sendAudio] Converting given soundfile to PCM")
        var pcmBuffer = await VoiceRecoder.convertToPCM(file, PacketManager.configPacketData.captureInfo.sampleRate, speed, isStereo);
        VoiceServer.sendPCM(pcmBuffer, distance, isStereo);
    }

    async sendPCM(file: string, distance: number = 16, isStereo: boolean = false) {
        VoiceServer.sendPCM(fs.readFileSync(file), distance, isStereo);
    }

    // Asked by NonemJS
    async forceConnect() {
        PacketManager.registerAll();
    }

    // Asked by Apehum
    async _sendPacket(packetId: string, data: Object) {
        this.bot._client.writeChannel("plasmo:voice/v2",
            {
                "id": packetId,
                "data": data
            }
        );
    }

    // Asked by Apehum
    async _sendPacketUDP(packetId: string, data: Object) {
        const packet = await PacketManager.encodeUDP(data, packetId, VoiceServer.udpSecret);
        VoiceServer.sendBuffer(packet);
    }

    async enableDebug() {
        debug = true;
    }
}
