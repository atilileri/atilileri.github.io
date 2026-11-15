/*
 * Tests for the score functions: one Round's raw facts in, a 0..100 score out.
 *
 *   node --test src/lib/bday26/scores.test.ts
 *
 * Seam 1 of the spec (#192, "Testing Decisions"): the score functions are
 * pure, so each Game's row in the "Games and score formulas" table becomes a
 * case here, including the exact 95% edge that wins the Small prize. The
 * expected numbers are the spec's, not the code's.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { memoryScore, missScore, slotScore } from "./scores.ts";

// ------------------------------------------- "Bu nerede?" and name the song
// Spec: 0 misses = 100, 1 = 95, each further miss −10; 95% means at most one
// miss (#199; #204 scores "as Bu nerede?").

test("miss score: a Round without a miss is a perfect 100", () => {
  assert.equal(missScore(0), 100);
});

test("miss score: one miss is exactly 95, the Small prize edge", () => {
  assert.equal(missScore(1), 95);
});

test("miss score: every miss after the first costs 10", () => {
  assert.equal(missScore(2), 85);
  assert.equal(missScore(3), 75);
  assert.equal(missScore(10), 5);
});

test("miss score: eleven misses and more score 0, never less", () => {
  assert.equal(missScore(11), 0);
  assert.equal(missScore(12), 0);
});

// ------------------------------------------------------------ memory match
// Spec: ≤14 moves = 100, −5 per extra move; 95% means ≤15 moves (#194).

test("memory match: 14 moves or fewer is a perfect 100", () => {
  assert.equal(memoryScore(14), 100);
  assert.equal(memoryScore(13), 100);
  assert.equal(memoryScore(8), 100); // 8 pairs: the fewest moves possible
});

test("memory match: 15 moves is exactly 95, the Small prize edge", () => {
  assert.equal(memoryScore(15), 95);
});

test("memory match: every move past 14 costs 5", () => {
  assert.equal(memoryScore(16), 90);
  assert.equal(memoryScore(20), 70);
  assert.equal(memoryScore(33), 5);
});

test("memory match: very many moves score 0, never less", () => {
  assert.equal(memoryScore(34), 0);
  assert.equal(memoryScore(100), 0);
});

// ------------------------------------------------------------ slot machine
// Spec: triple = 100 (the jackpot), pair = 50, none = 0 (#200, #182). The
// reels are what she sees; the score reads them and nothing else.

test("slot machine: three alike is the jackpot, 100", () => {
  assert.equal(slotScore(["heart", "heart", "heart"]), 100);
});

test("slot machine: two alike is 50, wherever the odd one sits", () => {
  assert.equal(slotScore(["camera", "camera", "ski"]), 50);
  assert.equal(slotScore(["camera", "ski", "camera"]), 50);
  assert.equal(slotScore(["ski", "camera", "camera"]), 50);
});

test("slot machine: three different is 0", () => {
  assert.equal(slotScore(["camera", "ski", "note"]), 0);
});
