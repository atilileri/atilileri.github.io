/**
 * Chapter 5's PIPELINE — the seven Stops of the operating model.
 *
 * THIS IS THE ONE PLACE THE STOP NAMES, THEIR COMMANDS AND THEIR DETAIL LINES
 * LIVE (wayfinder #103). The Rail draws them on every Slide in the chapter's
 * vertical stack, and the summary Slide draws the same seven at full size, so
 * a name edited here changes every appearance at once — the same contract
 * `roadmap.ts` holds for the four Factors.
 *
 * VOCABULARY (docs/asml-ai/CONTEXT.md, written by #101). A **Stop** is one of
 * the seven parts of the operating model — the practice itself and the mark the
 * Rail draws for it, one thing seen twice. A **Span** is two neighbouring Stops
 * lit together because one Slide carries both. The word *stage* is retired: the
 * theme's `-stage` class names already mean "the box a Widget draws into".
 *
 * ══ WHAT IS LOCKED HERE — do not relitigate in a Slide's markup ══
 *
 * SEVEN STOPS, SIX SLIDES. `to-spec` and `to-tickets` share the `slices` Slide,
 * which lights them as a Span (#101, overriding #70 and #92 — the Span used to
 * sit on `questions`). Every other Stop has one Slide.
 *
 * `Reconcile`, never `Document back` (#93). The Stop is two jobs — generate the
 * diagram into the requirement, and check the code against the requirement —
 * and the second one is a check, not a document.
 *
 * `Reconcile` HAS NO COMMAND, and its slot now says `in progress` (Atil,
 * 2026-08-28, replacing the truly blank slot of #93 Q6). The blank read as an
 * oversight on the wall; the marker says the same thing on purpose — the two
 * skills it needs do not exist yet, and someone is building them. It prints in
 * the deck's own words, never as a command, so the row still shows six
 * commands and one gap.
 *
 * THE COMMANDS ARE INSTALLED THINGS A PERSON TYPES (locked decision #7 on map
 * #63), which is why `cmds` is a list rather than a label: `questions` carries
 * three (#101) and `implement` carries two (#102). The #91 prototype froze at
 * one command per Stop and printed `/grill-with-docs`, which is not installed
 * here — `.claude/skills` has `grilling`, `research` and `prototype`.
 *
 * `judged` IS THE SUMMARY SLIDE'S CLAIM, PER STOP — what the next Stop is
 * judged against, in plain words with no "JUDGED AGAINST" label (#71 comp F).
 * It is the only text that carries the Headline "Every stop sets / the bar for
 * the next", so it is written to be read off the wall, not explained.
 *
 * THE SEAM IS A MARK, NEVER A LABEL (#71). It falls after `to-tickets`: four
 * Stops before a line of code exists, three after. That count is SPOKEN and
 * never printed, and on the executive route only (#92).
 */

export type Stop = {
  /** Stable id. The Rail's `lit` prop names Stops by this. */
  id: string;
  /** The name the Rail prints. */
  name: string;
  /** The installed commands, in the order the Slide reveals them. Empty for
   *  `Reconcile`, which prints `pending` in the same slot instead. */
  cmds: string[];
  /** What the NEXT Stop is judged against. The summary Slide's detail line. */
  judged: string;
  /** Printed in the command slot when a Stop has no command yet: the work is
   *  named and honestly marked unfinished (Atil, 2026-08-28). `Reconcile`
   *  only. */
  pending?: string;
  /** True for the last Stop before the seam (`to-tickets`). */
  seamAfter?: boolean;
};

export const STOPS: Stop[] = [
  {
    id: "wayfinder",
    name: "Wayfinder",
    cmds: ["/wayfinder"],
    judged: "lay a map to find your way",
  },
  {
    id: "questions",
    name: "Grill",
    // ⚠ ORDER IS THE ORDER THE `questions` SLIDE REVEALS THEM (#101's own
    // fragment table: research fills a hole, then grilling, then prototype).
    // The Rail prints the slot top-down, so any other order makes the commands
    // pop in out of sequence and read as a glitch. Nothing claims `/grilling`
    // comes first — #101's header line lists them, it does not sequence them.
    cmds: ["/research", "/grilling", "/prototype"],
    judged: "find and fill in the gaps",
  },
  {
    id: "to-spec",
    name: "To spec",
    cmds: ["/to-spec"],
    judged: "definition of done",
  },
  {
    id: "to-tickets",
    name: "To tickets",
    cmds: ["/to-tickets"],
    judged: "digestible, vertical slices",
    seamAfter: true,
  },
  {
    id: "implement",
    name: "Implement",
    cmds: ["/implement", "/tdd"],
    judged: "tested, working code",
  },
  {
    id: "review",
    name: "Review",
    cmds: ["/code-review"],
    judged: "independently verified",
  },
  {
    id: "reconcile",
    name: "Reconcile",
    cmds: [],
    pending: "in progress",
    judged: "connect the loop",
  },
];

/** Index of the Stop the seam falls after. Drawn, never labelled. */
export const SEAM = STOPS.findIndex((s) => s.seamAfter);
