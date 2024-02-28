import crypto from "crypto";
import hexToUuid from "hex-to-uuid";

export default class Utils {
	static objectEquals(x: any, y: any): boolean {
		"use strict";

		if (x === null || x === undefined || y === null || y === undefined) {
			return x === y;
		}
		// after this just checking type of one would be enough
		if (x.constructor !== y.constructor) {
			return false;
		}
		// if they are functions, they should exactly refer to same one (because of closures)
		if (x instanceof Function) {
			return x === y;
		}
		// if they are regexps, they should exactly refer to same one (it is hard to better equality check on current ES)
		if (x instanceof RegExp) {
			return x === y;
		}
		if (x === y || x.valueOf() === y.valueOf()) {
			return true;
		}
		if (Array.isArray(x) && x.length !== y.length) {
			return false;
		}

		// if they are dates, they must had equal valueOf
		if (x instanceof Date) {
			return false;
		}

		// if they are strictly equal, they both need to be object at least
		if (!(x instanceof Object)) {
			return false;
		}
		if (!(y instanceof Object)) {
			return false;
		}

		// recursive object equality check
		var p = Object.keys(x);
		return (
			Object.keys(y).every(function (i) {
				return p.indexOf(i) !== -1;
			}) &&
			p.every(function (i) {
				return Utils.objectEquals(x[i], y[i]);
			})
		);
	}

	// UUID.nameUUIDFromBytes() in Java
	static nameUUIDFromBytes(input: Buffer) {
		var md5Bytes = crypto.createHash("md5").update(input).digest();
		md5Bytes[6] &= 0x0f; // clear version
		md5Bytes[6] |= 0x30; // set to version 3
		md5Bytes[8] &= 0x3f; // clear variant
		md5Bytes[8] |= 0x80; // set to IETF variant
		return hexToUuid(md5Bytes.toString("hex"));
	}

	static uuidStrToSigBits(uuid: string): UUID {
		const parts = uuid.split("-").map((p) => `0x${p}`);
		if (parts.length !== 5)
			throw new Error(`Invalid UUID string: '${uuid}'`);

		return {
			mostSignificantBits:
				(BigInt(parts[0]) << 32n) |
				(BigInt(parts[1]) << 16n) |
				BigInt(parts[2]),
			lessSignificantBits: (BigInt(parts[3]) << 48n) | BigInt(parts[4]),
		};
	}

	static getActivationUUID(activationName: string) {
		const activation: Buffer = Buffer.from(
			activationName + "_activation",
			"utf-8"
		);
		const activationId: string = this.nameUUIDFromBytes(activation);
		const activationUUID: UUID = this.uuidStrToSigBits(activationId);
		return activationUUID;
	}
}
