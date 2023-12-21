import { Bot } from "mineflayer";
import PlasmoVoice from "./PlasmoVoice";

export function plugin(bot: Bot) {
    const plasmovoice = new PlasmoVoice(bot);
    bot.plasmovoice = plasmovoice;
}

export * from './PlasmoVoice';

export default plugin

declare module 'mineflayer' {
    interface Bot {
        plasmovoice: PlasmoVoice;
    }
    interface BotEvents {
        voicechat_voice: (data: {player: string, distance: number, sequenceNumber: BigInt, data: Buffer}) => void;
        voicechat_voice_end: (data: {player: string, sequenceNumber: BigInt}) => void;
        voicechat_connected: () => void;
        voicechat_audio_end: () => void;
    }
}