import { Bot } from "mineflayer";
import ByteArrayDataOutput from "../../data/encoder/ByteArrayDataOutput";
import PacketClientBase from "./ClientPacketBase";

export default class PlayerInfoRequestPacket extends PacketClientBase<{}> {
	constructor(bot: Bot) {
		super(bot, 2, "PlayerInfoRequestPacket");
	}

	public deserialize(): {} {
		return {};
	}

	public serialize(data: {}): ByteArrayDataOutput {
		const output = new ByteArrayDataOutput();

		return output;
	}
}
