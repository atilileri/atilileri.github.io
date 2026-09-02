/**
 * The hallucination-diagnosis Widget — chapter 2's `data-halluc` Slide
 * (#115, spec #106, ADR 0002).
 *
 * ONE fragment: the Slide has no Fragments, because arriving on it IS the
 * interaction. It is built once, painted once, and REPLAYED by the Deck's own
 * `.is-live` (`armHeadline` in `index.astro` drops the class from every
 * section, forces a reflow and re-adds it to the live Slide), exactly as the
 * rings Slide does.
 *
 * Do not put the replay on a timer or a rAF: an earlier version did, and it
 * ran the animation against reveal's Slide transition instead of after it, so
 * arrowing onto the Slide landed on a finished diagram and only a page load
 * ever showed it move.
 *
 * THIS WIDGET DECLARES `enter` AND NO `sync`. It lands whole on arrival and
 * has no Fragment state to derive, so it declares no `fragSel` either — the
 * contract used without touching Fragments at all. The replay is CSS, armed
 * by a class the Deck sets before this runs, so entering from either side
 * lands on the same picture.
 *
 * `armHeadline` still runs first. It is bound in `index.astro`'s own
 * `slidechanged`/`ready` handlers, which are registered BEFORE
 * `mountWidgets`, so reveal calls them before the registry — the same order
 * the two had when this Widget was a branch in the entry chain below
 * `armHeadline`.
 *
 * The Slide's data — the hinge question, the two branches, their causes and
 * fixes — lives beside this file in `halluc.ts`.
 */

import type { Widget } from "./deck-widgets";
import { el, q } from "./dom";
import * as HAL from "./halluc";

/** The Slide attribute this Widget answers to. */
const ATTR = "data-halluc";

/**
 * One branch block: the name, one sentence of cause, one of fix, and
 * the small-type pointer at the chapter that owns the fix.
 */
function halBranch(b: (typeof HAL.BRANCHES)[number]): HTMLElement {
  const box = el("div", "halluc-branch");
  box.dataset.branch = b.key;
  // The name alone. A condition line here would only repeat what the
  // No/Yes on the diagram already says.
  const k = el("span", "k");
  k.append(el("span", undefined, b.name));
  box.append(k);
  // A newline starts a new paragraph; `backticks` inside one mark the
  // term set apart from the prose.
  b.cause.split("\n").forEach((para) => {
    const p = el("p", "cause");
    para.split("`").forEach((part, i) => {
      p.append(i % 2 ? el("em", "term", part) : document.createTextNode(part));
    });
    box.append(p);
  });
  const fix = el("p", "fix");
  fix.append(el("span", undefined, b.fix));
  box.append(fix);
  if (b.forward) box.append(el("span", "fwd", b.forward));
  return box;
}

/**
 * Write the Slide's text, measure the edges and build the two branch blocks.
 * Runs once, guarded by `data-built` on the Slide.
 *
 * The lookups throw if the Slide is missing an element, per ADR 0002: all
 * eleven selectors name markup this Slide ALWAYS carries, so a miss is a
 * broken Slide rather than a state to paint around. The inline code guarded
 * each one with `if (n)` and painted around it in silence.
 */
function build(slide: HTMLElement): void {
  if (slide.dataset.built === "1") return;
  const set = (sel: string, txt: string) => {
    q(slide, sel).textContent = txt;
  };
  set("[data-halluc-eyebrow]", HAL.TEXT.eyebrow);
  set("[data-halluc-headline]", HAL.TEXT.headline);
  set("[data-halluc-close-line]", HAL.TEXT.closeLine);
  // The hinge is set on two lines in the SVG: it is the longest string
  // on the diagram and one line would set the viewBox's width.
  const cut = HAL.HINGE.lastIndexOf(" ", HAL.HINGE.length / 2 + 6);
  set("[data-fork-hinge-1]", HAL.HINGE.slice(0, cut));
  set("[data-fork-hinge-2]", HAL.HINGE.slice(cut + 1));
  // The nodes keep the BARE names — "hallucinations" is understood from
  // the root node three rows above, and would not fit anyway.
  set("[data-fork-name-1]", HAL.BRANCHES[0].key.toUpperCase());
  set("[data-fork-name-2]", HAL.BRANCHES[1].key.toUpperCase());
  set("[data-fork-route-1]", HAL.BRANCHES[0].edge);
  set("[data-fork-route-2]", HAL.BRANCHES[1].edge);
  set("[data-fork-fixed]", HAL.TEXT.fixed);

  // Dash length per edge, measured — hand-computed lengths drift the
  // moment a coordinate moves.
  slide.querySelectorAll<SVGPathElement>(".fork .edge").forEach((p) => {
    p.style.setProperty("--len", p.getTotalLength() + "px");
  });

  const wrap = q(slide, "[data-halluc-branches]");
  wrap.textContent = "";
  HAL.BRANCHES.forEach((b) => wrap.append(halBranch(b)));
  slide.dataset.built = "1";

  // Force a reflow before lighting anything, so the FIRST visit
  // animates too: without it the cards are created and lit inside one
  // task, the browser computes style once, and it lands straight on the
  // final values.
  void slide.offsetWidth;
  paint(slide);
}

/**
 * Paint the finished state once. The CSS holds it at the opening state
 * while the section is not `.is-live`, which is what makes every entry
 * replay without anything being scheduled here.
 */
function paint(slide: HTMLElement): void {
  slide.classList.add("is-done");
  slide
    .querySelectorAll<HTMLElement>(".halluc-branch")
    .forEach((n) => n.classList.add("is-lit", "is-fixed"));
  slide
    .querySelectorAll<SVGElement>(".fork .edge, .fork .head, .fork .g")
    .forEach((n) => n.classList.add("is-drawn"));
}

/**
 * The hallucination-diagnosis Widget: one question that splits hallucinations
 * into factuality and faithfulness, and sends each to the chapter that fixes
 * it.
 */
export const hallucWidget: Widget = {
  attr: ATTR,

  /**
   * The room arrived. Build the diagram, once; the replay is the Deck's
   * `.is-live` class and costs nothing here.
   *
   * There is no `sync` and no `fragSel`: the Slide carries no Fragments, so
   * there is no state to derive and nothing for an arrow press to change.
   */
  enter(slide: HTMLElement): void {
    build(slide);
  },
};
