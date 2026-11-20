/**
 * Colour mixing, "Renk karıştır" (/20261209/renk/, ticket #218; verdict on
 * #215, prototype branch `prototype/215-renk`, which Atıl played): the paint
 * mix, the colour difference, the targets a Round deals, the drops she adds
 * and takes back, and the scores. Pure: no DOM, no ledger; the only
 * randomness is the `rng` handed to `pickRound`. `renk.test.ts` pins every
 * rule under `node --test`. The page (`src/pages/20261209/renk/index.astro`)
 * paints and listens; it owns no rule.
 *
 * THE SCORE (variant A, the verdict on #215). One target: ΔE ≤ 1 is 100,
 * then −6 for every ΔE above 1, rounded to a whole score, floor 0 — so ΔE 2
 * is 94 and from ΔE 17.67 it is 0 (`renkTargetScore`). A Round is the mean
 * of its five targets (`renkRoundScore`); both live in `./scores.ts` with
 * every Game's score. A match better than ΔE 1 earns nothing extra,
 * so 95% means about four near-exact matches and one small miss (the ΔE
 * above 1, summed over the five, at most ~4.2): the correction to #213's
 * "95% ≈ mean ΔE 1.8".
 *
 * THE MIX (`mixColour`). spectral.js 3.0.0 (Ronald van Wijnen, MIT; vendored
 * with its licence in `./vendor/spectral.js`), a single-constant
 * Kubelka–Munk model over 38 spectral bands, so blue and yellow make green
 * as paint does, not grey as RGB averaging would. Five tubes (`TUBES`): red,
 * yellow, blue, white, black. A tube with n drops goes in with the factor √n:
 * spectral.js squares the factor, so a tube's weight is linear in its drops.
 * Blue tints at 1.4 and black at 2.5, so one black drop darkens like real
 * paint. Mixes are proportions: 2 + 2 is the same colour as 1 + 1.
 * The colour difference is CIEDE2000 (`deltaE`) on the two colours as shown.
 */
import { RENK_PERFECT_DE, renkTargetScore } from "./scores.ts";
import { Color, mix } from "./vendor/spectral.js";

/** The five tubes, in key order 1–5. */
export const TUBES = [
  { name: "Kırmızı", hex: "#D7263D" },
  { name: "Sarı", hex: "#FCD200" },
  { name: "Mavi", hex: "#1B3F9E" },
  { name: "Beyaz", hex: "#FFFFFF" },
  { name: "Siyah", hex: "#1C1C1C" },
] as const;

/** Tinting strength per tube (the verdict: blue 1.4, black 2.5). */
const STRENGTH = [1, 1, 1.4, 1, 2.5];

/** Drops per tube, in `TUBES` order. */
export type Counts = readonly number[];

const PIGMENTS = TUBES.map((t, i) => {
  const c = new Color(t.hex);
  c.tintingStrength = STRENGTH[i]!;
  return c;
});

/** The colour these drops make, "#RRGGBB"; null when there are none. */
export function mixColour(counts: Counts): string | null {
  const parts: [Color, number][] = [];
  counts.forEach((n, i) => {
    if (n > 0) parts.push([PIGMENTS[i]!, Math.sqrt(n)]);
  });
  return parts.length ? mix(...parts).toString() : null;
}

/** A colour in CIELAB (D65): [L*, a*, b*]. */
export type Lab = readonly [number, number, number];

/** A shown colour, "#RRGGBB", in CIELAB (sRGB, D65 white). */
export function hexToLab(hex: string): Lab {
  const lin = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((x) => (x > 0.04045 ? ((x + 0.055) / 1.055) ** 2.4 : x / 12.92)) as [number, number, number];
  const [r, g, b] = lin;
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116);
  const X = f((0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047);
  const Y = f(0.2126729 * r + 0.7151522 * g + 0.072175 * b);
  const Z = f((0.0193339 * r + 0.119192 * g + 0.9503041 * b) / 1.08883);
  return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)];
}

/** CIEDE2000 (Sharma, Wu, Dalal 2005), kL = kC = kH = 1: how different two
 *  colours look to the eye. 0 is the same colour; about 1–2 most people
 *  cannot see. */
export function deltaE([L1, a1, b1]: Lab, [L2, a2, b2]: Lab): number {
  const rad = Math.PI / 180;
  const C1 = Math.hypot(a1, b1);
  const C2 = Math.hypot(a2, b2);
  const Cb = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)));
  const a1p = a1 * (1 + G);
  const a2p = a2 * (1 + G);
  const C1p = Math.hypot(a1p, b1);
  const C2p = Math.hypot(a2p, b2);
  const hue = (b: number, a: number) => {
    if (!a && !b) return 0;
    const x = Math.atan2(b, a) / rad;
    return x < 0 ? x + 360 : x;
  };
  const h1p = hue(b1, a1p);
  const h2p = hue(b2, a2p);
  const dLp = L2 - L1;
  const dCp = C2p - C1p;
  let dhp = 0;
  if (C1p * C2p) {
    dhp = h2p - h1p;
    if (dhp > 180) dhp -= 360;
    else if (dhp < -180) dhp += 360;
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp * rad) / 2);
  const Lbp = (L1 + L2) / 2;
  const Cbp = (C1p + C2p) / 2;
  let hbp = h1p + h2p;
  if (C1p * C2p) {
    if (Math.abs(h1p - h2p) > 180) hbp += h1p + h2p < 360 ? 360 : -360;
    hbp /= 2;
  }
  const T =
    1 -
    0.17 * Math.cos((hbp - 30) * rad) +
    0.24 * Math.cos(2 * hbp * rad) +
    0.32 * Math.cos((3 * hbp + 6) * rad) -
    0.2 * Math.cos((4 * hbp - 63) * rad);
  const dTh = 30 * Math.exp(-(((hbp - 275) / 25) ** 2));
  const RC = 2 * Math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7));
  const SL = 1 + (0.015 * (Lbp - 50) ** 2) / Math.sqrt(20 + (Lbp - 50) ** 2);
  const SC = 1 + 0.045 * Cbp;
  const SH = 1 + 0.015 * Cbp * T;
  const RT = -Math.sin(2 * dTh * rad) * RC;
  return Math.sqrt((dLp / SL) ** 2 + (dCp / SC) ** 2 + (dHp / SH) ** 2 + RT * (dCp / SC) * (dHp / SH));
}

/** ΔE (CIEDE2000) between two shown colours, "#RRGGBB". */
export function difference(hexA: string, hexB: string): number {
  return deltaE(hexToLab(hexA), hexToLab(hexB));
}

// ── the targets ───────────────────────────────────────────────────────

/** The most drops in one mix: hers and every hidden recipe's. */
export const DROP_CAP = 12;
/** Targets in one Round. */
export const ROUND_TARGETS = 5;
/** The least ΔE between two targets of the same Round. */
export const TARGETS_APART = 15;

/** One colour to match: its hidden recipe and the colour it makes. */
export type Target = { recipe: Counts; hex: string; lab: Lab };

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

/**
 * Every colour a Round may ask for (the verdict on #215): each proportion of
 * the five tubes up to `DROP_CAP` drops (2 + 2 is 1 + 1, so only the
 * smallest of each counts), using 2 to 4 tubes and at least 3 drops, with
 * L* between 25 and 90 — no near-black, no near-white. Its recipe makes it,
 * so a perfect match always exists. About 6,000 mixes: build it once.
 */
export function targetPool(): Target[] {
  const pool: Target[] = [];
  const cur = [0, 0, 0, 0, 0];
  const visit = (i: number, total: number) => {
    if (i === TUBES.length) {
      const used = cur.filter((n) => n > 0).length;
      if (total < 3 || used < 2 || used > 4 || cur.reduce(gcd) !== 1) return;
      const hex = mixColour(cur)!;
      const lab = hexToLab(hex);
      if (lab[0] >= 25 && lab[0] <= 90) pool.push({ recipe: cur.slice(), hex, lab });
      return;
    }
    for (let n = 0; n + total <= DROP_CAP; n++) {
      cur[i] = n;
      visit(i + 1, total + n);
    }
    cur[i] = 0;
  };
  visit(0, 0);
  return pool;
}

/** Five targets for a Round, drawn from `pool`, each at least `TARGETS_APART`
 *  from the others so no two look alike. */
export function pickRound(pool: readonly Target[], rng: () => number): Target[] {
  for (let tries = 0; tries < 200; tries++) {
    const out: Target[] = [];
    for (let k = 0; k < 400 && out.length < ROUND_TARGETS; k++) {
      const c = pool[Math.floor(rng() * pool.length)]!;
      if (out.every((o) => deltaE(o.lab, c.lab) >= TARGETS_APART)) out.push(c);
    }
    if (out.length === ROUND_TARGETS) return out;
  }
  throw new Error("bday26 renk: no five targets far enough apart");
}

// ── her drops ─────────────────────────────────────────────────────────
// Her mix is the list of tubes she dropped, in order (0–4, `TUBES` order):
// Backspace takes the last back, a click on a drop in the row takes back
// just that one. Every function returns a new list.

/** One drop of `tube` more; the same list when it already holds `DROP_CAP`. */
export function addDrop(drops: readonly number[], tube: number): readonly number[] {
  return drops.length >= DROP_CAP ? drops : [...drops, tube];
}

/** Backspace: the last drop taken back. */
export function removeLast(drops: readonly number[]): number[] {
  return drops.slice(0, -1);
}

/** A click on the drop at `index`: only that one taken back. */
export function removeAt(drops: readonly number[], index: number): number[] {
  return drops.filter((_, i) => i !== index);
}

/** Drops per tube, in `TUBES` order. */
export function countsOf(drops: readonly number[]): number[] {
  const c = TUBES.map(() => 0);
  for (const t of drops) c[t]! += 1;
  return c;
}

/** Per tube: is her share of it more than half a drop off the recipe's? The
 *  reveal marks those tubes. */
export function offTubes(recipe: Counts, mine: Counts): boolean[] {
  const tr = recipe.reduce((a, b) => a + b, 0);
  const tm = mine.reduce((a, b) => a + b, 0);
  return recipe.map((n, i) => Math.abs((mine[i] ?? 0) / tm - n / tr) * tm > 0.5);
}

/** Whether two recipes are the same proportions, no tube off (2 + 2 is 1 + 1). */
export function sameProportion(recipe: Counts, mine: Counts): boolean {
  return !offTubes(recipe, mine).some(Boolean);
}

/** What Enter says about her mix against `target`. */
export type Verdict = {
  /** Her colour. */
  hex: string;
  /** Drops per tube. */
  counts: number[];
  dE: number;
  score: number;
  /** A different recipe that still looks the same (ΔE ≤ 1): it counts. */
  otherRecipe: boolean;
};

/** Judge her drops (at least one) against the target. */
export function judge(target: Target, drops: readonly number[]): Verdict {
  const counts = countsOf(drops);
  const hex = mixColour(counts)!;
  const dE = deltaE(target.lab, hexToLab(hex));
  return { hex, counts, dE, score: renkTargetScore(dE), otherRecipe: dE <= RENK_PERFECT_DE && !sameProportion(target.recipe, counts) };
}
