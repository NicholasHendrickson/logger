export function createConsoleSink() {
    return {
        name: "console",
        write: (evt) => {
            const head = `[${evt.ts}] [${evt.level.toUpperCase()}] [${evt.scope}]`;
            const extras = [];
            // fields: keep grouped so it doesn't spam the console with many args
            if (evt.fields && Object.keys(evt.fields).length) {
                extras.push({ fields: evt.fields });
            }
            // data: if you adopted variadic logging, evt.data may be an array of args
            if (Array.isArray(evt.data)) {
                extras.push(...evt.data);
            }
            else if (evt.data !== undefined) {
                extras.push(evt.data);
            }
            // err: keep grouped
            if (evt.err) {
                extras.push({ err: evt.err });
            }
            if (evt.level === "debug")
                console.debug(head, evt.message, ...extras);
            else if (evt.level === "info")
                console.info(head, evt.message, ...extras);
            else if (evt.level === "warn")
                console.warn(head, evt.message, ...extras);
            else
                console.error(head, evt.message, ...extras);
        },
    };
}
//# sourceMappingURL=consoleSink.js.map