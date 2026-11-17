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
 * Low riffs (Billie Jean, Seven Nation Army) are lifted an octave or two:
 * she listens on laptop speakers, which drop the bass.
 *
 * ATIL CHECKS EVERY HOOK BY EAR (pool doc, "Who writes the notes"). A hook
 * with `unsure` was typed from a weak memory or, where it says "guess", is
 * a placeholder in the song's key and feel rather than its melody: those
 * must be replaced by ear before the night, or the question is won only by
 * elimination. If a hook cannot be made recognisable on a piano, swap in a
 * song of the same group (backups: Alpaca Mountain, Science Fiction/Double
 * Feature) and update the pool document with it.
 */

export type SongGroup = "Yin Yin" | "Karsu" | "Rocky Horror" | "90'lar Türk popu" | "Dünya hitleri";

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
  /** Set when the hook needs Atıl's ear before the night, and why. */
  readonly unsure?: string;
};

/**
 * The 11 placeholders. A web search for real note sources (2026-11-17:
 * sheet music, tabs, letter notes, MuseScore, Hooktheory, Turkish "nota"
 * sites) found none that is free and readable: only paid retail PDFs
 * (Musicnotes, Sheet Music Direct for Şımarık's "Kiss Kiss" cover) and paid
 * transcription services (PaidTabs for the Yin Yin songs). So these stay
 * placeholders, not invented melodies; Atıl replaces them by ear.
 */
const GUESS = "guess: melody not known and no free note source found; a placeholder in the song's key and feel";

export const SONGS: readonly PoolSong[] = [
  // ── Yin Yin ──────────────────────────────────────────────────────
  {
    title: "One Inch Punch",
    artist: "Yin Yin",
    group: "Yin Yin",
    bpm: 110,
    part: "the lead riff",
    hook: `A4:.5 C5:.5 D5:.5 E5:1 D5:.5 C5:.5 A4:.5
           G4:.5 A4:.5 C5:1 A4:2
           A4:.5 C5:.5 D5:.5 E5:1 G5:.5 E5:.5 D5:.5
           C5:.5 D5:.5 A4:3`,
    unsure: GUESS,
  },
  {
    title: "Pingpxng",
    artist: "Yin Yin",
    group: "Yin Yin",
    bpm: 120,
    part: "the lead riff",
    hook: `E5:.5 E5:.5 R:.5 D5:.5 E5:.5 G5:.5 E5:1
           D5:.5 C5:.5 A4:1 C5:2
           E5:.5 E5:.5 R:.5 D5:.5 E5:.5 G5:.5 A5:1
           G5:.5 E5:.5 D5:1 E5:2`,
    unsure: GUESS,
  },
  {
    title: "Takahashi Timing",
    artist: "Yin Yin",
    group: "Yin Yin",
    bpm: 115,
    part: "the lead riff",
    hook: `D5:.75 D5:.75 F5:.5 G5:1 A5:1
           G5:.5 F5:.5 D5:1 C5:2
           D5:.75 D5:.75 F5:.5 G5:1 C6:1
           A5:.5 G5:.5 F5:1 D5:2`,
    unsure: GUESS,
  },

  // ── Karsu ────────────────────────────────────────────────────────
  {
    title: "Jest Oldu",
    artist: "Karsu",
    group: "Karsu",
    bpm: 90,
    part: "the chorus",
    hook: `E4:1 A4:1 B4:.5 C5:.5 B4:1
           A4:.5 G4:.5 A4:3
           E4:1 A4:1 B4:.5 C5:.5 D5:1
           C5:.5 B4:.5 A4:3`,
    unsure: GUESS,
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
    unsure: GUESS,
  },

  // ── Rocky Horror ─────────────────────────────────────────────────
  {
    title: "Time Warp",
    artist: "The Rocky Horror Show",
    group: "Rocky Horror",
    bpm: 112,
    part: "the chorus, \"Let's do the Time Warp again\", twice",
    hook: `E5:.5 E5:.5 E5:.5 A5:1 G#5:.5 F#5:1
           E5:4
           E5:.5 E5:.5 E5:.5 A5:1 G#5:.5 F#5:1
           E5:4`,
    unsure: "weak memory: the chorus's shape; fix the pitches by ear",
  },
  {
    title: "Sweet Transvestite",
    artist: "The Rocky Horror Show",
    group: "Rocky Horror",
    bpm: 110,
    part: "the chorus, \"I'm just a sweet transvestite, from Transsexual, Transylvania\"",
    hook: `B4:.5 B4:.5 B4:.5 E5:1 D5:.5 B4:.5 A4:.5
           B4:4
           B4:.5 B4:.5 B4:.5 D5:.5 E5:.5 D5:.5 B4:.5 A4:.5
           G4:.5 A4:.5 B4:3`,
    unsure: "weak memory: the syllable rhythm; fix the pitches by ear",
  },

  // ── 90'lar Türk popu ─────────────────────────────────────────────
  {
    title: "Şımarık",
    artist: "Tarkan",
    group: "90'lar Türk popu",
    bpm: 108,
    part: "the instrumental riff over Am–G",
    hook: `A4:.5 C5:.5 B4:.5 A4:.5 G4:.5 A4:.5 B4:1
           C5:.5 B4:.5 A4:.5 G4:.5 E4:2
           A4:.5 C5:.5 B4:.5 A4:.5 G4:.5 A4:.5 B4:1
           C5:.5 D5:.5 B4:.5 G4:.5 A4:2`,
    unsure: GUESS,
  },
  {
    title: "Aya Benzer",
    artist: "Mustafa Sandal",
    group: "90'lar Türk popu",
    bpm: 125,
    part: "the chorus",
    hook: `E5:.5 E5:.5 D5:.5 C5:.5 D5:1 E5:1
           C5:.5 B4:.5 A4:3
           E5:.5 E5:.5 D5:.5 C5:.5 D5:1 F5:1
           E5:.5 D5:.5 E5:3`,
    unsure: GUESS,
  },
  {
    title: "Her Gece",
    artist: "Mirkelam",
    group: "90'lar Türk popu",
    bpm: 100,
    part: "the chorus",
    hook: `G4:.5 A4:.5 B4:1 B4:.5 A4:.5 G4:1
           A4:.5 B4:.5 C5:1 B4:2
           G4:.5 A4:.5 B4:1 B4:.5 A4:.5 G4:1
           F#4:.5 G4:.5 A4:1 G4:2`,
    unsure: GUESS,
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
    unsure: GUESS,
  },
  {
    title: "Zalim",
    artist: "Levent Yüksel",
    group: "90'lar Türk popu",
    bpm: 96,
    part: "the chorus",
    hook: `E4:1 A4:1 C5:1 B4:.5 A4:.5
           B4:1 G#4:1 E4:2
           E4:1 A4:1 C5:1 D5:.5 C5:.5
           B4:.5 A4:.5 G#4:.5 B4:.5 A4:2`,
    unsure: GUESS,
  },
  {
    title: "Yaparım Bilirsin",
    artist: "Kenan Doğulu",
    group: "90'lar Türk popu",
    bpm: 110,
    part: "the chorus",
    hook: `D5:.5 D5:.5 D5:.5 C5:.5 D5:1 F5:1
           E5:.5 D5:.5 C5:.5 A4:.5 D5:2
           D5:.5 D5:.5 D5:.5 C5:.5 D5:1 G5:1
           F5:.5 E5:.5 D5:.5 C5:.5 D5:2`,
    unsure: GUESS,
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
  },
  {
    title: "Dancing Queen",
    artist: "ABBA",
    group: "Dünya hitleri",
    bpm: 100,
    part: "the chorus, \"You can dance, you can jive, having the time of your life\"",
    hook: `C#5:.5 E5:.5 E5:2 R:1
           C#5:.5 E5:.5 E5:2 R:1
           B4:.5 C#5:.5 D5:.5 D5:.5 D5:.5 C#5:.5 B4:.5 A4:.5
           B4:4`,
    unsure: "weak memory: the syllable rhythm; fix the pitches by ear",
  },
  {
    title: "My Heart Will Go On",
    artist: "Céline Dion",
    group: "Dünya hitleri",
    bpm: 99,
    part: "the chorus, \"Near, far, wherever you are, I believe that the heart does go on\"",
    hook: `E4:2 E4:1 E4:1
           E4:1 D#4:1 E4:2
           E4:1 D#4:1 E4:1 F#4:1
           G#4:2 F#4:2`,
    unsure: "pitches from the well-known letter version; check the rhythm by ear",
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
  },
];
