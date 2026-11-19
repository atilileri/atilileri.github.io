/*
 * Tests for the choice quizzes' shared answer step.
 *
 *   node --test src/lib/bday26/choice-quiz.test.ts
 *
 * The clock is node's mock: each test moves time and reads whether the next
 * question came. 1.5 s is #182's pause.
 */
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { createAnswerStep } from "./choice-quiz.ts";

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
