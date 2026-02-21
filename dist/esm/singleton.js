import { LogManager } from "./manager";
import { DEFAULT_ROOT_SCOPE, createDefaultConfig, fromPersistedConfig, normalizeScope, toPersistedConfig } from "./config";
import { createConsoleSink } from "./sinks/consoleSink";
/**
 * Default singleton manager. This is the “console-like” global instance.
 * You can still create additional managers for tests or isolation if needed.
 */
const manager = new LogManager(createDefaultConfig());
// Add console sink by default.
manager.addSink(createConsoleSink());
/** Persist config to localStorage if available (browser only) */
const STORAGE_KEY = "app:logcfg:v1";
function canUseLocalStorage() {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}
export function loadLoggerConfigFromStorage() {
    if (!canUseLocalStorage())
        return;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return;
        const parsed = JSON.parse(raw);
        const current = manager.getConfig();
        const next = fromPersistedConfig(current, parsed);
        // apply next onto manager
        manager.setMinLevel(next.minLevel);
        manager.enableAll(next.enabledAll);
        manager.clearScopeRules();
        next.enabledScopes.forEach((s) => manager.enableScope(s));
        next.enabledPrefixes.forEach((p) => manager.enablePrefix(p));
    }
    catch {
        // ignore
    }
}
export function saveLoggerConfigToStorage() {
    if (!canUseLocalStorage())
        return;
    try {
        const cfg = manager.getConfig();
        const payload = toPersistedConfig(cfg);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }
    catch {
        // ignore
    }
}
/**
 * Global singleton logger (root scope).
 * Usage: logger.info("..."), logger.scope("Report/...").debug("...")
 */
export const logger = Object.assign(manager.getLogger(DEFAULT_ROOT_SCOPE), {
    manager,
    // ✅ rootless: just use the subScope directly (normalized)
    scope: (subScope) => manager.getLogger(normalizeScope(subScope)),
    enableScope: (scope) => manager.enableScope(scope),
    enablePrefix: (prefix) => manager.enablePrefix(prefix),
    disableScope: (scope) => manager.disableScope(scope),
    disablePrefix: (prefix) => manager.disablePrefix(prefix),
    setMinLevel: (lvl) => manager.setMinLevel(lvl),
    addTransform: (t) => manager.addTransform(t),
});
//# sourceMappingURL=singleton.js.map