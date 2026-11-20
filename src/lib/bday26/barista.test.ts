/*
 * Tests for Barista's rules (#217; prototype verdict #216).
 *
 *   node --test src/lib/bday26/barista.test.ts
 *
 * What is pinned: the band and how it narrows per shot, the accelerating
 * fill and its overflow, and a Round of 3 shots × 3 steps scored as the mean
 * of the 9. The step score's flat-top curve and the Round's mean are
 * `scores.ts`'s and pinned in `scores.test.ts`. The expected numbers are
 * the verdict's (band 100 ms half-width at the constant base speed, ×1 /
 * ×0.8 / ×0.62; fill value = target·(t/tt)^1.6; 100 across the inner half,
 * 85 at the band edge, 0 at twice the half-width), worked out by hand for
 * the grind step: 18 g in 1.8 s is 10 g/s, so the half-width at shot 1 is
 * 1 g and the band is 17–19 g. The feel is Atıl's to judge by hand.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { STEPS, createBench, createRound, fillAt, halfWidth, overflowed } from "./barista.ts";
import { baristaStepScore } from "./scores.ts";
import { createEffects, createEffectsPreference } from "./effects.ts";
import { memoryStore } from "./test-store.ts";

const grind = STEPS[0];
const near = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≈ ${b}`);

/** A release at `value` on this step and shot, scored the way the bench
 *  scores it: its distance from the target against the shot's band. The
 *  curve itself is pinned in `scores.test.ts` (`baristaStepScore`). */
const stepScore = (step: (typeof STEPS)[number], shot: number, value: number) => baristaStepScore(value - step.target, halfWidth(step, shot));

test("a release on the grind step at shot 1 is judged against the 17–19 g band", () => {
  assert.equal(stepScore(grind, 0, 18), 100);
  assert.equal(stepScore(grind, 0, 19), 85);
  assert.equal(stepScore(grind, 0, 17), 85);
  assert.equal(stepScore(grind, 0, 20), 0);
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

// ── the bench: holding Space, and the sounds that go with it ─────────

/** The real effects gate over an engine that writes down what it is asked. */
function bench() {
  const log: string[] = [];
  const engine = {
    play: (name: string) => void log.push(`play ${name}`),
    loop: (name: string) => {
      log.push(`start ${name}`);
      return { set: () => {}, stop: () => void log.push(`stop ${name}`) };
    },
    burst: () => {},
    shake: () => void log.push("shake"),
  };
  const fx = createEffects(createEffectsPreference(memoryStore()), engine);
  fx.unlock();
  return { log, b: createBench(fx, "the instruments") };
}

test("holding Space fills the readout; letting go scores the step where it stopped", () => {
  const { b } = bench();
  assert.equal(b.press(1000), true);
  // 0.9 s held of the 1.8 s grind: 18 × 0.5^1.6 ≈ 5.94 g.
  assert.ok(Math.abs(b.value(1900) - 5.94) < 0.01, `${b.value(1900)} g`);
  const r = b.release(2800)!;
  near(r.value, 18);
  assert.equal(r.score, 100);
  assert.equal(b.phase, "shown");
  assert.equal(b.round.results.length, 1);
});

test("the grinder whirs while Space is held on the grind step and stops on release, with a chime in the band", () => {
  const { log, b } = bench();
  b.press(0);
  assert.deepEqual(log, ["start grind"]);
  b.release(1800);
  assert.deepEqual(log, ["start grind", "stop grind", "play chime"]);
});

test("the tamp is one thud on the press; a release outside the band bonks and shakes", () => {
  const { log, b } = bench();
  b.press(0);
  b.release(1800);
  log.length = 0;
  b.press(5000);
  assert.deepEqual(log, ["play thud"]);
  b.release(5100); // a tenth of a second: nowhere near 15 kg
  assert.deepEqual(log, ["play thud", "play bonk", "shake"]);
});

test("the pour runs while Space is held on the pull step; Esc drops the hold, stops the pour and scores nothing", () => {
  const { log, b } = bench();
  b.press(0);
  b.release(1800);
  b.press(5000);
  b.release(6500);
  log.length = 0;
  b.press(10000);
  assert.deepEqual(log, ["start pour"]);
  b.drop();
  assert.deepEqual(log, ["start pour", "stop pour"]);
  assert.equal(b.round.results.length, 2);
  assert.equal(b.phase, "ready");
  // The step waits for her: the next press is the same pull.
  b.press(20000);
  assert.equal(b.round.current()!.step.key, "pull");
});

test("held to the top, the step ends by itself at the top, scoring 0, and the grinder stops", () => {
  const { log, b } = bench();
  b.press(0);
  assert.equal(b.tick(2000), undefined);
  const r = b.tick(10000)!;
  assert.equal(r.value, 24);
  assert.equal(r.score, 0);
  assert.deepEqual(log, ["start grind", "stop grind", "play bonk", "shake"]);
  // The release that follows changes nothing.
  assert.equal(b.release(10100), undefined);
  assert.equal(b.round.results.length, 1);
});

test("after a step she has a quarter of a second to read it; then a press starts the next step", () => {
  const { b } = bench();
  b.press(0);
  b.release(1800);
  assert.equal(b.press(1900), false);
  assert.equal(b.phase, "shown");
  assert.equal(b.press(2100), true);
  assert.equal(b.phase, "holding");
  assert.equal(b.round.current()!.step.key, "tamp");
});

test("after the ninth step no press starts a tenth", () => {
  const { b } = bench();
  let t = 0;
  for (let i = 0; i < 9; i++) {
    const step = b.round.current()!.step;
    b.press(t);
    b.release(t + step.tt * 1000);
    t += 10000;
  }
  assert.equal(b.round.done, true);
  assert.equal(b.press(t), false);
  assert.equal(b.round.score, 100);
});
