/**
 * The Game shell (/20261209/<game>/, spec #192 "Modules" 4, built on #194):
 * the screens around a Round that every Game shares, and the one call to the
 * ledger that a finished Round makes. A Game page owns its playfield and its
 * rules; the shell owns the start screen, the HUD frame, the confirm-leave
 * question, the result screen, Enter and Esc, and `recordRound`.
 *
 * HOW A GAME USES IT (the whole interface; the Memory match page,
 * `src/pages/20261209/hafiza/index.astro`, is the worked example):
 *
 *   1. Markup. Wrap the playfield in `<GameShell game="hafiza" keys={[...]}>`
 *      (`src/components/bday26/GameShell.astro`). The component draws the
 *      start screen (Game name, one-line rule, the `keys` legend, "Başla
 *      Enter"), the HUD bar (name left, your `<span slot="hud">` in the
 *      middle, Best score + the 95% bar right), the confirm-leave card and the
 *      result card, all from the catalogue. Your playfield is the default
 *      slot and fills the rest of the 1920×1080 screen.
 *
 *   2. Script. In the page's `<script>`:
 *        const ledger = openLedger();
 *        const shell = mountGameShell({ game: "hafiza", ledger, hooks: {
 *          startRound() { … reset, deal, paint … },   // required
 *          abandonRound() { … stop timers/loops … },  // optional
 *          pause() { … }, resume() { … },             // optional, real-time Games
 *        } });
 *      and when the Round is over:
 *        shell.finish(memoryScore(board.moves), { detail: `${board.moves} hamle` });
 *      `finish` clamps nothing: hand it the score function's 0..100.
 *
 *   3. Keys. The shell listens on `window` in the capture phase. During a
 *      Round it takes ONLY Escape; every other key reaches your handlers
 *      untouched, so Enter and Space are yours to use. On its own screens
 *      (start, confirm, result) it takes every key, so your handlers never
 *      see a key that was meant for a screen — you need no phase checks for
 *      keys. Clicks on the playfield are impossible on those screens too:
 *      the overlays cover it. Timers you left running (a 1 s flip-back) are
 *      harmless; a real-time loop should stop in `pause` and `abandonRound`.
 *
 *   4. The slot machine (#200) skips the result screen (spec story 54):
 *      pass `resultScreen: false`. Then `finish(score, { jackpot })` records
 *      the Round, calls `startRound` again at once and returns the ledger's
 *      `RoundOutcome` (Best score, improved, prizeWonNow) so the machine can
 *      say "Jackpot!" itself. It also passes `startScreen: false` (here and
 *      as the component's prop): the page opens on the machine, ready, the
 *      first Round already begun, so Space or the lever spins on the first
 *      press. Its "playing" phase is mostly a machine waiting for her, and
 *      one spin is one Round, so it also passes `roundInProgress: () =>
 *      spinning`: Esc between spins leaves at once, and asks only while the
 *      reels turn. Every other Game keeps its start screen.
 *
 *   5. Extra result content. `detail` is one line under the score ("15
 *      hamle", "Senin rotan 9,2 km · en kısa 8,8 km"). A Game that wants
 *      more (framing's 5 thumbnails, #203) puts it in `<div slot="result">`
 *      and fills it before calling `finish`; the card shows the slot.
 *
 *   6. A choice before the Round (the piano's song, #205). Markup in
 *      `<div slot="start">` shows on the start card above "Başla"; the
 *      `screenKey(key)` hook gets every key on the start and result
 *      screens except Enter and Esc, so 1 2 3 can pick a song there and
 *      Enter still starts. Clicks on that markup are the Game's own.
 *
 * WHAT THE SCREENS SAY (Turkish only; wording from the hiking prototype's
 * cards, verdict on #183, and the hub's tiles, #193):
 *   - Start: name, rule, keys, "Başla · Enter", "Salona dön · Esc", her Best
 *     score, the Small prize line ("Küçük ödül: X · %95 yapınca senin" /
 *     "Kazandın!", `prizeHowOf`) and, until the prize is won, what %95 means
 *     in this Game ("%95 için en fazla 15 hamle", `prizeHintOf` in
 *     `./prize-hints.ts`). Esc here leaves at once; no Round is running.
 *   - Confirm (Esc during a Round): "Turdan çıkılsın mı?" / "Yarım bırakılan
 *     tur skor vermez." / "Devam et · Esc", "Çık · Enter" (stories 35–36).
 *   - Result: "Tur bitti", the score as %N, `detail`, the Points line ("+8
 *     puan · toplam 510" after a raise that earned Points, "Rekorun %88 ·
 *     puanın değişmedi" otherwise, "Bu oyun puan vermez" in a Prize Game),
 *     "Rekor %N" (with "İlk rekorun!" on a first Round or "Yeni rekor!" on a
 *     raise, both only from %20 up, `CHEER_FROM`), "Hedef %95" (with "Küçük
 *     ödül kazandın: X!" the one time it is won), the prize hint again while
 *     the prize is still to win, "Yeni tur · Enter", "Salona dön · Esc"
 *     (stories 33–34).
 *   - The Small prize celebration: the result card that wins it celebrates,
 *     and in a Prize Game every Round at %95 or more does, won before or not
 *     (`RoundResult.celebrate`). A Game page adds no celebration of its own
 *     for the prize.

 * WHAT REACHES THE LEDGER. Exactly one `recordRound(game, score, {jackpot})`
 * per finished Round, from `finish`, and nothing from a Round she leaves:
 * `leaveRound` calls your `abandonRound` and goes to the hub (story 36).
 * `finish` outside a Round (twice in a row, or on a screen) is ignored and
 * returns undefined. The hub reads the same ledger, so her tile, Points and
 * Small prize are right the moment she is back.
 *
 * TWO LAYERS, ONE FILE. `createGameShell` is the controller: the phase
 * machine, with the view and the hub link injected, so `shell.test.ts` runs
 * it under `node --test` with the real ledger on a memory store.
 * `mountGameShell` is the browser binding: it finds the component's elements
 * by their `data-shell-*` attributes, paints them from the screen the
 * controller emits, and feeds it keys and clicks. Games call the second; the
 * first is for the tests and for anyone who needs the shell somewhere the
 * component is not. The controller's `onPhase` hook, and the result's
 * `celebrate`, reach the component's own script through `setShellFrame`:
 * that script stops effect loops on every screen, holds the music while the
 * leave confirm asks, and plays the Small prize celebration.
 */
import { gameById, isPrizeGame, PRIZE_BAR, type GameId } from "./catalogue.ts";
import { PRIZE_LOCKED_ICON, PRIZE_WON_ICON } from "./icons.ts";
import type { Ledger, RoundOutcome } from "./ledger.ts";
import { prizeHintOf, prizeHowOf } from "./prize-hints.ts";
import { one } from "./dom.ts";
import { formatPoints, formatScore } from "./format.ts";

/** The hub, where "Salona dön" goes. */
export const HUB_URL = "/20261209/";

/** A raised Best score is cheered only from here up: "Yeni rekor!" over a
 *  5% Round would only mock her (review D6). */
export const CHEER_FROM = 20;

export type ShellPhase = "start" | "playing" | "confirm" | "result";

/** What the result card shows for one finished Round. `improved` is the
 *  ledger's (any raise counts); the card cheers through `bestFlash`. */
export type RoundResult = RoundOutcome & {
  /** The Round's score, 0..100, as the Game handed it in. */
  score: number;
  /** One line under the score, the Game's own words. */
  detail?: string;
  /** The flash under the Best score: "İlk rekorun!" for a first Round, "Yeni
   *  rekor!" for a raised one, and nothing when the new Best is under
   *  `CHEER_FROM` or nothing was raised. */
  bestFlash?: "Yeni rekor!" | "İlk rekorun!";
  /** What the Round did to her Points: "+8 puan · toplam 510" after a raise
   *  that earned some, "Rekorun %88 · puanın değişmedi" otherwise, "Bu oyun
   *  puan vermez" in a Prize Game. Undefined for the slot machine. */
  pointsLine?: string;
  /** The card celebrates the Small prize: on the Round that wins it, and in
   *  a Prize Game on every Round at the bar, since the prize is its point. */
  celebrate: boolean;
};

/** What she sees: the one screen the shell shows now. */
export type ShellScreen = {
  phase: ShellPhase;
  /** Her Best score in this Game as the ledger has it now; undefined = never played. */
  best: number | undefined;
  /** Whether the Small prize is won, as of now. */
  prizeWon: boolean;
  /** What %95 means in this Game (`prizeHintOf`), while the Small prize is
   *  still to win; undefined once won, and always for the slot machine. */
  prizeHint?: string;
  /** Only on the result screen. */
  result?: RoundResult;
};

/** What a Game gives the shell. Only `startRound` is required. */
export type GameHooks = {
  /** A Round begins: reset, deal, paint. Called on Enter at the start screen
   *  and on "Yeni tur"; for the slot machine, after every finish too. */
  startRound(): void;
  /** She confirmed leaving mid-Round: stop timers and loops. Not scored. */
  abandonRound?(): void;
  /** The confirm-leave card opened over the Round: real-time Games freeze. */
  pause?(): void;
  /** The card closed and the Round goes on. */
  resume?(): void;
  /** Is there a Round to lose right now? Esc during play asks only when this
   *  says true (default: always). The slot machine (#200) says false between
   *  spins, where nothing is half done, so Esc leaves at once. */
  roundInProgress?(): boolean;
  /** A key on the start or result screen other than Enter and Esc (the
   *  piano's song choice, #205). The key stays the screen's: the Game's own
   *  listeners never see it. */
  screenKey?(key: string): void;
};

export type ShellOptions = {
  game: GameId;
  ledger: Ledger;
  hooks: GameHooks;
  /** Paints a screen. The browser binding supplies one; tests record it. */
  view: (screen: ShellScreen) => void;
  /** Goes back to the hub. */
  leave: () => void;
  /** false: no result screen, the next Round starts right after `finish`
   *  (the slot machine). Default true. */
  resultScreen?: boolean;
  /** false: no start screen, the first Round starts at once (the slot
   *  machine, story 54). Default true. */
  startScreen?: boolean;
  /** Told every phase the shell shows, right after `view` paints it — every
   *  time, so the slot machine's next Round repeats "playing". The frame
   *  around the Round uses it to quiet effects and hold music. */
  onPhase?: (phase: ShellPhase) => void;
};

export type GameShell = {
  readonly phase: ShellPhase;
  /** Begin a Round (Enter on the start or result screen). */
  start(): void;
  /** The Round is over with this score. Records it once; shows the result,
   *  or, with `resultScreen: false`, starts the next Round. Ignored outside
   *  a Round. */
  finish(score: number, extra?: { detail?: string; jackpot?: boolean }): RoundOutcome | undefined;
  /** Esc during a Round: ask. */
  askLeave(): void;
  /** Esc on the question: go on with the Round. */
  stay(): void;
  /** Enter on the question: abandon the Round, go to the hub. Not scored. */
  leaveRound(): void;
  /** Esc on the start or result screen: go to the hub. */
  leave(): void;
  /** Route one key by its `KeyboardEvent.key`. True when the shell took it
   *  (the Game must ignore it); false when it is the Game's. */
  key(key: string): boolean;
};

export function createGameShell(options: ShellOptions): GameShell {
  const { game, ledger, hooks, view, leave, resultScreen = true, startScreen = true, onPhase } = options;
  const prizeGame = isPrizeGame(gameById(game));
  const hint = prizeHintOf(game);
  let phase: ShellPhase = "start";

  function show(result?: RoundResult) {
    const prizeWon = ledger.prizeWon(game);
    view({ phase, best: ledger.bestOf(game), prizeWon, prizeHint: prizeWon ? undefined : hint, result });
    onPhase?.(phase);
  }

  /** The result card's lines for a Round the ledger just recorded. */
  function resultOf(score: number, outcome: RoundOutcome, first: boolean, pointsBefore: number, detail?: string): RoundResult {
    const cheered = outcome.improved && outcome.best >= CHEER_FROM;
    const bestFlash = !cheered ? undefined : first ? "İlk rekorun!" : "Yeni rekor!";
    const gained = ledger.pointsOf(game) - pointsBefore;
    const pointsLine = prizeGame
      ? "Bu oyun puan vermez"
      : gained > 0
        ? `+${gained} puan · toplam ${formatPoints(ledger.earned())}`
        : `Rekorun ${formatScore(outcome.best)} · puanın değişmedi`;
    const celebrate = outcome.prizeWonNow || (prizeGame && score >= PRIZE_BAR);
    return { ...outcome, score, detail, bestFlash, pointsLine, celebrate };
  }

  const shell: GameShell = {
    get phase() {
      return phase;
    },
    start() {
      phase = "playing";
      show();
      hooks.startRound();
    },
    finish(score, extra) {
      if (phase !== "playing") return undefined;
      const first = ledger.bestOf(game) == null;
      const pointsBefore = ledger.pointsOf(game);
      const outcome = ledger.recordRound(game, score, { jackpot: extra?.jackpot });
      if (resultScreen) {
        phase = "result";
        show(resultOf(score, outcome, first, pointsBefore, extra?.detail));
      } else {
        shell.start();
      }
      return outcome;
    },
    askLeave() {
      if (phase !== "playing") return;
      if (hooks.roundInProgress?.() === false) {
        leave();
        return;
      }
      phase = "confirm";
      show();
      hooks.pause?.();
    },
    stay() {
      if (phase !== "confirm") return;
      phase = "playing";
      show();
      hooks.resume?.();
    },
    leaveRound() {
      if (phase !== "confirm") return;
      phase = "start";
      hooks.abandonRound?.();
      leave();
    },
    leave() {
      leave();
    },
    key(key) {
      if (phase === "playing") {
        if (key !== "Escape") return false;
        shell.askLeave();
        return true;
      }
      // On a screen every key is the shell's, so the Game sees none of them.
      if (key === "Enter") {
        if (phase === "confirm") shell.leaveRound();
        else shell.start();
      } else if (key === "Escape") {
        if (phase === "confirm") shell.stay();
        else shell.leave();
      } else if (phase === "start" || phase === "result") {
        hooks.screenKey?.(key);
      }
      return true;
    },
  };

  if (startScreen) show();
  else shell.start();
  return shell;
}

// ------------------------------------------------------ the browser binding

/**
 * The frame around the Round: what `GameShell.astro`'s own script does with
 * effects and music, which this file cannot import (they touch `window` at
 * load, and the controller runs under `node --test`). The component's script
 * hands it over once with `setShellFrame`; `mountGameShell` then tells it
 * every phase and every celebration. A frame set after the shell mounted
 * hears the current phase at once.
 */
export type ShellFrame = {
  /** Every phase the shell shows (see `ShellOptions.onPhase`). */
  onPhase?(phase: ShellPhase): void;
  /** A result card that celebrates the Small prize (`RoundResult.celebrate`). */
  celebrate?(): void;
};

let frame: ShellFrame | undefined;
let mounted: GameShell | undefined;

/** `GameShell.astro`'s script, once per page: its effects and music hooks. */
export function setShellFrame(next: ShellFrame) {
  frame = next;
  if (mounted) next.onPhase?.(mounted.phase);
}

export type MountOptions = {
  game: GameId;
  ledger: Ledger;
  hooks: GameHooks;
  /** See `ShellOptions.resultScreen`. */
  resultScreen?: boolean;
  /** See `ShellOptions.startScreen`. Pass the same to `GameShell.astro`'s
   *  `startScreen` prop, so the static page shows no start card either. */
  startScreen?: boolean;
  /** Where `GameShell.astro` rendered. Default: the document. */
  root?: ParentNode;
  /** Default: navigate to the hub. */
  leave?: () => void;
};

/**
 * Binds the controller to the markup of `GameShell.astro` (found by its
 * `data-shell-*` attributes), paints every screen from the ledger, and
 * routes her keys and clicks. Call it once per page and keep the result.
 */
export function mountGameShell(options: MountOptions): GameShell {
  const root = options.root ?? document;
  const main = one("[data-shell]", root);
  const screens = Array.from(root.querySelectorAll<HTMLElement>("[data-shell-screen]"));
  const playfield = one("[data-shell-playfield]", root);
  const { prize } = gameById(options.game);
  const prizeHow = prizeHowOf(options.game);

  const fill = (selector: string, text: string) => {
    for (const el of root.querySelectorAll<HTMLElement>(selector)) el.textContent = text;
  };
  /** One optional line of the result card: its text, or hidden. */
  const line = (selector: string, text: string | undefined) => {
    const el = one(selector, root);
    el.textContent = text ?? "";
    el.hidden = !text;
  };

  function paint(screen: ShellScreen) {
    main.dataset.shellPhase = screen.phase;
    // The playfield takes no clicks or focus while a screen is over it.
    playfield.inert = screen.phase !== "playing";

    fill("[data-shell-best]", screen.best == null ? "—" : formatScore(screen.best));
    fill("[data-shell-prize-icon]", screen.prizeWon ? PRIZE_WON_ICON : PRIZE_LOCKED_ICON);
    fill("[data-shell-prize-sub]", screen.prizeWon ? "Kazandın!" : prizeHow);
    for (const el of root.querySelectorAll<HTMLElement>("[data-shell-hint]")) {
      el.textContent = screen.prizeHint ?? "";
      el.hidden = !screen.prizeHint;
    }

    const r = screen.result;
    if (r) {
      fill("[data-shell-score]", formatScore(r.score));
      line("[data-shell-detail]", r.detail);
      line("[data-shell-points]", r.pointsLine);
      line("[data-shell-best-flash]", r.bestFlash);
      line("[data-shell-prize-now]", r.prizeWonNow ? `Küçük ödül kazandın: ${prize.name}!` : undefined);
      if (r.celebrate) frame?.celebrate?.();
    }

    let shown: HTMLElement | undefined;
    for (const s of screens) {
      s.hidden = s.dataset.shellScreen !== screen.phase;
      if (!s.hidden) shown = s;
    }
    // Focus the screen itself, away from any button, so Enter is the
    // shell's alone and no button fires a second time.
    shown?.focus({ preventScroll: true });
  }

  const shell = createGameShell({
    game: options.game,
    ledger: options.ledger,
    hooks: options.hooks,
    resultScreen: options.resultScreen,
    startScreen: options.startScreen,
    view: paint,
    leave: options.leave ?? (() => window.location.assign(HUB_URL)),
    onPhase: (phase) => frame?.onPhase?.(phase),
  });
  mounted = shell;

  // Keys: capture phase on window, so a key the shell takes never reaches a
  // Game's own listener. Browser shortcuts (Ctrl/Alt/Meta) are left alone.
  window.addEventListener(
    "keydown",
    (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.repeat && shell.phase !== "playing") {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      if (shell.key(event.key)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    { capture: true },
  );

  // Clicks: one listener, the buttons name their action.
  const actions: Record<string, () => void> = {
    start: () => shell.start(),
    leave: () => shell.leave(),
    stay: () => shell.stay(),
    "leave-round": () => shell.leaveRound(),
    // The HUD's "✕ Çık": exactly what Esc does, whatever the phase.
    escape: () => void shell.key("Escape"),
  };
  // A HUD button never takes focus from the Game, so Enter and the Game's
  // keys stay where they were.
  main.addEventListener("mousedown", (event) => {
    if ((event.target as Element).closest(".hud [data-shell-action]")) event.preventDefault();
  });
  main.addEventListener("click", (event) => {
    const button = (event.target as Element).closest<HTMLElement>("[data-shell-action]");
    const action = button?.dataset.shellAction;
    if (action && actions[action]) actions[action]();
  });

  return shell;
}
