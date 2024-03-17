import Core from "../../Core";
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
		super(core, "PlayerAudioPacket");
	}
}
