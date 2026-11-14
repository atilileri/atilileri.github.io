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
 *      middle, Best score + target right), the confirm-leave card and the
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
 *      say "Jackpot!" itself. The start screen still shows once; Esc during
 *      play still asks.
 *
 *   5. Extra result content. `detail` is one line under the score ("15
 *      hamle", "Senin rotan 9,2 km · en kısa 8,8 km"). A Game that wants
 *      more (framing's 5 thumbnails, #203) puts it in `<div slot="result">`
 *      and fills it before calling `finish`; the card shows the slot.
 *
 * WHAT THE SCREENS SAY (Turkish only; wording from the hiking prototype's
 * cards, verdict on #183, and the hub's tiles, #193):
 *   - Start: name, rule, keys, "Başla · Enter", "Salona dön · Esc", her Best
 *     score and the Small prize line ("Küçük ödül: X · %95 yapınca senin" /
 *     "Kazandın!"). Esc here leaves at once; no Round is running.
 *   - Confirm (Esc during a Round): "Turdan çıkılsın mı?" / "Yarım bırakılan
 *     tur skor vermez." / "Devam et · Esc", "Çık · Enter" (stories 35–36).
 *   - Result: "Tur bitti", the score as %N, `detail`, "Rekor %N" (with "Yeni
 *     rekor!" when this Round raised it), "Hedef %95" (with "Küçük ödül
 *     kazandın: X!" the one time it is won), "Yeni tur · Enter", "Salona dön
 *     · Esc" (stories 33–34).
 *
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
 * component is not.
 */
import { gameById, PRIZE_BAR, type GameId } from "./catalogue.ts";
import type { Ledger, RoundOutcome } from "./ledger.ts";

/** The hub, where "Salona dön" goes. */
export const HUB_URL = "/20261209/";

export type ShellPhase = "start" | "playing" | "confirm" | "result";

/** What the result card shows for one finished Round. */
export type RoundResult = RoundOutcome & {
  /** The Round's score, 0..100, as the Game handed it in. */
  score: number;
  /** One line under the score, the Game's own words. */
  detail?: string;
};

/** What she sees: the one screen the shell shows now. */
export type ShellScreen = {
  phase: ShellPhase;
  /** Her Best score in this Game as the ledger has it now; undefined = never played. */
  best: number | undefined;
  /** Whether the Small prize is won, as of now. */
  prizeWon: boolean;
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
  const { game, ledger, hooks, view, leave, resultScreen = true } = options;
  let phase: ShellPhase = "start";

  function show(result?: RoundResult) {
    view({ phase, best: ledger.bestOf(game), prizeWon: ledger.prizeWon(game), result });
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
      const outcome = ledger.recordRound(game, score, { jackpot: extra?.jackpot });
      if (resultScreen) {
        phase = "result";
        show({ ...outcome, score, detail: extra?.detail });
      } else {
        shell.start();
      }
      return outcome;
    },
    askLeave() {
      if (phase !== "playing") return;
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
      }
      return true;
    },
  };

  show();
  return shell;
}
