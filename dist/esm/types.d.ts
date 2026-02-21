import type { LogLevel } from "./levels";
export type SourceCaptureMode = "off" | "warn+error" | "all";
/**
 * Canonical log event shape emitted by the logger.
 * Keep this stable — sinks/transports should rely on it.
 */
export type LogEvent = {
    /** ISO-8601 timestamp (UTC) */
    ts: string;
    level: LogLevel;
    /**
     * Hierarchical scope identifier, e.g.:
     * - "App"
     * - "App/Report"
     * - "App/Report/AvailableSections"
     */
    scope: string;
    /** Human readable message */
    message: string;
    /** Optional structured payload (safe for JSON) */
    data?: unknown;
    /** Optional error (normalized) */
    err?: {
        name: string;
        message: string;
        stack?: string;
    };
    /**
     * Optional additional fields for correlation / analytics.
     * Examples: requestId, orgId, userId, documentId.
     */
    fields?: Record<string, unknown>;
};
/**
 * A sink is any destination for logs: console, localStorage, memory buffer, remote API, etc.
 * Sinks must NEVER throw (or should internally catch) — logging must not crash the app.
 */
export type LogSink = {
    name: string;
    write: (evt: LogEvent) => void | Promise<void>;
};
/**
 * Transform hook applied to events before emission to sinks.
 * Useful for redaction/masking, sampling, enrichment, etc.
 */
export type LogTransform = (evt: LogEvent) => LogEvent | null;
export type LoggerConfig = {
    /** Minimum level to emit */
    minLevel: LogLevel;
    /**
     * If true, all scopes are enabled (subject to minLevel).
     * If false, scope allowlist/prefix rules apply.
     */
    enabledAll: boolean;
    /** Exact scopes enabled */
    enabledScopes: Set<string>;
    /** Prefixes enabled (should include trailing slash to be unambiguous) */
    enabledPrefixes: Set<string>;
    /** Optional event transform(s) */
    transforms: LogTransform[];
    /** Allow capturing source info (file/line/function) */
    sourceCapture?: SourceCaptureMode;
    /** Maximum stack frames to capture for source info */
    sourceStackLimit?: number;
};
/**
 * A logger is a scoped interface used by call-sites.
 * It should remain small and ergonomic.
 */
export type Logger = {
    /** The logger's full scope name */
    scope: string;
    /** Create a child logger: logger.child("UI") => "App/.../UI" */
    child: (subScope: string) => Logger;
    /** Return a logger with additional constant fields added to every log event */
    withFields: (fields: Record<string, unknown>) => Logger;
    debug: (message: string, data?: unknown) => void;
    info: (message: string, data?: unknown) => void;
    warn: (message: string, data?: unknown) => void;
    error: (message: string, err?: unknown, data?: unknown) => void;
    /**
     * Wrap a function so you don't have to manually log start/end/errors everywhere.
     * This is the main “make it not verbose” feature.
     */
    wrap: <A extends readonly unknown[], R>(name: string, fn: (...args: A) => R, opts?: {
        level?: LogLevel;
        logArgs?: boolean;
        logResult?: boolean;
    }) => (...args: A) => R;
};
//# sourceMappingURL=types.d.ts.map