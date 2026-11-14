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
import { memoryScore } from "./scores.ts";

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
