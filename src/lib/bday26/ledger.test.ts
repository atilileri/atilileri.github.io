/*
 * Tests for the ledger: the progress rules of the birthday games site.
 *
 *   node --test src/lib/bday26/ledger.test.ts
 *
 * Seam 1 of the spec (#192, "Testing Decisions"): the ledger is a plain module
 * with injected storage, so these run in Node with no browser. Every test
 * feeds facts in (Rounds, buys, Returns, or a saved state) and reads what she
 * would see out (Best score, Points, Balance, Gifts held, Small prizes). None
 * of them looks at how the ledger keeps its books.
 *
 * Expected numbers come from the spec's rules, not from the code: 1% of a
 * Best score = 1 Point rounded down, the slot machine gives none, 1,000 is
 * the most, a Gift's price leaves the Balance at once, a Return gives half of
 * the price that was PAID back, and 95% wins the Small prize. The Save code
 * tests at the end (#196) read a code back the way "Geri yükle" does and
 * never look at its text beyond the one character they change.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  balanceOf,
  createLedger,
  earnedOf,
  heldOf,
  prizesWonOf,
  STORAGE_KEY,
  type KeyValueStore,
} from "./ledger.ts";
import { encodeSaveCode } from "./savecode.ts";

/** An in-memory stand-in for `localStorage`. */
function memoryStore(seed?: Record<string, string>): KeyValueStore & { data: Map<string, string> } {
  const data = new Map(Object.entries(seed ?? {}));
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  };
}

/** 353 Points: nerede 100 + hafiza 95 + wordle 100 + milyoner ⌊58.3⌋. */
function ledgerWith353Points() {
  const ledger = createLedger(memoryStore());
  ledger.recordRound("nerede", 100);
  ledger.recordRound("hafiza", 95);
  ledger.recordRound("wordle", 100);
  ledger.recordRound("milyoner", 58.3);
  return ledger;
}

// ------------------------------------------------------------ a fresh start

test("a fresh browser starts with nothing: no Best score, 0 Points, 0 Balance", () => {
  const ledger = createLedger(memoryStore());
  assert.equal(ledger.bestOf("hafiza"), undefined);
  assert.equal(ledger.earned(), 0);
  assert.equal(ledger.balance(), 0);
  assert.deepEqual([...ledger.held().keys()], []);
  assert.deepEqual(ledger.prizesWon(), []);
});

// ------------------------------------------------------------ Best score

test("a Round raises the Best score; a lower Round leaves it where it was", () => {
  const ledger = createLedger(memoryStore());
  ledger.recordRound("hafiza", 60);
  assert.equal(ledger.bestOf("hafiza"), 60);
  ledger.recordRound("hafiza", 40);
  assert.equal(ledger.bestOf("hafiza"), 60);
  ledger.recordRound("hafiza", 85);
  assert.equal(ledger.bestOf("hafiza"), 85);
});

test("the Round outcome says whether it was a new Best score", () => {
  const ledger = createLedger(memoryStore());
  assert.deepEqual(ledger.recordRound("wordle", 75), { best: 75, improved: true, prizeWonNow: false });
  assert.deepEqual(ledger.recordRound("wordle", 50), { best: 75, improved: false, prizeWonNow: false });
});

// --------------------------------------------------------------- Points

test("1% of a Best score is 1 Point, rounded down", () => {
  const ledger = createLedger(memoryStore());
  ledger.recordRound("milyoner", 58.3);
  ledger.recordRound("kadraj", 88.7);
  assert.equal(ledger.pointsOf("milyoner"), 58);
  assert.equal(ledger.earned(), 146);
});

test("the slot machine gives no Points, whatever its score", () => {
  const ledger = createLedger(memoryStore());
  ledger.recordRound("slot", 100, { jackpot: true });
  assert.equal(ledger.pointsOf("slot"), 0);
  assert.equal(ledger.earned(), 0);
});

test("1,000 Points is the most: a perfect sweep earns exactly that", () => {
  const ledger = createLedger(memoryStore());
  for (const id of ["milyoner", "nerede", "hafiza", "wordle", "sarki", "piyano", "kadraj", "surus", "yuruyus", "kayak"] as const) {
    ledger.recordRound(id, 100);
  }
  ledger.recordRound("slot", 100, { jackpot: true });
  assert.equal(ledger.earned(), 1000);
});

test("a score outside 0..100 is a Game's bug and is kept inside the range", () => {
  const ledger = createLedger(memoryStore());
  ledger.recordRound("kayak", 140);
  ledger.recordRound("surus", -20);
  assert.equal(ledger.bestOf("kayak"), 100);
  assert.equal(ledger.bestOf("surus"), 0);
  assert.equal(ledger.earned(), 100);
});

// ---------------------------------------------------------- Small prize

test("a Best score of exactly 95 wins the Small prize; 94.9 does not", () => {
  const ledger = createLedger(memoryStore());
  ledger.recordRound("sarki", 94.9);
  assert.equal(ledger.prizeWon("sarki"), false);
  const outcome = ledger.recordRound("sarki", 95);
  assert.equal(ledger.prizeWon("sarki"), true);
  assert.equal(outcome.prizeWonNow, true);
  assert.deepEqual(ledger.prizesWon(), ["sarki"]);
});

test("the Small prize is won once: a later 100 is a new Best score, not a new win", () => {
  const ledger = createLedger(memoryStore());
  ledger.recordRound("sarki", 95);
  assert.deepEqual(ledger.recordRound("sarki", 100), { best: 100, improved: true, prizeWonNow: false });
});

test("the slot machine's Small prize comes from the jackpot, not from its score", () => {
  const ledger = createLedger(memoryStore());
  ledger.recordRound("slot", 100);
  assert.equal(ledger.prizeWon("slot"), false);
  const outcome = ledger.recordRound("slot", 10, { jackpot: true });
  assert.equal(ledger.prizeWon("slot"), true);
  assert.equal(outcome.prizeWonNow, true);
});

test("a jackpot flag on a skill Game means nothing", () => {
  const ledger = createLedger(memoryStore());
  ledger.recordRound("hafiza", 10, { jackpot: true });
  assert.equal(ledger.prizeWon("hafiza"), false);
  assert.equal(ledger.prizeWon("slot"), false);
});

// ---------------------------------------------------------- Prize Games

test("a Prize Game gives no Points, even at a Best score of 100", () => {
  const ledger = createLedger(memoryStore());
  for (const id of ["bavul", "renk", "barista"] as const) {
    ledger.recordRound(id, 100);
    assert.equal(ledger.bestOf(id), 100, id);
    assert.equal(ledger.pointsOf(id), 0, id);
  }
  assert.equal(ledger.earned(), 0);
  assert.equal(ledger.balance(), 0);
});

test("a Prize Game's Small prize is won at 95, not at 94", () => {
  const ledger = createLedger(memoryStore());
  ledger.recordRound("barista", 94);
  assert.equal(ledger.prizeWon("barista"), false);
  assert.equal(ledger.recordRound("barista", 95).prizeWonNow, true);
  assert.equal(ledger.prizeWon("barista"), true);
  assert.deepEqual(ledger.prizesWon(), ["barista"]);
});

test("the Prize Games leave the most Points at 1,000: every Game at 100 earns exactly that", () => {
  const ledger = createLedger(memoryStore());
  for (const id of ["milyoner", "nerede", "hafiza", "wordle", "sarki", "piyano", "kadraj", "surus", "yuruyus", "kayak", "bavul", "renk", "barista", "slot"] as const) {
    ledger.recordRound(id, 100, { jackpot: true });
  }
  assert.equal(ledger.earned(), 1000);
  assert.equal(ledger.prizesWon().length, 14);
});

// ------------------------------------------------------------ Gift shop

test("a buy takes the price off the Balance at once and the Gift is held", () => {
  const ledger = ledgerWith353Points();
  assert.equal(ledger.balance(), 353);
  assert.deepEqual(ledger.buy("rocky"), { ok: true, paid: 260 });
  assert.equal(ledger.balance(), 93);
  assert.equal(ledger.earned(), 353);
  assert.equal(ledger.holds("rocky"), true);
});

test("a buy is refused when the Balance is below the price", () => {
  const ledger = ledgerWith353Points();
  assert.deepEqual(ledger.buy("theragun"), { ok: false, reason: "balance" });
  assert.equal(ledger.balance(), 353);
  assert.equal(ledger.holds("theragun"), false);
});

test("a buy at exactly the price goes through", () => {
  const ledger = createLedger(memoryStore());
  ledger.recordRound("nerede", 100);
  ledger.recordRound("hafiza", 100);
  ledger.recordRound("wordle", 60);
  assert.equal(ledger.balance(), 260);
  assert.equal(ledger.buy("rocky").ok, true);
  assert.equal(ledger.balance(), 0);
});

test("a Gift is held at most once: a second buy is refused", () => {
  const ledger = createLedger(memoryStore());
  for (const id of ["nerede", "hafiza", "wordle", "sarki", "piyano", "kadraj"] as const) ledger.recordRound(id, 100);
  assert.equal(ledger.buy("rocky").ok, true);
  assert.deepEqual(ledger.buy("rocky"), { ok: false, reason: "held" });
  assert.equal(ledger.balance(), 340);
});

test("a Return gives half the price back and the Gift can be bought again", () => {
  const ledger = ledgerWith353Points();
  ledger.buy("rocky");
  assert.deepEqual(ledger.returnGift("rocky"), { ok: true, returned: 130 });
  assert.equal(ledger.balance(), 223);
  assert.equal(ledger.holds("rocky"), false);
  assert.equal(ledger.buy("rocky").ok, false, "223 < 260");
  ledger.recordRound("sarki", 40);
  assert.equal(ledger.buy("rocky").ok, true);
  assert.equal(ledger.balance(), 3);
});

test("a Return of a Gift she does not hold is refused", () => {
  const ledger = ledgerWith353Points();
  assert.deepEqual(ledger.returnGift("rocky"), { ok: false, reason: "not-held" });
  assert.equal(ledger.balance(), 353);
});

test("a Return gives back half of the price PAID, even after the catalogue price changed", () => {
  // Saved when "rocky" cost 300; the catalogue says 260 today.
  const store = memoryStore({
    [STORAGE_KEY]: JSON.stringify({
      best: { nerede: 100, hafiza: 100, wordle: 100, sarki: 100 },
      jackpot: false,
      log: [{ kind: "buy", gift: "rocky", paid: 300 }],
    }),
  });
  const ledger = createLedger(store);
  assert.equal(ledger.balance(), 100);
  assert.deepEqual(ledger.returnGift("rocky"), { ok: true, returned: 150 });
  assert.equal(ledger.balance(), 250);
});

test("Gifts held are the ones whose last event is a buy", () => {
  const ledger = createLedger(memoryStore());
  for (const id of ["nerede", "hafiza", "wordle", "sarki", "piyano", "kadraj", "surus", "yuruyus"] as const) ledger.recordRound(id, 100);
  ledger.buy("theragun");
  ledger.returnGift("theragun");
  ledger.buy("rocky");
  ledger.buy("kurs");
  assert.deepEqual([...ledger.held().entries()], [["rocky", 260], ["kurs", 290]]);
  // 800 earned − 360 + 180 − 260 − 290
  assert.equal(ledger.balance(), 70);
});

// ---------------------------------------------------------- persistence

test("progress survives: a ledger opened later on the same storage sees it all", () => {
  const store = memoryStore();
  const first = createLedger(store);
  first.recordRound("hafiza", 96);
  first.recordRound("slot", 30, { jackpot: true });
  first.buy("rocky"); // refused, 96 < 260 — and leaves no trace
  const second = createLedger(store);
  assert.equal(second.bestOf("hafiza"), 96);
  assert.equal(second.balance(), 96);
  assert.deepEqual(second.prizesWon(), ["hafiza", "slot"]);
  assert.equal(second.holds("rocky"), false);
});

test("two ledgers on one storage never undo each other: a buy on an old page keeps the Best score set on a newer one", () => {
  // The hub restored by Back (its ledger opened before the Game was played)
  // and the Game page that set a new Best score: same browser, same key.
  const store = memoryStore();
  const hub = createLedger(store);
  hub.recordRound("nerede", 100);
  const game = createLedger(store);
  game.recordRound("hafiza", 100);
  game.recordRound("slot", 10, { jackpot: true });

  // The old page sees the newer facts, and its buy is added to them.
  assert.equal(hub.bestOf("hafiza"), 100);
  assert.equal(hub.balance(), 200);
  assert.deepEqual(hub.buy("deslak"), { ok: true, paid: 100 });

  // A later visit finds all of it: both Best scores, the jackpot, the buy.
  const later = createLedger(store);
  assert.equal(later.bestOf("nerede"), 100);
  assert.equal(later.bestOf("hafiza"), 100);
  assert.deepEqual(later.prizesWon(), ["nerede", "hafiza", "slot"]);
  assert.equal(later.holds("deslak"), true);
  assert.equal(later.balance(), 100);
});

test("a buy the other page already made is refused on the old one, not made twice", () => {
  const store = memoryStore();
  const hub = createLedger(store);
  hub.recordRound("nerede", 100);
  const other = createLedger(store);
  other.buy("deslak");
  assert.deepEqual(hub.buy("deslak"), { ok: false, reason: "held" });
  assert.equal(createLedger(store).balance(), 0);
});

test("progress is kept under the one key the spec names", () => {
  const store = memoryStore();
  createLedger(store).recordRound("hafiza", 50);
  assert.deepEqual([...store.data.keys()], ["bday26:v1"]);
});

test("garbage in storage is an empty start, not a broken hub", () => {
  for (const raw of ["not json", "null", "[]", '"text"', "{}", '{"best":{"hafiza":"x","nope":50},"log":"no"}']) {
    const ledger = createLedger(memoryStore({ [STORAGE_KEY]: raw }));
    assert.equal(ledger.earned(), 0, raw);
    assert.equal(ledger.balance(), 0, raw);
    assert.deepEqual(ledger.prizesWon(), [], raw);
  }
});

test("a saved state is read strictly: unknown ids and out-of-range scores are dropped", () => {
  const store = memoryStore({
    [STORAGE_KEY]: JSON.stringify({
      best: { hafiza: 250, kosu: 100, wordle: 90 },
      jackpot: "yes",
      log: [
        { kind: "buy", gift: "rocky", paid: 260 },
        { kind: "steal", gift: "gezi", paid: 0 },
        { kind: "buy", gift: "ferrari", paid: 1 },
      ],
    }),
  });
  const ledger = createLedger(store);
  assert.equal(ledger.bestOf("hafiza"), 100);
  assert.equal(ledger.earned(), 190);
  assert.equal(ledger.prizeWon("slot"), false);
  assert.deepEqual([...ledger.held().keys()], ["rocky"]);
});

test("replace swaps every fact, with no merge", () => {
  const ledger = ledgerWith353Points();
  ledger.buy("rocky");
  ledger.replace({ best: { kayak: 20 }, jackpot: true, log: [] });
  assert.equal(ledger.earned(), 20);
  assert.equal(ledger.balance(), 20);
  assert.equal(ledger.bestOf("hafiza"), undefined);
  assert.equal(ledger.holds("rocky"), false);
  assert.deepEqual(ledger.prizesWon(), ["slot"]);
});

// ------------------------------------------------------------ Save code

test("her progress comes back whole from its own Save code: Best scores, Points, Gifts held, Small prizes", async () => {
  const ledger = ledgerWith353Points();
  ledger.recordRound("slot", 30, { jackpot: true });
  ledger.buy("rocky");
  const { code } = await ledger.toSaveCode();

  const read = await ledger.fromSaveCode(code);
  assert.ok(read.ok);
  assert.equal(read.progress.best.milyoner, 58.3);
  assert.equal(earnedOf(read.progress), 353);
  assert.equal(balanceOf(read.progress), 93);
  assert.deepEqual([...heldOf(read.progress).entries()], [["rocky", 260]]);
  assert.deepEqual(prizesWonOf(read.progress), ["nerede", "hafiza", "wordle", "slot"]);
});

test("a Save code made in one browser restores the same progress in another, replacing what was there", async () => {
  const hers = ledgerWith353Points();
  hers.recordRound("slot", 30, { jackpot: true });
  hers.buy("rocky");
  const { code } = await hers.toSaveCode();

  // The other browser had progress of its own: a Best score she would lose
  // and a Gift she would not hold any more. Restore replaces, it never merges.
  const otherStore = memoryStore();
  const other = createLedger(otherStore);
  for (const id of ["kayak", "surus", "yuruyus"] as const) other.recordRound(id, 100);
  other.buy("kurs");

  const outcome = await other.restore(code);
  assert.equal(outcome.ok, true);
  assert.equal(other.bestOf("kayak"), undefined);
  assert.equal(other.holds("kurs"), false);
  assert.equal(other.earned(), 353);
  assert.equal(other.balance(), 93);
  assert.deepEqual([...other.held().entries()], [["rocky", 260]]);
  assert.deepEqual(other.prizesWon(), ["nerede", "hafiza", "wordle", "slot"]);

  // And it is written down: the next visit on that browser finds it.
  assert.equal(createLedger(otherStore).balance(), 93);
});

test("a Save code with a typo is refused and her progress stays as it was", async () => {
  const ledger = ledgerWith353Points();
  const { code } = await ledger.toSaveCode();
  ledger.buy("rocky");
  const typo = code.slice(0, 10) + (code[10] === "A" ? "B" : "A") + code.slice(11);

  assert.deepEqual(await ledger.fromSaveCode(typo), { ok: false, reason: "check" });
  assert.deepEqual(await ledger.restore(typo), { ok: false, reason: "check" });
  assert.equal(ledger.balance(), 93);
  assert.equal(ledger.holds("rocky"), true);
});

test("a well-formed code that does not carry progress is refused too", async () => {
  const ledger = ledgerWith353Points();
  const { code } = await encodeSaveCode("not progress at all");
  assert.deepEqual(await ledger.restore(code), { ok: false, reason: "payload" });
  assert.equal(ledger.earned(), 353);
});

// ------------------------------------------------------------ a Return reads its buy

test("a Return gives back half of the matching buy's paid, whatever the Return line says", () => {
  // A log can arrive by Save code. Its Return line repeats a paid, but the
  // spec reads the half from the buy it undoes: 260 paid, 130 back.
  const balance = balanceOf({
    best: { nerede: 100, hafiza: 95, wordle: 100, milyoner: 58.3 },
    jackpot: false,
    log: [
      { kind: "buy", gift: "rocky", paid: 260 },
      { kind: "return", gift: "rocky", paid: 1000 },
    ],
  });
  assert.equal(balance, 223);
});

test("a Return with no buy before it is dropped alone: the rest of a Save code still restores", async () => {
  // One broken line must not cost her every Best score and every Gift.
  const forged = (log: unknown[]) =>
    encodeSaveCode(JSON.stringify({ best: { nerede: 100, hafiza: 100, wordle: 100 }, jackpot: false, log }));

  const neverBought = await forged([
    { kind: "return", gift: "rocky", paid: 260 },
    { kind: "buy", gift: "deslak", paid: 100 },
  ]);
  const ledger = ledgerWith353Points();
  assert.equal((await ledger.restore(neverBought.code)).ok, true);
  assert.equal(ledger.earned(), 300);
  assert.deepEqual([...ledger.held().keys()], ["deslak"]);
  assert.equal(ledger.balance(), 200);

  // Returned twice: the second Return gives nothing back.
  const returnedTwice = await forged([
    { kind: "buy", gift: "rocky", paid: 260 },
    { kind: "return", gift: "rocky", paid: 260 },
    { kind: "return", gift: "rocky", paid: 260 },
  ]);
  assert.equal((await ledger.restore(returnedTwice.code)).ok, true);
  assert.deepEqual([...ledger.held().keys()], []);
  assert.equal(ledger.balance(), 170); // 300 − 260 + 130
});

test("a stored state with a broken Return keeps her Best scores and Gifts", () => {
  const store = memoryStore({
    [STORAGE_KEY]: JSON.stringify({
      best: { nerede: 100, hafiza: 100, wordle: 100 },
      jackpot: true,
      log: [
        { kind: "buy", gift: "deslak", paid: 100 },
        { kind: "return", gift: "kurs", paid: 290 },
      ],
    }),
  });
  const ledger = createLedger(store);
  assert.equal(ledger.earned(), 300);
  assert.equal(ledger.holds("deslak"), true);
  assert.equal(ledger.prizeWon("slot"), true);
  assert.equal(ledger.balance(), 200);
});

// ------------------------------------------------------------ Gifted points

const AT = "2026-12-09T10:00:00.000Z";

test("Gifted points raise the Balance, not the Points earned from Games", () => {
  const ledger = ledgerWith353Points();
  assert.deepEqual(ledger.giftPoints(50, "doğum günü", AT), { ok: true, points: 50 });
  assert.equal(ledger.earned(), 353);
  assert.equal(ledger.giftedTotal(), 50);
  assert.equal(ledger.balance(), 403);
  assert.deepEqual(ledger.gifted(), [{ points: 50, note: "doğum günü", at: AT }]);
});

test("Gifted points are kept: the next visit on that browser still has them", () => {
  const store = memoryStore();
  createLedger(store).giftPoints(50, undefined, AT);
  const later = createLedger(store);
  assert.equal(later.balance(), 50);
  assert.deepEqual(later.gifted(), [{ points: 50, at: AT }]);
});

test("a state saved before Gifted points existed still loads, with none", () => {
  const store = memoryStore({
    [STORAGE_KEY]: JSON.stringify({ best: { nerede: 100 }, jackpot: false, log: [] }),
  });
  const ledger = createLedger(store);
  assert.equal(ledger.balance(), 100);
  assert.deepEqual(ledger.gifted(), []);
});

test("a saved gift that is not a whole number above 0 is dropped on load", () => {
  const store = memoryStore({
    [STORAGE_KEY]: JSON.stringify({
      best: {},
      jackpot: false,
      log: [],
      gifted: [{ points: 30, at: AT }, { points: -5, at: AT }, { points: 2.5, at: AT }, "x", { points: 20 }],
    }),
  });
  assert.equal(createLedger(store).balance(), 30);
});

test("Gifted points ride in the Save code and come back on restore in another browser", async () => {
  const hers = ledgerWith353Points();
  hers.giftPoints(100, "sürpriz", AT);
  hers.buy("rocky");
  const { code } = await hers.toSaveCode();

  const read = await hers.fromSaveCode(code);
  assert.ok(read.ok);
  assert.equal(earnedOf(read.progress), 353);
  assert.equal(balanceOf(read.progress), 193);

  const other = createLedger(memoryStore());
  assert.equal((await other.restore(code)).ok, true);
  assert.equal(other.earned(), 353);
  assert.equal(other.balance(), 193);
  assert.deepEqual(other.gifted(), [{ points: 100, note: "sürpriz", at: AT }]);
});

test("a Save code made before Gifted points existed still restores, with none", async () => {
  const { code } = await encodeSaveCode(JSON.stringify({ best: { nerede: 100 }, jackpot: false, log: [] }));
  const ledger = createLedger(memoryStore());
  ledger.giftPoints(40, undefined, AT);
  assert.equal((await ledger.restore(code)).ok, true);
  assert.equal(ledger.balance(), 100);
  assert.deepEqual(ledger.gifted(), []);
});

test("a gift of Points that is not a whole number above 0 is refused and leaves no trace", () => {
  const ledger = createLedger(memoryStore());
  for (const points of [0, -10, 2.5, Number.NaN]) {
    assert.deepEqual(ledger.giftPoints(points, undefined, AT), { ok: false, reason: "points" });
  }
  assert.equal(ledger.balance(), 0);
  assert.deepEqual(ledger.gifted(), []);
});

test("the last gift can be undone, newest first", () => {
  const ledger = createLedger(memoryStore());
  ledger.giftPoints(10, undefined, AT);
  ledger.giftPoints(500, "yazım hatası", AT);
  assert.deepEqual(ledger.undoLastGift(), { ok: true, points: 500 });
  assert.equal(ledger.balance(), 10);
  assert.deepEqual(ledger.gifted(), [{ points: 10, at: AT }]);
});

test("undo is refused when there is no gift to undo", () => {
  const ledger = ledgerWith353Points();
  assert.deepEqual(ledger.undoLastGift(), { ok: false, reason: "none" });
  assert.equal(ledger.balance(), 353);
});

test("undo is refused when the gifted Points are already spent, so the Balance never goes below 0", () => {
  const ledger = createLedger(memoryStore());
  ledger.recordRound("nerede", 100);
  ledger.giftPoints(200, undefined, AT);
  ledger.buy("rocky"); // 300 − 260 = 40 left
  assert.deepEqual(ledger.undoLastGift(), { ok: false, reason: "spent" });
  assert.equal(ledger.balance(), 40);
  assert.equal(ledger.gifted().length, 1);
});

test("undo goes through when the Balance covers it exactly", () => {
  const ledger = createLedger(memoryStore());
  ledger.recordRound("nerede", 100);
  ledger.giftPoints(160, undefined, AT);
  ledger.buy("rocky"); // 100 + 160 − 260 = 0
  ledger.giftPoints(30, undefined, AT);
  assert.deepEqual(ledger.undoLastGift(), { ok: true, points: 30 });
  assert.equal(ledger.balance(), 0);
});
