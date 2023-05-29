import { Bot } from "mineflayer";
import { PlasmoVoice } from "./PlasmoVoice";
import test from "./example";

export function plugin(bot: Bot)
{
    const plasmovoice = new PlasmoVoice(bot);
    bot.plasmovoice = plasmovoice;
}

export function testencoder() {
    test();
}

declare module "mineflayer" {
    interface Bot {
        plasmovoice: PlasmoVoice;
    }
}
