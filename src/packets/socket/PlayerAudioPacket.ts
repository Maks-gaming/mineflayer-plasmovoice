import PacketEncoder from "../../PacketEncoder";
import SocketPlasmoVoicePacket from "./SocketPlasmoVoicePacket";
import dgram from "dgram";

export default class PlayerAudioPacket extends SocketPlasmoVoicePacket<{
	sequenceNumber: bigint;
	data: Buffer;
	activationId: UUID;
	distance: number;
	stereo: boolean;
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
		super(socket, packetEncoder, secret, "PlayerAudioPacket");
	}
}
