import dgram from "dgram";
import PacketEncoder from "../PacketEncoder";
import SocketPlasmoVoicePacket from "./SocketPlasmoVoicePacket";

export type PlayerAudioPacketData = {
	sequenceNumber: bigint;
	data: Buffer;
	activationId: UUID;
	distance: number;
	stereo: boolean;
};
export default class PlayerAudioPacket extends SocketPlasmoVoicePacket<PlayerAudioPacketData> {
	constructor(
		socket: {
			client: dgram.Socket;
			host: string;
			port: number;
		},
		packetEncoder: PacketEncoder,
		secret: UUID,
	) {
		super(socket, packetEncoder, secret, "PlayerAudioPacket");
	}
}
