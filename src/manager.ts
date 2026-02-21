import type { Logger, LoggerConfig, LogEvent, LogSink } from "./types";
import { isLevelEnabled } from "./levels";
import {
  applyTransforms,
  createDefaultConfig,
  normalizePrefix,
  normalizeScope,
  serializeError,
} from "./config";
import { captureSourceFromStack } from "./sourceCapture";

function nowIso(): string {
  return new Date().toISOString();
}

function scopeAllowed(cfg: LoggerConfig, scope: string): boolean {
  if (cfg.enabledAll) return true;
  if (cfg.enabledScopes.has(scope)) return true;
  for (const p of cfg.enabledPrefixes) {
    if (scope.startsWith(p)) return true;
  }
  return false;
}

function joinScope(base: string, sub: string): string {
  const b = normalizeScope(base);
  const s = normalizeScope(sub);
  if (!b) return s;
  if (!s) return b;
  return `${b}/${s}`;
}

/**
 * Central log manager.
 * Owns config + sinks + creates scoped logger instances.
 *
 * This is intentionally framework-agnostic and safe in both browser and Node.
 */
export class LogManager {
  private cfg: LoggerConfig;
  private sinks = new Map<string, LogSink>();

  constructor(initial?: Partial<LoggerConfig>) {
    const base = createDefaultConfig();
    this.cfg = {
      ...base,
      ...initial,
      enabledScopes: initial?.enabledScopes ?? base.enabledScopes,
      enabledPrefixes: initial?.enabledPrefixes ?? base.enabledPrefixes,
      transforms: initial?.transforms ?? base.transforms,
    };
  }

  /** Read a snapshot of config (defensive copies for sets) */
  getConfig(): LoggerConfig {
    return {
      minLevel: this.cfg.minLevel,
      enabledAll: this.cfg.enabledAll,
      enabledScopes: new Set(this.cfg.enabledScopes),
      enabledPrefixes: new Set(this.cfg.enabledPrefixes),
      transforms: this.cfg.transforms.slice(),
    };
  }

  setMinLevel(level: LoggerConfig["minLevel"]) {
    this.cfg.minLevel = level;
  }

  enableAll(enabled: boolean) {
    this.cfg.enabledAll = enabled;
  }

  enableScope(scope: string) {
    this.cfg.enabledScopes.add(normalizeScope(scope));
  }

  disableScope(scope: string) {
    this.cfg.enabledScopes.delete(normalizeScope(scope));
  }

  enablePrefix(prefix: string) {
    this.cfg.enabledPrefixes.add(normalizePrefix(prefix));
  }

  disablePrefix(prefix: string) {
    this.cfg.enabledPrefixes.delete(normalizePrefix(prefix));
  }

  clearScopeRules() {
    this.cfg.enabledAll = false;
    this.cfg.enabledScopes.clear();
    this.cfg.enabledPrefixes.clear();
  }

  addTransform(transform: LoggerConfig["transforms"][number]) {
    this.cfg.transforms.push(transform);
  }

  clearTransforms() {
    this.cfg.transforms.length = 0;
  }

  addSink(sink: LogSink) {
    this.sinks.set(sink.name, sink);
  }

  removeSink(name: string) {
    this.sinks.delete(name);
  }

  listSinks(): string[] {
    return Array.from(this.sinks.keys());
  }

  /**
   * Emit an event to sinks if enabled.
   * Never throws.
   */
  emit(evt: LogEvent) {
    try {
      if (!isLevelEnabled(this.cfg.minLevel, evt.level)) return;
      if (!scopeAllowed(this.cfg, evt.scope)) return;

      const maybe = applyTransforms(this.cfg.transforms, evt);
      if (maybe === null) return;

      for (const sink of this.sinks.values()) {
        try {
          void sink.write(maybe);
        } catch {
          // sinks must not crash the app
        }
      }
    } catch {
      // logger must not crash the app
    }
  }

  /**
   * Create a scoped logger.
   * The returned logger is stable and inexpensive; you can create these per component/module.
   */
  getLogger(scope: string, fields?: Record<string, unknown>): Logger {
    const fullScope = normalizeScope(scope);
    const baseFields = fields ? { ...fields } : undefined;

    const write = (level: LogEvent["level"], message: string, data?: unknown, err?: unknown) => {
      let fieldsOut = baseFields;

      const mode = this.cfg.sourceCapture ?? "off";
      const shouldCapture =
        mode === "all" || (mode === "warn+error" && (level === "warn" || level === "error"));
    
      if (shouldCapture) {
        const e = new Error();
        const src = captureSourceFromStack(e.stack);
        if (src) {
          fieldsOut = { ...(fieldsOut ?? {}), source: src };
        }
      }
      
      const evt: LogEvent = {
        ts: nowIso(),
        level,
        scope: fullScope,
        message,
        data,
        err: serializeError(err),
        fields: fieldsOut,
      };
      
      this.emit(evt);
    };

    const logger: Logger = {
      scope: fullScope,

      child: (subScope: string) => this.getLogger(joinScope(fullScope, subScope), baseFields),

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

        return ((...args: any[]) => {
          write(level, `${name}:start`, logArgs ? { args } : undefined);

          try {
            const result = fn(...(args as any));

            // Promise/thenable support
            if (result && typeof (result as any).then === "function") {
              return (result as any)
                .then((val: any) => {
                  write(level, `${name}:ok`, logResult ? { result: val } : undefined);
                  return val;
                })
                .catch((err: any) => {
                  write("error", `${name}:error`, undefined, err);
                  throw err;
                });
            }

            write(level, `${name}:ok`, logResult ? { result } : undefined);
            return result;
          } catch (err: any) {
            write("error", `${name}:error`, undefined, err);
            throw err;
          }
        }) as any;
      },
    };

    return logger;
  }
}
