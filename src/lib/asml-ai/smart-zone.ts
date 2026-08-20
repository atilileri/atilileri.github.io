/**
 * Chapter 4, slide 2 — the smart zone. The chapter's first widget.
 *
 * Settled by the prototype ticket (#52): three mechanics were built and walked
 * — the attention-competition bar, the position sweep, and this, the session
 * filling up. The full set is on branch `prototype/smart-zone`; read it before
 * relitigating a choice here.
 *
 * WHAT THIS SLIDE IS FOR, per the spine grilling (#54): mechanism and budget
 * ONLY. The escapes — /clear, /compact, fork, roll back — belong to the roll
 * back slide two slides later, so this one ends on the PROBLEM. That is what
 * makes the room want the rest of the chapter.
 *
 * THE ARGUMENT IT MAKES, in one line: your preparation does not survive the
 * session. It is the chapter's hinge — "You are not prompting. You are
 * preparing." — shown decaying.
 *
 * THREE THINGS HERE ARE DECISIONS, NOT NUMBERS. Do not tune them away:
 *
 * 1. The tank is LINEAR against the advertised window. A log scale made it
 *    read ~68% full while the gauge directly above it read 21% — the slide
 *    contradicting itself inside one frame. Linear puts the 100k/150k band
 *    uncomfortably close to the left edge, which IS Pocock's point: a session
 *    can be deep in the dumb zone with most of the window still free.
 * 2. Turn 5 exists to say nothing has gone wrong YET. Research #44's wording
 *    constraint is that the honest claim is "budget for ~100k", never "it's
 *    fine up to 100k" — the one version the evidence contradicts. A three-state
 *    version of this slide reads as a cliff. Four reads as a slope.
 * 3. The gauge chip is CORRECT at every turn. It is not a mistake in the
 *    widget and must never be drawn as a warning. Research #45 found Copilot
 *    now genuinely ships a context gauge, so the only defensible form of "you
 *    get no warning" is the one this slide stages: it is honest about the tank
 *    and silent about the engine.
 */

export const EYEBROW = "Attention is finite";
export const HEADLINE = ["The longer the window,", "the shorter the focus."];

export interface SmartZoneState {
  turn: string;
  tokens: number;
  /** what Copilot's own gauge reads at this point — always correct, never a warning */
  gauge: string;
  /** how many of the brief's lines are still being obeyed */
  live: number;
  /** how many blocks are in the window by now */
  blocks: number;
  /** how much colour the blocks still have: 1 = vivid, 0 = pale grey */
  vivid: number;
  note: string;
}

/** the brief written in turn 1 — the thing that quietly stops being obeyed */
export const BRIEF = [
  "no new dependencies",
  "keep the public API",
  "tests before code",
  "ask before renaming",
];

/** prompt #1's own size, fixed — it never grows, everything around it does */
export const PROMPT1 = 1_400;

/** the model's advertised window, for the far-right mark */
export const WINDOW = 1_000_000;
export const SOFT = 100_000;
export const HARD = 150_000;

/**
 * The blocks arrive as themselves — every turn its own colour — and end as an
 * undifferentiated grey field. That IS the argument: nothing was deleted, it
 * all just became the same to the model. This palette is the one place in the
 * deck that leaves the two-colour system, deliberately and for one moment; the
 * grey it collapses into is the theme's own.
 */
export const PALETTE = [
  "#ff6600",
  "#0066cc",
  "#00a3a3",
  "#7b3fa0",
  "#14a44d",
  "#d81b60",
  "#f5a300",
  "#00327d",
];
export const PALE = "#ccd4e0";

export const STATES: SmartZoneState[] = [
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

/** the budget rule of thumb, small, under the stage. Never "fine up to 100k". */
export const BUDGET_RULE = "Budget for ~100k. Past ~150k, assume you are paying for it.";
