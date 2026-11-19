/*
 * Tests for the hiking map's walking hiker: where she stands along a trail
 * and how long a step takes.
 *
 *   node --test src/lib/bday26/yuruyus-art.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { pointAlong, walkMs } from "./yuruyus-art.ts";

// An L-shaped trail: 30 units east, then 10 units south; 40 long.
const L = [
  { x: 0, y: 0 },
  { x: 30, y: 0 },
  { x: 30, y: 10 },
];

test("the hiker stands at the trail's start, its end, and in between by distance walked", () => {
  assert.deepEqual(pointAlong(L, 0), { x: 0, y: 0 });
  assert.deepEqual(pointAlong(L, 1), { x: 30, y: 10 });
  // Half of 40 is 20 along: still on the first leg.
  assert.deepEqual(pointAlong(L, 0.5), { x: 20, y: 0 });
  // 35 along: 5 down the second leg.
  assert.deepEqual(pointAlong(L, 0.875), { x: 30, y: 5 });
});

test("outside 0..1 she stays at the ends, and a one-point trail is that point", () => {
  assert.deepEqual(pointAlong(L, -1), { x: 0, y: 0 });
  assert.deepEqual(pointAlong(L, 2), { x: 30, y: 10 });
  assert.deepEqual(pointAlong([{ x: 4, y: 5 }], 0.5), { x: 4, y: 5 });
});

test("a step takes 0.4 to 0.8 s, longer for a longer trail; walking back is quick", () => {
  assert.equal(walkMs(0), 400);
  assert.equal(walkMs(1000), 600);
  assert.equal(walkMs(5000), 800);
  assert.ok(walkMs(300) < walkMs(900));
  assert.equal(walkMs(1000, { back: true }), 200);
});
