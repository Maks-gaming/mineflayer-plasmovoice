import PacketEncoder from "../../PacketEncoder";
import SocketPlasmoVoicePacket from "./SocketPlasmoVoicePacket";
import dgram from "dgram";

export default class SourceAudioPacket extends SocketPlasmoVoicePacket<{
	sequenceNumber: bigint;
	data: Buffer;
	sourceId: UUID;
	sourceState: Buffer;
	distance: number;
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
		super(socket, packetEncoder, secret, "SourceAudioPacket");
	}
}
