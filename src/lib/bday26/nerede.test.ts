/*
 * Tests for the "Bu nerede?" Round builder: ten photos, four places each,
 * with no DOM.
 *
 *   node --test src/lib/bday26/nerede.test.ts
 *
 * Seam 1 of the spec (#192, "Testing Decisions"): the builder is a plain
 * module and the page only paints what it returns, so the rules of #199 are
 * pinned here: a Round draws 10 different photos of the pool; every question
 * offers 4 different places with the photo's own among them; the 3 wrong
 * places are other photos' places and never one that is the answer, contains
 * it or sits inside it (story 67; the rule of #189). Each test reads what she
 * would see — the photo, the four names, which one is right — and nothing
 * else. Randomness is injected (the one thing mocked here).
 *
 * `POOL` below is a hand-made pool with the shapes of the real one: a place
 * on two photos (Antalya), a place that is another photo's `inside`
 * (Türkiye, Eindhoven), and a place that contains another by its text alone
 * (Eindhoven Kanalı → Eindhoven). The last test runs the real
 * `photos.json`, so the rule is also known to hold on the 21 photos she gets.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildRound } from "./nerede.ts";
import type { Photo } from "./photos.ts";

const POOL: Photo[] = [
  { file: "p01.webp", square: "p01-sq.webp", place: "Philips de Jong Park", inside: "Eindhoven" },
  { file: "p02.webp", square: "p02-sq.webp", place: "Antalya", inside: "Türkiye" },
  { file: "p03.webp", square: "p03-sq.webp", place: "Ankara", inside: "Türkiye" },
  { file: "p04.webp", square: "p04-sq.webp", place: "Veldhoven" },
  { file: "p05.webp", square: "p05-sq.webp", place: "Valencia" },
  { file: "p06.webp", square: "p06-sq.webp", place: "Eindhoven Kanalı", inside: "Eindhoven" },
  { file: "p07.webp", square: "p07-sq.webp", place: "Lahey" },
  { file: "p08.webp", square: "p08-sq.webp", place: "Eindhoven" },
  { file: "p09.webp", square: "p09-sq.webp", place: "Amsterdam" },
  { file: "p10.webp", square: "p10-sq.webp", place: "Monschau" },
  { file: "p11.webp", square: "p11-sq.webp", place: "Antalya", inside: "Türkiye" },
  { file: "p12.webp", square: "p12-sq.webp", place: "Türkiye" },
  { file: "p13.webp", square: "p13-sq.webp", place: "Düsseldorf" },
  { file: "p14.webp", square: "p14-sq.webp", place: "Gent", inside: "Belçika" },
];

test("a Round is 10 different photos of the pool, in a random order", () => {
  const round = buildRound(POOL, Math.random);
  assert.equal(round.length, 10);
  const files = round.map((q) => q.photo.file);
  assert.equal(new Set(files).size, 10, "no photo twice in one Round");
  for (const q of round) assert.ok(POOL.includes(q.photo), `${q.photo.file} is not in the pool`);
});

test("under every photo stand 4 different places: its own, and 3 that other photos have", () => {
  const places = new Set(POOL.map((p) => p.place));
  for (const q of buildRound(POOL, Math.random)) {
    assert.equal(q.choices.length, 4);
    assert.equal(new Set(q.choices).size, 4, `${q.choices} repeats a place`);
    assert.equal(q.choices[q.answer], q.photo.place, "the right choice is the photo's own place");
    for (const place of q.choices) assert.ok(places.has(place), `${place} is no photo's place`);
  }
});

/** Every wrong place ever offered under a photo of `place`, over many Rounds. */
function wrongChoicesSeen(pool: readonly Photo[], rounds: number): Map<string, Set<string>> {
  const seen = new Map<string, Set<string>>();
  for (let i = 0; i < rounds; i++) {
    for (const q of buildRound(pool, Math.random)) {
      const set = seen.get(q.photo.place) ?? new Set<string>();
      q.choices.forEach((place, j) => j !== q.answer && set.add(place));
      seen.set(q.photo.place, set);
    }
  }
  return seen;
}

test("a wrong place never contains the answer, by `inside` or by its text", () => {
  const seen = wrongChoicesSeen(POOL, 300);
  // Antalya is inside Türkiye: a Türkiye choice under an Antalya photo would be right too.
  assert.ok(!seen.get("Antalya")!.has("Türkiye"), "Antalya offered Türkiye");
  assert.ok(!seen.get("Ankara")!.has("Türkiye"), "Ankara offered Türkiye");
  assert.ok(!seen.get("Gent")!.has("Belçika"), "Gent offered Belçika");
  // Eindhoven Kanalı says Eindhoven in its very name.
  assert.ok(!seen.get("Eindhoven Kanalı")!.has("Eindhoven"), "Eindhoven Kanalı offered Eindhoven");
  // And the pool is big enough that each of them still saw other wrong places.
  assert.ok(seen.get("Antalya")!.size >= 3);
});

test("a wrong place never sits inside the answer, by `inside` or by its text", () => {
  const seen = wrongChoicesSeen(POOL, 300);
  assert.ok(!seen.get("Türkiye")!.has("Antalya"), "Türkiye offered Antalya");
  assert.ok(!seen.get("Türkiye")!.has("Ankara"), "Türkiye offered Ankara");
  assert.ok(!seen.get("Eindhoven")!.has("Philips de Jong Park"), "Eindhoven offered the park");
  assert.ok(!seen.get("Eindhoven")!.has("Eindhoven Kanalı"), "Eindhoven offered the canal");
  // Unrelated places are still fair game under those photos.
  assert.ok(seen.get("Türkiye")!.has("Valencia"));
  assert.ok(seen.get("Eindhoven")!.has("Veldhoven"));
});

test("the right place is not always under the same letter", () => {
  const slots = new Set<number>();
  for (let i = 0; i < 100; i++) for (const q of buildRound(POOL, Math.random)) slots.add(q.answer);
  assert.deepEqual([...slots].sort(), [0, 1, 2, 3]);
});

test("on the real 21 photos every question gets its 4 places, and the rule holds", () => {
  const real: Photo[] = JSON.parse(
    readFileSync(new URL("../../../public/20261209/photos/photos.json", import.meta.url), "utf8"),
  );
  for (const q of buildRound(real, Math.random)) {
    assert.equal(q.choices.length, 4, `${q.photo.place} ran short of fair wrong places`);
    assert.equal(new Set(q.choices).size, 4);
  }
  // The pairs the table of #189 makes unfair, by `inside` and by text.
  const seen = wrongChoicesSeen(real, 300);
  assert.ok(!seen.get("Antalya")!.has("Türkiye"), "Antalya offered Türkiye");
  assert.ok(!seen.get("Türkiye")!.has("Antalya"), "Türkiye offered Antalya");
  assert.ok(!seen.get("Brugge")!.has("Belçika"), "Brugge offered Belçika");
  assert.ok(!seen.get("Belçika")!.has("Gent"), "Belçika offered Gent");
  assert.ok(!seen.get("Vrijstaat, Eindhoven")!.has("Eindhoven"), "Vrijstaat offered Eindhoven");
  assert.ok(!seen.get("Eindhoven")!.has("Dommel"), "Eindhoven offered Dommel");
  assert.ok(!seen.get("Eindhoven")!.has("Vrijstaat, Eindhoven"), "Eindhoven offered Vrijstaat");
  // While Veldhoven, next door but its own town, is a fair wrong place for Eindhoven.
  assert.ok(seen.get("Eindhoven")!.has("Veldhoven"));
});
