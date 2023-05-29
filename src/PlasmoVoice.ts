import { Bot } from "mineflayer";
import PacketSenderVersion1 from "./PacketSenderVersion1";
import PacketSenderVersion2 from "./PacketSenderVersion2";

import fs from "fs";
import convert_audio_to_pcm from "./ShellModule";

export class PlasmoVoice {

    // System variables
    private readonly bot: Bot;
    public version = "2.0.3";
    private packetSender: any = undefined;

    // Class initialization
    constructor(bot: Bot)
    {
        this.bot = bot;

        bot.on("login", () => {
            if (this.version.split('.')[0] == "2") {
                // Plasmo-voice 2.X.X
                this.packetSender = new PacketSenderVersion2(this.bot);
                this.packetSender.Initialize();
            } else if (this.version.split('.')[0] == "1") {
                // Plasmo-voice 1.X.X
                this.packetSender = new PacketSenderVersion1(this.bot);
                this.packetSender.Initialize();
            } else {
                throw new Error("Unknown version of PlasmoVoice");
            }
        })
    }

    // Functions
    async SendPCM(file: string, distance: number) {
        if (this.packetSender.sample_rate < 0) { // TODO + and this.packetSender2.sample_rate < 0
            throw new Error("Config packet still not recieved");
        }

        this.packetSender.SendPCM(fs.readFileSync(file), distance);
    }

    async Stop() {
        this.packetSender.stopSending();
    }

    async SendAudio(file: string, distance: number) {

        if (this.packetSender.sample_rate < 0) { // TODO + and this.packetSender2.sample_rate < 0
            throw new Error("Config packet still not recieved");
        }

        if (!fs.existsSync(file)) {
            throw new Error("File not found");
        }

        var ffmpeg = convert_audio_to_pcm(file, this.packetSender.sample_rate);
        ffmpeg.on('close', (code) => {
            this.SendPCM("output.pcm", distance);
        });
    }
}
