/**
 * PROTOTYPE (wayfinder #41) — chapter 2's FIFTH slide: the hallucination
 * diagnosis. Throwaway; dies with the branch `prototype/hallucination-diagnosis`.
 *
 * The slide before it (#35, built) shows five answers, sorts them, and names
 * two failures: FACTUALITY and FAITHFULNESS. It stops at naming them. This
 * slide is the payoff — one diagnostic question, two named failures, two
 * different fixes. A procedure, not a taxonomy.
 *
 * Text budget: #41 charted ONE sentence of cause and ONE of fix per branch.
 * Atil overrode that after seeing variant A — the copy below is his, taken
 * from the source verbatim, and the cause runs to three sentences on the
 * faithfulness side. Kept as given; the right column is set smaller to hold
 * it. Every variant reads this table, so they can only disagree about
 * presentation.
 *
 * Both fixes are HINTS FORWARD, not lessons — neither is taught here:
 *   faithfulness → the "dumb zone", whose mechanism is chapter 3's
 *   factuality   → grilling, which the operating model owns
 * Chapters 4–5 are out of scope for map #29 and chapter 3 comes AFTER this
 * slide, so each hint has to read as a promise a presenter can make today,
 * not as a setup that dangles. Hence `forward` is small type, never a claim.
 *
 * "Fuzzy JPEG" is deliberately absent (Atil, #41): the chapter already runs
 * rings, dice and lanes, and this slide has no room for a fifth metaphor.
 */

export type BranchKey = "factuality" | "faithfulness";

export type Branch = {
  key: BranchKey;
  /** The answer to the hinge question that lands you here. Lives on the fork
   *  diagram; the right column states the CONDITION instead (`state`). */
  answer: "No" | "Yes";
  /** Named on the slide before this one — repeated here as a branch, not
   *  introduced as a discovery. Spelling must match stochastic.ts KINDS. */
  name: string;
  /** The condition, not the answer: what was true of the context. */
  state: string;
  /** Why it happened. `Backticks` mark the one term to set apart. */
  cause: string;
  /** What you do about it. */
  fix: string;
  /** Small type. The chapter that owns the fix — a pointer, not the lesson.
   *  Empty where the fix already carries its own pointer. */
  forward: string;
  /** The tag on this branch's arrow into `Fixed.` — the fix in one token, so
   *  the diagram carries the route and not just the diagnosis (Atil). */
  edge: string;
};

export const HINGE = "Was the information in its context?";

export const BRANCHES: Branch[] = [
  {
    key: "factuality",
    answer: "No",
    name: "factuality hallucinations",
    state: "information out of the context",
    cause:
      "The agent attempts to recall specific information that hasn't been explicitly passed to it, and it fails. It is trying to rely on unsourced knowledge.",
    fix: "Put the information in front of it.",
    forward: "The Operating Model fills the gaps with the '/grilling' skill.",
    edge: "/grilling",
  },
  {
    key: "faithfulness",
    answer: "Yes",
    name: "faithfulness hallucinations",
    state: "information in the context",
    cause:
      "The agent was provided the correct information in its context, but it ignored it or wasn't faithful to it. `Attention degradation.` As the context window grows longer and fills with more tokens, the attention relationships between all the elements become strained.",
    fix: "Reduce the number of tokens in the context window to restore the agent's focus. Stay out of the dumb zone with the techniques in Best Practices.",
    // Empty on purpose: the fix above already names where this is taught, so
    // a second pointer would say it twice.
    forward: "",
    edge: "smart zone",
  },
];

export const COPY = {
  eyebrow: "Under the hood · press → to diagnose",
  // The hinge IS the headline: the slide's whole value is that one question
  // sorts the two failures for you.
  headline: "One question tells you which.",
  // The deck's standing single sentence.
  beat: "Both failures look identical on screen. They do not have the same fix.",
  fixed: "Fixed.",
  // Variant B labels its one object; kept here so B and C can't drift.
  window: {
    title: "the context window",
    // The chip keeps ONE label across the move: what changes is which side of
    // the boundary it is on, and labelling it "never in the window" would
    // stop being true the moment it crosses.
    chip: "the fact it needed",
    outside: "outside it",
    dumb: "the dumb zone",
  },
  // Column heads for variant C's matrix.
  cols: { name: "the failure", cause: "why", fix: "what you do" },
};
