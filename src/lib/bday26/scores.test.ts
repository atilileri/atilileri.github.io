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
import { drivingScore, framingScore, hikingScore, memoryScore, milyonerScore, missScore, pianoScore, skiScore, slotScore, wordleScore } from "./scores.ts";

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

// ------------------------------------------------------------------ piano
// Spec: hit accuracy × song cap (Kolay 0.70, Orta 0.85, Zor 1.00); 95% means
// 95% accuracy on Zor (#205, #180). Accuracy is the notes she hit out of all
// the notes the song dropped; stray presses cost nothing. Read as a percent
// and rounded down, like every score she sees.

test("piano: every note hit on Zor is a perfect 100", () => {
  assert.equal(pianoScore(240, 240, 1.0), 100);
});

test("piano: 95% accuracy on Zor is exactly 95, the Small prize edge", () => {
  assert.equal(pianoScore(95, 100, 1.0), 95);
  assert.equal(pianoScore(228, 240, 1.0), 95);
});

test("piano: just under 95% accuracy on Zor falls to 94, short of the Small prize", () => {
  assert.equal(pianoScore(227, 240, 1.0), 94); // 94.58%
});

test("piano: every note hit on Kolay is capped at 70", () => {
  assert.equal(pianoScore(90, 90, 0.7), 70);
});

test("piano: every note hit on Orta is capped at 85", () => {
  assert.equal(pianoScore(120, 120, 0.85), 85);
});

test("piano: the cap scales a partial Round too, rounded down", () => {
  assert.equal(pianoScore(80, 100, 0.85), 68); // 80% × 0.85
  assert.equal(pianoScore(50, 90, 0.7), 38); // 55.6% × 0.70 = 38.9
});

test("piano: no note hit scores 0, and so does a song without notes", () => {
  assert.equal(pianoScore(0, 120, 1.0), 0);
  assert.equal(pianoScore(0, 0, 1.0), 0);
});

// ------------------------------------------------------------- hiking map
// Spec: ≤10% over the shortest = 100, then −1 per 1% over, rounded down,
// floor 0; 95% means at most 15% over (#202, #183). Lengths in metres, her
// route first. The shortest here is a round 10 km so each row reads plainly.

test("hiking map: the shortest route itself is a perfect 100", () => {
  assert.equal(hikingScore(10_000, 10_000), 100);
});

test("hiking map: exactly 10% over the shortest is still 100, the free margin", () => {
  assert.equal(hikingScore(11_000, 10_000), 100);
  assert.equal(hikingScore(8_775 * 1.1, 8_775), 100); // Kartal Tepesi's shortest
});

test("hiking map: 15% over is exactly 95, the Small prize edge", () => {
  assert.equal(hikingScore(11_500, 10_000), 95);
  assert.equal(hikingScore(8_775 * 1.15, 8_775), 95);
});

test("hiking map: just past 15% over falls to 94, rounded down", () => {
  assert.equal(hikingScore(11_510, 10_000), 94); // 15.1% over
});

test("hiking map: 20% over is 90, one point per 1% past the margin", () => {
  assert.equal(hikingScore(12_000, 10_000), 90);
  assert.equal(hikingScore(15_000, 10_000), 60);
});

test("hiking map: 110% over and further scores 0, never less", () => {
  assert.equal(hikingScore(21_000, 10_000), 0);
  assert.equal(hikingScore(40_000, 10_000), 0);
});

// ---------------------------------------------------------- photo framing
// Spec: 0.95 × mean of the best 4 photos + 0.05 × worst; 95% means four
// near-perfect crops (#203, #184). The per-photo scores come from
// `scoreCrop` in `./kadraj.ts`; this is only how five of them make a Round.

test("photo framing: five perfect crops are a perfect 100", () => {
  assert.equal(framingScore([100, 100, 100, 100, 100]), 100);
});

test("photo framing: four perfect crops and one miss are exactly 95, the Small prize edge", () => {
  assert.equal(framingScore([100, 100, 0, 100, 100]), 95);
});

test("photo framing: the worst photo counts a twentieth, the best four the rest", () => {
  // best four 100, 90, 80, 70 → mean 85 → 80.75; worst 60 → 3
  assert.equal(framingScore([90, 60, 100, 70, 80]), 83.75);
  // best four mean 99 → 94.05; worst 20 → 1: one weak crop still clears 95
  assert.equal(framingScore([100, 96, 100, 20, 100]), 95.05);
});

test("photo framing: five crops at 94 stay under the bar", () => {
  assert.equal(framingScore([94, 94, 94, 94, 94]), 94);
});

test("photo framing: five misses score 0", () => {
  assert.equal(framingScore([0, 0, 0, 0, 0]), 0);
});

// ------------------------------------------------- driving in the Netherlands
// Spec: 100 − 10 × heavy − 3 × light, floor 0; 95% means no heavy mistake and
// at most one light one (#206, #181). The soft time limit's −3 at 150 s and
// again every 20 s are light mistakes like any other; `surus.test.ts` counts
// them, this only prices them.

test("driving: a clean drive is a perfect 100", () => {
  assert.equal(drivingScore(0, 0), 100);
});

test("driving: one light mistake is 97, still over the Small prize bar", () => {
  assert.equal(drivingScore(0, 1), 97);
});

test("driving: one heavy mistake is 90, short of the Small prize", () => {
  assert.equal(drivingScore(1, 0), 90);
});

test("driving: the 95% edge sits between one light mistake (97) and two (94)", () => {
  assert.ok(drivingScore(0, 1) >= 95);
  assert.equal(drivingScore(0, 2), 94); // over time by 25 s: −3 at 150 s and at 170 s
  assert.ok(drivingScore(0, 2) < 95);
});

test("driving: heavy and light add up, and the score never drops below 0", () => {
  assert.equal(drivingScore(2, 3), 71);
  assert.equal(drivingScore(10, 0), 0);
  assert.equal(drivingScore(9, 5), 0);
});

// ------------------------------------------------------- ski platformer
// Spec: flags ÷ 72; no finish = no score; 95% means at least 69 flags (#207,
// #179). As a percent, rounded down. A Round that never reaches the finish
// has no score at all, so the shell records nothing for it.

test("ski: all 72 flags is a perfect 100", () => {
  assert.equal(skiScore(72, true), 100);
});

test("ski: 69 flags clears the 95% bar, the Small prize edge", () => {
  assert.equal(skiScore(69, true), 95);
});

test("ski: 68 flags falls short of 95", () => {
  assert.equal(skiScore(68, true), 94);
});

test("ski: half the flags is 50, and none is 0", () => {
  assert.equal(skiScore(36, true), 50);
  assert.equal(skiScore(0, true), 0);
});

test("ski: a Round that does not reach the finish has no score, whatever it collected", () => {
  assert.equal(skiScore(72, false), undefined);
  assert.equal(skiScore(40, false), undefined);
});
