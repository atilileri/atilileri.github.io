/**
 * The stochastic Widget — Chapter 2's `data-stoch` Slide (#114, spec #106,
 * ADR 0002).
 *
 * Four answers to one question arrive in a centred pile and fold ONCE into
 * two lanes: the grounded ones on the left, the hallucinated ones on the
 * right. The fold is the Slide's whole argument — the model ranked all four
 * as plausible — so it is a measured transform and never a layout swap, which
 * would be a hard cut. See `layout` below and the note in `theme-asml.css`.
 *
 * The Slide's data — the trace, the prompt, the four answers, their ranks —
 * lives beside this file in `stochastic.ts`. Read that header before changing
 * what the room reads.
 *
 * THIS WIDGET READS A FLAG, NOT A COUNT. It declares no `fragSel`, because
 * there is no Fragment row here to count: one Fragment, `.stoch-fold`, sits on
 * the Slide and the Widget draws one of two states from whether it is
 * `.visible`. The registry therefore hands it `shown === 0`, which it ignores
 * by not declaring the parameter at all. See `countShown` in `deck-widgets.ts`
 * for why zero rather than a whole-Slide count.
 *
 * `enter` BUILDS, `sync` FRAMES. The build is one-time — guarded by
 * `data-built` on the Slide, exactly as the inline code guarded it — and the
 * frame is derived from the Fragment on every arrival and every arrow press.
 * That is what makes stepping backward onto this Slide land on the folded
 * state rather than replaying the fold, and what makes `sync` idempotent.
 */

import type { Widget } from "./deck-widgets";
import { el, q } from "./dom";
import * as STOCH from "./stochastic";

/** The Slide attribute this Widget answers to. */
const ATTR = "data-stoch";

/**
 * The Fragment that folds the pile into lanes. One element, read as a flag —
 * this Widget's whole state is whether it is `.visible`.
 */
const FOLD = ".stoch-fold";

/**
 * Write the Slide's text and build the four answer cards. Runs once.
 *
 * The lookups throw if the Slide is missing an element, per ADR 0002: these
 * selectors name markup the Slide ALWAYS carries, so a miss is a broken Slide
 * rather than a state to paint around.
 */
function build(slide: HTMLElement): void {
  if (slide.dataset.built === "1") return;
  const set = (sel: string, txt: string) => {
    q(slide, sel).textContent = txt;
  };
  set("[data-stoch-eyebrow]", STOCH.TEXT.eyebrow);
  set("[data-stoch-headline]", STOCH.TEXT.headline);
  set("[data-stoch-dek]", STOCH.TEXT.dek);
  set("[data-stoch-close-line]", STOCH.TEXT.closeLine);
  set("[data-stoch-q]", '"' + STOCH.PROMPT + '"');

  // The trace, with the frame the faithfulness answer contradicts wrapped so
  // it can light up on the fold. It must NOT be marked up front — that would
  // tell the room which answer to distrust.
  const t = q(slide, "[data-stoch-trace]");
  t.textContent = "";
  STOCH.TRACE.forEach((ln, i) => {
    if (i) t.append(document.createTextNode("\n"));
    const hit = "manifest.ts:42";
    if (ln.includes(hit)) {
      const [pre, post] = ln.split(hit);
      t.append(document.createTextNode(pre));
      t.append(el("b", undefined, hit));
      t.append(document.createTextNode(post));
    } else t.append(document.createTextNode(ln));
  });

  const heads = q(slide, "[data-stoch-lane-heads]");
  heads.textContent = "";
  heads.append(el("span", undefined, STOCH.TEXT.lanes.legit));
  heads.append(el("span", "bad", STOCH.TEXT.lanes.halluc));

  const wrap = q(slide, "[data-stoch-sorted]");
  wrap.textContent = "";
  STOCH.ANSWERS.forEach((a, i) => {
    const bad = a.kind !== "legit";
    const card = el("div", "card" + (bad ? " bad" : ""));
    card.dataset.bad = bad ? "1" : "";
    // One slot, two occupants that never coexist: the rank bar while the four
    // are a pile, the category once they are sorted.
    const slot = el("div", "slot");
    const bar = el("span", "bar");
    const fill = el("i");
    fill.style.setProperty("--r", Math.round(STOCH.RANK[i] * 100) + "%");
    bar.append(fill);
    slot.append(bar, el("span", "tag", STOCH.KINDS[a.kind]));
    card.append(slot);
    card.append(el("p", undefined, a.text));
    card.append(el("span", "tell", a.tell));
    card.style.transitionDelay = i * 80 + "ms";
    wrap.append(card);
  });
  slide.dataset.built = "1";
  // Measures itself, so it must run after the browser has laid the cards out
  // — one frame later, not in this tick.
  requestAnimationFrame(() => layout(slide));
}

/**
 * The fold is the Slide's whole argument, so it cannot be a grid-column swap
 * — that is a hard cut. Every card is half-width and absolutely placed from
 * the start; this measures both states and writes them as CSS vars, so a
 * single transform transition carries a centred pile into two packed lanes.
 *
 * TWO measurements, because the states are different heights: the pile with
 * the tells collapsed (they don't exist on that frame) and the lanes with
 * them expanded, so an opening tell can never overlap the card beneath it.
 * Absolutely placed cards cannot push each other.
 */
function layout(slide: HTMLElement): void {
  const wrap = q(slide, "[data-stoch-sorted]");
  const cards = [...wrap.querySelectorAll<HTMLElement>(".card")];
  // Genuinely optional: `build` fills this row, and `layout` is scheduled a
  // frame later, so nothing to measure is a real state rather than a broken
  // Slide.
  if (!cards.length) return;
  const half = wrap.clientWidth / 2 + 11; // lane width + the gutter

  const measure = (expanded: boolean) => {
    if (expanded) slide.classList.add("is-measuring");
    const h = cards.map((c) => c.offsetHeight);
    slide.classList.remove("is-measuring");
    return h;
  };
  const hPile = measure(false);
  const hLane = measure(true);

  // The pile is tighter than the lanes: the stacked cards have to clear the
  // bottom edge at 900, and there is nothing between them to read anyway.
  const gapPile = 7;
  const gapLane = 16;
  let pile = 0;
  const lane = [0, 0];
  cards.forEach((c, i) => {
    c.style.setProperty("--x0", half / 2 + "px");
    c.style.setProperty("--y0", pile + "px");
    pile += hPile[i] + gapPile;
    // Grounded left, hallucinated right, each packed from the top so neither
    // lane carries a hole where the other has a card.
    const l = c.dataset.bad ? 1 : 0;
    c.style.setProperty("--x1", (l ? half : 0) + "px");
    c.style.setProperty("--y1", lane[l] + "px");
    lane[l] += hLane[i] + gapLane;
  });
  wrap.style.setProperty("--h0", pile - gapPile + "px");
  wrap.style.setProperty("--h1", Math.max(lane[0], lane[1]) - gapLane + "px");
}

/**
 * The stochastic Widget: four plausible answers, one of which is true.
 */
export const stochasticWidget: Widget = {
  attr: ATTR,

  /** Build once, then let `sync` pick the frame. */
  enter(slide: HTMLElement): void {
    build(slide);
  },

  /**
   * Derive the frame from reveal's Fragment state — never from a counter.
   *
   * `shown` is not declared: this Widget has no Fragment row, so the registry
   * would hand it 0 in every state.
   */
  sync(slide: HTMLElement): void {
    // The answers are present from the moment the Slide opens; `is-in` only
    // arms the entry stagger and is not a frame.
    slide.classList.add("is-in");
    slide.classList.toggle(
      "is-sorted",
      slide.querySelectorAll(`${FOLD}.visible`).length >= 1,
    );
  },
};
