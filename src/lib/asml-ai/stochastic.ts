/**
 * Chapter 2, slide 3 — the hallucination slide. One prompt, five answers, and
 * three of them are wrong.
 *
 * Shape decided by wayfinder #35 (variant B, "the sort", won a three-variant
 * prototype; the losers live on branch `prototype/stochastic-slide` and are
 * described on the ticket so nobody rebuilds them). The argument:
 *
 *   The room is shown five answers to one question and cannot tell them
 *   apart. Then they sort into two lanes and three of the five turn out to
 *   be hallucinations. **Hallucination is inherent** — the wrong answers came
 *   out of the same draw as the right ones, not from a broken mode.
 *
 * The two types are the teaching payload, and the deck names them here and
 * nowhere else:
 *   FACTUALITY   — it reached for knowledge that was never in its context,
 *                  and got it wrong. Unsourced recall.
 *   FAITHFULNESS — the information WAS in its context. It didn't follow it.
 *
 * Everything here is PRE-RECORDED and hand-authored. Per map #29 the deck
 * makes no live AI API calls, ever — the presenter says so out loud rather
 * than the slide printing it (see COPY.honesty's absence: #35 ruled against
 * an on-screen label).
 */

/** The context, pasted WITH the prompt. This is load-bearing, not decoration:
 *  it is what makes the faithfulness miss *checkable on screen* rather than
 *  asserted — the room can hold answer 3 against the line above it. */
export const TRACE = [
  "TypeError: Cannot read properties of undefined (reading 'id')",
  "    at buildManifest (src/lib/manifest.ts:42)",
  "    at exportJob    (src/jobs/export.ts:17)",
];

export const PROMPT = "Why is this failing?";

export type Kind = "legit" | "faithfulness" | "factuality";

export const KINDS: Record<Kind, string> = {
  legit: "grounded",
  faithfulness: "faithfulness",
  factuality: "factuality",
};

/**
 * Ordered most likely → least likely.
 *
 * Two of the five are grounded and are **genuinely different readings of the
 * same trace** — a different reading, not a worse one. That matters: without
 * it the slide argues "one right answer, four wrong", which is a different
 * and weaker claim.
 *
 * `tell` is the single fact that makes an answer wrong, and it lands with the
 * sort. The last answer is the funny one; it is tagged `factuality` like the
 * Node bug rather than given a third label — one mechanism producing both a
 * credible fabrication and an absurd one is the stronger point (#35).
 */
export const ANSWERS: { kind: Kind; text: string; tell: string }[] = [
  {
    kind: "legit",
    text: "buildManifest reads a null id. Guard the lookup at manifest.ts:42.",
    tell: "Reads the trace. Fixes where it points.",
  },
  {
    kind: "legit",
    text: "The caller passes an empty batch. Fix export.ts:17.",
    tell: "Also reads the trace — one frame further up. Just a different reading.",
  },
  {
    kind: "faithfulness",
    text: "The error is at manifest.ts:17, in writeManifest().",
    tell: "Trace says 42, model failed to capture the correct line & function.",
  },
  {
    kind: "factuality",
    text: "Known bug in Node 20.11. Upgrade to 20.12.",
    tell: "There is no such bug, and nothing in the context mentions Node.",
  },
  {
    kind: "factuality",
    text: "manifest.ts is corrupted. Delete and framework regenerates it.",
    tell: "There is no such framework and behaviour — file is gone.",
  },
];

/** Rank bar lengths, most → least. Proportions only, and never labelled with
 *  a number: the claim is "the wrong ones are not rare", not "exactly 16%".
 *  A real model samples per *token*, not per whole answer, so a printed
 *  per-answer probability would be wrong in a chapter that cannot afford it. */
export const RANK = [1, 0.82, 0.63, 0.47, 0.34];

export const COPY = {
  // The answers are on screen the moment the slide opens, so the eyebrow
  // promises the fold, not the arrival.
  eyebrow: "Under the hood · press → to sort them",
  // WITHHOLDS the punch (#35): the headline names the setup only, and the
  // orange landing on the fold is the reveal. "…Three are wrong." was built
  // and rejected — it tells the room what to look for.
  headline: "Same question. Five answers.",
  // Names the CAUSE, not the count: the three orange cards already say
  // "three of five". This is the line chapter 4 pays off.
  beat: "Polluted context or degraded attention is all it takes.",
  lanes: { legit: "grounded in the context", halluc: "hallucinated" },
};
