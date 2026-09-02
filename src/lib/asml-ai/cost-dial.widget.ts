/**
 * The cost dial Widget — Chapter 3, the `data-cost-dial` Slide (#117, spec
 * #106, ADR 0002).
 *
 * The bill table: twelve rates and three token counts in one grid, with three
 * knobs the Presenter drags live. Dragging any knob repaints every model's AIC
 * cost, its euro cost and its multiple against the cheapest — all at once, in
 * front of the room. THAT SIMULTANEITY IS THE ARGUMENT: the token count is
 * shared across the models, so the knob cells span all four rows. Never render
 * a knob per row.
 *
 * The knobs are pointer-only by design (#25 round 3): no tab stop and no key
 * handling, so reveal keeps every arrow and the clicker never fights a focused
 * control. A keyboard reader gets the table at its arrival state, which is a
 * complete Slide on its own.
 *
 * THIS WIDGET DECLARES `init` AND `enter`, AND THE SPLIT IS THE POINT.
 *
 *   - `init` builds the table's rows and binds the listeners the room drives
 *     directly — the pointer drags on the knobs, the click that lights a model
 *     row. Those happen once, and they are the reason this Widget is one of
 *     the two heavy users of `init`.
 *   - `enter` resets the knobs to their preset and counts the money up from
 *     zero. It is `enter` and not `sync` because it is a REPLAY: it must run
 *     on every arrival and must NOT run when the room presses an arrow, or a
 *     Presenter stepping within the Slide to answer a question would watch
 *     their own dragged knobs snap back.
 *
 * NO TEARDOWN MEMBER, AND THIS WIDGET HOLDS A TIMER. The 900 ms glow that
 * marks the knob under the hand clears itself, and the next arrival on this
 * Slide cancels whatever is pending. ADR 0002 records why a `leave` member is
 * not added until a Widget needs teardown that arrival cannot do.
 */

import type { Widget } from "./deck-widgets";
import { slidesWith } from "./dom";
import {
  MODELS as RATES,
  eurDecimals,
  eurOfAic,
  fmtAicWhole,
  fmtEur,
  fmtInt,
} from "./rates";

/** The Slide attribute this Widget answers to. */
const ATTR = "data-cost-dial";

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Where each animated figure currently stands, so a ramp starts from what the
 * room is looking at rather than from zero. Keyed by element, so a row that is
 * never re-rendered is never held here.
 */
const countShown = new WeakMap<HTMLElement, number>();

/** Count a number into place. Formatter is fixed by the caller so the
    decimal width can't change mid-animation. */
function countUp(
  el: HTMLElement,
  target: number,
  fmt: (n: number) => string,
  dur = 420,
) {
  const from = countShown.get(el) ?? 0;
  countShown.set(el, target);
  if (reducedMotion()) {
    el.textContent = fmt(target);
    return;
  }
  const t0 = performance.now();
  const step = (t: number) => {
    const p = Math.min(1, (t - t0) / dur);
    el.textContent = fmt(from + (target - from) * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

type DialKey = "input" | "cached" | "output";
const DIAL_KEYS: DialKey[] = ["input", "cached", "output"];
const DIAL_MAX: Record<DialKey, number> = {
  input: 400_000,
  cached: 2_000_000,
  output: 200_000,
};
// An afternoon of agent work, not one prompt (#25). Cached is the biggest pile
// on screen on purpose: it's the chapter's thesis, visible before a word is
// said. Every knob arrives near half travel so the room can push it either
// way. Costs on arrival: EUR 0.37 / 1.85 / 2.00 / 3.33.
const DIAL_PRESET: Record<DialKey, number> = {
  input: 200_000,
  cached: 1_200_000,
  output: 80_000,
};

/** Where the knobs stand right now. Reset to the preset on every arrival. */
const dial = { ...DIAL_PRESET };

/** Which row the presenter is holding the room on. -1 is none. */
let dialLit = -1;

/** The pending clear of the knob glow, so a second drag cancels the first. */
let dialLitTimer = 0;

function paintBillLit(slide: HTMLElement) {
  const host = slide.querySelector<HTMLElement>("[data-bill-table]");
  host?.classList.toggle("has-lit", dialLit >= 0);
  host?.querySelectorAll<HTMLElement>("[data-bill-row]").forEach((tr) => {
    tr.classList.toggle("is-lit", Number(tr.dataset.billRow) === dialLit);
  });
}

/** AIC for one model at the current knob mix. */
const billAic = (m: (typeof RATES)[number]) =>
  (dial.input * m.input + dial.cached * m.cached + dial.output * m.output) / 1e6;

/** "1×", "9×" — trailing .0 dropped so the cheapest reads as a clean 1. */
const fmtMult = (n: number) => n.toFixed(1).replace(/\.0$/, "") + "×";

/**
 * Repaint every live figure. `touched` names the knob the hand is on, so its
 * track and its term in the formula row glow for a moment.
 *
 * `animate` is off during a drag: the numbers stay glued to the hand, which is
 * the coupling that teaches. It's on once, on Slide entry, where the money
 * climbs into place from zero.
 *
 * Every `!` below asserts an element this module wrote into the table itself,
 * a few lines up in `buildRows` — it is a statement about this module's own
 * output, not a guess about the Slide's markup.
 */
function renderDial(slide: HTMLElement, touched?: DialKey, animate = false) {
  const costs = RATES.map(billAic);
  const cheapest = Math.min(...costs);

  slide.querySelectorAll<HTMLElement>("[data-knob]").forEach((el) => {
    const key = el.dataset.knob as DialKey;
    const frac = dial[key] / DIAL_MAX[key];
    el.querySelector<HTMLElement>("[data-knob-fill]")!.style.height =
      `${frac * 100}%`;
    el.querySelector<HTMLElement>("[data-knob-val]")!.textContent = fmtInt(dial[key]);
    el.toggleAttribute("data-hot", touched === key);
  });
  slide.querySelectorAll<HTMLElement>("[data-term]").forEach((el) => {
    el.classList.toggle("lit", (el.dataset.term as DialKey) === touched);
  });

  slide.querySelectorAll<HTMLElement>("[data-bill-row]").forEach((tr, i) => {
    const aic = costs[i];
    const eur = eurOfAic(aic);
    const dp = eurDecimals(eur);
    const aicEl = tr.querySelector<HTMLElement>("[data-row-aic]")!;
    const eurEl = tr.querySelector<HTMLElement>("[data-row-eur]")!;
    if (animate) {
      countUp(aicEl, aic, fmtAicWhole);
      countUp(eurEl, eur, (n) => fmtEur(n, dp));
    } else {
      countShown.set(aicEl, aic);
      countShown.set(eurEl, eur);
      aicEl.textContent = fmtAicWhole(aic);
      eurEl.textContent = fmtEur(eur, dp);
    }
    // Every knob at zero makes every model free and the ratio undefined — show
    // nothing rather than a made-up 1×.
    tr.querySelector<HTMLElement>("[data-row-mult]")!.textContent =
      cheapest > 0 ? fmtMult(aic / cheapest) : "";
  });

  window.clearTimeout(dialLitTimer);
  dialLitTimer = window.setTimeout(() => {
    slide.querySelectorAll(".bt-formula .lit").forEach((e) => e.classList.remove("lit"));
    slide.querySelectorAll("[data-knob]").forEach((e) => e.removeAttribute("data-hot"));
  }, 900);
}

/**
 * Build the twelve rows and the three knob cells.
 *
 * One knob cell per group, written into the FIRST row with `rowspan`.
 */
function buildRows(slide: HTMLElement) {
  const billRows = slide.querySelector<HTMLElement>("[data-bill-rows]");
  if (!billRows) return;
  const knobCell = (k: DialKey) =>
    `<td class="bt-knob" rowspan="${RATES.length}">` +
    `<div class="bk" data-knob="${k}">` +
    `<div class="bk-track"><div class="bk-fill" data-knob-fill></div></div>` +
    `<b class="bk-val" data-knob-val>0</b>` +
    `<span class="bk-lab">tokens</span></div></td>`;
  billRows.innerHTML = RATES.map((m, i) => {
    const rate = (k: DialKey) =>
      `<td class="bt-rate">${fmtInt(m[k])}</td>` + (i === 0 ? knobCell(k) : "");
    return (
      `<tr data-bill-row="${i}">` +
      `<td class="bt-model">${m.name}</td>` +
      DIAL_KEYS.map(rate).join("") +
      `<td class="bt-aic" data-row-aic>0</td>` +
      `<td class="bt-eur" data-row-eur>&euro;0.00</td>` +
      `<td class="bt-mult" data-row-mult></td>` +
      `</tr>`
    );
  }).join("");
}

/**
 * The cost dial Widget: built and wired once, replayed on every arrival.
 */
export const costDialWidget: Widget = {
  attr: ATTR,

  init(): void {
    // One Slide carries the attribute today, and `slidesWith` returns a list
    // because a Slide attribute is markup and nothing stops a second one. The
    // knob values are one shared object, so a second Slide would need a state
    // per Slide before it could be wired here.
    const slide = slidesWith(ATTR)[0];
    if (!slide) return;

    buildRows(slide);

    // Clicking a row lifts it and nothing else — the arithmetic is already on
    // screen four times over. It exists so the presenter's "start on Flash,
    // then reach for Opus" has something to click.
    slide.querySelectorAll<HTMLElement>("[data-bill-row]").forEach((tr) => {
      tr.addEventListener("click", () => {
        const i = Number(tr.dataset.billRow);
        dialLit = dialLit === i ? -1 : i;
        paintBillLit(slide);
      });
    });

    slide.querySelectorAll<HTMLElement>("[data-knob]").forEach((el) => {
      const key = el.dataset.knob as DialKey;
      const step = DIAL_MAX[key] / 100;
      let dragging = false;
      let startY = 0;
      let startV = 0;
      el.addEventListener("pointerdown", (e) => {
        dragging = true;
        startY = e.clientY;
        startV = dial[key];
        el.setPointerCapture(e.pointerId);
        e.stopPropagation();
      });
      el.addEventListener("pointermove", (e) => {
        if (!dragging) return;
        const delta = ((startY - e.clientY) / 220) * DIAL_MAX[key];
        dial[key] = Math.max(
          0,
          Math.min(DIAL_MAX[key], Math.round((startV + delta) / step) * step),
        );
        renderDial(slide, key);
      });
      el.addEventListener("pointerup", () => (dragging = false));
      el.addEventListener("pointercancel", () => (dragging = false));
      // A drag that starts on a track must not also count as a row click.
      el.addEventListener("click", (e) => e.stopPropagation());
    });
  },

  enter(slide: HTMLElement): void {
    Object.assign(dial, DIAL_PRESET);
    dialLit = -1;
    paintBillLit(slide);
    slide
      .querySelectorAll<HTMLElement>("[data-row-aic],[data-row-eur]")
      .forEach((el) => countShown.set(el, 0));
    renderDial(slide, undefined, true);
  },
};
