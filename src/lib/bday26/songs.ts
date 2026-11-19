/**
 * The name-the-song pool (#204; song grilling #187, `docs/bday26/song-pool.md`):
 * the 20 songs a "Şarkıyı bil" Round deals 10 from, each with the hook the
 * piano plays. The pool document stays the title list; this file is the
 * notes. `songs.test.ts` pins the titles and groups against that document
 * and checks every hook parses and lasts about 8 s.
 *
 * WHAT A HOOK IS (#187): the best-known ~4 bars of the song, not always its
 * first notes — the riff for a riff song, the chorus for a sung one — typed
 * in the song format of `./song.ts` (`NOTE[:beats]`, `R` a rest, one bar per
 * line) and played at `bpm`. `part` says which part of the song it is.
 * A note between the piano keys takes a signed cents bend after its octave
 * (`B4-23` is segah, a koma under B4); see the MICROTONES note in `./song.ts`.
 * No source used here marks a microtone, so no hook bends one yet.
 * Low lines are lifted an octave or more: she listens on laptop speakers,
 * which drop the bass.
 *
 * ATIL CHECKS EVERY HOOK BY EAR (pool doc, "Who writes the notes").
 * `confidence` says how far each hook got, and `source` links where its
 * notes came from (the comment beside the song says which bars):
 *
 *   1  placeholder — no free source found; a stand-in in the song's key and
 *      feel, not its melody. None left in the pool.
 *   2  real notes from one machine-made or partial source, or two sources
 *      that agree on the pitches but not the rhythm. Likely right, not yet heard.
 *   3  real notes from a human transcription (a hand-sequenced MIDI counts),
 *      or from two sources that agree. Not yet heard by Atıl.
 *   4  Atıl heard it and approved it.
 *
 * THE SECOND POOL (Atıl's listening, 2026-11-19): he approved nine hooks and
 * dropped the other eleven, Billie Jean and Dancing Queen among them, so
 * eleven new songs came in. Each new one is read note by note from bitmidi
 * MIDI files (hand-sequenced, often karaoke files with the lyrics in them);
 * where two files agree, the second is named beside the song. Songsterr now
 * refuses automated reads and Hooktheory disallows them, so neither was used
 * this time. No source was found for more Yin Yin or any Karsu song, nor for
 * new 90s Turkish pop (searched: bitmidi, Turkish nota/flüt/melodika sites,
 * sheet-music shops), so those groups shrank and Dünya hitleri grew.
 * A later listen approved ten of the eleven, notes unchanged. The eleventh,
 * Time Warp, never passed (two takes), so it left with the Rocky Horror group
 * and Walking on Sunshine came in, read from a bitmidi karaoke file; it still
 * waits for his ear.
 *
 * The approved hooks keep their old sources: Songsterr tabs read through its
 * public tab data before it closed that door (Songsterr marks spoken or
 * percussive syllables as dead notes — Şımarık's kiss sounds — and those are
 * rests here).
 */

export type SongGroup = "Yin Yin" | "90'lar Türk popu" | "Dünya hitleri";

/** How sure the hook is: 1 placeholder … 4 Atıl-approved (see the header). */
export type HookConfidence = 1 | 2 | 3 | 4;

export type PoolSong = {
  /** The original title, as she sees it among the choices (#187). */
  readonly title: string;
  readonly artist: string;
  readonly group: SongGroup;
  /** The hook's tempo, quarter notes a minute. */
  readonly bpm: number;
  /** Which part of the song the hook is. */
  readonly part: string;
  /** The hook in the song format. */
  readonly hook: string;
  /** How sure the hook is (see the header). */
  readonly confidence: HookConfidence;
  /** Where the notes came from, a URL; absent for a placeholder or a hook typed from memory. */
  readonly source?: string;
  /** Set when the hook needs Atıl's ear before the night, and why. */
  readonly unsure?: string;
};

/** A new song of the second pool still waiting for Atıl's ear. */
const NEW = "new in the second pool: not yet heard by Atıl";

export const SONGS: readonly PoolSong[] = [
  // ── Yin Yin ──────────────────────────────────────────────────────
  {
    // Songsterr AI tab, Lead Guitar, bars 30–33 (the main riff, 117 bpm, B minor pentatonic).
    title: "One Inch Punch",
    artist: "Yin Yin",
    group: "Yin Yin",
    bpm: 117,
    part: "the lead guitar riff",
    hook: `B4:.5 D5:.25 B4:.25 A4:.5 B4:.5 F#4:1.5 E4:.5
           F#4:.5 A4:.5 F#4:.5 E4:.5 F#4:2
           B4:.5 G5:.25 E5:.25 D5:.5 E5:.5 B4:1.5 A4:.5
           B4:.5 D5:.5 B4:.5 A4:.5 B4:2`,
    confidence: 4,
    source: "https://www.songsterr.com/a/wsa/yin-yin-one-inch-punch-tab-s5723477",
  },

  // ── 90'lar Türk popu ─────────────────────────────────────────────
  {
    // Songsterr human transcription ("Şımarıkk"), Vocals, bars 18–21 (the chorus with the
    // kiss sounds, which are rests here), one octave up. A minor.
    title: "Şımarık",
    artist: "Tarkan",
    group: "90'lar Türk popu",
    bpm: 100,
    part: "the chorus, one octave up",
    hook: `A4:.5 A4:.5 C5:.5 C5:.5 B4:.25 C5:.25 B4:.25 C5:.75 B4:.25 A4:.25
           G4:.5 G4:.5 B4:.5 B4:.5 A4:.25 B4:.25 A4:.25 B4:.5 B4:.25 A4:.5
           A4:.5 A4:.5 C5:.5 D5:.5 B4:.25 C5:.25 B4:.25 C5:.75 B4:.5
           R:1 C5:.5 B4:1.5`,
    confidence: 4,
    source: "https://www.songsterr.com/a/wsa/tarkan-simarikk-tab-s7866318",
  },
  {
    // Mustafa Sandal's song (Karsu only covers it, setlist.fm,
    // https://www.setlist.fm/stats/covers/karsu-43df0ff7.html): Songsterr AI tab
    // of the original, Vocals, bars 34–37 (the chorus; again at 38–41 and 75–78).
    // E minor.
    title: "Jest Oldu",
    artist: "Mustafa Sandal",
    group: "90'lar Türk popu",
    bpm: 96,
    part: "the chorus",
    hook: `E4:.5 E4:.5 E4:.25 G4:.75 F#4:.25 E4:.25 D4:.5 R:1
           E4:.5 E4:.5 E4:.25 G4:.75 F#4:.25 E4:.25 D4:.5 R:1
           E4:.75 D4:.75 C4:.5 R:.5 C4:.5 D4:.5 E4:.5
           F#4:.75 E4:.75 D4:.5 R:.5 A4:.5 G4:.5 F#4:.5`,
    confidence: 4,
    source: "https://www.songsterr.com/a/wsa/mustafa-sandal-jest-oldu-tab-s5190078",
  },
  {
    // Songsterr AI tab (no vocal track), Distortion Guitar, bars 6–13 (the intro riff), one
    // octave up. A major.
    title: "Her Gece",
    artist: "Mirkelam",
    group: "90'lar Türk popu",
    bpm: 168,
    part: "the guitar intro riff, one octave up",
    hook: `E5:.5 A5:.5 G#5:.5 F#5:.5 E5:.5 D5:.5 C#5:.5 D5:.5
           E5:1 C#5:.5 E5:1 C#5:.5 E5:1
           A5:.5 A5:.5 G#5:.5 F#5:.5 E5:.5 D5:.5 C#5:.5 D5:.5
           B4:1 A4:.5 B4:1 A4:.5 B4:1.5
           C#5:.5 D5:.5 E5:.5 D5:.5 E5:.5 C#5:.5 D5:.5
           B4:1 A4:.5 B4:1 A4:.5 B4:1.5
           C#5:.5 D5:.5 E5:.5 C#5:.5 D5:.5 B4:.5 C#5:.5
           A4:2`,
    confidence: 4,
    source: "https://www.songsterr.com/a/wsa/mirkelam-her-gece-tab-s220922",
  },
  {
    // Songsterr AI tab, Vocals, bars 43–47 (the chorus; again at 81–87 and 112–118), one
    // octave up. C minor.
    title: "Zalim",
    artist: "Levent Yüksel",
    group: "90'lar Türk popu",
    bpm: 110,
    part: "the chorus, one octave up",
    hook: `G4:.5 Eb5:.5 R:.5 Eb5:.5 D5:.5 Eb5:.5 F5:.5 Eb5:.5
           D5:.25 Eb5:.75 C5:.5 D5:.5 Bb4:.5 C5:.5 Ab4:.5 Bb4:.5
           G4:.5 F5:1 F5:.5 F5:.5 F5:.5 F5:.5 G5:.5
           F5:.25 Eb5:.25 F5:1 Eb5:.5 Eb5:.5 D5:.5 Bb4:.5 C5:.5
           Eb5:1.5 C5:1.5`,
    confidence: 4,
    source: "https://www.songsterr.com/a/wsa/levent-yuksel-zalim-tab-s4019251",
  },
  {
    // Songsterr AI tab (no vocal track), Acoustic Guitar, bars 15–18 (the intro lick), one
    // octave up. E major.
    title: "Yaparım Bilirsin",
    artist: "Kenan Doğulu",
    group: "90'lar Türk popu",
    bpm: 100,
    part: "the acoustic guitar intro lick, one octave up",
    hook: `D#5:.25 E5:.25 F#5:.5 R:.5 E5:.25 D#5:.25 D#5:.125 E5:.125 D#5:.25 C#5:.25 E5:.25 D#5:.5 R:.5
           B4:.25 C#5:.25 D#5:.5 R:.5 C#5:.25 B4:.25 C#5:.25 B4:.25 A4:.25 B4:.25 G#4:.5 R:.5
           D#5:.25 E5:.25 F#5:1 E5:.25 D#5:.25 D#5:.125 E5:.125 D#5:.125 E5:.125 C#5:.25 E5:.25 D#5:1
           B4:.25 C#5:.25 D#5:1 C#5:.25 B4:.25 C#5:.25 B4:.25 A4:.25 B4:.25 G#4:1`,
    confidence: 4,
    source: "https://www.songsterr.com/a/wsa/kenan-dogulu-yaparim-bilirsin-tab-s2493625",
  },

  // ── Dünya hitleri ────────────────────────────────────────────────
  {
    title: "Take On Me",
    artist: "a-ha",
    group: "Dünya hitleri",
    bpm: 169,
    part: "the synth riff of the intro, in eighths",
    hook: `F#5:.5 F#5:.5 D5:.5 B4:.5 R:.5 B4:.5 R:.5 E5:.5
           R:.5 E5:.5 R:.5 E5:.5 G#5:.5 G#5:.5 A5:.5 B5:.5
           A5:.5 A5:.5 A5:.5 E5:.5 R:.5 D5:.5 R:.5 F#5:.5
           R:.5 F#5:.5 R:.5 F#5:.5 E5:.5 E5:.5 F#5:.5 E5:.5`,
    confidence: 4,
  },
  {
    title: "Shape of You",
    artist: "Ed Sheeran",
    group: "Dünya hitleri",
    bpm: 96,
    part: "the marimba riff, twice",
    hook: `C#5:.75 E5:.75 C#5:.5 C#5:.75 E5:.75 C#5:.5
           C#5:.75 E5:.75 C#5:.5 D#5:.75 C#5:.75 B4:.5
           C#5:.75 E5:.75 C#5:.5 C#5:.75 E5:.75 C#5:.5
           C#5:.75 E5:.75 C#5:.5 D#5:.75 C#5:.75 B4:.5`,
    confidence: 4,
  },
  {
    title: "Seven Nation Army",
    artist: "The White Stripes",
    group: "Dünya hitleri",
    bpm: 124,
    part: "the guitar riff, twice, two octaves up",
    hook: `E4:1.5 E4:.5 G4:.75 E4:.75 D4:.5
           C4:2 B3:2
           E4:1.5 E4:.5 G4:.75 E4:.75 D4:.5
           C4:2 B3:2`,
    confidence: 4,
  },
  {
    // The K-MIDI karaoke file, channel 1 (the synth), bars 7–11. The plain
    // the-final-countdown-mid is the same sequence, so one source. F# minor.
    title: "The Final Countdown",
    artist: "Europe",
    group: "Dünya hitleri",
    bpm: 118,
    part: "the synth riff",
    hook: `C#5:.25 B4:.25 C#5:1 F#4:2.5
           D5:.25 C#5:.25 D5:.5 C#5:.5 B4:2.5
           D5:.25 C#5:.25 D5:1 F#4:2.5
           B4:.25 A4:.25 B4:.5 A4:.5 G#4:.5 B4:.5 A4:1.5`,
    confidence: 4,
    source: "https://bitmidi.com/europe-the-final-countdown-k-mid",
  },
  {
    // Two files agree on the synth riff: the Eurythmics karaoke file, channel 1,
    // bars 2–5, and the Lennox karaoke file, channel 1, bars 2–5 (sparser, same
    // notes). One octave up, played twice. C minor.
    title: "Sweet Dreams (Are Made of This)",
    artist: "Eurythmics",
    group: "Dünya hitleri",
    bpm: 125,
    part: "the synth riff, twice, one octave up",
    hook: `C4:.5 C4:.5 C5:.5 C5:.5 Eb4:.5 Eb5:.5 C5:.5 C5:.5
           Ab4:.5 Ab4:.5 C5:.5 C5:.5 G4:.5 G4:.5 G4:.5 C5:.5
           C4:.5 C4:.5 C5:.5 C5:.5 Eb4:.5 Eb5:.5 C5:.5 C5:.5
           Ab4:.5 Ab4:.5 C5:.5 C5:.5 G4:.5 G4:.5 G4:.5 C5:.5`,
    confidence: 4,
    source: "https://bitmidi.com/eurythmics-sweet-dreams-k-mid",
    // second source: https://bitmidi.com/lennox-sweet-dreams-k-mid
  },
  {
    // Two files agree on the sax riff: careless-whisper-mid, "ALTO SAX", bars 3–5,
    // and g-michael-careless-whisper-mid, channel 5 (sax), bars 3–5. D minor.
    title: "Careless Whisper",
    artist: "George Michael",
    group: "Dünya hitleri",
    bpm: 77,
    part: "the saxophone riff",
    hook: `E5:.5 D5:.25 A4:.5 F4:.75 E5:.5 D5:.25 A4:.5 F4:.75
           C5:.5 Bb4:.25 F4:.5 D4:.75 C5:.5 Bb4:.25 F4:1.25
           Bb4:.5 A4:.25 F4:.5 D4:.5 Bb3:2.25`,
    confidence: 4,
    source: "https://bitmidi.com/careless-whisper-mid",
    // second source: https://bitmidi.com/g-michael-careless-whisper-mid
  },
  {
    // Two files agree on the riff: deep-purple-smoke-on-the-water-mid, channel 4,
    // bars 8–11, and smoke-on-the-water-1-mid, channel 3, bars 4–7. The top note of
    // the guitar's fourths, one octave up. G minor.
    title: "Smoke on the Water",
    artist: "Deep Purple",
    group: "Dünya hitleri",
    bpm: 115,
    part: "the guitar riff, one octave up",
    hook: `G4:1 Bb4:1 C5:1.5 G4:1
           Bb4:1 C#5:.5 C5:2
           G4:1 Bb4:1 C5:1.5 Bb4:1
           G4:3`,
    confidence: 4,
    source: "https://bitmidi.com/deep-purple-smoke-on-the-water-mid",
    // second source: https://bitmidi.com/smoke-on-the-water-1-mid
  },
  {
    // Two files agree on the synth theme: axel-f-1-mid, channel 8, bars 3–5, and
    // axel-f-2-mid, channel 0, bars 2–4 (a semitone higher). F minor.
    title: "Axel F",
    artist: "Harold Faltermeyer",
    group: "Dünya hitleri",
    bpm: 118,
    part: "the synth theme",
    hook: `F4:1 Ab4:.75 F4:.5 F4:.25 Bb4:.5 F4:.5 Eb4:.5
           F4:1 C5:.75 F4:.5 F4:.25 Db5:.5 C5:.5 Ab4:.5
           F4:.5 C5:.5 F5:.5 F4:.25 Eb4:.5 Eb4:.25 C4:.5 G4:.5 F4:1.5`,
    confidence: 4,
    source: "https://bitmidi.com/axel-f-1-mid",
    // second source: https://bitmidi.com/axel-f-2-mid
  },
  {
    // The karaoke file, channel 3 (the sung line, lyrics in the file), bars 7–10:
    // "I'm a Barbie girl, in a Barbie world, life in plastic, it's fantastic".
    // barbie-girl-1-mid is the same sequence, so one source. C# minor.
    title: "Barbie Girl",
    artist: "Aqua",
    group: "Dünya hitleri",
    bpm: 126,
    part: "the chorus, \"I'm a Barbie girl, in a Barbie world\"",
    hook: `G#4:.5 E4:.5 G#4:.5 C#5:.5 A4:2
           F#4:.5 D#4:.5 F#4:.5 B4:.5 G#4:1 F#4:.5 E4:1.5
           E4:.5 C#4:.5 F#4:1 C#4:1 R:1
           F#4:.5 E4:.5 G#4:1 F#4:1.5`,
    confidence: 4,
    source: "https://bitmidi.com/aqua-barbie-girl-k-mid",
  },
  {
    // Two files agree on the tune: lambada-mid, channel 4 (accordion), bars 17–20
    // (the beats a hair early, set on the eighth here), and kaoma-lambada-mid, a
    // fifth higher. D minor. The phrase twice, as in the song.
    title: "Lambada",
    artist: "Kaoma",
    group: "Dünya hitleri",
    bpm: 115,
    part: "the accordion tune, twice",
    hook: `A5:1.5 G5:.5 F5:.5 E5:.5 D5:1
           D5:.5 F5:.5 E5:.5 D5:.5 C5:.5 D5:.5 A4:.5 G4:.5 A4:2
           A5:1.5 G5:.5 F5:.5 E5:.5 D5:1
           D5:.5 F5:.5 E5:.5 D5:.5 C5:.5 D5:.5 A4:.5 G4:.5 A4:2`,
    confidence: 4,
    source: "https://bitmidi.com/lambada-mid",
    // second source: https://bitmidi.com/kaoma-lambada-mid
  },
  {
    // Two files agree on the sung line: charles-hit-the-road-jack-mid, channel 4,
    // bars 5–12 (A minor, swung eighths as triplets), and hit-the-road-jack-mid,
    // channel 3, bars 6–12 (in C minor). "Hit the road Jack, and don't you come
    // back no more, no more, no more, no more".
    title: "Hit the Road Jack",
    artist: "Ray Charles",
    group: "Dünya hitleri",
    bpm: 173,
    part: "the chorus, \"Hit the road Jack\", twice",
    hook: `E5:.67 C5:.33 D5:1.67 A4:2 A4:.33
           C5:.67 C5:.33 D5:.67 C5:.33 D5:1 C5:1
           E5:1 E5:1 A5:1 A5:1
           C6:1 C6:1 A5:1
           E5:.67 C5:.33 D5:1.67 A4:2 A4:.33
           C5:.67 C5:.33 D5:.67 C5:.33 D5:1 A4:3`,
    confidence: 4,
    source: "https://bitmidi.com/charles-hit-the-road-jack-mid",
    // second source: https://bitmidi.com/hit-the-road-jack-mid
  },
  {
    // Two files agree on the bass riff: another-one-bites-the-dust-1-mid, channel 1,
    // bars 3–6, and another-one-bites-the-dust-2-mid, channel 1 (a semitone higher).
    // Three octaves up. E minor.
    title: "Another One Bites the Dust",
    artist: "Queen",
    group: "Dünya hitleri",
    bpm: 110,
    part: "the bass riff, twice, three octaves up",
    hook: `A4:.25 G4:.25
           E4:.5 R:.5 E4:.5 R:.5 E4:.5 R:1.25 E4:.25
           E4:.5 E4:.5 G4:.5 E4:.25 A4:1.75 A4:.25 G4:.25
           E4:.5 R:.5 E4:.5 R:.5 E4:.5 R:1.25 E4:.25
           E4:.5 E4:.5 G4:.5 E4:.25 A4:2`,
    confidence: 4,
    source: "https://bitmidi.com/another-one-bites-the-dust-1-mid",
    // second source: https://bitmidi.com/another-one-bites-the-dust-2-mid
  },
  {
    // popcorn-2-mid, channel 3, bars 7–11; popcorn-1-mid, channel 4, has the same
    // pitches for bars 7–10 but a syncopated rhythm and another bar 11, so the
    // rhythm here is one file's. B minor.
    title: "Popcorn",
    artist: "Hot Butter",
    group: "Dünya hitleri",
    bpm: 132,
    part: "the synth tune",
    hook: `B5:.5 A5:.5
           B5:.5 F#5:.5 D5:.5 F#5:.5 B4:1 B5:.5 A5:.5
           B5:.5 F#5:.5 D5:.5 F#5:.5 B4:1 B5:.5 C#6:.5
           D6:.5 C#6:.5 D6:.5 B5:.5 C#6:.5 B5:.5 C#6:.5 A5:.5
           B5:.5 A5:.5 B5:.5 G5:.5 B5:1`,
    confidence: 4,
    source: "https://bitmidi.com/popcorn-2-mid",
    // second source (pitches only): https://bitmidi.com/popcorn-1-mid
  },
  {
    // Replaces Time Warp. A hand-sequenced karaoke MIDI with the lyrics in it,
    // channel 3 (the sung line; its syllables land on these notes), bars 25–28:
    // "I'm walking on sunshine, whoa-oh" twice, quantised, starting on "I'm".
    // In A, as the file has it; 104 bpm.
    title: "Walking on Sunshine",
    artist: "Katrina and the Waves",
    group: "Dünya hitleri",
    bpm: 104,
    part: "the chorus, \"I'm walking on sunshine, whoa-oh\", twice",
    hook: `F#5:.5 A5:.5 F#5:.25 D5:.75 F#5:1
           E5:2 B5:1 A5:1.5 R:.5
           F#5:.5 A5:.5 F#5:.25 D5:.75 F#5:1
           E5:2 B5:1 A5:2`,
    confidence: 3,
    source: "https://bitmidi.com/katarina-and-the-waves-walking-on-sunshine-k-mid",
    unsure: "replaces Time Warp: not yet heard by Atıl",
  },
];
