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
 * 2. Turn 5 was cut (Atil, 2026-08-25). It existed to say nothing has gone
 *    wrong YET, which is what made the decay read as a slope rather than as a
 *    cliff. Research #44's wording constraint is unchanged and now rests on the
 *    presenter: the honest claim is "budget for ~100k", never "it's fine up to
 *    100k" — the one version the evidence contradicts.
 * 3. The gauge chip is CORRECT at every turn. It is not a mistake in the
 *    widget and must never be drawn as a warning. Research #45 found Copilot
 *    now genuinely ships a context gauge, so the only defensible form of "you
 *    get no warning" is the one this slide stages: it is honest about the tank
 *    and silent about the engine.
 */

export const EYEBROW = "keep your chat in the";
export const HEADLINE = ["Smart Zone"];

export interface SmartZoneState {
  turn: string;
  tokens: number;
  /**
   * how much of `tokens` is turn 1 — drawn orange, everything after it blue.
   *
   * ⚠ IT IS THE SAME NUMBER IN EVERY STATE (Atil, 2026-08-25), which is what
   * makes the orange block hold still while the blue grows past it. Turn 1 did
   * not get smaller; the session got bigger. A per-state value made the orange
   * shrink between presses and the room read it as something being removed.
   */
  mine: number;
  /** what Copilot's own gauge reads at this point — always correct, never a warning */
  gauge: string;
  /** how many of the brief's lines are still being obeyed */
  live: number;
  /** how many blocks are in the window by now */
  blocks: number;
  /** how much colour the blocks still have: 1 = vivid, 0 = pale grey */
  vivid: number;
}

/** the brief written in turn 1 — the thing that quietly stops being obeyed */
export const BRIEF = [
  "no new dependencies",
  "keep signatures the same",
  "tests before code",
  "ask before renaming",
];

/** everything you sent in turn 1 — fixed, and the orange block's whole width */
export const TURN1 = 8_000;

/** the model's advertised window, for the far-right mark */
export const WINDOW = 1_000_000;
export const SOFT = 100_000;
/** past this the tank is drawn as the dumb zone — the band ends, the tint starts */
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

/**
 * THREE STATES, not four (Atil, 2026-08-25). Turn 5 — "still holding, nothing
 * has gone wrong yet" — was cut. ⚠ It was the slope: it said the decay is
 * gradual and that turn 10 is not a cliff. With three states the room sees
 * holding → slipping → gone, so say the gradual part OUT LOUD instead. Do not
 * let the slide imply a threshold that flips at turn 10.
 */
export const STATES: SmartZoneState[] = [
  {
    turn: "turn 1",
    tokens: TURN1,
    mine: TURN1,
    gauge: "1%",
    live: 4,
    blocks: 3,
    vivid: 1,
  },
  {
    turn: "turn 10",
    tokens: 96_000,
    mine: TURN1,
    gauge: "10%",
    live: 3,
    blocks: 30,
    vivid: 0.2,
  },
  {
    turn: "turn 20",
    tokens: 214_000,
    mine: TURN1,
    gauge: "21%",
    live: 1,
    blocks: 64,
    vivid: 0,
  },
];

/**
 * The three causes of the dumb zone, named under the zone itself (Atil,
 * 2026-08-25). Research #44 is emphatic on one point: these are THREE
 * INDEPENDENT FACTS that feed one result, not a chain. Do not draw an arrow
 * between them, and never derive one from another — deriving lost-in-the-middle
 * from attention dilution is specifically contradicted, because the U-shape is
 * present in a transformer that has never been trained.
 *
 * Each line describes a BEHAVIOUR the room can recognise. No softmax, no
 * quadratic scaling, no attention sinks: #44 found the first two overstated and
 * the third cited backwards in the repo's own notes.
 */
export const CAUSES = [
  {
    name: "lost in the middle",
    line: "Edges stay sharp. The middle goes soft.",
  },
  {
    name: "recency bias",
    line: "The newest turn wins the argument.",
  },
  {
    name: "noise accumulation",
    line: "Every turn adds another plausible wrong answer.",
  },
];

/**
 * The budget rule of thumb. ⚠ IT IS SPOKEN, NOT SHOWN (Atil, 2026-08-25) — it
 * used to sit under the stage and it was cut to give the widget the room. The
 * wording constraint from research #44 still binds the presenter: say "budget
 * for ~100k", never "it's fine up to 100k", which is the one version the
 * evidence contradicts.
 */
export const BUDGET_RULE = "Budget for ~100k. Past ~150k, assume you are paying for it.";
