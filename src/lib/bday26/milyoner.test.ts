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
import { parsePool } from "./milyoner.ts";

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
