/**
 * The DeepSWE v1.1 leaderboard, as one array of curves. Spec #106, ADR 0002.
 *
 * Two Widgets read this: the benchmark chart, which plots every curve, and
 * chapter 3's stop-point, which frames ONE of them. The stop-point moved into
 * `stop-point.widget.ts` and a Widget module may not import from another
 * Widget module, so the data both of them read lives here — the "data module
 * the Widget already reads" that ADR 0002 asks a Widget to sit beside.
 *
 * The unit here is a CONFIGURATION, not a model: one point is one model
 * run at one reasoning-effort level, so a model with five levels traces
 * a five-point curve as you spend more on it. Effort levels carry the
 * provider's own name — low, medium, high, xhigh, max — never a
 * position ("level 3 of 5"), because the name is what you type into an
 * API call. A model that publishes only one level gets one point.
 * Transcribed from the public leaderboard at
 * deepswe.datacurve.ai/blog/deepswe-v1-1 (113 tasks, 2026-08-25).
 */

export type Pt = {
  cost: number; // avg $ / task
  rate: number; // pass@1 %
  eff: string; // reasoning effort, the provider's own name
  tok: string; // mean output tokens
  steps: number; // mean agent steps
  ci: number; // ± percentage points, 95% run-to-run
};
export type Curve = {
  name: string;
  fam: string;
  at: number; // index of the labelled point — the model's best score
  pts: Pt[]; // cheapest first
};
/** Rows straight off the leaderboard: cost, score, effort, tokens, steps, ±CI. */
const curve = (
  name: string,
  fam: string,
  rows: [number, number, string, string, number, number][],
): Curve => {
  const pts = rows.map(([cost, rate, eff, tok, steps, ci]) => ({
    cost, rate, eff, tok, steps, ci,
  }));
  // The labelled point is the model's best score, resolved here rather
  // than transcribed, so re-transcribing the data can never leave a
  // callout pointing at a level that is no longer the model's best.
  let at = 0;
  pts.forEach((pt, i) => {
    if (pt.rate > pts[at].rate) at = i;
  });
  return { name, fam, at, pts };
};
export const CURVES: Curve[] = [
  curve("claude-opus-5", "Anthropic", [
    [1.66, 58.1, "LOW", "20k", 36, 2.3], [3.29, 68.9, "MEDIUM", "37k", 52, 1.2],
    [6.08, 72.8, "HIGH", "64k", 73, 1.9], [9.07, 73.2, "XHIGH", "92k", 89, 3.1],
    [11.84, 73.6, "MAX", "118k", 99, 3.9]]),
  curve("gpt-5.6-sol", "OpenAI", [
    [0.82, 45.4, "LOW", "11k", 23, 2.4], [1.42, 61.1, "MEDIUM", "18k", 31, 1.6],
    [2.66, 69.4, "HIGH", "28k", 37, 1.4], [3.6, 70.7, "XHIGH", "41k", 44, 0.8],
    [6.46, 72.7, "MAX", "60k", 61, 2.8]]),
  curve("claude-fable-5", "Anthropic", [
    [3.76, 59.6, "LOW", "25k", 38, 2.8], [6.09, 65.4, "MEDIUM", "40k", 48, 4.4],
    [9.18, 68.6, "HIGH", "57k", 59, 1.1], [13.41, 69.9, "XHIGH", "80k", 68, 3.2],
    [21.63, 69.7, "MAX", "119k", 88, 4.0]]),
  curve("glm-5.3", "Other", [[3.99, 69.0, "MAX", "80k", 124, 3.0]]),
  curve("kimi-k3", "Moonshot", [[4.65, 68.5, "MAX", "81k", 98, 4.5]]),
  curve("gpt-5.6-luna", "OpenAI", [
    [0.01, 1.5, "LOW", "3k", 12, 0.8], [0.04, 11.3, "MEDIUM", "8k", 24, 0.8],
    [0.16, 44.2, "HIGH", "26k", 49, 2.9], [0.31, 56.9, "XHIGH", "45k", 71, 2.2],
    [0.61, 67.2, "MAX", "73k", 102, 4.0]]),
  curve("gpt-5.5", "OpenAI", [
    [1.2, 27.0, "LOW", "9k", 28, 2.3], [2.75, 54.0, "MEDIUM", "20k", 46, 2.6],
    [5.1, 64.4, "HIGH", "31k", 62, 3.1], [7.23, 67.0, "XHIGH", "46k", 82, 6.5]]),
  curve("grok-4.6", "Other", [
    [1.04, 41.6, "LOW", "16k", 44, 2.3], [3.45, 67.5, "MEDIUM", "50k", 70, 2.3],
    [4.38, 65.2, "HIGH", "61k", 79, 1.5], [5.5, 66.7, "XHIGH", "71k", 87, 2.2]]),
  curve("gemini-3.7-flash", "Google", [
    [1.83, 53.8, "LOW", "73k", 130, 2.6], [2.03, 65.5, "MEDIUM", "94k", 117, 3.1],
    [2.18, 65.3, "HIGH", "107k", 125, 1.8]]),
  curve("deepseek-v4-pro", "Other", [[1.67, 62.8, "MAX", "106k", 155, 6.3]]),
  curve("claude-opus-4.8", "Anthropic", [
    [2.29, 40.8, "LOW", "29k", 54, 1.5], [3.44, 48.7, "MEDIUM", "41k", 66, 2.2],
    [4.28, 51.8, "HIGH", "50k", 72, 4.6], [8.01, 54.4, "XHIGH", "86k", 95, 3.7],
    [13.22, 59.0, "MAX", "135k", 120, 1.8]]),
  curve("qwen3.8-max", "Other", [[3.73, 57.5, "XHIGH", "95k", 111, 2.7]]),
  curve("muse-spark-1.2", "Other", [[3.7, 54.9, "XHIGH", "99k", 101, 2.1]]),
  curve("claude-sonnet-5", "Anthropic", [
    [4.08, 39.8, "MEDIUM", "57k", 108, 3.1], [7.43, 48.2, "HIGH", "87k", 147, 4.5],
    [11.89, 49.7, "XHIGH", "121k", 186, 3.5], [26.4, 53.8, "MAX", "214k", 268, 4.2]]),
  curve("deepseek-v4-flash", "Other", [[0.46, 53.3, "MAX", "108k", 153, 3.6]]),
  curve("gemini-3.6-flash", "Google", [[2.21, 46.7, "HIGH", "96k", 117, 3.7]]),
  curve("glm-5.2", "Other", [
    [2.84, 36.3, "HIGH", "54k", 122, 4.8], [3.92, 43.8, "MAX", "78k", 129, 1.7]]),
  curve("gemini-3.5-flash", "Google", [[3.45, 36.1, "HIGH", "76k", 105, 4.0]]),
];
