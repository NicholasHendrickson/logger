"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogManager = void 0;
const levels_1 = require("./levels");
const config_1 = require("./config");
const sourceCapture_1 = require("./sourceCapture");
function nowIso() {
    return new Date().toISOString();
}
function scopeAllowed(cfg, scope) {
    if (cfg.enabledAll)
        return true;
    if (cfg.enabledScopes.has(scope))
        return true;
    for (const p of cfg.enabledPrefixes) {
        if (scope.startsWith(p))
            return true;
    }
    return false;
}
function joinScope(base, sub) {
    const b = (0, config_1.normalizeScope)(base);
    const s = (0, config_1.normalizeScope)(sub);
    if (!b)
        return s;
    if (!s)
        return b;
    return `${b}/${s}`;
}
/**
 * Central log manager.
 * Owns config + sinks + creates scoped logger instances.
 *
 * This is intentionally framework-agnostic and safe in both browser and Node.
 */
class LogManager {
    constructor(initial) {
        this.sinks = new Map();
        const base = (0, config_1.createDefaultConfig)();
        this.cfg = {
            ...base,
            ...initial,
            enabledScopes: initial?.enabledScopes ?? base.enabledScopes,
            enabledPrefixes: initial?.enabledPrefixes ?? base.enabledPrefixes,
            transforms: initial?.transforms ?? base.transforms,
        };
    }
    /** Read a snapshot of config (defensive copies for sets) */
    getConfig() {
        return {
            minLevel: this.cfg.minLevel,
            enabledAll: this.cfg.enabledAll,
            enabledScopes: new Set(this.cfg.enabledScopes),
            enabledPrefixes: new Set(this.cfg.enabledPrefixes),
            transforms: this.cfg.transforms.slice(),
        };
    }
    setMinLevel(level) {
        this.cfg.minLevel = level;
    }
    enableAll(enabled) {
        this.cfg.enabledAll = enabled;
    }
    enableScope(scope) {
        this.cfg.enabledScopes.add((0, config_1.normalizeScope)(scope));
    }
    disableScope(scope) {
        this.cfg.enabledScopes.delete((0, config_1.normalizeScope)(scope));
    }
    enablePrefix(prefix) {
        this.cfg.enabledPrefixes.add((0, config_1.normalizePrefix)(prefix));
    }
    disablePrefix(prefix) {
        this.cfg.enabledPrefixes.delete((0, config_1.normalizePrefix)(prefix));
    }
    clearScopeRules() {
        this.cfg.enabledAll = false;
        this.cfg.enabledScopes.clear();
        this.cfg.enabledPrefixes.clear();
    }
    addTransform(transform) {
        this.cfg.transforms.push(transform);
    }
    clearTransforms() {
        this.cfg.transforms.length = 0;
    }
    addSink(sink) {
        this.sinks.set(sink.name, sink);
    }
    removeSink(name) {
        this.sinks.delete(name);
    }
    listSinks() {
        return Array.from(this.sinks.keys());
    }
    /**
     * Emit an event to sinks if enabled.
     * Never throws.
     */
    emit(evt) {
        try {
            if (!(0, levels_1.isLevelEnabled)(this.cfg.minLevel, evt.level))
                return;
            if (!scopeAllowed(this.cfg, evt.scope))
                return;
            const maybe = (0, config_1.applyTransforms)(this.cfg.transforms, evt);
            if (maybe === null)
                return;
            for (const sink of this.sinks.values()) {
                try {
                    void sink.write(maybe);
                }
                catch {
                    // sinks must not crash the app
                }
            }
        }
        catch {
            // logger must not crash the app
        }
    }
    /**
     * Create a scoped logger.
     * The returned logger is stable and inexpensive; you can create these per component/module.
     */
    getLogger(scope, fields) {
        const fullScope = (0, config_1.normalizeScope)(scope);
        const baseFields = fields ? { ...fields } : undefined;
        const write = (level, message, data, err) => {
            let fieldsOut = baseFields;
            const mode = this.cfg.sourceCapture ?? "off";
            const shouldCapture = mode === "all" || (mode === "warn+error" && (level === "warn" || level === "error"));
            if (shouldCapture) {
                const e = new Error();
                const src = (0, sourceCapture_1.captureSourceFromStack)(e.stack);
                if (src) {
                    fieldsOut = { ...(fieldsOut ?? {}), source: src };
                }
            }
            const evt = {
                ts: nowIso(),
                level,
                scope: fullScope,
                message,
                data,
                err: (0, config_1.serializeError)(err),
                fields: fieldsOut,
            };
            this.emit(evt);
        };
        const logger = {
            scope: fullScope,
            child: (subScope) => this.getLogger(joinScope(fullScope, subScope), baseFields),
            withFields: (moreFields) => {
                const merged = { ...(baseFields ?? {}), ...moreFields };
                return this.getLogger(fullScope, merged);
            },
            debug: (m, d) => write("debug", m, d),
            info: (m, d) => write("info", m, d),
            warn: (m, d) => write("warn", m, d),
            error: (m, e, d) => write("error", m, d, e),
            wrap: (name, fn, opts) => {
                const level = opts?.level ?? "debug";
                const logArgs = opts?.logArgs ?? false;
                const logResult = opts?.logResult ?? false;
                return ((...args) => {
                    write(level, `${name}:start`, logArgs ? { args } : undefined);
                    try {
                        const result = fn(...args);
                        // Promise/thenable support
                        if (result && typeof result.then === "function") {
                            return result
                                .then((val) => {
                                write(level, `${name}:ok`, logResult ? { result: val } : undefined);
                                return val;
                            })
                                .catch((err) => {
                                write("error", `${name}:error`, undefined, err);
                                throw err;
                            });
                        }
                        write(level, `${name}:ok`, logResult ? { result } : undefined);
                        return result;
                    }
                    catch (err) {
                        write("error", `${name}:error`, undefined, err);
                        throw err;
                    }
                });
            },
        };
        return logger;
    }
}
exports.LogManager = LogManager;
//# sourceMappingURL=manager.js.map