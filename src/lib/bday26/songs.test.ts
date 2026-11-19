/*
 * Tests for the name-the-song hooks (#204; song pool #187,
 * `docs/bday26/song-pool.md`): the data the Round deals from.
 *
 *   node --test src/lib/bday26/songs.test.ts
 *
 * Expected values come from the pool document, not from `songs.ts`: its 20
 * titles in 3 groups of 1/5/14 (the second pool, after Atıl's listening:
 * Karsu found no source and left, and Rocky Horror left with Time Warp),
 * and the spec's "about 4 bars (~8 s)" hook, read as 5–12 s so a slow
 * ballad and a fast riff both fit. Whether a hook sounds like its song is
 * Atıl's ear, not a test.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { SONGS } from "./songs.ts";
import { parseSong, timeSong } from "./song.ts";

/** The pool table of `docs/bday26/song-pool.md`, title → group. */
const POOL: Record<string, string> = {
  "One Inch Punch": "Yin Yin",
  Şımarık: "90'lar Türk popu",
  "Jest Oldu": "90'lar Türk popu",
  "Her Gece": "90'lar Türk popu",
  Zalim: "90'lar Türk popu",
  "Yaparım Bilirsin": "90'lar Türk popu",
  "Take On Me": "Dünya hitleri",
  "Shape of You": "Dünya hitleri",
  "Seven Nation Army": "Dünya hitleri",
  "The Final Countdown": "Dünya hitleri",
  "Sweet Dreams (Are Made of This)": "Dünya hitleri",
  "Careless Whisper": "Dünya hitleri",
  "Smoke on the Water": "Dünya hitleri",
  "Axel F": "Dünya hitleri",
  "Barbie Girl": "Dünya hitleri",
  Lambada: "Dünya hitleri",
  "Hit the Road Jack": "Dünya hitleri",
  "Another One Bites the Dust": "Dünya hitleri",
  Popcorn: "Dünya hitleri",
  "Walking on Sunshine": "Dünya hitleri",
};

/** The hooks Atıl approved by ear (pool doc): nine at the first listen, ten
 *  of the second pool's new songs at the next; the rest are candidates. */
const APPROVED = [
  "One Inch Punch",
  "Jest Oldu",
  "Her Gece",
  "Zalim",
  "Yaparım Bilirsin",
  "Şımarık",
  "Take On Me",
  "Shape of You",
  "Seven Nation Army",
  "Popcorn",
  "The Final Countdown",
  "Sweet Dreams (Are Made of This)",
  "Careless Whisper",
  "Smoke on the Water",
  "Axel F",
  "Barbie Girl",
  "Lambada",
  "Hit the Road Jack",
  "Another One Bites the Dust",
];

test("the pool is the 20 songs of the pool document, each title once", () => {
  assert.equal(SONGS.length, 20);
  assert.deepEqual([...SONGS.map((s) => s.title)].sort(), Object.keys(POOL).sort());
});

test("the groups are Yin Yin 1, 90'lar Türk popu 5, Dünya hitleri 14", () => {
  const counts: Record<string, number> = {};
  for (const s of SONGS) {
    assert.equal(s.group, POOL[s.title], `${s.title} is in the wrong group`);
    counts[s.group] = (counts[s.group] ?? 0) + 1;
  }
  assert.deepEqual(counts, {
    "Yin Yin": 1,
    "90'lar Türk popu": 5,
    "Dünya hitleri": 14,
  });
});

test("every approved hook is confidence 4; every candidate is 2 or 3 and still flagged", () => {
  for (const s of SONGS) {
    if (APPROVED.includes(s.title)) {
      assert.equal(s.confidence, 4, `${s.title} was approved`);
    } else {
      assert.ok(s.confidence === 2 || s.confidence === 3, `${s.title}: confidence ${s.confidence}`);
      assert.ok(s.unsure, `${s.title} waits for Atıl's ear`);
    }
  }
});

test("every hook parses and lasts about 8 s: 5 to 12 seconds at its own tempo", () => {
  for (const s of SONGS) {
    const song = parseSong(s.hook);
    assert.ok(song.notes.length >= 8, `${s.title}: only ${song.notes.length} notes`);
    const { seconds } = timeSong(song, s.bpm);
    assert.ok(seconds >= 5 && seconds <= 12, `${s.title}: ${seconds.toFixed(1)} s`);
  }
});

test("every hook has a confidence 1–4, and every sourced one (2–3) links its source", () => {
  for (const s of SONGS) {
    assert.ok([1, 2, 3, 4].includes(s.confidence), `${s.title}: confidence ${s.confidence}`);
    if (s.confidence === 2 || s.confidence === 3) {
      assert.match(s.source ?? "", /^https:\/\//, `${s.title}: no source`);
    }
  }
});

test("no hook leaves the piano: every note is between A0 and C8", () => {
  for (const s of SONGS) {
    for (const n of parseSong(s.hook).notes) {
      assert.ok(n.midi >= 21 && n.midi <= 108, `${s.title}: MIDI ${n.midi}`);
    }
  }
});
