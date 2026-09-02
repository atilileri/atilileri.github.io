/**
 * Rates and money formatting for the ASML AI deck's literacy chapters.
 *
 * Shared by every widget in chapter 3 so the deck can never disagree
 * with itself about what a token costs. Nothing else in the deck knows a rate.
 *
 * Sourcing (wayfinder #21, verified against GitHub's published pricing):
 *   - `1 AIC = 1 US cent` is first-party and current.
 *   - The four rows below are the only ones the deck may show; the lineup is
 *     the models actually available at the company (#23), dated on purpose.
 *   - Anthropic also bills cache *writes* at 1.25x input. Deliberately absent
 *     here and off-screen everywhere — presenter notes only (#23, #25).
 */

/** AIC per 1,000,000 tokens. */
export type Model = {
  id: string;
  name: string;
  input: number;
  cached: number;
  output: number;
};

export const MODELS: Model[] = [
  { id: "flash", name: "Gemini 3 Flash", input: 50, cached: 5, output: 300 },
  { id: "gpt", name: "GPT-5.4", input: 250, cached: 25, output: 1500 },
  { id: "sonnet", name: "Sonnet 4.5", input: 300, cached: 30, output: 1500 },
  { id: "opus", name: "Opus 4.6", input: 500, cached: 50, output: 2500 },
];

/**
 * The euro is the on-screen currency for both chapters, but GitHub publishes
 * USD only — so this conversion is ours, not theirs, and it drifts with FX.
 * One constant, one place to refresh it.
 */
export const USD_PER_EUR = 1.08;

export const eurOfAic = (aic: number) => (aic * 0.01) / USD_PER_EUR;

/**
 * Dollars to euro. The stop-point Widget prices a curve whose costs are in
 * dollars; it lives here beside the rate rather than in that Widget, so the
 * next Widget that prices in dollars finds it instead of copying it (#115).
 */
export const eurOfUsd = (usd: number) => usd / USD_PER_EUR;

/**
 * Decimals for a euro figure: two at or above EUR 1, otherwise as many as it
 * takes to show two significant figures, capped at four. No figure ever reads
 * "EUR 0.00" for a non-zero amount — needing more than four decimals means the
 * scenario is too small, so scale the scenario rather than round it to nothing.
 */
export function eurDecimals(v: number): number {
  if (!(v > 0) || v >= 1) return 2;
  return Math.min(4, Math.max(2, -Math.floor(Math.log10(v)) + 1));
}

/**
 * Decimals for two significant figures with **no ceiling** — for figures the
 * capped rule above would round to nothing, like the euro cost of one typed
 * sentence (~EUR 0.000007). Use it only where the true number is wanted at
 * whatever precision it takes; live counters and headline totals keep the
 * capped rule, which is what stops them printing an over-precise tail.
 */
export function eurSigDecimals(v: number, sig = 2): number {
  if (!(v > 0)) return 2;
  return Math.max(2, -Math.floor(Math.log10(v)) + sig - 1);
}

/** Format euros with the decimal rule above. */
export const fmtEur = (v: number, decimals = eurDecimals(v)) =>
  "€" + v.toFixed(decimals);

/**
 * AIC as a whole number, for the bill table — at a real session's scale the
 * figures run 40 to 360 and a decimal there is noise. The one guard: a live
 * amount that rounds to zero prints "<1" instead, so the column can never tell
 * the room that work is free while the euro column beside it disagrees.
 */
export const fmtAicWhole = (n: number) =>
  n > 0 && n < 0.5 ? "<1" : Math.round(n).toLocaleString("en-US");

export const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");
