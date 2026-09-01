/**
 * The chapter-5 step Widget — the four `data-ch5-step` picture Slides (#113,
 * spec #106, ADR 0002).
 *
 * `questions`, `slices`, `implement` and `review` each draw a picture that
 * CHANGES ON EVERY PRESS, and none of them needs data: the whole difference is
 * which state the CSS is in. So one Widget serves all four — it writes how
 * many of the Slide's own Fragments are shown to `data-step`, and every
 * picture rule in the theme keys off that number.
 *
 * WHY INVISIBLE COUNTERS RATHER THAN FRAGMENTS ON THE PICTURE ITSELF: a
 * picture state is rarely "one more element appears" — the test bar TURNS, the
 * holes FILL, the hourglass NARROWS. Those are transitions between states, and
 * a state is far easier to write as one CSS rule per step than as a pile of
 * elements that fade over each other.
 *
 * THIS IS THE THINNEST WIDGET IN THE DECK, and deliberately so: it paints
 * nothing. It moves one number from reveal's Fragment state onto the Slide,
 * and the theme does the rest. It holds NO state of its own, so ← walks every
 * picture back exactly and `sync` is idempotent.
 *
 * ONE WIDGET, FOUR SLIDES. `attr` is a Slide attribute, not a Slide, and the
 * registry calls this Widget on whichever of the four the room is standing on.
 * That is why the Fragment row is named by a selector rather than a handle:
 * there are four rows, one per Slide, and the row that counts is the one
 * inside the Slide the registry hands over.
 */

import type { Widget } from "./deck-widgets";

/** The Slide attribute this Widget answers to. */
const ATTR = "data-ch5-step";

/**
 * The chapter-5 step Widget: the step number, on the Slide, for the CSS.
 */
export const ch5StepWidget: Widget = {
  attr: ATTR,

  /**
   * Each of the four Slides carries its own row of invisible counters. This
   * is NOT the row the first three migrated Widgets count — those name a row
   * per Widget, this one names a row shape shared by four Slides — which is
   * the point of counting through `fragSel` rather than through one selector
   * the registry owns.
   */
  fragSel: "[data-ch5-step-row]",

  sync(slide: HTMLElement, shown: number): void {
    slide.dataset.step = String(shown);
  },
};
