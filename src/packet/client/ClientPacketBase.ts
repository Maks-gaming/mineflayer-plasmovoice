import EventEmitter from "events";
import { Bot } from "mineflayer";
import ByteArrayDataInput from "../../data/encoder/ByteArrayDataInput";
import ByteArrayDataOutput from "../../data/encoder/ByteArrayDataOutput";
import { log } from "../../lib";

const channelName = "plasmo:voice/v2";

export default abstract class PacketClientBase<
	T extends Object,
> extends EventEmitter {
	private readonly bot;
	private readonly index;
	private readonly name;

	constructor(bot: Bot, index: number, name: string) {
		super();

		this.bot = bot;
		this.index = index;
		this.name = name;

		this.bot._client.on(channelName, (raw: Buffer) => {
			const buf = new ByteArrayDataInput(new Uint8Array(raw));

			const index = buf.readByte();
			if (index != this.index) return;

			const data = this.deserialize(buf);

			log.getSubLogger({ name: "Client" }).debug(`RECEIVE ${this.name}`);
			log.getSubLogger({ name: "Client" }).silly(data);

			this.emit("packet", data);
		});
	}

	public abstract deserialize(packet: ByteArrayDataInput): T;

	public abstract serialize(data: T): ByteArrayDataOutput;

	public send(data: T): void {
		log.getSubLogger({ name: "Client" }).debug(`SEND ${this.name}`);
		log.getSubLogger({ name: "Client" }).silly(data);

		const output = new ByteArrayDataOutput();
		const buf = Buffer.from(this.serialize(data).getBytes());
		output.writeByte(this.index);
		output.writeBytes(buf);

		this.bot._client.write("custom_payload", {
			channel: channelName,
			data: Buffer.from(output.getBytes()),
		});
	}
}
