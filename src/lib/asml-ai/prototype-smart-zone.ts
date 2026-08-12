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
  /** how many blocks are in the window — prompt #1 is always block 0 */
  blocks: number;
  /** share of the attention bar still held by prompt #1, 0–1. NO NUMBER GOES
   *  ON SCREEN: the proportion is illustrative, and #44 rules that this shape
   *  of figure must not be presented as measurement. It is a picture. */
  share: number;
  /** 0 = every block still its own vivid colour, 1 = all the same pale grey */
  fade: number;
  note: string;
}

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

/** the vivid start state. Every block arrives as its own distinct thing —
 *  a file, a decision, a correction — and they all end up the same grey.
 *  Block 0 is prompt #1 and is exempt: it stays orange to the last frame,
 *  because "nothing was deleted" is the line the slide ends on. */
export const C_BLOCK_HUES = [
  "#0066cc",
  "#00a3a3",
  "#7b3fe4",
  "#00994d",
  "#d81b60",
  "#0d47a1",
  "#00897b",
  "#5e35b1",
];
export const C_GREY = "#c3ccd9";

/** Atil's turn schedule (#52): 1 · 5 · 10 · 20, tokens climbing to 214k. */
export const C_STATES: CState[] = [
  {
    turn: "turn 1",
    tokens: 8_000,
    gauge: "1%",
    live: 4,
    blocks: 3,
    share: 0.42,
    fade: 0,
    note: "It does exactly what you asked.",
  },
  {
    turn: "turn 5",
    tokens: 42_000,
    gauge: "4%",
    live: 3,
    blocks: 16,
    share: 0.14,
    fade: 0.42,
    note: "It renamed a function without asking.",
  },
  {
    turn: "turn 10",
    tokens: 96_000,
    gauge: "10%",
    live: 2,
    blocks: 38,
    share: 0.05,
    fade: 0.76,
    note: "It changed the public API to make its own test pass.",
  },
  {
    turn: "turn 20",
    tokens: 214_000,
    gauge: "21%",
    live: 1,
    blocks: 76,
    share: 0.012,
    fade: 1,
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
