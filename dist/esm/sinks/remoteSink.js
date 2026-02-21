export function createRemoteBatchSink(sender, opts) {
    const name = opts?.name ?? "remote";
    const flushIntervalMs = opts?.flushIntervalMs ?? 2000;
    const maxBatchSize = opts?.maxBatchSize ?? 50;
    let buf = [];
    let flushing = false;
    async function flush() {
        if (flushing)
            return;
        if (buf.length === 0)
            return;
        flushing = true;
        try {
            const batch = buf.slice(0, maxBatchSize);
            buf = buf.slice(batch.length);
            await sender(batch);
        }
        catch {
            // drop on failure by default; logging should not block.
            // if you prefer bounded retry, do it inside your sender.
        }
        finally {
            flushing = false;
        }
    }
    // If in a browser/Node environment where timers exist, start a flush loop.
    if (typeof setInterval !== "undefined") {
        setInterval(() => { void flush(); }, flushIntervalMs);
    }
    return {
        name,
        write: (evt) => {
            buf.push(evt);
            if (buf.length >= maxBatchSize)
                void flush();
        },
    };
}
//# sourceMappingURL=remoteSink.js.map