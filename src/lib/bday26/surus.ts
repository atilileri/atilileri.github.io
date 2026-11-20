/**
 * The driving Game's simulation, "Hollanda'da sürüş" (/20261209/surus/, #206;
 * spec #192 "Driving", stories 56–59). Everything that decides what happens
 * on the road lives here, with no DOM: the town, the route and its seven
 * checkpoints, the ~20 cyclists, the car's physics and the nine mistake
 * detectors. The page (`src/pages/20261209/surus/index.astro`) only draws
 * this state, reads the keys into an `Input`, and calls `stepDrive` once per
 * frame; the score is `drivingScore` in `./scores.ts`.
 *
 * A PORT, NOT A REDESIGN. The prototype `prototype/181-driving`
 * (`public/20261209/prototype-driving.html`, read it with `git show`) is the
 * spec's reference implementation, and Atıl's verdict on #181 was "defaults
 * as built, 150 s soft limit, 6 m yield". So every constant below is the
 * prototype's, the map is built by the same procedure (same road table, same
 * tree seed 7), and `stepDrive` runs the prototype's `update` in the same
 * order. What changed is only the shape: the prototype's knobs `K` are
 * frozen constants now (no debug panel), its globals became one `Drive`
 * object, and the detectors that can stand alone are pure functions of a
 * state snapshot so `surus.test.ts` pins them under `node --test`:
 *   - `speedingStep`  — over 30 + 3 km/h for more than 1.5 s, light;
 *   - `bikeLaneStep`  — on a painted bike lane (b, B, p) over 0.8 s, light;
 *     both re-arm after 1 s out (`Hold`);
 *   - `yieldConflict` — on a cycle crossing (z) above 3 km/h, a cyclist
 *     within 6 m, not riding alongside (|cross| ≥ 0.45), not yet past
 *     (dot ≥ −8 px): light; `stepDrive` writes it once per crossing and
 *     re-arms 0.6 s after she leaves it;
 *   - `wrongWayStep`  — on the ring, the clockwise angle she has added up
 *     passes 0.5 rad: heavy, once per visit to the roundabout;
 *   - `impactMistake` — a solid hit above 1.5 km/h: from 20 km/h "crash"
 *     (heavy), below it "curb" (light); 1.2 s cooldown in `stepDrive`;
 *   - `hitsCyclist`   — the car's box within 4.5 px of a rider above
 *     2 km/h: heavy; the rider falls for 2.5 s;
 *   - `overtimeDue`   — at 150 s, then every 20 s: light.
 * The canal (tile `w`, heavy) is checked inside `stepDrive`: the car sinks
 * for 1.1 s and comes back at the last checkpoint she passed (or the start),
 * standing, with the clock running.
 *
 * UNITS. World pixels, as in the prototype: one tile is `CELL` = 20 px and
 * one metre is `PX_PER_M` = 7 px; speeds are px/s inside, km/h at the edges
 * (`toKmh`). Angles are radians, 0 = east, growing clockwise on the screen
 * (y points down), which is why "clockwise" in the roundabout is the angle
 * growing.
 *
 * THE TOWN, in tiles (`Tile`): `.` pavement, `#` houses, `g` park, `t` tree,
 * `r` road, `=` bridge, `b`/`B` bike lane (on land / over water), `z` cycle
 * crossing, `w` canal, `R` railing, and inside the roundabout `I` island and
 * `p` cycle ring. Drivable: r = b B z p (and `w`, into which she falls).
 * Solid: . # t g I R. The roundabout is round, so `tileAt` answers inside its
 * zone from geometry (`rbTile`) and elsewhere from the grid.
 *
 * RANDOMNESS. Only the cyclists' start spots, speeds (15 km/h × 0.8–1.2) and
 * jacket colours are random, fresh each Round (`createDrive(random)`); the
 * spec accepts the luck this adds. Tests pass a seeded random.
 */

// ---------------------------------------------------------------- units

/** Pixels per tile. */
export const CELL = 20;
/** The town's size in tiles. */
export const GRID_W = 100;
export const GRID_H = 80;
/** World pixels per metre. */
export const PX_PER_M = 7;
/** The car's length, width and wheelbase, px. */
export const CAR_LENGTH = 4.2 * PX_PER_M;
export const CAR_WIDTH = 1.85 * PX_PER_M;
const WHEELBASE = 2.6 * PX_PER_M;

const kmhToPx = (kmh: number) => (kmh / 3.6) * PX_PER_M;
/** A speed in px/s as km/h. */
export const toKmh = (v: number) => (v / PX_PER_M) * 3.6;

// ---------------------------------------------------------------- rules

/** The prototype's knobs as Atıl locked them (#181). Do not re-tune here. */
export const RULES = {
  /** Top speed, km/h. */
  vmax: 50,
  /** Gas and brake, m/s². */
  accel: 3.2,
  brake: 8,
  /** Steering lock, rad, and how fast the wheel turns, rad/s. */
  steer: 0.6,
  steerRate: 4,
  /** The town's speed limit and the tolerance over it, km/h. */
  limit: 30,
  tol: 3,
  /** Seconds over the limit, and on a bike lane, before it counts. */
  speedHold: 1.5,
  laneHold: 0.8,
  /** The soft time limit, s, and how often it counts again after. */
  timeLimit: 150,
  timeRepeat: 20,
  /** A crossing cyclist this near, m, is one she should have yielded to. */
  yieldDist: 6,
  /** A hit at this many km/h or more is a crash, below it a curb. */
  hardHit: 20,
  /** The cyclists' cruising speed, km/h (each × 0.8–1.2). */
  cycSpeed: 15,
} as const;

/** Reverse is capped at this many km/h. */
const REVERSE_KMH = 10;
/** The handbrake's deceleration, m/s². */
const HANDBRAKE = 12;
/** Seconds the car sinks in a canal before it comes back. */
export const SINK_S = 1.1;
/** A checkpoint is passed within this many px of its centre. */
export const CHECKPOINT_RADIUS = 45;

export type MistakeId = "cyclist" | "canal" | "wrongway" | "crash" | "yield" | "curb" | "speed" | "bikelane" | "overtime";
export type MistakeKind = "heavy" | "light";

/** Every mistake, heavy ones first: the start card's lists and the HUD's words (the prototype's). */
export const MISTAKES: readonly { id: MistakeId; kind: MistakeKind; label: string; toast: string }[] = [
  { id: "cyclist", kind: "heavy", label: "Bisikletliye çarpma", toast: "Bisikletliye çarptın" },
  { id: "canal", kind: "heavy", label: "Kanala düşme", toast: "Kanala düştün" },
  { id: "wrongway", kind: "heavy", label: "Döner kavşakta ters yön", toast: "Kavşakta ters yöndesin" },
  { id: "crash", kind: "heavy", label: "Sert çarpışma (duvar, ağaç)", toast: "Sert çarptın" },
  { id: "yield", kind: "light", label: "Bisikletliye yol vermeme", toast: "Bisikletliye yol vermedin" },
  { id: "curb", kind: "light", label: "Kaldırıma sürtme", toast: "Kaldırıma sürttün" },
  { id: "speed", kind: "light", label: "Hız sınırını aşma", toast: "Hız sınırını aştın" },
  { id: "bikelane", kind: "light", label: "Bisiklet yolunda sürme", toast: "Bisiklet yolundasın" },
  { id: "overtime", kind: "light", label: "Süre aşımı", toast: "Süre aşıldı" },
];
const MISTAKE = Object.fromEntries(MISTAKES.map((m) => [m.id, m])) as Record<MistakeId, (typeof MISTAKES)[number]>;

/** One mistake as it happened. */
export type Mistake = {
  /** Round time, s. */
  at: number;
  id: MistakeId;
  kind: MistakeKind;
  /** A fact to show beside it: "36 km/sa", "4 m", "2:30", or "". */
  detail: string;
};

/** How many heavy and light mistakes, for `drivingScore`. */
export function tally(mistakes: readonly Mistake[]): { heavy: number; light: number } {
  let heavy = 0;
  let light = 0;
  for (const m of mistakes) m.kind === "heavy" ? heavy++ : light++;
  return { heavy, light };
}

/** Round time as m:ss. */
export function formatClock(t: number): string {
  return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
}

// ---------------------------------------------------------------- the town

export type Tile = "." | "#" | "g" | "t" | "r" | "=" | "b" | "B" | "z" | "w" | "R" | "I" | "p";

/** The roundabout: centre and radii, px — island, ring road, cycle ring, zone. */
export const ROUNDABOUT = {
  x: 51 * CELL,
  y: 36 * CELL,
  island: 2 * CELL,
  ring: 4.2 * CELL,
  cycleIn: 5 * CELL,
  cycleOut: 6 * CELL,
  zone: 7.5 * CELL,
} as const;
const { x: RX, y: RY, island: R1, ring: R2, cycleIn: R3, cycleOut: R4, zone: RZ } = ROUNDABOUT;

/** A street: horizontal at row `at` or vertical at column `at`, two tiles
 *  wide, from `a` to `b`; `n`/`s` say whether it has a bike lane on that side. */
export type Road = { t: "h" | "v"; at: number; a: number; b: number; n: 0 | 1; s: 0 | 1 };

export const ROADS: readonly Road[] = [
  { t: "h", at: 70, a: 0, b: 99, n: 1, s: 1 },
  { t: "h", at: 11, a: 0, b: 99, n: 0, s: 1 }, // gracht street: no lane on the water side
  { t: "h", at: 35, a: 0, b: 44, n: 1, s: 1 },
  { t: "h", at: 35, a: 58, b: 99, n: 1, s: 1 },
  { t: "v", at: 50, a: 43, b: 79, n: 1, s: 1 },
  { t: "v", at: 50, a: 11, b: 28, n: 1, s: 1 },
  { t: "v", at: 70, a: 11, b: 79, n: 1, s: 1 },
  { t: "v", at: 19, a: 11, b: 36, n: 1, s: 1 },
];

const DRIVABLE: ReadonlySet<Tile> = new Set<Tile>(["r", "=", "b", "B", "z", "p"]);
const SOLID: ReadonlySet<Tile> = new Set<Tile>(["#", ".", "t", "g", "I", "R"]);

/** The town grid, rows of tiles, built once by the prototype's procedure. */
export const GRID: readonly (readonly Tile[])[] = buildGrid();

/** The tile at grid cell (x, y); off the map is a house. */
export function gridTile(x: number, y: number): Tile {
  return x >= 0 && y >= 0 && x < GRID_W && y < GRID_H ? GRID[y]![x]! : "#";
}

function buildGrid(): Tile[][] {
  const grid: Tile[][] = Array.from({ length: GRID_H }, () => Array<Tile>(GRID_W).fill("."));
  const get = (x: number, y: number): Tile => (x >= 0 && y >= 0 && x < GRID_W && y < GRID_H ? grid[y]![x]! : "#");
  const set = (x: number, y: number, ch: Tile) => {
    if (x >= 0 && y >= 0 && x < GRID_W && y < GRID_H) grid[y]![x] = ch;
  };
  const fill = (x: number, y: number, w: number, h: number, ch: Tile) => {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) set(i, j, ch);
  };
  fill(0, 56, GRID_W, 5, "w"); // lower canal
  fill(0, 5, GRID_W, 6, "w"); // gracht along the top road
  fill(24, 40, 23, 14, "g"); // parks
  fill(75, 15, 22, 18, "g");
  fill(2, 15, 15, 17, "g");
  const cellsOf = (r: Road, off: number) => {
    const out: [number, number][] = [];
    for (let k = r.a; k <= r.b; k++) out.push(r.t === "h" ? [k, r.at + off] : [r.at + off, k]);
    return out;
  };
  for (const r of ROADS) for (const off of [0, 1]) for (const [x, y] of cellsOf(r, off)) set(x, y, get(x, y) === "w" ? "=" : "r");
  for (const r of ROADS) {
    const offs: number[] = [];
    if (r.n) offs.push(-1);
    if (r.s) offs.push(2);
    for (const off of offs)
      for (const [x, y] of cellsOf(r, off)) {
        const c = get(x, y);
        set(x, y, c === "r" || c === "=" ? "z" : c === "w" ? "B" : c === "z" ? "z" : "b");
      }
  }
  for (const r of ROADS)
    if (r.t === "v")
      for (let y = r.a; y <= r.b; y++)
        if (get(r.at, y) === "=") {
          if (get(r.at - 2, y) === "w") set(r.at - 2, y, "R");
          if (get(r.at + 3, y) === "w") set(r.at + 3, y, "R");
        }
  // Trees in the parks and along two streets, from the prototype's seed.
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let y = 0; y < GRID_H; y++) for (let x = 0; x < GRID_W; x++) if (get(x, y) === "g" && rnd() < 0.16) set(x, y, "t");
  for (let x = 1; x < GRID_W; x += 3) {
    if (get(x, 4) === ".") set(x, 4, "t");
    if (get(x, 73) === "." && x % 6 === 1) set(x, 73, "t");
  }
  // Houses: every pavement cell that touches no road or water.
  const isOpen = (c: Tile) => DRIVABLE.has(c) || c === "w" || c === "R";
  for (let y = 0; y < GRID_H; y++)
    for (let x = 0; x < GRID_W; x++)
      if (grid[y]![x] === ".") {
        let near = false;
        for (let j = -1; j <= 1 && !near; j++)
          for (let i = -1; i <= 1; i++)
            if (isOpen(get(x + i, y + j))) {
              near = true;
              break;
            }
        if (!near) grid[y]![x] = "#";
      }
  return grid;
}

/** The four arms of the roundabout, as unit vectors: east, north, west, south. */
export const ARMS: readonly (readonly [number, number])[] = [
  [1, 0],
  [0, -1],
  [-1, 0],
  [0, 1],
];

/** The roundabout's tile at offset (dx, dy) from its centre, distance d. */
function rbTile(dx: number, dy: number, d: number): Tile {
  if (d < R1) return "I";
  if (d < R2) return "r";
  for (const [ux, uy] of ARMS) {
    const along = dx * ux + dy * uy;
    const off = Math.abs(dx * uy - dy * ux);
    const half = CELL + Math.max(0, R2 + 26 - d) * 0.9; // entries flare into the ring
    if (along > 0 && off < half) return d >= R3 && d <= R4 ? "z" : "r";
    if (along > 0 && off < 2 * CELL && d > R4) return "b"; // the arm's bike lanes run up to the cycle ring
  }
  if (d >= R3 && d <= R4) return "p";
  return "g";
}

/** The tile under a world point, px. */
export function tileAt(px: number, py: number): Tile {
  const dx = px - RX;
  const dy = py - RY;
  const d = Math.hypot(dx, dy);
  if (d < RZ) return rbTile(dx, dy, d);
  return gridTile(Math.floor(px / CELL), Math.floor(py / CELL));
}

// ---------------------------------------------------------------- the route

/** Where the car is and which way it faces. */
export type Pose = { x: number; y: number; a: number };
export type Checkpoint = Pose & { finish?: true };

export const START: Pose = { x: 6 * CELL, y: 71.5 * CELL, a: 0 };

/** Canal crossing, roundabout (3rd exit), canal street without railing,
 *  bike-path crossing, bridge, the straight, finish (spec, #181). */
export const CHECKPOINTS: readonly Checkpoint[] = [
  { x: 51 * CELL, y: 52 * CELL, a: -Math.PI / 2 },
  { x: 40 * CELL, y: 36 * CELL, a: Math.PI },
  { x: 20 * CELL, y: 24 * CELL, a: -Math.PI / 2 },
  { x: 45 * CELL, y: 12 * CELL, a: 0 },
  { x: 71 * CELL, y: 28 * CELL, a: Math.PI / 2 },
  { x: 71 * CELL, y: 50 * CELL, a: Math.PI / 2 },
  { x: 71 * CELL, y: 66 * CELL, a: Math.PI / 2, finish: true },
];

/** The dashed route line, as points, px. */
export const ROUTE: readonly (readonly [number, number])[] = buildRoute();
/** The route's length, m (about 710). */
export const ROUTE_LENGTH_M = Math.round(
  ROUTE.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - ROUTE[i - 1]![0], p[1] - ROUTE[i - 1]![1]) : 0), 0) / PX_PER_M,
);

function buildRoute(): [number, number][] {
  const rm = (R1 + R2) / 2;
  const route: [number, number][] = [
    [6 * CELL, 71 * CELL],
    [51 * CELL, 71 * CELL],
    [51 * CELL, RY + rm],
  ];
  for (let t = Math.PI / 2; t >= -Math.PI; t -= 0.15) route.push([RX + Math.cos(t) * rm, RY + Math.sin(t) * rm]);
  route.push([RX - rm, RY], [20 * CELL, 36 * CELL], [20 * CELL, 12 * CELL], [71 * CELL, 12 * CELL], [71 * CELL, 66 * CELL]);
  return route;
}

// ---------------------------------------------------------------- cyclists

type CyclePath = { n: number; loop?: true; pts: [number, number][]; len: number[]; total: number };

const H = 0.5 * CELL;
const CYCLE_PATHS: readonly CyclePath[] = (
  [
    { n: 2, pts: [[100 * CELL, 69 * CELL + H], [0, 69 * CELL + H]] },
    { n: 2, pts: [[0, 72 * CELL + H], [100 * CELL, 72 * CELL + H]] },
    { n: 2, pts: [[0, 13 * CELL + H + 4], [100 * CELL, 13 * CELL + H + 4]] },
    { n: 2, pts: [[100 * CELL, 13 * CELL + H - 4], [0, 13 * CELL + H - 4]] },
    { n: 2, pts: [[69 * CELL + H, 11 * CELL], [69 * CELL + H, 80 * CELL]] },
    { n: 2, pts: [[72 * CELL + H, 80 * CELL], [72 * CELL + H, 11 * CELL]] },
    { n: 2, pts: [[52 * CELL + H, 80 * CELL], [52 * CELL + H, 44 * CELL]] },
    { n: 1, pts: [[44 * CELL, 34 * CELL + H], [0, 34 * CELL + H]] },
    { n: 2, pts: [[59 * CELL, 37 * CELL + H], [100 * CELL, 37 * CELL + H]] },
    { n: 3, loop: true, pts: ringPoints() },
  ] as { n: number; loop?: true; pts: [number, number][] }[]
).map((p) => {
  if (p.loop) p.pts.push(p.pts[0]!);
  const len = [0];
  for (let i = 1; i < p.pts.length; i++) len.push(len[i - 1]! + Math.hypot(p.pts[i]![0] - p.pts[i - 1]![0], p.pts[i]![1] - p.pts[i - 1]![1]));
  return { ...p, len, total: len[len.length - 1]! };
});

function ringPoints(): [number, number][] {
  const out: [number, number][] = [];
  for (let t = 0; t > -Math.PI * 2; t -= 0.1) out.push([RX + (Math.cos(t) * (R3 + R4)) / 2, RY + (Math.sin(t) * (R3 + R4)) / 2]);
  return out;
}

const JACKETS = ["#f2c14e", "#3d7dd8", "#e05a8a", "#2fb38a", "#ffffff", "#ff8a3d", "#8e6cd8"];

/** What the detectors read of a cyclist. */
export type CyclistView = { x: number; y: number; dx: number; dy: number; fallen: number; alpha: number; hitCd: number };

export type Cyclist = CyclistView & {
  path: CyclePath;
  /** Distance along the path, px. */
  s: number;
  /** Speed factor, 0.8–1.2. */
  f: number;
  jacket: string;
};

function spawnCyclists(random: () => number): Cyclist[] {
  const out: Cyclist[] = [];
  for (const path of CYCLE_PATHS)
    for (let i = 0; i < path.n; i++) {
      const c: Cyclist = {
        path,
        s: (i / path.n + (random() * 0.3) / path.n) * path.total,
        f: 0.8 + random() * 0.4,
        fallen: 0,
        hitCd: 0,
        jacket: JACKETS[Math.floor(random() * JACKETS.length)]!,
        x: 0,
        y: 0,
        dx: 1,
        dy: 0,
        alpha: 1,
      };
      place(c);
      out.push(c);
    }
  return out;
}

function place(c: Cyclist) {
  const p = c.path;
  let i = 1;
  while (i < p.len.length - 1 && p.len[i]! < c.s) i++;
  const a = p.pts[i - 1]!;
  const b = p.pts[i]!;
  const seg = p.len[i]! - p.len[i - 1]!;
  const t = seg ? (c.s - p.len[i - 1]!) / seg : 0;
  c.x = a[0] + (b[0] - a[0]) * t;
  c.y = a[1] + (b[1] - a[1]) * t;
  c.dx = (b[0] - a[0]) / seg;
  c.dy = (b[1] - a[1]) / seg;
  // Riders fade in and out at the ends of an open path.
  c.alpha = p.loop ? 1 : Math.min(1, c.s / 40, (p.total - c.s) / 40);
}

/** Move the cyclists on; each stops while the car blocks its way. Also runs
 *  during the countdown, so the town is alive before she may drive. */
export function stepCyclists(cyclists: Cyclist[], car: Pose, dt: number) {
  for (const c of cyclists) {
    c.hitCd = Math.max(0, c.hitCd - dt);
    if (c.fallen > 0) {
      c.fallen -= dt;
      continue;
    }
    const blocked = obbDist(car, c.x + c.dx * 14, c.y + c.dy * 14) < 7 && c.alpha > 0.5;
    if (!blocked) c.s += kmhToPx(RULES.cycSpeed) * c.f * dt;
    if (c.s > c.path.total) c.s -= c.path.total;
    place(c);
  }
}

// ---------------------------------------------------------------- geometry

/** Distance, px, from a point to the car's box (0 inside it). */
export function obbDist(car: Pose, px: number, py: number): number {
  const dx = px - car.x;
  const dy = py - car.y;
  const c = Math.cos(car.a);
  const s = Math.sin(car.a);
  const lx = dx * c + dy * s;
  const ly = -dx * s + dy * c;
  return Math.hypot(Math.max(Math.abs(lx) - CAR_LENGTH / 2, 0), Math.max(Math.abs(ly) - CAR_WIDTH / 2, 0));
}

/** Does the car's box at this pose touch anything solid? Eight sample points. */
function carHitsSolid(x: number, y: number, a: number): boolean {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const L = CAR_LENGTH / 2;
  const W = CAR_WIDTH / 2;
  for (const [lx, ly] of [[L, W], [L, -W], [-L, W], [-L, -W], [L, 0], [-L, 0], [0, W], [0, -W]] as const)
    if (SOLID.has(tileAt(x + lx * c - ly * s, y + lx * s + ly * c))) return true;
  return false;
}

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

// ---------------------------------------------------------------- detectors

/** A rule that counts after a condition holds for a while: seconds on,
 *  seconds off, and whether it already counted this time. */
export type Hold = { on: number; off: number; fired: boolean };
export const freshHold = (): Hold => ({ on: 0, off: 9, fired: false });

/** One step of a hold rule: counts once after `holdS` s on, re-arms after 1 s off. */
function holdStep(h: Hold, active: boolean, dt: number, holdS: number): { hold: Hold; fire: boolean } {
  if (!active) {
    const off = h.off + dt;
    return { hold: { on: 0, off, fired: off > 1 ? false : h.fired }, fire: false };
  }
  const on = h.on + dt;
  const fire = on > holdS && !h.fired;
  return { hold: { on, off: 0, fired: h.fired || fire }, fire };
}

/** Speeding: over the limit plus the tolerance for more than 1.5 s. */
export function speedingStep(h: Hold, kmh: number, dt: number) {
  return holdStep(h, kmh > RULES.limit + RULES.tol, dt, RULES.speedHold);
}

/** Driving on a bike lane (not a crossing) for more than 0.8 s. */
export function bikeLaneStep(h: Hold, tile: Tile, dt: number) {
  return holdStep(h, tile === "b" || tile === "B" || tile === "p", dt, RULES.laneHold);
}

/** On a cycle crossing above 3 km/h: the distance, m, to a cyclist she
 *  should have yielded to — crossing her way, within 6 m, not yet past —
 *  or undefined. */
export function yieldConflict(car: Pose, kmh: number, tile: Tile, cyclists: readonly CyclistView[]): number | undefined {
  if (tile !== "z" || kmh <= 3) return undefined;
  const hx = Math.cos(car.a);
  const hy = Math.sin(car.a);
  for (const c of cyclists) {
    if (c.fallen > 0 || c.alpha < 0.5) continue;
    const ddx = car.x - c.x;
    const ddy = car.y - c.y;
    const d = Math.hypot(ddx, ddy);
    if (d > RULES.yieldDist * PX_PER_M) continue;
    if (Math.abs(hx * c.dy - hy * c.dx) < 0.45) continue; // parallel: not a crossing conflict
    if (c.dx * ddx + c.dy * ddy < -8) continue; // already past her
    return d / PX_PER_M;
  }
  return undefined;
}

/** The clockwise angle added up on the ring this visit, the last angle seen,
 *  and whether it already counted. */
export type WrongWay = { turned: number; last: number | null; fired: boolean };
export const freshWrongWay = (): WrongWay => ({ turned: 0, last: null, fired: false });

/** One step of the roundabout's direction rule at car position (x, y). */
export function wrongWayStep(w: WrongWay, x: number, y: number): { wrongWay: WrongWay; fire: boolean } {
  const rd = Math.hypot(x - RX, y - RY);
  if (rd < R2 + 4 && rd > R1) {
    const ang = Math.atan2(y - RY, x - RX);
    if (w.last === null) return { wrongWay: { ...w, last: ang }, fire: false };
    const turned = Math.max(0, w.turned + wrap(ang - w.last));
    const fire = turned > 0.5 && !w.fired;
    return { wrongWay: { turned, last: ang, fired: w.fired || fire }, fire };
  }
  if (rd > RZ) return { wrongWay: freshWrongWay(), fire: false };
  return { wrongWay: w, fire: false };
}

/** What a hit on something solid at this speed counts as. */
export function impactMistake(kmh: number): "crash" | "curb" | undefined {
  if (kmh <= 1.5) return undefined;
  return kmh >= RULES.hardHit ? "crash" : "curb";
}

/** Does the car, at this speed, hit this rider? */
export function hitsCyclist(car: Pose, kmh: number, c: CyclistView): boolean {
  if (c.fallen > 0 || c.alpha < 0.5 || c.hitCd > 0) return false;
  return obbDist(car, c.x, c.y) < 4.5 && kmh > 2;
}

/** Is the next over-time mistake due, `steps` of them already counted? */
export function overtimeDue(t: number, steps: number): boolean {
  return t >= RULES.timeLimit + steps * RULES.timeRepeat;
}

// ---------------------------------------------------------------- camera

/** The share of the gap to its target the camera closes in `dt` seconds.
 *  The prototype closed 8% per frame at 60 fps; this is that easing in
 *  time, not frames, so a 144 Hz screen does not make the camera snappier
 *  and a slow frame does not make it lag (review B4). */
export function cameraEase(dt: number): number {
  return 1 - Math.pow(0.92, dt * 60);
}

// ---------------------------------------------------------------- one drive

/** The car: pose, speed px/s (negative = reverse), wheel angle rad. */
export type Car = Pose & { v: number; steer: number };

/** Her keys this frame. */
export type Input = { gas: boolean; brake: boolean; left: boolean; right: boolean; handbrake: boolean };

/** One Round on the road. `stepDrive` changes it in place. */
export type Drive = {
  car: Car;
  cyclists: Cyclist[];
  /** Round time, s. Runs on while she sinks in a canal. */
  t: number;
  /** Index of the next checkpoint. */
  next: number;
  mistakes: Mistake[];
  /** Seconds left sinking in a canal; 0 = on the road. */
  sinking: number;
  /** Where a canal sends her back: the last checkpoint passed, or the start. */
  spawn: Pose;
  hitCooldown: number;
  lane: Hold;
  speeding: Hold;
  /** Seconds since she left a cycle crossing, and whether this one counted. */
  crossingOut: number;
  yieldFired: boolean;
  wrongWay: WrongWay;
  /** How many over-time mistakes so far. */
  overtimeSteps: number;
  /** She reached the finish. */
  done: boolean;
};

export function createDrive(random: () => number = Math.random): Drive {
  return {
    car: { ...START, v: 0, steer: 0 },
    cyclists: spawnCyclists(random),
    t: 0,
    next: 0,
    mistakes: [],
    sinking: 0,
    spawn: START,
    hitCooldown: 0,
    lane: freshHold(),
    speeding: freshHold(),
    crossingOut: 9,
    yieldFired: false,
    wrongWay: freshWrongWay(),
    overtimeSteps: 0,
    done: false,
  };
}

/** The car's speed, km/h, unsigned. */
export const carKmh = (d: Drive) => Math.abs(toKmh(d.car.v));

/** Advance the drive by `dt` seconds; returns the mistakes this step made.
 *  The prototype's `update`, in its order. Does nothing once `done`. */
export function stepDrive(d: Drive, input: Input, dt: number): Mistake[] {
  const made: Mistake[] = [];
  const fire = (id: MistakeId, detail = "") => {
    const m: Mistake = { at: d.t, id, kind: MISTAKE[id].kind, detail };
    d.mistakes.push(m);
    made.push(m);
  };
  const checkTime = () => {
    if (overtimeDue(d.t, d.overtimeSteps)) {
      fire("overtime", formatClock(d.t));
      d.overtimeSteps++;
    }
  };
  if (d.done) return made;
  const car = d.car;
  d.t += dt;
  d.hitCooldown = Math.max(0, d.hitCooldown - dt);
  stepCyclists(d.cyclists, car, dt);

  if (d.sinking > 0) {
    d.sinking -= dt;
    if (d.sinking <= 0) Object.assign(car, { x: d.spawn.x, y: d.spawn.y, a: d.spawn.a, v: 0, steer: 0 });
    checkTime();
    return made;
  }

  // Physics.
  const P = PX_PER_M;
  const steerIn = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const vmax = kmhToPx(RULES.vmax);
  const vrev = -kmhToPx(REVERSE_KMH);
  let v = car.v;
  if (input.gas) v += (v < 0 ? RULES.brake : RULES.accel) * P * dt;
  else if (input.brake) v -= (v > 0 ? RULES.brake : RULES.accel * 0.6) * P * dt;
  else {
    const coast = (1.2 * P + Math.abs(v) * 0.15) * dt;
    v = Math.abs(v) <= coast ? 0 : v - Math.sign(v) * coast;
  }
  if (input.handbrake) {
    const hb = HANDBRAKE * P * dt;
    v = Math.abs(v) <= hb ? 0 : v - Math.sign(v) * hb;
  }
  v = Math.max(vrev, Math.min(vmax, v));
  const target = steerIn * RULES.steer * (1 - 0.45 * Math.min(1, Math.abs(v) / vmax));
  const ds = RULES.steerRate * dt;
  car.steer += Math.max(-ds, Math.min(ds, target - car.steer));
  const na = car.a + ((v * Math.tan(car.steer)) / WHEELBASE) * dt;
  const nx = car.x + Math.cos(na) * v * dt;
  const ny = car.y + Math.sin(na) * v * dt;
  if (carHitsSolid(nx, ny, na)) {
    const kmh = Math.abs(toKmh(v));
    const hit = impactMistake(kmh);
    if (d.hitCooldown <= 0 && hit) {
      fire(hit, `${Math.round(kmh)} km/sa`);
      d.hitCooldown = 1.2;
    }
    v = -v * 0.25;
    if (!carHitsSolid(car.x, car.y, na)) car.a = na;
  } else {
    car.x = nx;
    car.y = ny;
    car.a = na;
  }
  car.v = v;
  const kmh = Math.abs(toKmh(v));
  const tile = tileAt(car.x, car.y);

  // The canal.
  if (tile === "w") {
    fire("canal");
    d.sinking = SINK_S;
    car.v = 0;
    return made;
  }
  // The bike lane and speeding.
  const lane = bikeLaneStep(d.lane, tile, dt);
  d.lane = lane.hold;
  if (lane.fire) fire("bikelane");
  const speeding = speedingStep(d.speeding, kmh, dt);
  d.speeding = speeding.hold;
  if (speeding.fire) fire("speed", `${Math.round(kmh)} km/sa`);
  // Yield at a cycle crossing: once per crossing.
  if (tile === "z") {
    d.crossingOut = 0;
    if (!d.yieldFired) {
      const m = yieldConflict(car, kmh, tile, d.cyclists);
      if (m !== undefined) {
        fire("yield", `${Math.round(m)} m`);
        d.yieldFired = true;
      }
    }
  } else {
    d.crossingOut += dt;
    if (d.crossingOut > 0.6) d.yieldFired = false;
  }
  // The roundabout's direction.
  const ww = wrongWayStep(d.wrongWay, car.x, car.y);
  d.wrongWay = ww.wrongWay;
  if (ww.fire) fire("wrongway");
  // Cyclists.
  for (const c of d.cyclists) {
    if (hitsCyclist(car, kmh, c)) {
      fire("cyclist");
      c.fallen = 2.5;
      c.hitCd = 4;
      car.v *= 0.3;
    }
  }
  // Checkpoints.
  const cp = CHECKPOINTS[d.next]!;
  if (Math.hypot(car.x - cp.x, car.y - cp.y) < CHECKPOINT_RADIUS) {
    d.spawn = cp;
    d.next++;
    if (cp.finish) {
      d.done = true;
      return made;
    }
  }
  checkTime();
  return made;
}
