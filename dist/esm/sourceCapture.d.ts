export type CapturedSource = {
    file?: string;
    line?: number;
    col?: number;
    fn?: string;
    raw?: string;
};
/**
 * Capture the first "user" frame from an Error stack.
 * Skips frames that look like they belong to the logger itself.
 */
export declare function captureSourceFromStack(stack: string | undefined): CapturedSource | undefined;
//# sourceMappingURL=sourceCapture.d.ts.map