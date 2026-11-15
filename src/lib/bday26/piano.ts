/**
 * The piano sound engine of the birthday games (#204; spec #192 "Piano
 * sound", research #186, song grilling #187): one sampled piano shared by
 * name the song (`/20261209/sarki/`, which plays a typed hook on its own)
 * and the piano Game (`/20261209/piyano/`, #205, which sounds one note per
 * hit). Melodies come in the song format of `./song.ts`.
 *
 * WHAT IT PLAYS. FluidR3 General MIDI's acoustic grand piano, prerendered
 * by midi-js-soundfonts as one MIDI.js file of 88 base64 MP3 notes (A0–C8,
 * 2.6 MB), self-hosted at `PIANO_SAMPLES_URL` so the night depends on no
 * third-party host and no rate limit (#186: the default smplr hosts rate
 * limit). `smplr`'s Soundfont loader fetches the file, decodes every note
 * once and plays them through the Web Audio API. The samples are CC BY 3.0
 * (Frank Wen; packaged by Benjamin Gleitzman), so every page that uses the
 * engine shows `PIANO_CREDIT` (#187: "the site shows its credit line").
 *
 * NO SOUND BEFORE HER FIRST GESTURE (spec; Chrome's autoplay rule, #186):
 * `createPiano` builds nothing audible. `unlock()` is the one call that
 * creates the AudioContext and starts loading the samples, and a page calls
 * it from a `keydown` or `pointerdown` handler. Until then `play` and `note`
 * do nothing at all. `unlock` is idempotent and also re-`resume()`s a
 * context the browser left suspended (an Esc as the first key counts as no
 * gesture), so a page may call it on every gesture.
 *
 * TIMING. Notes are scheduled on the audio clock, never with timers: the
 * hook is handed to the instrument whole, each note at `now + latency +
 * its offset`, so a busy main thread does not smear the melody. `latencyMs`
 * (default +30 ms, the tuning of #180) is the lead the first note gets and
 * the number the piano Game subtracts from her key times when it judges a
 * hit; it is a property, so #205 can read it and a tuning panel could set
 * it. One hook at a time: `play` stops whatever still sounds, and `stop`
 * cuts everything (the confirm-leave card, the result, the next question).
 * `play` returns after the notes are scheduled, or at once when the piano is
 * locked; while the samples still load it waits for them, and a `stop` or a
 * newer `play` in the meantime drops it, so a question she answers before
 * the piano is ready never plays late over the next one.
 *
 * WHAT THE PIANO GAME (#205) USES: `unlock()` on its first gesture,
 * `state`/`onState` to wait for "ready" before the count-in, `note(midi)`
 * for each hit (sounds now; `velocity` 0..1), `now()` for the audio clock,
 * `latencyMs` for judging, `stop()` on pause and abandon.
 *
 * THE BROWSER IS INJECTED. `createContext` and `createInstrument` default
 * to a real `AudioContext` (latencyHint "interactive") and smplr's
 * Soundfont over the self-hosted file, imported lazily so the page's own
 * script stays small and smplr loads after her gesture, together with the
 * samples. `piano.test.ts` passes fakes that record what was created and
 * what was started when.
 */
import type { Song } from "./song.ts";
import { timeSong } from "./song.ts";

/** Where the soundfont is served from (`public/20261209/piano/`). */
export const PIANO_SAMPLES_URL = "/20261209/piano/acoustic_grand_piano-mp3.js";

/** The credit the samples' licence asks for; shown on every page that plays them. */
export const PIANO_CREDIT = "Piyano sesi: FluidR3 GM (Frank Wen) · CC BY 3.0 · midi-js-soundfonts (Benjamin Gleitzman)";

/** The latency offset of #180: the lead a scheduled note gets, in ms. */
export const DEFAULT_LATENCY_MS = 30;

/** What the engine needs from an AudioContext. */
export type AudioClock = {
  readonly currentTime: number;
  readonly state: "suspended" | "running" | "closed" | "interrupted";
  resume(): Promise<void>;
};

/** What the engine needs from the sampled instrument (smplr's shape). */
export type PianoInstrument = {
  /** Resolves when every note is decoded; rejects when the samples will not load. */
  readonly ready: Promise<void>;
  /** Start a note; `time` on the audio clock (now when omitted), `duration` in seconds. */
  start(event: { note: number; time?: number; duration?: number; velocity?: number }): unknown;
  /** Stop every sounding note. */
  stop(): void;
};

export type PianoState = "locked" | "loading" | "ready" | "failed";

export type PianoOptions = {
  /** Default +30 ms. */
  latencyMs?: number;
  /** Called on every state change; a page shows "yükleniyor" from it. */
  onState?: (state: PianoState) => void;
  /** Default: a real AudioContext. Tests pass a fake clock. */
  createContext?: () => AudioClock;
  /** Default: smplr's Soundfont over `PIANO_SAMPLES_URL`. Tests pass a recorder. */
  createInstrument?: (context: AudioClock) => PianoInstrument;
};

export type PlayOptions = {
  bpm: number;
  /** Seconds into the song to start from. Default 0. */
  from?: number;
  /** How many seconds to play at most. Default: to the end. */
  seconds?: number;
};

export type Piano = {
  readonly state: PianoState;
  /** The lead every scheduled note gets, and what the piano Game subtracts from a key time. */
  latencyMs: number;
  /** From her gesture: create the AudioContext, load the samples. Resolves
   *  true when the piano is ready, false when the samples failed. */
  unlock(): Promise<boolean>;
  /** Play a song from the start (or `from`), stopping anything still sounding. */
  play(song: Song, options: PlayOptions): Promise<void>;
  /** One note, now. For the piano Game's hits. Nothing until ready. */
  note(midi: number, options?: { velocity?: number; duration?: number }): void;
  /** Silence, and drop a play still waiting for the samples. */
  stop(): void;
  /** The audio clock in seconds; undefined while locked. */
  now(): number | undefined;
};

export function createPiano(options: PianoOptions = {}): Piano {
  const createContext = options.createContext ?? (() => new AudioContext({ latencyHint: "interactive" }));
  const createInstrument = options.createInstrument ?? loadSoundfont;
  let latencyMs = options.latencyMs ?? DEFAULT_LATENCY_MS;
  let state: PianoState = "locked";
  let context: AudioClock | undefined;
  let instrument: PianoInstrument | undefined;
  /** Resolves to whether the samples loaded; set by the first `unlock`. */
  let loaded: Promise<boolean> | undefined;
  /** Bumped by every `play` and `stop`, so a play still waiting knows it was superseded. */
  let generation = 0;

  function setState(next: PianoState) {
    if (state === next) return;
    state = next;
    options.onState?.(next);
  }

  return {
    get state() {
      return state;
    },
    get latencyMs() {
      return latencyMs;
    },
    set latencyMs(ms: number) {
      latencyMs = ms;
    },
    unlock() {
      if (!context) {
        context = createContext();
        instrument = createInstrument(context);
        setState("loading");
        loaded = instrument.ready.then(
          () => (setState("ready"), true),
          () => (setState("failed"), false),
        );
      }
      if (context.state !== "running") {
        context.resume().catch(() => {
          // Not a real gesture yet (Esc, say): the next one tries again.
        });
      }
      return loaded!;
    },
    async play(song, { bpm, from = 0, seconds = Infinity }) {
      if (!instrument || !context) return;
      const mine = ++generation;
      instrument.stop();
      if (!(await loaded!) || mine !== generation) return;
      const start = context.currentTime + latencyMs / 1000;
      const end = from + seconds;
      for (const n of timeSong(song, bpm).notes) {
        if (n.time < from || n.time >= end) continue;
        instrument.start({ note: n.midi, time: start + (n.time - from), duration: n.duration });
      }
    },
    note(midi, { velocity, duration } = {}) {
      if (state !== "ready") return;
      instrument!.start({ note: midi, velocity, duration });
    },
    stop() {
      generation += 1;
      instrument?.stop();
    },
    now() {
      return context?.currentTime;
    },
  };
}

/**
 * The default instrument: smplr's Soundfont over the self-hosted FluidR3
 * file. smplr is imported here, not at the top, so it is fetched only after
 * her gesture and never sits in a page's first script. `smplr` wants a
 * `BaseAudioContext`; the default `createContext` always makes a real one,
 * and `AudioClock` is the slice of it the engine itself reads.
 */
function loadSoundfont(context: AudioClock): PianoInstrument {
  let soundfont: { start: PianoInstrument["start"]; stop(): void } | undefined;
  const ready = import("smplr").then(({ Soundfont }) => {
    const inst = Soundfont(context as unknown as BaseAudioContext, { instrumentUrl: PIANO_SAMPLES_URL });
    soundfont = inst;
    return inst.ready;
  });
  return {
    ready,
    start: (event) => soundfont?.start(event),
    stop: () => soundfont?.stop(),
  };
}
