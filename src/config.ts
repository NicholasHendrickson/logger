import type { LoggerConfig, LogTransform } from "./types";
import type { LogLevel } from "./levels";

/** Root is intentionally empty for rootless scopes. */
export const DEFAULT_ROOT_SCOPE = "";

/** Default config — conservative out of the box */
export function createDefaultConfig(): LoggerConfig {
  return {
    minLevel: "info",
    enabledAll: false,
    enabledScopes: new Set<string>(),
    enabledPrefixes: new Set<string>(),
    transforms: [],

    sourceCapture: "warn+error",
    sourceStackLimit: 25,
  };
}

/** Keep scope normalization simple and predictable. */
export function normalizeScope(scope: string): string {
  return scope
    .trim()
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/")
    .replace(/^\/+/, "")   // ✅ remove leading slash
    .replace(/\/+$/, "");  // ✅ remove trailing slash
}

/**
 * Normalize a prefix:
 * - ensure non-empty
 * - ensure trailing slash so "App/Report" doesn't match "App/ReportsX"
 */
export function normalizePrefix(prefix: string): string {
  const p = normalizeScope(prefix);
  if (!p) return "/"; // should rarely be used; see enablePrefixSafe below
  return p.endsWith("/") ? p : `${p}/`;
}

export function serializeError(err: unknown): { name: string; message: string; stack?: string } | undefined {
  if (!err) return undefined;
  if (err instanceof Error) return { name: err.name, message: err.message, stack: err.stack };
  return { name: "UnknownError", message: String(err) };
}

/**
 * A tiny helper to compose multiple transforms cleanly.
 * If any transform returns null, the event is dropped.
 */
export function applyTransforms(transforms: readonly LogTransform[], evt: any): any | null {
  let cur = evt;
  for (const t of transforms) {
    const next = t(cur);
    if (next === null) return null;
    cur = next;
  }
  return cur;
}

export type PersistedConfig = {
  minLevel?: LogLevel;
  enabledAll?: boolean;
  enabledScopes?: string[];
  enabledPrefixes?: string[];
};

export function toPersistedConfig(cfg: LoggerConfig): PersistedConfig {
  return {
    minLevel: cfg.minLevel,
    enabledAll: cfg.enabledAll,
    enabledScopes: Array.from(cfg.enabledScopes),
    enabledPrefixes: Array.from(cfg.enabledPrefixes),
  };
}

export function fromPersistedConfig(base: LoggerConfig, persisted: PersistedConfig): LoggerConfig {
  const next: LoggerConfig = {
    ...base,
    minLevel: persisted.minLevel ?? base.minLevel,
    enabledAll: typeof persisted.enabledAll === "boolean" ? persisted.enabledAll : base.enabledAll,
    enabledScopes: new Set((persisted.enabledScopes ?? []).map(normalizeScope)),
    enabledPrefixes: new Set((persisted.enabledPrefixes ?? []).map(normalizePrefix)),
    transforms: base.transforms.slice(),
  };
  return next;
}
