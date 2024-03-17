import crypto from "crypto";
import { ConfigPacketData } from "./client/ConfigPacket";

export default class StoredData {
	keyPair = crypto.generateKeyPairSync("rsa", {
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
	config: ConfigPacketData | undefined;
	aesKey: Buffer | undefined;

	sourceById: { sourceId: UUID; playerName: string }[] = [];
}
