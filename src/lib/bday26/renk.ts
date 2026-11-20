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
 * is 94 and from ΔE 17.67 it is 0 (`targetScore`). A Round is the mean of its
 * five targets (`roundScore`). A match better than ΔE 1 earns nothing extra,
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

/** Up to this ΔE a target scores 100. */
export const PERFECT_DE = 1;
/** Score lost per ΔE above `PERFECT_DE`. */
export const SLOPE = 6;

/** The score of one target from its colour difference: 0..100, whole. */
export function targetScore(dE: number): number {
  return Math.max(0, Math.min(100, Math.round(100 - SLOPE * Math.max(0, dE - PERFECT_DE))));
}

/** A Round's score: the mean of its targets' scores, 0..100. */
export function roundScore(scores: readonly number[]): number {
  if (!scores.length) return 0;
  return Math.max(0, Math.min(100, scores.reduce((a, b) => a + b, 0) / scores.length));
}
