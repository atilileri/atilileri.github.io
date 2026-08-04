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
 * Variant A was built with Atil's fuller copy from the source, then cut back
 * to this on his read — the boxes carried too much text. The faithfulness
 * cause keeps two lines because the second one is the named mechanism, not
 * more prose. Every variant reads this table, so they can only disagree
 * about presentation.
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
   *  diagram only — the right column never restates it. */
  answer: "No" | "Yes";
  /** Named on the slide before this one — repeated here as a branch, not
   *  introduced as a discovery. Spelling must match stochastic.ts KINDS. */
  name: string;
  /** Why it happened. A newline starts a new paragraph; `backticks` mark the
   *  one term set apart from the prose. */
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

export const HINGE = "Was the information in the context?";

export const BRANCHES: Branch[] = [
  {
    key: "factuality",
    answer: "No",
    name: "factuality hallucinations",
    cause:
      "It reached for specifics that were never passed to it, and relied on unsourced knowledge.",
    fix: "Put the information in front of it.",
    forward: "The Operating Model fills the gaps with the '/grilling' skill.",
    edge: "/grilling",
  },
  {
    key: "faithfulness",
    answer: "Yes",
    name: "faithfulness hallucinations",
    // Two paragraphs: the failure, then the mechanism on its own line as a
    // named term — "Attention degradation:" reads as a definition rather
    // than a phrase buried mid-sentence.
    cause:
      "It was given the correct information and didn't follow it.\n`Attention degradation:` as the window fills with tokens, the attention between all the elements strains.",
    fix: "Reduce the tokens in the context window to restore its focus.",
    forward: "Stay out of the dumb zone with the techniques in Best Practices.",
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
