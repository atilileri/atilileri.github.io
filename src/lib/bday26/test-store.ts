/**
 * TEST-ONLY. The `localStorage` stand-ins the bday26 unit tests share (review
 * L7): an in-memory store and one that throws like a browser with storage
 * blocked. No page imports this file; `npm test` runs only `*.test.ts`, so it
 * never runs on its own either.
 */
import type { KeyValueStore } from "./ledger.ts";

/** An in-memory stand-in for `localStorage`, optionally seeded. `data` is
 *  the map behind it, for a test that checks what was written. */
export function memoryStore(seed: Record<string, string> = {}): KeyValueStore & { data: Map<string, string> } {
  const data = new Map(Object.entries(seed));
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  };
}

/** A storage that throws on every read and write, as a browser with
 *  storage disabled (or full) does. */
export function blockedStore(): KeyValueStore {
  return {
    getItem() {
      throw new Error("SecurityError: storage is disabled");
    },
    setItem() {
      throw new Error("QuotaExceededError");
    },
  };
}
