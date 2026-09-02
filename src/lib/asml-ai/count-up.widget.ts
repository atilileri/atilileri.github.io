/**
 * The count-up Widget — Chapter 4, the `data-one-number` Slide (#116, spec
 * #106, ADR 0002).
 *
 * One figure ramps from 0 to its target over 900 ms every time the room
 * arrives on the Slide. The Slide's whole argument is that number — four in
 * ten benchmark tasks are too vaguely written to grade fairly — and a number
 * that is already sitting there when the Slide appears is read as furniture.
 * Counted up in front of the room, it lands.
 *
 * THIS IS WHY `enter` EXISTS AS A MEMBER SEPARATE FROM `sync`. The ramp must
 * restart on arrival and must NOT restart when the room presses an arrow: a
 * Presenter answering a question steps within the Slide, and re-running the
 * animation under them would be a distraction they did not ask for. A single
 * sync-shaped member could not tell the two apart. So this Widget declares
 * `enter` and nothing else — no `sync`, and no `fragSel`, because the figure
 * does not derive from Fragments.
 *
 * THE TARGET LIVES IN THE MARKUP, not here. `data-count-to` carries the
 * number and `data-count-suffix` carries whatever follows it, so the Slide's
 * own text and the figure it animates sit side by side in one file and cannot
 * drift apart. The suffix is empty on this Slide — a sibling `<span class="of">`
 * renders "in 10" — and the attribute is kept because it costs one line and it
 * is what lets a second count-up Slide say "%" without touching this module.
 *
 * NO TEARDOWN MEMBER. The ramp cancels its own predecessor on arrival and
 * stops itself at t = 1, so a frame is never left running against a Slide the
 * room has left. ADR 0002 records why a `leave` member is not added until a
 * Widget needs teardown that arrival cannot do.
 */

import type { Widget } from "./deck-widgets";
import { q } from "./dom";

/** The Slide attribute this Widget answers to. */
const ATTR = "data-one-number";

/** How long the ramp runs, in milliseconds. */
const DURATION = 900;

/**
 * The frame the ramp is waiting on, or `undefined` between ramps.
 *
 * Module scope, and one handle for the whole Widget rather than one per
 * Slide: `ATTR` marks a single Slide, and two ramps could only ever overlap
 * if the room could stand on two Slides at once. Arrival cancels whatever is
 * pending before it starts, so a Presenter walking back and forth over the
 * Slide never leaves two ramps writing to the same element.
 */
let frame: number | undefined;

/**
 * Ease-out cubic: fast at the start, and slow enough at the end that the room
 * reads the last few numbers rather than seeing them flick past.
 */
function eased(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * The count-up Widget: the one number, counted up in front of the room.
 */
export const countUpWidget: Widget = {
  attr: ATTR,

  enter(slide: HTMLElement): void {
    const figure = q(slide, "[data-count-to]");
    const to = Number(figure.getAttribute("data-count-to") ?? "0");
    const suffix = figure.getAttribute("data-count-suffix") ?? "";
    const start = performance.now();

    if (frame) cancelAnimationFrame(frame);

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      figure.textContent = String(Math.round(eased(t) * to)) + suffix;
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  },
};
