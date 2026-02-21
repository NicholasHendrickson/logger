"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ROOT_SCOPE = void 0;
exports.createDefaultConfig = createDefaultConfig;
exports.normalizeScope = normalizeScope;
exports.normalizePrefix = normalizePrefix;
exports.serializeError = serializeError;
exports.applyTransforms = applyTransforms;
exports.toPersistedConfig = toPersistedConfig;
exports.fromPersistedConfig = fromPersistedConfig;
/** Root is intentionally empty for rootless scopes. */
exports.DEFAULT_ROOT_SCOPE = "";
/** Default config — conservative out of the box */
function createDefaultConfig() {
    return {
        minLevel: "info",
        enabledAll: false,
        enabledScopes: new Set(),
        enabledPrefixes: new Set(),
        transforms: [],
        sourceCapture: "warn+error",
        sourceStackLimit: 25,
    };
}
/** Keep scope normalization simple and predictable. */
function normalizeScope(scope) {
    return scope
        .trim()
        .replace(/\\/g, "/")
        .replace(/\/+/g, "/")
        .replace(/^\/+/, "") // ✅ remove leading slash
        .replace(/\/+$/, ""); // ✅ remove trailing slash
}
/**
 * Normalize a prefix:
 * - ensure non-empty
 * - ensure trailing slash so "App/Report" doesn't match "App/ReportsX"
 */
function normalizePrefix(prefix) {
    const p = normalizeScope(prefix);
    if (!p)
        return "/"; // should rarely be used; see enablePrefixSafe below
    return p.endsWith("/") ? p : `${p}/`;
}
function serializeError(err) {
    if (!err)
        return undefined;
    if (err instanceof Error)
        return { name: err.name, message: err.message, stack: err.stack };
    return { name: "UnknownError", message: String(err) };
}
/**
 * A tiny helper to compose multiple transforms cleanly.
 * If any transform returns null, the event is dropped.
 */
function applyTransforms(transforms, evt) {
    let cur = evt;
    for (const t of transforms) {
        const next = t(cur);
        if (next === null)
            return null;
        cur = next;
    }
    return cur;
}
function toPersistedConfig(cfg) {
    return {
        minLevel: cfg.minLevel,
        enabledAll: cfg.enabledAll,
        enabledScopes: Array.from(cfg.enabledScopes),
        enabledPrefixes: Array.from(cfg.enabledPrefixes),
    };
}
function fromPersistedConfig(base, persisted) {
    const next = {
        ...base,
        minLevel: persisted.minLevel ?? base.minLevel,
        enabledAll: typeof persisted.enabledAll === "boolean" ? persisted.enabledAll : base.enabledAll,
        enabledScopes: new Set((persisted.enabledScopes ?? []).map(normalizeScope)),
        enabledPrefixes: new Set((persisted.enabledPrefixes ?? []).map(normalizePrefix)),
        transforms: base.transforms.slice(),
    };
    return next;
}
//# sourceMappingURL=config.js.map