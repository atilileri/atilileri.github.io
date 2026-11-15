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
import { memoryScore, milyonerScore, missScore, slotScore, wordleScore } from "./scores.ts";

// ---------------------------------------------------------- Milyoner quiz
// Spec: correct answers before the first miss ÷ 12; 95% means all 12
// correct (#198, #182). Read as a percent and rounded down, so 11 of 12 is
// 91 — below the Small prize bar — and only a full ladder wins Yemek Kartı.

test("Milyoner: all 12 correct is a perfect 100, the only score over 95", () => {
  assert.equal(milyonerScore(12), 100);
});

test("Milyoner: 11 correct is 91, short of the Small prize", () => {
  assert.equal(milyonerScore(11), 91);
});

test("Milyoner: half the ladder is 50", () => {
  assert.equal(milyonerScore(6), 50);
});

test("Milyoner: a miss on the first question scores 0", () => {
  assert.equal(milyonerScore(0), 0);
});

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

// ---------------------------------------------------------- Turkish Wordle
// Spec: 1–3 guesses = 100, 4 = 95, 5 = 80, 6 = 65, unsolved = 0; 95% means
// solved in at most 4 guesses (#201, #188, #174).

test("Wordle: solved in 1, 2 or 3 guesses is a perfect 100", () => {
  assert.equal(wordleScore(1, true), 100);
  assert.equal(wordleScore(2, true), 100);
  assert.equal(wordleScore(3, true), 100);
});

test("Wordle: solved in 4 guesses is exactly 95, the Small prize edge", () => {
  assert.equal(wordleScore(4, true), 95);
});

test("Wordle: solved in 5 guesses is 80", () => {
  assert.equal(wordleScore(5, true), 80);
});

test("Wordle: solved on the sixth and last guess is 65", () => {
  assert.equal(wordleScore(6, true), 65);
});

test("Wordle: six guesses without the answer score 0", () => {
  assert.equal(wordleScore(6, false), 0);
});
