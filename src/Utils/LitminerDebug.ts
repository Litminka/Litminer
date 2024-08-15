export class LitminerDebug {
    static Log(message: any, color: DebugColor) {
        if (!process.env.DEBUG) return;

        console.log(`[LitminerV2] \u001b[${color}m${message}\u001b[0m`)
    }

    public static Error(message: any) {
        LitminerDebug.Log(`[ERROR] ${message}`, DebugColor.Red);
    }

    public static Info(message: any) {
        LitminerDebug.Log(`[INFO] ${message}`, DebugColor.Cyan);
    }

    public static Warning(message: any) {
        LitminerDebug.Log(`[WARNING] ${message}`, DebugColor.Yellow);
    }

    public static Special(message: any) {
        LitminerDebug.Log(`[SPECIAL] ${message}`, DebugColor.Purple);
    }

    public static Debug(message: any) {
        LitminerDebug.Log(`[DEBUG] ${message}`, DebugColor.White);
    }

    public static Success(message: any) {
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
