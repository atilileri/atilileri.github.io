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
 * Low lines are lifted an octave or two: she listens on laptop speakers,
 * which drop the bass.
 *
 * ATIL CHECKS EVERY HOOK BY EAR (pool doc, "Who writes the notes").
 * `confidence` says how far each hook got, and `source` links where its
 * notes came from (the comment beside the song says which bars):
 *
 *   1  placeholder — no free source found; a stand-in in the song's key and
 *      feel, not its melody. Replace by ear, or swap the song (backups:
 *      Alpaca Mountain, Science Fiction/Double Feature) and update the pool
 *      document.
 *   2  real notes from one machine-made or partial source — a Songsterr AI
 *      transcription, a guitar line where the sung line is missing, or
 *      sourced pitches with a typed rhythm. Likely right, not yet heard.
 *   3  real notes from a human transcription, or from two sources that
 *      agree. Not yet heard by Atıl.
 *   4  Atıl heard it and approved it.
 *
 * Songsterr tabs were read through its public tab data (the same JSON its
 * player loads); bitmidi files were read note by note from the MIDI.
 * Songsterr marks spoken or percussive syllables as dead notes (Tim Curry's
 * talk-singing, Şımarık's kiss sounds); those become rests here.
 */

export type SongGroup = "Yin Yin" | "Karsu" | "Rocky Horror" | "90'lar Türk popu" | "Dünya hitleri";

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

/**
 * The placeholders. Searched without a usable result (2026-11-17 and
 * 2026-11-19): sheet music and letter-note sites, Turkish "nota"/melodika/flüt
 * sites, MuseScore, Songsterr, bitmidi and other free MIDI, Ultimate Guitar.
 * Only paid PDFs or nothing turned up. So these stay placeholders, not
 * invented melodies; Atıl replaces them by ear.
 */
const GUESS = "guess: melody not known and no free note source found; a placeholder in the song's key and feel";

/** Songsterr's AI transcriptions: real notes, but machine-made and unheard. */
const AI_TAB = "from a Songsterr AI transcription: check by ear";

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
  {
    // Songsterr AI tab, Lead Guitar, bars 1–7 (the opening theme, back at bars 28 and 64),
    // one octave up; the long held E of bars 4–5 is shortened.
    title: "Pingpxng",
    artist: "Yin Yin",
    group: "Yin Yin",
    bpm: 126,
    part: "the opening guitar theme, one octave up",
    hook: `E4:1 G4:1 A4:1
           B4:2.5 B4:.5 D5:.5 E5:.5
           G5:1.5 E5:.5 D5:.5 B4:.5 A4:.5 G4:.5
           E4:2.5 E4:.5 G4:.5 A4:.5
           B4:2.5 B4:.5 D5:.5 E5:.5
           F#5:1.5 E5:.5 D5:1 A4:.5 G4:.5
           E4:1`,
    confidence: 2,
    source: "https://www.songsterr.com/a/wsa/yin-yin-pingpxng-tab-s5501012",
    unsure: AI_TAB,
  },
  {
    // Songsterr AI tab, Electric Guitar, bars 66–70 (the theme, first heard at bars 36–40).
    title: "Takahashi Timing",
    artist: "Yin Yin",
    group: "Yin Yin",
    bpm: 119,
    part: "the guitar theme",
    hook: `G#5:.75 C#5:.75 C#5:.5 C#5:2
           R:.5 D#5:.75 E5:.75 F#5:.75 G#5:.75 E5:.5
           F#5:.75 C#5:.75 C#5:.5 C#5:2
           C#6:.75 G#5:.75 C#6:.25 C6:.25 B5:.75 F#5:.75 F#5:.25 G5:.25
           G#5:.75 C#5:.75 C#5:.5 C#5:2`,
    confidence: 2,
    source: "https://www.songsterr.com/a/wsa/yin-yin-takahashi-timing-tab-s862500",
    unsure: AI_TAB,
  },

  // ── Karsu ────────────────────────────────────────────────────────
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
    title: "Bırak Beni Böyle",
    artist: "Karsu",
    group: "Karsu",
    bpm: 88,
    part: "the chorus",
    hook: `C5:1 B4:.5 A4:.5 G4:1 A4:1
           F4:1 E4:1 D4:2
           C5:1 B4:.5 A4:.5 G4:1 C5:1
           B4:1 G4:1 A4:2`,
    confidence: 1,
    unsure: GUESS,
  },
  {
    title: "İtiraf",
    artist: "Karsu",
    group: "Karsu",
    bpm: 92,
    part: "the chorus",
    hook: `A4:1 D5:1 E5:.5 F5:.5 E5:1
           D5:.5 C5:.5 A4:3
           A4:1 D5:1 E5:.5 F5:.5 G5:1
           F5:.5 E5:.5 D5:3`,
    confidence: 1,
    unsure: GUESS,
  },

  // ── Rocky Horror ─────────────────────────────────────────────────
  {
    // Two sources agree on the sung line "Let's do the Time Warp again" (F E G F# F# E,
    // with an A pickup to the last syllable): Songsterr's human transcription, Vocals,
    // bars 54–56 (175 bpm in half notes = 87.5 here), and the bitmidi file's channel 3,
    // bars 29–32 (87 bpm). Sung twice, as in the song.
    title: "Time Warp",
    artist: "The Rocky Horror Show",
    group: "Rocky Horror",
    bpm: 87,
    part: "the chorus, \"Let's do the Time Warp again\", twice",
    hook: `F4:1 E4:1 G4:1 F#4:.75 F#4:.25 A4:.25 E4:1.75 R:1
           F4:1 E4:1 G4:1 F#4:.75 F#4:.25 A4:.25 E4:1.75`,
    confidence: 3,
    source: "https://www.songsterr.com/a/wsa/movie-themes-the-rocky-horror-picture-show-the-time-warp-tab-s6698441",
    // second source: https://bitmidi.com/double-feature-the-time-warp-mid
  },
  {
    // Songsterr's human transcription, Vocals, bars 21–24 ("I'm just a sweet transvestite,
    // from Transsexual, Transylvania"; the end of the line is spoken), one octave up.
    title: "Sweet Transvestite",
    artist: "The Rocky Horror Show",
    group: "Rocky Horror",
    bpm: 107,
    part: "the chorus, \"I'm just a sweet transvestite, from Transsexual, Transylvania\", one octave up",
    hook: `C#5:.5 B4:1 E4:.5 E4:.5 E4:3.5
           E4:.5 E4:1.5 R:2 B4:.25 A4:.75
           R:1 G#4:.5 E4:.25 F#4:.75 E4:.5 B4:.25 A4:.75`,
    confidence: 3,
    source: "https://www.songsterr.com/a/wsa/movie-themes-the-rocky-horror-picture-show-sweet-transvestite-tim-curry-tab-s6698453",
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
    // Songsterr AI tab, Vocals, bars 61–64 (the fast section heard three times, taken as the
    // chorus), one octave up. D minor.
    title: "Aya Benzer",
    artist: "Mustafa Sandal",
    group: "90'lar Türk popu",
    bpm: 95,
    part: "the chorus (the section heard three times), one octave up",
    hook: `D5:1.5 C5:.25 C5:.25 Bb4:.5 R:.25 Bb4:.25 Bb4:.25 Bb4:.25 Bb4:.25 Bb4:.25
           Bb4:.5 D5:.5 C5:.5 Bb4:.5 R:.25 A4:.5 A4:.25 F5:.25 F5:.25 F5:.25 F5:.25
           D5:.25 C5:.25 D5:.25 E5:.25 C5:.5 C5:.25 Bb4:.25 Bb4:.25 A4:.25 Bb4:.5 R:.25 A4:.5 A4:.25
           E5:.25 E5:.25 E5:.25 E5:.25 F5:.5 E5:.5 R:.25 E5:.25 E5:.25 E5:.25 F5:.5 E5:.5`,
    confidence: 2,
    source: "https://www.songsterr.com/a/wsa/mustafa-sandal-aya-benzer-tab-s3410244",
    unsure: AI_TAB + "; which section is the chorus is read from the song's structure",
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
    title: "Abone",
    artist: "Yonca Evcimik",
    group: "90'lar Türk popu",
    bpm: 125,
    part: "the chorus, \"Abone, abone\"",
    hook: `C5:.5 A4:.5 A4:1 C5:.5 A4:.5 A4:1
           G4:.5 A4:.5 B4:.5 C5:.5 A4:2
           C5:.5 A4:.5 A4:1 C5:.5 A4:.5 A4:1
           G4:.5 F4:.5 E4:.5 G4:.5 A4:2`,
    confidence: 1,
    unsure: GUESS,
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
    // Two sources agree: the bitmidi karaoke file (lyrics in the MIDI), channel 0, bars 10–13,
    // and noobnotes' letter notes for the chorus. A major.
    title: "Dancing Queen",
    artist: "ABBA",
    group: "Dünya hitleri",
    bpm: 100,
    part: "the chorus, \"You can dance, you can jive, having the time of your life\"",
    hook: `C#5:1 B4:.5 B4:2.5
           C#5:1 B4:.5 B4:1.5 C#5:1
           A4:.75 B4:.75 G#4:.5 A4:.75 B4:.75 G#4:.5
           A4:.25 G#4:.5 F#4:1.25 C#5:.75 B4:.75 A4:.5`,
    confidence: 3,
    source: "https://bitmidi.com/abba-dancing-queen-k-mid",
    // second source: https://noobnotes.net/dancing-queen-abba/
  },
  {
    // noobnotes' letter notes for the chorus (written in G), moved to the record's E major;
    // the rhythm is typed from the sung line, not from a source.
    title: "My Heart Will Go On",
    artist: "Céline Dion",
    group: "Dünya hitleri",
    bpm: 99,
    part: "the chorus, \"Near, far, wherever you are, I believe that the heart does go on\"",
    hook: `E4:2 F#4:1 B4:1
           B4:.5 A4:.5 G#4:1 F#4:2
           G#4:.5 A4:.5 G#4:1 F#4:.5 E4:.5 D#4:1
           E4:1 E4:1 B3:2`,
    confidence: 2,
    source: "https://noobnotes.net/my-heart-will-go-on-celine-dion/",
    unsure: "pitches sourced; the rhythm is typed, check it by ear",
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
    title: "Billie Jean",
    artist: "Michael Jackson",
    group: "Dünya hitleri",
    bpm: 117,
    part: "the bass line, four bars, two octaves up",
    hook: `F#4:.5 C#4:.5 E4:.5 F#4:.5 E4:.5 C#4:.5 B3:.5 C#4:.5
           F#4:.5 C#4:.5 E4:.5 F#4:.5 E4:.5 C#4:.5 B3:.5 C#4:.5
           F#4:.5 C#4:.5 E4:.5 F#4:.5 E4:.5 C#4:.5 B3:.5 C#4:.5
           F#4:.5 C#4:.5 E4:.5 F#4:.5 E4:.5 C#4:.5 B3:.5 C#4:.5`,
    confidence: 4,
  },
];
