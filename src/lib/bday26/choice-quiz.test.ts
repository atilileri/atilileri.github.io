/*
 * Tests for what the three choice quizzes share ("Bu nerede?", "Şarkıyı
 * bil", Milyoner): the Round's answer state, the keys that pick, the
 * result card's miss line, and the answer step.
 *
 *   node --test src/lib/bday26/choice-quiz.test.ts
 *
 * The questions are written out by hand, so every expected pick and count
 * is read off the literal, not off a deal. For the answer step the clock is
 * node's mock: each test moves time and reads whether the next question
 * came. 1.5 s is #182's pause.
 */
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { choiceOfKey, createAnswerStep, createChoiceQuiz, missDetail } from "./choice-quiz.ts";

function step(answered = () => true) {
  mock.timers.enable({ apis: ["setTimeout"] });
  const ran = { next: 0 };
  const s = createAnswerStep(() => void (ran.next += 1), answered);
  return { s, ran };
}

test("after her answer the next question comes by itself after 1.5 s", (t) => {
  const { s, ran } = step();
  t.after(() => mock.timers.reset());
  s.wait();
  mock.timers.tick(1499);
  assert.equal(ran.next, 0);
  mock.timers.tick(1);
  assert.equal(ran.next, 1);
});

test("the confirm-leave card stops the wait; closing it starts the full pause again", (t) => {
  const { s, ran } = step();
  t.after(() => mock.timers.reset());
  s.wait();
  mock.timers.tick(1000);
  s.pause();
  mock.timers.tick(5000);
  assert.equal(ran.next, 0);
  s.resume();
  mock.timers.tick(1499);
  assert.equal(ran.next, 0);
  mock.timers.tick(1);
  assert.equal(ran.next, 1);
});

test("closing the card with no answer showing starts nothing; a cancel stops the wait", (t) => {
  let answered = false;
  const { s, ran } = step(() => answered);
  t.after(() => mock.timers.reset());
  s.resume();
  mock.timers.tick(5000);
  assert.equal(ran.next, 0);

  answered = true;
  s.wait();
  s.cancel();
  mock.timers.tick(5000);
  assert.equal(ran.next, 0);
});

/** Three questions; the right choice is A, B and C in turn. */
const THREE = [
  { choices: ["a1", "a2", "a3", "a4"], answer: 0 },
  { choices: ["b1", "b2", "b3", "b4"], answer: 1 },
  { choices: ["c1", "c2", "c3", "c4"], answer: 2 },
];

test("a Round opens on its first question with nothing picked", () => {
  const quiz = createChoiceQuiz(THREE);
  assert.equal(quiz.index, 0);
  assert.equal(quiz.question, THREE[0]);
  assert.equal(quiz.picked, undefined);
  assert.deepEqual(quiz.picks, [undefined, undefined, undefined]);
  assert.equal(quiz.misses, 0);
  assert.equal(quiz.done, false);
});

test("a hit counts no miss, a miss counts one, and a second pick on the same question is ignored", () => {
  const quiz = createChoiceQuiz(THREE);
  assert.equal(quiz.pick(0), true);
  assert.equal(quiz.misses, 0);
  assert.equal(quiz.pick(2), false);
  assert.equal(quiz.picked, 0);
  assert.equal(quiz.misses, 0);
  quiz.next();
  assert.equal(quiz.pick(3), false);
  assert.equal(quiz.misses, 1);
  assert.equal(quiz.picked, 3);
  assert.equal(quiz.hits, 1);
});

test("next waits for her pick, then moves to the next question", () => {
  const quiz = createChoiceQuiz(THREE);
  quiz.next();
  assert.equal(quiz.index, 0);
  quiz.pick(1);
  quiz.next();
  assert.equal(quiz.index, 1);
  assert.equal(quiz.question, THREE[1]);
  assert.equal(quiz.picked, undefined);
});

test("the Round is over when the last question is answered, and next goes nowhere after that", () => {
  const quiz = createChoiceQuiz(THREE);
  quiz.pick(0);
  quiz.next();
  quiz.pick(0);
  quiz.next();
  assert.equal(quiz.done, false);
  quiz.pick(2);
  assert.equal(quiz.done, true);
  quiz.next();
  assert.equal(quiz.index, 2);
  assert.deepEqual(quiz.picks, [0, 0, 2]);
  assert.equal(quiz.misses, 1);
  assert.equal(quiz.hits, 2);
});

test("with endOnMiss (Milyoner) the first miss ends the Round; hits are the rungs climbed", () => {
  const quiz = createChoiceQuiz(THREE, { endOnMiss: true });
  quiz.pick(0);
  assert.equal(quiz.done, false);
  quiz.next();
  quiz.pick(3);
  assert.equal(quiz.done, true);
  quiz.next();
  assert.equal(quiz.index, 1);
  assert.equal(quiz.hits, 1);
});

test("with endOnMiss and no miss the Round runs to the last question", () => {
  const quiz = createChoiceQuiz(THREE, { endOnMiss: true });
  for (const right of [0, 1]) {
    quiz.pick(right);
    assert.equal(quiz.done, false);
    quiz.next();
  }
  quiz.pick(2);
  assert.equal(quiz.done, true);
  assert.equal(quiz.hits, 3);
});

test("a pick outside the choices is refused and counts nothing", () => {
  const quiz = createChoiceQuiz(THREE);
  assert.equal(quiz.pick(4), false);
  assert.equal(quiz.pick(-1), false);
  assert.equal(quiz.picked, undefined);
  assert.equal(quiz.misses, 0);
});

test("keys 1–4 and A–D (either case) pick choices A–D; other keys pick nothing", () => {
  assert.deepEqual(["1", "2", "3", "4"].map(choiceOfKey), [0, 1, 2, 3]);
  assert.deepEqual(["a", "b", "c", "d"].map(choiceOfKey), [0, 1, 2, 3]);
  assert.deepEqual(["A", "B", "C", "D"].map(choiceOfKey), [0, 1, 2, 3]);
  for (const key of ["5", "e", " ", "r", "y", "s", "Enter", "Escape", "ArrowDown", ""]) {
    assert.equal(choiceOfKey(key), undefined, key);
  }
});

test("the result card's line: a Round with no miss is \"Hatasız tur!\", else the misses counted", () => {
  assert.equal(missDetail(0), "Hatasız tur!");
  assert.equal(missDetail(1), "1 hata");
  assert.equal(missDetail(4), "4 hata");
});
