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
 * THE LINEUP IS IN TWO GROUPS, and the group — not the vendor — is what the
 * Slide's Legend filters on:
 *
 *   Copilot — the five models the company's own picker offers. This is the
 *     Slide at rest, and the only group shown when the room arrives. Every
 *     line here is a model somebody in the room can select this afternoon.
 *   Others — five notable models from five other labs, off by default. They
 *     are the answer to "what are we missing", asked once per room, and they
 *     belong behind a click rather than in the first frame: a curve nobody
 *     can select is decoration until somebody asks for it.
 *
 * Grouping by AVAILABILITY rather than by vendor is the point. gpt-6-astra is
 * OpenAI's, the same vendor as three Copilot rows, and it still sits in
 * Others — because what decides whether a curve is actionable here is the
 * picker, not the logo.
 *
 * Transcribed from `artifacts/v1.1/leaderboard-live.json`, the file the
 * board itself renders from, NOT from the rendered page: the page shows 21
 * of the 28 scored models, and gpt-5.6-terra and gpt-5.4 are two it hides.
 * 113 tasks, generated 2026-09-22, read 2026-09-23.
 */

/** Which side of the picker a model sits on. The Legend filters on this. */
export type Group = "Copilot" | "Others";
/** Legend order, left to right. `Copilot` is the group shown at rest. */
export const GROUPS: Group[] = ["Copilot", "Others"];

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
  group: Group;
  at: number; // index of the labelled point — the model's best score
  pts: Pt[]; // cheapest first
};
/** Rows straight off the leaderboard: cost, score, effort, tokens, steps, ±CI. */
const curve = (
  name: string,
  fam: string,
  group: Group,
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
  return { name, fam, group, at, pts };
};
export const CURVES: Curve[] = [
  // ── Copilot: what the picker offers ───────────────────────────────────
  curve("claude-opus-5", "Anthropic", "Copilot", [
    [1.66, 58.1, "LOW", "20k", 36, 2.3], [3.29, 68.9, "MEDIUM", "37k", 52, 1.2],
    [6.08, 72.8, "HIGH", "64k", 73, 1.9], [9.07, 73.2, "XHIGH", "92k", 89, 3.1],
    [11.84, 73.6, "MAX", "118k", 99, 3.9]]),
  curve("gpt-5.6-terra", "OpenAI", "Copilot", [
    [0.43, 24.1, "LOW", "9k", 21, 0.8], [0.58, 35.1, "MEDIUM", "12k", 25, 3.4],
    [1.13, 53.8, "HIGH", "22k", 34, 4.3], [2.13, 60.2, "XHIGH", "40k", 43, 2.1],
    [4.95, 69.6, "MAX", "72k", 76, 2.6]]),
  curve("gpt-5.6-luna", "OpenAI", "Copilot", [
    [0.07, 1.5, "LOW", "3k", 12, 0.8], [0.22, 11.3, "MEDIUM", "8k", 24, 0.8],
    [0.78, 44.2, "HIGH", "26k", 49, 2.9], [1.54, 56.9, "XHIGH", "45k", 71, 2.2],
    [3.03, 67.2, "MAX", "73k", 102, 4.0]]),
  curve("gpt-5.4", "OpenAI", "Copilot", [
    [5.65, 51.8, "XHIGH", "71k", 70, 1.5]]),
  curve("claude-sonnet-5", "Anthropic", "Copilot", [
    [2.19, 30.5, "LOW", "36k", 77, 1.1], [4.08, 39.8, "MEDIUM", "57k", 108, 3.1],
    [7.43, 48.2, "HIGH", "87k", 147, 4.5], [11.89, 49.7, "XHIGH", "121k", 186, 3.5],
    [26.4, 53.8, "MAX", "214k", 268, 4.2]]),

  // ── Others: five labs the picker does not offer ───────────────────────
  // One model per lab, each the lab's best scoring entry on this board, so
  // the group answers "what are we missing" rather than re-running the
  // effort-level argument the Copilot group already made.
  curve("gpt-6-astra", "OpenAI", "Others", [
    [1.6, 67.0, "LOW", "11k", 20, 1.3], [3.08, 72.8, "MEDIUM", "20k", 26, 2.6],
    [3.92, 73.2, "HIGH", "27k", 27, 3.4], [4.43, 74.1, "XHIGH", "30k", 29, 2.9],
    [7.5, 73.2, "MAX", "61k", 28, 0.8]]),
  curve("gemini-3.8-flash", "Google", "Others", [
    [1.97, 71.0, "MEDIUM", "125k", 147, 2.3], [2.36, 73.8, "HIGH", "143k", 166, 1.4]]),
  curve("grok-4.6", "xAI", "Others", [
    [1.04, 41.6, "LOW", "16k", 44, 2.3], [3.45, 67.5, "MEDIUM", "50k", 70, 2.3],
    [4.38, 65.2, "HIGH", "61k", 79, 1.5], [5.5, 66.7, "XHIGH", "71k", 87, 2.2]]),
  curve("kimi-k3", "Moonshot", "Others", [
    [4.65, 68.5, "MAX", "81k", 98, 4.5]]),
  curve("deepseek-v4-pro", "DeepSeek", "Others", [
    [0.24, 62.8, "MAX", "106k", 155, 6.3]]),
];

/** Every curve in one group, in the order transcribed. */
export const inGroup = (g: Group) => CURVES.filter((c) => c.group === g);

/**
 * The best pass@1 anywhere on the FULL board — all 28 scored models, not just
 * the ten drawn here. The Slide prints it beside the best selectable score, so
 * the room is told what the picker costs them rather than left to assume the
 * lineup is the frontier. It happens to be a model the `Others` group draws,
 * so turning that group on shows the sentence rather than just asserting it.
 * Re-transcribe it whenever the curves above are re-transcribed.
 */
export const BOARD_BEST = { name: "gpt-6-astra", rate: 74.1 };
