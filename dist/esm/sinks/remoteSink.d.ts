import type { LogSink, LogEvent } from "../types";
export type RemoteSender = (batch: readonly LogEvent[]) => Promise<void>;
export declare function createRemoteBatchSink(sender: RemoteSender, opts?: {
    name?: string;
    flushIntervalMs?: number;
    maxBatchSize?: number;
}): LogSink;
//# sourceMappingURL=remoteSink.d.ts.map