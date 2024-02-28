import { Bot } from "mineflayer";
import { Logger } from "tslog";
import { log } from "../../PlasmoVoice";

export default abstract class ClientPlasmoVoicePacket<T> {
	private readonly bot;
	private readonly packetId;

	private callbacks: ((data: T) => void)[] = [];

	constructor(bot: Bot, packetId: string) {
		this.bot = bot;
		this.packetId = packetId;

		this.bot._client.on(
			"plasmo:voice/v2",
			(packet: { id: string; data: any }) => {
				if (this.packetId === packet.id) {
					this.callbacks.forEach((callback) => {
						log.debug(packet.id, "=>", packet.data);
						callback(packet.data);
					});
				}
			}
		);
	}

	public send(data: T): void {
		log.debug(this.packetId, "<=", data);

		this.bot._client.writeChannel("plasmo:voice/v2", {
			id: this.packetId,
			data: data,
		});
	}

	public received(callback: (data: T) => void) {
		this.callbacks.push(callback);
	}
}