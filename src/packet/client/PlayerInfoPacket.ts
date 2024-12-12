import { Bot } from "mineflayer";
import ByteArrayDataOutput from "../../data/encoder/ByteArrayDataOutput";
import PacketClientBase from "./ClientPacketBase";

export type PlayerInfoPacketData = {
	voiceDisabled: boolean;
	microphoneMuted: boolean;
	minecraftVersion: string;
	version: string;
	publicKey: Buffer;
};
export default class PlayerInfoPacket extends PacketClientBase<PlayerInfoPacketData> {
	constructor(bot: Bot) {
		super(bot, 10, "PlayerInfoPacket");
	}

	public deserialize(): PlayerInfoPacketData {
		throw "Not required for client-side";
	}

	public serialize(data: PlayerInfoPacketData): ByteArrayDataOutput {
		const output = new ByteArrayDataOutput();

		output.writeBoolean(data.voiceDisabled);
		output.writeBoolean(data.microphoneMuted);
		output.writeUTF(data.minecraftVersion);
		output.writeUTF(data.version);

		output.writeInt(data.publicKey.length);
		output.writeBytes(new Uint8Array(data.publicKey));

		return output;
	}
}
