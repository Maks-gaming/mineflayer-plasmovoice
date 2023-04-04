const mineflayer = require("mineflayer")
const plasmo = require("mineflayer-plasmovoice")

const bot = mineflayer.createBot({
    "host": "localhost"
})

bot.loadPlugin(plasmo.plugin)

bot.on("voicechat_connected", () => {
    bot.setControlState("sneak", true)

    // Path to file with any audio format
    bot.plasmovoice.SendAudio("music.mp3")
})

bot.on("voicechat_audio_end", () => {
    bot.setControlState("sneak", false)
})