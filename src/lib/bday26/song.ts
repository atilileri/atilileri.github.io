/**
 * The song format of the birthday games (#204; spec #192 "Song format"):
 * how a melody is typed, and what it means in beats, MIDI numbers and
 * seconds. Pure data in, pure data out — no audio here. The sound engine
 * (`./piano.ts`) plays what this module parses, the name-the-song hooks
 * (`./songs.ts`) and the piano Game's three songs (#205) are written in it,
 * and `song.test.ts` pins the meaning under `node --test`.
 *
 * THE FORMAT is the piano prototype's (#180), kept so the Türk Marşı typed
 * there copies over verbatim: space-separated tokens, each `NOTE[:beats]`
 * or `R[:beats]` for a rest. NOTE is a letter A–G, an optional `#` or `b`,
 * and an octave digit (`C4` = middle C = MIDI 60, `A4` = 440 Hz = 69). The
 * length is in beats, default 1, fractions allowed (`.25`, `1.5`). Newlines
 * are whitespace, so a song can be typed one bar per line. A token that is
 * none of these throws: a typo in a hook must fail the data test, not play
 * a wrong note at the table.
 *
 * MICROTONES (Atıl's play test, for Turkish makam): a signed whole number of
 * cents right after the octave digit bends that one note off the piano key,
 * `NOTE±cents[:beats]`, less than a semitone either way (`B4-23`, `F#4+15`).
 * A koma of the Turkish 53-division is 1200/53 ≈ 22.6 cents, so segah (B
 * a koma flat, the 2nd of uşşak and the 3rd of rast) is `B4-23`, and the
 * "4-koma" flat of hicaz/kürdi is about `B4-90`, which is close enough to
 * `Bb4` that a piano hook may just type `Bb4`. In practice performers set
 * these by ear, so a cents value is a starting point for Atıl's ear, not a
 * rule. The bend is `cents` on every note (0 when unmarked), carried to the
 * timed note, and the engine hands it to smplr as the note's `detune`.
 *
 * WHAT COMES OUT. Every note knows the beat it starts on, how many beats it
 * lasts, its MIDI number, and its diatonic `step` (octave × 7 + letter,
 * accidentals ignored). The step is for the piano Game: it maps the song's
 * pitch range onto its 6 lanes so a higher note falls further right, and a
 * C# and a C share a lane. `beats` is the whole length including a final
 * rest. `timeSong` turns beats into seconds at a tempo: that is where bpm
 * enters, and nowhere else.
 */

export type SongNote = {
  /** The beat this note starts on, counted from 0. */
  readonly beat: number;
  /** How many beats it lasts. */
  readonly duration: number;
  /** MIDI note number: C4 = 60, A4 = 69. */
  readonly midi: number;
  /** Diatonic step, octave × 7 + letter (C=0 … B=6); the piano Game's lane key. */
  readonly step: number;
  /** The microtone bend off the key, in cents (−99..99); 0 for a plain note. */
  readonly cents: number;
};

export type Song = {
  readonly notes: readonly SongNote[];
  /** The song's whole length in beats, rests included. */
  readonly beats: number;
};

const LETTER_STEP: Record<string, number> = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
const LETTER_SEMI: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const NOTE = /^([A-G])([#b]?)(\d)([+-]\d{1,2})?$/;

/** Parse a song typed in the format above. Throws on a token it cannot read. */
export function parseSong(src: string): Song {
  const notes: SongNote[] = [];
  let beat = 0;
  for (const token of src.trim().split(/\s+/)) {
    if (token === "") continue;
    const [name, length] = token.split(":");
    const duration = length === undefined ? 1 : Number(length);
    if (!(duration > 0)) throw new Error(`song: bad length in "${token}"`);
    if (name !== "R") {
      const m = NOTE.exec(name ?? "");
      if (!m) throw new Error(`song: bad note "${token}"`);
      const [, letter, accidental, octave, bend] = m as unknown as [string, string, string, string, string | undefined];
      const oct = Number(octave);
      const midi = 12 * (oct + 1) + LETTER_SEMI[letter]! + (accidental === "#" ? 1 : accidental === "b" ? -1 : 0);
      notes.push({ beat, duration, midi, step: oct * 7 + LETTER_STEP[letter]!, cents: bend ? Number(bend) : 0 });
    }
    beat += duration;
  }
  return { notes, beats: beat };
}

export type TimedNote = {
  /** Seconds from the song's start. */
  readonly time: number;
  /** Seconds the note lasts. */
  readonly duration: number;
  readonly midi: number;
  /** The microtone bend in cents; 0 for a plain note. */
  readonly cents: number;
};

export type TimedSong = {
  readonly notes: readonly TimedNote[];
  /** The song's whole length in seconds, rests included. */
  readonly seconds: number;
};

/** Seconds per beat at a tempo: 120 bpm → 0.5 s. */
export function secondsPerBeat(bpm: number): number {
  return 60 / bpm;
}

/** The song in seconds at `bpm`, for whoever schedules it on a clock. */
export function timeSong(song: Song, bpm: number): TimedSong {
  const spb = secondsPerBeat(bpm);
  return {
    notes: song.notes.map((n) => ({ time: n.beat * spb, duration: n.duration * spb, midi: n.midi, cents: n.cents })),
    seconds: song.beats * spb,
  };
}
