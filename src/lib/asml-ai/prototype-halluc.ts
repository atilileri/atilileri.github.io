/**
 * PROTOTYPE (wayfinder #41) — chapter 2's FIFTH slide: the hallucination
 * diagnosis. Throwaway; dies with the branch `prototype/hallucination-diagnosis`.
 *
 * The slide before it (#35, built) shows five answers, sorts them, and names
 * two failures: FACTUALITY and FAITHFULNESS. It stops at naming them. This
 * slide is the payoff — one diagnostic question, two named failures, two
 * different fixes. A procedure, not a taxonomy.
 *
 * Text budget, locked by #41: per branch, the NAME, ONE sentence of cause and
 * ONE sentence of fix. Nothing else. Every variant reads this table, so they
 * can only disagree about presentation.
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
  /** The answer to the hinge question that lands you here. */
  answer: "No" | "Yes";
  /** Named on the slide before this one — repeated here as a branch, not
   *  introduced as a discovery. Spelling must match stochastic.ts KINDS. */
  name: string;
  /** ONE sentence. Why it happened. */
  cause: string;
  /** ONE sentence. What you do about it. */
  fix: string;
  /** Small type. The chapter that owns the fix — a pointer, not the lesson. */
  forward: string;
};

export const HINGE = "Was the information in its context?";

export const BRANCHES: Branch[] = [
  {
    key: "factuality",
    answer: "No",
    name: "factuality",
    cause: "It answered from memory, about something it was never shown.",
    fix: "Put the information in front of it.",
    forward: "A practice, not a setting — the operating model calls it grilling.",
  },
  {
    key: "faithfulness",
    answer: "Yes",
    name: "faithfulness",
    cause: "It had the information, and the window got too full to hold onto it.",
    fix: "Cut the context back — clear it, compact it, or start fresh.",
    forward: "The far end of a full window is the dumb zone. Tokenomics, next.",
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
