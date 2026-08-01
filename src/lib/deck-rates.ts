/**
 * Shared money model for the /decks/asml-ai literacy chapters.
 *
 * ONE constant, used by every widget in both chapters (wayfinder #20, Atil
 * 2026-08-01). Two chapters of the same talk disagreeing on the exchange rate
 * is the failure this file exists to prevent — chapter A's tokenizer rate
 * table (#27) and chapter B's agent loop (#28) both import from here.
 *
 * `1 AIC = 1 US cent` is GitHub's own wording and a first-party fact (#21).
 * The euro conversion is OURS, not GitHub's — the published rates are in USD,
 * so these figures drift with FX. Accepted; the slides' standing
 * "Rates as of July 2026" caveat covers it, and no second caveat is added.
 */

/** Our conversion, not GitHub's. Drifts with FX — deliberately a single value. */
export const USD_PER_EUR = 1.08;

/** First-party, verbatim (#21): 1 AI credit = 1 US cent. Never a euro identity. */
export const USD_PER_AIC = 0.01;

export const aicToEur = (aic: number) => (aic * USD_PER_AIC) / USD_PER_EUR;

/**
 * Decimal rule locked on #28: at or above €1 use 2 dp; below €1 show two
 * significant figures, to a ceiling of 4 dp. A non-zero cost must never render
 * as "€0.00" — needing more than 4 dp means the scenario is too small and the
 * worked example should be scaled instead.
 */
export function eurDecimals(v: number): number {
  const a = Math.abs(v);
  if (!(a > 0) || a >= 1) return 2;
  return Math.min(4, Math.max(2, -Math.floor(Math.log10(a)) + 1));
}

/**
 * Format a euro amount. Pass `dp` to pin the width — live counters must hold a
 * fixed decimal width (with `tabular-nums`) so digits don't jitter mid-run, and
 * the width is picked from the largest value the widget can reach, not the one
 * it starts on.
 */
export function eur(v: number, dp = eurDecimals(v)): string {
  return `€${v.toFixed(dp)}`;
}
