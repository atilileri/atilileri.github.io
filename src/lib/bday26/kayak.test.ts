/*
 * Tests for the ski Game's simulation, "Kayak macerası" (#207).
 *
 *   node --test src/lib/bday26/kayak.test.ts
 *
 * What is pinned: the course is fixed (story 86) — the same seed builds the
 * same course every Round, and the locked seed holds the prototype verdict's
 * numbers (#179: 72 flags over 105 s, a checkpoint every 20 s) — and the fall
 * rule (story 85): a fall returns her to the last checkpoint, standing, and
 * the flags she took since that checkpoint go back on the course, while the
 * ones before it stay hers. The expected numbers are the spec's (#192, "Ski
 * platformer"), not the code's. The feel (speed, jump, gravity) is Atıl's to
 * judge by hand, so no test pins the physics beyond "a skier who jumps every
 * obstacle reaches the finish".
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { COURSE_SEED, TUNING, buildCourse, createRun, flagsHeld, flagsMissed, ground, pressJump, stepRun, FIXED_STEP, type Run, type RunEvent } from "./kayak.ts";

test("the locked course holds exactly 72 flags over 105 s, a checkpoint every 20 s", () => {
  const course = buildCourse(COURSE_SEED);
  assert.equal(course.flags.length, 72);
  // 105 s at the base speed of 330 px/s.
  assert.equal(course.finishX, 105 * 330);
  assert.deepEqual(
    course.checkpoints.map((c) => c.x),
    [20, 40, 60, 80].map((s) => s * 330),
  );
});

test("the same seed builds the same course every time; another seed builds another", () => {
  assert.deepEqual(buildCourse(COURSE_SEED), buildCourse(COURSE_SEED));
  assert.notDeepEqual(buildCourse(COURSE_SEED + 1), buildCourse(COURSE_SEED));
});

test("every Round starts on the same fresh course: flags taken in one Round are back in the next", () => {
  const a = createRun();
  a.course.flags[0]!.got = true;
  const b = createRun();
  assert.equal(flagsHeld(b), 0);
  assert.deepEqual(b.course, buildCourse(COURSE_SEED));
});

// --------------------------------------------------------- a whole Round
// A test skier: rides at the base speed and jumps when a rock or a crevasse
// is just ahead and she is on the snow. `skip` names obstacles she rides
// straight into (by their x), to make a fall happen where the test wants it.

type Obstacle = { x: number; w: number };

function obstacles(run: Run): Obstacle[] {
  return [...run.course.rocks, ...run.course.gaps].sort((a, b) => a.x - b.x);
}

function ride(run: Run, opts: { until: (run: Run, events: RunEvent[]) => boolean; skip?: (o: Obstacle) => boolean; maxSeconds?: number }) {
  const list = obstacles(run);
  const all: RunEvent[] = [];
  const input = { faster: false, slower: false, jumpHeld: true };
  for (let t = 0; t < (opts.maxSeconds ?? 200); t += FIXED_STEP) {
    if (run.onGround && run.crash <= 0) {
      const next = list.find((o) => o.x + o.w > run.x - 10 && o.x - run.x < 70);
      if (next && next.x - run.x > 30 && !opts.skip?.(next)) pressJump(run);
    }
    const events = stepRun(run, input, FIXED_STEP);
    all.push(...events);
    if (opts.until(run, all)) return all;
  }
  throw new Error(`ride did not end; x=${run.x}`);
}

test("a skier who jumps every rock and crevasse reaches the finish in about 105 s with no fall", () => {
  const run = createRun();
  const events = ride(run, { until: (r) => r.finished });
  assert.equal(events.filter((e) => e.kind === "fall").length, 0);
  assert.ok(run.time > 100 && run.time < 110, `time ${run.time}`);
  assert.equal(events.filter((e) => e.kind === "checkpoint").length, 4);
  assert.ok(flagsHeld(run) > 0);
});

test("a fall before the first checkpoint returns her to the start, and every flag she took goes back", () => {
  const run = createRun();
  // Once she holds a flag, she rides into the next obstacle.
  ride(run, { until: (r) => r.crash > 0, skip: () => flagsHeld(run) > 0 });
  assert.ok(run.lastCp === null, "the fall came before the first checkpoint");
  assert.ok(flagsHeld(run) > 0, "she held some flags before the fall");
  ride(run, { until: (r) => r.crash <= 0, skip: () => true });
  assert.equal(run.x, 0);
  assert.equal(run.onGround, true);
  assert.equal(flagsHeld(run), 0);
});

test("a fall after a checkpoint returns her to it: flags since the checkpoint come back, the ones before stay", () => {
  const run = createRun();
  const cp = run.course.checkpoints[0]!;
  // Ride past the first checkpoint; once she holds a flag beyond it, into the next obstacle.
  const since = () => run.course.flags.filter((f) => f.got && f.x > cp.x).length;
  ride(run, { until: (r) => r.crash > 0, skip: () => since() > 0 });
  assert.equal(run.lastCp, cp, "the fall came between the first and second checkpoints");
  const before = run.course.flags.filter((f) => f.got && f.x <= cp.x).length;
  assert.ok(before > 0, "she took flags before the checkpoint");
  ride(run, { until: (r) => r.crash <= 0, skip: () => true });
  assert.equal(run.x, cp.x);
  assert.equal(run.vx, TUNING.speed);
  assert.equal(flagsHeld(run), before);
  // The ones that came back can be taken again: each is on the course, not got.
  assert.equal(since(), 0);
});

test("a fall costs only time: the clock keeps running through it", () => {
  const run = createRun();
  const first = obstacles(run)[0]!;
  ride(run, { until: (r) => r.crash > 0, skip: (o) => o === first });
  const at = run.time;
  ride(run, { until: (r) => r.crash <= 0, skip: () => true });
  assert.ok(run.time - at >= 0.85, `the crash took ${run.time - at} s`);
  assert.equal(run.falls, 1);
  assert.equal(run.finished, false);
});

test("a jump says so once, when she leaves the snow: one take-off, none while she flies or rides off a lip", () => {
  const run = createRun();
  const input = { faster: false, slower: false, jumpHeld: true };
  pressJump(run);
  const first = stepRun(run, input, FIXED_STEP);
  assert.equal(first.filter((e) => e.kind === "takeoff").length, 1);
  // The rest of the jump, until she lands: no second take-off.
  const rest = ride(run, { until: (_r, events) => events.some((e) => e.kind === "land"), skip: () => true });
  assert.equal(rest.filter((e) => e.kind === "takeoff").length, 0);
  // Riding off a crevasse's lip without pressing jump is no take-off.
  const lip = createRun();
  const gap = lip.course.gaps[0]!;
  Object.assign(lip, { x: gap.x - 5, y: ground(gap.x - 5) });
  const off: RunEvent[] = [];
  while (lip.onGround) off.push(...stepRun(lip, input, FIXED_STEP));
  assert.equal(off.filter((e) => e.kind === "takeoff").length, 0);
});

test("flags missed: none at the start; a flag behind her, out of reach and not taken, counts; a fall gives it back", () => {
  const run = createRun();
  assert.equal(flagsMissed(run), 0);
  // Her test skier takes the first flag; ride to just past it with it left on the course.
  const first = run.course.flags[0]!;
  ride(run, { until: (r) => r.x > first.x - 200 });
  first.got = true; // keep the ride from taking it …
  ride(run, { until: (r) => r.x > first.x + 40 });
  first.got = false; // … then leave it behind her, untaken
  assert.equal(flagsMissed(run), 1);
  // Still within reach is not missed yet.
  const near = createRun();
  Object.assign(near, { x: first.x + 10 });
  assert.equal(flagsMissed(near), 0);
  // A fall before the first checkpoint sends her back to the start: the flag is ahead again.
  ride(run, { until: (r) => r.crash > 0, skip: () => true });
  ride(run, { until: (r) => r.crash <= 0, skip: () => true });
  assert.equal(run.x, 0);
  assert.equal(flagsMissed(run), 0);
});

test("flags missed: at the finish, every flag is either held or missed", () => {
  const run = createRun();
  ride(run, { until: (r) => r.finished });
  assert.ok(flagsMissed(run) > 0, "the test skier misses some");
  assert.equal(flagsHeld(run) + flagsMissed(run), 72);
});
