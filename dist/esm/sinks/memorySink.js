/**
 * In-memory circular buffer sink.
 * Perfect for building a debug panel later (React or otherwise).
 */
export function createMemorySink(opts) {
    const capacity = opts?.capacity ?? 500;
    const buf = [];
    const sink = {
        name: "memory",
        write: (evt) => {
            buf.push(evt);
            if (buf.length > capacity)
                buf.splice(0, buf.length - capacity);
        },
        getEvents: () => buf,
        clear: () => {
            buf.length = 0;
        },
    };
    return sink;
}
//# sourceMappingURL=memorySink.js.map