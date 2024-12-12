import Core from "../../Core";
import ByteArrayDataOutput from "../../data/encoder/ByteArrayDataOutput";
import PacketUtil from "../../data/encoder/PacketUtil";
import PacketSocketBase from "./PacketSocketBase";

export type PlayerAudioPacketData = {
	sequenceNumber: bigint;
	data: Buffer;
	activationId: UUID;
	distance: number;
	stereo: boolean;
};
export default class PlayerAudioPacket extends PacketSocketBase<PlayerAudioPacketData> {
	constructor(core: Core) {
		super(core, 2, "PlayerAudioPacket");
	}

	public deserialize(): PlayerAudioPacketData {
		throw "Not required for client-side";
	}

	public serialize(data: PlayerAudioPacketData): ByteArrayDataOutput {
		const out = new ByteArrayDataOutput();

		out.writeLong(data.sequenceNumber);
		out.writeInt(data.data.length);
		out.writeBytes(data.data);

		PacketUtil.writeUUID(out, data.activationId);
		out.writeShort(data.distance);
		out.writeBoolean(data.stereo);

		return out;
	}
}
