import { Bot } from "mineflayer";
import { PlasmoVoice } from "./PlasmoVoice";

export function plugin(bot: Bot)
{
    const plasmovoice = new PlasmoVoice(bot);
    bot.plasmovoice = plasmovoice;
    console.log("[plasmovoice] This package does not yet support PlasmoVoice 2.0.0 and higher")
}

declare module "mineflayer" {
    interface Bot {
        plasmovoice: PlasmoVoice;
    }
}
