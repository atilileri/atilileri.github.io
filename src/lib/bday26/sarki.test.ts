/*
 * Tests for a name-the-song Round (#204; spec #192 "Name the song", simple
 * Games keys #182, song pool #187): the deal and the rules with no DOM.
 *
 *   node --test src/lib/bday26/sarki.test.ts
 *
 * Expected values are the spec's (10 of 20, 3 wrong titles from the pool,
 * keys 1–4 and A–D) checked on a fixed random source, never the deal's own
 * output fed back in.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { choiceOfKey, createQuiz, dealQuiz } from "./sarki.ts";

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

test("a Round: a hit counts no miss, a miss counts one, the second pick on a question is ignored, next moves on", () => {
  const quiz = createQuiz(dealQuiz(POOL, seeded()));
  assert.equal(quiz.index, 0);
  assert.equal(quiz.picked, undefined);

  // Before an answer, next does nothing.
  quiz.next();
  assert.equal(quiz.index, 0);

  assert.equal(quiz.pick(quiz.question.answer), true);
  assert.equal(quiz.misses, 0);
  assert.equal(quiz.picked, quiz.question.answer);
  // Changing her mind is not allowed: the Round already counted it.
  assert.equal(quiz.pick((quiz.question.answer + 1) % 4), false);
  assert.equal(quiz.misses, 0);

  quiz.next();
  assert.equal(quiz.index, 1);
  assert.equal(quiz.picked, undefined);
  const wrong = (quiz.question.answer + 1) % 4;
  assert.equal(quiz.pick(wrong), false);
  assert.equal(quiz.misses, 1);
  assert.equal(quiz.picked, wrong);
});

test("a Round is over when the tenth question is answered, and next goes nowhere after that", () => {
  const quiz = createQuiz(dealQuiz(POOL, seeded()));
  for (let i = 0; i < 9; i++) {
    quiz.pick(quiz.question.answer);
    assert.equal(quiz.done, false);
    quiz.next();
  }
  assert.equal(quiz.index, 9);
  assert.equal(quiz.done, false);
  quiz.pick(0);
  assert.equal(quiz.done, true);
  quiz.next();
  assert.equal(quiz.index, 9);
});

test("keys 1–4 and A–D (either case) pick choices A–D; other keys pick nothing", () => {
  assert.deepEqual(["1", "2", "3", "4"].map(choiceOfKey), [0, 1, 2, 3]);
  assert.deepEqual(["a", "b", "c", "d"].map(choiceOfKey), [0, 1, 2, 3]);
  assert.deepEqual(["A", "B", "C", "D"].map(choiceOfKey), [0, 1, 2, 3]);
  for (const key of ["5", "e", " ", "r", "Enter", "Escape", "ArrowDown", ""]) assert.equal(choiceOfKey(key), undefined, key);
});

test("the Round keeps her pick for every question, in order, for the result list", () => {
  const questions = [
    { title: "Song 1", choices: ["Song 1", "Song 2", "Song 3", "Song 4"], answer: 0 },
    { title: "Song 5", choices: ["Song 6", "Song 5", "Song 7", "Song 8"], answer: 1 },
    { title: "Song 9", choices: ["Song 10", "Song 11", "Song 9", "Song 12"], answer: 2 },
  ];
  const quiz = createQuiz(questions);
  assert.deepEqual(quiz.picks, [undefined, undefined, undefined]);
  quiz.pick(0); // right
  quiz.next();
  quiz.pick(3); // wrong: Song 8
  quiz.pick(1); // a second pick on the same question is ignored
  quiz.next();
  quiz.pick(2); // right
  assert.deepEqual(quiz.picks, [0, 3, 2]);
  assert.equal(quiz.done, true);
});
