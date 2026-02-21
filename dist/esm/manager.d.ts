import type { Logger, LoggerConfig, LogEvent, LogSink } from "./types";
/**
 * Central log manager.
 * Owns config + sinks + creates scoped logger instances.
 *
 * This is intentionally framework-agnostic and safe in both browser and Node.
 */
export declare class LogManager {
    private cfg;
    private sinks;
    constructor(initial?: Partial<LoggerConfig>);
    /** Read a snapshot of config (defensive copies for sets) */
    getConfig(): LoggerConfig;
    setMinLevel(level: LoggerConfig["minLevel"]): void;
    enableAll(enabled: boolean): void;
    enableScope(scope: string): void;
    disableScope(scope: string): void;
    enablePrefix(prefix: string): void;
    disablePrefix(prefix: string): void;
    clearScopeRules(): void;
    addTransform(transform: LoggerConfig["transforms"][number]): void;
    clearTransforms(): void;
    addSink(sink: LogSink): void;
    removeSink(name: string): void;
    listSinks(): string[];
    /**
     * Emit an event to sinks if enabled.
     * Never throws.
     */
    emit(evt: LogEvent): void;
    /**
     * Create a scoped logger.
     * The returned logger is stable and inexpensive; you can create these per component/module.
     */
    getLogger(scope: string, fields?: Record<string, unknown>): Logger;
}
//# sourceMappingURL=manager.d.ts.map