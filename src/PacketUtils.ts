import { Bot } from "mineflayer";

import forge from "node-forge";

export default null;

export function registerChannel(bot: Bot, channel: String) {
    bot._client.write("custom_payload", {
        channel: "minecraft:register",
        data: Buffer.from(channel, "utf8")
    })
}

export async function generateRSA() : Promise<{privateKey: string; publicKey: string;}> {
    return new Promise(function(resolve, reject) {
        forge.pki.rsa.generateKeyPair(2048, undefined, (err: any, keypair: any) => {
            resolve({
                "privateKey": forge.pki.privateKeyToPem(keypair.privateKey).replace(/(\r\n|\n|\r)/gm, ""),
                "publicKey": forge.pki.publicKeyToPem(keypair.publicKey).replace(/(\r\n|\n|\r)/gm, "").replace("-----BEGIN PUBLIC KEY-----", "").replace("-----END PUBLIC KEY-----", ""),
            });
        })
    })
}