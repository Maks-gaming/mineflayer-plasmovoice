import EventEmitter from "events";
import { Bot } from "mineflayer";
import { log } from "../../lib";

const channelName = "plasmo:voice/v2";

export default abstract class PacketClientBase<
	T extends Object,
> extends EventEmitter {
	private readonly bot;
	private readonly packetId;

	constructor(bot: Bot, packetId: string) {
		super();

		this.bot = bot;
		this.packetId = packetId;

		this.bot._client.on(channelName, (packet: { id: string; data: T }) => {
			if (packet.id != this.packetId) return;

			log.getSubLogger({ name: "Client" }).debug(
				`RECEIVE ${this.packetId}`,
			);
			log.getSubLogger({ name: "Client" }).silly(packet.data);

			this.emit("packet", packet.data);
		});
	}

	public send(data: T): void {
		log.getSubLogger({ name: "Client" }).debug(`SEND ${this.packetId}`);
		log.getSubLogger({ name: "Client" }).silly(data);

		this.bot._client.writeChannel("plasmo:voice/v2", {
			id: this.packetId,
			data: data,
		});
	}
}
