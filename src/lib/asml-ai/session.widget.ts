/**
 * The session Widget — Chapter 2, the `data-session` Slide (#112, spec #106,
 * ADR 0002).
 *
 * Three turns, three presses. A bar of stacked blocks stands beside the
 * transcript that produced them; a bracket spans everything sent on this turn,
 * which is everything above the fill line. The Slide's argument is that the
 * bracket never shrinks: the chat has no memory, the transcript IS the memory,
 * so every turn sends all of it again.
 *
 * The bar starts PRE-FILLED with the harness baseline — those blocks carry
 * `.base` and are never switched off, because the session is part full before
 * anyone types, which is half the lesson.
 *
 * The turn is DERIVED from `shown`, never counted up: `shown` of 0 is rest, at
 * which no Turn has happened and the bracket is absent, and 1-3 are the three
 * turns. There is NO other state — the sweep that once ran over the bar on a
 * forward press is gone (Atil, 2026-08-27), and with it the last-painted-turn
 * bookkeeping it needed. That is what makes stepping back and re-entering land
 * on the same picture, and what makes `sync` idempotent.
 *
 * The blocks and the transcript are server-rendered from `session.ts`; their
 * HEIGHTS are not, because they are solved against the frame the projector
 * actually gives us. Read `segSizer`'s header there before changing any of the
 * sizing below.
 *
 * This is the first Widget with an `init`. The bracket is a pixel height, so a
 * resized window — or a projector at a different aspect — has to RE-MEASURE
 * it rather than let reveal rescale it.
 */

import type { Widget } from "./deck-widgets";
import { countFragments, q, slidesWith } from "./dom";
import {
  segSizer,
  TOTAL_TOKENS,
  TURN_COUNT,
  type BlockKind,
} from "./session";

/**
 * This Widget's Fragment row: one Fragment per Turn.
 *
 * It is a const here, where the other migrated Widgets write their `fragSel`
 * inline, because this one has a SECOND reader: the resize handler is not a
 * reveal event, so it is handed no `shown` and counts the row itself.
 */
/** The Slide attribute this Widget answers to. Named once, used twice. */
const ATTR = "data-session";

const FRAG_ROW = "[data-se-frag-row]";

/** How long to wait for a resize to stop before re-measuring. */
const RESIZE_SETTLE_MS = 150;

/**
 * The figure the Slide's whole argument rests on: the pasted document has to
 * stay the great majority of what is on screen. A dev-only sanity net, so a
 * drift in the model behind the Slide is noticed at the desk and not in the
 * room.
 */
const EXPECTED_TOTAL_TOKENS = 16425;

/** The Slide is built around three presses. */
const EXPECTED_TURNS = 3;

/**
 * Paint the bar, the bracket and the transcript for `turn`, where -1 is rest.
 *
 * Everything here is solved in pixels against THIS frame, so the pixel floor
 * under the small blocks is part of the sum rather than an error added on top
 * of it — and the floor itself shrinks on a short frame, so the document never
 * collapses to the height of a one-line turn. See `segSizer()` in `session.ts`.
 */
function paint(slide: HTMLElement, turn: number): void {
  slide.querySelectorAll<HTMLElement>("[data-se-row]").forEach((row) => {
    row.classList.toggle("is-on", Number(row.dataset.seRow) <= turn);
  });

  const col = q(slide, "[data-se-column]");
  const sizeOf = segSizer(col.clientHeight);
  /** One segment's height in this frame, from the numbers the markup carries. */
  const heightOf = (seg: HTMLElement) =>
    sizeOf(Number(seg.dataset.seSegTokens), seg.dataset.seSegKind as BlockKind);

  const segs = [...col.querySelectorAll<HTMLElement>("[data-se-seg]")];
  let fill = 0;
  segs.forEach((seg) => {
    // Baseline segments carry .base and are never switched off — the session
    // is part full before anyone types, which is half the lesson.
    const on =
      seg.classList.contains("base") || Number(seg.dataset.seSegTurn) <= turn;
    const h = heightOf(seg);
    seg.classList.toggle("is-on", on);
    seg.style.height = on ? `${h}px` : "0px";
    if (on) fill += h;
  });

  // Both of these are the SAME sum the loop just made, so the bracket cannot
  // drift from the fill and the hairline cannot drift from the top of the
  // conversation — no reading of a layout mid-transition.
  const hair = q(slide, "[data-se-hairline]");
  const base = segs
    .slice(0, Number(hair.dataset.seBaseline))
    .reduce((n, sg) => n + heightOf(sg), 0);
  hair.style.top = `${Math.round(base)}px`;

  const bracket = q(slide, "[data-se-bracket]");
  // At rest (turn -1) no Turn has happened, so the bracket is absent — the bar
  // is pre-filled, but nothing has been SENT yet.
  bracket.classList.toggle("is-on", turn >= 0);
  bracket.style.height = `${Math.round(fill)}px`;
}

/**
 * The session Widget: everything, every turn.
 */
export const sessionWidget: Widget = {
  attr: ATTR,
  fragSel: FRAG_ROW,

  init(): void {
    // The bracket is a pixel height, so a resized window (or a projector at a
    // different aspect) has to re-measure it, not just rescale it.
    let resizeTimer = 0;
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        slidesWith(ATTR).forEach((slide) =>
          paint(slide, countFragments(slide, FRAG_ROW) - 1),
        );
      }, RESIZE_SETTLE_MS);
    });

    if (import.meta.env.DEV && TOTAL_TOKENS !== EXPECTED_TOTAL_TOKENS)
      console.warn("session model drifted — re-check the document's share");
    if (import.meta.env.DEV && TURN_COUNT !== EXPECTED_TURNS)
      console.warn("session turn count drifted from the slide three presses");
  },

  sync(slide: HTMLElement, shown: number): void {
    // `shown` of 0 is rest: the bar is pre-filled, but no Turn has been sent.
    paint(slide, shown - 1);
  },
};
