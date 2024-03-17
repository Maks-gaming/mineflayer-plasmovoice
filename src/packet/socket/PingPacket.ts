import Core from "../../Core";
import PacketSocketBase from "./PacketSocketBase";

export type PingPacketData = {
	currentTime: bigint;
};

export default class PingPacket extends PacketSocketBase<PingPacketData> {
	constructor(core: Core) {
		super(core, "PingPacket");
	}
}
