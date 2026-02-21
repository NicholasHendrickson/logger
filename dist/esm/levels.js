export const LogLevelWeight = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
};
export function isLevelEnabled(minLevel, level) {
    return LogLevelWeight[level] >= LogLevelWeight[minLevel];
}
//# sourceMappingURL=levels.js.map