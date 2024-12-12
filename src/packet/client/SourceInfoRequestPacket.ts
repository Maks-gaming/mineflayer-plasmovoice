import { Bot } from "mineflayer";
import ByteArrayDataOutput from "../../data/encoder/ByteArrayDataOutput";
import PacketUtil from "../../data/encoder/PacketUtil";
import PacketClientBase from "./ClientPacketBase";

export type SourceInfoRequestPacketData = {
	sourceId: UUID;
};

export default class SourceInfoRequestPacket extends PacketClientBase<SourceInfoRequestPacketData> {
	constructor(bot: Bot) {
		super(bot, 15, "SourceInfoRequestPacket");
	}

	public deserialize(): SourceInfoRequestPacketData {
		throw "Not required for client-side";
	}

	public serialize(data: SourceInfoRequestPacketData): ByteArrayDataOutput {
		const output = new ByteArrayDataOutput();

		PacketUtil.writeUUID(output, data.sourceId);

		return output;
	}
}
