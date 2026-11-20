/*
 * Tests for the Game shell: the screens around a Round, and what reaches the
 * ledger.
 *
 *   node --test src/lib/bday26/shell.test.ts
 *
 * Seam 1 of the spec (#192, "Testing Decisions"): the shell's controller is a
 * plain module; the DOM binding in the same file is exercised by the
 * Playwright smoke instead. Here a Game is a few hooks that note when they
 * run, the view is a recorder of the last screen she would see, and the
 * ledger is the real one on a memory store. Each test presses the keys she
 * would press and reads two things: which screen is showing, with what on it,
 * and what the ledger says her Best score is afterwards.
 *
 * What the spec pins (#194, stories 33–36): Enter starts a Round; a finished
 * Round shows score, Best score and the 95% bar, and is recorded once;
 * Enter on the result is a new Round, Esc is the hub; Esc during a Round asks
 * first, and a Round she leaves scores nothing; the slot machine has no
 * result screen.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createGameShell, type GameHooks, type ShellScreen } from "./shell.ts";
import { createLedger, type KeyValueStore, type Ledger } from "./ledger.ts";
import type { GameId } from "./catalogue.ts";

function memoryStore(): KeyValueStore {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  };
}

/** A Game page, as the shell sees it: hooks that count, a view that records,
 *  a hub link that counts. */
function openGame(game: GameId = "hafiza", ledger: Ledger = createLedger(memoryStore()), resultScreen = true) {
  const ran = { startRound: 0, abandonRound: 0, pause: 0, resume: 0 };
  const hooks: GameHooks = {
    startRound: () => void (ran.startRound += 1),
    abandonRound: () => void (ran.abandonRound += 1),
    pause: () => void (ran.pause += 1),
    resume: () => void (ran.resume += 1),
  };
  let screen: ShellScreen | undefined;
  let left = 0;
  const shell = createGameShell({
    game,
    ledger,
    hooks,
    resultScreen,
    view: (s) => void (screen = s),
    leave: () => void (left += 1),
  });
  return {
    shell,
    ledger,
    ran,
    /** The screen she sees now. */
    get screen() {
      if (!screen) throw new Error("nothing shown yet");
      return screen;
    },
    get left() {
      return left;
    },
  };
}

// ------------------------------------------------------------ start screen

test("a Game opens on its start screen with her Best score; a fresh browser has none", () => {
  const ledger = createLedger(memoryStore());
  ledger.recordRound("hafiza", 60);
  const played = openGame("hafiza", ledger);
  assert.equal(played.screen.phase, "start");
  assert.equal(played.screen.best, 60);

  const fresh = openGame();
  assert.equal(fresh.screen.phase, "start");
  assert.equal(fresh.screen.best, undefined);
  assert.equal(fresh.ran.startRound, 0, "no Round runs until she starts one");
});

test("Enter on the start screen begins a Round; Esc there goes straight to the hub", () => {
  const g = openGame();
  assert.equal(g.shell.key("Enter"), true);
  assert.equal(g.screen.phase, "playing");
  assert.equal(g.ran.startRound, 1);

  const h = openGame();
  assert.equal(h.shell.key("Escape"), true);
  assert.equal(h.left, 1);
  assert.equal(h.ran.startRound, 0);
});

// ------------------------------------------------------------ result screen

test("a finished Round shows its score, the Best score and the 95% bar, and the ledger has it", () => {
  const g = openGame();
  g.shell.key("Enter");
  g.shell.finish(90, { detail: "16 hamle" });
  assert.equal(g.screen.phase, "result");
  assert.equal(g.screen.result?.score, 90);
  assert.equal(g.screen.result?.best, 90);
  assert.equal(g.screen.result?.improved, true);
  assert.equal(g.screen.result?.prizeWonNow, false);
  assert.equal(g.screen.result?.detail, "16 hamle");
  assert.equal(g.screen.prizeWon, false);
  assert.equal(g.ledger.bestOf("hafiza"), 90);
});

test("a Round that reaches 95 wins the Small prize right there, once", () => {
  const g = openGame();
  g.shell.key("Enter");
  g.shell.finish(95);
  assert.equal(g.screen.result?.prizeWonNow, true);
  assert.equal(g.screen.prizeWon, true);
  assert.equal(g.ledger.prizeWon("hafiza"), true);

  g.shell.key("Enter");
  g.shell.finish(100);
  assert.equal(g.screen.result?.improved, true, "100 is a new Best score");
  assert.equal(g.screen.result?.prizeWonNow, false, "but the prize was already won");
});

test("a lower Round keeps the old Best score, and the result says it was not improved", () => {
  const g = openGame();
  g.shell.key("Enter");
  g.shell.finish(80);
  g.shell.key("Enter");
  g.shell.finish(60);
  assert.equal(g.screen.result?.score, 60);
  assert.equal(g.screen.result?.best, 80);
  assert.equal(g.screen.result?.improved, false);
  assert.equal(g.screen.result?.bestFlash, undefined, "no flash for a lower Round");
  assert.equal(g.ledger.bestOf("hafiza"), 80);
});

test("a first-ever 0 is kept as the Best score, but the result does not cheer it", () => {
  const g = openGame();
  g.shell.key("Enter");
  g.shell.finish(0);
  assert.equal(g.screen.result?.bestFlash, undefined, "no flash for %0");
  assert.equal(g.ledger.bestOf("hafiza"), 0);
});

// --------------------------------------------- the Best score flash (D6)
// "Yeni rekor!" only when the new Best is 20 or more; a first Round says
// "İlk rekorun!" instead, and nothing below 20.

test("a first Round below 20 gets no flash; at 20 or more it says İlk rekorun!", () => {
  const low = openGame();
  low.shell.key("Enter");
  low.shell.finish(5);
  assert.equal(low.screen.result?.bestFlash, undefined);

  const first = openGame();
  first.shell.key("Enter");
  first.shell.finish(20);
  assert.equal(first.screen.result?.bestFlash, "İlk rekorun!");
});

test("a raised Best score says Yeni rekor! only when it reaches 20", () => {
  const g = openGame();
  g.shell.key("Enter");
  g.shell.finish(5);
  g.shell.key("Enter");
  g.shell.finish(15);
  assert.equal(g.screen.result?.improved, true);
  assert.equal(g.screen.result?.bestFlash, undefined, "15 is higher, but still under 20");
  g.shell.key("Enter");
  g.shell.finish(40);
  assert.equal(g.screen.result?.bestFlash, "Yeni rekor!");
  g.shell.key("Enter");
  g.shell.finish(30);
  assert.equal(g.screen.result?.bestFlash, undefined, "a lower Round raises nothing");
});

// ------------------------------------------------- the Points line (D1)

test("a new Best score in a skill Game says the Points it brought and the total earned", () => {
  const ledger = createLedger(memoryStore());
  ledger.recordRound("milyoner", 91); // 91 Points already earned elsewhere
  ledger.recordRound("hafiza", 80);
  const g = openGame("hafiza", ledger);
  g.shell.key("Enter");
  g.shell.finish(88.6);
  assert.equal(g.screen.result?.pointsLine, "+8 puan · toplam 179");
});

test("a Round that leaves the Points as they were says so, with the Best score as she reads it", () => {
  const ledger = createLedger(memoryStore());
  ledger.recordRound("hafiza", 88.4);
  const g = openGame("hafiza", ledger);
  g.shell.key("Enter");
  g.shell.finish(60);
  assert.equal(g.screen.result?.pointsLine, "Rekorun %88 · puanın değişmedi");
  // A higher score inside the same whole percent is a new Best but no new Point.
  g.shell.key("Enter");
  g.shell.finish(88.9);
  assert.equal(g.screen.result?.pointsLine, "Rekorun %88 · puanın değişmedi");
});

test("the total earned is written the Turkish way: 1.000 at the top", () => {
  const ledger = createLedger(memoryStore());
  for (const id of ["milyoner", "nerede", "wordle", "sarki", "piyano", "kadraj", "surus", "yuruyus", "kayak"] as const) {
    ledger.recordRound(id, 100);
  }
  ledger.recordRound("hafiza", 99);
  const g = openGame("hafiza", ledger);
  g.shell.key("Enter");
  g.shell.finish(100);
  assert.equal(g.screen.result?.pointsLine, "+1 puan · toplam 1.000");
});

test("a Prize Game's result says it gives no Points", () => {
  const g = openGame("bavul");
  g.shell.key("Enter");
  g.shell.finish(70);
  assert.equal(g.screen.result?.pointsLine, "Bu oyun puan vermez");
});

// ------------------------------------------------- the prize hint (D2)

test("the start and result screens carry the Game's prize hint until the Small prize is won", () => {
  const g = openGame("hafiza");
  assert.equal(g.screen.prizeHint, "%95 için en fazla 15 hamle");
  g.shell.key("Enter");
  g.shell.finish(90);
  assert.equal(g.screen.prizeHint, "%95 için en fazla 15 hamle");
  g.shell.key("Enter");
  g.shell.finish(95);
  assert.equal(g.screen.prizeHint, undefined, "won: nothing left to explain");
});

// ------------------------------------------- the Small prize celebration (L2)

test("a skill Game celebrates its Small prize once, on the Round that wins it", () => {
  const g = openGame("hafiza");
  g.shell.key("Enter");
  g.shell.finish(95);
  assert.equal(g.screen.result?.celebrate, true);
  g.shell.key("Enter");
  g.shell.finish(100);
  assert.equal(g.screen.result?.celebrate, false);
});

test("a Prize Game celebrates every Round at 95 or more, won before or not", () => {
  const g = openGame("barista");
  g.shell.key("Enter");
  g.shell.finish(94.9);
  assert.equal(g.screen.result?.celebrate, false);
  g.shell.key("Enter");
  g.shell.finish(96);
  assert.equal(g.screen.result?.celebrate, true, "the Round that wins it");
  g.shell.key("Enter");
  g.shell.finish(95);
  assert.equal(g.screen.result?.celebrate, true, "and every later one at the bar");
});

// ------------------------------------------------------ the phase hook (M4)

test("onPhase hears every screen the shell shows, in order", () => {
  const phases: string[] = [];
  const shell = createGameShell({
    game: "hafiza",
    ledger: createLedger(memoryStore()),
    hooks: { startRound: () => {} },
    view: () => {},
    leave: () => {},
    onPhase: (phase) => void phases.push(phase),
  });
  shell.key("Enter");
  shell.key("Escape");
  shell.key("Escape");
  shell.finish(50);
  shell.key("Enter");
  assert.deepEqual(phases, ["start", "playing", "confirm", "playing", "result", "playing"]);
});

test("one finished Round is recorded once: a second finish without a new Round changes nothing", () => {
  const g = openGame();
  g.shell.key("Enter");
  g.shell.finish(80);
  assert.equal(g.shell.finish(100), undefined);
  assert.equal(g.ledger.bestOf("hafiza"), 80);
  assert.equal(g.screen.result?.score, 80);
});

test("on the result screen Enter is a new Round and Esc is the hub", () => {
  const g = openGame();
  g.shell.key("Enter");
  g.shell.finish(80);
  assert.equal(g.shell.key("Enter"), true);
  assert.equal(g.screen.phase, "playing");
  assert.equal(g.ran.startRound, 2);
  g.shell.finish(85);
  assert.equal(g.shell.key("Escape"), true);
  assert.equal(g.left, 1);
  assert.equal(g.ledger.bestOf("hafiza"), 85);
});

// ------------------------------------------------------------ leaving a Round

test("during a Round only Esc is the shell's; every other key is the Game's", () => {
  const g = openGame();
  g.shell.key("Enter");
  assert.equal(g.shell.key("Enter"), false);
  assert.equal(g.shell.key(" "), false);
  assert.equal(g.shell.key("ArrowLeft"), false);
  assert.equal(g.screen.phase, "playing");
  assert.equal(g.shell.key("Escape"), true);
  assert.equal(g.screen.phase, "confirm");
});

test("Esc during a Round asks first; Esc again goes on with the Round, nothing lost", () => {
  const g = openGame();
  g.shell.key("Enter");
  g.shell.key("Escape");
  assert.equal(g.ran.pause, 1, "a real-time Game freezes while the question is up");
  assert.equal(g.shell.key("a"), true, "the Game sees no keys while the question is up");
  g.shell.key("Escape");
  assert.equal(g.screen.phase, "playing");
  assert.equal(g.ran.resume, 1);
  assert.equal(g.left, 0);
  assert.equal(g.ran.startRound, 1, "the same Round goes on; it did not restart");
});

test("a Round she leaves scores nothing: Esc, Enter, and the Best score is as it was", () => {
  const ledger = createLedger(memoryStore());
  ledger.recordRound("hafiza", 70);
  const g = openGame("hafiza", ledger);
  g.shell.key("Enter");
  g.shell.key("Escape");
  g.shell.key("Enter");
  assert.equal(g.left, 1);
  assert.equal(g.ran.abandonRound, 1);
  assert.equal(g.ledger.bestOf("hafiza"), 70);

  const fresh = openGame();
  fresh.shell.key("Enter");
  fresh.shell.key("Escape");
  fresh.shell.key("Enter");
  assert.equal(fresh.ledger.bestOf("hafiza"), undefined, "a left first Round leaves no trace");
  assert.equal(fresh.shell.finish(100), undefined, "and a late finish after leaving is ignored");
  assert.equal(fresh.ledger.bestOf("hafiza"), undefined);
});

// ------------------------------------------------------------ the slot machine

test("the slot machine has no result screen: a finish is recorded and the next Round starts at once", () => {
  const g = openGame("slot", createLedger(memoryStore()), false);
  g.shell.key("Enter");
  const outcome = g.shell.finish(50);
  assert.equal(g.screen.phase, "playing");
  assert.equal(g.ran.startRound, 2);
  assert.deepEqual(outcome, { best: 50, improved: true, prizeWonNow: false });
  assert.equal(g.ledger.bestOf("slot"), 50);
  assert.equal(g.ledger.earned(), 0, "and the slot machine gives no Points");
  assert.equal(g.screen.result, undefined, "and no result, so no Points line either");
  assert.equal(g.screen.prizeHint, undefined, "the jackpot has no hint");

  const jackpot = g.shell.finish(100, { jackpot: true });
  assert.equal(jackpot?.prizeWonNow, true);
  assert.equal(g.screen.prizeWon, true);
  assert.equal(g.ledger.prizeWon("slot"), true);
});

test("between spins there is no Round to lose: Esc leaves at once; mid-spin it asks (#200)", () => {
  // The slot machine answers `roundInProgress` itself: false while the
  // machine waits for her, true while the reels turn.
  let spinning = false;
  const ran = { abandonRound: 0 };
  let left = 0;
  let screen: ShellScreen | undefined;
  const shell = createGameShell({
    game: "slot",
    ledger: createLedger(memoryStore()),
    hooks: {
      startRound: () => {},
      abandonRound: () => void (ran.abandonRound += 1),
      roundInProgress: () => spinning,
    },
    resultScreen: false,
    view: (s) => void (screen = s),
    leave: () => void (left += 1),
  });
  shell.key("Enter");

  // Idle: Esc is the hub, no question, nothing to abandon.
  assert.equal(shell.key("Escape"), true);
  assert.equal(left, 1);
  assert.equal(screen?.phase, "playing", "no confirm card was shown");
  assert.equal(ran.abandonRound, 0);

  // Mid-spin: the usual question, and Enter on it abandons the spin.
  spinning = true;
  shell.key("Escape");
  assert.equal(screen?.phase, "confirm");
  assert.equal(left, 1);
  shell.key("Enter");
  assert.equal(left, 2);
  assert.equal(ran.abandonRound, 1);
});

test("the slot machine opens ready: no start screen, and the first Space is the machine's (story 54)", () => {
  let started = 0;
  let screen: ShellScreen | undefined;
  const shell = createGameShell({
    game: "slot",
    ledger: createLedger(memoryStore()),
    hooks: { startRound: () => void (started += 1), roundInProgress: () => false },
    resultScreen: false,
    startScreen: false,
    view: (s) => void (screen = s),
    leave: () => {},
  });
  assert.equal(screen?.phase, "playing");
  assert.equal(started, 1);
  assert.equal(shell.key(" "), false, "Space reaches the machine on the first press");
});

// ------------------------------------------------------- a choice on a screen

test("a Game may take a key on its start and result screens (the piano's 1 2 3); Enter and Esc stay the shell's", () => {
  // The piano Game (#205) picks its song on the start screen and again on
  // the result screen, before Enter starts the Round.
  const offered: [string, string][] = [];
  let rounds = 0;
  let left = 0;
  let screen: ShellScreen | undefined;
  const shell = createGameShell({
    game: "piyano",
    ledger: createLedger(memoryStore()),
    hooks: {
      startRound: () => void (rounds += 1),
      // Which screen she is on when the key is offered, as she sees it.
      screenKey: (key) => void offered.push([key, screen?.phase ?? "none"]),
    },
    view: (s) => void (screen = s),
    leave: () => void (left += 1),
  });

  assert.equal(shell.key("2"), true);
  assert.equal(shell.key("x"), true, "a key the Game declines is still the screen's");
  assert.equal(screen?.phase, "start");
  shell.key("Enter");
  assert.equal(rounds, 1);
  // During the Round the hook is not asked: keys go to the Game as usual.
  assert.equal(shell.key("2"), false);
  shell.finish(50);
  shell.key("2");
  shell.key("Escape");
  assert.equal(left, 1);
  assert.deepEqual(offered, [
    ["2", "start"],
    ["x", "start"],
    ["2", "result"],
  ]);
});
