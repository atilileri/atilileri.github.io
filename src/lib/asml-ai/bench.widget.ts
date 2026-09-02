/**
 * The benchmark chart Widget — Chapter 3, the `data-bench` Slide (#117, spec
 * #106, ADR 0002).
 *
 * A hand-rolled SVG scatter of the DeepSWE v1.1 leaderboard: pass rate against
 * average cost per task, one mark per configuration, one direct callout per
 * model. No charting library, so the Deck's palette reaches inside the chart.
 * The ranked-bars view was cut (Atil, 2026-08-25) — the room only ever read
 * the scatter, and a toggle with one option is furniture.
 *
 * THIS WIDGET DECLARES ONLY `init`, AND THAT IS THE WHOLE POINT OF IT. It has
 * no branch in either dispatch chain and never had one: it draws once at
 * startup, before its Slide is ever seen, and after that the room drives it
 * with the pointer — a chip click filters a family, a hover raises the tip, a
 * resized window redraws. Nothing about it derives from arrival or from a
 * Fragment, so it declares neither `enter` nor `sync`.
 *
 * THE EAGER DRAW IS KEPT ON PURPOSE. Drawing on arrival would be tidier and
 * riskier: `fitPlot` measures the plot's own box, and measuring an element on
 * a Slide that reveal.js has scaled but not shown is the kind of thing that
 * works in a browser and fails on the room's projector. ADR 0002 rejects the
 * lazy version with reasons, so that it is not re-proposed. Change the timing
 * on its own, with the projector in front of you.
 *
 * THE LEADERBOARD IS NOT HERE. `Pt`, `Curve` and `CURVES` live in
 * `./curves.ts`, because Chapter 3's stop-point Slide reads the same array and
 * a Widget module may never import from another Widget's scope.
 */

import { CURVES, type Curve, type Pt } from "./curves";
import type { Widget } from "./deck-widgets";
import { q, slidesWith, svgEl } from "./dom";

/** The Slide attribute this Widget answers to. */
const ATTR = "data-bench";

/**
 * Fixed hue order, never cycled — validated for CVD separation on this light
 * surface (scripts/validate_palette.js, all six checks pass).
 */
const FAMS: { key: string; color: string }[] = [
  { key: "OpenAI", color: "#1a6fd4" },
  { key: "Anthropic", color: "#e0620d" },
  { key: "Google", color: "#0f8f6f" },
  { key: "Moonshot", color: "#8a4fd0" },
  { key: "Other", color: "#c2185b" },
];
const famColor = (f: string) =>
  FAMS.find((x) => x.key === f)?.color ?? "#c2185b";

/**
 * The chart's four elements, found once in `init`.
 *
 * They are held here rather than looked up per draw because the chip click,
 * the hover and the `resize` handler all reach for the same four, and because
 * `init` is the one place this Widget is handed a chance to find its Slide.
 * Undefined only before `init` has run, which no caller here can be.
 */
type Refs = { svg: Element; tip: HTMLElement; legend: HTMLElement; plot: HTMLElement };
let refs: Refs | undefined;

/** Empty = show every family; otherwise only the picked ones. */
const benchOn = new Set<string>();
const shown = (fam: string) => benchOn.size === 0 || benchOn.has(fam);

function showTip(cv: Curve, pt: Pt, ev: MouseEvent) {
  if (!refs) return;
  // One point is one configuration, so every figure in the tip belongs to that
  // configuration — the effort level included, under its own provider's name.
  refs.tip.innerHTML =
    `<b style="color:${famColor(cv.fam)}">${cv.name}</b>` +
    `<span class="e">${pt.eff.toLowerCase()}</span>` +
    `<span class="r">${pt.rate.toFixed(1)}%<i>±${pt.ci.toFixed(1)}</i></span>` +
    `<span class="k">avg cost<b>$${pt.cost.toFixed(2)}</b></span>` +
    `<span class="k">output<b>${pt.tok}</b></span>` +
    `<span class="k">steps<b>${pt.steps}</b></span>`;
  refs.tip.hidden = false;

  placeTip(refs.tip, refs.plot, ev);
}

// Reveal SCALES the whole deck with a CSS transform, so a client rect is in
// scaled pixels while `left`/`top` are in the plot's own unscaled ones. Mixing
// the two used to drift the tip further from the cursor the further right it
// went, and the old clamp guessed the tip was 210px wide. Convert once, then
// measure the tip instead of guessing: `offsetWidth` is already unscaled
// layout, the same units `left` is written in.
function placeTip(tip: HTMLElement, plot: HTMLElement, ev: MouseEvent) {
  const box = plot.getBoundingClientRect();
  const plotW = plot.offsetWidth;
  const plotH = plot.offsetHeight;
  const scale = box.width / plotW || 1;
  const x = (ev.clientX - box.left) / scale;
  const y = (ev.clientY - box.top) / scale;
  const tw = tip.offsetWidth;
  const th = tip.offsetHeight;

  // Right of the cursor by default; it flips to the left when it would run off
  // the plot, so the tip is always beside the point it explains and never off
  // the wall. The clamps catch the corner case where neither side fits.
  const GAP = 16;
  let left = x + GAP;
  if (left + tw > plotW) left = x - GAP - tw;
  left = Math.max(0, Math.min(left, plotW - tw));
  const top = Math.max(0, Math.min(y - 12, plotH - th));
  tip.style.left = left + "px";
  tip.style.top = top + "px";
}

function hideTip() {
  if (refs) refs.tip.hidden = true;
}

// Cost runs LEFT-to-RIGHT: $0 at the left edge, spend increasing rightward —
// the conventional reading, and the same direction as the stop-point slide
// that follows (Atil, 2026-08-02). "Cheap and good" is the top-LEFT corner,
// which is where the "most efficient" pointer sits.
// The cost axis is SQUARE-ROOT, not linear. Linear was right when the board's
// cheapest model cost $2; v1.1 has one at $0.01 and one at $26.40, so on a
// linear axis eleven of the eighteen models pile into the leftmost eighth of
// the plot and the callouts sit on top of each other. A root axis still starts
// at a true $0 and still reads left-to-right as "more money", it just gives
// the cheap end the room the argument needs. Ticks are uneven for the same
// reason, and they carry their real dollar values, so nothing on screen is
// mis-stated. The viewBox is shaped like the box the slide actually gives the
// chart — a wide, shallow band under the headline — so the SVG fills it edge
// to edge instead of letterboxing itself inside it. Everything below is in
// viewBox units, and the whole thing scales with the slide.
const VB = { w: 1400, h: 560 };
const PLOT = { T: 42, B: 486, L: 110, R: 1388 };
/** Re-shape the coordinate box to the box the slide is giving us, so the
    chart fills its space in BOTH directions without stretching its own type.
    Called before every draw; falls back to the 5:2 default when the element
    has no layout yet (first paint, hidden slide). */
function fitPlot() {
  const box = refs?.plot.getBoundingClientRect();
  if (!box || box.width < 40 || box.height < 40) return;
  VB.h = Math.max(380, Math.min(900, (VB.w * box.height) / box.width));
  // 74 units under the axis carry the cost ticks and the axis title.
  PLOT.B = Math.round(VB.h - 74);
}
const COST_MAX = 27;
const SCORE_MAX = 85; // headroom over the 80% tick for the top callouts
const CX = (c: number) =>
  PLOT.L + 58 + Math.sqrt(Math.max(c, 0) / COST_MAX) * (PLOT.R - PLOT.L - 78);
const CY = (s: number) => PLOT.B - (s / SCORE_MAX) * (PLOT.B - PLOT.T);
const COST_TICKS = [0, 0.5, 1, 2, 3, 5, 7.5, 10, 15, 20, 25];

// ── Direct labels, placed by the code, not by hand ─────────────
// Callout positions used to be a hand-tuned dx/dy per model. That solve only
// held for one exact transcription of the data, and the data moves every
// leaderboard revision, so it is now solved at draw time: try a ring of
// candidate slots around the labelled point, take the first one that hits
// nothing already placed. Curves are placed best-score first, so the models
// the room looks for keep the closest slots.
type Box = { x: number; y: number; w: number; h: number };
const hits = (a: Box, b: Box) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
// 12.5px display type, ~0.65em average advance, plus the effort line under the
// name. The box is padded on every side, so two callouts that "just miss"
// still end up in different slots — abutting labels read as one run-on word,
// which is the failure this padding exists to stop.
const PAD = 8;
const labelBox = (name: string, x: number, y: number, anchor: string): Box => {
  const w = name.length * 8.1;
  const x0 = anchor === "end" ? x - w : anchor === "middle" ? x - w / 2 : x;
  return { x: x0 - PAD, y: y - 14, w: w + PAD * 2, h: 30 };
};
const SLOTS: [number, number, string][] = [
  [13, 4, "start"], [-13, 4, "end"],
  [13, -13, "start"], [-13, -13, "end"],
  [13, 22, "start"], [-13, 22, "end"],
  [0, -22, "middle"], [0, 36, "middle"],
  [34, 4, "start"], [-34, 4, "end"],
  [34, -26, "start"], [-34, -26, "end"],
  [34, 34, "start"], [-34, 34, "end"],
  [60, 16, "start"], [-60, 16, "end"],
  [60, -34, "start"], [-60, -34, "end"],
  [86, 44, "start"], [-86, 44, "end"],
];
/** Pick the first free slot for one callout; fall back to the first. */
function placeLabel(cv: Curve, x: number, y: number, taken: Box[]) {
  for (const [dx, dy, anchor] of SLOTS) {
    const box = labelBox(cv.name, x + dx, y + dy, anchor);
    if (box.x < PLOT.L || box.x + box.w > PLOT.R) continue;
    if (box.y < PLOT.T - 20 || box.y + box.h > PLOT.B) continue;
    if (taken.some((t) => hits(box, t))) continue;
    taken.push(box);
    return { dx, dy, anchor, box };
  }
  const [dx, dy, anchor] = SLOTS[0];
  const box = labelBox(cv.name, x + dx, y + dy, anchor);
  taken.push(box);
  return { dx, dy, anchor, box };
}

function drawCurves() {
  if (!refs) return;
  const svg = refs.svg;
  const { T, B, L, R } = PLOT;
  for (let s = 0; s <= 80; s += 10) {
    svg.append(svgEl("line", { x1: L, x2: R, y1: CY(s), y2: CY(s), class: "grid" }));
    const t = svgEl("text", { x: L - 10, y: CY(s) + 4, class: "tick end" });
    t.textContent = s + "%";
    svg.append(t);
  }
  for (const c of COST_TICKS) {
    if (c) svg.append(svgEl("line", { x1: CX(c), x2: CX(c), y1: T, y2: B, class: "grid" }));
    const t = svgEl("text", { x: CX(c), y: B + 22, class: "tick mid" });
    t.textContent = "$" + c;
    svg.append(t);
  }
  svg.append(svgEl("line", { x1: L, x2: R, y1: B, y2: B, class: "axis" }));

  // THE CEILING (#33). One of the chart's two proofs — the other, the
  // stop-point, belongs to the next slide, so nothing here draws it.
  // Read off the data rather than typed in, so a re-transcription can never
  // leave the line under a point that now sits above it.
  const CEIL = Math.max(
    ...CURVES.flatMap((cv) => cv.pts.map((pt) => pt.rate)),
  );
  svg.append(
    svgEl("line", { x1: L, x2: R, y1: CY(CEIL), y2: CY(CEIL), class: "ceiling" }),
  );
  // Right-anchored: the top-LEFT band belongs to the "most efficient" pointer,
  // and two annotations in one corner read as clutter. The expensive end of
  // the ceiling is also the more damning place to say it.
  const ceilLbl = svgEl("text", { x: R - 8, y: CY(CEIL) - 12, class: "ceiling-lbl end" });
  ceilLbl.textContent = "nothing clears this";
  svg.append(ceilLbl);
  const xl = svgEl("text", { x: (L + R) / 2, y: B + 44, class: "axis-label mid" });
  xl.textContent = "avg cost per task (square-root axis)";
  // The score used to be named in a corner title, which read as a chart
  // heading rather than as the axis it labels. It now sits ON the axis,
  // rotated, opposite the cost title — so each axis says what it is and the
  // top-left corner belongs to the "most efficient" pointer alone.
  const yl = svgEl("text", {
    x: 26, y: (T + B) / 2, class: "axis-label mid",
    transform: `rotate(-90 26 ${(T + B) / 2})`,
  });
  yl.textContent = "DeepSWE score";
  // Cheap AND good is the top-LEFT corner, so the pointer sits there. It names
  // the quadrant the whole slide asks the room to look at, so it carries the
  // deck's accent rather than a whispered muted italic.
  const eff = svgEl("text", { x: L + 10, y: 50, class: "efficient" });
  eff.textContent = "↖ most efficient";
  svg.append(xl, yl, eff);

  // The ceiling label and the efficiency pointer are furniture the callouts
  // must not land on, so they seed the occupied list.
  const taken: Box[] = [
    { x: R - 170, y: CY(CEIL) - 28, w: 170, h: 24 },
    { x: L, y: 34, w: 200, h: 28 },
  ];
  // Best score first: the models the room hunts for get the tightest slots,
  // and the also-rans take the long leader lines.
  const order = [...CURVES].sort(
    (a, z) => z.pts[z.at].rate - a.pts[a.at].rate,
  );
  const marks = svgEl("g", {}) as SVGGElement;
  // Labels are painted OVER the marks, so without this they swallow the hover
  // of any point they cover — the callout for the dearest model sits right on
  // its own dot. They are annotation, not a target.
  const labels = svgEl("g", { "pointer-events": "none" }) as SVGGElement;

  for (const cv of order) {
    const on = shown(cv.fam);
    const g = svgEl("g", { class: "curve", opacity: on ? 1 : 0.12 }) as SVGGElement;
    const color = famColor(cv.fam);
    if (cv.pts.length > 1) {
      g.append(
        svgEl("path", {
          d: cv.pts
            .map((pt, i) => `${i ? "L" : "M"} ${CX(pt.cost)} ${CY(pt.rate)}`)
            .join(" "),
          fill: "none", stroke: color, "stroke-width": 2.5,
          "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0.75,
        }),
      );
    }
    cv.pts.forEach((pt, i) => {
      g.append(
        svgEl("circle", {
          cx: CX(pt.cost), cy: CY(pt.rate), r: i === cv.at ? 4.5 : 3.5,
          fill: color, class: "dot",
        }),
      );
    });
    // One generous hit target per point, over the top of the marks.
    if (on) {
      cv.pts.forEach((pt) => {
        const hit = svgEl("circle", {
          cx: CX(pt.cost), cy: CY(pt.rate), r: 11, fill: "transparent",
        });
        hit.addEventListener("mousemove", (ev) =>
          showTip(cv, pt, ev as MouseEvent),
        );
        hit.addEventListener("mouseleave", hideTip);
        g.append(hit);
      });
    }
    marks.append(g);

    const best = cv.pts[cv.at];
    const x = CX(best.cost), y = CY(best.rate);
    const { dx, dy, anchor } = placeLabel(cv, x, y, taken);
    const lg = svgEl("g", { opacity: on ? 1 : 0.12 }) as SVGGElement;
    lg.append(
      svgEl("line", {
        x1: x, y1: y,
        x2: x + dx - (anchor === "start" ? 3 : anchor === "end" ? -3 : 0),
        y2: y + dy - 4,
        stroke: color, "stroke-width": 1, opacity: 0.35,
      }),
    );
    const name = svgEl("text", {
      x: x + dx, y: y + dy, "text-anchor": anchor,
      fill: color, class: "curve-label",
    });
    name.textContent = cv.name;
    // The effort level under the name is the level of THAT point — the
    // provider's own word, so the room can type it into an API call.
    const e2 = svgEl("text", {
      x: x + dx, y: y + dy + 11, "text-anchor": anchor,
      fill: color, class: "curve-eff",
    });
    e2.textContent = best.eff;
    lg.append(name, e2);
    labels.append(lg);
  }
  // Labels last, so no curve is ever drawn over its own callout.
  svg.append(marks, labels);
}

function drawBench() {
  if (!refs) return;
  hideTip();
  refs.svg.textContent = "";
  fitPlot();
  refs.svg.setAttribute("viewBox", `0 0 ${VB.w} ${Math.round(VB.h)}`);
  drawCurves();
}

/**
 * The benchmark chart Widget: drawn once at startup, then driven by the
 * pointer alone.
 */
export const benchWidget: Widget = {
  attr: ATTR,

  init(): void {
    // One Slide carries the attribute today, and `slidesWith` returns a list
    // because a Slide attribute is markup and nothing stops a second one.
    // The chart holds one set of handles and one filter, so it draws on the
    // first and would need a per-Slide state to draw on more.
    const slide = slidesWith(ATTR)[0];
    if (!slide) return;

    const plot = q(slide, ".bench-plot");
    refs = {
      plot,
      svg: q(plot, "[data-bench-svg]"),
      tip: q(plot, "[data-bench-tip]"),
      legend: q(slide, "[data-bench-legend]"),
    };
    plot.addEventListener("mouseleave", hideTip);

    // Legend doubles as the family filter (click to isolate, click to release).
    FAMS.forEach((f) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.style.setProperty("--c", f.color);
      b.textContent = f.key;
      b.addEventListener("click", () => {
        if (benchOn.has(f.key)) benchOn.delete(f.key);
        else benchOn.add(f.key);
        refs?.legend
          .querySelectorAll<HTMLElement>(".chip")
          .forEach((c) => c.classList.toggle("on", benchOn.has(c.textContent ?? "")));
        refs?.legend.classList.toggle("filtered", benchOn.size > 0);
        drawBench();
      });
      refs!.legend.append(b);
    });

    drawBench();

    // The coordinate box follows the slide's box, so a resized window (or a
    // projector at a different aspect) has to redraw, not just rescale.
    let benchResize = 0;
    window.addEventListener("resize", () => {
      window.clearTimeout(benchResize);
      benchResize = window.setTimeout(drawBench, 150);
    });
  },
};
