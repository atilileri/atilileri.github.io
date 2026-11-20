/*
 * Tests for Barista's rules (#217; prototype verdict #216).
 *
 *   node --test src/lib/bday26/barista.test.ts
 *
 * What is pinned: the step score's flat-top curve, the band and how it
 * narrows per shot, the accelerating fill and its overflow, and a Round of
 * 3 shots × 3 steps scored as the mean of the 9. The expected numbers are
 * the verdict's (band 100 ms half-width at the constant base speed, ×1 /
 * ×0.8 / ×0.62; fill value = target·(t/tt)^1.6; 100 across the inner half,
 * 85 at the band edge, 0 at twice the half-width), worked out by hand for
 * the grind step: 18 g in 1.8 s is 10 g/s, so the half-width at shot 1 is
 * 1 g and the band is 17–19 g. The feel is Atıl's to judge by hand.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { STEPS, createRound, fillAt, halfWidth, overflowed, roundScore, stepScore } from "./barista.ts";

const grind = STEPS[0];
const near = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≈ ${b}`);

test("a step released at the centre scores 100", () => {
  assert.equal(stepScore(grind, 0, 18), 100);
});

test("the inner half of the band scores 100 right up to its edge", () => {
  assert.equal(stepScore(grind, 0, 18.5), 100);
  assert.equal(stepScore(grind, 0, 17.5), 100);
  assert.equal(stepScore(grind, 0, 18.3), 100);
});

test("the band edge scores 85, on either side", () => {
  assert.equal(stepScore(grind, 0, 19), 85);
  assert.equal(stepScore(grind, 0, 17), 85);
});

test("twice the half-width scores 0, and further out stays 0", () => {
  assert.equal(stepScore(grind, 0, 20), 0);
  assert.equal(stepScore(grind, 0, 16), 0);
  assert.equal(stepScore(grind, 0, 24), 0);
  assert.equal(stepScore(grind, 0, 0), 0);
});

test("between the inner half and the edge the score falls straight from 100 to 85, rounded", () => {
  // 18.75 g is three quarters of the way out: 100 − 15 × 0.5 = 92.5 → 93.
  assert.equal(stepScore(grind, 0, 18.75), 93);
  // Halfway between the edge and twice the half-width: 85 − 42.5 = 42.5 → 43.
  assert.equal(stepScore(grind, 0, 19.5), 43);
});

test("the band narrows each shot: ×1, ×0.8, ×0.62 of 100 ms at the base speed", () => {
  // Grind 10 g/s, tamp 10 kg/s, pull 15 g/s.
  near(halfWidth(grind, 0), 1);
  near(halfWidth(grind, 1), 0.8);
  near(halfWidth(grind, 2), 0.62);
  near(halfWidth(STEPS[1], 0), 1);
  near(halfWidth(STEPS[2], 0), 1.5);
  near(halfWidth(STEPS[2], 2), 0.93);
  // So one release scores lower on a later shot: 18.8 g is 0.8 of the way
  // out at shot 1 (100 − 15 × 0.6 = 91), the band edge at shot 2 (85), and
  // outside the band at shot 3 (0.8 / 0.62 half-widths: 85 − 85 × 0.29 → 60).
  assert.equal(stepScore(grind, 0, 18.8), 91);
  assert.equal(stepScore(grind, 1, 18.8), 85);
  assert.equal(stepScore(grind, 2, 18.8), 60);
});

test("the fill accelerates: it reaches the target at the base time, 1.6× the base speed there", () => {
  near(fillAt(grind, 0), 0);
  near(fillAt(grind, 1.8), 18);
  near(fillAt(STEPS[1], 1.5), 15);
  near(fillAt(STEPS[2], 2.4), 36);
  // Halfway in time it is well under halfway: 18 × 0.5^1.6 ≈ 5.94 g.
  assert.ok(Math.abs(fillAt(grind, 0.9) - 5.94) < 0.01);
  // The speed at the target: 1.6 × 10 g/s.
  const dt = 1e-6;
  assert.ok(Math.abs((fillAt(grind, 1.8 + dt) - fillAt(grind, 1.8 - dt)) / (2 * dt) - 16) < 1e-3);
});

test("the fill fills once: held to the top it stops there, overflowed, and the step scores 0", () => {
  assert.equal(overflowed(grind, 1.8), false);
  assert.equal(overflowed(grind, 10), true);
  assert.equal(fillAt(grind, 10), 24);
  for (const step of STEPS) {
    assert.equal(fillAt(step, 60), step.max);
    for (const shot of [0, 1, 2]) assert.equal(stepScore(step, shot, step.max), 0);
  }
});

test("a Round's score is the mean of its 9 steps", () => {
  assert.equal(roundScore([100, 100, 100, 100, 100, 100, 100, 100, 100]), 100);
  // Eight perfect steps and one at 55: 855 / 9 = 95, the Small prize bar.
  assert.equal(roundScore([100, 100, 100, 100, 55, 100, 100, 100, 100]), 95);
  // One step held to the top costs a ninth: 800 / 9.
  near(roundScore([100, 100, 100, 100, 100, 100, 100, 100, 0]), 800 / 9);
});

test("a Round walks grind, tamp, pull three times, the band narrowing each shot, then scores the mean", () => {
  const round = createRound();
  const seen: string[] = [];
  // Each step released 0.5 g / kg past the target.
  while (!round.done) {
    const { shot, step } = round.current()!;
    seen.push(`${shot + 1}${step.key}`);
    round.release(step.target + 0.5);
  }
  assert.deepEqual(seen, ["1grind", "1tamp", "1pull", "2grind", "2tamp", "2pull", "3grind", "3tamp", "3pull"]);
  // 0.5 past: grind and tamp (±1, ±0.8, ±0.62) score 100, 96, 91 by shot;
  // pull (±1.5, ±1.2, ±0.93) scores 100, 100, 99.
  assert.deepEqual(round.results.map((r) => r.score), [100, 100, 100, 96, 96, 100, 91, 91, 99]);
  near(round.score!, 873 / 9);
});

test("each released step says where its band was and whether she landed in it", () => {
  const round = createRound();
  const hit = round.release(18.9)!;
  assert.equal(hit.inBand, true);
  near(hit.lo, 17);
  near(hit.hi, 19);
  // Tamp next: 12.9 kg is 2.1 kg under 15, past twice the half-width.
  const miss = round.release(12.9)!;
  assert.equal(miss.inBand, false);
  assert.equal(miss.score, 0);
});

test("a Round has no score until its ninth step, and takes no tenth", () => {
  const round = createRound();
  for (let i = 0; i < 8; i++) round.release(round.current()!.step.target);
  assert.equal(round.done, false);
  assert.equal(round.score, undefined);
  round.release(round.current()!.step.target);
  assert.equal(round.done, true);
  assert.equal(round.score, 100);
  assert.equal(round.current(), undefined);
  assert.equal(round.release(0), undefined);
  assert.equal(round.results.length, 9);
  assert.equal(round.score, 100);
});
