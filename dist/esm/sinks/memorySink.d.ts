import type { LogSink, LogEvent } from "../types";
/**
 * In-memory circular buffer sink.
 * Perfect for building a debug panel later (React or otherwise).
 */
export declare function createMemorySink(opts?: {
    capacity?: number;
}): LogSink & {
    getEvents: () => readonly LogEvent[];
    clear: () => void;
};
//# sourceMappingURL=memorySink.d.ts.map