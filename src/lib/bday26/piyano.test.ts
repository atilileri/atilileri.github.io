/*
 * Tests for the piano Game's Round: which lane a note falls in, and what a
 * key press is worth.
 *
 *   node --test src/lib/bday26/piyano.test.ts
 *
 * Seam 1 of the spec (#192, "Testing Decisions"): the piano core is a plain
 * module with no DOM and no clock of its own. Every time here is a fixed
 * number of milliseconds on the song's clock, so the window edges are exact.
 * The expected numbers come from the prototype verdict (#180): 6 lanes on S D
 * F J K L, higher notes further right, 60% tempo, a hit window of ±170 ms
 * ("Tam!" within ±85 ms) after the +30 ms latency offset, misses for notes
 * that pass the window unhit, stray presses counted but free, and every song
 * repeated to about 90 s.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { chartSong, laneOfKey } from "./piyano.ts";

// ------------------------------------------------------------------ keys

test("the six lanes are the physical keys S D F J K L, left to right", () => {
  assert.deepEqual(
    ["KeyS", "KeyD", "KeyF", "KeyJ", "KeyK", "KeyL"].map(laneOfKey),
    [0, 1, 2, 3, 4, 5],
  );
});

test("any other key is no lane: A, Ş (Semicolon), Space, Enter", () => {
  for (const code of ["KeyA", "Semicolon", "Space", "Enter", "KeyG"]) {
    assert.equal(laneOfKey(code), undefined, code);
  }
});

// ----------------------------------------------------------------- chart
// A worked example: six rising quarter notes at 100 bpm. At 60% tempo that
// is 60 bpm, one beat a second, so the song lasts 6 s and repeats 15 times
// to reach 90 s.

const SCALE = { src: "C4 D4 E4 F4 G4 A4", bpm: 100, tempoPct: 60 };

test("a chart plays the song at 60% tempo: 100 bpm becomes one note a second", () => {
  const chart = chartSong(SCALE);
  assert.deepEqual(
    chart.notes.slice(0, 6).map((n) => n.at),
    [0, 1000, 2000, 3000, 4000, 5000],
  );
});

test("higher notes fall further right: a six-note scale spans lanes 0 to 5", () => {
  const chart = chartSong(SCALE);
  assert.deepEqual(
    chart.notes.slice(0, 6).map((n) => n.lane),
    [0, 1, 2, 3, 4, 5],
  );
});

test("a song wider than six notes squeezes onto six lanes, contour kept", () => {
  // C4..C5 is 8 diatonic steps; the ends stay on the outer lanes and no
  // higher note ever lands left of a lower one.
  const chart = chartSong({ src: "C4 D4 E4 F4 G4 A4 B4 C5", bpm: 100, tempoPct: 60 });
  const lanes = chart.notes.slice(0, 8).map((n) => n.lane);
  assert.equal(lanes[0], 0);
  assert.equal(lanes[7], 5);
  for (let i = 1; i < 8; i++) assert.ok(lanes[i]! >= lanes[i - 1]!, `lane ${lanes[i]} after ${lanes[i - 1]}`);
});

test("a sharp shares the lane of its natural, as the song format says", () => {
  const chart = chartSong({ src: "C4 C#4 D4 G4", bpm: 100, tempoPct: 60 });
  assert.equal(chart.notes[0]!.lane, chart.notes[1]!.lane);
  assert.equal(chart.notes[1]!.midi, 61);
});

test("a song repeats to about 90 s: the 6 s scale plays 15 times, 90 notes", () => {
  const chart = chartSong(SCALE);
  assert.equal(chart.repeats, 15);
  assert.equal(chart.notes.length, 90);
  assert.equal(chart.notes.at(-1)!.at, 89_000);
  assert.equal(chart.lengthMs, 90_000);
});

test("rests keep their place in the repeat: a 4 s song with a rest repeats 23 times", () => {
  // 3 notes and a 1-beat rest at 60 bpm = 4 s; 90 / 4 = 22.5, rounds to 23.
  const chart = chartSong({ src: "C4 E4 G4 R", bpm: 100, tempoPct: 60 });
  assert.equal(chart.repeats, 23);
  assert.equal(chart.notes[3]!.at, 4000); // the second time round starts after the rest
});

test("each note knows how long it rings, in ms, at the slowed tempo", () => {
  const chart = chartSong({ src: "C4:2 D4:.5", bpm: 100, tempoPct: 60 });
  assert.deepEqual(
    chart.notes.slice(0, 2).map((n) => n.durationMs),
    [2000, 500],
  );
});
