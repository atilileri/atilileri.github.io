/**
 * Types for the vendored spectral.js 3.0.0 (`./spectral.js`, MIT, Ronald van
 * Wijnen): only the part Renk karıştır uses (#218).
 */
export class Color {
  constructor(color: string | number[]);
  /** sRGB, 0..255 a channel. */
  readonly sRGB: number[];
  /** How strongly this pigment tints a mix; 1 by default. */
  tintingStrength: number;
  toString(options?: { format?: "hex" | "rgb"; method?: "map" | "clip" }): string;
}

/** Kubelka–Munk mix of `[colour, factor]` pairs; a pair's weight is factor² × tinting strength² × luminance. */
export function mix(...colors: [Color, number][]): Color;
