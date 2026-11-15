/**
 * The printed-trail-map art of the hiking map (/20261209/yuruyus/, #202):
 * everything that turns a map from `./yuruyus.ts` into pictures, as plain
 * strings and numbers. No DOM here either; the page puts the strings into
 * its SVG and the colour grid into one tiny canvas.
 *
 * THE LOOK is the prototype's (#183), which Atıl played and approved, moved
 * from canvas drawing to SVG so it stays crisp at any size and the page can
 * hit-test junctions with plain elements:
 *   - the land: a colour ramp on the terrain height, pale green valleys to a
 *     cream summit. It is a 101×57 grid of colours (one per 16 world units)
 *     that the page paints into a canvas and lays under the SVG as an image,
 *     scaled up smoothly — a blur of a few thousand cells, for free;
 *   - contour lines: 19 levels by marching squares over the same grid, every
 *     fifth one darker, as two SVG paths (`contours`);
 *   - trails: a white casing under a dashed red line, like a printed hiking
 *     map (`linePath` on each trail's points; the page sets the strokes);
 *   - km labels: a white pill at each trail's midpoint (`labelPoint`).
 * The route she walks and the reveal are the page's: `routeLine` gives the
 * points of a route in walking order, for drawing it and for its length.
 *
 * The world is `WORLD` (1600×900 units); the SVG's viewBox is the same, so
 * every coordinate here is used as is.
 */
import { WORLD, terrainHeight, trailBetween, type Graph, type HikingMap, type Point, type Trail } from "./yuruyus.ts";

/** World units per cell of the height grid. */
const CELL = 16;

/** Height ramp, low to high: valley green, meadow, upland, scree, summit cream. */
const RAMP: readonly [number, readonly [number, number, number]][] = [
  [0, [222, 230, 200]],
  [0.3, [206, 222, 184]],
  [0.55, [196, 214, 172]],
  [0.75, [226, 220, 196]],
  [1, [244, 240, 230]],
];

function rampAt(h: number): [number, number, number] {
  for (let i = 1; i < RAMP.length; i++) {
    const [b, cb] = RAMP[i]!;
    if (h <= b) {
      const [a, ca] = RAMP[i - 1]!;
      const t = (h - a) / (b - a);
      return [0, 1, 2].map((k) => Math.round(ca[k]! + (cb[k]! - ca[k]!) * t)) as [number, number, number];
    }
  }
  return [...RAMP[RAMP.length - 1]![1]];
}

/** The terrain height on the grid, scaled to 0..1 for this map. */
function heightGrid(map: HikingMap): { cols: number; rows: number; h: number[][] } {
  const cols = WORLD.width / CELL + 1;
  const rows = Math.ceil(WORLD.height / CELL) + 1;
  const h: number[][] = [];
  let lo = Infinity;
  let hi = -Infinity;
  for (let j = 0; j < rows; j++) {
    const row: number[] = [];
    for (let i = 0; i < cols; i++) {
      const v = terrainHeight(map, i * CELL, j * CELL);
      row.push(v);
      lo = Math.min(lo, v);
      hi = Math.max(hi, v);
    }
    h.push(row);
  }
  for (const row of h) for (let i = 0; i < row.length; i++) row[i] = (row[i]! - lo) / (hi - lo);
  return { cols, rows, h };
}

/**
 * The land's colours: one RGBA pixel per grid cell, row by row. The page
 * puts them in a `cols`×`rows` canvas and stretches it over the world
 * (each pixel covers `cell` world units).
 */
export function landPixels(map: HikingMap): { cols: number; rows: number; cell: number; rgba: Uint8ClampedArray } {
  const { cols, rows, h } = heightGrid(map);
  const rgba = new Uint8ClampedArray(cols * rows * 4);
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const [r, g, b] = rampAt(h[j]![i]!);
      const o = (j * cols + i) * 4;
      rgba[o] = r;
      rgba[o + 1] = g;
      rgba[o + 2] = b;
      rgba[o + 3] = 255;
    }
  }
  return { cols, rows, cell: CELL, rgba };
}

/** Marching squares: which cell edges a contour crosses, by corner pattern. */
const CASES: readonly (readonly [number, number][])[] = [
  [], [[3, 2]], [[2, 1]], [[3, 1]], [[0, 1]], [[3, 0], [2, 1]], [[0, 2]], [[3, 0]],
  [[3, 0]], [[0, 2]], [[3, 2], [0, 1]], [[0, 1]], [[3, 1]], [[2, 1]], [[3, 2]], [],
];

const n1 = (v: number) => (Math.round(v * 10) / 10).toString();

/** The contour lines as two SVG path `d` strings: the thin ones and every fifth, darker. */
export function contours(map: HikingMap): { minor: string; major: string } {
  const { cols, rows, h } = heightGrid(map);
  const minor: string[] = [];
  const major: string[] = [];
  for (let lv = 1; lv < 20; lv++) {
    const l = lv / 20;
    const out = lv % 5 ? minor : major;
    for (let j = 0; j < rows - 1; j++) {
      for (let i = 0; i < cols - 1; i++) {
        const a = h[j]![i]!;
        const b = h[j]![i + 1]!;
        const c = h[j + 1]![i + 1]!;
        const d = h[j + 1]![i]!;
        const idx = (Number(a > l) << 3) | (Number(b > l) << 2) | (Number(c > l) << 1) | Number(d > l);
        if (idx === 0 || idx === 15) continue;
        const x = i * CELL;
        const y = j * CELL;
        const f = (p: number, q: number) => (l - p) / (q - p);
        const P: [number, number][] = [
          [x + CELL * f(a, b), y],
          [x + CELL, y + CELL * f(b, c)],
          [x + CELL * f(d, c), y + CELL],
          [x, y + CELL * f(a, d)],
        ];
        for (const [s, t] of CASES[idx]!) out.push(`M${n1(P[s]![0])} ${n1(P[s]![1])}L${n1(P[t]![0])} ${n1(P[t]![1])}`);
      }
    }
  }
  return { minor: minor.join(""), major: major.join("") };
}

/** An SVG path `d` through the points, in order. */
export function linePath(points: readonly Point[]): string {
  return points.map((p, i) => `${i ? "L" : "M"}${n1(p.x)} ${n1(p.y)}`).join("");
}

/** Where a trail's km label sits: the middle of its drawn line. */
export function labelPoint(trail: Trail): Point {
  return trail.pts[Math.floor(trail.pts.length / 2)] ?? { x: 0, y: 0 };
}

/** The drawn points of a route, in walking order, each trail turned the way she walks it. */
export function routeLine(g: Graph, route: readonly number[]): Point[] {
  const out: Point[] = [];
  for (let i = 1; i < route.length; i++) {
    const from = route[i - 1]!;
    const t = trailBetween(g, from, route[i]!);
    if (!t) continue;
    const pts = t.a === from ? t.pts : [...t.pts].reverse();
    out.push(...(out.length ? pts.slice(1) : pts));
  }
  return out;
}
