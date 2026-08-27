/**
 * The session slide's turn script and block model (deck /decks/asml-ai,
 * chapter 3). Replaces the agent-loop ledger that stood here until #26 was
 * retired — see docs/asml-ai/adr/0001-session-slide-teaches-memory.md.
 *
 * WHAT THIS SLIDE TEACHES, and the only thing it teaches: a chat has no
 * memory. The transcript IS the memory, so the whole history goes up the wire
 * on every single turn. A delegate believes only their last sentence is sent.
 * This slide shows the sentence, and then shows everything that travels with
 * it.
 *
 * COST IS NOT ON THIS SLIDE. The odometer, the three billed-token bars and the
 * whole billing model were removed on purpose. Price arrives two slides on,
 * where a rate table sits beside it and it can be read properly. Do NOT
 * reintroduce a running total here: it drags the room's attention onto money
 * and off the thing being re-sent.
 *
 * THREE TURNS, THREE PRESSES. The bar is pre-filled before the first press —
 * the session starts part-full, because the harness and the project
 * instructions arrive before anyone types.
 *
 * The ask and the attachment land TOGETHER on turn 1 (Atil, 2026-08-27): the
 * old "can you help?" / "yes, paste it" exchange cost a press and taught
 * nothing. The pasted document is the great majority of the tokens on screen,
 * and that is the beat: turn 2 is a four-word question that re-sends forty
 * pages. Turn 3 adds a second attachment, this one written BY the model.
 */

/** `harness` and `instructions` are the two baseline kinds, and they are the
 *  only greys on the bar: dark for the harness, light for the project
 *  instructions (Atil, 2026-08-27). The tool-schema block is gone. */
export type BlockKind =
  | "harness"
  | "instructions"
  | "user"
  | "assistant"
  | "document";

export type Block = {
  /** Printed INSIDE the block on the bar. Keep it short — every block is only
   *  one line tall and the label has to fit in it. */
  label: string;
  tokens: number;
  kind: BlockKind;
};

/* NO SIZE ON THE BLOCK. The document used to print "12,000 tokens ≈ 40 pages"
 * inside its block, and the attachment chip repeated it (grilling Q17). Both
 * are gone (Atil, 2026-08-27): an attachment on this slide names the file and
 * nothing else. The presenter says the size out loud — see the notes. */

/** `file` prints a real attachment chip under the text, the same shape the
 *  vocabulary slide uses (.tk-file) — the file NAME and nothing else. */
export type Line = {
  role: "system" | "user" | "assistant";
  text: string;
  file?: { name: string };
};

/** Always on screen, before the first press. It carries what the bar's hairline
 *  used to caption: the session is part full before anyone types. */
export const OPENING_LINE: Line = {
  role: "system",
  text: "Harness and project instructions load <b>before you say a word</b>.",
};

export type Turn = { lines: Line[]; blocks: Block[] };

/** Already in the window before the first press: 2,200 tokens.
 *
 *  ORDER IS THE POINT (Atil, 2026-08-27). The harness is on top, the project
 *  instructions sit under it, and the conversation starts below the hairline —
 *  so the bar reads outside-in: the vendor's frame, then your repo's rules,
 *  then what anybody said. The tool-schema block was dropped with the same
 *  edit; it named a thing the room does not yet have a word for. */
export const BASELINE: Block[] = [
  { label: "harness", tokens: 1600, kind: "harness" },
  { label: "project instructions", tokens: 600, kind: "instructions" },
];

export const TURNS: Turn[] = [
  {
    lines: [
      {
        role: "user",
        text: "I have a supplier spec to review. Summarise it and flag the risks.",
        file: { name: "supplier-spec-rev4.pdf" },
      },
      { role: "assistant", text: "Four themes, and six risks worth your time." },
    ],
    blocks: [
      { label: "user", tokens: 30, kind: "user" },
      { label: "document", tokens: 12000, kind: "document" },
      { label: "assistant", tokens: 600, kind: "assistant" },
    ],
  },
  {
    lines: [
      { role: "user", text: "Which risk is worst?" },
      { role: "assistant", text: "The lead time on the stage assembly." },
    ],
    blocks: [
      { label: "user", tokens: 20, kind: "user" },
      { label: "assistant", tokens: 350, kind: "assistant" },
    ],
  },
  {
    lines: [
      { role: "user", text: "Rewrite that as a mail to the supplier." },
      {
        role: "assistant",
        text: "Here is the mail, in your usual register.",
        file: { name: "mail-to-supplier.eml" },
      },
    ],
    blocks: [
      { label: "user", tokens: 25, kind: "user" },
      { label: "assistant", tokens: 300, kind: "assistant" },
      // What the model HANDS BACK is a document too, and it stays in the
      // window like everything else (Atil, 2026-08-27). Orange, like the
      // pasted spec: the room reads "attachment", in either direction.
      { label: "mail draft", tokens: 900, kind: "document" },
    ],
  },
];

export const TURN_COUNT = TURNS.length;

const sum = (bs: Block[]) => bs.reduce((n, b) => n + b.tokens, 0);

/** Tokens in the window once `upTo` turns have landed. -1 = baseline only. */
export function tokensAt(upTo: number): number {
  return (
    sum(BASELINE) +
    TURNS.slice(0, upTo + 1).reduce((n, t) => n + sum(t.blocks), 0)
  );
}

/** 16,685 — everything the run ever holds. */
export const TOTAL_TOKENS = tokensAt(TURN_COUNT - 1);

/** Every block in landing order, with the turn that lands it (-1 = baseline).
 *  Heights are NOT stored here: they depend on the frame in front of us, so
 *  the controller sizes each block with segSizer() below. */
export const STRATA = [
  ...BASELINE.map((b) => ({ ...b, turn: -1 })),
  ...TURNS.flatMap((t, i) => t.blocks.map((b) => ({ ...b, turn: i }))),
];

/** The transcript, flat, with the turn each line belongs to. Turn -1 is the
 *  opening line: it is on before the first press, like the baseline blocks it
 *  describes. */
export const LINES = [
  { ...OPENING_LINE, turn: -1 },
  ...TURNS.flatMap((t, i) => t.lines.map((l) => ({ ...l, turn: i }))),
];

/**
 * The frame is NOT a context-window limit (grilling round 3, option b). It is
 * a drawing area, and its bottom edge fades out to say "there is an edge, but
 * not here". So the fill target is chosen for legibility: the last turn reaches
 * 75% of the frame and leaves visible headroom. Never print it, and never let a
 * delegate read the frame as a capacity.
 */
export const FILL_AT_END = 0.75;

/**
 * EVERY block is readable, not just the big one (Atil, 2026-08-27). A user turn
 * is thirty tokens against a document of twelve thousand, so at true proportion
 * ten of the eleven blocks are hairlines and their labels do not fit.
 *
 * THE PRICE, and know it before you raise these: with a floor this generous the
 * bar is no longer an area chart. The document stays the tallest block by a
 * wide margin, but it no longer takes three quarters of the fill. The slide's
 * argument now rides on the bracket and the labels — "all of this, again" — and
 * the notes say the size out loud instead of drawing it.
 *
 * The floor SCALES WITH THE FRAME. A fixed 24px is right on a 500px stage and
 * ruinous on a 380px one, where ten fixed floors leave the document 45px and
 * the bar stops making its point. `RELAXED_FLOOR_PX` is the floor we want; the
 * frame gets less when it cannot afford it.
 */
export const RELAXED_FLOOR_PX = 24;

/** Frame height per pixel of floor. 21 keeps ten small blocks under half the
 *  fill at every frame the deck runs on. */
const FLOOR_DIVISOR = 21;

/** One floor for every kind. The document carried 1.8 while its label stacked
 *  a size line under the name; the size is gone, so its label is one line like
 *  every other. The map stays per-kind so one kind can diverge again. */
export const FLOOR_WEIGHT: Record<BlockKind, number> = {
  harness: 1,
  instructions: 1,
  user: 1,
  assistant: 1,
  document: 1,
};

/**
 * Block heights in pixels, solved for the frame in front of us.
 *
 * A plain proportion does NOT work here. Every block but the document falls
 * under its floor, so the floors alone add well over two hundred pixels —
 * scaling naively put the last turn at 92% of the frame and ate the headroom
 * that the fading bottom edge exists to show. So solve the real thing:
 *
 *     find k where  Σ max(k × tokens, floor)  =  FILL_AT_END × frameH
 *
 * The sum rises with k and never falls, so a bisection lands on k. Sizing from
 * the live frame also makes the slide correct on any projector, which a fixed
 * scale never was.
 *
 * Returns the height function, not the scale, so a caller cannot size a block
 * against one frame and a floor against another.
 */
export function segSizer(frameH: number) {
  const floorOf = (kind: BlockKind) =>
    Math.min(RELAXED_FLOOR_PX, frameH / FLOOR_DIVISOR) * (FLOOR_WEIGHT[kind] ?? 1);
  const target = FILL_AT_END * frameH;
  const all = STRATA.map((b) => ({ tokens: b.tokens, floor: floorOf(b.kind) }));
  const total = (k: number) =>
    all.reduce((n, b) => n + Math.max(k * b.tokens, b.floor), 0);

  let k: number;
  const hi0 = target / Math.max(...all.map((b) => b.tokens));
  if (total(hi0) <= target) {
    k = hi0; // frame tall enough that no floor bites
  } else {
    let lo = 0;
    let hi = hi0;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (total(mid) < target) lo = mid;
      else hi = mid;
    }
    k = (lo + hi) / 2;
  }

  // WHOLE PIXELS. Every block edge, every label and the hairline sit on a
  // device pixel, so nothing in the bar is antialiased against a half pixel
  // once reveal scales the slide.
  return (tokens: number, kind: BlockKind) =>
    Math.round(Math.max(k * tokens, floorOf(kind)));
}
