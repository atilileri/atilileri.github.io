/**
 * The browser side of the ledger: how a page of the birthday games site
 * (/20261209/, spec #192, built on #193) opens her progress.
 *
 * `./ledger.ts` owns every rule and takes its storage as an argument, so it
 * can be tested under `node --test`. This module is the one place that hands
 * it the real browser: `localStorage` as the store, and one call to
 * `navigator.storage.persist()`, which asks the browser not to evict the
 * origin's storage when disk runs low (spec, "Modules", 1). Every page calls
 * `openLedger()` once and keeps the ledger it gets. The ledger looks at
 * storage again before every read and change, so a second tab, or this page
 * coming back from the back/forward cache, never writes old facts over new.
 *
 * WHY THE BROWSER IS AN ARGUMENT. `openLedger(win)` takes anything shaped
 * like a window, defaulting to the real one, so `browser.test.ts` can hand it
 * a fake with a counting `persist()` or a `localStorage` that throws. The
 * default argument is read lazily, so importing this module in Node (where
 * `window` does not exist) is fine; only calling it with no argument needs
 * a browser.
 *
 * A BLOCKED BROWSER STILL GETS A HUB. Reading `window.localStorage` itself
 * throws a SecurityError in some locked-down profiles, and `setItem` throws
 * when the quota is full. Either way she gets a working hub whose progress
 * lives only in memory for that visit, because a hub that will not open is
 * worse than a hub that forgets (same stance as the ledger's "a bad read is
 * an empty start"). `persist()` is asked once per `navigator.storage` object
 * — in practice once per page load — and never awaited: its answer changes
 * nothing we do.
 *
 * THE WELCOME FLAG RIDES ALONG (#195). `openWelcome()` hands the same
 * guarded `localStorage` to `./welcome.ts`, so the welcome screen's "seen"
 * flag meets the browser in this one place too. It is a separate key, not
 * the ledger's, and the two never read each other.
 */
import { createLedger, type KeyValueStore, type Ledger } from "./ledger.ts";
import { createWelcome, type Welcome } from "./welcome.ts";
import { createEffectsPreference, type EffectsPreference } from "./effects.ts";
import { createMusicPreference, type MusicPreference } from "./music.ts";

/** What this module reads off `window`. Any of it may be missing or throw. */
export type BrowserLike = {
  readonly localStorage?: KeyValueStore;
  readonly navigator?: { storage?: { persist?: () => Promise<boolean> } };
};

/** The `navigator.storage` objects already asked to persist. */
const persistAsked = new WeakSet<object>();

/** Her ledger on this browser. Call it once per page and keep the result. */
export function openLedger(win: BrowserLike = window): Ledger {
  askToPersist(win);
  return createLedger(storageOf(win));
}

/** The welcome screen's "seen" flag on this browser (#195). */
export function openWelcome(win: BrowserLike = window): Welcome {
  return createWelcome(storageOf(win));
}

/** Her "Efektler: Açık/Kapalı" switch on this browser: UI state, its own key. */
export function openEffectsPreference(win: BrowserLike = window): EffectsPreference {
  return createEffectsPreference(storageOf(win));
}

/** Her "Müzik: Açık/Kapalı" switch on this browser: UI state, its own key. */
export function openMusicPreference(win: BrowserLike = window): MusicPreference {
  return createMusicPreference(storageOf(win));
}

function askToPersist(win: BrowserLike) {
  const storage = win.navigator?.storage;
  if (!storage || typeof storage.persist !== "function" || persistAsked.has(storage)) return;
  persistAsked.add(storage);
  storage.persist().catch(() => {
    // A refusal, or a browser that throws here, changes nothing we do.
  });
}

/** `localStorage` when the browser allows it; a memory-only store when not. */
function storageOf(win: BrowserLike): KeyValueStore {
  let real: KeyValueStore | undefined;
  try {
    real = win.localStorage;
  } catch {
    real = undefined;
  }
  if (!real) return memoryStore();
  const store = real;
  return {
    getItem: (key) => store.getItem(key),
    setItem: (key, value) => {
      try {
        store.setItem(key, value);
      } catch {
        // Quota full or storage blocked mid-visit: she keeps playing, and
        // this visit's progress lives in the ledger's memory only.
      }
    },
  };
}

function memoryStore(): KeyValueStore {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  };
}
