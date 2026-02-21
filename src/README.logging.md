# @clinicaltoolkits/logging

A lightweight, framework-agnostic logging utility for TypeScript.

Key goals:
- **Singleton-first ergonomics** (like `console`): `logger.info(...)`
- **Scoped loggers** for features/components: `logger.scope(SCOPES.editor.menu)`
- **Selective enablement** by scope and prefix (turn on logs only where needed)
- **Multiple sinks** (console/localStorage/memory/remote/custom)
- **Low verbosity** via `wrap()` (auto start/end/error logs)

---

## Installation

Internal (workspace):
- Add this package to your monorepo and import `@clinicaltoolkits/logging`.

Publishing:
- Build + publish as a normal TypeScript library (ensure `dist/*.d.ts` is emitted and included).

---

## Defining scopes (recommended)

Scopes should be **logical and stable** (not file paths). Use `defineScopes()` for typed, autocomplete-friendly scope names.

```ts
import { defineScopes } from "@clinicaltoolkits/logging";

export const SCOPES = defineScopes("CT/ContentBlocks", {
  api: {
    tables: {
      fetchTableBlock: true,
    },
  },
  editor: {
    menu: true,
    extensions: {
      infoFieldNode: true,
    },
  },
} as const);
```

Each leaf becomes a string literal, e.g.:
`"CT/ContentBlocks/editor/menu"`

---

## Basic usage

```ts
import { logger } from "@clinicaltoolkits/logging";
import { SCOPES } from "./scopes";

logger.info("app starting");

const log = logger.scope(SCOPES.editor.menu);
log.debug("mounted");
log.info("combobox loaded", { count: 42 });
```

---

## Enabling logging by scope / prefix

Defaults are conservative:
- `minLevel = "info"`
- `enabledAll = false`
- no scopes/prefixes enabled

Meaning: **nothing logs until you enable something**, even if the level is `info`.

### Enable everything (global debug)

```ts
logger.manager.enableAll(true);
logger.setMinLevel("debug");
```

### Enable only one scope

```ts
logger.setMinLevel("debug");
logger.enableScope(SCOPES.editor.menu);
```

### Enable a whole subtree via prefix

```ts
logger.setMinLevel("debug");
logger.enablePrefix(`${SCOPES.editor}/`);
```

Note: Prefixes should end with `/` (the logger normalizes this automatically).

---

## wrap() to keep call-sites elegant

Instead of:

```ts
log.debug("handleAdd:start", { id });
try {
  await doSomething(id);
} catch (e) {
  log.error("handleAdd:error", e);
  throw e;
}
log.debug("handleAdd:ok", { id });
```

Use:

```ts
const handleAdd = log.wrap("handleAdd", async (id: string) => {
  await doSomething(id);
});
```

Options:

```ts
const fn = log.wrap("fetchData", fetchData, { logArgs: true, logResult: false, level: "debug" });
```

---

## Sinks

### Console sink (default)

Included in the singleton.

### Memory sink (useful for a future side panel)

```ts
import { createMemorySink, logger } from "@clinicaltoolkits/logging";

const memory = createMemorySink({ capacity: 1000 });
logger.manager.addSink(memory);

// Later: memory.getEvents()
```

### localStorage sink (browser only)

```ts
import { createLocalStorageSink, logger } from "@clinicaltoolkits/logging";

logger.manager.addSink(createLocalStorageSink({ key: "app:logs:v1", maxEntries: 200 }));
```

### Remote sink (batched)

```ts
import { createRemoteBatchSink, logger } from "@clinicaltoolkits/logging";

logger.manager.addSink(
  createRemoteBatchSink(async (batch) => {
    await fetch("/api/logs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(batch),
    });
  })
);
```

---

## Persistence of logging config (browser)

```ts
import { loadLoggerConfigFromStorage, saveLoggerConfigToStorage, logger } from "@clinicaltoolkits/logging";

loadLoggerConfigFromStorage();

logger.setMinLevel("debug");
logger.enablePrefix("CT/ContentBlocks/editor/");
saveLoggerConfigToStorage();
```

---

## Transforms (recommended for clinical data)

Transforms can:
- remove PHI/PII
- drop overly noisy events
- add correlation fields (app/env/orgId/userId/sessionId)

Example redaction transform:

```ts
logger.addTransform((evt) => {
  if (!evt.data) return evt;

  const data =
    typeof evt.data === "object" && evt.data
      ? { ...(evt.data as any), patientName: "[REDACTED]" }
      : evt.data;

  return { ...evt, data };
});
```

If a transform returns `null`, the event is dropped.

---

## Design notes

- Logging should never crash the app: sink failures are isolated.
- Scopes are hierarchical strings (`CT/...`).
- Emission is controlled by:
  - `minLevel`
  - `enabledAll` OR allowlists (`enabledScopes` / `enabledPrefixes`)
- `wrap()` is the main tool for low-verbosity call-sites.

