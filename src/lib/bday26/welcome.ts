/**
 * The welcome screen's "seen" flag (/20261209/, spec #192 stories 1–3,
 * built on #195; the text and the once-only rule were decided on #191, the
 * evening grilling).
 *
 * WHAT IT ANSWERS. One question the hub asks on every load — should the
 * welcome screen open by itself? — and one fact the hub reports when she
 * closes it. The first visit shows it; from then on the "Hoş geldin" button
 * on the hub is the only way it opens. No date lock: the first visit is the
 * first visit, whenever it happens (#191).
 *
 * IT IS NOT PROGRESS. The flag is UI state, so it lives in its own
 * `localStorage` key, `bday26:welcome`, never inside the progress state
 * (`bday26:v1`, the ledger's) and so never inside the Save code (#196).
 * Two things follow and are wanted: restoring her Save code on a new device
 * shows the welcome there once more, and clearing the flag can never touch a
 * Best score or a Gift. The ledger's header says the same from its side.
 *
 * STORAGE IS INJECTED, as for the ledger: `createWelcome(store)` takes
 * anything with `getItem`/`setItem` — `localStorage` in the browser (handed
 * over by `openWelcome()` in `./browser.ts`), a Map in `welcome.test.ts` —
 * so the rule runs under `node --test` with no DOM. A store that throws is
 * treated the kind way: she sees the welcome, and marking it seen fails
 * silently, so a locked-down browser greets her on every visit rather than
 * never.
 */
import type { KeyValueStore } from "./ledger.ts";

/** The `localStorage` key of the flag. Not the ledger's, by design. */
export const WELCOME_KEY = "bday26:welcome";

/** The one value the key holds once she has seen the screen. */
const SEEN = "seen";

export type Welcome = {
  /** True until she has closed the welcome screen once on this browser. */
  shouldShow(): boolean;
  /** She closed it: from now on only the hub's button opens it. */
  markSeen(): void;
};

export function createWelcome(store: KeyValueStore): Welcome {
  return {
    shouldShow() {
      try {
        return store.getItem(WELCOME_KEY) !== SEEN;
      } catch {
        return true; // A storage she cannot read: greet her, as on a first visit.
      }
    },
    markSeen() {
      try {
        store.setItem(WELCOME_KEY, SEEN);
      } catch {
        // Quota full or storage blocked: the welcome comes back next visit.
      }
    },
  };
}
