/**
 * The deck's navigation spine — the four key factors, in chapter order.
 *
 * THIS IS THE ONE PLACE THE FACTOR LABELS LIVE (wayfinder #29 / #30). The
 * roadmap divider renders them on chapter 1's roadmap slide and again as the
 * divider entering chapters 2–5, so a label edited here changes every
 * appearance at once. The labels below are LOCKED by the bridge grilling
 * (#34) and applied by #37: three are the incumbents verbatim, and #4 dropped
 * its "AI" — same meaning, one word shorter four-across, and it stops the
 * spine saying "AI" when every item on it is about AI.
 *
 * The factors map 1:1 onto chapters 2, 3, 4 and 5. Chapter 1 is the intro
 * (where all four appear at equal weight) and chapter 6 the outro; those two
 * are the only slides that still get the full `.chapter` wash.
 *
 * The chapter 2–5 dividers take their headline straight from `label`, with no
 * override in the markup — one chapter, one name, and no instance that can
 * drift from this file (#34).
 */

export type Factor = {
  /** The chapter this factor opens. 2–5; there is no factor for 1 or 6. */
  chapter: number;
  label: string;
  /**
   * One line under the label, rendered ONLY on chapter 1's all-four roadmap
   * (#34). The dividers stay bare — that is what keeps their later
   * appearances a callback rather than a re-read — and this is the one place
   * on screen where `Tokenomics` and `Operating model` are ever defined.
   *
   * Glosses 3 and 4 are heavier than 1 and 2 on purpose: they are the two
   * factors that need defining most, so their payoff (waste, repeatability)
   * is stated rather than inferred. Do not even the asymmetry out.
   */
  gloss: string;
};

export const FACTORS: Factor[] = [
  { chapter: 2, label: "Under the hood", gloss: "how it works" },
  { chapter: 3, label: "Tokenomics", gloss: "what it costs" },
  { chapter: 4, label: "Best practices", gloss: "the principles that cut waste" },
  { chapter: 5, label: "Operating model", gloss: "the process that repeats" },
];
