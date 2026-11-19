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

test("a signed cents offset after the octave bends one note between the keys: B4-23 is segah, a koma under B4", () => {
  // A koma of the Turkish 53-division is 1200/53 ≈ 22.6 cents; the marker is
  // written in whole cents. The key stays the piano's, the bend rides on it.
  const [segah, plain, up] = parseSong("B4-23:.5 B4 F#4+15").notes;
  assert.deepEqual({ midi: segah?.midi, cents: segah?.cents, duration: segah?.duration }, { midi: 71, cents: -23, duration: 0.5 });
  assert.equal(plain?.cents, 0);
  assert.deepEqual({ midi: up?.midi, cents: up?.cents }, { midi: 66, cents: 15 });
  // The lane step ignores the bend, as it ignores accidentals.
  assert.equal(segah?.step, plain?.step);
  // And it reaches the clock-time notes the piano schedules.
  assert.deepEqual(
    timeSong(parseSong("B4-23 C5"), 60).notes.map((n) => n.cents),
    [-23, 0],
  );
});

test("a bend of a whole semitone or more is refused: that is the next key, typed as a sharp or flat", () => {
  assert.throws(() => parseSong("B4-100"), /B4-100/);
  assert.throws(() => parseSong("B4+150"), /B4\+150/);
  assert.throws(() => parseSong("B4-2.5"), /B4-2\.5/);
});

test("a token that is not a note, a rest or a length is refused, so a typo fails the data test", () => {
  assert.throws(() => parseSong("C4 H4"), /H4/);
  assert.throws(() => parseSong("C4:x"), /C4:x/);
});

test("at 120 bpm a beat is half a second: times, durations and the whole length in seconds", () => {
  // C4 for a beat, D4 for two, a one-beat rest, E4 for half a beat.
  const timed = timeSong(parseSong("C4 D4:2 R E4:.5"), 120);
  assert.deepEqual(timed.notes, [
    { time: 0, duration: 0.5, midi: 60, cents: 0 },
    { time: 0.5, duration: 1, midi: 62, cents: 0 },
    { time: 2, duration: 0.25, midi: 64, cents: 0 },
  ]);
  assert.equal(timed.seconds, 2.25);
});

test("at 96 bpm the Türk Marşı's 4-beat bar lasts 2.5 s", () => {
  assert.equal(timeSong(parseSong("B4:.25 A4:.25 G#4:.25 A4:.25 C5:.5 R:.5 D5:.25 C5:.25 B4:.25 C5:.25 E5:.5 R:.5"), 96).seconds, 2.5);
});
