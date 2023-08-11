import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export default class VoiceRecoder {
    static convertToPCM(name: string, sampleRate: number = 48000, speed: number = 1.0, isStereo: boolean = false): Promise<Buffer> {   
        return new Promise((resolve, reject) => {
            let chunks: Uint8Array[] = [];

            const ffmpegCommand = ffmpeg(name)
                .audioCodec('pcm_s16le')
                .format('s16le')
                .audioFilters(`atempo=${speed.toFixed(1)}`)
                .audioChannels(isStereo ? 2 : 1)
                .audioFrequency(sampleRate)
                .on('error', reject);
            
            const audioStream = ffmpegCommand.pipe();

            audioStream.on('data', (chunk) => {
                chunks.push(chunk);
            });

            audioStream.on('end', () => {
                let outputBuffer = Buffer.concat(chunks);
                resolve(outputBuffer)
            });
        });
    }
}