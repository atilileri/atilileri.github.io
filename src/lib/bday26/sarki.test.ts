/*
 * Tests for a name-the-song Round (#204; spec #192 "Name the song", simple
 * Games keys #182, song pool #187): the deal and the rules with no DOM.
 *
 *   node --test src/lib/bday26/sarki.test.ts
 *
 * The Round's answer state and keys are `choice-quiz.test.ts`'s.
 *
 * Expected values are the spec's (10 of 20, 3 wrong titles from the pool)
 * checked on a fixed random source, never the deal's own
 * output fed back in.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { dealQuiz } from "./sarki.ts";

const POOL = Array.from({ length: 20 }, (_, i) => `Song ${i + 1}`);

/** A deterministic random source: a fixed sequence, repeated. */
function seeded(seed = 1): () => number {
  let x = seed;
  return () => {
    x = (x * 1103515245 + 12345) % 2147483648;
    return x / 2147483648;
  };
}

test("a Round deals 10 different songs out of the 20, each with the right title among 4 choices", () => {
  const deal = dealQuiz(POOL, seeded());
  assert.equal(deal.length, 10);
  assert.equal(new Set(deal.map((q) => q.title)).size, 10);
  for (const q of deal) {
    assert.equal(q.choices.length, 4);
    assert.equal(q.choices[q.answer], q.title);
    for (const c of q.choices) assert.ok(POOL.includes(c), `${c} is not in the pool`);
  }
});

test("the 3 wrong titles are other songs of the pool, all different, and every draw differs", () => {
  for (const seed of [1, 2, 3, 42]) {
    for (const q of dealQuiz(POOL, seeded(seed))) {
      const wrong = q.choices.filter((c) => c !== q.title);
      assert.equal(wrong.length, 3);
      assert.equal(new Set(wrong).size, 3);
    }
  }
  // Two Rounds are not the same ten songs in the same order.
  assert.notDeepEqual(
    dealQuiz(POOL, seeded(1)).map((q) => q.title),
    dealQuiz(POOL, seeded(2)).map((q) => q.title),
  );
});

test("the right title sits at every position over many deals, so the answer is never always A", () => {
  const seen = new Set<number>();
  for (let seed = 1; seed < 40; seed++) for (const q of dealQuiz(POOL, seeded(seed))) seen.add(q.answer);
  assert.deepEqual([...seen].sort(), [0, 1, 2, 3]);
});
