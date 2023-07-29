<h1 align="center">mineflayer-plasmovoice</h1>
<p align="center"><i>A lightweight plugin for Mineflayer that allows use VoiceChat for PlasmoVoice plugin</i></p>

### Features
- 🔥 Supports **CommonJS** and **ES6**
- 🔈 Allows to send any soundfile formats using **FFMPEG**
- 🔒 Supports **AES-128-CBC** and **RSA** Encryption
- 🖧 Using **ProtoDef** instead old cursoredBuffer
- 👀 Almost exactly mimics the behavior of the original mod

### Getting Started

This plugin is built using Node and can be installed using:
```bash
npm install mineflayer-plasmovoice
```

**Required** to have these packets:

* [**ffmpeg**](https://ffmpeg.org/) (Not required, if you are sending **only PCM** Format)

### Simple Sound Player

A bot that sneaks will play a certain sound (music.mp3) and get up.

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
    bot.plasmovoice.sendAudio("music.mp3")
})

bot.on("voicechat_audio_end", () => {
    bot.setControlState("sneak", false)
})
```

### Enabling debugging
```js
bot.on("login", () => {
    bot.plasmovoice.enableDebug();
})
```

### Known issues
* The plugin does not work with [Aternos.org](https://aternos.org) (Proxying errors - Freezing at sending first pinging packet)
* PlasmoVoice 1.X.X temporarily not working (Very deprecated modules should be rewrited)

### License

This project uses the [MIT](https://github.com/Maks-gaming/mineflayer-plasmovoice/blob/master/LICENSE) license.

### Contributions

This project is accepting PRs and Issues. See something you think can be improved? Go for it! Any and all help is highly appreciated!

For larger changes, it is recommended to discuss these changes in the issues tab before writing any code. It's also preferred to make many smaller PRs than one large one, where applicable.

### Made with official PlasmoVoice resources (https://plasmovoice.com)