<h1 align="center">mineflayer-plasmovoice</h1>
<p align="center"><i>A lightweight plugin for Mineflayer that allows use VoiceChat for PlasmoVoice plugin</i></p>

# Features
- 🔥 Supports **CommonJS** and **ES6**
- 🔈 Allows to send any soundfile formats using **FFMPEG**
- 🔒 Works with **AES-128-CBC** and **RSA** Encryption
- 👀 Almost exactly mimics the behavior of the original mod
- 🖧 Using java-like buffers to assemble the packets
- 📎 Supports "**/vrc**" command
- ↗ Automatically reconnects in case of connection loss

# Getting Started
#### Installation
1) This plugin is built using Node and can be installed using: ```npm install mineflayer-plasmovoice --save```

#### Simple Sound Player
A bot that sneaks will play a certain sound (/path/to/music.mp3) and get up.
```js
const mineflayer = require("mineflayer")
const plasmo = require("mineflayer-plasmovoice")

const bot = mineflayer.createBot({
    "host": "localhost"
})

bot.loadPlugin(plasmo.plugin)

bot.on("plasmovoice_connected", () => {
    bot.setControlState("sneak", true)

    // Path to file with any audio format
    bot.plasmovoice.sendAudio("/path/to/music.mp3")
})

bot.on("plasmovoice_audio_end", () => {
    bot.setControlState("sneak", false)
})
```

#### Debugging
```js
const plasmo = require("mineflayer-plasmovoice")

/** By default - 4, and these are warnings, errors and fatal errors */
plasmo.setLoggingLevel(0)
```

#### Listening players
> An example of an event when some player is talking
- Data format is `pcm_s16le`
- Sequence number goes in order from zero, some packet **may be skipped** when using the UDP protocol
```js
bot.on("plasmovoice_voice", (data) => {
    /*{
        player: string,
        distance: number
        sequenceNumber: BigInt
        data: Buffer
    }*/
})
```

> An example of an event when some player stopped talking
```js
bot.on("plasmovoice_voice_end", (data) => {
    /*{
        player: string,
        sequenceNumber: BigInt
    }*/
})
```

---

# License
This project uses the [MIT](https://github.com/Maks-gaming/mineflayer-plasmovoice/blob/master/LICENSE) license.

---

# Contributors:
- ↗ Maks-gaming - The idea and implementation of the plugin structure;
- 📎 CralixRaev - Helped to deal with packet system;
- 🔥 Plasmo R&D - helped to understand some things in the packet system;

> This project is accepting PRs and Issues. See something you think can be improved? Go for it! Any and all help is highly appreciated!

> For larger changes, it is recommended to discuss these changes in the issues tab before writing any code. It's also preferred to make many smaller PRs than one large one, where applicable.

<h1 align="center">Made with official PlasmoVoice resources (https://plasmovoice.com)</h1>
