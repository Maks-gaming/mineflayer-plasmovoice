import { OpusEncoder } from "@discordjs/opus";
import crypto from "crypto";
import Core from "../Core";

const UDP_MAGIC_NUMBER = 1318061289;

export default class PacketSocketEncoder {
	private readonly core;
	private aesKey: Buffer | undefined;
	private opusEncoder: OpusEncoder | undefined;

	constructor(core: Core) {
		this.core = core;
	}

	prepare() {
		if (!this.core.storedData.config)
			throw new Error("Config is not received");

		this.aesKey = crypto.privateDecrypt(
			{
				key: this.core.storedData.keyPair.privateKey,
				padding: crypto.constants.RSA_PKCS1_PADDING,
			},
			this.core.storedData.config.encryptionInfo.data,
		);

		this.opusEncoder = new OpusEncoder(
			this.core.storedData.config.captureInfo.sampleRate,
			1,
		);
	}

	encodePCM(buffer: Buffer) {
		if (!this.opusEncoder) throw new Error("Not initialized");

		return this.opusEncoder.encode(buffer);
	}

	decodePCM(buffer: Buffer) {
		if (!this.opusEncoder) throw new Error("Not initialized");

		return this.opusEncoder.decode(buffer);
	}

	encodeSocket(data: object, packetId: string): Buffer {
		if (!this.core.packetSocketHandler.secret)
			throw new Error("Secret key is not set");

		let out =
			this.core.packetClientHandler.packetEncoder.protoDef.createPacketBuffer(
				"plasmovoiceudp_packet",
				{
					id: packetId,
					secret: this.core.packetSocketHandler.secret,
					currentTime: BigInt(Date.now()),
					magic_number: UDP_MAGIC_NUMBER,
					data: data,
				},
			);
		return out;
	}

	encryptOpus(data: Buffer): Buffer {
		if (!this.aesKey) throw new Error("Not initialized");

		const iv = crypto.randomBytes(16);

		const cipher = crypto.createCipheriv("aes-128-cbc", this.aesKey, iv);
		const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);

		return Buffer.concat([iv, encrypted]);
	}

	decryptOpus(data: Buffer): Buffer {
		if (!this.aesKey) throw new Error("Not initialized");

		const iv = data.subarray(0, 16);
		const encrypted = data.subarray(16);

		const decipher = crypto.createDecipheriv(
			"aes-128-cbc",
			this.aesKey,
			iv,
		);
		const decrypted = Buffer.concat([
			decipher.update(encrypted),
			decipher.final(),
		]);

		return decrypted;
	}
}
