/**
 * Photo framing, "Kadraj" (/20261209/kadraj/, ticket #203; spec #192 "Photo
 * framing", stories 71–73): the crop box she moves over one photo, and the
 * score one crop earns, and the order a Round deals its photos in. Pure: no
 * DOM, no ledger, and the only randomness is the `rng` handed to
 * `roundOrder`, so `kadraj.test.ts` pins every rule under `node --test`. The page
 * (`src/pages/20261209/kadraj/index.astro`) is the painter and the mouse; it
 * owns no rule about the box or the score.
 *
 * WHERE THE RULES COME FROM. The framing prototype (#184, branch
 * `prototype/184-framing`, never merged), which Atıl played; his verdict
 * there was "defaults as built, forgiving radius". This module is that
 * prototype's geometry and scoring with its knobs fixed at those defaults
 * and every other branch dropped:
 *   - The box keeps the photo's own aspect; X turns it 90° (`turn`). No free
 *     or preset aspects.
 *   - It starts as the whole photo (`startFraming`), never goes under 30% of
 *     the photo's width and height (`MIN_CROP`), and never leaves the photo:
 *     every operation returns a legal box, so the page can apply them blindly.
 *   - Keys: arrows `nudge` by 0.5% of the photo's long side (Shift ×5);
 *     E/+ `grow` and Q/− `shrink` by 2% around the centre (Shift 8%); the
 *     wheel is `zoom` by 3% (the page's choice of factor); R is `reset`.
 *   - Mouse: `grabAt` tells what a press takes hold of (inside = move,
 *     corner, edge), `moveBy` and `drag` follow it.
 *
 * THE SCORE OF ONE CROP (`scoreCrop`). The Subject point (glossary: *Odak
 * noktası*, the one point Atıl marked on the photo in `photos.json`) is
 * measured to the nearest of the crop's four rule-of-thirds points, as a
 * percentage of the crop's diagonal — so a tight crop and a loose one are
 * judged alike. Within 10% (`PERFECT_RADIUS`) it is 100; from there a
 * straight line down to 0 at 30% (`ZERO_RADIUS`); rounded to a whole number
 * as the prototype did, so 11% is exactly 95. A Subject point outside the
 * box scores 0, however near a thirds point it would be. `ringRadius` is
 * the 95% line drawn as the green ring on the reveal. How five photos make
 * a Round is `framingScore` in `./scores.ts`, with the other Games'
 * formulas.
 *
 * UNITS. Everything here is in the photo's own pixels (`Size`, from the
 * image's natural size). The Subject point is stored normalised (0..1) in
 * `photos.json`; the page multiplies it by the photo's size before scoring.
 */
import { PRIZE_BAR } from "./catalogue.ts";

/** A point in photo pixels. */
export type Point = { x: number; y: number };

/** The crop box, in photo pixels: top-left corner and size. */
export type Crop = { x: number; y: number; w: number; h: number };

/** Inside this share of the crop diagonal (percent) a crop is perfect. */
export const PERFECT_RADIUS = 10;
/** At this share of the crop diagonal (percent) and beyond it scores 0. */
export const ZERO_RADIUS = 30;

const THIRDS: readonly (readonly [number, number])[] = [
  [1 / 3, 1 / 3],
  [2 / 3, 1 / 3],
  [1 / 3, 2 / 3],
  [2 / 3, 2 / 3],
];

export type CropScore = {
  /** 0..100, a whole number. */
  score: number;
  /** The thirds point closest to the Subject point, in photo pixels. */
  nearest: Point;
  /** How far the Subject point is from `nearest`, in percent of the crop diagonal. */
  distance: number;
  /** Whether the Subject point is in the box at all (its edge counts). */
  inside: boolean;
};

/** The four rule-of-thirds points of a crop, in photo pixels. */
export function thirdsPoints(crop: Crop): Point[] {
  return THIRDS.map(([u, v]) => ({ x: crop.x + u * crop.w, y: crop.y + v * crop.h }));
}

export function scoreCrop(crop: Crop, subject: Point): CropScore {
  let nearest = { x: 0, y: 0 };
  let gap = Infinity;
  for (const p of thirdsPoints(crop)) {
    const d = Math.hypot(subject.x - p.x, subject.y - p.y);
    if (d < gap) [gap, nearest] = [d, p];
  }
  const distance = (gap / Math.hypot(crop.w, crop.h)) * 100;
  const inside =
    subject.x >= crop.x && subject.x <= crop.x + crop.w && subject.y >= crop.y && subject.y <= crop.y + crop.h;
  return { score: inside ? curve(distance) : 0, nearest, distance, inside };
}

/** The radius, in photo pixels, inside which a Subject point scores 95 or
 *  more: the green ring of the reveal. */
export function ringRadius(crop: Crop): number {
  const percent = PERFECT_RADIUS + ((100 - PRIZE_BAR) / 100) * (ZERO_RADIUS - PERFECT_RADIUS);
  return (percent / 100) * Math.hypot(crop.w, crop.h);
}

/** The one-word verdict on a photo's score, from the score down (the
 *  prototype's, #184): the reveal leads with it. */
const CROP_WORDS: readonly (readonly [number, string])[] = [
  [97, "Kusursuz"],
  [90, "Çok iyi"],
  [70, "İyi"],
  [40, "Fena değil"],
  [0, "Odak noktası uzakta"],
];

/** What the reveal calls a photo's score: "Kusursuz" from 97 down to
 *  "Odak noktası uzakta" under 40. */
export function cropWord(score: number): string {
  return CROP_WORDS.find(([from]) => score >= from)?.[1] ?? CROP_WORDS[CROP_WORDS.length - 1]![1];
}

/** Distance (percent of the diagonal) to score: flat 100, then a straight line to 0. */
function curve(distance: number): number {
  if (distance <= PERFECT_RADIUS) return 100;
  if (distance >= ZERO_RADIUS) return 0;
  return Math.round(100 * (1 - (distance - PERFECT_RADIUS) / (ZERO_RADIUS - PERFECT_RADIUS)));
}

// ------------------------------------------------------- a Round's order

/**
 * The photos of one Round in the order she meets them: the same five every
 * Round, shuffled (review E4, the owner's decision; the spec had them fixed
 * in `photos.json` order). A Fisher–Yates shuffle on a copy, one throw of
 * `rng` (0 ≤ n < 1) per place from the last.
 */
export function roundOrder<T>(photos: readonly T[], rng: () => number): T[] {
  const out = [...photos];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

// ---------------------------------------------------------- the crop box

/** A photo's size in its own pixels. */
export type Size = { w: number; h: number };

/** One photo being framed: the photo, which way round the box is, the box. */
export type Framing = {
  readonly photo: Size;
  /** The box is turned 90°: a landscape photo gets a portrait box, and back. */
  readonly turned: boolean;
  readonly crop: Crop;
};

/** The smallest box, as a share of the photo's width and height. */
export const MIN_CROP = 0.3;
/** One E or Q: the box grows or shrinks by this factor; with Shift, by `FAST_ZOOM`. */
export const ZOOM_STEP = 1.02;
export const FAST_ZOOM = 1.08;

/** The box's width over height: the photo's own, or its inverse when turned. */
function aspectOf(f: Pick<Framing, "photo" | "turned">): number {
  const { w, h } = f.photo;
  return f.turned ? h / w : w / h;
}

/** A box of about w wide around (cx, cy), made legal: the right aspect, no
 *  smaller than the floor, no larger than the photo, then slid inside it. */
function fitAround(f: Pick<Framing, "photo" | "turned">, cx: number, cy: number, w: number): Crop {
  const a = aspectOf(f);
  const { w: pw, h: ph } = f.photo;
  w = Math.max(w, MIN_CROP * pw, MIN_CROP * ph * a);
  w = Math.min(w, pw, ph * a);
  const h = w / a;
  return { x: clamp(cx - w / 2, 0, pw - w), y: clamp(cy - h / 2, 0, ph - h), w, h };
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/** A photo comes up with the whole of it in the box (the prototype's "start: full"). */
export function startFraming(photo: Size): Framing {
  const base = { photo, turned: false };
  return { ...base, crop: fitAround(base, photo.w / 2, photo.h / 2, photo.w) };
}

/** Scale the box by `factor` around its centre (the mouse wheel, E and Q). */
export function zoom(f: Framing, factor: number): Framing {
  const c = f.crop;
  return { ...f, crop: fitAround(f, c.x + c.w / 2, c.y + c.h / 2, c.w * factor) };
}

export function grow(f: Framing, fast = false): Framing {
  return zoom(f, fast ? FAST_ZOOM : ZOOM_STEP);
}

export function shrink(f: Framing, fast = false): Framing {
  return zoom(f, 1 / (fast ? FAST_ZOOM : ZOOM_STEP));
}

/** One arrow press moves the box this share of the photo's long side; Shift, five times it. */
export const MOVE_STEP = 0.005;
export const FAST_MOVE = 5;

/** Slide the box by (dx, dy) photo pixels, stopping at the photo's edge (a drag inside the box). */
export function moveBy(f: Framing, dx: number, dy: number): Framing {
  const c = f.crop;
  const { w: pw, h: ph } = f.photo;
  return { ...f, crop: { ...c, x: clamp(c.x + dx, 0, pw - c.w), y: clamp(c.y + dy, 0, ph - c.h) } };
}

/** One arrow key: `dx`, `dy` are −1, 0 or 1. */
export function nudge(f: Framing, dx: number, dy: number, fast = false): Framing {
  const step = MOVE_STEP * Math.max(f.photo.w, f.photo.h) * (fast ? FAST_MOVE : 1);
  return moveBy(f, dx * step, dy * step);
}

/** X: the box swaps to the other aspect around its centre, its old height its new width. */
export function turn(f: Framing): Framing {
  const c = f.crop;
  const turned = { photo: f.photo, turned: !f.turned };
  return { ...turned, crop: fitAround(turned, c.x + c.w / 2, c.y + c.h / 2, c.h) };
}

/** R: back to the whole photo, the right way round. */
export function reset(f: Framing): Framing {
  return startFraming(f.photo);
}

// ------------------------------------------------------- mouse resizing

/** Which side of the box a drag holds: dx −1 left, 1 right; dy −1 top, 1
 *  bottom; 0 when the drag holds neither. Both set is a corner, one an edge. */
export type Handle = { dx: -1 | 0 | 1; dy: -1 | 0 | 1 };

/**
 * What a press at `p` takes hold of: a corner within `cornerReach` of both
 * its sides, an edge within `edgeReach` of it, "move" anywhere else inside
 * the box, `null` outside. Reaches are in the same units as `p` and `crop`;
 * the page passes screen pixels divided by its zoom so they feel the same on
 * every photo.
 */
export function grabAt(crop: Crop, p: Point, cornerReach: number, edgeReach: number): Handle | "move" | null {
  const x0 = crop.x;
  const y0 = crop.y;
  const x1 = crop.x + crop.w;
  const y1 = crop.y + crop.h;
  const nearL = Math.abs(p.x - x0) < cornerReach;
  const nearR = Math.abs(p.x - x1) < cornerReach;
  const nearT = Math.abs(p.y - y0) < cornerReach;
  const nearB = Math.abs(p.y - y1) < cornerReach;
  if ((nearL || nearR) && (nearT || nearB)) return { dx: nearR ? 1 : -1, dy: nearB ? 1 : -1 };
  const inX = p.x > x0 && p.x < x1;
  const inY = p.y > y0 && p.y < y1;
  if (inY && Math.abs(p.x - x0) < edgeReach) return { dx: -1, dy: 0 };
  if (inY && Math.abs(p.x - x1) < edgeReach) return { dx: 1, dy: 0 };
  if (inX && Math.abs(p.y - y0) < edgeReach) return { dx: 0, dy: -1 };
  if (inX && Math.abs(p.y - y1) < edgeReach) return { dx: 0, dy: 1 };
  return inX && inY ? "move" : null;
}

/**
 * The box while a corner or edge is dragged. `from` is the box as it was
 * when the drag began, `pointer` where the mouse is now, both in photo
 * pixels. The opposite corner (or edge) stays where it was; the aspect
 * holds; the box never goes under the 30% floor nor past the photo. A
 * corner follows whichever of the pointer's two distances asks for the
 * bigger box; an edge grows the box both ways across itself, around the
 * centre line it had.
 */
export function drag(f: Framing, from: Crop, handle: Handle, pointer: Point): Framing {
  const a = aspectOf(f);
  const { w: pw, h: ph } = f.photo;
  const minW = Math.max(MIN_CROP * pw, MIN_CROP * ph * a);
  // The fixed side: the left edge when dragging right, and so on.
  const ax = handle.dx > 0 ? from.x : from.x + from.w;
  const ay = handle.dy > 0 ? from.y : from.y + from.h;
  const roomX = handle.dx > 0 ? pw - ax : ax;
  const roomY = handle.dy > 0 ? ph - ay : ay;

  if (handle.dx !== 0 && handle.dy !== 0) {
    const want = Math.max((pointer.x - ax) * handle.dx, (pointer.y - ay) * handle.dy * a);
    const w = clamp(want, minW, Math.min(roomX, roomY * a));
    const h = w / a;
    return { ...f, crop: { x: handle.dx > 0 ? ax : ax - w, y: handle.dy > 0 ? ay : ay - h, w, h } };
  }
  if (handle.dx !== 0) {
    const cy = from.y + from.h / 2;
    const w = clamp((pointer.x - ax) * handle.dx, minW, Math.min(roomX, 2 * Math.min(cy, ph - cy) * a));
    const h = w / a;
    return { ...f, crop: { x: handle.dx > 0 ? ax : ax - w, y: cy - h / 2, w, h } };
  }
  const cx = from.x + from.w / 2;
  const h = clamp((pointer.y - ay) * handle.dy, minW / a, Math.min(roomY, (2 * Math.min(cx, pw - cx)) / a));
  const w = h * a;
  return { ...f, crop: { x: cx - w / 2, y: handle.dy > 0 ? ay : ay - h, w, h } };
}
