/**
 * The hiking map core, "Yürüyüş haritası" (/20261209/yuruyus/, ticket #202;
 * spec #192 "Hiking map", stories 81–83; feel decided on the prototype #183).
 * No DOM, no clock, no `Math.random`: the five maps, the shortest route on
 * each, and the rules of the route she builds junction by junction. The page
 * (`src/pages/20261209/yuruyus/index.astro`) paints and listens; the printed
 * map art is `./yuruyus-art.ts`; the score is `hikingScore` in `./scores.ts`.
 *
 * THE FIVE MAPS. The spec says "the prototype's 5 maps are kept as fixed
 * data". They are kept as the prototype's generator plus its five seeds, not
 * as a JSON dump: the generator is fully deterministic (mulberry32, its own
 * stream), so seed 7921 is Kartal Tepesi down to the last wiggle of every
 * trail, and the art (contours, hills) comes from the same stream for free.
 * `yuruyus.test.ts` pins each map's junction and trail counts and its
 * shortest route (length and trail count) against numbers measured on the
 * prototype itself, so a drift in this port shows up as a wrong kilometre.
 * The seeds are the ones the prototype's `buildSet` landed on (setSeed 1,
 * `7919 + i·101 + k`, the first k whose shortest route has 6+ junctions and
 * where "head straight for the summit" does not reach 95%). Change nothing
 * in `generateMap` without re-measuring: a reordered `rng()` call is a new map.
 *
 * HOW A MAP IS DRAWN (all in world units, 1600×900, 5 m per unit):
 *   - junction 0 is the car park ("Otopark", P) low on one side, junction 1
 *     the summit ("Zirve") high on the other; the side flips by seed;
 *   - 24 more junctions, spread out (Poisson-ish: never closer than a set
 *     distance), up to 26;
 *   - trails are the Gabriel graph (planar, natural-looking), minus the very
 *     long ones and a random 15%, never cutting the map in two;
 *   - each trail is a wiggly 33-point line; its length is the length of that
 *     line, in metres, which is what the map prints and the score counts;
 *   - hills: the summit is the highest, six more are scattered, plus a faint
 *     ripple; `terrainHeight` turns them into the height the art contours.
 *
 * THE ROUTE (spec: "click the next junction, 1–9 pick a neighbour, Backspace/Z
 * undo one step, clicking a route junction cuts back to it, Enter confirms at
 * the summit"). A route is an array of junction ids, always starting at the
 * car park and never visiting a junction twice. `stepRoute` is the one
 * function every click and number key goes through; `undoRoute` is
 * Backspace/Z; `choices` is what the number badges show, 1–9 clockwise from
 * north, so "3" from a crossroads always points the same way. Whether Enter
 * may confirm is simply "does the route end at the summit". Functions return
 * a new array and never change the one handed in.
 *
 * WHAT IT LEAVES OUT. The prototype's analysis (simulated players, routes
 * scoring 95+, the greedy walker) was for choosing the seeds; it is done, and
 * none of it runs here. The draw-with-a-drag mode lost to click + keys (#183).
 */

/** A point in world units. */
export type Point = { x: number; y: number };

/** One trail between two junctions. `pts` runs from `a` to `b`. */
export type Trail = { a: number; b: number; length: number; pts: Point[] };

/** The part of a map the route rules need: hand-drawn maps in the tests are this. */
export type Graph = {
  junctions: Point[];
  trails: Trail[];
  start: number;
  summit: number;
};

/** A hill of the terrain: a Gaussian bump of height `h` and spread `s`. */
export type Hill = { x: number; y: number; h: number; s: number };

export type HikingMap = Graph & {
  name: string;
  seed: number;
  hills: Hill[];
  /** Phase of the faint ripple laid over the hills. */
  ripple: number;
};

/** The world the maps are drawn in, in units. */
export const WORLD = { width: 1600, height: 900 } as const;
/** Metres per world unit. */
const METRES_PER_UNIT = 5;
/** The prototype's frozen knobs (#183 verdict): junctions, trail wiggle, random prune. */
const JUNCTIONS = 26;
const WIGGLE = 0.3;
const PRUNE = 0.15;

/** The prototype's five maps: name and seed, in its order. */
const SET: readonly { name: string; seed: number }[] = [
  { name: "Kartal Tepesi", seed: 7921 },
  { name: "Çam Sırtı", seed: 8031 },
  { name: "Sisli Doruk", seed: 8124 },
  { name: "Kızılkaya", seed: 8227 },
  { name: "Ayı Yaylası", seed: 8329 },
];

// ------------------------------------------------------------- generation

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Edge = { a: number; b: number; chord: number; dead?: boolean };

/** Is the graph still in one piece without edge `skip` (and the dead ones)? */
function connected(n: number, edges: Edge[], skip: number): boolean {
  const adj: number[][] = Array.from({ length: n }, () => []);
  edges.forEach((e, i) => {
    if (i !== skip && !e.dead) {
      adj[e.a]!.push(e.b);
      adj[e.b]!.push(e.a);
    }
  });
  const seen = new Uint8Array(n);
  const stack = [0];
  seen[0] = 1;
  let count = 1;
  while (stack.length) {
    const u = stack.pop()!;
    for (const v of adj[u]!) {
      if (!seen[v]) {
        seen[v] = 1;
        count++;
        stack.push(v);
      }
    }
  }
  return count === n;
}

/**
 * The prototype's `genMap`, ported call for call: the same seed gives the
 * same map. Exported for the determinism test; the page uses `MAPS`.
 */
export function generateMap(seed: number, name = ""): HikingMap {
  const { width: W, height: H } = WORLD;
  const rng = mulberry32(seed);
  const margin = 70;
  const flip = rng() < 0.5;
  const fx = (x: number) => (flip ? W - x : x);
  const pts: Point[] = [
    { x: fx(margin + rng() * 80), y: H * 0.58 + rng() * H * 0.3 }, // 0 = car park
    { x: fx(W - margin - rng() * 80), y: margin + rng() * H * 0.3 }, // 1 = summit
  ];
  const minD = Math.sqrt((W * H) / JUNCTIONS) * 0.72;
  for (let t = 0; t < 6000 && pts.length < JUNCTIONS; t++) {
    const p = { x: margin + rng() * (W - 2 * margin), y: margin + rng() * (H - 2 * margin) };
    if (pts.every((q) => (q.x - p.x) ** 2 + (q.y - p.y) ** 2 >= minD * minD)) pts.push(p);
  }
  const n = pts.length;

  // Gabriel graph: an edge where no other junction sits inside the circle on it.
  const edges: Edge[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const A = pts[i]!;
      const B = pts[j]!;
      const mx = (A.x + B.x) / 2;
      const my = (A.y + B.y) / 2;
      const r2 = ((A.x - B.x) ** 2 + (A.y - B.y) ** 2) / 4;
      let ok = true;
      for (let k = 0; k < n && ok; k++) {
        if (k !== i && k !== j && (pts[k]!.x - mx) ** 2 + (pts[k]!.y - my) ** 2 < r2) ok = false;
      }
      if (ok) edges.push({ a: i, b: j, chord: Math.sqrt(r2) * 2 });
    }
  }

  // Prune: the very long edges first, then a random few, never leaving a
  // junction stranded or the map in two.
  const deg = new Array<number>(n).fill(0);
  for (const e of edges) {
    deg[e.a]!++;
    deg[e.b]!++;
  }
  const median = edges.map((e) => e.chord).sort((a, b) => a - b)[edges.length >> 1]!;
  const tryDrop = (i: number, minDeg: number) => {
    const e = edges[i]!;
    if (deg[e.a]! <= minDeg || deg[e.b]! <= minDeg || !connected(n, edges, i)) return;
    e.dead = true;
    deg[e.a]!--;
    deg[e.b]!--;
  };
  edges
    .map((_, i) => i)
    .sort((a, b) => edges[b]!.chord - edges[a]!.chord)
    .forEach((i) => {
      if (edges[i]!.chord > 1.8 * median) tryDrop(i, 1);
    });
  edges.forEach((e, i) => {
    if (!e.dead && rng() < PRUNE) tryDrop(i, 2);
  });

  // Wiggly trails: the true length is the drawn line's.
  const trails: Trail[] = [];
  for (const e of edges.filter((x) => !x.dead)) {
    const A = pts[e.a]!;
    const B = pts[e.b]!;
    const L = e.chord;
    const nx = -(B.y - A.y) / L;
    const ny = (B.x - A.x) / L;
    const a1 = rng() * 2 - 1;
    const a2 = (rng() * 2 - 1) * 0.55;
    const a3 = (rng() * 2 - 1) * 0.3;
    const amp = WIGGLE * Math.min(L, 320) * Math.pow(rng(), 0.6);
    const line: Point[] = [];
    let len = 0;
    for (let s = 0; s <= 32; s++) {
      const t = s / 32;
      const o = amp * (a1 * Math.sin(Math.PI * t) + a2 * Math.sin(2 * Math.PI * t) + a3 * Math.sin(3 * Math.PI * t));
      const p = { x: A.x + (B.x - A.x) * t + nx * o, y: A.y + (B.y - A.y) * t + ny * o };
      if (s) len += Math.hypot(p.x - line[s - 1]!.x, p.y - line[s - 1]!.y);
      line.push(p);
    }
    trails.push({ a: e.a, b: e.b, length: len * METRES_PER_UNIT, pts: line });
  }

  // Terrain: the summit is the highest hill.
  const hills: Hill[] = [{ x: pts[1]!.x, y: pts[1]!.y, h: 1, s: 360 }];
  for (let i = 0; i < 6; i++) hills.push({ x: rng() * W, y: rng() * H, h: 0.25 + rng() * 0.4, s: 120 + rng() * 200 });
  const ripple = rng() * 10;

  return { name, seed, junctions: pts, trails, start: 0, summit: 1, hills, ripple };
}

/** The five maps of the Game, in the prototype's order. */
export const MAPS: readonly HikingMap[] = SET.map(({ name, seed }) => generateMap(seed, name));

/** The terrain's height at a world point, for the art's colours and contours. */
export function terrainHeight(map: HikingMap, x: number, y: number): number {
  let sum = 0;
  for (const h of map.hills) sum += h.h * Math.exp(-((x - h.x) ** 2 + (y - h.y) ** 2) / (2 * h.s * h.s));
  return sum + 0.05 * Math.sin(x / 170 + map.ripple) * Math.cos(y / 130 - map.ripple);
}

// ------------------------------------------------------------- the routes

/** The trail between two junctions, if there is one. */
export function trailBetween(g: Graph, a: number, b: number): Trail | undefined {
  return g.trails.find((t) => (t.a === a && t.b === b) || (t.a === b && t.b === a));
}

/** A route's length in metres: the sum of its trails. */
export function routeLength(g: Graph, route: readonly number[]): number {
  let sum = 0;
  for (let i = 1; i < route.length; i++) sum += trailBetween(g, route[i - 1]!, route[i]!)?.length ?? 0;
  return sum;
}

/** The shortest route from the car park to the summit (Dijkstra), and its length in metres. */
export function shortestRoute(g: Graph): { route: number[]; length: number } {
  const n = g.junctions.length;
  const dist = new Array<number>(n).fill(Infinity);
  const prev = new Array<number>(n).fill(-1);
  const done = new Uint8Array(n);
  dist[g.start] = 0;
  for (let it = 0; it < n; it++) {
    let u = -1;
    for (let i = 0; i < n; i++) if (!done[i] && (u < 0 || dist[i]! < dist[u]!)) u = i;
    if (u < 0 || dist[u] === Infinity) break;
    done[u] = 1;
    for (const t of g.trails) {
      if (t.a !== u && t.b !== u) continue;
      const v = t.a === u ? t.b : t.a;
      const d = dist[u]! + t.length;
      if (d < dist[v]!) {
        dist[v] = d;
        prev[v] = u;
      }
    }
  }
  const route: number[] = [];
  for (let v = g.summit; v >= 0; v = prev[v]!) route.unshift(v);
  return { route, length: dist[g.summit]! };
}

/** Compass bearing from junction u to v, 0 = north, growing clockwise (screen y grows down). */
function bearing(g: Graph, u: number, v: number): number {
  const A = g.junctions[u]!;
  const B = g.junctions[v]!;
  return (Math.atan2(B.x - A.x, -(B.y - A.y)) + 2 * Math.PI) % (2 * Math.PI);
}

/** The junctions one trail away from `u`, clockwise from north. */
export function neighbours(g: Graph, u: number): number[] {
  return g.trails
    .filter((t) => t.a === u || t.b === u)
    .map((t) => (t.a === u ? t.b : t.a))
    .sort((a, b) => bearing(g, u, a) - bearing(g, u, b));
}

/** A new route: just the car park. */
export function startRoute(g: Graph): number[] {
  return [g.start];
}

/** Does the route end at the summit, so Enter may confirm it? */
export function atSummit(g: Graph, route: readonly number[]): boolean {
  return route.at(-1) === g.summit;
}

/**
 * What the number badges offer: the route end's neighbours not yet on the
 * route, clockwise from north. Key 1 is the first. Empty at the summit.
 */
export function choices(g: Graph, route: readonly number[]): number[] {
  if (atSummit(g, route)) return [];
  return neighbours(g, route.at(-1)!).filter((v) => !route.includes(v));
}

/**
 * One click or number key on junction `v`. On the route: cut back to it.
 * One trail from the route's end (and the summit not yet reached): go there.
 * Anything else: the route as it was.
 */
export function stepRoute(g: Graph, route: readonly number[], v: number): number[] {
  const at = route.indexOf(v);
  if (at >= 0) return route.slice(0, at + 1);
  if (atSummit(g, route) || !trailBetween(g, route.at(-1)!, v)) return [...route];
  return [...route, v];
}

/** Backspace or Z: drop the last step. The car park stays. */
export function undoRoute(route: readonly number[]): number[] {
  return route.length > 1 ? route.slice(0, -1) : [...route];
}

/**
 * The map for the next Round, by index into `MAPS`: any of the five at
 * first, never the one just played after that. `random` is `Math.random` on
 * the page and a fixed value in the tests.
 */
export function pickMap(last: number | undefined, random: () => number): number {
  const n = MAPS.length;
  if (last == null) return Math.min(n - 1, Math.floor(random() * n));
  const i = Math.min(n - 2, Math.floor(random() * (n - 1)));
  return i >= last ? i + 1 : i;
}

/** A length as the map and HUD print it: "8,8 km", one decimal, Turkish comma. */
export function formatKm(metres: number): string {
  return `${(metres / 1000).toFixed(1).replace(".", ",")} km`;
}
