import { Bot } from "mineflayer";
import ClientPlasmoVoicePacket from "./ClientPlasmoVoicePacket";

export type ConfigPacketData = {
	serverId: UUID;
	captureInfo: {
		sampleRate: number;
		mtuSize: number;
		hasEncoderInfo: boolean;
		encoderInfo: Object;
	};
	hasEncryptionInfo: boolean;
	encryptionInfo: {
		algorithm: string;
		data: Buffer;
	};
	sourceLines: {
		name: string;
		translation: string;
		icon: string;
		defaultVolume: bigint;
		weight: number;
		hasPlayers: boolean;
		players: any;
	}[];
	activations: {
		name: string;
		translation: string;
		icon: string;
		distances: number[];
		defaultDistance: number;
		proximity: boolean;
		transitive: boolean;
		stereoSupported: boolean;
		hasEncoderInfo: boolean;
		encoderInfo: any;
		weight: number;
	}[];
	permissions: {
		key: string;
		value: boolean;
	}[];
};

export default class ConfigPacket extends ClientPlasmoVoicePacket<ConfigPacketData> {
	constructor(bot: Bot) {
		super(bot, "ConfigPacket");
	}
}
