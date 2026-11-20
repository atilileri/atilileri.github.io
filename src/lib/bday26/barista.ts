/**
 * Barista's rules (/20261209/barista/, #217), with no DOM: the pure side the
 * page and `barista.test.ts` share. The tuning is Atıl's verdict on the
 * prototype (#216): band "medium", fill "accelerating", curve "flat-top".
 *
 * One Round is 3 shots × 3 steps: grind to 18 g, tamp to 15 kg, pull to
 * 36 g. In each step she holds Space; the readout climbs (`fillAt`) and she
 * lets go inside the green band. The band's half-width is 100 ms at the
 * step's constant base speed (target ÷ seconds to reach it), narrowed ×1 /
 * ×0.8 / ×0.62 for shots 1–3 (`halfWidth`). The fill accelerates —
 * value = target·(t/tt)^1.6, so it runs 1.6× the base speed at the target —
 * and fills once: holding to the top ends the step at the top, scoring 0.
 * A step scores by its distance from the target (`stepScore`), the Round is
 * the mean of its 9 steps.
 */

/** One step of a shot, as the page shows it. */
export type Step = {
  key: "grind" | "tamp" | "pull";
  /** The step's name: Öğütme, Sıkıştırma, Demleme. */
  name: string;
  /** The readout's label: Doz, Basınç, Verim. */
  label: string;
  unit: string;
  /** The top of the scale, where the fill stops. */
  max: number;
  target: number;
  /** Seconds from 0 to the target at the constant base speed. */
  tt: number;
  /** The verb in the hint: "Basılı tut, öğüt, yeşil bantta bırak". */
  goal: string;
};

export const STEPS: readonly [Step, Step, Step] = [
  { key: "grind", name: "Öğütme", label: "Doz", unit: "g", max: 24, target: 18, tt: 1.8, goal: "öğüt" },
  { key: "tamp", name: "Sıkıştırma", label: "Basınç", unit: "kg", max: 30, target: 15, tt: 1.5, goal: "bastır" },
  { key: "pull", name: "Demleme", label: "Verim", unit: "g", max: 50, target: 36, tt: 2.4, goal: "demle" },
];

/** The band's half-width at shot 1, as a time window at the base speed. */
export const BAND_MS = 100;
/** The band per shot: shot 1, 2, 3. */
export const NARROW = [1, 0.8, 0.62] as const;
/** The fill's exponent: 1.6× the base speed at the target. */
export const ACCEL_EXP = 1.6;
/** The score at the band edge; 0 at twice the half-width. */
export const EDGE_SCORE = 85;

/** The band's half-width in the step's unit, for shot 0, 1 or 2. */
export function halfWidth(step: Step, shot: number): number {
  return (BAND_MS / 1000) * NARROW[shot]! * (step.target / step.tt);
}

/** The readout after holding Space for `t` seconds: target·(t/tt)^1.6,
 *  stopping at the top of the scale. */
export function fillAt(step: Step, t: number): number {
  return Math.min(step.max, step.target * Math.pow(Math.max(0, t) / step.tt, ACCEL_EXP));
}

/** Held to the top: the step is over, at `step.max`. */
export function overflowed(step: Step, t: number): boolean {
  return fillAt(step, t) >= step.max;
}

/** The flat-top curve: `d` is the distance from the target in half-widths. */
function curve(d: number): number {
  if (d <= 0.5) return 100;
  if (d <= 1) return 100 - (100 - EDGE_SCORE) * (d - 0.5) * 2;
  return Math.max(0, EDGE_SCORE - EDGE_SCORE * (d - 1));
}

/** A step's score, 0..100 rounded: 100 across the inner half of the band,
 *  85 at its edge, 0 at twice the half-width and beyond. */
export function stepScore(step: Step, shot: number, value: number): number {
  return Math.round(curve(Math.abs(value - step.target) / halfWidth(step, shot)));
}

/** Shots in a Round; each has the three steps. */
export const SHOTS = 3;

/** A Round's score: the mean of its 9 step scores, 0..100, not rounded. */
export function roundScore(steps: readonly number[]): number {
  return steps.reduce((a, b) => a + b, 0) / steps.length;
}

/** One step she let go of. */
export type StepResult = {
  shot: number;
  /** 0 grind, 1 tamp, 2 pull. */
  stepIndex: number;
  value: number;
  /** The band she aimed at. */
  lo: number;
  hi: number;
  inBand: boolean;
  score: number;
};

export type Round = {
  /** The step she is on, or undefined once all 9 are done. */
  current(): { shot: number; stepIndex: number; step: Step } | undefined;
  /** She let go at `value`: scores the step and moves on. Ignored after the ninth. */
  release(value: number): StepResult | undefined;
  readonly results: readonly StepResult[];
  readonly done: boolean;
  /** The mean of the 9 steps; undefined until the ninth. */
  readonly score: number | undefined;
};

/** A fresh Round: shot 1, grind. */
export function createRound(): Round {
  const results: StepResult[] = [];
  const total = SHOTS * STEPS.length;
  return {
    current() {
      if (results.length >= total) return undefined;
      const shot = Math.floor(results.length / STEPS.length);
      const stepIndex = results.length % STEPS.length;
      return { shot, stepIndex, step: STEPS[stepIndex]! };
    },
    release(value) {
      const at = this.current();
      if (!at) return undefined;
      const hw = halfWidth(at.step, at.shot);
      const lo = at.step.target - hw;
      const hi = at.step.target + hw;
      const r: StepResult = { shot: at.shot, stepIndex: at.stepIndex, value, lo, hi, inBand: value >= lo && value <= hi, score: stepScore(at.step, at.shot, value) };
      results.push(r);
      return r;
    },
    get results() {
      return results;
    },
    get done() {
      return results.length >= total;
    },
    get score() {
      return results.length >= total ? roundScore(results.map((r) => r.score)) : undefined;
    },
  };
}
