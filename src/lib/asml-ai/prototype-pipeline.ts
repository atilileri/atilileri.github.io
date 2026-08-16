/**
 * PROTOTYPE (#91) — where chapter 5's seven-stage pipeline image lives.
 * Throwaway; dies with the branch `prototype/pipeline-image`.
 *
 * Three comps, switchable with ?variant=A|B|C:
 *
 *   A  one establishing screen   the seven stages once, straight after the
 *                                divider, argued by where the seam sits
 *   B  a rail on every screen    the same seven as a slim progress rail,
 *                                shown on three mock stage screens so the
 *                                real estate cost is visible, not described
 *   C  folded into the divider   the roadmap divider with factor 4 lit and
 *                                the seven stages underneath it
 *
 * The stage names are Atil's words from map #63; the commands are locked
 * decision #7. STAGE 7 CARRIES NO COMMAND ON PURPOSE — the locked list names
 * five (/grill-with-docs, /to-spec, /to-tickets, /implement, /code-review),
 * /wayfinder is installed and obvious, and nothing installed in this repo
 * does "document back". The gap is a finding for the spine grilling (#70),
 * not something to paper over with an invented slash command.
 */

export type Stage = {
  /** 1-based, as spoken. */
  n: number;
  /** Atil's own words for the stage. */
  name: string;
  /** The command a person types, or null where none is installed. */
  cmd: string | null;
  /** Companion commands, shown small where a variant has the room. */
  also?: string[];
  /** One line, used only where a variant shows a beat under the name. */
  beat: string;
};

export const STAGES: Stage[] = [
  {
    n: 1,
    name: "Wayfinder",
    cmd: "/wayfinder",
    beat: "Chart the way, ticket the decisions.",
  },
  {
    n: 2,
    name: "Grill",
    cmd: "/grill-with-docs",
    also: ["/research", "/prototype"],
    beat: "Close the holes before it fills them.",
  },
  {
    n: 3,
    name: "To spec",
    cmd: "/to-spec",
    beat: "Write down what was decided.",
  },
  {
    n: 4,
    name: "To tickets",
    cmd: "/to-tickets",
    beat: "Cut it into pieces that can be checked.",
  },
  {
    n: 5,
    name: "Implement",
    cmd: "/implement",
    beat: "Red, green, refactor.",
  },
  {
    n: 6,
    name: "Review",
    cmd: "/code-review",
    beat: "Never against the context that wrote it.",
  },
  {
    n: 7,
    name: "Document back",
    cmd: null,
    beat: "Regenerate from source, never maintain.",
  },
];

/**
 * The seam in variant A. Everything up to and including this stage happens
 * before a line of code exists; everything after it defends code that does.
 * Four / three — chapter 4's "prepare it, then defend it" seam, one chapter on.
 */
export const SEAM_AFTER = 4;

export const NAMES: Record<string, string> = {
  A: "one establishing screen",
  B: "a rail on every screen",
  C: "folded into the divider",
};
