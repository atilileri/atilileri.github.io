/*
 * Tests for "Bavul hazırla" (#219): the score, the trip cards and the one
 * input state machine.
 *
 *   node --test src/lib/bday26/bavul.test.ts
 *
 * Expected values come from the verdict on #214, not from the code: score =
 * 100 − 5 × empty cells − 10 × missing must-haves, floor 0; 23 kg is a gate
 * on closing; the input table (select, cancel, place / pick up, move, rotate,
 * take out, close). The stored packs below are the prototype's exact-cover
 * search results (`prototype/214-bavul`, SOL): per card the lightest perfect
 * pack ("ok", ≤ 23 kg) and a heavy one ("heavy", a trap). They are test data
 * only: she never sees them.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { bavulScore } from "./bavul.ts";

// ---------------------------------------------------------------- the score

test("a full bag with every must-have scores 100", () => {
  assert.equal(bavulScore({ empty: 0, missing: 0 }), 100);
});

test("one empty cell is 95, still the Small prize; two are 90", () => {
  assert.equal(bavulScore({ empty: 1, missing: 0 }), 95);
  assert.equal(bavulScore({ empty: 2, missing: 0 }), 90);
});

test("a missing must-have costs 10", () => {
  assert.equal(bavulScore({ empty: 0, missing: 1 }), 90);
  assert.equal(bavulScore({ empty: 1, missing: 1 }), 85);
});

test("the score never goes under 0: an empty bag is 0", () => {
  assert.equal(bavulScore({ empty: 48, missing: 4 }), 0);
  assert.equal(bavulScore({ empty: 19, missing: 1 }), 0);
});
