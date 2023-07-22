import { spawn, execSync } from "child_process";

export default class VoiceRecoder {
    private static isUnixInstalled(program: string) {
        try {
            execSync(`hash ${program} 2>/dev/null`, { stdio: 'ignore' })
            return true
        } catch {
            return false
        }
    }
    
    private static isWindowsInstalled(program: string) {
        // Try a couple variants, depending on execution environment the .exe
        // may or may not be required on both `where` and the program name.
        const attempts = [
            `where ${program}`,
            `where ${program}.exe`,
            `where.exe ${program}`,
            `where.exe ${program}.exe`
        ]
    
        let success = false
        for (const a of attempts) {
            try {
                execSync(a, { stdio: 'ignore' })
                success = true
            } catch { }
        }
    
        return success
    }

    static convert_audio_to_pcm(name: string, ar: number) {
        if (!(this.isUnixInstalled("ffmpeg") || this.isWindowsInstalled("ffmpeg"))) {
            throw new Error("FFmpeg is not installed")
        }
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
}