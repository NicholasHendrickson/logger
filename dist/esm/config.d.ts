import type { LoggerConfig, LogTransform } from "./types";
import type { LogLevel } from "./levels";
/** Root is intentionally empty for rootless scopes. */
export declare const DEFAULT_ROOT_SCOPE = "";
/** Default config — conservative out of the box */
export declare function createDefaultConfig(): LoggerConfig;
/** Keep scope normalization simple and predictable. */
export declare function normalizeScope(scope: string): string;
/**
 * Normalize a prefix:
 * - ensure non-empty
 * - ensure trailing slash so "App/Report" doesn't match "App/ReportsX"
 */
export declare function normalizePrefix(prefix: string): string;
export declare function serializeError(err: unknown): {
    name: string;
    message: string;
    stack?: string;
} | undefined;
/**
 * A tiny helper to compose multiple transforms cleanly.
 * If any transform returns null, the event is dropped.
 */
export declare function applyTransforms(transforms: readonly LogTransform[], evt: any): any | null;
export type PersistedConfig = {
    minLevel?: LogLevel;
    enabledAll?: boolean;
    enabledScopes?: string[];
    enabledPrefixes?: string[];
};
export declare function toPersistedConfig(cfg: LoggerConfig): PersistedConfig;
export declare function fromPersistedConfig(base: LoggerConfig, persisted: PersistedConfig): LoggerConfig;
//# sourceMappingURL=config.d.ts.map