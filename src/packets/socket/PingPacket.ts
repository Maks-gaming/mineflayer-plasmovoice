import PacketEncoder from "../../PacketEncoder";
import SocketPlasmoVoicePacket from "./SocketPlasmoVoicePacket";
import dgram from "dgram";

export default class PingPacket extends SocketPlasmoVoicePacket<{
	currentTime: bigint;
}> {
	constructor(
		socket: {
			client: dgram.Socket;
			host: string;
			port: number;
		},
		packetEncoder: PacketEncoder,
		secret: UUID
	) {
		super(socket, packetEncoder, secret, "PingPacket");
	}
}
