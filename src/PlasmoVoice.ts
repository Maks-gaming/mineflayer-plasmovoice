import { Bot } from "mineflayer";
import { VoicePackets } from "./VoicePackets";
import CursoredBuffer from "./packetsUtils/cursoredBuffer";
import SchemaDecoder from "./packetsUtils/schemaDecoder";
import * as schemas from './packetsUtils/schemas' ;

import convert_audio_to_pcm from "./ShellModule"

import fs from "fs";

export class PlasmoVoice {
    // System variables
    private readonly bot: Bot;
    private voicePackets: VoicePackets;

    // Optional
    modVersion: string = "1.2.19";

    // Class initialization
    constructor(bot: Bot)
    {
        this.bot = bot;
        this.voicePackets = new VoicePackets(bot);
        
        // Packets worker
        this.bot._client.on("login", () => {
            this.voicePackets.ChannelRegistration()
        })

        this.bot._client.on("packet", (rawData, packetMeta) => {
            if (packetMeta.name == "custom_payload") {
                if (rawData.channel == "plasmo:voice") {
                    var buffer = rawData.data
        
                    // Getting packetHeader
                    var packetHeaderCursoredBuffer = new CursoredBuffer(buffer, null)
                    var packetHeaderDecoder = new SchemaDecoder(schemas.packetHeader)
                    var packetHeader: any = packetHeaderDecoder.decode(packetHeaderCursoredBuffer)
                    var voicePacketType: number = packetHeader["packet_type"]

                    if (voicePacketType == 6) {
                        // serverConnectPacket
                        var packetCursoredBuffer = new CursoredBuffer(buffer, null)
                        var packetDecoder = new SchemaDecoder(schemas.serverConnectPacket)
                        var data: any = packetDecoder.decode(packetCursoredBuffer)

                        this.voicePackets.ClientConnectPacket(data["token"])
                        this.voicePackets.wakeUDP(data["host"], data["port"])
                        this.voicePackets.AuthPacketUDP(data["token"])

                    } else if (voicePacketType == 5) {
                        // configPacket
                        var packetCursoredBuffer = new CursoredBuffer(buffer, null)
                        var packetDecoder = new SchemaDecoder(schemas.configPacket)
                        var data: any = packetDecoder.decode(packetCursoredBuffer)

                        // todo
                    }
                }
            }
        })
    }

    // Functions
    async SendPCM(file: string, distance: number = 16): Promise<void>
    {
        this.voicePackets.SendPCM(fs.readFileSync(file), distance);
    }

    async SendAudio(file: string, distance: number = 16) {
        var ffmpeg = convert_audio_to_pcm(file);
        ffmpeg.on('close', (code) => {
            this.SendPCM("output.pcm", distance)
        });
    }
}
