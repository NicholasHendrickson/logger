import type { LogSink, LogEvent } from "../types";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/**
 * Stores log events to localStorage (browser only).
 * Useful for post-mortem debugging on client machines.
 */
export function createLocalStorageSink(opts?: { key?: string; maxEntries?: number }): LogSink {
  const key = opts?.key ?? "app:logs:v1";
  const maxEntries = opts?.maxEntries ?? 200;

  return {
    name: "localStorage",
    write: (evt: LogEvent) => {
      if (!isBrowser()) return;

      try {
        const raw = window.localStorage.getItem(key);
        const arr = raw ? (JSON.parse(raw) as LogEvent[]) : [];
        const next = Array.isArray(arr) ? arr : [];

        next.push(evt);
        if (next.length > maxEntries) next.splice(0, next.length - maxEntries);

        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // ignore quota/serialization errors
      }
    },
  };
}
