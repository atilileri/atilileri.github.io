/**
 * The deck's navigation spine — the four key factors, in chapter order.
 *
 * THIS IS THE ONE PLACE THE FACTOR LABELS LIVE (wayfinder #29 / #30). The
 * roadmap divider renders them on chapter 1's roadmap slide and again as the
 * divider entering chapters 2–5, so a label edited here changes every
 * appearance at once. The labels below are PROVISIONAL: the bridge grilling
 * (#34) refines the wording and #37 applies it — here, not in the markup.
 *
 * The factors map 1:1 onto chapters 2, 3, 4 and 5. Chapter 1 is the intro
 * (where all four appear at equal weight) and chapter 6 the outro; those two
 * are the only slides that still get the full `.chapter` wash.
 */

export type Factor = {
  /** The chapter this factor opens. 2–5; there is no factor for 1 or 6. */
  chapter: number;
  label: string;
};

export const FACTORS: Factor[] = [
  { chapter: 2, label: "Under the hood" },
  { chapter: 3, label: "Tokenomics" },
  { chapter: 4, label: "Best practices" },
  { chapter: 5, label: "AI operating model" },
];
