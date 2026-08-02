/**
 * PROTOTYPE — wayfinder #35. Throwaway data table for the chapter-2 stochastic
 * slide. Lives on the branch `prototype/stochastic-slide` only; #38 rewrites
 * the winner properly and this file does not go to main.
 *
 * RESHAPED 2026-08-02 on Atil's call. The slide is no longer "five different
 * answers, therefore variance". It is: ONE prompt, five answers the room can
 * rank but not tell apart, and three of the five are wrong in two nameable
 * ways. The argument is that **hallucination is inherent** — the wrong answers
 * come out of the same draw as the right ones, not from a broken mode.
 *
 * The two types, which are the slide's teaching payload:
 *   FACTUALITY   — it reached for knowledge that was never in its context,
 *                  and got it wrong. Unsourced recall.
 *   FAITHFULNESS — the information WAS in its context. It didn't follow it.
 *
 * Everything is PRE-RECORDED. Per map #29 the deck makes no live AI API
 * calls, ever. These answers are hand-authored to be plausible, not captured.
 */

/** The context — pasted WITH the prompt, which is what makes a faithfulness
 *  miss visible: the room can check answer 3 against the line above it. */
export const TRACE = [
  "TypeError: Cannot read properties of undefined (reading 'id')",
  "    at buildManifest (src/lib/manifest.ts:42)",
  "    at exportJob    (src/jobs/export.ts:17)",
];

export const PROMPT = "Why is this failing?";

export type Kind = "legit" | "faithfulness" | "factuality";

export const KINDS: Record<Kind, { tag: string; def: string }> = {
  legit: {
    tag: "grounded",
    def: "Reads the context it was given, and answers from it.",
  },
  faithfulness: {
    tag: "faithfulness",
    def: "The answer was in its context. It didn't follow it.",
  },
  factuality: {
    tag: "factuality",
    def: "The answer was never in its context. It recalled it — and it isn't true.",
  },
};

/** Ordered most likely → least likely. Atil's call: RANK, no percentages —
 *  the bar carries the order, and there is no number for an engineer in the
 *  room to argue with. `tell` appears one fragment after the labels: the
 *  single fact that makes the answer wrong. */
export const ANSWERS: {
  kind: Kind;
  text: string;
  tell: string;
  funny?: boolean;
}[] = [
  {
    kind: "legit",
    text: "buildManifest reads .id on an item that isn't there. Guard the lookup at manifest.ts:42.",
    tell: "Reads the trace. Fixes where it points.",
  },
  {
    kind: "legit",
    text: "The caller passes an empty batch. Fix export.ts:17, not line 42.",
    tell: "Also reads the trace — one frame further up. A different reading, not a worse one.",
  },
  {
    kind: "faithfulness",
    text: "The error is at manifest.ts:58, in writeManifest().",
    tell: "The trace says 42, and it is pasted directly above.",
  },
  {
    kind: "factuality",
    text: "Known bug in Node 20.11 — ESM destructuring. Upgrade to 20.12.",
    tell: "There is no such bug, and nothing in the context mentions Node.",
  },
  {
    kind: "factuality",
    funny: true,
    text: "manifest.ts is probably corrupted. Delete it and let the framework regenerate it.",
    tell: "Nothing regenerates it. There is no such framework behaviour — and now there is no file either.",
  },
];

/** Rank bar lengths, most → least. Proportions only, never labelled with a
 *  number: the claim is "the wrong ones are not rare", not "exactly 16%". */
export const RANK = [1, 0.82, 0.63, 0.47, 0.34];

export const COPY = {
  eyebrow: "Under the hood · press → for five answers",
  // Atil's call (2026-08-02): WITHHOLD the punch. The headline names the
  // setup only; the orange landing on fragment 2 is the reveal.
  headline: "Same question. Five answers.",
  body: "Not a bug and not a bad day — the wrong ones came out of the same draw as the right ones.",
  labelBeat: "Three of five, in two nameable ways.",
  honesty: "Pre-recorded runs — no model was called.",
  lanes: { legit: "grounded in the context", halluc: "hallucinated" },
};
