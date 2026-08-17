/**
 * PROTOTYPE (#71) — chapter 5, screen 3: the planning map, drawn.
 * Throwaway; dies with the branch `prototype/wayfinder-map`.
 *
 * Four comps, switchable with ?variant=A|B|C|D:
 *
 *   A  fog lifting            the map dark except a lit frontier; resolving
 *                             the lit questions lights the next ring toward
 *                             the destination. Live, presenter keys n / r.
 *   B  the board fills        the four quadrants as one board — destination,
 *                             decided, open now, out of scope — filling with
 *                             fragments. The full vocabulary on screen.
 *   C  it does not fit        the headline drawn literally: one conversation
 *                             with everything in it, beside the same decisions
 *                             held one at a time. Static, two fragments.
 *   D  confirm or overrule    the three open questions as cards, each already
 *                             carrying the agent's recommended answer. Live,
 *                             presenter keys y / n / r. Human-in-the-loop is
 *                             the picture rather than a label.
 *
 * THE EXAMPLE IS INVENTED AND GENERIC — locked decision #6 on map #63. It is
 * never this deck's own map: the room must not decode deck-building jargon to
 * read the picture. It is deliberately a decision an executive recognises
 * without any domain explanation, and deliberately not an ASML system.
 *
 * WHAT THIS SCREEN IS NOT: batching. Locked decision #3 folds the
 * grill-in-batches short into screen 4 (the questions), so the frontier is
 * drawn here only as far as "some questions cannot be asked yet".
 */

export type Q = {
  id: number;
  /** The question as a person would ask it. */
  q: string;
  /** The answer, once it is taken. Present on every question so a comp can
   *  resolve it live; only shown where the state says it is decided. */
  a: string;
  /** Which ring it sits in: 0 already decided, 1 takeable now, 2 blocked. */
  ring: 0 | 1 | 2;
  /** For ring 2 — the question it waits on. */
  after?: number;
  /** D only: the answer the agent recommends before the human rules. */
  proposed?: string;
};

/** The invented example. One decision, too big for one sitting. */
export const DESTINATION = "One place the whole fleet reads calibration data from.";

export const QUESTIONS: Q[] = [
  {
    id: 1,
    q: "Where does the data live?",
    a: "One store. A read cache at each site.",
    ring: 0,
  },
  {
    id: 2,
    q: "Who owns how long we keep it?",
    a: "The site does. Eighteen months.",
    ring: 0,
  },
  {
    id: 3,
    q: "What happens when the link drops?",
    a: "The site keeps running on its cache.",
    ring: 1,
    proposed: "The site keeps running on its cache.",
  },
  {
    id: 4,
    q: "Which systems read it today?",
    a: "Nine. Four of them nobody owns.",
    ring: 1,
    proposed: "Six — the ones in the service catalogue.",
  },
  {
    id: 5,
    q: "Who approves a change to the shape?",
    a: "The data owner, with the readers notified.",
    ring: 1,
    proposed: "The data owner, with the readers notified.",
  },
  {
    id: 6,
    q: "How do we cut over without stopping?",
    a: "Dual write, then move the readers one at a time.",
    ring: 2,
    after: 3,
  },
  {
    id: 7,
    q: "What becomes of the old archive?",
    a: "Read-only, in place, until the readers are gone.",
    ring: 2,
    after: 5,
  },
];

/** Written down, in scope, not yet sharp enough to ask. */
export const FOG = [
  "Reading it from outside the site",
  "What the archive costs to keep",
];

/** Ruled out of this decision on purpose. */
export const OUT = ["Replacing the logbook screens"];

/** Candidate headline from the spine (#70) — this prototype may challenge it. */
export const HEADLINE = ["A big decision doesn't fit", "in one conversation."];
export const EYEBROW = "Chart it before you take it";

export const NAMES: Record<string, string> = {
  A: "fog lifting",
  B: "the board fills",
  C: "it does not fit",
  D: "confirm or overrule",
};

/** The rail from #91, so every comp is judged against the real canvas. */
export const RAIL: { name: string; cmd: string | null }[] = [
  { name: "Wayfinder", cmd: "/wayfinder" },
  { name: "Grill", cmd: "/grill-with-docs" },
  { name: "To spec", cmd: "/to-spec" },
  { name: "To tickets", cmd: "/to-tickets" },
  { name: "Implement", cmd: "/implement" },
  { name: "Review", cmd: "/code-review" },
  { name: "Document back", cmd: null },
];
