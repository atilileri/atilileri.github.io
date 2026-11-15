/*
 * Tests for the Milyoner quiz with no DOM: the pool read from its document,
 * the 12-question Round drawn from it, and the two jokers.
 *
 *   node --test src/lib/bday26/milyoner.test.ts
 *
 * Seam 1 of the spec (#192, "Testing Decisions"): the quiz's rules live in a
 * plain module and the page only paints what it returns, so the rules of
 * #198 (decided on #182 and #185) are pinned here:
 *   - the approved pool, `docs/bday26/milyoner-questions.md`, reads as 60
 *     questions, 12 per topic, 6 easy / 4 medium / 2 hard each, four
 *     choices, the first one right — read from the real document, so an
 *     edit that breaks its shape fails here, not on her screen;
 *   - a Round is Q1–6 easy (each topic once + one topic again), Q7–10
 *     medium (4 different topics), Q11–12 hard (2 different topics), with
 *     the choices shuffled;
 *   - "Yarı yarıya" takes away two wrong choices, never the right one;
 *   - "Seyirciye sor" gives the right answer the largest bar on Q1–10, and
 *     only about 70% of the time on Q11–12.
 * Expected numbers come from the spec and the document, not from the code.
 * Randomness is injected: a small seeded generator, so every run is the
 * same and a failure can be replayed.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildRound, parsePool } from "./milyoner.ts";

/** A small seeded generator (mulberry32): [0, 1) like Math.random. */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** How many times each topic appears in a list of questions. */
function topicCounts(qs: readonly { topic: string }[]): number[] {
  const counts = new Map<string, number>();
  for (const q of qs) counts.set(q.topic, (counts.get(q.topic) ?? 0) + 1);
  return [...counts.values()].sort((a, b) => b - a);
}

const DOC = readFileSync(new URL("../../../docs/bday26/milyoner-questions.md", import.meta.url), "utf8");
const TOPICS = ["Tiyatro", "Fotoğrafçılık", "Doğa yürüyüşü", "90'lar Türk popu", "Dünya hitleri"];

test("the pool document reads as 60 questions, 12 per topic, 6 easy / 4 medium / 2 hard each", () => {
  const pool = parsePool(DOC);
  assert.equal(pool.length, 60);
  for (const topic of TOPICS) {
    const mine = pool.filter((q) => q.topic === topic);
    assert.equal(mine.length, 12, topic);
    assert.equal(mine.filter((q) => q.band === "Kolay").length, 6, `${topic} Kolay`);
    assert.equal(mine.filter((q) => q.band === "Orta").length, 4, `${topic} Orta`);
    assert.equal(mine.filter((q) => q.band === "Zor").length, 2, `${topic} Zor`);
  }
});

test("each pool question has its text and four different choices, the document's first one right", () => {
  const pool = parsePool(DOC);
  for (const q of pool) {
    assert.ok(q.text.length > 0);
    assert.equal(q.choices.length, 4, q.text);
    assert.equal(new Set(q.choices).size, 4, q.text);
    for (const c of q.choices) assert.ok(c.length > 0 && !c.includes("|"), q.text);
  }
  // The document's first row and its last, as written there.
  assert.deepEqual(pool[0], {
    topic: "Tiyatro",
    band: "Kolay",
    text: '"Hamlet" oyununu kim yazdı?',
    choices: ["William Shakespeare", "Molière", "Anton Çehov", "Henrik Ibsen"],
  });
  assert.equal(pool[59]!.topic, "Dünya hitleri");
  assert.equal(pool[59]!.band, "Zor");
});

const POOL = parsePool(DOC);

test("a Round is 12 different questions: Q1–6 easy, Q7–10 medium, Q11–12 hard", () => {
  for (let seed = 1; seed <= 200; seed++) {
    const round = buildRound(POOL, seeded(seed));
    assert.equal(round.length, 12);
    assert.deepEqual(
      round.map((q) => q.band),
      ["Kolay", "Kolay", "Kolay", "Kolay", "Kolay", "Kolay", "Orta", "Orta", "Orta", "Orta", "Zor", "Zor"],
    );
    assert.equal(new Set(round.map((q) => q.text)).size, 12, `seed ${seed}: a question twice`);
  }
});

test("the easy band holds every topic once and one topic a second time", () => {
  const twice = new Set<string>();
  for (let seed = 1; seed <= 200; seed++) {
    const easy = buildRound(POOL, seeded(seed)).slice(0, 6);
    assert.equal(new Set(easy.map((q) => q.topic)).size, 5, `seed ${seed}`);
    assert.deepEqual(topicCounts(easy), [2, 1, 1, 1, 1], `seed ${seed}`);
    twice.add(easy.find((q) => easy.filter((o) => o.topic === q.topic).length === 2)!.topic);
  }
  // The topic that comes twice is drawn, not fixed: every topic gets its turn.
  assert.equal(twice.size, 5);
});

test("the medium band holds four different topics, the hard band two", () => {
  for (let seed = 1; seed <= 200; seed++) {
    const round = buildRound(POOL, seeded(seed));
    assert.deepEqual(topicCounts(round.slice(6, 10)), [1, 1, 1, 1], `seed ${seed}`);
    assert.deepEqual(topicCounts(round.slice(10)), [1, 1], `seed ${seed}`);
  }
});

test("the four choices are shuffled, and the answer points at the document's right one", () => {
  const where = new Set<number>();
  for (let seed = 1; seed <= 50; seed++) {
    for (const q of buildRound(POOL, seeded(seed))) {
      const original = POOL.find((p) => p.text === q.text)!;
      assert.deepEqual([...q.choices].sort(), [...original.choices].sort());
      assert.equal(q.choices[q.answer], original.choices[0]);
      where.add(q.answer);
    }
  }
  assert.deepEqual([...where].sort(), [0, 1, 2, 3], "the right answer sits under every letter");
});
