/**
 * The piano Game's Round (/20261209/piyano/, #205; spec #192 "Piano with
 * falling notes", stories 60–64; prototype verdict #180): which lane each
 * note of a song falls in, and what each key press is worth. Pure data and
 * arithmetic — no DOM, no audio, no clock of its own — so `piyano.test.ts`
 * pins every rule with fixed millisecond timestamps. The page
 * (`src/pages/20261209/piyano/index.astro`) owns the canvas, the sound and
 * the clock, and asks this module the questions.
 *
 * THE CHART (`chartSong`). A song of `./piano-songs.ts`, typed in the song
 * format of `./song.ts`, becomes the list of notes that fall:
 *   - Tempo: the song's `bpm` × `tempoPct` (per song, `./piano-songs.ts`). Times are ms from the song's first
 *     beat; the page adds its own count-in before that.
 *   - Lanes: 6, on the physical keys S D F J K L (`LANE_KEYS`, matched on
 *     `KeyboardEvent.code`, so Turkish-Q and US layouts both work). The
 *     song's lowest diatonic step goes to the left lane, its highest to the
 *     right, the rest linearly in between and rounded — the prototype's
 *     `laneOf`. So the contour is kept (higher = further right), a sharp
 *     shares its natural's lane, and a song wider than six steps puts
 *     neighbours together.
 *   - Length: the song repeats to about 90 s (#180, story 64): the parsed
 *     notes N = round(90 s ÷ one pass) times back to back, rests included,
 *     never fewer than once. `repeats` and `lengthMs` say how it came out.
 *
 * THE ROUND (`createRound`). The chart plus the latency offset (+30 ms, the
 * engine's `latencyMs`, #180), and three questions:
 *   - `press(lane, ms)`: she pressed a lane's key at `ms` on the song clock.
 *     The offset comes off first (she hears and sees late, so she presses
 *     late). The earliest unhit note of that lane within the window
 *     (±170 ms, `HIT_WINDOW_MS`, unless the song carries its own; inclusive)
 *     is hit; within half the window it is "Tam!", otherwise "Erken" or "Geç" by the sign of the error.
 *     Anything else is a stray press: counted and shown, and it cancels one
 *     hit in the score (Atıl, 2026-11-19; #180 had let strays go free).
 *   - `advance(ms)`: the clock moved on. Every unhit note whose window has
 *     closed (more than the window behind, after the same offset) becomes a
 *     miss, once; the newly missed notes come back so the page can say
 *     "Kaçtı".
 *   - `done(ms)`: every note is judged and the song's length has passed.
 * `hits`, `misses`, `strays` and `perfect` are the HUD's counts, and
 * `mistakes` is misses plus strays. The score is `pianoScore(hits,
 * notes.length, cap, strays)` in `./scores.ts`: a note never pressed is a
 * miss and each stray press cancels a hit, so (hits − strays) ÷ all notes is
 * her accuracy (`pianoAccuracy`).
 *
 * THE BUDGET (`mistakeBudget`). The most mistakes a song allows and still
 * scores the Small prize bar: Zor's HUD shows it as "Hata 4 / 10" (review
 * D3). It asks `pianoScore` itself, so it moves with the rule; the shared
 * prize hint names the same number (`piyano.test.ts` checks they agree).
 *
 * WHAT IT LEAVES OUT. Which note sounds on a hit (the page calls the
 * engine's `note(midi)` with the hit's note), the count-in, pause (the page
 * stops feeding times while the confirm card is up and shifts its clock
 * after), and the prototype's tuning panel, bot, guide melody and timing
 * histogram (all dropped by the verdict).
 */
import { PRIZE_BAR } from "./catalogue.ts";
import { pianoScore } from "./scores.ts";
import { parseSong } from "./song.ts";

/** The six lanes, left to right, as `KeyboardEvent.code`s (#180 layout B). */
export const LANE_KEYS = ["KeyS", "KeyD", "KeyF", "KeyJ", "KeyK", "KeyL"] as const;

/** What she reads on each lane's key. */
export const LANE_LABELS = ["S", "D", "F", "J", "K", "L"] as const;

/** How long a song plays, repeats included, in seconds (#180). */
export const ROUND_SECONDS = 90;

/** The lane of a physical key, or undefined when the key is no lane. */
export function laneOfKey(code: string): number | undefined {
  const lane = (LANE_KEYS as readonly string[]).indexOf(code);
  return lane < 0 ? undefined : lane;
}

/** What `chartSong` needs of a song. */
export type ChartSource = {
  /** The notes, in the song format of `./song.ts`. */
  readonly src: string;
  /** The original tempo, quarter notes a minute. */
  readonly bpm: number;
  /** How much of it she plays at, in percent (60). */
  readonly tempoPct: number;
};

export type ChartNote = {
  /** When it reaches the hit line, ms from the song's first beat. */
  readonly at: number;
  /** How long it rings, ms. */
  readonly durationMs: number;
  readonly midi: number;
  /** 0..5, left to right. */
  readonly lane: number;
};

export type Chart = {
  readonly notes: readonly ChartNote[];
  /** How many times the song plays back to back. */
  readonly repeats: number;
  /** The whole Round's song, ms, rests included. */
  readonly lengthMs: number;
};

/** A song as it falls: slowed, laned, repeated to about 90 s. */
export function chartSong(source: ChartSource): Chart {
  const song = parseSong(source.src);
  const msPerBeat = (60_000 * 100) / (source.bpm * source.tempoPct);
  const onceMs = song.beats * msPerBeat;
  const repeats = Math.max(1, Math.round((ROUND_SECONDS * 1000) / onceMs));

  const steps = song.notes.map((n) => n.step);
  const lo = Math.min(...steps);
  const hi = Math.max(...steps);
  const top = LANE_KEYS.length - 1;
  const laneOf = (step: number) => (hi === lo ? 0 : Math.round(((step - lo) / (hi - lo)) * top));

  const notes: ChartNote[] = [];
  for (let r = 0; r < repeats; r++) {
    for (const n of song.notes) {
      notes.push({
        at: (r * song.beats + n.beat) * msPerBeat,
        durationMs: n.duration * msPerBeat,
        midi: n.midi,
        lane: laneOf(n.step),
      });
    }
  }
  return { notes, repeats, lengthMs: repeats * onceMs };
}

/** ± how far from a note a press still hits it, ms (#180). The default; a
 *  song can carry its own (`windowMs` in `./piano-songs.ts`). */
export const HIT_WINDOW_MS = 170;

/** ± how close a hit must be to say "Tam!": always half the window (#180). */
export const perfectMs = (windowMs: number) => windowMs / 2;

/** What she reads over the hit line. */
export type Verdict = "Tam!" | "Erken" | "Geç";

/** What one key press was worth. */
export type Judgement =
  | {
      kind: "hit";
      note: ChartNote;
      /** Press minus note, after the offset: negative = early. */
      errorMs: number;
      verdict: Verdict;
    }
  | { kind: "stray" };

export type Round = {
  /** She pressed `lane`'s key at `ms` on the song clock. */
  press(lane: number, ms: number): Judgement;
  /** The clock reached `ms`: unhit notes whose window closed become misses; the new ones come back. */
  advance(ms: number): ChartNote[];
  /** Every note judged and the song over at `ms` (no offset: the song ends when it ends). */
  done(ms: number): boolean;
  readonly hits: number;
  readonly misses: number;
  readonly strays: number;
  /** Misses plus strays: each costs her one hit. */
  readonly mistakes: number;
  /** Hits that were "Tam!". */
  readonly perfect: number;
};

/** One Round on a chart; `latencyMs` comes off every time she hands in. */
export function createRound(chart: Chart, latencyMs: number, windowMs = HIT_WINDOW_MS): Round {
  const exactMs = perfectMs(windowMs);
  const { notes } = chart;
  /** Per note: still falling, hit, or missed. */
  const state: ("wait" | "hit" | "miss")[] = notes.map(() => "wait");
  /** Notes before this index are all judged; `advance` and `press` start here. */
  let first = 0;
  let hits = 0;
  let misses = 0;
  let strays = 0;
  let perfect = 0;

  return {
    press(lane, ms) {
      const t = ms - latencyMs;
      for (let i = first; i < notes.length; i++) {
        const note = notes[i]!;
        if (note.at - t > windowMs) break; // later notes are further still
        if (state[i] !== "wait" || note.lane !== lane) continue;
        const errorMs = t - note.at;
        if (Math.abs(errorMs) > windowMs) continue;
        state[i] = "hit";
        hits += 1;
        const exact = Math.abs(errorMs) <= exactMs;
        if (exact) perfect += 1;
        return { kind: "hit", note, errorMs, verdict: exact ? "Tam!" : errorMs < 0 ? "Erken" : "Geç" };
      }
      strays += 1;
      return { kind: "stray" };
    },
    advance(ms) {
      const t = ms - latencyMs;
      const missed: ChartNote[] = [];
      for (let i = first; i < notes.length; i++) {
        const note = notes[i]!;
        if (t - note.at <= windowMs) break; // notes are in time order
        if (state[i] === "wait") {
          state[i] = "miss";
          misses += 1;
          missed.push(note);
        }
        first = i + 1;
      }
      return missed;
    },
    done(ms) {
      return hits + misses === notes.length && ms >= chart.lengthMs;
    },
    get hits() {
      return hits;
    },
    get misses() {
      return misses;
    },
    get strays() {
      return strays;
    },
    get mistakes() {
      return misses + strays;
    },
    get perfect() {
      return perfect;
    },
  };
}

/** The most mistakes (misses plus strays) a song of `notes` notes and this
 *  `cap` allows while still scoring the Small prize bar; undefined when even
 *  a flawless Round falls short (Kolay, Orta). */
export function mistakeBudget(notes: number, cap: number): number | undefined {
  if (pianoScore(notes, notes, cap) < PRIZE_BAR) return undefined;
  let m = 0;
  while (m < notes && pianoScore(notes - m - 1, notes, cap) >= PRIZE_BAR) m += 1;
  return m;
}
