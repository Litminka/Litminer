export class LitminerDebug {
    static Log(message: string, color: DebugColor) {
        if (!process.env.DEBUG) return;

        console.log(`[LitminerV2] \u001b[${color}m${message}\u001b[0m`)
    }

    public static Error(message: string) {
        LitminerDebug.Log(`[ERROR] ${message}`, DebugColor.Red);
    }

    public static Info(message: string) {
        LitminerDebug.Log(`[INFO] ${message}`, DebugColor.Cyan);
    }

    public static Warning(message: string) {
        LitminerDebug.Log(`[WARNING] ${message}`, DebugColor.Yellow);
    }

    public static Special(message: string) {
        LitminerDebug.Log(`[SPECIAL] ${message}`, DebugColor.Purple);
    }

    public static Debug(message: string) {
        LitminerDebug.Log(`[DEBUG] ${message}`, DebugColor.White);
    }

    public static Success(message: string) {
        LitminerDebug.Log(`[SUCCESS] ${message}`, DebugColor.Green);
    }
}

enum DebugColor {
    White = 0,
    Red = 31,
    Green = 32,
    Yellow = 33,
    Blue = 34,
    Purple = 35,
    Cyan = 36
}
