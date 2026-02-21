"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevelWeight = void 0;
exports.isLevelEnabled = isLevelEnabled;
exports.LogLevelWeight = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
};
function isLevelEnabled(minLevel, level) {
    return exports.LogLevelWeight[level] >= exports.LogLevelWeight[minLevel];
}
//# sourceMappingURL=levels.js.map