import { LogManager } from "./manager";
import { DEFAULT_ROOT_SCOPE, createDefaultConfig, fromPersistedConfig, normalizeScope, toPersistedConfig } from "./config";
import { createConsoleSink } from "./sinks/consoleSink";
import type { PersistedConfig } from "./config";
import type { LogTransform, Logger } from "./types";

/**
 * Default singleton manager. This is the “console-like” global instance.
 * You can still create additional managers for tests or isolation if needed.
 */
const manager = new LogManager(createDefaultConfig());

// Add console sink by default.
manager.addSink(createConsoleSink());

/** Persist config to localStorage if available (browser only) */
const STORAGE_KEY = "app:logcfg:v1";

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadLoggerConfigFromStorage() {
  if (!canUseLocalStorage()) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as PersistedConfig;
    const current = manager.getConfig();
    const next = fromPersistedConfig(current, parsed);
    // apply next onto manager
    manager.setMinLevel(next.minLevel);
    manager.enableAll(next.enabledAll);
    manager.clearScopeRules();
    next.enabledScopes.forEach((s) => manager.enableScope(s));
    next.enabledPrefixes.forEach((p) => manager.enablePrefix(p));
  } catch {
    // ignore
  }
}

export function saveLoggerConfigToStorage() {
  if (!canUseLocalStorage()) return;
  try {
    const cfg = manager.getConfig();
    const payload = toPersistedConfig(cfg);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

/**
 * Global singleton logger (root scope).
 * Usage: logger.info("..."), logger.scope("Report/...").debug("...")
 */
export const logger: Logger & {
  /** Access underlying manager when needed (config, sinks, transforms) */
  manager: LogManager;

  /** Create a scoped logger below root: logger.scope("Report") => scope "App/Report" */
  scope: (subScope: string) => Logger;

  /** Convenience: enable logging for a scope or prefix quickly */
  enableScope: (scope: string) => void;
  enablePrefix: (prefix: string) => void;
  disableScope: (scope: string) => void;
  disablePrefix: (prefix: string) => void;
  setMinLevel: (lvl: Parameters<LogManager["setMinLevel"]>[0]) => void;

  /** Optional: add transforms for redaction/enrichment */
  addTransform: (t: LogTransform) => void;
} = Object.assign(manager.getLogger(DEFAULT_ROOT_SCOPE), {
  manager,
  
  // ✅ rootless: just use the subScope directly (normalized)
  scope: (subScope: string) => manager.getLogger(normalizeScope(subScope)),

  enableScope: (scope: string) => manager.enableScope(scope),
  enablePrefix: (prefix: string) => manager.enablePrefix(prefix),
  disableScope: (scope: string) => manager.disableScope(scope),
  disablePrefix: (prefix: string) => manager.disablePrefix(prefix),
  setMinLevel: (lvl: any) => manager.setMinLevel(lvl),

  addTransform: (t: LogTransform) => manager.addTransform(t),
});
