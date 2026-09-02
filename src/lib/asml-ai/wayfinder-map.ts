/**
 * The WAYFINDER MAP — chapter 5's first Stop, drawn (wayfinder #98, comp E).
 *
 * The Slide argues one thing: **a big decision doesn't fit in one agent
 * session**, so you chart it before you take it. The picture is a map with its
 * tickets, and the way clears as the tickets close.
 *
 * ══ WHAT THIS FILE IS, AND WHY IT IS DATA RATHER THAN MARKUP ══
 *
 * Nine tickets move between four columns across four steps, and two of them
 * arrive mid-walk. Written as markup that is four hand-kept copies of the same
 * board; written as data it is one table the Widget reads. `pipeline.ts` holds
 * the Rail's seven Stops for the same reason.
 *
 * ══ WHAT IS LOCKED HERE — do not relitigate in the Slide's markup ══
 *
 * THE EXAMPLE IS INVENTED AND GENERIC (locked decision #6 on map #63). It is
 * never this deck's own map. An executive reads "one place the whole fleet
 * reads calibration data from" with no deck jargon at all, which is the test
 * the example has to pass.
 *
 * EVERY TICKET PRINTS ITS TYPE — `grilling` / `research` / `prototype` /
 * `task`. This is the beat that stops a map reading as a to-do list: it is
 * QUESTIONS, EACH WITH A METHOD ATTACHED (#98, Atil). The room meets all four
 * types here, which is why the `questions` Slide two steps later can print
 * three commands as names it has already met (#101).
 *
 * A QUESTION MAY APPEAR ON THIS WALL, NEVER A QUESTION BEING ANSWERED (#98's
 * ruling on the screen-3 / screen-4 boundary). This Slide owns WHICH questions
 * can be asked and in what order; `questions` owns HOW you ask the ones you
 * can. So the answers here arrive already made, in one beat, and no round is
 * ever counted — batching belongs to `questions` (locked decision #3).
 *
 * THE FOG LEAVES TWO WAYS. One patch GRADUATES into ticket #9; the other is
 * RULED OUT OF SCOPE rather than answered. Out of scope stays on the wall
 * throughout — the concept is half the argument that a map is bounded.
 *
 * THE LAST STEP IS THE POINT. The board empties, the map card goes orange and
 * a `/to-spec` chip lights: the map is a finished SET OF DECISIONS handed to
 * the next Stop, not a project plan. The `slices` Slide opens on exactly this
 * frame, which is what makes it a Callback rather than a new image (#101).
 */

/** The four ticket types the wayfinder skill has. All four reach the wall. */
export type TicketType = "grilling" | "research" | "prototype" | "task";

export type MapTicket = {
  id: number;
  type: TicketType;
  /** The question. Short enough to read off a wall in one glance. */
  q: string;
  /** The answer, printed only on the step the ticket closes. */
  a: string;
  /** Open until this ticket closes. The frontier is what has no open blocker. */
  blockedBy?: number;
  /** First step the ticket is on the map at all. > 0 means it arrived mid-walk. */
  from: number;
  /** Step the ticket closes on. */
  closed: number;
  /** Where it came from, when it was not there at charting. */
  born?: string;
};

/** The map itself is one issue; every ticket is its child. */
export const MAP = {
  title: "One place the whole fleet reads calibration data from",
  destination: "Every decision made and written down — enough to write the spec.",
};

/**
 * The nine tickets.
 *
 * ⚠ #6 and #7 exist to be BLOCKED and then FREED, and #8 exists to be SPAWNED
 * by the grilling on #3. Those two beats carry more argument than the type
 * badges do — if this Slide ever has to lose something, the badges go first
 * (#98's own note).
 */
export const TICKETS: MapTicket[] = [
  { id: 1, type: "grilling", q: "Where does the data live?", a: "One store. A read cache at each site.", from: 0, closed: 0 },
  { id: 2, type: "task", q: "Get a read-only copy of the archive.", a: "Done — 1.2 TB, nine tables.", from: 0, closed: 0 },
  { id: 3, type: "grilling", q: "What happens when the link drops?", a: "The site keeps running on its cache.", from: 0, closed: 1 },
  { id: 4, type: "research", q: "Which systems read it today?", a: "Nine. Four of them nobody owns.", from: 0, closed: 1 },
  { id: 5, type: "grilling", q: "Who approves a change to the shape?", a: "The data owner, readers notified.", from: 0, closed: 1 },
  { id: 6, type: "grilling", q: "How do we cut over without stopping?", a: "Dual write, then move the readers one at a time.", blockedBy: 3, from: 0, closed: 2 },
  { id: 7, type: "grilling", q: "What becomes of the old archive?", a: "Read-only, in place, until the readers are gone.", blockedBy: 5, from: 0, closed: 2 },
  // THE SPAWN. Grilling #3 produced a question nobody had at charting, and it
  // is a `prototype` — the honest picture of what a grilling actually does.
  { id: 8, type: "prototype", q: "What does a site show while it runs on cache?", a: "A banner, and the age of the data.", from: 1, closed: 2, born: "out of #3" },
  // THE GRADUATION. Fog patch 1, once the frontier reached it.
  { id: 9, type: "grilling", q: "Who may read it from outside the site?", a: "Nobody, until the owner signs it off.", from: 2, closed: 3, born: "out of the fog" },
];

/** In scope, written down, not sharp enough to ask yet. */
export const FOG: { text: string; graduates: number }[] = [
  { text: "Reading it from outside the site", graduates: 2 },
  // This one never graduates — it is ruled out of scope on step 3 instead.
  { text: "What the archive costs to keep", graduates: -1 },
];

/** Ruled past the destination. Never graduates. */
export const OUT: { text: string; from: number }[] = [
  { text: "Replacing the logbook screens", from: 0 },
  { text: "What the archive costs to keep", from: 3 },
];

/**
 * The line under the board, one per step. It narrates the gesture rather than
 * the content, so the presenter is free to talk over the tickets themselves.
 * `<b>` is the orange press cue, the same one the rest of the deck uses.
 */
export const STEPS = [
  "Seven questions, one map. Three can be taken now — the rest wait on them. <b>press →</b>",
  "Three closed. Two of them unblock what was waiting, and the grilling found a question the map never had. <b>press →</b>",
  "Fog is not a question yet. The frontier reaches it, and it becomes one. <b>press →</b>",
  "Nothing left to decide. That is the map finished — and what <b>/to-spec</b> reads.",
];
