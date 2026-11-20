/*
 * Tests for the prize hints: what 95% means in each Game's own units, and how
 * each Small prize is won, as she reads it on the shell's cards.
 *
 *   node --test src/lib/bday26/prize-hints.test.ts
 *
 * Seam: `prizeHintOf` and `prizeHowOf`. Every hint that names a number is
 * checked against the real score function in `scores.ts` at its edge: the
 * number the hint allows still scores 95, one step past it does not. So a
 * rule that changes in `scores.ts` breaks its hint here, not on her screen.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { GAMES, isLuckGame, PRIZE_BAR, type GameId } from "./catalogue.ts";
import { chartSong } from "./piyano.ts";
import { PIANO_SONGS } from "./piano-songs.ts";
import { prizeHintOf, prizeHowOf } from "./prize-hints.ts";
import {
  baristaRoundScore,
  baristaStepScore,
  bavulScore,
  drivingScore,
  hikingRoundScore,
  hikingScore,
  memoryScore,
  milyonerScore,
  missScore,
  pianoScore,
  renkRoundScore,
  renkTargetScore,
  skiScore,
  SKI_FLAGS,
  wordleRoundScore,
  wordleScore,
} from "./scores.ts";

/** The one number a hint names, read from the text she sees. */
function numberIn(id: GameId, pattern: RegExp): number {
  const hint = prizeHintOf(id);
  assert.ok(hint, `${id} has a hint`);
  const m = hint.match(pattern);
  assert.ok(m, `${id}: "${hint}" matches ${pattern}`);
  return Number(m[1]);
}

const reaches = (score: number | undefined) => (score ?? 0) >= PRIZE_BAR;

test("every Game but the slot machine has a hint, and every hint starts from %95", () => {
  for (const game of GAMES) {
    const hint = prizeHintOf(game.id);
    if (isLuckGame(game)) {
      assert.equal(hint, undefined, "the jackpot needs no hint");
    } else {
      assert.ok(hint, `${game.id} has a hint`);
      assert.match(hint, /%95 için/);
    }
  }
});

test("how a Small prize is won: at %95, or at the jackpot for the luck Game", () => {
  assert.equal(prizeHowOf("hafiza"), "%95 yapınca senin");
  assert.equal(prizeHowOf("bavul"), "%95 yapınca senin");
  assert.equal(prizeHowOf("slot"), "Jackpot'ta senin");
});

test("Hafıza kartları: the hint's move count is the last that still scores 95", () => {
  const n = numberIn("hafiza", /en fazla (\d+) hamle/);
  assert.equal(n, 15);
  assert.ok(reaches(memoryScore(n)));
  assert.ok(!reaches(memoryScore(n + 1)));
});

test("Bu nerede? and Şarkıyı bil: one miss still scores 95, two do not", () => {
  for (const id of ["nerede", "sarki"] as const) {
    const n = numberIn(id, /en fazla (\d+) hata/);
    assert.ok(reaches(missScore(n)), id);
    assert.ok(!reaches(missScore(n + 1)), id);
  }
});

test("Milyoner: only the whole ladder reaches 95", () => {
  const n = numberIn("milyoner", /12 sorunun (\d+)'si/);
  assert.equal(n, 12);
  assert.ok(reaches(milyonerScore(12)));
  assert.ok(!reaches(milyonerScore(11)));
});

test("Kelime avı: all ten words in at most 4 guesses is 95; a fifth guess or a word missed is not", () => {
  const n = numberIn("wordle", /en fazla (\d+) tahminde/);
  const atN = wordleScore(n, true);
  assert.ok(reaches(wordleRoundScore(Array(10).fill(atN))));
  // One word a guess later and the rest at the hint's edge falls short …
  assert.ok(!reaches(wordleRoundScore([wordleScore(n + 1, true), ...Array(9).fill(atN)])));
  // … and one word never found costs a tenth, even with nine perfect words.
  assert.ok(!reaches(wordleRoundScore([0, ...Array(9).fill(100)])));
});

test("Piyano: only Zor reaches 95, and the hint's miss count is the last that does on Türk Marşı", () => {
  for (const song of PIANO_SONGS) {
    const notes = chartSong(song).notes.length;
    assert.equal(reaches(pianoScore(notes, notes, song.cap)), song.difficulty === "Zor", song.name);
  }
  assert.match(prizeHintOf("piyano")!, /yalnız Zor'da/);
  const zor = PIANO_SONGS.find((s) => s.difficulty === "Zor")!;
  const notes = chartSong(zor).notes.length;
  const n = numberIn("piyano", /en fazla (\d+) hata/);
  assert.ok(reaches(pianoScore(notes - n, notes, zor.cap)));
  assert.ok(!reaches(pianoScore(notes - n - 1, notes, zor.cap)));
  // A stray press is one more mistake of the same price.
  assert.ok(!reaches(pianoScore(notes - n, notes, zor.cap, 1)));
});

test("Kayak macerası: the hint's flags missed is the most that still scores 95", () => {
  const n = numberIn("kayak", /en çok (\d+) bayrak/);
  assert.ok(reaches(skiScore(SKI_FLAGS - n, true)));
  assert.ok(!reaches(skiScore(SKI_FLAGS - n - 1, true)));
});

test("Hollanda'da sürüş: no heavy mistake and one light one is 95; a second light or one heavy is not", () => {
  const n = numberIn("surus", /en fazla (\d+) hafif/);
  assert.match(prizeHintOf("surus")!, /ağır hata yok/);
  assert.ok(reaches(drivingScore(0, n)));
  assert.ok(!reaches(drivingScore(0, n + 1)));
  assert.ok(!reaches(drivingScore(1, 0)));
});

test("Yürüyüş haritası: every route at most 15% over the shortest is 95; more on every map is not", () => {
  const n = numberIn("yuruyus", /en fazla %(\d+) uzun/);
  const at = hikingScore(1000 * (1 + n / 100), 1000);
  assert.ok(reaches(hikingRoundScore([at, at, at])));
  const past = hikingScore(1000 * (1 + (n + 1) / 100), 1000);
  assert.ok(!reaches(hikingRoundScore([past, past, past])));
});

test("Bavul hazırla: every must-have packed and one empty cell is 95; two cells or a missing must-have is not", () => {
  const n = numberIn("bavul", /en çok (\d+) boş kare/);
  assert.match(prizeHintOf("bavul")!, /olmazsa olmazların hepsi/);
  assert.ok(reaches(bavulScore({ empty: n, missing: 0 })));
  assert.ok(!reaches(bavulScore({ empty: n + 1, missing: 0 })));
  assert.ok(!reaches(bavulScore({ empty: 0, missing: 1 })));
});

test("Renk karıştır: four exact colours and the fifth up to ΔE 5 is 95; a fifth further off is not", () => {
  const n = numberIn("renk", /ΔE (\d+)'e kadar/);
  const exact = renkTargetScore(1);
  assert.ok(reaches(renkRoundScore([exact, exact, exact, exact, renkTargetScore(n)])));
  assert.ok(!reaches(renkRoundScore([exact, exact, exact, exact, renkTargetScore(n + 0.5)])));
});

test("Barista: the hint's centre and edge scores are the curve's, and three steps at the edge is still 95", () => {
  const centre = numberIn("barista", /ortası (\d+)/);
  const edge = numberIn("barista", /kenarı (\d+)/);
  assert.equal(baristaStepScore(0, 1), centre);
  assert.equal(baristaStepScore(1, 1), edge);
  assert.ok(reaches(baristaRoundScore([edge, edge, edge, ...Array(6).fill(centre)])));
  assert.ok(!reaches(baristaRoundScore([edge, edge, edge, edge, ...Array(5).fill(centre)])));
});

test("Kadraj keeps its own line: four near-perfect photos", () => {
  assert.equal(prizeHintOf("kadraj"), "%95 için dört fotoğrafın neredeyse kusursuz olmalı");
});
