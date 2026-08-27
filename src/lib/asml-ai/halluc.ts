/**
 * Chapter 2, slide 4 — the hallucination diagnosis. One question, two named
 * failures, two different fixes.
 *
 * Shape decided by wayfinder #41 (variant A, "the fork", won a three-variant
 * prototype; the losers — "the window" and "the diptych" — live on branch
 * `prototype/hallucination-diagnosis` and are described on the ticket, so
 * nobody rebuilds them). The argument:
 *
 *   The slide before this one names FACTUALITY and FAITHFULNESS and stops
 *   there. This one is the payoff: **one question sorts them for you**, and
 *   each has a different fix. A procedure, not a taxonomy.
 *
 * Text budget: one sentence of cause and one of fix per branch. Faithfulness
 * keeps a second line because it is the named mechanism rather than more
 * prose. The boxes were once fuller — straight from the source — and were
 * cut back on read; don't grow them again.
 *
 * Both fixes are HINTS FORWARD, not lessons — neither is taught here:
 *   factuality   → grilling, which the operating model owns (chapter 5)
 *   faithfulness → the dumb zone, whose techniques are chapter 4's
 * Neither chapter exists yet, so each hint has to read as a promise a
 * presenter can make today, not as a setup that dangles. Hence `forward` is
 * small type, never a claim.
 *
 * "Fuzzy JPEG" — the source's metaphor for what a model holds — is
 * deliberately absent (#41): the chapter already runs rings, dice and lanes,
 * and this slide has no room for a fifth metaphor.
 *
 * After Matt Pocock, "Why AI agents hallucinate".
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
      "It assumed specifics that were never passed to it, and relied on unsourced knowledge.",
    fix: "Fill the gaps in solution universe.",
    forward: "Proposed AI Operating Model fills the gaps with the '/grilling' skill.",
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
      "It was given the correct information but didn't follow it. `Attention degradation`",
    fix: "Keep sessions shorter for model to focus.",
    forward: "Stay in the 'Smart Zone' with the techniques in Best Practices.",
    edge: "smart zone",
  },
];

export const TEXT = {
  // No "press →": the slide has no fragments to press through — it plays itself
  // out on arrival — and an eyebrow promising an interaction the slide does
  // not have is worse than a plain one.
  eyebrow: "Terminology · one question, two failure modes",
  // The hinge IS the headline: the slide's whole value is that one question
  // sorts the two failures for you.
  headline: "How to separate Hallucinations?",
  // The deck's standing single sentence.
  closeLine: "Causing less errors and more repeatability.",
  fixed: "Prevented",
};
