export type LogLevel = "debug" | "info" | "warn" | "error";
export declare const LogLevelWeight: Record<LogLevel, number>;
export declare function isLevelEnabled(minLevel: LogLevel, level: LogLevel): boolean;
//# sourceMappingURL=levels.d.ts.map