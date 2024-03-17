import Core from "../../Core";
import PacketSocketBase from "./PacketSocketBase";

export type SourceAudioPacketData = {
	sequenceNumber: bigint;
	data: Buffer;
	sourceId: UUID;
	sourceState: Buffer;
	distance: number;
};

export default class SourceAudioPacket extends PacketSocketBase<SourceAudioPacketData> {
	constructor(core: Core) {
		super(core, "SourceAudioPacket");
	}
}
