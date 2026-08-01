/**
 * Rates and money formatting for the ASML AI deck's literacy chapters.
 *
 * Shared by every widget in chapters A and B so the deck can never disagree
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
 * Decimals for a euro figure: two at or above EUR 1, otherwise as many as it
 * takes to show two significant figures, capped at four. No figure ever reads
 * "EUR 0.00" for a non-zero amount — needing more than four decimals means the
 * scenario is too small, so scale the scenario rather than round it to nothing.
 */
export function eurDecimals(v: number): number {
  if (!(v > 0) || v >= 1) return 2;
  return Math.min(4, Math.max(2, -Math.floor(Math.log10(v)) + 1));
}

/** Format euros with the decimal rule above. */
export const fmtEur = (v: number, decimals = eurDecimals(v)) =>
  "€" + v.toFixed(decimals);

/** AIC reads finer below 10, where the counter is doing the teaching. */
export const fmtAic = (n: number) => (n < 10 ? n.toFixed(2) : n.toFixed(1));

export const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");
