import { Bot } from "mineflayer";
import ClientPlasmoVoicePacket from "./ClientPlasmoVoicePacket";

export default class PlayerInfoRequestPacket extends ClientPlasmoVoicePacket<{}> {
	constructor(bot: Bot) {
		super(bot, "PlayerInfoRequestPacket");
	}
}
