/**
 * The stored side of her two on/off switches, "Efektler" and "Müzik" (review
 * M5): one type and one factory that `./effects.ts` and `./music.ts` both
 * build on, each with its own `localStorage` key. Pure, pinned through those
 * two modules' tests. The buttons that show and flip a switch are
 * `./switch-dom.ts`.
 */
import type { KeyValueStore } from "./ledger.ts";

/** One on/off switch she flips: on by default. */
export type SwitchPreference = {
  readonly on: boolean;
  /** Flip; returns the new state. */
  toggle(): boolean;
};

/** An on/off switch kept under `key` ("on"/"off", missing means on): the
 *  effects' and the music's. A storage that throws leaves it on, and a flip
 *  then lasts the visit. */
export function createSwitchPreference(store: KeyValueStore, key: string): SwitchPreference {
  let on = true;
  try {
    on = store.getItem(key) !== "off";
  } catch {
    // Storage blocked: the switch stays on, the default.
  }
  return {
    get on() {
      return on;
    },
    toggle() {
      on = !on;
      try {
        store.setItem(key, on ? "on" : "off");
      } catch {
        // Quota full or blocked: the switch holds for this visit only.
      }
      return on;
    },
  };
}
