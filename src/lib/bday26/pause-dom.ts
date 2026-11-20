/**
 * Her pause in a real-time Game (review L1): the one rule that
 * `PauseOverlay.astro` announces, written once. Kayak macerası and
 * Hollanda'da sürüş use it; the piano (piyano) can adopt it next.
 *
 * THE RULE. P pauses and P resumes (Ctrl/Alt/Meta+P and a held P's repeats
 * are left alone). A lost window focus pauses too, and so does a hidden tab
 * (`visibilitychange`); neither resumes by itself when she comes back: only
 * P does, so a skier never returns to a slope already moving into the next
 * rock. With no Round running (`canPause()` false) nothing pauses, though a
 * lost focus still lets go of the held keys. While paused: the overlay
 * shows, the held keys are let go, the frame loop and every effect loop
 * stop, and the music holds (reason "pause"); resuming undoes each.
 *
 * THE INTERFACE, for the next page that adopts it:
 *
 *     const pause = createPause({
 *       canPause: () => mode !== "idle",            // a Round is running
 *       loop,                                       // { start(), stop() }, e.g. ./frame-loop.ts
 *       keys,                                       // the page's held keys: { clear() }
 *       effects, music,                             // from ./effects-dom.ts and ./music-dom.ts
 *     });
 *     // the loop's canRun asks `!pause.paused`; a new or abandoned Round calls
 *     // `pause.clear()`; the page's own key handler ignores KeyP and skips
 *     // input while `pause.paused`.
 *
 * `overlay` defaults to the page's `[data-pause-overlay]`; `win` and `doc`
 * default to `window` and `document` and are there so `pause-dom.test.ts`
 * can run it under `node --test` with plain `EventTarget`s. The listeners
 * live as long as the page; call it once.
 */

export type Pause = {
  /** Her pause is on. A page's frame loop asks this in its `canRun`. */
  readonly paused: boolean;
  /** Pause (true) or resume (false). Nothing when `canPause()` says no
   *  Round is running, or when it is already so. */
  set(on: boolean): void;
  /** What P does: pause, or resume. */
  toggle(): void;
  /** A Round starts or is abandoned: lift the pause quietly — overlay
   *  hidden, music released, held keys let go — and leave the loop to the
   *  page, which starts it when its Round is ready. */
  clear(): void;
};

export type PauseOptions = {
  /** Is a Round running, so there is something to pause? */
  canPause: () => boolean;
  /** The world's frame loop: stopped while paused, started on resume. */
  loop: { start(): void; stop(): void };
  /** The keys she holds down: let go on pause, resume and a lost focus. */
  keys: { clear(): void };
  /** The effects (`./effects-dom.ts`): every loop stops while paused. */
  effects: { stopLoops(): void };
  /** The music (`./music-dom.ts`): held, reason "pause", while paused. */
  music: { hold(reason: string): void; release(reason: string): void };
  /** The element to show while paused. Default: `[data-pause-overlay]`. */
  overlay?: { hidden: boolean };
  /** Where keys and blur arrive. Default: `window`. */
  win?: EventTarget;
  /** Where `visibilitychange` arrives, with `hidden`. Default: `document`. */
  doc?: EventTarget & { readonly hidden: boolean };
};

/** The music hold this pause owns. */
const HOLD = "pause";

export function createPause(options: PauseOptions): Pause {
  const { canPause, loop, keys, effects, music } = options;
  const win = options.win ?? window;
  const doc = options.doc ?? document;
  const overlay = options.overlay ?? document.querySelector<HTMLElement>("[data-pause-overlay]") ?? { hidden: true };
  let paused = false;

  const pause: Pause = {
    get paused() {
      return paused;
    },
    set(on) {
      if (!canPause() || on === paused) return;
      paused = on;
      overlay.hidden = !on;
      keys.clear();
      if (on) {
        loop.stop();
        effects.stopLoops();
        music.hold(HOLD);
      } else {
        music.release(HOLD);
        loop.start();
      }
    },
    toggle() {
      pause.set(!paused);
    },
    clear() {
      paused = false;
      overlay.hidden = true;
      keys.clear();
      music.release(HOLD);
    },
  };

  win.addEventListener("keydown", (event) => {
    const e = event as KeyboardEvent;
    if (e.code !== "KeyP" || e.altKey || e.ctrlKey || e.metaKey || e.repeat) return;
    pause.toggle();
  });
  /** She looked away: let go of every key, and pause a running Round. */
  const away = () => {
    keys.clear();
    pause.set(true);
  };
  win.addEventListener("blur", away);
  doc.addEventListener("visibilitychange", () => {
    if (doc.hidden) away();
  });

  return pause;
}
