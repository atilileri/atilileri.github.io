/**
 * PROTOTYPE — wayfinder #35. Throwaway data table for the chapter-2 stochastic
 * slide ("one prompt, five answers, then the dice"). Lives on the branch
 * `prototype/stochastic-slide` only; the winning variant gets rewritten
 * properly by #38, and this file does not go to main.
 *
 * One table, read by all three variants, so the variants disagree about the
 * PRESENTATION and never about the facts.
 *
 * Everything here is PRE-RECORDED. Per map #29 the deck makes no live AI API
 * calls, ever. These five runs are hand-authored to be plausible, not captured.
 */

export const PROMPT = "Add retry logic to this API client.";

/** Locked by Atil on #35: an ordinary engineering task where you would expect
 *  one right answer — and the divergence lands in parameters, which abstracts
 *  into a legible grid without feeling like a cheat. */
export const PROMPT_NOTE = "Same prompt. Same model. Same settings. Five runs.";

/* ── The abstraction: five runs × five parameters (variant A) ────────────── */

export type Param = { k: string; vals: string[] };

export const PARAMS: Param[] = [
  { k: "attempts", vals: ["3", "5", "3", "4", "3"] },
  {
    k: "backoff",
    vals: ["exponential", "exponential", "fixed 1s", "exponential", "exponential"],
  },
  { k: "jitter", vals: ["no", "yes", "no", "yes", "yes"] },
  { k: "retry on", vals: ["5xx", "5xx + 429", "5xx + 429", "5xx", "5xx + 429"] },
  { k: "extra", vals: ["—", "—", "—", "circuit breaker", "timeout budget"] },
];

/** The one cell per row that everybody agrees on — used to grey the agreement
 *  down so the DISAGREEMENT is what the eye reads. A row with no modal value
 *  (every run different) passes `null`. */
export const MODAL: (string | null)[] = ["3", "exponential", "yes", "5xx + 429", "—"];

/* ── The real text: five snippets, hand-marked for divergence (variant B) ── */

/** `0` = agreed across runs (greyed), `1` = this run's own choice (inked). */
export type Span = [string, 0 | 1];
export type Line = Span[];

/** Lines are kept SHORT on purpose: five snippets have to sit in five narrow
 *  columns without wrapping mid-token, or variant B is being judged on its
 *  line-breaking rather than on its idea. */
const HEAD: Line = [["retry(getJobs, {", 0]];
const TAIL: Line = [["});", 0]];
const line = (k: string, v: string): Line => [
  ["  " + k + ": ", 0],
  [v, 1],
  [",", 0],
];

export const RUNS: { label: string; code: Line[] }[] = [
  {
    label: "run 1",
    code: [
      HEAD,
      line("attempts", "3"),
      line("backoff", "exponential"),
      line("jitter", "false"),
      line("retryOn", "[500, 502, 503]"),
      TAIL,
    ],
  },
  {
    label: "run 2",
    code: [
      HEAD,
      line("attempts", "5"),
      line("backoff", "exponential"),
      line("jitter", "true"),
      line("retryOn", "[429, 500, 502, 503]"),
      TAIL,
    ],
  },
  {
    label: "run 3",
    code: [
      HEAD,
      line("attempts", "3"),
      line("backoff", "fixed(1000)"),
      line("jitter", "false"),
      line("retryOn", "[429, 500, 502, 503]"),
      TAIL,
    ],
  },
  {
    label: "run 4",
    code: [
      HEAD,
      line("attempts", "4"),
      line("backoff", "exponential"),
      line("jitter", "true"),
      line("retryOn", "[500, 502, 503]"),
      line("breaker", "circuit(5)"),
      TAIL,
    ],
  },
  {
    label: "run 5",
    code: [
      HEAD,
      line("attempts", "3"),
      line("backoff", "exponential"),
      line("jitter", "true"),
      line("retryOn", "[429, 500, 502, 503]"),
      line("budget", "timeout(10s)"),
      TAIL,
    ],
  },
];

/* ── The optional sixth reading: run 4 fabricates (ticket question 5) ────── */

/** Toggleable, per Atil's "build both, decide on screen". When on, run 4 stops
 *  being a different-but-valid answer and becomes a confident wrong one: it
 *  calls a method the SDK does not have. Marked only on the LAST fragment, so
 *  the slide still argues variance first and fabrication second. */
export const HALLUC = {
  runIndex: 3,
  params: ["4", "—", "yes", "—", "—"],
  code: [
    [["client.", 0], ["retryWithBackoff", 1], ["({", 0]],
    [["  attempts: ", 0], ["4", 1], [",", 0]],
    [["  jitter: ", 0], ["true", 1], [",", 0]],
    TAIL,
  ] as Line[],
  /** Variant C's version of the same beat: the fork that gave you a number
   *  also gave you a method the SDK does not have. */
  forkAlt: "exponentialBackoff(200)",
  flag: "client.retryWithBackoff() does not exist in the SDK.",
  /** Variant C fabricates at a different position, so it names a different
   *  method — the flag has to match what is actually on screen. */
  flagC: "exponentialBackoff() does not exist in the SDK.",
  line: "It samples a plausible method name the way it samples a number.",
};

/* ── The mechanism: what one sampled position actually looks like ────────── */

export type Alt = { v: string; p: number };

/** Fed to variants A and B as a bottom strip, and to variant C inline at the
 *  fork points. Probabilities are illustrative, not measured — the shape is
 *  the claim, not the numbers, and the presenter note has to say so. */
export const DIST: { at: string; alts: Alt[] } = {
  at: "attempts: ",
  alts: [
    { v: "3", p: 0.41 },
    { v: "5", p: 0.27 },
    { v: "4", p: 0.18 },
    { v: "10", p: 0.09 },
    { v: "…", p: 0.05 },
  ],
};

/* ── Variant C: one answer that forks in place ───────────────────────────── */

export type Fork = { alts: Alt[] };
export type Piece = string | Fork;

/** Run 1's snippet, with the four positions where the five runs actually
 *  disagreed marked as forks. Each fork's alternatives are the values the five
 *  runs produced, plus the near-misses that make it a distribution rather than
 *  a menu. The picked value is always `alts[0]`. */
/** No commas after a fork: an inline-grid is as wide as its widest
 *  alternative, so a trailing comma would float half a line away from the
 *  value it belongs to. A forked snippet isn't valid TS anyway. */
export const CODE_C: Piece[] = [
  "retry(getJobs, {\n  attempts: ",
  {
    alts: [
      { v: "3", p: 0.41 },
      { v: "5", p: 0.27 },
      { v: "4", p: 0.18 },
      { v: "10", p: 0.09 },
    ],
  },
  "\n  backoff: ",
  {
    alts: [
      { v: "exponential(200)", p: 0.36 },
      { v: "exponential(200, { jitter: true })", p: 0.34 },
      { v: "fixed(1000)", p: 0.18 },
      { v: "linear(500)", p: 0.08 },
    ],
  },
  "\n  retryOn: ",
  {
    alts: [
      { v: "[500, 502, 503]", p: 0.44 },
      { v: "[429, 500, 502, 503]", p: 0.33 },
      { v: "[429, 503]", p: 0.14 },
      { v: "isTransient", p: 0.09 },
    ],
  },
  "\n});",
];

/* ── Copy candidates, so the variants are judged on structure not wording ── */

export const COPY = {
  eyebrow: "Under the hood · press → for five runs",
  headline: "Ask five times, get five answers.",
  body: "Nothing broke. The model is not looking an answer up — it is sampling one, token by token.",
  mechanism: "Every token is a draw from a distribution.",
  honesty: "Pre-recorded runs — no model was called.",
};
