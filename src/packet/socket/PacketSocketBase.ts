import EventEmitter from "events";
import Core from "../../Core";
import ByteArrayDataInput from "../../data/encoder/ByteArrayDataInput";
import ByteArrayDataOutput from "../../data/encoder/ByteArrayDataOutput";
import PacketUtil from "../../data/encoder/PacketUtil";
import { log } from "../../lib";

const UDP_MAGIC_NUMBER = 1318061289;
export default abstract class PacketSocketBase<
	T extends Object,
> extends EventEmitter {
	private readonly name;
	private readonly index;
	private readonly core;

	public abstract deserialize(packet: ByteArrayDataInput): T;

	public abstract serialize(data: T): ByteArrayDataOutput;

	constructor(core: Core, index: number, name: string) {
		super();

		this.name = name;
		this.index = index;
		this.core = core;

		this.core.packetSocketHandler.socket!.on("message", (msg) => {
			const buf = new ByteArrayDataInput(new Uint8Array(msg));

			const magic_number = buf.readInt();
			const index = buf.readByte();
			if (this.index != index) return;

			const secret = PacketUtil.readUUID(buf);
			const timestamp = buf.readLong();
			const data = this.deserialize(buf);

			log.getSubLogger({ name: "Socket" }).debug(`RECEIVE ${name}`);
			log.getSubLogger({ name: "Socket" }).silly(data);

			this.emit("packet", data);
		});
	}

	send(data: T) {
		const out = new ByteArrayDataOutput();

		out.writeInt(UDP_MAGIC_NUMBER);
		out.writeByte(this.index);
		PacketUtil.writeUUID(out, this.core.packetSocketHandler.secret!);
		out.writeLong(BigInt(Date.now()));

		const raw = this.serialize(data).getBytes();
		out.writeBytes(raw);

		log.getSubLogger({ name: "Socket" }).debug(
			`SEND ${this.name} (${this.core.packetSocketHandler.ip}:${this.core.packetSocketHandler.port})`,
		);
		log.getSubLogger({ name: "Socket" }).silly(data);

		this.core.packetSocketHandler.socket!.send(out.getBytes());
	}
}
