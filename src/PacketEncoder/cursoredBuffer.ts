import { Buffer } from 'node:buffer';

export default class CursoredBuffer {
	public buffer: any;
    _offset = 1
    _utf8_decoder = new TextDecoder("utf-8")
    _utf8_encoder = new TextEncoder()

    constructor(buffer: Buffer, startOffset: number | null) {
        if (!(buffer instanceof Buffer)) {
            //todo: convert
        } else {
            this.buffer = buffer
        }
        this._offset = startOffset == null ? 0 : startOffset
    }

    #readFromBuffer(method: any, offset_increment: number) {
        let value = method.bind(this.buffer)(this._offset)
        this._offset += offset_increment
        return value
    }

    #writeToBuffer(method: any, value: any, offset_increment: number) {
        method.bind(this.buffer)(value, this._offset)
        this._offset += offset_increment
    }

    readUInt8() {
        return this.#readFromBuffer(this.buffer.readUInt8, 1)
    }

    writeUInt8(value: number) {
        return this.#writeToBuffer(this.buffer.writeUInt8, value, 1)
    }

    readUInt16() {
        return this.#readFromBuffer(this.buffer.readUInt16BE, 2)
    }

    writeUInt16(value: number) {
        return this.#writeToBuffer(this.buffer.writeUInt16BE, value, 2)
    }

    writeInt64(value: number) {
        return this.#writeToBuffer(this.buffer.writeBigInt64BE, BigInt.asIntN(64, BigInt(value)), 8)
    }

    readInt64() {
        return this.#readFromBuffer(this.buffer.readBigInt64BE, 8)
    }

    readInt32() {
        return this.#readFromBuffer(this.buffer.readInt32BE, 4)
    }

    writeInt32(value: number) {
        return this.#writeToBuffer(this.buffer.writeInt32BE, value, 4)
    }

    readInt16() {
        return this.#readFromBuffer(this.buffer.readInt16BE, 2)
    }

    writeInt16(value: number) {
        return this.#writeToBuffer(this.buffer.writeInt16BE, value, 2)
    }

    readBoolean() {
        // this is not best implementation, but i think its "good enough" 
        return Boolean(this.readUInt8())
    }

    writeBoolean(value: number) {
        return this.writeUInt8(value | 0)
    }

    readUTF8() {
        /*
        * reads utf-8 string
        */
        let string_length = this.readUInt16();
        let string_bytes = this.buffer.subarray(this._offset, this._offset + string_length)
        let decoded_string = this._utf8_decoder.decode(string_bytes)
        this._offset += string_length // cause we use utf-8, every byte is one symbol
        return decoded_string
    }

    writeUTF8(value: string) {
        this.writeUInt16(value.length)
        let buf = Buffer.from(value)
        this._offset += 
        buf.copy(this.buffer, this._offset, 0)
    }
}