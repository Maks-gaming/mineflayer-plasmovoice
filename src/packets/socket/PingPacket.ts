import dgram from "dgram";
import PacketEncoder from "../../PacketEncoder";
import SocketPlasmoVoicePacket from "./SocketPlasmoVoicePacket";

export type PingPacketData = {
	currentTime: bigint;
};
export default class PingPacket extends SocketPlasmoVoicePacket<PingPacketData> {
	constructor(
		socket: {
			client: dgram.Socket;
			host: string;
			port: number;
		},
		packetEncoder: PacketEncoder,
		secret: UUID,
	) {
		super(socket, packetEncoder, secret, "PingPacket");
	}
}
