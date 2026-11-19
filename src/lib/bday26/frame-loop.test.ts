/*
 * Tests for the canvas Games' shared animation loop.
 *
 *   node --test src/lib/bday26/frame-loop.test.ts
 *
 * The browser's frame calls are a fake: `fire(t)` runs the pending frame at
 * time t ms, as the browser would on its next paint.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createFrameLoop, type FrameLoopOptions } from "./frame-loop.ts";

function fakeClock(start = 1000) {
  let pending: ((now: number) => void) | undefined;
  let nextId = 1;
  let pendingId = 0;
  return {
    clock: {
      now: () => start,
      request: (cb: (now: number) => void) => {
        pending = cb;
        pendingId = nextId++;
        return pendingId;
      },
      cancel: (id: number) => {
        if (id === pendingId) pending = undefined;
      },
    } satisfies FrameLoopOptions["clock"],
    /** Run the frame the loop asked for, at `now` ms; false if none was asked. */
    fire(now: number) {
      const cb = pending;
      pending = undefined;
      cb?.(now);
      return cb !== undefined;
    },
  };
}

test("each frame gets the seconds since the last, capped", () => {
  const f = fakeClock(1000);
  const dts: number[] = [];
  const loop = createFrameLoop({ canRun: () => true, frame: (dt) => void dts.push(dt), maxDt: 0.05, clock: f.clock });
  loop.start();
  f.fire(1016);
  f.fire(1032);
  f.fire(2032); // a stalled tab: one second, capped
  assert.deepEqual(dts, [0.016, 0.016, 0.05]);
});

test("start does nothing while the page says the world may not move", () => {
  const f = fakeClock();
  let may = false;
  let frames = 0;
  const loop = createFrameLoop({ canRun: () => may, frame: () => void (frames += 1), maxDt: 0.05, clock: f.clock });
  loop.start();
  assert.equal(f.fire(1016), false);
  may = true;
  loop.start();
  assert.equal(f.fire(1016), true);
  assert.equal(frames, 1);
});

test("stop ends the frames; a frame that returns false ends them too", () => {
  const f = fakeClock();
  let frames = 0;
  const loop = createFrameLoop({ canRun: () => true, frame: () => (frames += 1) < 2, maxDt: 0.05, clock: f.clock });
  loop.start();
  loop.stop();
  assert.equal(f.fire(1016), false);

  loop.start();
  assert.equal(f.fire(1016), true);
  assert.equal(f.fire(1032), true); // the second frame says the Round is over
  assert.equal(f.fire(1048), false);
  assert.equal(frames, 2);
});

test("after a pause the first frame counts from the restart, not from before it", () => {
  let now = 1000;
  const f = fakeClock();
  const dts: number[] = [];
  const loop = createFrameLoop({
    canRun: () => true,
    frame: (dt) => void dts.push(dt),
    maxDt: 1,
    clock: { ...f.clock, now: () => now },
  });
  loop.start();
  f.fire(1020);
  loop.stop();
  now = 9000;
  loop.start();
  f.fire(9010);
  assert.deepEqual(dts, [0.02, 0.01]);
});
