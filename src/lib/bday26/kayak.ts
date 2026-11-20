/**
 * The ski Game's simulation, "Kayak macerası" (/20261209/kayak/, #207; spec
 * #192 "Ski platformer", stories 84–86). Everything that decides what happens
 * on the slope lives here, with no DOM: the course, the skier's physics, the
 * rocks and crevasses that make her fall, the flags she takes, the
 * checkpoints and the finish. The page (`src/pages/20261209/kayak/
 * index.astro`) reads the keys into an `Input`, calls `stepRun` at a fixed
 * step, and draws this state; the score is `skiScore` in `./scores.ts`.
 *
 * A PORT, NOT A REDESIGN. The prototype `prototype/179-ski`
 * (`public/20261209/prototype-ski.html`, read it with `git show`) is the
 * reference, and Atıl's verdict on #179 was "Dengeli, the feel is right;
 * seed fixed; 72 flags". So `TUNING` is the prototype's Dengeli preset as is,
 * `buildCourse` is its course generator with the same random calls in the
 * same order (so seed 7 still lays out the same 72 flags, 27 rocks, 8
 * crevasses and 4 checkpoints), and `stepRun` is its `step` line by line.
 * What changed is only the shape: the knobs and presets are gone (constants
 * now), the two options Atıl played with switched on are hard-wired on
 * (variable jump: letting go early cuts the rise to 45%; and the fall rule
 * below), its globals became one `Run` object, and the snow spray, crash
 * sparks and "+1" pops — drawing, with `Math.random` — moved to the page,
 * which hears about them through the `RunEvent`s `stepRun` returns.
 *
 * THE COURSE. Seed `COURSE_SEED` = 7, fixed (story 86: she learns it over a
 * few Rounds). 105 s long at the base speed of 330 px/s (34 650 px), a
 * checkpoint every 20 s (at 20, 40, 60 and 80 s; none at 100 s, too near the
 * finish), cut into slots of 1.15 s; each slot is empty, a rock or a
 * crevasse, and with a chance of 0.65 carries flags — on the arc of a jump
 * over its rock or crevasse, or on or above the snow. `createRun` builds it
 * fresh every Round, so a flag taken in one Round is back in the next.
 *
 * THE FALL RULE (story 85; prototype `fall` / `respawn`). Hitting a rock,
 * dropping into a crevasse or slamming into its far wall is a fall: 0.9 s of
 * tumbling while the clock runs, then she stands at the last checkpoint she
 * passed (or the start) at the base speed, and every flag past that
 * checkpoint that she had taken goes back on the course. The ones before it
 * stay hers. So a fall costs only time and the flags she can take again.
 *
 * UNITS. World pixels, y pointing down: the slope `ground(x)` falls to the
 * right (y grows with x) with two gentle waves on it. Seconds, px/s, px/s².
 */

// ---------------------------------------------------------------- rules

/** The prototype's Dengeli preset, as Atıl locked it (#179). Do not re-tune here. */
export const TUNING = {
  /** Base speed, px/s; → and ← move the target by ±range %. */
  speed: 330,
  range: 35,
  /** Jump take-off speed, px/s, and gravity, px/s². */
  jump: 660,
  gravity: 1950,
  /** Course densities: chance per slot of flags, a rock, a crevasse. */
  flagD: 0.65,
  rockD: 0.45,
  gapD: 0.12,
  /** Course length and checkpoint spacing, s at the base speed. */
  lengthSec: 105,
  cpSec: 20,
  /** A flag is taken within this many px of her middle. */
  radius: 24,
} as const;

/** The fixed course (#179's verdict: seed 7, 72 flags). */
export const COURSE_SEED = 7;

/** The simulation's step, s: the prototype ran `step` at 120 Hz. */
export const FIXED_STEP = 1 / 120;

/** Speeding up / slowing down towards the target speed, px/s², on the snow and in the air. */
const ACCEL_GROUND = 520;
const ACCEL_AIR = 200;
/** A jump pressed this long before landing still fires, s. */
const JUMP_BUFFER = 0.12;
/** A jump pressed this long after leaving the snow (over a crevasse lip) still fires, s. */
const COYOTE = 0.08;
/** Letting go of jump cuts the rise to this share of the take-off speed. */
const JUMP_CUT = 0.45;
/** How long a fall tumbles before she stands at the checkpoint, s. */
export const CRASH_S = 0.9;
/** Below the snow line in a crevasse by this many px is a fall. */
const GAP_DEPTH = 140;
/** Landing on a crevasse's far side this many px below its lip is hitting the wall. */
const GAP_WALL = 14;
/** Her middle, where flags are taken, px above her feet. */
const PICKUP_Y = 22;

// ---------------------------------------------------------------- the slope

/** The snow line's height at x (y down). */
export const ground = (x: number) => 380 + 0.17 * x + 30 * Math.sin(x / 310) + 16 * Math.sin(x / 127 + 1);
/** The slope's gradient at x, for leaning the skier. */
export const slope = (x: number) => 0.17 + (30 / 310) * Math.cos(x / 310) + (16 / 127) * Math.cos(x / 127 + 1);

/** The prototype's seeded random, so one seed is one course. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** How high a full jump rises, px, and how long it stays up, s. */
const apex = () => (TUNING.jump * TUNING.jump) / (2 * TUNING.gravity);
const airtime = () => (2 * TUNING.jump) / TUNING.gravity;

// ---------------------------------------------------------------- the course

export type Rock = { x: number; w: number; h: number; /** Four shape numbers 0..1, for drawing. */ s: [number, number, number, number] };
export type Gap = { x: number; w: number };
export type Flag = { x: number; y: number; got: boolean };
export type Checkpoint = { x: number; reached: boolean };

export type Course = {
  seed: number;
  /** Where the finish gate stands; crossing it ends the Round. */
  finishX: number;
  checkpoints: Checkpoint[];
  rocks: Rock[];
  gaps: Gap[];
  /** Left to right. */
  flags: Flag[];
};

/** The prototype's `buildCourse`, every random call in its order. */
export function buildCourse(seed: number): Course {
  const rng = mulberry32(seed);
  const P = TUNING;
  const v = P.speed;
  const A = apex();
  const T = airtime();
  const jd = T * v;
  const len = P.lengthSec * v;
  const slotPx = 1.15 * v;
  const startPad = 2.2 * v;
  const endPad = 2.0 * v;
  const checkpoints: Checkpoint[] = [];
  for (let t = P.cpSec; t < P.lengthSec - P.cpSec * 0.4; t += P.cpSec) checkpoints.push({ x: t * v, reached: false });
  const rocks: Rock[] = [];
  const gaps: Gap[] = [];
  const flags: Flag[] = [];
  /** A point on the arc of a jump taken at x0, a share f of the way through. */
  const traj = (x0: number, f: number) => {
    const t = f * T;
    const x = x0 + v * t;
    let y = ground(x0) - 22 - (P.jump * t - (P.gravity * t * t) / 2);
    y = Math.min(y, ground(x) - 24);
    return { x, y };
  };
  const addFlag = (x: number, y: number) => flags.push({ x, y, got: false });
  for (let sx = startPad; sx + slotPx < len - endPad; sx += slotPx) {
    const mid = sx + slotPx / 2;
    if (checkpoints.some((c) => Math.abs(mid - c.x) < slotPx * 0.9)) continue;
    const center = mid + (rng() - 0.5) * slotPx * 0.3;
    const r = rng();
    let kind: "empty" | "rock" | "gap" = "empty";
    if (r < P.gapD) kind = "gap";
    else if (r < P.gapD + P.rockD * (1 - P.gapD)) kind = "rock";
    let gapX = 0;
    if (kind === "rock") {
      const w = 26 + rng() * 22;
      const h = Math.min(24 + rng() * 18, A * 0.55);
      rocks.push({ x: center - w / 2, w, h, s: [rng(), rng(), rng(), rng()] });
    } else if (kind === "gap") {
      const gw = jd * (0.32 + rng() * 0.25);
      gapX = center - gw / 2;
      gaps.push({ x: gapX, w: gw });
    }
    if (rng() < P.flagD) {
      if (kind === "rock") {
        const p = traj(center - jd / 2, 0.5);
        addFlag(p.x, p.y);
      } else if (kind === "gap") {
        const x0 = gapX - jd * 0.2;
        for (const f of [0.3, 0.5, 0.7]) {
          const p = traj(x0, f);
          addFlag(p.x, p.y);
        }
      } else {
        const k = rng();
        if (k < 0.4) {
          const n = 1 + Math.floor(rng() * 3);
          for (let i = 0; i < n; i++) {
            const x = center - (n - 1) * 30 + i * 60;
            addFlag(x, ground(x) - 24);
          }
        } else if (k < 0.7) {
          const p = traj(center - jd / 2, 0.25 + rng() * 0.25);
          addFlag(p.x, p.y);
        } else {
          const x0 = center - jd / 2;
          for (const f of [0.25, 0.5, 0.75]) {
            const p = traj(x0, f);
            addFlag(p.x, p.y);
          }
        }
      }
    }
  }
  flags.sort((a, b) => a.x - b.x);
  return { seed, finishX: len, checkpoints, rocks, gaps, flags };
}

/** The crevasse under x, if any. */
export function gapAt(course: Course, x: number): Gap | undefined {
  return course.gaps.find((g) => x > g.x && x < g.x + g.w);
}

// ---------------------------------------------------------------- one Round

export type Run = {
  course: Course;
  /** Her feet, world px. */
  x: number;
  y: number;
  vx: number;
  vy: number;
  onGround: boolean;
  /** Seconds left of the coyote and jump-buffer windows. */
  coyote: number;
  jumpBuf: number;
  /** Seconds left of a fall's tumble; > 0 while she is down. */
  crash: number;
  /** The Round's clock, s; it runs through falls. */
  time: number;
  falls: number;
  /** The last checkpoint she passed; a fall brings her back here. */
  lastCp: Checkpoint | null;
  /** Drawing only: how far she crouches (0..1) and how far she has spun in a fall. */
  tuck: number;
  spin: number;
  /** She crossed the finish: the Round is over. */
  finished: boolean;
};

/** What she does this step. */
export type Input = {
  /** → (or D): aim for the base speed + 35%. */
  faster: boolean;
  /** ← (or A): aim for the base speed − 35%. */
  slower: boolean;
  /** Space, ↑ or W is held: the jump keeps rising. */
  jumpHeld: boolean;
};

/** What happened in a step, for the page to show (sparks, "+1", messages). */
export type RunEvent =
  | { kind: "takeoff"; x: number; y: number }
  | { kind: "flag"; x: number; y: number }
  | { kind: "land"; x: number; y: number }
  | { kind: "fall"; x: number; y: number }
  | { kind: "checkpoint"; index: number; total: number }
  | { kind: "finish" };

/** A Round at the start line, on a fresh build of the fixed course. */
export function createRun(): Run {
  return {
    course: buildCourse(COURSE_SEED),
    x: 0,
    y: ground(0),
    vx: TUNING.speed,
    vy: 0,
    onGround: true,
    coyote: 0,
    jumpBuf: 0,
    crash: 0,
    time: 0,
    falls: 0,
    lastCp: null,
    tuck: 0,
    spin: 0,
    finished: false,
  };
}

/** The flags she holds now. */
export function flagsHeld(run: Run): number {
  return run.course.flags.reduce((n, f) => n + (f.got ? 1 : 0), 0);
}

/** How far behind her a flag can still be taken, px: past this it is gone. */
const REACH = TUNING.radius + 4;

/** The flags she has left behind her, out of reach and not taken: the ones
 *  that cost her score. A fall sends her back to a checkpoint, so the ones
 *  missed past it are ahead of her again and count no more. */
export function flagsMissed(run: Run): number {
  return run.course.flags.reduce((n, f) => n + (!f.got && f.x < run.x - REACH ? 1 : 0), 0);
}

/** How many checkpoints she has passed. */
export function checkpointsReached(run: Run): number {
  return run.course.checkpoints.reduce((n, c) => n + (c.reached ? 1 : 0), 0);
}

/** She pressed jump (a fresh press, not a held repeat): it fires within the buffer. */
export function pressJump(run: Run) {
  run.jumpBuf = JUMP_BUFFER;
}

function fall(run: Run, events: RunEvent[]) {
  if (run.crash > 0) return;
  run.crash = CRASH_S;
  run.falls++;
  run.spin = 0;
  events.push({ kind: "fall", x: run.x, y: run.y });
}

/** Back on her skis at the last checkpoint; the flags past it go back on the course. */
function respawn(run: Run) {
  const cx = run.lastCp ? run.lastCp.x : 0;
  for (const f of run.course.flags) if (f.got && f.x > cx) f.got = false;
  Object.assign(run, { x: cx, y: ground(cx), vx: TUNING.speed, vy: 0, onGround: true, coyote: 0, jumpBuf: 0, crash: 0 });
}

/** One step of the prototype's `step`. Does nothing once she has finished. */
export function stepRun(run: Run, input: Input, dt: number): RunEvent[] {
  const events: RunEvent[] = [];
  if (run.finished) return events;
  const P = TUNING;
  const { course } = run;
  run.time += dt;
  if (run.crash > 0) {
    run.crash -= dt;
    run.spin += dt * 14;
    if (run.crash <= 0) respawn(run);
    return events;
  }
  const { faster: right, slower: left, jumpHeld: held } = input;
  const target = P.speed * (1 + (right ? P.range / 100 : left ? -P.range / 100 : 0));
  const acc = run.onGround ? ACCEL_GROUND : ACCEL_AIR;
  run.vx += Math.sign(target - run.vx) * Math.min(Math.abs(target - run.vx), acc * dt);
  run.tuck += ((right || !run.onGround ? 1 : 0) - run.tuck) * Math.min(1, dt * 10);
  run.jumpBuf -= dt;
  run.coyote -= dt;
  if (run.jumpBuf > 0 && (run.onGround || run.coyote > 0)) {
    run.vy = -P.jump;
    run.onGround = false;
    run.coyote = 0;
    run.jumpBuf = 0;
    events.push({ kind: "takeoff", x: run.x, y: run.y });
  }
  const px = run.x;
  run.x += run.vx * dt;
  if (run.onGround) {
    if (gapAt(course, run.x)) {
      run.onGround = false;
      run.vy = 0;
      run.coyote = COYOTE;
    } else run.y = ground(run.x);
  }
  if (!run.onGround) {
    if (!held && run.vy < -P.jump * JUMP_CUT) run.vy = -P.jump * JUMP_CUT;
    run.vy += P.gravity * dt;
    run.y += run.vy * dt;
    const g = gapAt(course, run.x);
    if (!g && run.y >= ground(run.x)) {
      // Did she cross a crevasse and meet its far wall below the lip?
      const crossed = course.gaps.find((q) => px <= q.x + q.w && run.x >= q.x + q.w);
      if (crossed && run.y > ground(run.x) + GAP_WALL) {
        fall(run, events);
        return events;
      }
      run.y = ground(run.x);
      run.vy = 0;
      run.onGround = true;
      events.push({ kind: "land", x: run.x, y: run.y });
    }
    if (g && run.y > ground(run.x) + GAP_DEPTH) {
      fall(run, events);
      return events;
    }
  }
  // Rocks.
  for (const r of course.rocks) {
    if (run.x + 9 < r.x + 4 || run.x - 9 > r.x + r.w - 4) continue;
    const top = ground(r.x + r.w / 2) - r.h + 6;
    if (run.y > top) {
      fall(run, events);
      return events;
    }
  }
  // Flags.
  const cy = run.y - PICKUP_Y;
  const rr = P.radius * P.radius;
  for (const f of course.flags) {
    if (f.got || Math.abs(f.x - run.x) > REACH) continue;
    const dx = f.x - run.x;
    const dy = f.y - cy;
    if (dx * dx + dy * dy < rr) {
      f.got = true;
      events.push({ kind: "flag", x: f.x, y: f.y });
    }
  }
  // Checkpoints.
  course.checkpoints.forEach((c, index) => {
    if (!c.reached && run.x >= c.x) {
      c.reached = true;
      run.lastCp = c;
      events.push({ kind: "checkpoint", index, total: course.checkpoints.length });
    }
  });
  if (run.x >= course.finishX) {
    run.finished = true;
    events.push({ kind: "finish" });
  }
  return events;
}
