/**
 * Chapter 2, slide 3 — the hallucination slide. One prompt, four answers, and
 * two of them are wrong.
 *
 * Shape decided by wayfinder #35 (variant B, "the sort", won a three-variant
 * prototype; the losers live on branch `prototype/stochastic-slide` and are
 * described on the ticket so nobody rebuilds them). The argument:
 *
 *   The room is shown four answers to one question and cannot tell them
 *   apart. Then they sort into two lanes and two of the four turn out to
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
 * than the slide printing it (see TEXT.honesty's absence: #35 ruled against
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
 * Two of the four are grounded and are **genuinely different readings of the
 * same trace** — a different reading, not a worse one. That matters: without
 * it the slide argues "one right answer, three wrong", which is a different
 * and weaker claim.
 *
 * `tell` is the single fact that makes an answer wrong, and it lands with the
 * sort.
 *
 * A fifth answer — "manifest.ts is corrupted, delete it and the framework
 * regenerates it" — was CUT at Atil's call, 2026-08-23. It was the absurd
 * one, tagged `factuality` beside the Node bug. Don't add it back without
 * re-checking the counts in this file and in the presenter notes.
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
];

/** Rank bar lengths, most → least. Proportions only, and never labelled with
 *  a number: the claim is "the wrong ones are not rare", not "exactly 16%".
 *  A real model samples per *token*, not per whole answer, so a printed
 *  per-answer probability would be wrong in a chapter that cannot afford it. */
export const RANK = [1, 0.82, 0.63, 0.47];

export const TEXT = {
  // The answers are on screen the moment the slide opens, so the eyebrow
  // promises the fold, not the arrival.
  eyebrow: "Terminology · press → to sort them",
  // The headline names the SUBJECT, the dek names the setup (Atil,
  // 2026-08-23). #35's withhold rule still holds where it matters: neither
  // line says how many of the four are wrong, so the fold keeps the punch.
  // "…Three are wrong." was built and rejected — it tells the room what to
  // look for.
  headline: "Hallucination",
  // Sits under the headline as ONE line. It sets the count up (four) without
  // sorting it, which is the job the old headline used to do alone. The
  // number must match ANSWERS.length.
  dek: "One query. Four possible outcomes.",
  // Names the CAUSE, not the count: the two orange cards already say
  // "two of four". This is the line chapter 4 pays off.
  closeLine: "Polluted context or degraded attention is all it takes.",
  lanes: { legit: "grounded in the context", halluc: "hallucinated" },
};
