import { ProtoDef } from "protodef";
import { log } from "..";
import Core from "../Core";
import protocol from "../data/protocol";

export default class PacketClientEncoder {
	private readonly core;

	readonly protoDef = new ProtoDef(false);

	constructor(core: Core) {
		this.core = core;

		// Schemas
		log.debug("Registering mod packet data..");
		this.protoDef.addProtocol(protocol, ["login", "toClient"]);
		this.protoDef.addProtocol(protocol, ["udp"]);
		this.protoDef.addTypes(protocol.types);

		log.debug("Waiting for login..");
		this.core.bot.once("login", () => {
			log.debug("Logged in!");

			// Channels
			log.debug("Registering channels..");
			this.core.bot._client.registerChannel(
				"plasmo:voice/v2/installed",
				undefined,
				true,
			);
			this.core.bot._client.registerChannel(
				"plasmo:voice/v2/service",
				undefined,
				true,
			);
			this.core.bot._client.registerChannel(
				"plasmo:voice/v2",
				(this.protoDef.types as any).plasmovoice_packet,
				true,
			);

			// Types
			log.debug("Registering types..");
			for (const [key, value] of Object.entries(
				this.protoDef.types as any,
			)) {
				this.core.bot._client.registerChannel(key, value);
			}
		});
	}
}
