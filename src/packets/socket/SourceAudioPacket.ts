import dgram from "dgram";
import PacketEncoder from "../PacketEncoder";
import SocketPlasmoVoicePacket from "./SocketPlasmoVoicePacket";

export type SourceAudioPacketData = {
	sequenceNumber: bigint;
	data: Buffer;
	sourceId: UUID;
	sourceState: Buffer;
	distance: number;
};

export default class SourceAudioPacket extends SocketPlasmoVoicePacket<SourceAudioPacketData> {
	constructor(
		socket: {
			client: dgram.Socket;
			host: string;
			port: number;
		},
		packetEncoder: PacketEncoder,
		secret: UUID,
	) {
		super(socket, packetEncoder, secret, "SourceAudioPacket");
	}
}
