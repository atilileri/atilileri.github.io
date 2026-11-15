/*
 * Tests for the song format (#204, spec #192 "Song format"): the text a song
 * is typed in, and what it means in beats, MIDI numbers and seconds.
 *
 *   node --test src/lib/bday26/song.test.ts
 *
 * The format is the piano prototype's (#180): space-separated `NOTE[:beats]`,
 * `R` a rest, one beat when no length is given. The expected numbers are the
 * MIDI standard's (C4 = 60, A4 = 69) and plain arithmetic on the spec's
 * examples, never the parser's own output.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseSong, timeSong } from "./song.ts";

test("a bare note is one beat long and names its MIDI number: C4 is 60", () => {
  const song = parseSong("C4");
  assert.deepEqual(
    song.notes.map((n) => ({ beat: n.beat, duration: n.duration, midi: n.midi })),
    [{ beat: 0, duration: 1, midi: 60 }],
  );
  assert.equal(song.beats, 1);
});

test("a length after the colon is in beats, and a rest moves the clock without a note", () => {
  // Three events, two notes: D4 on beat 0 for two beats, a one-beat rest,
  // E4 on beat 3 for half a beat. The song is 3.5 beats long.
  const song = parseSong("D4:2 R E4:.5");
  assert.deepEqual(
    song.notes.map((n) => ({ beat: n.beat, duration: n.duration, midi: n.midi })),
    [
      { beat: 0, duration: 2, midi: 62 },
      { beat: 3, duration: 0.5, midi: 64 },
    ],
  );
  assert.equal(song.beats, 3.5);
});

test("a sharp raises and a flat lowers by a semitone, so G#4 is 68 and Bb3 is 58", () => {
  const [sharp, flat] = parseSong("G#4 Bb3").notes;
  assert.equal(sharp?.midi, 68);
  assert.equal(flat?.midi, 58);
});

test("a rest can carry a length too, and newlines are whitespace", () => {
  const song = parseSong("C4\n R:2\n C5");
  assert.equal(song.beats, 4);
  assert.equal(song.notes[1]?.beat, 3);
});

test("the lane step is the diatonic position: C4 and C#4 share it, D4 is one above, C5 is seven above", () => {
  const [c, cSharp, d, c5] = parseSong("C4 C#4 D4 C5").notes.map((n) => n.step);
  assert.equal(cSharp, c);
  assert.equal(d, c! + 1);
  assert.equal(c5, c! + 7);
});

test("a token that is not a note, a rest or a length is refused, so a typo fails the data test", () => {
  assert.throws(() => parseSong("C4 H4"), /H4/);
  assert.throws(() => parseSong("C4:x"), /C4:x/);
});

test("at 120 bpm a beat is half a second: times, durations and the whole length in seconds", () => {
  // C4 for a beat, D4 for two, a one-beat rest, E4 for half a beat.
  const timed = timeSong(parseSong("C4 D4:2 R E4:.5"), 120);
  assert.deepEqual(timed.notes, [
    { time: 0, duration: 0.5, midi: 60 },
    { time: 0.5, duration: 1, midi: 62 },
    { time: 2, duration: 0.25, midi: 64 },
  ]);
  assert.equal(timed.seconds, 2.25);
});

test("at 96 bpm the Türk Marşı's 4-beat bar lasts 2.5 s", () => {
  assert.equal(timeSong(parseSong("B4:.25 A4:.25 G#4:.25 A4:.25 C5:.5 R:.5 D5:.25 C5:.25 B4:.25 C5:.25 E5:.5 R:.5"), 96).seconds, 2.5);
});
