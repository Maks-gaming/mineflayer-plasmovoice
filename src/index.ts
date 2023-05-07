import { Bot } from "mineflayer";
import { PlasmoVoice } from "./PlasmoVoice";

export function plugin(bot: Bot)
{
    const plasmovoice = new PlasmoVoice(bot);
    bot.plasmovoice = plasmovoice;
    console.log("[plasmovoice] This plugin support ONLY Plasmovoice with version 1.X.X, 2.0.0 and higher is not supported")
}

declare module "mineflayer" {
    interface Bot {
        plasmovoice: PlasmoVoice;
    }
}
