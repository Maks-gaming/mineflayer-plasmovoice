<h1 align="center">mineflayer-plasmovoice</h1>
<p align="center"><i>A lightweight plugin for Mineflayer that allows use VoiceChat for PlasmoVoice plugin</i></p>

# Features
- 🔥 Supports **CommonJS** and **ES6**
- 🔈 Allows to send any soundfile formats using **FFMPEG**
- 🔒 Supports **AES-128-CBC** and **RSA** Encryption
- 🎵 Supports sending **Stereo** audio
- 👀 Almost exactly mimics the behavior of the original mod
- 🖧 Using **ProtoDef** instead old cursoredBuffer
- 📎 Supports "**/vrc**" command
- ↗ Automatically reconnects in case of connection loss

# Getting Started
#### Installation
1) This plugin is built using Node and can be installed using: ```npm install mineflayer-plasmovoice --save```
2) Then install [**ffmpeg**](https://ffmpeg.org/) (Not required, if you are sending **only PCM** Format)

#### Simple Sound Player
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

#### Enabling debugging
```js
bot.on("login", () => {
    bot.plasmovoice.enableDebug();
})
```

---

### Known issues for fixing
* The plugin does not work with [Aternos.org](https://aternos.org) (Proxying errors - Freezing at sending first pinging packet)
* PlasmoVoice 1.X.X temporarily not working (Very deprecated modules should be rewrited)
* Max audio packet length is 48 seconds

---

# License
This project uses the [MIT](https://github.com/Maks-gaming/mineflayer-plasmovoice/blob/master/LICENSE) license.

---

# Contributors:
- ↗ Maks-gaming (Maksim Klimenko) - The idea and implementation of the plugin structure;
- 📎 CralixRaev (Anatoly Raev) - Pushed in the right direction, helped to deal with **ProtoDef** and old cursoredBuffer;
- 🔥 Plasmo R&D - helped to understand some things in the packet system;

> This project is accepting PRs and Issues. See something you think can be improved? Go for it! Any and all help is highly appreciated!

> For larger changes, it is recommended to discuss these changes in the issues tab before writing any code. It's also preferred to make many smaller PRs than one large one, where applicable.

<h1 align="center">Made with official PlasmoVoice resources (https://plasmovoice.com)</h1>