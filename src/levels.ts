export type LogLevel = "debug" | "info" | "warn" | "error";

export const LogLevelWeight: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export function isLevelEnabled(minLevel: LogLevel, level: LogLevel): boolean {
  return LogLevelWeight[level] >= LogLevelWeight[minLevel];
}
