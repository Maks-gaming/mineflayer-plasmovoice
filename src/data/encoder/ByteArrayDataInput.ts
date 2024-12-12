export default class ByteArrayDataInput {
	private buffer: DataView;
	private offset: number;

	constructor(byteArray: Uint8Array) {
		this.buffer = new DataView(byteArray.buffer);
		this.offset = 0;
	}

	readBoolean(): boolean {
		const value = this.buffer.getUint8(this.offset);
		this.offset += 1;
		return value !== 0;
	}

	readByte(): number {
		const value = this.buffer.getInt8(this.offset);
		this.offset += 1;
		return value;
	}

	readUnsignedByte(): number {
		const value = this.buffer.getUint8(this.offset);
		this.offset += 1;
		return value;
	}

	readShort(): number {
		const value = this.buffer.getInt16(this.offset, false); // Big-endian
		this.offset += 2;
		return value;
	}

	readUnsignedShort(): number {
		const value = this.buffer.getUint16(this.offset, false); // Big-endian
		this.offset += 2;
		return value;
	}

	readInt(): number {
		const value = this.buffer.getInt32(this.offset, false); // Big-endian
		this.offset += 4;
		return value;
	}

	readLong(): bigint {
		const value = this.buffer.getBigInt64(this.offset, false); // Big-endian
		this.offset += 8;
		return value;
	}

	readFloat(): number {
		const value = this.buffer.getFloat32(this.offset, false); // Big-endian
		this.offset += 4;
		return value;
	}

	readDouble(): number {
		const value = this.buffer.getFloat64(this.offset, false); // Big-endian
		this.offset += 8;
		return value;
	}

	readBytes(length: number): Uint8Array {
		const value = new Uint8Array(this.buffer.buffer, this.offset, length);
		this.offset += length;
		return value;
	}

	skipBytes(n: number): void {
		this.offset += n;
	}

	available(): number {
		return this.buffer.byteLength - this.offset;
	}

	readUTF(): string {
		// Read the length of the string (2 bytes, unsigned short, Big-endian)
		const length = this.readUnsignedShort();
		// Read the UTF-8 encoded bytes
		const bytes = this.readBytes(length);
		// Decode the bytes into a string
		const decoder = new TextDecoder("utf-8");
		return decoder.decode(bytes);
	}

	readFully(target: Uint8Array, offset: number = 0, length?: number): void {
		if (length === undefined) {
			length = target.length - offset;
		}
		if (length > this.available()) {
			throw new Error("Not enough data available to read");
		}
		const bytes = this.readBytes(length);
		target.set(bytes, offset);
	}
}
