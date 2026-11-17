/*
 * Tests for the piano sound engine (#204; spec #192 "Piano sound"), run
 * with the browser's two audio objects replaced at the engine's seam:
 *
 *   node --test src/lib/bday26/piano.test.ts
 *
 * `createPiano` takes a factory for the AudioContext and one for the
 * sampled instrument; here they build fakes that record what was created
 * and which notes were started on which clock time. The rules pinned are
 * the spec's: no sound (and no AudioContext at all) before her first key
 * press or click, notes scheduled on the audio clock plus the +30 ms
 * latency offset, one hook at a time, `from`/`seconds` clipping. Expected
 * times are arithmetic on the fake clock, not the engine's output.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createPiano, type AudioClock, type PianoInstrument, type PianoOptions } from "./piano.ts";
import { parseSong } from "./song.ts";

type Started = { note: number; time?: number; duration?: number; velocity?: number };

/** A fake AudioContext, a fake instrument, and what each saw. */
function fakes(overrides: { readyLater?: boolean } = {}) {
  const log = { contexts: 0, started: [] as Started[], stopped: 0, cancelled: [] as Started[] };
  let resolveReady = () => {};
  const clock = {
    currentTime: 10,
    state: "suspended" as AudioClock["state"],
    resume() {
      clock.state = "running";
      return Promise.resolve();
    },
  };
  const options: Pick<PianoOptions, "createContext" | "createInstrument"> = {
    createContext() {
      log.contexts += 1;
      return clock;
    },
    createInstrument(): PianoInstrument {
      return {
        ready: overrides.readyLater ? new Promise<void>((r) => (resolveReady = r)) : Promise.resolve(),
        start(event) {
          const started = { note: event.note, time: event.time, duration: event.duration, velocity: event.velocity };
          log.started.push(started);
          // smplr's StopFn: cancels the note even while it still waits in the scheduler's queue.
          return () => log.cancelled.push(started);
        },
        stop() {
          log.stopped += 1;
        },
      };
    },
  };
  return { log, clock, options, ready: () => resolveReady() };
}

const TWO_NOTES = parseSong("C4 D4:2"); // at 120 bpm: C4 at 0 s for 0.5 s, D4 at 0.5 s for 1 s

test("before her first gesture there is no AudioContext and play sounds nothing", async () => {
  const { log, options } = fakes();
  const piano = createPiano(options);
  assert.equal(piano.state, "locked");
  await piano.play(TWO_NOTES, { bpm: 120 });
  piano.note(60);
  assert.equal(log.contexts, 0);
  assert.deepEqual(log.started, []);
});

test("her gesture creates one AudioContext, resumes it and loads the samples once", async () => {
  const { log, clock, options } = fakes();
  const piano = createPiano(options);
  const first = piano.unlock();
  assert.equal(piano.state, "loading");
  assert.equal(await first, true);
  assert.equal(piano.state, "ready");
  assert.equal(clock.state, "running");
  // A second gesture (every key press calls it) builds nothing new.
  assert.equal(await piano.unlock(), true);
  assert.equal(log.contexts, 1);
});

test("a song is scheduled on the audio clock, each note at now + 30 ms + its offset, with its length", async () => {
  const { log, options } = fakes();
  const piano = createPiano(options);
  await piano.unlock();
  await piano.play(TWO_NOTES, { bpm: 120 }); // the clock reads 10 s
  assert.deepEqual(log.started, [
    { note: 60, time: 10.03, duration: 0.5, velocity: undefined },
    { note: 62, time: 10.53, duration: 1, velocity: undefined },
  ]);
});

test("the latency offset is a parameter: +100 ms moves every note by that much", async () => {
  const { log, options } = fakes();
  const piano = createPiano({ ...options, latencyMs: 100 });
  await piano.unlock();
  await piano.play(parseSong("A4"), { bpm: 60 });
  assert.deepEqual(log.started, [{ note: 69, time: 10.1, duration: 1, velocity: undefined }]);
});

test("`from` and `seconds` cut a window out of the song, in seconds, the window's first note landing first", async () => {
  // Four one-beat notes at 60 bpm: C4 at 0, D4 at 1, E4 at 2, F4 at 3.
  const { log, options } = fakes();
  const piano = createPiano(options);
  await piano.unlock();
  await piano.play(parseSong("C4 D4 E4 F4"), { bpm: 60, from: 1, seconds: 2 });
  assert.deepEqual(
    log.started.map((s) => [s.note, s.time]),
    [
      [62, 10.03],
      [64, 11.03],
    ],
  );
});

test("one hook at a time: a new play silences the old one first, and stop silences everything", async () => {
  const { log, options } = fakes();
  const piano = createPiano(options);
  await piano.unlock();
  await piano.play(TWO_NOTES, { bpm: 120 });
  assert.equal(log.stopped, 1);
  await piano.play(TWO_NOTES, { bpm: 120 });
  assert.equal(log.stopped, 2);
  assert.equal(log.started.length, 4);
  piano.stop();
  assert.equal(log.stopped, 3);
});

test("a replay or a stop cancels the old hook's notes still queued ahead on the audio clock, not only the sounding ones", async () => {
  // smplr's stop() silences voices already sounding; a note scheduled for
  // later sits in its lookahead queue and would still play over the replay.
  // Only the stop function each start returned removes it from that queue.
  const { log, options } = fakes();
  const piano = createPiano(options);
  await piano.unlock();
  await piano.play(parseSong("C4 D4 E4"), { bpm: 60 });
  await piano.play(parseSong("G4"), { bpm: 60 });
  assert.deepEqual(
    log.cancelled.map((s) => s.note),
    [60, 62, 64],
  );
  piano.stop();
  assert.deepEqual(
    log.cancelled.map((s) => s.note),
    [60, 62, 64, 67],
  );
  // Nothing is cancelled twice.
  piano.stop();
  assert.equal(log.cancelled.length, 4);
});

test("a play that waits for the samples sounds when they arrive, unless a stop or a newer play came first", async () => {
  const { log, options, ready } = fakes({ readyLater: true });
  const piano = createPiano(options);
  void piano.unlock();
  assert.equal(piano.state, "loading");

  // Question 1 appears; she answers and question 2 appears before the piano is ready.
  const q1 = piano.play(parseSong("C4"), { bpm: 60 });
  const q2 = piano.play(parseSong("D4"), { bpm: 60 });
  ready();
  await Promise.all([q1, q2]);
  assert.deepEqual(
    log.started.map((s) => s.note),
    [62],
  );

  // A stop while waiting drops the play entirely.
  const { log: log2, options: options2, ready: ready2 } = fakes({ readyLater: true });
  const piano2 = createPiano(options2);
  void piano2.unlock();
  const waiting = piano2.play(parseSong("E4"), { bpm: 60 });
  piano2.stop();
  ready2();
  await waiting;
  assert.deepEqual(log2.started, []);
});

test("a single note sounds at once for a hit, with its velocity, and only once the piano is ready", async () => {
  const { log, options, ready } = fakes({ readyLater: true });
  const piano = createPiano(options);
  const unlocked = piano.unlock();
  piano.note(64, { velocity: 0.8 });
  assert.deepEqual(log.started, []);
  ready();
  await unlocked;
  piano.note(64, { velocity: 0.8 });
  assert.deepEqual(log.started, [{ note: 64, time: undefined, duration: undefined, velocity: 0.8 }]);
});

test("samples that will not load leave the piano failed and silent, and the page is told", async () => {
  const states: string[] = [];
  const { options } = fakes();
  const piano = createPiano({
    ...options,
    onState: (s) => states.push(s),
    createInstrument: () => ({ ready: Promise.reject(new Error("404")), start: () => {}, stop() {} }),
  });
  assert.equal(await piano.unlock(), false);
  assert.equal(piano.state, "failed");
  await piano.play(TWO_NOTES, { bpm: 120 });
  piano.note(60);
  assert.deepEqual(states, ["loading", "failed"]);
});
