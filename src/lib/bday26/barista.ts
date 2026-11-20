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
 * A step scores by its distance from the target in half-widths
 * (`baristaStepScore`), the Round is the mean of its 9 steps
 * (`baristaRoundScore`); both live in `./scores.ts` with every Game's score.
 *
 * `createBench` is one Round at the bench with its sounds: Space down and up
 * as times, the overflow, the hold dropped by Esc, and the effects each
 * step asks for. The page feeds it keys and frames and draws what it says.
 */
import type { Effects } from "./effects.ts";
import { baristaRoundScore, baristaStepScore } from "./scores.ts";

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

/** A step's score for a release at `value`: its distance from the target
 *  measured against this shot's band (`baristaStepScore` in `./scores.ts`). */
function stepScoreAt(step: Step, shot: number, value: number): number {
  return baristaStepScore(value - step.target, halfWidth(step, shot));
}

/** Shots in a Round; each has the three steps. */
export const SHOTS = 3;

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
      const r: StepResult = { shot: at.shot, stepIndex: at.stepIndex, value, lo, hi, inBand: value >= lo && value <= hi, score: stepScoreAt(at.step, at.shot, value) };
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
      return results.length >= total ? baristaRoundScore(results.map((r) => r.score)) : undefined;
    },
  };
}

// ── the bench: holding Space ─────────────────────────────────────────

/** After a step, how long the next press waits, ms: a beat to read it. */
export const READ_MS = 250;

/** The part of the effects gate the bench plays through (`./effects.ts`). */
export type BenchEffects = Pick<Effects, "sound" | "loop" | "stopLoops" | "miss">;

export type Bench = {
  /** ready: waiting for a press; holding: Space is down; shown: a step
   *  just ended and its result is on screen. */
  readonly phase: "ready" | "holding" | "shown";
  readonly round: Round;
  /** The step just ended, while `phase` is "shown". */
  readonly last: StepResult | undefined;
  /** The readout at time `now` (ms) while holding; 0 otherwise. */
  value(now: number): number;
  /** Space down at `now` (ms). False when it starts nothing. */
  press(now: number): boolean;
  /** Space up at `now`: the step scores where the fill stopped. */
  release(now: number): StepResult | undefined;
  /** A frame at `now`: held to the top, the step ends there by itself. */
  tick(now: number): StepResult | undefined;
  /** The hold is dropped unscored (Esc's confirm card): the step waits. */
  drop(): void;
};

/**
 * One Round at the bench, with its sounds: the grinder whirs while Space is
 * held on the grind step, the tamp thuds on the press, the pour runs while
 * Space is held on the pull step; every continuous sound stops when the
 * step ends or the hold is dropped, then a chime in the band or a bonk (and
 * `shakeTarget` shakes) outside it. Times are the page's ms clock.
 */
export function createBench(fx: BenchEffects, shakeTarget?: unknown): Bench {
  const round = createRound();
  let phase: Bench["phase"] = "ready";
  let t0 = 0;
  let shownAt = -Infinity;
  let last: StepResult | undefined;

  const heldStep = () => round.current()!.step;
  const heldFor = (now: number) => (now - t0) / 1000;

  function lock(value: number, now: number): StepResult | undefined {
    const r = round.release(value);
    fx.stopLoops();
    phase = "shown";
    shownAt = now;
    last = r;
    if (r?.inBand) fx.sound("chime");
    else fx.miss(shakeTarget);
    return r;
  }

  return {
    get phase() {
      return phase;
    },
    round,
    get last() {
      return phase === "shown" ? last : undefined;
    },
    value(now) {
      return phase === "holding" ? fillAt(heldStep(), heldFor(now)) : 0;
    },
    press(now) {
      if (phase === "holding" || round.done) return false;
      if (phase === "shown" && now - shownAt < READ_MS) return false;
      phase = "holding";
      t0 = now;
      const key = heldStep().key;
      if (key === "grind") fx.loop("grind").start();
      else if (key === "pull") fx.loop("pour").start();
      else fx.sound("thud");
      return true;
    },
    release(now) {
      if (phase !== "holding") return undefined;
      return lock(fillAt(heldStep(), heldFor(now)), now);
    },
    tick(now) {
      if (phase !== "holding" || !overflowed(heldStep(), heldFor(now))) return undefined;
      return lock(heldStep().max, now);
    },
    drop() {
      if (phase === "holding") phase = "ready";
      fx.stopLoops();
    },
  };
}
