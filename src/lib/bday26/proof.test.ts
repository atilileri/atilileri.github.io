/*
 * Tests for the Proof's content: what the printed page says, given her
 * progress.
 *
 *   node --test src/lib/bday26/proof.test.ts
 *
 * Seam 1 of the spec (#192, "Testing Decisions") for ticket #197: `proofOf`
 * is a plain function over the ledger, so these run in Node with no DOM.
 * Every test feeds facts in (Rounds, buys, Returns, a date) and reads what
 * the paper would show out: Gift names, Small prize names, the date, the
 * check code and the Save code. None of them looks at how the page is laid
 * out; the page itself is walked once by the Playwright smoke
 * (`tests/bday26/smoke.spec.ts`).
 *
 * Expected names are the locked catalogue text of #177, written out as
 * literals; expected rules are the spec's: a Gift is held until its Return,
 * a Small prize is won at a 95% Best score or at the jackpot, and the check
 * code is the Save code's last 6 characters (#175).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createLedger, type KeyValueStore } from "./ledger.ts";
import { proofOf } from "./proof.ts";

/** An in-memory stand-in for `localStorage`. */
function memoryStore(): KeyValueStore {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  };
}

/** Her birthday, the date the Proof is most likely printed on. */
const BIRTHDAY = new Date(2026, 11, 9);

/**
 * An evening's progress: 683 Points (nerede, hafiza, kadraj, sarki and piyano
 * at 100, wordle at 95.5, milyoner at 88, the slot at 40 with the jackpot),
 * then Rocky Horror bought first and the paint set second.
 */
function anEvening() {
  const ledger = createLedger(memoryStore());
  ledger.recordRound("nerede", 100);
  ledger.recordRound("hafiza", 100);
  ledger.recordRound("kadraj", 100);
  ledger.recordRound("sarki", 100);
  ledger.recordRound("piyano", 100);
  ledger.recordRound("wordle", 95.5);
  ledger.recordRound("milyoner", 88);
  ledger.recordRound("slot", 40, { jackpot: true });
  ledger.buy("rocky");
  ledger.buy("resim");
  return ledger;
}

test("the Proof lists the Gifts she holds in shop order and the Small prizes she won, each with its line", async () => {
  const proof = await proofOf(anEvening(), BIRTHDAY);

  // The paint set (310) sits above Rocky Horror (260) as the shop lists them,
  // although it was bought second.
  assert.deepEqual(
    proof.gifts.map((g) => g.name),
    ["Resim seti", "Rocky Horror film gecesi"],
  );
  assert.equal(proof.gifts[0]?.desc, "Akrilik boya, tuval ve şövale — Amsterdam ya da Van Bleiswijck seti.");

  // Seven Small prizes: six skill Games at or over 95%, the slot by its
  // jackpot. Milyoner at 88% is not there. Hub order, the slot last.
  assert.deepEqual(
    proof.prizes.map((p) => p.name),
    [
      "Paleis Het Loo gezisi",
      "Mei Wah'da akşam yemeği",
      "Paper Apps: The Games",
      "Dodo'da kahvaltı",
      "De Slak'ta akşam yemeği",
      "Sage bottomless portafiltre",
      "Kazımalı dünya haritası",
    ],
  );
  assert.equal(proof.prizes[1]?.game, "Hafıza kartları");
  assert.equal(proof.prizes[1]?.desc, "Eindhoven'daki Mei Wah'da akşam yemeği.");
});

test("the Proof carries the day it is printed, written the Turkish way", async () => {
  assert.equal((await proofOf(anEvening(), BIRTHDAY)).date, "9 Aralık 2026");
  // A casual Round months later, printed then: a month with Turkish letters.
  assert.equal((await proofOf(anEvening(), new Date(2027, 7, 1))).date, "1 Ağustos 2027");
});

test("the Proof prints the Save code Yedekle shows, with its last 6 characters as the check code; the paper restores her progress", async () => {
  const ledger = anEvening();
  const proof = await proofOf(ledger, BIRTHDAY);

  // The same facts, the same code, character for character (story 94).
  assert.equal(proof.code, (await ledger.toSaveCode()).code);
  assert.match(proof.code, /^[A-Za-z0-9_-]+$/);

  // The check code Atıl reads off the paper and off her screen (#175): six
  // uppercase hex characters, the tail of the code itself.
  assert.match(proof.check, /^[0-9A-F]{6}$/);
  assert.equal(proof.check, proof.code.slice(-6));

  // The paper is the last backup: typed back in, it holds the same Gifts.
  const another = createLedger(memoryStore());
  assert.equal((await another.restore(proof.code)).ok, true);
  assert.deepEqual([...another.held().keys()], ["rocky", "resim"]);
  assert.deepEqual(another.prizesWon(), ["nerede", "hafiza", "wordle", "sarki", "piyano", "kadraj", "slot"]);
});
