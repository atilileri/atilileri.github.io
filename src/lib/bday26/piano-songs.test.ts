/*
 * Tests for the piano Game's three songs (#205; spec #192 stories 61–62,
 * 64; songs #187; tuning #180).
 *
 *   node --test src/lib/bday26/piano-songs.test.ts
 *
 * The expected values are the spec's and the verdict's, not the data's:
 * Kolay İyi ki doğdun capped at 0.70, Orta Hadi Bakalım at 0.85, Zor Türk
 * Marşı at 1.00; 60% tempo; fall speeds 190 / 240 / 300 px/s; each song
 * repeated to about 90 s (read as 80–100 s, since a song repeats whole);
 * six lanes, so every song reaches both outer keys. Whether a melody sounds
 * like its song is Atıl's ear, not a test.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { PIANO_SONGS, songByChoice } from "./piano-songs.ts";
import { chartSong } from "./piyano.ts";

test("three songs, easy to hard: Kolay İyi ki doğdun, Orta Hadi Bakalım, Zor Türk Marşı", () => {
  assert.deepEqual(
    PIANO_SONGS.map((s) => [s.difficulty, s.name]),
    [
      ["Kolay", "İyi ki doğdun"],
      ["Orta", "Hadi Bakalım"],
      ["Zor", "Türk Marşı"],
    ],
  );
});

test("the caps are 0.70, 0.85 and 1.00, so only Zor can reach 95%", () => {
  assert.deepEqual(
    PIANO_SONGS.map((s) => s.cap),
    [0.7, 0.85, 1.0],
  );
});

test("every song plays at 60% tempo and falls at 190, 240 and 300 px/s", () => {
  assert.deepEqual(
    PIANO_SONGS.map((s) => s.tempoPct),
    [60, 60, 60],
  );
  assert.deepEqual(
    PIANO_SONGS.map((s) => s.speed),
    [190, 240, 300],
  );
});

test("every song repeats to about 90 s (80–100 s)", () => {
  for (const song of PIANO_SONGS) {
    const seconds = chartSong(song).lengthMs / 1000;
    assert.ok(seconds >= 80 && seconds <= 100, `${song.name}: ${seconds.toFixed(1)} s`);
  }
});

test("every song reaches both outer lanes, S and L", () => {
  for (const song of PIANO_SONGS) {
    const lanes = new Set(chartSong(song).notes.map((n) => n.lane));
    assert.ok(lanes.has(0) && lanes.has(5), `${song.name}: lanes ${[...lanes].sort()}`);
  }
});

test("the start screen's 1, 2, 3 pick Kolay, Orta, Zor; other keys pick nothing", () => {
  assert.equal(songByChoice("1")?.difficulty, "Kolay");
  assert.equal(songByChoice("2")?.difficulty, "Orta");
  assert.equal(songByChoice("3")?.difficulty, "Zor");
  assert.equal(songByChoice("4"), undefined);
  assert.equal(songByChoice("Enter"), undefined);
});
