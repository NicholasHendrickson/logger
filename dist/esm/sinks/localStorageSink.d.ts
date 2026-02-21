import type { LogSink } from "../types";
/**
 * Stores log events to localStorage (browser only).
 * Useful for post-mortem debugging on client machines.
 */
export declare function createLocalStorageSink(opts?: {
    key?: string;
    maxEntries?: number;
}): LogSink;
//# sourceMappingURL=localStorageSink.d.ts.map