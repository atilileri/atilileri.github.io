/**
 * The animation loop the real-time canvas Games share: Kayak macerası
 * (kayak) and Hollanda'da sürüş (surus). One `requestAnimationFrame` chain
 * that hands each frame the seconds since the last one, capped so a stalled
 * tab never jumps the world forward.
 *
 * `start()` runs only when the page's `canRun()` says so: each page keeps
 * its own reasons to stand still (no Round, the shell's confirm card, her
 * pause from `./pause-dom.ts`: P, a lost focus, a hidden tab) as its own
 * flags, sets them, and calls `stop()` or `start()`. The frame returns false when the Round is over; the loop
 * then ends without another frame.
 *
 * The piano (piyano) keeps its own loop: it runs on an absolute song clock,
 * not a frame delta, and its pause shifts that clock instead of halting a
 * world, so this shape does not fit it.
 */

export type FrameLoop = {
  /** Begin, or begin again, from now. Nothing when `canRun()` says no. */
  start(): void;
  /** No more frames until the next `start()`. */
  stop(): void;
};

export type FrameLoopOptions = {
  /** May the world move now? Asked on every `start()`. */
  canRun: () => boolean;
  /** One frame: `dt` seconds since the last, `now` the frame's time. False ends the loop. */
  frame: (dt: number, now: number) => boolean | void;
  /** The cap on `dt`, seconds. */
  maxDt: number;
  /** The browser's clock and frame calls; the tests hand fakes. */
  clock?: {
    now: () => number;
    request: (cb: (now: number) => void) => number;
    cancel: (id: number) => void;
  };
};

export function createFrameLoop(options: FrameLoopOptions): FrameLoop {
  const { canRun, frame, maxDt } = options;
  const clock = options.clock ?? {
    now: () => performance.now(),
    request: (cb: (now: number) => void) => requestAnimationFrame(cb),
    cancel: (id: number) => cancelAnimationFrame(id),
  };
  let id = 0;
  let alive = false;
  let last = 0;

  function tick(now: number) {
    id = 0;
    const dt = Math.min(maxDt, (now - last) / 1000);
    last = now;
    if (frame(dt, now) === false) alive = false;
    // A frame may have stopped the loop, or started it again itself.
    if (alive && id === 0) id = clock.request(tick);
  }

  const loop: FrameLoop = {
    start() {
      loop.stop();
      if (!canRun()) return;
      alive = true;
      last = clock.now();
      id = clock.request(tick);
    },
    stop() {
      clock.cancel(id);
      id = 0;
      alive = false;
    },
  };
  return loop;
}
