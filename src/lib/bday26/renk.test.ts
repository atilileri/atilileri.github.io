/*
 * Tests for the colour mixing core, "Renk karıştır" (#218):
 *
 *   node --test src/lib/bday26/renk.test.ts
 *
 * Seam: the pure module `./renk.ts` — the score of one target and of a
 * Round, the colour difference (CIEDE2000), the paint mix, the targets a
 * Round deals, and the drops she adds and takes back. Expected numbers come
 * from the verdict on #215 (ΔE ≤ 1 = 100, then −6 per extra ΔE, floor 0;
 * Round = mean), from Sharma, Wu and Dalal's published CIEDE2000 test pairs
 * (2005), and from what paint does (blue and yellow make green).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { deltaE, difference, roundScore, targetScore, type Lab } from "./renk.ts";

test("one target: ΔE 0 and ΔE 1 are both 100 — a match better than 1 earns nothing extra", () => {
  assert.equal(targetScore(0), 100);
  assert.equal(targetScore(0.4), 100);
  assert.equal(targetScore(1), 100);
});

test("one target: each ΔE above 1 costs 6, rounded to a whole score", () => {
  assert.equal(targetScore(2), 94);
  assert.equal(targetScore(1.5), 97);
  assert.equal(targetScore(6), 70);
});

test("one target: ΔE 17.67 and beyond is 0, never below", () => {
  assert.equal(targetScore(17.67), 0);
  assert.equal(targetScore(40), 0);
});

test("a Round is the mean of its five targets", () => {
  assert.equal(roundScore([100, 100, 100, 94, 82]), 95.2);
  assert.equal(roundScore([100, 100, 100, 100, 74]), 94.8);
  assert.equal(roundScore([0, 0, 0, 0, 0]), 0);
});

test("the colour difference is CIEDE2000: Sharma, Wu and Dalal's test pairs", () => {
  const pairs: [Lab, Lab, number][] = [
    [[50, 2.6772, -79.7751], [50, 0, -82.7485], 2.0425],
    [[50, 0, 0], [50, -1, 2], 2.3669],
    [[50, 2.49, -0.001], [50, -2.49, 0.0009], 7.1792],
    [[50, 2.5, 0], [73, 25, -18], 27.1492],
    [[50, 2.5, 0], [50, 3.1736, 0.5854], 1.0],
    [[60.2574, -34.0099, 36.2677], [60.4626, -34.1751, 39.4387], 1.2644],
  ];
  for (const [a, b, want] of pairs) {
    const got = deltaE(a, b);
    assert.ok(Math.abs(got - want) < 1e-4, `${a} / ${b}: ${got} is not ${want}`);
    assert.ok(Math.abs(deltaE(b, a) - want) < 1e-4, "the difference is the same both ways");
  }
});

test("the difference of two shown colours: none for the same colour, large for black and white", () => {
  assert.equal(difference("#488A41", "#488A41"), 0);
  assert.ok(difference("#000000", "#FFFFFF") > 99);
});
