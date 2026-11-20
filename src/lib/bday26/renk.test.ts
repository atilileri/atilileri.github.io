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
import {
  addDrop,
  countsOf,
  judge,
  removeAt,
  removeLast,
  deltaE,
  difference,
  DROP_CAP,
  hexToLab,
  mixColour,
  pickRound,
  ROUND_TARGETS,
  roundScore,
  sameProportion,
  targetPool,
  targetScore,
  TUBES,
  type Lab,
  type Target,
} from "./renk.ts";

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

/** "#RRGGBB" as [r, g, b], 0..255. */
const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

test("the mix behaves like paint: blue and yellow give a green, not a grey", () => {
  const green = mixColour([0, 1, 1, 0, 0]);
  assert.ok(green);
  const [r, g, b] = rgb(green);
  assert.ok(g! > r! && g! > b!, `${green} is not green`);
  assert.ok(hexToLab(green)[1] < -20, `${green} has too little green in it`);
});

test("the mix: no drops is no colour; one tube alone is that tube's colour; 2 + 2 is 1 + 1", () => {
  assert.equal(mixColour([0, 0, 0, 0, 0]), null);
  assert.ok(difference(mixColour([0, 0, 3, 0, 0])!, TUBES[2]!.hex) < 0.5);
  assert.equal(mixColour([2, 2, 0, 0, 0]), mixColour([1, 1, 0, 0, 0]));
});

/** A fixed random stream, so a test reads one known draw. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const POOL = targetPool();

test("every target can be matched exactly within 12 drops: its hidden recipe makes it", () => {
  assert.ok(POOL.length > 500, `only ${POOL.length} targets`);
  for (const t of POOL) {
    const drops = t.recipe.reduce((a, b) => a + b, 0);
    assert.ok(drops >= 3 && drops <= DROP_CAP, `${t.recipe}: ${drops} drops`);
    assert.equal(difference(mixColour(t.recipe)!, t.hex), 0);
    assert.equal(targetScore(difference(mixColour(t.recipe)!, t.hex)), 100);
  }
});

test("a target's recipe uses 2 to 4 tubes and is neither near-black nor near-white", () => {
  for (const t of POOL) {
    const tubes = t.recipe.filter((n) => n > 0).length;
    assert.ok(tubes >= 2 && tubes <= 4, `${t.recipe}: ${tubes} tubes`);
    const L = hexToLab(t.hex)[0];
    assert.ok(L >= 25 && L <= 90, `${t.recipe} ${t.hex}: L* ${L}`);
  }
});

test("drops: 1–5 add one, Backspace takes the last back, a click takes back just the one clicked", () => {
  let drops: readonly number[] = [];
  drops = addDrop(drops, 0);
  drops = addDrop(drops, 2);
  drops = addDrop(drops, 0);
  drops = addDrop(drops, 4);
  assert.deepEqual(drops, [0, 2, 0, 4]);
  assert.deepEqual(countsOf(drops), [2, 0, 1, 0, 1]);
  assert.deepEqual(removeLast(drops), [0, 2, 0]);
  assert.deepEqual(removeAt(drops, 1), [0, 0, 4]);
  assert.deepEqual(drops, [0, 2, 0, 4], "the old list is left as it was");
  assert.deepEqual(removeLast([]), []);
  assert.deepEqual(removeAt([1], 3), [1], "a drop that is not there changes nothing");
});

test("drops: the 13th is refused", () => {
  let drops: readonly number[] = [];
  for (let i = 0; i < DROP_CAP; i++) drops = addDrop(drops, i % 5);
  assert.equal(drops.length, 12);
  assert.equal(addDrop(drops, 1), drops);
});

test("judging a mix: its ΔE and score; a different recipe within ΔE 1 counts, and says so", () => {
  const target = POOL.find((t) => t.recipe.join() === "2,1,0,0,0")!;
  const exact = judge(target, [0, 1, 0]);
  assert.equal(exact.dE, 0);
  assert.equal(exact.score, 100);
  assert.equal(exact.otherRecipe, false);
  assert.equal(judge(target, [0, 0, 0, 0, 1, 1]).otherRecipe, false, "4 + 2 is the same recipe as 2 + 1");

  const off = judge(target, [0, 1]);
  assert.ok(off.dE > 1);
  assert.equal(off.score, targetScore(off.dE));
  assert.equal(off.otherRecipe, false, "a miss is not another recipe");

  // Some target in the pool has a clearly different recipe within ΔE 1 of it
  // (paint has twins: black with white can stand in for red with blue).
  let twin: readonly [Target, Target] | undefined;
  for (const t of POOL) {
    const u = POOL.find((u) => deltaE(t.lab, u.lab) <= 1 && !sameProportion(t.recipe, u.recipe));
    if (u) {
      twin = [t, u];
      break;
    }
  }
  assert.ok(twin, "the pool has two recipes that look alike");
  const [t, u] = twin;
  const drops = u.recipe.flatMap((n, i) => Array<number>(n).fill(i));
  const verdict = judge(t, drops);
  assert.equal(verdict.score, 100);
  assert.equal(verdict.otherRecipe, true);
});

test("a Round deals five targets from the pool, each at least ΔE 15 from the others", () => {
  for (const seed of [1, 7, 42, 2026, 99991]) {
    const round = pickRound(POOL, seeded(seed));
    assert.equal(round.length, ROUND_TARGETS);
    for (const t of round) assert.ok(POOL.includes(t));
    for (let i = 0; i < round.length; i++) {
      for (let j = i + 1; j < round.length; j++) {
        assert.ok(difference(round[i]!.hex, round[j]!.hex) >= 15, `seed ${seed}: ${round[i]!.hex} and ${round[j]!.hex}`);
      }
    }
  }
});
