import { log } from "..";
import Core from "../Core";

export default class PacketClientEncoder {
	private readonly core;

	constructor(core: Core) {
		this.core = core;

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
				undefined,
				true,
			);
		});
	}
}
