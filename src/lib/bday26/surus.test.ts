/*
 * Tests for the driving Game's simulation, "Hollanda'da sürüş" (#206).
 *
 *   node --test src/lib/bday26/surus.test.ts
 *
 * What is pinned: the mistake detectors, each as a pure function of a state
 * snapshot (speeding held 1.5 s, the bike lane over 0.8 s, no yield at a
 * cycle crossing, the wrong way round the roundabout past 0.5 rad, a crash
 * at 20 km/h or a curb below it, the soft time limit), and a few facts of a
 * whole drive that she would notice: the route, the cyclists, a canal, the
 * clock. The expected numbers are the spec's (#192, "Driving") and the
 * prototype verdict's (#181), not the code's. The car's feel (accel, brake,
 * steering) is Atıl's to judge by hand, so no test pins the physics beyond
 * "full gas gets you a speeding mistake".
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CELL,
  CHECKPOINTS,
  PX_PER_M,
  ROUNDABOUT,
  ROUTE_LENGTH_M,
  START,
  bikeLaneStep,
  cameraEase,
  createDrive,
  freshHold,
  freshWrongWay,
  hitsCyclist,
  impactMistake,
  overtimeDue,
  speedingStep,
  stepDrive,
  wrongWayStep,
  yieldConflict,
  type Hold,
  type Input,
  type WrongWay,
} from "./surus.ts";

/** Run a hold detector for `seconds` in steps of `dt`; how many times it fired. */
function holdFor(step: (h: Hold, dt: number) => { hold: Hold; fire: boolean }, h: Hold, seconds: number, dt = 0.1) {
  let fired = 0;
  for (let t = 0; t < seconds - 1e-9; t += dt) {
    const r = step(h, dt);
    h = r.hold;
    if (r.fire) fired++;
  }
  return { hold: h, fired };
}

// ---------------------------------------------------------------- speeding
// Spec: "speeding (limit + 3 km/h for 1.5 s)", limit 30 km/h.

test("speeding: 34 km/h for 1.4 s is no mistake yet; by 1.6 s it is one", () => {
  const early = holdFor((h, dt) => speedingStep(h, 34, dt), freshHold(), 1.4);
  assert.equal(early.fired, 0);
  const late = holdFor((h, dt) => speedingStep(h, 34, dt), freshHold(), 1.6);
  assert.equal(late.fired, 1);
});

test("speeding: 33 km/h, the limit plus the tolerance, never counts", () => {
  assert.equal(holdFor((h, dt) => speedingStep(h, 33, dt), freshHold(), 10).fired, 0);
});

test("speeding: staying fast counts once; a second after slowing down it can count again", () => {
  let r = holdFor((h, dt) => speedingStep(h, 45, dt), freshHold(), 6);
  assert.equal(r.fired, 1);
  r = holdFor((h, dt) => speedingStep(h, 25, dt), r.hold, 1.2);
  r = holdFor((h, dt) => speedingStep(h, 45, dt), r.hold, 1.6);
  assert.equal(r.fired, 1);
});

// --------------------------------------------------------------- bike lane
// Spec: "on the bike lane over 0.8 s". The red cycle crossings over a road
// are not lane: she has to cross them.

test("bike lane: 0.7 s on it is fine, 0.9 s is one light mistake", () => {
  assert.equal(holdFor((h, dt) => bikeLaneStep(h, "b", dt), freshHold(), 0.7).fired, 0);
  assert.equal(holdFor((h, dt) => bikeLaneStep(h, "b", dt), freshHold(), 0.9).fired, 1);
});

test("bike lane: the roundabout's cycle ring counts, a cycle crossing and the road do not", () => {
  assert.equal(holdFor((h, dt) => bikeLaneStep(h, "p", dt), freshHold(), 1).fired, 1);
  assert.equal(holdFor((h, dt) => bikeLaneStep(h, "z", dt), freshHold(), 5).fired, 0);
  assert.equal(holdFor((h, dt) => bikeLaneStep(h, "r", dt), freshHold(), 5).fired, 0);
});

// ------------------------------------------------------------------- yield
// Spec: "on a cycle crossing above 3 km/h with a crossing cyclist within 6 m
// heading towards her".

/** The car heading east at the origin; a cyclist riding south towards it. */
const car = { x: 0, y: 0, a: 0 };
const rider = (over: Partial<Parameters<typeof yieldConflict>[3][number]>) => ({
  x: 0, y: -20, dx: 0, dy: 1, fallen: 0, alpha: 1, hitCd: 0, ...over,
});

test("yield: a cyclist crossing towards her 20 px (≈2.9 m) away is a missed yield, measured in metres", () => {
  const d = yieldConflict(car, 20, "z", [rider({})]);
  assert.ok(d !== undefined);
  assert.ok(Math.abs(d - 20 / PX_PER_M) < 1e-9);
});

test("yield: further than 6 m, riding alongside, or already past her is no conflict", () => {
  assert.equal(yieldConflict(car, 20, "z", [rider({ y: -6.2 * PX_PER_M })]), undefined);
  assert.equal(yieldConflict(car, 20, "z", [rider({ dx: 1, dy: 0 })]), undefined);
  assert.equal(yieldConflict(car, 20, "z", [rider({ y: 20 })]), undefined);
});

test("yield: only on a cycle crossing, only above 3 km/h, and not for a fallen rider", () => {
  assert.equal(yieldConflict(car, 20, "r", [rider({})]), undefined);
  assert.equal(yieldConflict(car, 3, "z", [rider({})]), undefined);
  assert.equal(yieldConflict(car, 20, "z", [rider({ fallen: 1 })]), undefined);
});

// --------------------------------------------------------------- wrong way
// Spec: "wrong way in the roundabout (>0.5 rad clockwise)". The Dutch ride
// round counter-clockwise; on a north-up screen clockwise is the angle
// growing.

/** Drive round the ring at radius 60 px from angle `from` to `to`. */
function aroundRing(w: WrongWay, from: number, to: number) {
  let fired = 0;
  const step = to > from ? 0.05 : -0.05;
  for (let t = from; step > 0 ? t <= to + 1e-9 : t >= to - 1e-9; t += step) {
    const r = wrongWayStep(w, ROUNDABOUT.x + Math.cos(t) * 60, ROUNDABOUT.y + Math.sin(t) * 60);
    w = r.wrongWay;
    if (r.fire) fired++;
  }
  return { wrongWay: w, fired };
}

test("wrong way: 0.45 rad clockwise is forgiven, 0.6 rad is one heavy mistake", () => {
  assert.equal(aroundRing(freshWrongWay(), 0, 0.45).fired, 0);
  assert.equal(aroundRing(freshWrongWay(), 0, 0.6).fired, 1);
});

test("wrong way: a full turn the Dutch way, counter-clockwise, is fine", () => {
  assert.equal(aroundRing(freshWrongWay(), 0, -2 * Math.PI).fired, 0);
});

test("wrong way: it counts once per visit; leaving the roundabout forgets it", () => {
  let r = aroundRing(freshWrongWay(), 0, 3);
  assert.equal(r.fired, 1);
  const out = wrongWayStep(r.wrongWay, ROUNDABOUT.x + ROUNDABOUT.zone + 10, ROUNDABOUT.y);
  r = aroundRing(out.wrongWay, 0, 0.6);
  assert.equal(r.fired, 1);
});

// ------------------------------------------------------- crash, curb, rider
// Spec: "crash at ≥20 km/h" heavy, "curb below 20 km/h" light, "cyclist hit
// above 2 km/h" heavy.

test("impact: a touch at walking pace is nothing, under 20 km/h a curb, from 20 km/h a crash", () => {
  assert.equal(impactMistake(1.5), undefined);
  assert.equal(impactMistake(5), "curb");
  assert.equal(impactMistake(19.9), "curb");
  assert.equal(impactMistake(20), "crash");
  assert.equal(impactMistake(42), "crash");
});

test("cyclist hit: touching a rider above 2 km/h counts; creeping into one at 2 km/h does not", () => {
  const touching = rider({ x: 4.2 * PX_PER_M / 2 + 2, y: 0 });
  assert.equal(hitsCyclist(car, 10, touching), true);
  assert.equal(hitsCyclist(car, 2, touching), false);
  assert.equal(hitsCyclist(car, 10, rider({ x: 0, y: -40 })), false);
  assert.equal(hitsCyclist(car, 10, { ...touching, fallen: 1 }), false);
});

// --------------------------------------------------------- soft time limit
// Spec: "Soft limit 150 s: −3% at the limit, then every 20 s".

test("time: the first over-time mistake is due at 150 s, the next at 170 s, 190 s", () => {
  assert.equal(overtimeDue(149.9, 0), false);
  assert.equal(overtimeDue(150, 0), true);
  assert.equal(overtimeDue(169.9, 1), false);
  assert.equal(overtimeDue(170, 1), true);
  assert.equal(overtimeDue(190, 2), true);
});

// -------------------------------------------------------------- whole drive

const idle: Input = { gas: false, brake: false, left: false, right: false, handbrake: false };

/** A seeded random, so a drive's cyclists are the same on every run. */
function seeded(seed: number) {
  return () => (seed = (seed * 16807) % 2147483647) / 2147483647;
}

test("route: seven checkpoints, the last the finish, about 710 m of road", () => {
  assert.equal(CHECKPOINTS.length, 7);
  assert.equal(CHECKPOINTS.filter((c) => c.finish).length, 1);
  assert.equal(CHECKPOINTS[6]!.finish, true);
  assert.ok(Math.abs(ROUTE_LENGTH_M - 710) < 20, `route is ${ROUTE_LENGTH_M} m`);
});

test("cyclists: about twenty, at different spots each Round", () => {
  const a = createDrive(seeded(1));
  const b = createDrive(seeded(2));
  assert.equal(a.cyclists.length, 20);
  assert.notDeepEqual(a.cyclists.map((c) => c.x), b.cyclists.map((c) => c.x));
});

test("time: parked at the start until 25 s over the limit is two light over-time mistakes", () => {
  const d = createDrive(seeded(3));
  while (d.t < 175) stepDrive(d, idle, 1 / 30);
  const over = d.mistakes.filter((m) => m.id === "overtime");
  assert.equal(over.length, 2);
  assert.ok(over.every((m) => m.kind === "light"));
  assert.equal(d.mistakes.length, 2);
});

test("canal: one heavy mistake, then back at the last checkpoint with the clock still running", () => {
  const d = createDrive(seeded(4));
  // Roll into the lower canal, off the road west of the first bridge.
  Object.assign(d.car, { x: 10 * CELL, y: 58 * CELL, a: 0, v: 0 });
  stepDrive(d, idle, 1 / 30);
  assert.deepEqual(d.mistakes.map((m) => [m.id, m.kind]), [["canal", "heavy"]]);
  for (let i = 0; i < 40; i++) stepDrive(d, idle, 1 / 30);
  assert.equal(d.car.x, START.x);
  assert.equal(d.car.y, START.y);
  assert.ok(d.t > 1.3);
  assert.equal(d.mistakes.length, 1);
});

test("full gas down the first street is a speeding mistake within six seconds", () => {
  const d = createDrive(seeded(5));
  const gas: Input = { ...idle, gas: true };
  while (d.t < 6 && !d.mistakes.length) stepDrive(d, gas, 1 / 60);
  assert.deepEqual(d.mistakes.map((m) => m.id), ["speed"]);
  assert.match(d.mistakes[0]!.detail, /km\/sa$/);
});

// ------------------------------------------------------------------ camera
// The prototype eased the camera 8% of the way each frame, at 60 fps. The
// same easing must hold on a 144 Hz screen and a slow laptop alike.

test("camera: one 60 fps frame closes 8% of the gap, as the prototype did", () => {
  assert.ok(Math.abs(cameraEase(1 / 60) - 0.08) < 1e-9);
});

test("camera: the same second of play moves it the same way at 30, 60 or 144 fps", () => {
  const after = (fps: number) => {
    let cam = 0;
    for (let i = 0; i < fps; i++) cam += (100 - cam) * cameraEase(1 / fps);
    return cam;
  };
  // 1 − 0.92^60 of the way in one second, whatever the frame rate.
  const expected = 100 * (1 - 0.92 ** 60);
  for (const fps of [30, 60, 144]) assert.ok(Math.abs(after(fps) - expected) < 1e-6, `${fps} fps: ${after(fps)}`);
});
