import { OpusEncoder } from "@discordjs/opus";
import crypto from "crypto";
import NodeRSA from "node-rsa";
import Core from "../Core";

export default class PacketSocketEncoder {
	private readonly core;
	private aesKey: Buffer | undefined;
	private opusEncoder: OpusEncoder | undefined;
	private rsaDecoder: NodeRSA | undefined;

	constructor(core: Core) {
		this.core = core;
	}

	prepare() {
		if (!this.core.storedData.config)
			throw new Error("Config is not received");

		this.rsaDecoder = new NodeRSA(
			this.core.storedData.keyPair.privateKey,
			"private",
			{
				encryptionScheme: "pkcs1",
			},
		);

		// By default it will use the node crypto library with the CVE
		this.rsaDecoder.setOptions({ environment: "browser" });

		this.aesKey = this.rsaDecoder.decrypt(
			Buffer.from(this.core.storedData.config.encryptionInfo!.data),
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
