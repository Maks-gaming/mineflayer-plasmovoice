import EventEmitter from "events";
import Core from "../../Core";
import { log } from "../../lib";

export default class PacketSocketBase<T extends Object> extends EventEmitter {
	private readonly packetId;
	private readonly core;

	constructor(core: Core, packetId: string) {
		super();

		this.packetId = packetId;
		this.core = core;

		this.core.packetSocketHandler.socket!.on("message", (msg) => {
			const packet =
				this.core.packetClientHandler.packetEncoder.protoDef.parsePacketBuffer(
					"plasmovoiceudp_packet",
					msg,
				);

			if (packet.data.id != this.packetId) return;

			log.getSubLogger({ name: "Socket" }).debug(
				`RECEIVE ${packet.data.id}`,
			);
			log.getSubLogger({ name: "Socket" }).silly(packet.data.data);

			this.emit("packet", packet.data.data);
		});
	}

	send(data: T) {
		const buffer = this.core.packetSocketHandler.packetEncoder.encodeSocket(
			data,
			this.packetId,
		);

		log.getSubLogger({ name: "Socket" }).debug(`SEND ${this.packetId}`);
		log.getSubLogger({ name: "Socket" }).silly(data);

		this.core.packetSocketHandler.socket!.send(buffer);
	}
}
