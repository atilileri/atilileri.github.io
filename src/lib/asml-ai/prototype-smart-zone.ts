/**
 * PROTOTYPE (#52) — chapter 4's smart-zone slide, three variants.
 * Throwaway; dies with the branch `prototype/smart-zone`.
 *
 * The slide's frame is LOCKED by the spine grilling (#54) and is identical in
 * all three variants, so the prototype can only be judged on the MECHANIC:
 *
 *   eyebrow   Attention is finite
 *   headline  The longer the window, / the shorter the focus.
 *   job       mechanism and budget only — the escapes belong to roll back
 *   ending    on the PROBLEM, never on the fix
 *
 * What the three disagree about is which true thing to make visible:
 *
 *   A  the competition   — attention mass sums to 1, so more context means a
 *                          smaller share for your instruction. Mechanism.
 *   B  the wrong place   — the same fact, moved through the window, scoring
 *                          BELOW the model's own closed-book score. Position.
 *   C  the gauge lies    — a session filling up with no warning anywhere on
 *                          screen. Budget + invisibility.
 *
 * Every number below is sourced from docs/research/dumb-zone.md (#44) or
 * docs/research/copilot-context-vocabulary.md (#45). The research doc also
 * lists what must NOT be claimed — three of those traps are avoided here by
 * construction, and they are noted at each site.
 */

export const EYEBROW = "Attention is finite";
export const HEADLINE = ["The longer the window,", "the shorter the focus."];

/* ══ VARIANT A — the competition ═══════════════════════════════════════════
 *
 * The one part of the softmax story that survives #44: per-decision attention
 * mass genuinely is conserved — the scores add up to 1. What #44 KILLS is the
 * quadratic claim ("doubling context quadruples interference" — a category
 * error) and the flat-dilution picture (empirically attention gets SPARSER,
 * not flatter: at 128k the top 4k columns still carry ~96.8% of the mass).
 *
 * So this variant deliberately does NOT dim every block evenly. The mass
 * CONCENTRATES on the newest blocks while the early instruction's share
 * collapses — which is both what the evidence says and the better image.
 */
export interface AState {
  /** what the presenter says has happened by this fragment */
  turn: string;
  /** how many blocks are in the window */
  blocks: number;
  /** the share of attention left on YOUR instruction, 0–1 */
  share: number;
  /** the verdict line under the stage */
  verdict: string;
}

export const A_STATES: AState[] = [
  {
    turn: "turn 1",
    blocks: 4,
    share: 0.34,
    verdict: "It follows the instruction.",
  },
  {
    turn: "turn 12",
    blocks: 18,
    share: 0.07,
    verdict: "It still follows the instruction.",
  },
  {
    turn: "turn 40",
    blocks: 64,
    share: 0.009,
    verdict: "It does not follow the instruction.",
  },
];

export const A_BAR_LABEL =
  "every score the model gives while writing one word &mdash; they add up to 1";
export const A_KICKER = "Nothing was deleted. It just stopped winning.";

/* ══ VARIANT B — the wrong place ═══════════════════════════════════════════
 *
 * #44's "best empirical opener, by a distance": Liu et al., 30 documents. With
 * the answer in the WRONG POSITION, GPT-3.5-Turbo scored 50.5% — below its own
 * 56.1% closed-book score. Handing it the answer in the wrong place was worse
 * than handing it nothing.
 *
 * The closed-book score is drawn as a fixed line so the crossing is VISIBLE
 * rather than arithmetic. #44 warns against drawing a clean U on 2026 models,
 * so this is three discrete positions, not a curve.
 */
export interface BState {
  /** where in the window the fact sits */
  pos: "top" | "middle" | "bottom";
  label: string;
  /** accuracy at that position, % */
  score: number;
  read: string;
}

/** the model's score with NO documents at all — the line everything is judged against */
export const B_CLOSED_BOOK = 56.1;

export const B_STATES: BState[] = [
  {
    pos: "top",
    label: "the fact, first thing in the window",
    score: 75.7,
    read: "It finds it.",
  },
  {
    pos: "bottom",
    label: "the fact, last thing in the window",
    score: 71.5,
    read: "It finds it.",
  },
  {
    pos: "middle",
    label: "the fact, in the middle of the window",
    score: 50.5,
    read: "Worse than not being told at all.",
  },
];

export const B_SOURCE = "30 documents, one model, 2023 — the effect is older than the tools.";
export const B_KICKER = "That shape is there in a model that has never been trained.";

/* ══ VARIANT C — the gauge lies ════════════════════════════════════════════
 *
 * #45's slide-breaker: Copilot NOW SHOWS a context gauge, so "you get no
 * warning" is only defensible in its precise form — the gauge reports how full
 * the tank is, not that the engine started misfiring at a quarter tank. This
 * variant stages exactly that: the gauge stays calm and correct all the way
 * through while the brief quietly stops being obeyed.
 *
 * The band is #44's wording constraint made visual: "budget for ~100k; past
 * ~150k assume you're paying for it." Never "it's fine up to 100k" — which is
 * why the fade starts BEFORE the band, not at it.
 */
export interface CState {
  turn: string;
  tokens: number;
  /** what Copilot's own gauge reads at this point */
  gauge: string;
  /** how many of the brief's lines are still being obeyed */
  live: number;
  /** how many blocks are in the window by now */
  blocks: number;
  /** how much colour the blocks still have: 1 = vivid, 0 = pale grey */
  vivid: number;
  note: string;
}

/** prompt #1's own size, fixed — it never grows, everything around it does */
export const C_PROMPT1 = 1_400;

/**
 * The blocks start as themselves — every turn a different, distinguishable
 * thing — and end as an undifferentiated grey field. That IS the argument:
 * nothing was deleted, it all just became the same to the model. The palette
 * deliberately leaves the ASML two-colour system for one beat; the grey it
 * collapses into is the theme's own.
 */
export const C_PALETTE = [
  "#ff6600",
  "#0066cc",
  "#00a3a3",
  "#7b3fa0",
  "#14a44d",
  "#d81b60",
  "#f5a300",
  "#00327d",
];
export const C_PALE = "#ccd4e0";

/** the brief written in turn 1 — the thing that quietly stops being obeyed */
export const C_BRIEF = [
  "no new dependencies",
  "keep the public API",
  "tests before code",
  "ask before renaming",
];

/** the model's advertised window, for the far-right mark */
export const C_WINDOW = 1_000_000;
export const C_SOFT = 100_000;
export const C_HARD = 150_000;

export const C_STATES: CState[] = [
  {
    turn: "turn 1",
    tokens: 8_000,
    gauge: "1%",
    live: 4,
    blocks: 3,
    vivid: 1,
    note: "The brief is holding.",
  },
  {
    turn: "turn 5",
    tokens: 42_000,
    gauge: "4%",
    live: 4,
    blocks: 14,
    vivid: 0.5,
    note: "Still holding. Nothing has gone wrong yet.",
  },
  {
    turn: "turn 10",
    tokens: 96_000,
    gauge: "10%",
    live: 3,
    blocks: 30,
    vivid: 0.2,
    note: "It renamed a function without asking.",
  },
  {
    turn: "turn 20",
    tokens: 214_000,
    gauge: "21%",
    live: 1,
    blocks: 64,
    vivid: 0,
    note: "It added a dependency, and wrote the tests last.",
  },
];

export const C_KICKER = [
  "It tells you the tank is full.",
  "Not that the engine started misfiring at a quarter tank.",
];

/** shown by every variant, small, under the stage — the budget rule of thumb */
export const BUDGET_RULE = "Budget for ~100k. Past ~150k, assume you are paying for it.";

export const NAMES: Record<string, string> = {
  A: "the competition",
  B: "the wrong place",
  C: "the gauge lies",
};
