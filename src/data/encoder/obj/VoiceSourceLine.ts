import ByteArrayDataInput from "../ByteArrayDataInput";
import {
	McGameProfileSerializer,
	McGameProfileSerializerData,
} from "./McGameProfileSerializer";

export type VoiceSourceLineData = {
	name: string;
	translation: string;
	icon: string;
	defaultVolume: number;
	weight: number;
	hasPlayers: boolean;
	players: Set<McGameProfileSerializerData> | undefined;
};

export namespace VoiceSourceLine {
	export function deserialize(
		packet: ByteArrayDataInput,
	): VoiceSourceLineData {
		const name = packet.readUTF();
		const translation = packet.readUTF();
		const icon = packet.readUTF();
		const defaultVolume = packet.readDouble();
		const weight = packet.readInt();

		const hasPlayers = packet.readBoolean();
		const players = new Set<McGameProfileSerializerData>();
		if (hasPlayers) {
			const playersSize = packet.readInt();
			for (let j = 0; j < playersSize; j++) {
				players.add(McGameProfileSerializer.deserialize(packet));
			}
		}

		return {
			name,
			translation,
			icon,
			defaultVolume,
			weight,
			hasPlayers,
			players: hasPlayers ? players : undefined,
		};
	}
}
