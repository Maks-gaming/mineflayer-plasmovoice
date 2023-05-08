const mineflayer = require("mineflayer")
const plasmo = require("mineflayer-plasmovoice")

const bot = mineflayer.createBot({
    "host": "localhost"
})

bot.loadPlugin(plasmo.plugin)

bot.on("voicechat_connected", () => {
    bot.setControlState("sneak", true)

    // Play any sound file
    bot.plasmovoice.SendAudio("music.mp3")

    // Play RAW-PCM format
    bot.plasmovoice.SendPCM("codec.pcm")
})

bot.on("voicechat_audio_end", () => {
    bot.setControlState("sneak", false)
})