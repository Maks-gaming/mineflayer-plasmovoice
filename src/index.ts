import { Bot } from "mineflayer";
import PlasmoVoice from "./PlasmoVoice";

export function plugin(bot: Bot) {
    const plasmovoice: PlasmoVoice = new PlasmoVoice(bot);
    bot.plasmovoice = plasmovoice;
}

declare module "mineflayer" {
    interface Bot {
        plasmovoice: PlasmoVoice;
    }
}
