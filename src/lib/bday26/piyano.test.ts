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
import { chartSong, createRound, laneOfKey, type Chart } from "./piyano.ts";

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

// ----------------------------------------------------------------- round
// A hand-made chart: two notes in lane 2 at 1000 and 1300 ms, one in lane 4
// at 2000 ms, the song over at 3000 ms. The latency offset is the engine's
// +30 ms, so a press at 1030 is dead on the first note.

const CHART: Chart = {
  notes: [
    { at: 1000, durationMs: 300, midi: 60, lane: 2 },
    { at: 1300, durationMs: 300, midi: 62, lane: 2 },
    { at: 2000, durationMs: 500, midi: 67, lane: 4 },
  ],
  repeats: 1,
  lengthMs: 3000,
};
const LATENCY = 30;

test("a press dead on the note, after the 30 ms offset, is a hit and 'Tam!'; the note comes back to sound", () => {
  const round = createRound(CHART, LATENCY);
  const j = round.press(2, 1030);
  assert.equal(j.kind, "hit");
  assert.equal(j.kind === "hit" && j.verdict, "Tam!");
  assert.equal(j.kind === "hit" && j.errorMs, 0);
  assert.equal(j.kind === "hit" && j.note.midi, 60);
  assert.equal(round.hits, 1);
  assert.equal(round.perfect, 1);
});

test("170 ms late is still a hit ('Geç'); 171 ms late is a stray press", () => {
  const edge = createRound(CHART, LATENCY);
  const j = edge.press(4, 2200);
  assert.equal(j.kind === "hit" && j.verdict, "Geç");
  assert.equal(j.kind === "hit" && j.errorMs, 170);

  const past = createRound(CHART, LATENCY);
  assert.equal(past.press(4, 2201).kind, "stray");
  assert.equal(past.hits, 0);
  assert.equal(past.strays, 1);
});

test("170 ms early is still a hit ('Erken'); 171 ms early is a stray press", () => {
  const edge = createRound(CHART, LATENCY);
  const j = edge.press(4, 1860);
  assert.equal(j.kind === "hit" && j.verdict, "Erken");
  assert.equal(j.kind === "hit" && j.errorMs, -170);

  const before = createRound(CHART, LATENCY);
  assert.equal(before.press(4, 1859).kind, "stray");
});

test("'Tam!' reaches 85 ms either side; 86 ms is 'Geç' or 'Erken'", () => {
  const verdict = (ms: number) => {
    const j = createRound(CHART, LATENCY).press(4, ms);
    return j.kind === "hit" ? j.verdict : j.kind;
  };
  assert.equal(verdict(2115), "Tam!"); // +85
  assert.equal(verdict(2116), "Geç"); // +86
  assert.equal(verdict(1945), "Tam!"); // −85
  assert.equal(verdict(1944), "Erken"); // −86
});

test("a press on the wrong lane is a stray press: counted, no penalty, the note still waits", () => {
  const round = createRound(CHART, LATENCY);
  assert.equal(round.press(0, 1030).kind, "stray");
  assert.equal(round.press(5, 1030).kind, "stray");
  assert.equal(round.strays, 2);
  assert.equal(round.press(2, 1030).kind, "hit");
  assert.equal(round.hits, 1);
});

test("two notes close in one lane: a press takes the earlier one, the next press the later one", () => {
  const round = createRound(CHART, LATENCY);
  // At 1180 (1150 after the offset) both notes are inside the window.
  const first = round.press(2, 1180);
  const second = round.press(2, 1180);
  assert.equal(first.kind === "hit" && first.note.at, 1000);
  assert.equal(second.kind === "hit" && second.note.at, 1300);
  // A third press finds nothing left to hit.
  assert.equal(round.press(2, 1180).kind, "stray");
  assert.equal(round.hits, 2);
});

test("a note becomes a miss once its window has closed unhit, and only once", () => {
  const round = createRound(CHART, LATENCY);
  assert.deepEqual(round.advance(1200), []); // 170 ms behind: still hittable
  const missed = round.advance(1201);
  assert.deepEqual(
    missed.map((n) => n.at),
    [1000],
  );
  assert.deepEqual(round.advance(1250), []);
  assert.equal(round.misses, 1);
  // Too late for it now: a press reaches past it to the next note in reach.
  const j = round.press(2, 1205);
  assert.equal(j.kind === "hit" && j.note.at, 1300);
  assert.equal(round.misses, 1);
});

test("a hit note never turns into a miss", () => {
  const round = createRound(CHART, LATENCY);
  round.press(2, 1030);
  round.advance(5000);
  assert.equal(round.hits, 1);
  assert.equal(round.misses, 2);
});

test("the Round is done only when every note is judged and the song is over", () => {
  const round = createRound(CHART, LATENCY);
  assert.equal(round.done(2500), false);
  round.advance(2500);
  assert.equal(round.done(2500), false); // song still running
  assert.equal(round.done(3000), true);
  assert.equal(round.hits + round.misses, CHART.notes.length);
});

test("a Round with every note missed still ends: unpressed notes all count as misses", () => {
  const round = createRound(CHART, LATENCY);
  round.advance(3000);
  assert.equal(round.done(3000), true);
  assert.equal(round.misses, 3);
  assert.equal(round.hits, 0);
});
