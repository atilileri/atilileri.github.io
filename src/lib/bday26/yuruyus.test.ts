/*
 * Tests for the hiking map core: the five maps, the shortest route, and the
 * route she builds junction by junction.
 *
 *   node --test src/lib/bday26/yuruyus.test.ts
 *
 * What is pinned and why:
 *   - The five maps are the prototype's (#183): same seeds, same names, same
 *     shortest routes. The expected lengths and trail counts were measured
 *     by running the prototype's own generator (notes for #202), not this
 *     port, so a drift in the port shows up here as a wrong kilometre.
 *   - The shortest route is checked on a small hand-drawn map too, where the
 *     answer is obvious on paper: fewer trails is not shorter.
 *   - Route rules (spec, "Hiking map"): a step goes to a neighbour only, a
 *     junction already on the route cuts back to it, undo drops one step but
 *     never the car park, nothing goes past the summit. The 1–9 numbering
 *     runs clockwise from north, so a key always means the same direction.
 *   - The map picker never deals the same map twice in a row.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  LEVELS,
  choices,
  formatKm,
  generateMap,
  neighbours,
  pickRound,
  routeLength,
  shortestRoute,
  startRoute,
  stepRoute,
  undoRoute,
  type Graph,
  type HikingMap,
} from "./yuruyus.ts";

// ---------------------------------------------------------- the five maps
// Seviye 2 is the prototype's five maps, untouched.

const MAPS = LEVELS[1]!.maps;

test("Seviye 2 is the prototype's five maps, in its order and with its names", () => {
  assert.deepEqual(
    MAPS.map((m) => [m.name, m.seed]),
    [
      ["Kartal Tepesi", 7921],
      ["Çam Sırtı", 8031],
      ["Sisli Doruk", 8124],
      ["Kızılkaya", 8227],
      ["Ayı Yaylası", 8329],
    ],
  );
});

test("each map has the prototype's 26 junctions and its trail count", () => {
  assert.deepEqual(
    MAPS.map((m) => [m.junctions.length, m.trails.length]),
    [
      [26, 44],
      [26, 47],
      [26, 42],
      [26, 43],
      [26, 45],
    ],
  );
});

test("each map's shortest route has the prototype's length and trail count", () => {
  assert.deepEqual(
    MAPS.map((m) => {
      const best = shortestRoute(m);
      return [Math.round(best.length), best.route.length - 1];
    }),
    [
      [8775, 7],
      [9110, 7],
      [10242, 8],
      [10607, 9],
      [8813, 7],
    ],
  );
});

test("the same seed always draws the same map", () => {
  const again = generateMap(MAPS[2]!.seed);
  assert.deepEqual(JSON.stringify(again.trails), JSON.stringify(MAPS[2]!.trails));
  assert.deepEqual(again.junctions, MAPS[2]!.junctions);
});

test("every map's shortest route runs from the car park to the summit along trails", () => {
  for (const m of MAPS) {
    const best = shortestRoute(m);
    assert.equal(best.route[0], m.start);
    assert.equal(best.route.at(-1), m.summit);
    assert.equal(routeLength(m, best.route), best.length);
  }
});

// ------------------------------------------------- a map drawn on paper
//
//                3 summit
//             ╱  │  ╲
//         4 km  1 km  1,5 km
//         ╱      │      ╲
//   car park 0 ─ 1 ─── 2
//             1 km  1 km
//
// The direct 0→3 is one trail of 4 km; 0→1→3 is 2 km; 0→1→2→3 is 3,5 km.

const P = (x: number, y: number) => ({ x, y });
const trail = (a: number, b: number, length: number) => ({ a, b, length, pts: [] });

const PAPER: Graph = {
  junctions: [P(0, 100), P(100, 100), P(200, 100), P(100, 0)],
  trails: [trail(0, 1, 1000), trail(1, 2, 1000), trail(0, 3, 4000), trail(1, 3, 1000), trail(2, 3, 1500)],
  start: 0,
  summit: 3,
};

test("the shortest route is the shortest in km, not the fewest trails", () => {
  const best = shortestRoute(PAPER);
  assert.deepEqual(best.route, [0, 1, 3]);
  assert.equal(best.length, 2000);
});

test("a route's length adds up its trails", () => {
  assert.equal(routeLength(PAPER, [0]), 0);
  assert.equal(routeLength(PAPER, [0, 1, 2, 3]), 3500);
});

// -------------------------------------------------------- neighbours 1–9

test("neighbours are numbered clockwise from north", () => {
  // A crossroads: north, east, south, west and north-east of the centre (screen y grows down).
  const cross: Graph = {
    junctions: [P(100, 100), P(100, 0), P(200, 100), P(100, 200), P(0, 100), P(180, 20)],
    trails: [1, 2, 3, 4, 5].map((v) => trail(0, v, 1000)),
    start: 0,
    summit: 1,
  };
  assert.deepEqual(neighbours(cross, 0), [1, 5, 2, 3, 4]); // N, NE, E, S, W
});

test("the numbered choices leave out junctions already on the route", () => {
  // From 1 the neighbours clockwise from north are 3 (N), 2 (E), 0 (W); 0 is behind her.
  assert.deepEqual(choices(PAPER, [0, 1]), [3, 2]);
});

test("at the summit there is nothing left to choose", () => {
  assert.deepEqual(choices(PAPER, [0, 1, 3]), []);
});

// ------------------------------------------------------- building a route

test("a route starts at the car park", () => {
  assert.deepEqual(startRoute(PAPER), [0]);
});

test("a step goes to a neighbour of the route's end", () => {
  assert.deepEqual(stepRoute(PAPER, [0], 1), [0, 1]);
  assert.deepEqual(stepRoute(PAPER, [0, 1], 2), [0, 1, 2]);
});

test("a junction with no trail from the route's end is not a step", () => {
  assert.deepEqual(stepRoute(PAPER, [0], 2), [0]);
});

test("clicking a junction already on the route cuts the route back to it", () => {
  assert.deepEqual(stepRoute(PAPER, [0, 1, 2], 1), [0, 1]);
  assert.deepEqual(stepRoute(PAPER, [0, 1, 2], 0), [0]);
});

test("nothing goes past the summit, but a cut back from it still works", () => {
  const done = [0, 1, 3];
  assert.deepEqual(stepRoute(PAPER, done, 2), done);
  assert.deepEqual(stepRoute(PAPER, done, 1), [0, 1]);
});

test("undo drops the last step, never the car park", () => {
  assert.deepEqual(undoRoute([0, 1, 2]), [0, 1]);
  assert.deepEqual(undoRoute([0]), [0]);
});

// ------------------------------------------------- the three levels
// After Atıl's play test a Round is three maps: Seviye 1 easy, 2 medium,
// 3 hard. Harder means more junctions and trails, a longer shortest route,
// and near-equal alternatives where the easy maps have one clear winner.

const EASY = LEVELS[0]!.maps;
const HARD = LEVELS[2]!.maps;

test("a Round has three levels, each with five maps, every map named once", () => {
  assert.equal(LEVELS.length, 3);
  for (const level of LEVELS) assert.equal(level.maps.length, 5);
  const names = LEVELS.flatMap((l) => l.maps.map((m) => m.name));
  assert.equal(new Set(names).size, 15);
});

test("Seviye 1 and Seviye 3 are drawn from their fixed seeds", () => {
  assert.deepEqual(EASY.map((m) => m.seed), [1005, 1013, 1031, 1036, 1083]);
  assert.deepEqual(HARD.map((m) => m.seed), [3122, 3177, 3190, 3255, 3277]);
});

test("each level has more junctions and more trails than the one before, on every map", () => {
  const span = (maps: readonly HikingMap[], f: (m: HikingMap) => number) => [Math.min(...maps.map(f)), Math.max(...maps.map(f))];
  for (let i = 1; i < LEVELS.length; i++) {
    const [, lowJ] = span(LEVELS[i - 1]!.maps, (m) => m.junctions.length);
    const [highJ] = span(LEVELS[i]!.maps, (m) => m.junctions.length);
    assert.ok(highJ! > lowJ!, `Seviye ${i + 1} junctions`);
    const [, lowT] = span(LEVELS[i - 1]!.maps, (m) => m.trails.length);
    const [highT] = span(LEVELS[i]!.maps, (m) => m.trails.length);
    assert.ok(highT! > lowT!, `Seviye ${i + 1} trails`);
  }
});

test("each level's shortest routes take more trails, and every hard one is longer than every easy one", () => {
  const hops = (maps: readonly HikingMap[]) => maps.map((m) => shortestRoute(m).route.length - 1);
  assert.deepEqual(hops(EASY), [6, 5, 6, 6, 5]);
  assert.deepEqual(hops(HARD), [10, 10, 11, 10, 10]);
  const km = (maps: readonly HikingMap[]) => maps.map((m) => Math.round(shortestRoute(m).length));
  assert.deepEqual(km(EASY), [7921, 8654, 9170, 8785, 8898]);
  assert.deepEqual(km(HARD), [11440, 10118, 10642, 10371, 10341]);
  assert.ok(Math.min(...km(HARD)) > Math.max(...km(EASY)));
});

/** How much longer the second-shortest route is than the shortest, in percent. */
function runnerUp(m: HikingMap): number {
  const best = shortestRoute(m);
  let second = Infinity;
  for (let i = 1; i < best.route.length; i++) {
    const [a, b] = [best.route[i - 1]!, best.route[i]!];
    const without = { ...m, trails: m.trails.filter((t) => !((t.a === a && t.b === b) || (t.a === b && t.b === a))) };
    second = Math.min(second, shortestRoute(without).length);
  }
  return (second / best.length - 1) * 100;
}

test("an easy map has one clear winner; a hard map has a runner-up within 5%", () => {
  for (const m of EASY) assert.ok(runnerUp(m) >= 5, `${m.name}: ${runnerUp(m).toFixed(1)}%`);
  for (const m of HARD) assert.ok(runnerUp(m) < 5, `${m.name}: ${runnerUp(m).toFixed(1)}%`);
});

// ---------------------------------------------------------- picking maps

test("the first Round can deal any map on each level", () => {
  assert.deepEqual(pickRound([undefined, undefined, undefined], () => 0), [0, 0, 0]);
  assert.deepEqual(pickRound([undefined, undefined, undefined], () => 0.99), [4, 4, 4]);
});

test("no level deals the map it dealt last Round", () => {
  for (let last = 0; last < 5; last++) {
    for (const r of [0, 0.2, 0.4, 0.6, 0.8, 0.99]) {
      const next = pickRound([last, last, last], () => r);
      for (const i of next) {
        assert.notEqual(i, last);
        assert.ok(i >= 0 && i < 5);
      }
    }
  }
});

test("a level with no last map (or a stale one) is dealt fresh", () => {
  assert.deepEqual(pickRound([undefined, 2, undefined], () => 0.5), [2, 3, 2]);
});

// ------------------------------------------------------------- the km text

test("lengths read in km with a Turkish decimal comma", () => {
  assert.equal(formatKm(8775), "8,8 km");
  assert.equal(formatKm(10242), "10,2 km");
  assert.equal(formatKm(0), "0,0 km");
});
