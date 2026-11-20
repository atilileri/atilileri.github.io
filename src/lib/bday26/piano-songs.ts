/**
 * The piano Game's three songs (/20261209/piyano/, #205; spec #192 stories
 * 61–62 and 64; songs chosen on #187, tuning from the prototype verdict
 * #180). One song per difficulty, picked on the start screen with 1, 2, 3; the
 * Best score is the highest over all three (one Game, `piyano`).
 *
 * EACH SONG CARRIES:
 *   - `cap`: what a flawless Round is worth (#187/#192: Kolay 0.70, Orta
 *     0.85, Zor 1.00), so the 95% Small prize needs Türk Marşı. The score is
 *     `pianoScore(hits, notes, cap)` in `./scores.ts`.
 *   - `bpm`: the melody's own tempo as typed; she plays at `tempoPct` of it
 *     (60 / 60 / 65%).
 *   - `speed`: how fast the notes fall, px/s (190 / 240 / 380). Speed
 *     changes only how far apart the notes look, not when they must be hit.
 *   - `windowMs`: ± how far from a note a press still hits it (170 / 170 /
 *     100); "Tam!" is half of it.
 *   Zor was 60% tempo, 300 px/s and ±170 ms after #180. Atıl made it harder
 *   on 2026-11-19, when Piyano's Small prize became the kanun song: a faster
 *   tempo, a narrower window so timing counts (±90 ms), and a faster fall so
 *   each note shows for less. Stray presses cost a hit from then on too
 *   (`pianoScore` in `./scores.ts`). After the review (E1) he widened Zor's
 *   window to ±100 ms and kept the rest.
 *   - `src`: the melody in the song format of `./song.ts` (`NOTE[:beats]`,
 *     `R` a rest, one bar per line). `./piyano.ts` repeats it to about 90 s
 *     and spreads its pitch range over the six lanes, so each melody here is
 *     typed once and its range decides which notes share a key.
 *   - `unsure`: set when the notes were typed from a weak memory and need
 *     Atıl's ear before the night (#187: "the agent types them; Atıl
 *     approves each by ear").
 *
 * WHERE THE NOTES COME FROM.
 *   - İyi ki doğdun: the "Happy Birthday" tune she knows in Turkish, in C, in
 *     3/4, with its dotted pickup (G G) kept — that rhythm is the tune. Each
 *     pass ends on a held C and a bar's rest before the pickup comes again.
 *   - Für Elise (Beethoven, WoO 59): the right hand of the opening, in A
 *     minor, 3/8 — the A section, the B phrase, a one-bar link, the A section
 *     again. It replaced Hadi Bakalım (Sezen Aksu) after the review (G1):
 *     that chorus was typed from a weak memory and Atıl heard it was wrong.
 *     Für Elise was chosen because the agent knows its opening note for note;
 *     only the link bar (12) is simplified. Atıl approved it by ear on 2026-11-20.
 *   - Türk Marşı (Mozart, Rondo alla turca): copied verbatim from the
 *     prototype (`prototype/180-piano`), which Atıl played and tuned.
 *
 * Tempo and fall speed started from the prototype verdict (#180) and were
 * tuned by Atıl since: Zor on 2026-11-19 and after the review (E1), above.
 * Für Elise took the Orta values of the song it replaced (60%, 240 px/s,
 * ±170 ms) at its own tempo (♩ = 66, so a sixteenth falls every 379 ms).
 */

export type PianoDifficulty = "Kolay" | "Orta" | "Zor";

export type PianoSong = {
  readonly id: "kolay" | "orta" | "zor";
  readonly difficulty: PianoDifficulty;
  /** The title, as she reads it. */
  readonly name: string;
  /** Who wrote it, when the title alone does not say. */
  readonly by?: string;
  /** What a flawless Round scores, 0..1. */
  readonly cap: number;
  /** The melody's tempo as typed, quarter notes a minute. */
  readonly bpm: number;
  /** How much of `bpm` she plays at, percent. */
  readonly tempoPct: number;
  /** Fall speed, px/s. */
  readonly speed: number;
  /** ± hit window, ms; "Tam!" is half of it. */
  readonly windowMs: number;
  /** The melody in the song format. */
  readonly src: string;
  /** Set when the notes need Atıl's ear before the night, and why. */
  readonly unsure?: string;
};

export const PIANO_SONGS: readonly PianoSong[] = [
  {
    id: "kolay",
    difficulty: "Kolay",
    name: "İyi ki doğdun",
    cap: 0.7,
    bpm: 120,
    tempoPct: 60,
    speed: 190,
    windowMs: 170,
    src: `G4:.75 G4:.25
          A4 G4 C5   B4:2 G4:.75 G4:.25
          A4 G4 D5   C5:2 G4:.75 G4:.25
          G5 E5 C5   B4 A4 F5:.75 F5:.25
          E5 C5 D5   C5:2 R:3`,
  },
  {
    id: "orta",
    difficulty: "Orta",
    name: "Für Elise",
    by: "Beethoven",
    cap: 0.85,
    bpm: 66,
    tempoPct: 60,
    speed: 240,
    windowMs: 170,
    // 3/8, one bar a line, the pickup alone on the first. A section (bars
    // 1–8, second ending), the B phrase (9–11), one link bar (12, simplified:
    // it skips the E6 bridge and leads straight back), the A section again,
    // and a closing rest before the pickup comes round.
    src: `E5:.25 D#5:.25
          E5:.25 D#5:.25 E5:.25 B4:.25 D5:.25 C5:.25
          A4:.5 R:.25 C4:.25 E4:.25 A4:.25
          B4:.5 R:.25 E4:.25 G#4:.25 B4:.25
          C5:.5 R:.25 E4:.25 E5:.25 D#5:.25
          E5:.25 D#5:.25 E5:.25 B4:.25 D5:.25 C5:.25
          A4:.5 R:.25 C4:.25 E4:.25 A4:.25
          B4:.5 R:.25 E4:.25 C5:.25 B4:.25
          A4:.5 R:.25 B4:.25 C5:.25 D5:.25
          E5:.75 G4:.25 F5:.25 E5:.25
          D5:.75 F4:.25 E5:.25 D5:.25
          C5:.75 E4:.25 D5:.25 C5:.25
          B4:.5 R:.25 E4:.25 E5:.25 D#5:.25
          E5:.25 D#5:.25 E5:.25 B4:.25 D5:.25 C5:.25
          A4:.5 R:.25 C4:.25 E4:.25 A4:.25
          B4:.5 R:.25 E4:.25 G#4:.25 B4:.25
          C5:.5 R:.25 E4:.25 E5:.25 D#5:.25
          E5:.25 D#5:.25 E5:.25 B4:.25 D5:.25 C5:.25
          A4:.5 R:.25 C4:.25 E4:.25 A4:.25
          B4:.5 R:.25 E4:.25 C5:.25 B4:.25
          A4:.5 R:.5`,
  },
  {
    id: "zor",
    difficulty: "Zor",
    name: "Türk Marşı",
    by: "Mozart",
    cap: 1.0,
    bpm: 96,
    tempoPct: 65,
    speed: 380,
    windowMs: 100,
    src: `B4:.25 A4:.25 G#4:.25 A4:.25 C5:.5 R:.5 D5:.25 C5:.25 B4:.25 C5:.25 E5:.5 R:.5
          F5:.25 E5:.25 D#5:.25 E5:.25 B5:.25 A5:.25 G#5:.25 A5:.25 B5:.25 A5:.25 G#5:.25 A5:.25 C6:1
          A5:.5 C6:.5 B5:.5 A5:.5 G5:.5 A5:.5 B5:.5 A5:.5 G5:.5 A5:.5 B5:.5 A5:.5 G5:.5 F#5:.5 E5:1 R:1
          B4:.25 A4:.25 G#4:.25 A4:.25 C5:.5 R:.5 D5:.25 C5:.25 B4:.25 C5:.25 E5:.5 R:.5
          F5:.25 E5:.25 D#5:.25 E5:.25 B5:.25 A5:.25 G#5:.25 A5:.25 B5:.25 A5:.25 G#5:.25 A5:.25 C6:1
          A5:.25 B5:.25 C6:.25 B5:.25 A5:.25 G#5:.25 A5:.25 E5:.25 F5:.25 D5:.25 C5:.25 B4:.25 A4:1 R:1
          C5:.5 D5:.5 E5:.5 E5:.5 F5:.25 E5:.25 D5:.25 C5:.25 B4:1 A4:.5 B4:.5 C5:.5 C5:.5 D5:.25 C5:.25 B4:.25 A4:.25 G#4:1
          C5:.5 D5:.5 E5:.5 E5:.5 F5:.25 E5:.25 D5:.25 C5:.25 B4:.25 A4:.25 G#4:.25 B4:.25 A4:2`,
  },
];

/** The song a start-screen key picks: "1" Kolay, "2" Orta, "3" Zor. */
export function songByChoice(key: string): PianoSong | undefined {
  const i = ["1", "2", "3"].indexOf(key);
  return i < 0 ? undefined : PIANO_SONGS[i];
}

/** The song with this id (`"kolay"`, `"orta"`, `"zor"`), or undefined: a
 *  song card's `data-song`, or the level she played last as the page stored
 *  it (review D5), which may be missing or stale. */
export function songById(id: string | null | undefined): PianoSong | undefined {
  return PIANO_SONGS.find((s) => s.id === id);
}
