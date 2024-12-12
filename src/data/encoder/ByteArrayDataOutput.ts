export default class ByteArrayDataOutput {
	private buffer: ArrayBuffer;
	private view: DataView;
	private offset: number;

	constructor(initialCapacity: number = 32) {
		this.buffer = new ArrayBuffer(initialCapacity);
		this.view = new DataView(this.buffer);
		this.offset = 0;
	}

	private ensureCapacity(additionalCapacity: number): void {
		const requiredCapacity = this.offset + additionalCapacity;
		if (requiredCapacity > this.buffer.byteLength) {
			const newCapacity = Math.max(
				this.buffer.byteLength * 2,
				requiredCapacity,
			);
			const newBuffer = new ArrayBuffer(newCapacity);
			new Uint8Array(newBuffer).set(new Uint8Array(this.buffer));
			this.buffer = newBuffer;
			this.view = new DataView(this.buffer);
		}
	}

	writeBoolean(value: boolean): void {
		this.ensureCapacity(1);
		this.view.setUint8(this.offset, value ? 1 : 0);
		this.offset += 1;
	}

	writeByte(value: number): void {
		this.ensureCapacity(1);
		this.view.setInt8(this.offset, value);
		this.offset += 1;
	}

	writeUnsignedByte(value: number): void {
		this.ensureCapacity(1);
		this.view.setUint8(this.offset, value);
		this.offset += 1;
	}

	writeShort(value: number): void {
		this.ensureCapacity(2);
		this.view.setInt16(this.offset, value, false); // Big-endian
		this.offset += 2;
	}

	writeUnsignedShort(value: number): void {
		this.ensureCapacity(2);
		this.view.setUint16(this.offset, value, false); // Big-endian
		this.offset += 2;
	}

	writeInt(value: number): void {
		this.ensureCapacity(4);
		this.view.setInt32(this.offset, value, false); // Big-endian
		this.offset += 4;
	}

	writeLong(value: bigint): void {
		this.ensureCapacity(8);
		this.view.setBigInt64(this.offset, value, false); // Big-endian
		this.offset += 8;
	}

	writeFloat(value: number): void {
		this.ensureCapacity(4);
		this.view.setFloat32(this.offset, value, false); // Big-endian
		this.offset += 4;
	}

	writeDouble(value: number): void {
		this.ensureCapacity(8);
		this.view.setFloat64(this.offset, value, false); // Big-endian
		this.offset += 8;
	}

	writeBytes(bytes: Uint8Array): void {
		this.ensureCapacity(bytes.length);
		new Uint8Array(this.buffer, this.offset, bytes.length).set(bytes);
		this.offset += bytes.length;
	}

	writeUTF(value: string): void {
		const encoder = new TextEncoder();
		const encoded = encoder.encode(value);
		this.writeUnsignedShort(encoded.length); // Write the length as an unsigned short
		this.writeBytes(encoded);
	}

	getBytes(): Uint8Array {
		return new Uint8Array(this.buffer, 0, this.offset);
	}
}
