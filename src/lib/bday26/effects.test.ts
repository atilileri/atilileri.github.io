/*
 * Tests for the celebration effects' pure side: her on/off preference and
 * which celebration a right answer gets.
 *
 *   node --test src/lib/bday26/effects.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createEffects, createEffectsPreference, forReducedMotion, milyonerCelebration, neredeCelebration, perfectRoundCelebration, giftCelebration, smallPrizeCelebration, jackpotCelebration, sparkleCelebration } from "./effects.ts";

/** A fixed random stream, so a test reads one known draw. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

test("effects are on for a first visit", () => {
  assert.equal(createEffectsPreference(memoryStore()).on, true);
});

test("turning effects off is remembered on the next visit, and on again too", () => {
  const store = memoryStore();
  createEffectsPreference(store).toggle();
  assert.equal(createEffectsPreference(store).on, false);
  createEffectsPreference(store).toggle();
  assert.equal(createEffectsPreference(store).on, true);
});

test("a blocked storage still gives effects, on by default, and the switch works for this visit", () => {
  const blocked = blockedStore();
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

// ── the gate: every sound and visual goes through it ──────────────────

/** A recording engine: what reached the speakers and the screen. */
function recorder() {
  const log: string[] = [];
  const engine = {
    play: (name: string) => void log.push(`play ${name}`),
    loop: (name: string) => {
      log.push(`start ${name}`);
      return {
        set: (p: Record<string, number>) => void log.push(`set ${name} ${JSON.stringify(p)}`),
        stop: () => void log.push(`stop ${name}`),
      };
    },
    burst: () => void log.push("burst"),
    shake: () => void log.push("shake"),
  };
  return { log, engine };
}

test("with effects off, no sound, loop or burst reaches the engine", () => {
  const { log, engine } = recorder();
  const fx = createEffects(createEffectsPreference(memoryStore({ "bday26:effects": "off" })), engine);
  fx.unlock();
  fx.sound("key");
  fx.loop("engine").start({ speed: 1 });
  fx.celebrate(perfectRoundCelebration(seeded(1)));
  fx.miss();
  assert.deepEqual(log, []);
});

test("switching effects off stops every running loop at once; on again, a wanted loop comes back", () => {
  const { log, engine } = recorder();
  const fx = createEffects(createEffectsPreference(memoryStore()), engine);
  fx.unlock();
  const engineLoop = fx.loop("engine");
  engineLoop.start({ speed: 0.2, throttle: 1 });
  engineLoop.set({ speed: 0.4 });
  log.length = 0;
  fx.toggle();
  assert.deepEqual(log, ["stop engine"]);
  engineLoop.set({ speed: 0.6 });
  fx.sound("bell");
  assert.deepEqual(log, ["stop engine"]);
  fx.toggle();
  assert.deepEqual(log, ["stop engine", "start engine", 'set engine {"speed":0.6,"throttle":1}']);
});

test("nothing sounds before her first gesture; a loop asked for early starts on it", () => {
  const { log, engine } = recorder();
  const fx = createEffects(createEffectsPreference(memoryStore()), engine);
  fx.sound("key");
  fx.loop("swoosh").start({ speed: 0.5 });
  assert.deepEqual(log, []);
  fx.unlock();
  assert.deepEqual(log, ["start swoosh", 'set swoosh {"speed":0.5}']);
  fx.sound("key");
  assert.equal(log.at(-1), "play key");
});

test("stopLoops silences every loop until the Game starts it again", () => {
  const { log, engine } = recorder();
  const fx = createEffects(createEffectsPreference(memoryStore()), engine);
  fx.unlock();
  const car = fx.loop("engine");
  car.start();
  fx.loop("traffic").start();
  log.length = 0;
  fx.stopLoops();
  assert.deepEqual([...log].sort(), ["stop engine", "stop traffic"]);
  car.set({ speed: 1 });
  assert.equal(log.length, 2, "a stopped loop does not restart on set");
  car.start();
  assert.equal(log.at(-2), "start engine");
});

test("gifts: a bought Gift is the biggest party, a Small prize a smaller one, Gifted points a light sparkle", () => {
  const rng = seeded(5);
  const gift = giftCelebration(rng);
  const prize = smallPrizeCelebration(rng);
  const sparkle = sparkleCelebration(rng);
  assert.deepEqual([gift.size, gift.sound], ["grand", "gift-fanfare"]);
  assert.equal(prize.sound, "prize-fanfare");
  assert.deepEqual(sparkle.shapes, ["star"]);
  assert.equal(sparkle.sound, "sparkle");
  assert.ok(gift.particles > prize.particles && prize.particles > sparkle.particles);
});

test("the slot's jackpot: the Small prize's shower with its own bigger fanfare, one sound not two", () => {
  const jackpot = jackpotCelebration(seeded(7));
  const prize = smallPrizeCelebration(seeded(7));
  assert.equal(jackpot.sound, "jackpot-fanfare");
  assert.deepEqual({ ...jackpot, sound: prize.sound }, prize);
});

// Renk karıştır (#218), imported here so the Prize Game builds append apart.
import { renkMatchCelebration } from "./effects.ts";
import { memoryStore, blockedStore } from "./test-store.ts";

test("Renk karıştır: a matched colour is a small puff with the chime, smaller than a Small prize", () => {
  const match = renkMatchCelebration(seeded(3));
  assert.deepEqual([match.size, match.sound], ["puff", "chime"]);
  assert.ok(match.particles < smallPrizeCelebration(seeded(3)).particles);
});
