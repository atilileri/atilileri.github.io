/*
 * Tests for the slot machine's spin: the one draw a Round makes.
 *
 *   node --test src/lib/bday26/slot.test.ts
 *
 * Seam 1 of the spec (#192, "Testing Decisions"): the spin is a pure function
 * of an injected random source, so the two rules Atıl fixed on #182 are pinned
 * here with no browser and no luck. (1) The jackpot chance is EXACTLY 1 in 30
 * (story 53): the outcome is drawn first from one number in [0, 1), and the
 * test hands it the 30 evenly spaced numbers k/30 + ε, so a correct draw hits
 * once and a wrong one (1/29, 1/31, an off-by-one at the edge) hits some
 * other count. (2) When the draw says "no jackpot", the reels never show three
 * alike, over as many spins as it takes to be sure.
 *
 * The random source after the first number only picks symbols, so the tests
 * feed it a small deterministic generator; the expected counts come from the
 * spec, not from the generator.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spin, SLOT_SYMBOLS } from "./slot.ts";

/** A random source whose FIRST number is `first`, then a fixed stream in
 *  [0, 1) that is not Math.random (an LCG, so every run is the same). */
function source(first: number, seed = 1): () => number {
  let n = 0;
  let state = seed >>> 0;
  return () => {
    if (n++ === 0) return first;
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

// ------------------------------------------------------------ the jackpot

test("the jackpot comes up on exactly 1 of 30 evenly spaced draws, from either side of the thirtieths", () => {
  const EPSILON = 1e-9;
  const hits = (draws: number[]) =>
    draws.filter((r, i) => spin(source(r, i + 1)).outcome === "jackpot").length;

  // Just above each thirtieth: only 0 + ε is a jackpot (1/29 would give 2).
  const above = Array.from({ length: 30 }, (_, k) => k / 30 + EPSILON);
  assert.equal(hits(above), 1);
  // Just below each thirtieth: only 1/30 − ε is a jackpot (1/31 would give 0).
  const below = Array.from({ length: 30 }, (_, k) => (k + 1) / 30 - EPSILON);
  assert.equal(hits(below), 1);
});

test("a jackpot shows three alike, and the symbol is one of the six", () => {
  const result = spin(source(0, 7));
  assert.equal(result.outcome, "jackpot");
  const [a, b, c] = result.reels;
  assert.equal(a, b);
  assert.equal(b, c);
  assert.ok(SLOT_SYMBOLS.includes(a));
});

// -------------------------------------------------------- every other spin

test("a spin that is not the jackpot never shows three alike, and names what it shows", () => {
  let pairs = 0;
  let nones = 0;
  for (let i = 0; i < 20_000; i++) {
    // The first number is well past the jackpot's thirtieth; the rest vary.
    const result = spin(source(0.5, i + 1));
    const [a, b, c] = result.reels;
    assert.notEqual(result.outcome, "jackpot");
    assert.ok(!(a === b && b === c), `triple on a non-jackpot spin: ${result.reels}`);
    for (const s of result.reels) assert.ok(SLOT_SYMBOLS.includes(s));
    const alike = a === b || b === c || a === c;
    assert.equal(result.outcome, alike ? "pair" : "none");
    if (alike) pairs += 1;
    else nones += 1;
  }
  // Both faces of "not the jackpot" happen; the machine is not rigged to one.
  assert.ok(pairs > 1000 && nones > 1000, `pairs ${pairs}, nones ${nones}`);
});
