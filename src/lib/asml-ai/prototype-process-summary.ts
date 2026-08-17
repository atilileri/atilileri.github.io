/**
 * PROTOTYPE (#71) — chapter 5: the PROCESS SUMMARY screen. Seven stops, one
 * screen, wayfinder through document-back. Throwaway; dies with the branch
 * `prototype/process-summary`.
 *
 * Five comps, switchable with ?variant=A|B|C|D|E:
 *
 *   A  the rail, enlarged      the #91 rail at full size, same visual language,
 *                              nothing else. Tests whether the summary screen
 *                              simply IS the rail zoomed out. Carries NO small
 *                              rail — see the note below; that is the answer to
 *                              the ticket's question 2, drawn rather than argued.
 *   B  the carried example     one invented decision travels all seven stops;
 *                              each stop shows what THAT decision looked like
 *                              there. The version most likely to argue.
 *   C  no carried example      same claim, same hand-off geometry, generic
 *                              artefact names. The control against B: does one
 *                              decision travelling seven stops pay for itself?
 *   D  the staircase           free swing. The ARTEFACTS become the primary
 *                              objects and the stage names the captions: seven
 *                              treads climbing left to right, each standing on
 *                              what the one before it wrote. The claim as
 *                              geometry rather than as a row of labels.
 *   E  two keys                free swing. No row at all — the seven stops are
 *                              composed in two visual keys, four and three, and
 *                              the seam IS the change of key. The room can count
 *                              four-before-anything-runs off the wall without a
 *                              word of it being printed (locked #3).
 *
 * ══ WHAT IS LOCKED HERE — do not relitigate in the build ══
 *
 * THE CLAIM (#70's widened C, and the only claim about all seven stops at once):
 *   "Each stage writes down what the next one is judged against."
 * Every comp must serve it. A comp that only names seven stages is #91's comp A
 * in a bigger font, and #91 already ruled that a seven-across row ORIENTS and
 * does not ARGUE.
 *
 * THE EVIDENCE IS SPOKEN, NEVER PRINTED. "Four of these seven happen before a
 * line of code exists" is the presenter's line (#70 gave it to the seam). The
 * room counts it off the wall. No comp prints it, and no comp's headline is a
 * paraphrase of it.
 *
 * THE SEAM IS A MARK, NOT A LABEL. Two movements — write the check, then run it
 * — seam after `to-tickets`, spoken. Each comp draws the break with no words on
 * it, and how it draws it is the comp's own answer.
 *
 * SEVEN STOPS, NOT SIX. `document back` is drawn PRESENT and UNRESOLVED: it has
 * a name, it has no command, and #93 has not ruled on its screen. Do not hide
 * the stop and do not pre-empt #93.
 *
 * THE EXAMPLE IS INVENTED, GENERIC, AND STAYS AT CONTRACT LEVEL (locked #6 on
 * map #63). Who owns retention, how stale is too stale, who may write — never
 * what calibration IS. An ASML room invited to argue the physics has stopped
 * reading the process.
 *
 * COMMANDS ARRIVE ONE AT A TIME, driven by reveal fragments, not by a widget.
 * The lit stop is `.current-fragment`; only it prints its command. Costs nothing
 * from the two-widget budget and binds no key — and reveal owns `n` and `p`
 * permanently (found on `prototype/wayfinder-map`, and it is why no comp here
 * reaches for a key).
 */

/** One stop on the pipeline. */
export type Stop = {
  /** The stage, as the rail names it. */
  name: string;
  /** The installed command. `null` for `document back` — nothing in
   *  `.claude/skills` does it, and #91 recorded that gap. Drawn as absent. */
  cmd: string | null;
  /** What this stage WRITES DOWN — generic. Comps C, D and E read this. */
  writes: string;
  /** What the NEXT stage is therefore judged against. The claim, per stop. */
  judged: string;
  /** Comp B only: what the carried example looked like at this stop. */
  example: string;
  /** True for the last stop before the seam (`to-tickets`). */
  seamAfter?: boolean;
};

/**
 * The invented decision that travels all seven stops in comp B. Contract level
 * throughout — ownership, staleness, who may write. Never the physics.
 */
export const DECISION = "One place the whole fleet reads calibration data from.";

export const STOPS: Stop[] = [
  {
    name: "Wayfinder",
    cmd: "/wayfinder",
    writes: "the map",
    judged: "which question gets asked first",
    example: "Four decisions. Retention first — the rest wait on it.",
  },
  {
    name: "Grill",
    cmd: "/grill-with-docs",
    writes: "the answers",
    judged: "what the spec is allowed to assume",
    example: "The site owns retention. Eighteen months.",
  },
  {
    name: "To spec",
    cmd: "/to-spec",
    writes: "the spec",
    judged: "what counts as done",
    example: "One writer. Readers get a copy. Over 24 hours old is an error.",
  },
  {
    name: "To tickets",
    cmd: "/to-tickets",
    writes: "the tickets",
    judged: "how small a thing can be judged alone",
    example: "Six of them. First: refuse a write from a second owner.",
    seamAfter: true,
  },
  {
    name: "Implement",
    cmd: "/implement",
    writes: "the failing test",
    judged: "whether the code did what was asked",
    example: "A second writer is refused. Written first. Red.",
  },
  {
    name: "Review",
    cmd: "/code-review",
    writes: "two reports",
    judged: "whether a person merges it",
    example: "Standards and spec, read by something that did not write it.",
  },
  {
    name: "Document back",
    cmd: null,
    writes: "the record",
    judged: "the next decision, when it comes",
    example: "The contract as it now stands. The next map starts here.",
  },
];

/** Index of the seam — the break falls after this stop. */
export const SEAM = STOPS.findIndex((s) => s.seamAfter);

/**
 * Candidate eyebrow + headline per comp. The summary screen did not exist when
 * #70 locked nine headlines, so this copy is UNWRITTEN and these are proposals.
 * #92 disposes. Neither the thesis nor the payoff may appear here.
 */
export const COPY: Record<string, { eyebrow: string; head: [string, string]; note?: string }> = {
  A: {
    eyebrow: "The whole thing, once",
    head: ["Every stop writes down", "what the next one is judged against."],
    note: "The claim verbatim. Plain, long, and it leaves the picture nothing to do.",
  },
  B: {
    eyebrow: "One decision, seven stops",
    head: ["The output of a stage", "is the next stage's test."],
  },
  C: {
    eyebrow: "The shape of the work",
    head: ["No stage marks", "its own homework."],
    note: "⚠ Adjacent to #54's 'It can't check itself. It can run your check.' — #70 forbids reusing that line as a headline. This is a different sentence; #92 should rule whether it is different ENOUGH.",
  },
  D: {
    eyebrow: "Written down, then handed on",
    head: ["Every step stands on", "what the one before it wrote."],
  },
  E: {
    eyebrow: "Two halves, one pipeline",
    head: ["How it gets judged is settled", "before the work is done."],
    note: "⚠ Deliberately NOT 'four of these happen before a line of code exists' — that stays spoken (locked #3). E makes it countable instead of printing it.",
  },
};

export const NAMES: Record<string, string> = {
  A: "the rail, enlarged",
  B: "the carried example",
  C: "no carried example",
  D: "the staircase",
  E: "two keys",
};

/**
 * The #91 rail, for the four comps that carry it. Comp A does NOT — it IS the
 * rail, and drawing it twice on one screen is the contradiction the ticket
 * asked to be answered.
 */
export const RAIL = STOPS.map((s) => ({ name: s.name, cmd: s.cmd }));
