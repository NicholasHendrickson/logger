export type CapturedSource = {
    file?: string;
    line?: number;
    col?: number;
    fn?: string;
    raw?: string;
  };
  
  const INTERNAL_HINTS = [
    "/logging/src/",
    "/@clinicaltoolkits/logger/",
    "\\logging\\src\\",
    "\\@clinicaltoolkits\\logger\\",
  ];
  
  /**
   * Attempt to parse a stack trace line into structured {file,line,col,fn}.
   * Handles common Chrome and Firefox formats.
   */
  function parseStackLine(line: string): CapturedSource | null {
    const l = line.trim();
    if (!l) return null;
  
    // Chrome: "at fn (http://.../file.js:12:34)" OR "at http://.../file.js:12:34"
    // Firefox: "fn@http://.../file.js:12:34" OR "@http://.../file.js:12:34"
    // Also handles "file:///C:/.../file.ts:12:34"
  
    // Try Chrome with function
    let m = l.match(/^at\s+(.*?)\s+\((.*?):(\d+):(\d+)\)$/);
    if (m) {
      return { fn: m[1], file: m[2], line: Number(m[3]), col: Number(m[4]), raw: l };
    }
  
    // Try Chrome without function
    m = l.match(/^at\s+(.*?):(\d+):(\d+)$/);
    if (m) {
      return { file: m[1], line: Number(m[2]), col: Number(m[3]), raw: l };
    }
  
    // Try Firefox with function
    m = l.match(/^(.*?)@(.*?):(\d+):(\d+)$/);
    if (m) {
      return { fn: m[1] || undefined, file: m[2], line: Number(m[3]), col: Number(m[4]), raw: l };
    }
  
    return null;
  }
  
  function isInternalFrame(src: CapturedSource): boolean {
    const f = src.file ?? "";
    for (const h of INTERNAL_HINTS) {
      if (f.includes(h)) return true;
    }
    return false;
  }
  
  /**
   * Capture the first "user" frame from an Error stack.
   * Skips frames that look like they belong to the logger itself.
   */
  export function captureSourceFromStack(stack: string | undefined): CapturedSource | undefined {
    if (!stack) return undefined;
  
    const lines = stack.split("\n");
  
    for (const line of lines) {
      const parsed = parseStackLine(line);
      if (!parsed) continue;
      if (isInternalFrame(parsed)) continue;
  
      // ignore totally unhelpful frames
      if (!parsed.file) continue;
  
      // normalize file URL-ish prefix for readability
      parsed.file = parsed.file.replace(/^file:\/\//, "");
  
      return parsed;
    }
  
    return undefined;
  }
  