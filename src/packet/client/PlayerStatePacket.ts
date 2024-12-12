import { Bot } from "mineflayer";
import ByteArrayDataOutput from "../../data/encoder/ByteArrayDataOutput";
import PacketClientBase from "./ClientPacketBase";

export type PlayerStatePacketData = {
	voiceDisabled: boolean;
	microphoneMuted: boolean;
};
export default class PlayerStatePacket extends PacketClientBase<PlayerStatePacketData> {
	constructor(bot: Bot) {
		super(bot, 11, "PlayerStatePacket");
	}

	public deserialize(): PlayerStatePacketData {
		throw "Not required for client-side";
	}

	public serialize(data: PlayerStatePacketData): ByteArrayDataOutput {
		const output = new ByteArrayDataOutput();

		output.writeBoolean(data.voiceDisabled);
		output.writeBoolean(data.microphoneMuted);

		return output;
	}
}
