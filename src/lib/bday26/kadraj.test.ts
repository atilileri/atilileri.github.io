/*
 * Tests for the photo framing core, "Kadraj" (#203):
 *
 *   node --test src/lib/bday26/kadraj.test.ts
 *
 * Seam: the pure module `./kadraj.ts`, the crop box she moves and the score
 * one crop earns. The expected numbers are the spec's (#192 "Photo
 * framing", the prototype verdict on #184), worked by hand on boxes chosen
 * so the arithmetic is plain:
 *
 *   - A 300 × 400 box has a 500 diagonal (a 3-4-5 triangle), so 10% of it
 *     is 50 px, 20% is 100, 30% is 150. Its top-left thirds point is
 *     (100, 133⅓), and the line from there to the box's corner (0, 0) is
 *     166⅔ long, a third of the diagonal; the Subject points below walk out
 *     along that line, so the nearest thirds point never changes under them.
 *   - A 1600 × 1000 photo for the crop box: 30% of it is 480 × 300.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  drag,
  grabAt,
  grow,
  moveBy,
  nudge,
  reset,
  ringRadius,
  scoreCrop,
  shrink,
  startFraming,
  turn,
  type Crop,
  type Framing,
} from "./kadraj.ts";

/** Points and boxes agree to a thousandth of a pixel: thirds are never exact in floating point. */
function assertAt(actual: Record<string, number>, expected: Record<string, number>) {
  for (const k of Object.keys(expected)) {
    assert.ok(Math.abs(actual[k]! - expected[k]!) < 1e-3, `${k}: ${actual[k]} is not ${expected[k]}`);
  }
}

const BOX = { x: 0, y: 0, w: 300, h: 400 };
/** The point `t` of the way from the box's top-left thirds point to its corner. */
const outFromThirds = (t: number) => ({ x: 100 - 100 * t, y: 400 / 3 - (400 / 3) * t });

// ------------------------------------------------------------ the score

test("score: the Subject point on a thirds point is 100", () => {
  assert.equal(scoreCrop(BOX, { x: 100, y: 400 / 3 }).score, 100);
});

test("score: 10% of the diagonal from the thirds point is still 100, the edge of perfect", () => {
  assert.equal(scoreCrop(BOX, outFromThirds(0.3)).score, 100); // 50 px of 500
});

test("score: 11% of the diagonal is 95, the Small prize edge of one photo", () => {
  assert.equal(scoreCrop(BOX, outFromThirds(0.33)).score, 95); // 55 px
  assert.equal(scoreCrop(BOX, outFromThirds(0.36)).score, 90); // 60 px, 12%
});

test("score: 20% of the diagonal is 50, halfway down the line", () => {
  assert.equal(scoreCrop(BOX, outFromThirds(0.6)).score, 50); // 100 px
});

test("score: 30% of the diagonal and beyond is 0", () => {
  assert.equal(scoreCrop(BOX, outFromThirds(0.9)).score, 0); // 150 px
  assert.equal(scoreCrop(BOX, outFromThirds(0.99)).score, 0);
});

test("score: a Subject point outside the box is 0, however close to a thirds point", () => {
  // 20 px left of a box whose left thirds line is 10 px in: 30 px from it, 6% of a 500 diagonal
  const box = { x: 0, y: 0, w: 30, h: 499.1 };
  assert.equal(scoreCrop(box, { x: -20, y: 499.1 / 3 }).score, 0);
  assert.equal(scoreCrop(BOX, { x: 301, y: 400 / 3 }).score, 0);
});

test("nearest thirds point: the one of the four closest to the Subject point, in photo pixels", () => {
  const box = { x: 600, y: 300, w: 300, h: 400 };
  assertAt(scoreCrop(box, { x: 850, y: 600 }).nearest, { x: 800, y: 566.667 });
  assertAt(scoreCrop(box, { x: 610, y: 310 }).nearest, { x: 700, y: 433.333 });
});

test("nearest thirds point: shown even when the Subject point fell outside the box", () => {
  const scored = scoreCrop(BOX, { x: 320, y: 390 });
  assert.equal(scored.inside, false);
  assertAt(scored.nearest, { x: 200, y: 266.667 });
});

test("the 95% ring: 11% of the crop diagonal around the thirds point", () => {
  assert.ok(Math.abs(ringRadius(BOX) - 55) < 1e-9);
  assert.equal(scoreCrop(BOX, outFromThirds(0.329)).score, 95); // just inside the ring
  assert.ok(scoreCrop(BOX, outFromThirds(0.345)).score < 95); // just outside it
});

// -------------------------------------------------------- the crop box

const PHOTO = { w: 1600, h: 1000 };
/** Apply one operation n times. */
function times(n: number, op: (f: Framing) => Framing, f: Framing): Framing {
  for (let i = 0; i < n; i++) f = op(f);
  return f;
}
const centre = (c: Crop) => ({ cx: c.x + c.w / 2, cy: c.y + c.h / 2, ratio: c.w / c.h });

test("crop box: a photo starts with the whole photo in the box, the right way round", () => {
  const f = startFraming(PHOTO);
  assert.deepEqual(f.crop, { x: 0, y: 0, w: 1600, h: 1000 });
  assert.equal(f.turned, false);
});

test("crop box: shrinking stops at 30% of the photo, centred, in the photo's own aspect", () => {
  assertAt(times(300, shrink, startFraming(PHOTO)).crop, { x: 560, y: 350, w: 480, h: 300 });
});

test("crop box: one shrink keeps the centre and the aspect", () => {
  const { crop } = shrink(startFraming(PHOTO));
  assert.ok(crop.w < 1600);
  assertAt(centre(crop), { cx: 800, cy: 500, ratio: 1.6 });
});

test("crop box: growing never takes the box past the photo", () => {
  const small = times(20, shrink, startFraming(PHOTO));
  assertAt(times(300, grow, small).crop, { x: 0, y: 0, w: 1600, h: 1000 });
});

test("crop box: an arrow moves it 0.5% of the photo's long side, with Shift five times that", () => {
  const small = times(300, shrink, startFraming(PHOTO)); // x 560, y 350
  assertAt(nudge(small, 1, 0).crop, { x: 568, y: 350 });
  assertAt(nudge(small, 0, -1, true).crop, { x: 560, y: 310 });
});

test("crop box: moving stops at the photo's edge", () => {
  const small = times(300, shrink, startFraming(PHOTO));
  assertAt(moveBy(small, -5000, 5000).crop, { x: 0, y: 700, w: 480, h: 300 });
  assert.deepEqual(times(50, (f) => nudge(f, 1, 1, true), startFraming(PHOTO)).crop, { x: 0, y: 0, w: 1600, h: 1000 });
});

test("crop box: X turns it to the other aspect around its centre, as big as the photo allows", () => {
  const turned = turn(startFraming(PHOTO));
  assert.equal(turned.turned, true);
  assertAt(turned.crop, { x: 487.5, y: 0, w: 625, h: 1000 }); // 1000 tall, 1000 × 1000/1600 wide
  const back = turn(turned);
  assert.equal(back.turned, false);
  assertAt({ ratio: back.crop.w / back.crop.h }, { ratio: 1.6 });
});

test("crop box: turned, it still never shrinks under 30% of the photo nor leaves it", () => {
  const f = times(300, shrink, turn(startFraming(PHOTO)));
  // 30% of 1600 wide at 1000/1600 aspect is 480 × 768; centred in the photo
  assertAt(f.crop, { x: 560, y: 116, w: 480, h: 768 });
  const corner = moveBy(f, 9999, 9999).crop;
  assertAt(corner, { x: 1120, y: 232 });
});

test("crop box: R puts the whole photo back, the right way round", () => {
  const messy = moveBy(times(30, shrink, turn(startFraming(PHOTO))), 100, 100);
  assert.deepEqual(reset(messy), startFraming(PHOTO));
});

// ------------------------------------------------------ mouse resizing

test("drag a corner: the opposite corner stays put and the box keeps its aspect", () => {
  const f = startFraming(PHOTO);
  assertAt(drag(f, f.crop, { dx: 1, dy: 1 }, { x: 800, y: 400 }).crop, { x: 0, y: 0, w: 800, h: 500 });
});

test("drag a corner: no smaller than 30%, no further than the photo's edge", () => {
  const f = startFraming(PHOTO);
  assertAt(drag(f, f.crop, { dx: 1, dy: 1 }, { x: 10, y: 10 }).crop, { x: 0, y: 0, w: 480, h: 300 });
  const small = times(300, shrink, f); // 560, 350, 480 × 300
  assertAt(drag(small, small.crop, { dx: -1, dy: -1 }, { x: -500, y: -500 }).crop, { x: 0, y: 0, w: 1040, h: 650 });
});

test("drag an edge: the opposite edge stays put, the box grows both ways across it", () => {
  const f = startFraming(PHOTO);
  assertAt(drag(f, f.crop, { dx: 1, dy: 0 }, { x: 800, y: 123 }).crop, { x: 0, y: 250, w: 800, h: 500 });
  const small = times(300, shrink, f);
  assertAt(drag(small, small.crop, { dx: 0, dy: 1 }, { x: 0, y: 900 }).crop, { x: 360, y: 350, w: 880, h: 550 });
});

test("grab: inside the box moves it, near a corner or an edge resizes, outside does nothing", () => {
  const box = { x: 100, y: 100, w: 400, h: 300 };
  assert.equal(grabAt(box, { x: 300, y: 250 }, 16, 10), "move");
  assert.deepEqual(grabAt(box, { x: 495, y: 110 }, 16, 10), { dx: 1, dy: -1 });
  assert.deepEqual(grabAt(box, { x: 92, y: 250 }, 16, 10), { dx: -1, dy: 0 });
  assert.deepEqual(grabAt(box, { x: 300, y: 405 }, 16, 10), { dx: 0, dy: 1 });
  assert.equal(grabAt(box, { x: 50, y: 50 }, 16, 10), null);
});
