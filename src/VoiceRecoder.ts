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

    static convertToPCM(name: string, sampleRate: number = 48000, speed: number = 1.0, isStereo: boolean = false) {
        if (!(this.isUnixInstalled("ffmpeg") || this.isWindowsInstalled("ffmpeg"))) {
            throw new Error("ffmpeg is not installed")
        }
        
        const ffmpeg = spawn('ffmpeg', [
            '-y',
            '-i', name,
            '-acodec', 'pcm_s16le',
            '-f', 's16le',
            '-filter:a', `atempo=${speed.toFixed(1)}`,
            '-ac', isStereo ? "2" : "1",
            '-ar', '' + sampleRate,
            'output.pcm'
        ]);
    
        return ffmpeg;
    }
}