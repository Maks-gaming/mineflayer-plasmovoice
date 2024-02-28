import { OpusEncoder } from "@discordjs/opus";
import crypto from "crypto";
import { ProtoDef } from "protodef";
import { ConfigPacketData } from "./packets/client/ConfigPacket";
import { Logger } from "tslog";
import { log } from "./PlasmoVoice";

export default class PacketEncoder {
	/** The RSA format keypair, which is required to encrypt packets in the native mod PlasmoVoice */
	public readonly keyPair;
	public readonly protoDef;
	private readonly UDP_MAGIC_NUMBER: number = 1318061289;

	private readonly opusEncoder: OpusEncoder = undefined!;
	readonly aesKey: Buffer = undefined!;

	constructor(protoDef: typeof ProtoDef) {
		this.protoDef = protoDef;

		this.keyPair = crypto.generateKeyPairSync("rsa", {
			modulusLength: 2048,
			publicKeyEncoding: {
				type: "spki",
				format: "der",
			},
			privateKeyEncoding: {
				type: "pkcs1",
				format: "pem",
			},
		});
	}

	initialize(config: ConfigPacketData) {
		log.info("Initializing socket encoding tools..");

		(this.opusEncoder as OpusEncoder) = new OpusEncoder(
			config.captureInfo.sampleRate,
			1
		);

		(this.aesKey as Buffer) = crypto.privateDecrypt(
			{
				key: this.keyPair.privateKey,
				padding: crypto.constants.RSA_PKCS1_PADDING,
			},
			config.encryptionInfo.data
		);

		log.info("Initializing socket encoding tools.. [OK]");
	}

	encodePCM(buffer: Buffer) {
		return this.opusEncoder.encode(buffer);
	}

	decodePCM(buffer: Buffer) {
		return this.opusEncoder.decode(buffer);
	}

	encodeSocket(data: object, type: string, secret: UUID): Promise<Buffer> {
		let out = this.protoDef.createPacketBuffer("plasmovoiceudp_packet", {
			id: type,
			secret: secret,
			currentTime: BigInt(Date.now()),
			magic_number: this.UDP_MAGIC_NUMBER,
			data: data,
		});
		return out;
	}

	encryptSound(data: Buffer): Buffer {
		const iv = crypto.randomBytes(16);

		const cipher = crypto.createCipheriv("aes-128-cbc", this.aesKey, iv);
		const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);

		return Buffer.concat([iv, encrypted]);
	}

	decryptPCM(data: Buffer): Buffer {
		const iv = data.slice(0, 16);
		const encrypted = data.slice(16);

		const decipher = crypto.createDecipheriv(
			"aes-128-cbc",
			this.aesKey,
			iv
		);
		const decrypted = Buffer.concat([
			decipher.update(encrypted),
			decipher.final(),
		]);

		return decrypted;
	}
}
