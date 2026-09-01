/**
 * The Widget contract and the registry that mounts it. Spec #106, ADR 0002.
 *
 * A Widget is the interactive part of one Slide. Today reveal.js reaches the
 * Deck's sixteen Widgets through two long chains of `if` in the Deck's inline
 * `<script>` — one that runs when the room arrives on a Slide, one that runs
 * when the room presses an arrow — and nothing makes the two chains agree
 * about a Widget. This module replaces both chains with a registry: a Widget
 * declares the Slide attribute it answers to and what it does on arrival and
 * on an arrow press, in one place, and cannot be wired to one event and
 * forgotten on the other.
 *
 * This is the expand half of an expand–contract refactor. Both `if` chains are
 * still alive and still own every Widget that has not moved, so the Deck is
 * presentable at every commit. Widgets join the registry one ticket at a time,
 * each migration commit deleting exactly the branches it replaces, and the
 * chains are deleted once the registry holds all sixteen.
 *
 * The reveal.js event names live here, beside the contract that reads them,
 * so the rule "arrival calls `enter`, arrow press calls `sync`" has exactly
 * one home.
 *
 * WRITING A WIDGET MODULE — three rules the migration tickets must keep.
 *
 * 1. Import the contract as `import type { Widget }`. This module imports the
 *    Widget and the Widget imports the contract, so the two point at each
 *    other. A type import erases at build, which is the only reason the cycle
 *    is harmless. One value import back to this module makes it a real cycle.
 *
 * 2. A helper that a second Widget needs goes to `./dom.ts`. Promote it there
 *    the moment the second caller appears — never copy it. The Deck's element
 *    lookup `q` is the one every Widget wants, and six copies of it is the
 *    duplication this whole refactor exists to remove; it made the move on
 *    its second caller and lives in `./dom.ts` now.
 *
 * 3. A migration commit records the walk in its body: whether the 67 states
 *    passed, and that no golden was updated. That is the only evidence the
 *    move changed nothing the room can see.
 *
 * A throw inside a Widget stops the Widgets after it on that Slide. That is
 * what the `if` chains do today, so the registry keeps it. Guarding the mount
 * loop would be an improvement, and an improvement is a behaviour change; it
 * belongs in its own ticket, after the chains are gone.
 */

import { primitivesWidget } from "./primitives.widget";
import { smartZoneWidget } from "./smart-zone.widget";

/**
 * One Widget. Every member but `attr` is optional — a Widget that only lands
 * on arrival declares two.
 */
export type Widget = {
  /** The Slide attribute this Widget answers to, e.g. "data-smartzone". */
  attr: string;
  /**
   * Selector for this Widget's Fragment row. The caller counts with it.
   *
   * It selects the ROW ELEMENT — `"[data-sz-frag-row]"` — not the Fragments
   * inside it. The caller finds the row within the Slide and counts the
   * visible Fragments in it.
   */
  fragSel?: string;
  /** Runs once at startup. One-time listeners and handle lookups. */
  init?: () => void;
  /** The room arrived. Replay Widgets restart here. */
  enter?: (slide: HTMLElement) => void;
  /** Arrival or arrow press. Derive everything from `shown`. Idempotent. */
  sync?: (slide: HTMLElement, shown: number) => void;
};

/**
 * The registry. Widgets are appended here as they move out of the two `if`
 * chains, smart zone first.
 */
export const WIDGETS: Widget[] = [primitivesWidget, smartZoneWidget];

/**
 * A reveal.js event payload, as much of one as this module reads. reveal ships
 * no types, so the two fields are named here and keep reveal's own names: an
 * arrival carries `currentSlide`, a Fragment event carries `fragment`.
 */
type RevealEvent = {
  currentSlide?: HTMLElement | null;
  fragment?: HTMLElement | null;
};

/**
 * The reveal.js instance, as much of it as this module uses. Named for reveal
 * and not for the Deck: the Deck is the whole presentation, this is the
 * library object that drives it.
 */
type RevealApi = {
  on: (type: string, listener: (event: RevealEvent) => void) => void;
};

/** Arrival on a Slide: reveal fires one of these, never both, for one arrival. */
const ARRIVAL_EVENTS = ["ready", "slidechanged"] as const;

/** An arrow press over a Fragment, in either direction. */
const FRAGMENT_EVENTS = ["fragmentshown", "fragmenthidden"] as const;

/**
 * How many of this Widget's own Fragments are visible on `slide`.
 *
 * NEVER a count of `.fragment.visible` across the whole Slide: a Slide holds
 * Fragments that belong to no Widget — a Closing line, a callout — so that
 * number would be wrong. The count is taken inside this Widget's own Fragment
 * row, named by `fragSel`.
 *
 * A Widget that declares no `fragSel` receives 0 and is expected to ignore it:
 * the three flag-reading Widgets read a `.visible` flag on one named element
 * of their own inside `sync`. 0 is passed rather than `undefined` so the
 * declared `sync` type stays honest at runtime, and rather than a whole-Slide
 * count, which would be a wrong number dressed as a right one.
 */
function countShown(widget: Widget, slide: HTMLElement): number {
  if (!widget.fragSel) return 0;
  const row = slide.querySelector(widget.fragSel);
  return row ? row.querySelectorAll(".fragment.visible").length : 0;
}

/** Every registered Widget whose Slide attribute `slide` carries. */
function widgetsOn(slide: HTMLElement): Widget[] {
  return WIDGETS.filter((w) => slide.hasAttribute(w.attr));
}

/**
 * Mount the registry against a reveal.js instance. Called once, from the
 * Deck's inline `<script>`, after `deck.initialize()`.
 *
 * - every `init` runs once, here, at mount;
 * - `enter` runs on arrival, and only on arrival, so the replay Widgets
 *   restart for the room and are not interrupted by an arrow press;
 * - `sync` runs on arrival AND on every arrow press, so entering a Slide from
 *   the left and entering it from the right land on the same picture.
 */
export function mountWidgets(deck: RevealApi): void {
  for (const widget of WIDGETS) widget.init?.();

  for (const type of ARRIVAL_EVENTS) {
    deck.on(type, (event) => {
      const slide = event?.currentSlide;
      if (!slide) return;
      for (const widget of widgetsOn(slide)) {
        widget.enter?.(slide);
        widget.sync?.(slide, countShown(widget, slide));
      }
    });
  }

  for (const type of FRAGMENT_EVENTS) {
    deck.on(type, (event) => {
      const slide = event?.fragment?.closest<HTMLElement>("section");
      if (!slide) return;
      for (const widget of widgetsOn(slide)) {
        widget.sync?.(slide, countShown(widget, slide));
      }
    });
  }
}
