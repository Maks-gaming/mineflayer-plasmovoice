import { spawn } from "child_process";

export default function convert_audio_to_pcm(name: string, ar: number = 48000) {
    const ffmpeg = spawn('ffmpeg', [
        '-y',
        '-i', name,
        '-acodec', 'pcm_s16le',
        '-f', 's16le',
        '-ac', '1',
        '-ar', '' + ar,
        'output.pcm'
    ]);

    return ffmpeg;
}