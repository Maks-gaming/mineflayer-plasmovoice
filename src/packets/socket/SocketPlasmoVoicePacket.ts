import dgram from "dgram";
import { log } from "../../PlasmoVoice";
import PacketEncoder from "../PacketEncoder";

export default abstract class SocketPlasmoVoicePacket<T extends object> {
	private readonly packetEncoder;
	private readonly socket;
	private readonly id;
	private readonly secret;

	private callbacks: ((data: T) => void)[] = [];

	constructor(
		socket: {
			client: dgram.Socket;
			host: string;
			port: number;
		},
		packetEncoder: PacketEncoder,
		secret: UUID,
		id: string,
	) {
		this.packetEncoder = packetEncoder;
		this.socket = socket;
		this.id = id;
		this.secret = secret;

		this.socket.client.on("message", (msg) => {
			const packet = this.packetEncoder.protoDef.parsePacketBuffer(
				"plasmovoiceudp_packet",
				msg,
			);

			if (packet.data.id != this.id) return;

			this.callbacks.forEach((callback) => {
				if (this.id != "PingPacket") {
					log.debug("(Socket) =>", packet.data.id);
					log.silly(packet.data.data);
				}

				callback(packet.data.data);
			});
		});

		// Stop UDP when program finish (for some reasons UDP can break after restart)
		process.on("SIGINT", () => {
			try {
				this.socket.client.close();
			} catch {}
		});
	}

	public cleanup() {
		this.callbacks = []
	}

	public async send(data: T): Promise<void> {
		if (this.id != "PingPacket") {
			log.debug("(Socket) <=", this.id);
			log.silly(data);
		}

		const buffer = await this.packetEncoder.encodeSocket(
			data,
			this.id,
			this.secret,
		);

		this.socket.client.send(
			buffer,
			0,
			buffer.length,
			this.socket.port,
			this.socket.host,
			(err) => {
				if (err) {
					console.error(`Error sending UDP message: ${err}`);
				}
			},
		);
	}

	public received(callback: (data: T) => void) {
		this.callbacks.push(callback);
	}
}
