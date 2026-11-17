/*
 * Tests for the celebration effects' pure side: her on/off preference and
 * which celebration a right answer gets.
 *
 *   node --test src/lib/bday26/effects.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createEffectsPreference, forReducedMotion, milyonerCelebration, neredeCelebration, perfectRoundCelebration } from "./effects.ts";

/** A fixed random stream, so a test reads one known draw. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function memory(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
  };
}

test("effects are on for a first visit", () => {
  assert.equal(createEffectsPreference(memory()).on, true);
});

test("turning effects off is remembered on the next visit, and on again too", () => {
  const store = memory();
  createEffectsPreference(store).toggle();
  assert.equal(createEffectsPreference(store).on, false);
  createEffectsPreference(store).toggle();
  assert.equal(createEffectsPreference(store).on, true);
});

test("a blocked storage still gives effects, on by default, and the switch works for this visit", () => {
  const blocked = {
    getItem: (): string | null => {
      throw new Error("SecurityError");
    },
    setItem: () => {
      throw new Error("QuotaExceeded");
    },
  };
  const pref = createEffectsPreference(blocked);
  assert.equal(pref.on, true);
  assert.equal(pref.toggle(), false);
  assert.equal(pref.on, false);
});

test("Milyoner: the celebration grows with the band, and 12/12 is the biggest", () => {
  const at = (n: number) => milyonerCelebration(n, seeded(7));
  assert.deepEqual([1, 6, 7, 10, 11, 12].map((n) => [at(n).size, at(n).sound]), [
    ["puff", "chime"],
    ["puff", "chime"],
    ["burst", "rich-chime"],
    ["burst", "rich-chime"],
    ["shower", "fanfare"],
    ["grand", "grand-fanfare"],
  ]);
  const particles = [1, 7, 11, 12].map((n) => at(n).particles);
  assert.deepEqual([...particles].sort((a, b) => a - b), particles);
  assert.equal(new Set(particles).size, 4);
});

test("each right answer looks a little different: colours, shapes and direction vary", () => {
  const rng = seeded(42);
  const draws = Array.from({ length: 8 }, () => milyonerCelebration(3, rng));
  assert.ok(new Set(draws.map((d) => d.colors.join())).size > 1, "colours vary");
  assert.ok(new Set(draws.map((d) => d.shapes.join())).size > 1, "shapes vary");
  assert.ok(new Set(draws.map((d) => d.angle)).size > 1, "direction varies");
  for (const d of draws) {
    assert.ok(d.colors.length >= 3);
    assert.ok(d.shapes.length >= 1);
    assert.ok(d.origin.x >= 0 && d.origin.x <= 1 && d.origin.y >= 0 && d.origin.y <= 1);
  }
});

test("Bu nerede?: a cheerful burst and a chime per right answer; a perfect Round gets the grand one", () => {
  const rng = seeded(3);
  const hit = neredeCelebration(rng);
  assert.deepEqual([hit.size, hit.sound], ["burst", "chime"]);
  const perfect = perfectRoundCelebration(rng);
  assert.deepEqual([perfect.size, perfect.sound], ["grand", "grand-fanfare"]);
  assert.ok(perfect.particles > hit.particles);
});

test("reduced motion: the same sound, far fewer particles", () => {
  const full = milyonerCelebration(12, seeded(5));
  const calm = forReducedMotion(full);
  assert.equal(calm.sound, "grand-fanfare");
  assert.ok(calm.particles <= full.particles / 5);
  assert.equal(forReducedMotion(milyonerCelebration(2, seeded(5))).particles, 0);
});
