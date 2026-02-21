import { LogManager } from "./manager";
import type { LogTransform, Logger } from "./types";
export declare function loadLoggerConfigFromStorage(): void;
export declare function saveLoggerConfigToStorage(): void;
/**
 * Global singleton logger (root scope).
 * Usage: logger.info("..."), logger.scope("Report/...").debug("...")
 */
export declare const logger: Logger & {
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
};
//# sourceMappingURL=singleton.d.ts.map