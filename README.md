<h1 align="center">mineflayer-plasmovoice</h1>
<p align="center"><i>A lightweight plugin for Mineflayer that allows use VoiceChat for PlasmoVoice plugin.</i></p>

---

### Getting Started

This plugin is built using Node and can be installed using:
```bash
npm install mineflayer-plasmovoice
```

**Required** to have these packets:

* [**ffmpeg**](https://ffmpeg.org/)

### Simple Bot

The brief description goes here.

```js
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
```

### Documentation

[API](https://github.com/Maks-gaming/mineflayer-plasmovoice/blob/master/docs/api.md)

[Examples](https://github.com/Maks-gaming/mineflayer-plasmovoice/tree/master/examples)

### License

This project uses the [MIT](https://github.com/Maks-gaming/mineflayer-plasmovoice/blob/master/LICENSE) license.

### Contributions

This project is accepting PRs and Issues. See something you think can be improved? Go for it! Any and all help is highly appreciated!

For larger changes, it is recommended to discuss these changes in the issues tab before writing any code. It's also preferred to make many smaller PRs than one large one, where applicable.
