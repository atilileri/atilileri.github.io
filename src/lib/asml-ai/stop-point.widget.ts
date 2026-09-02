/**
 * The stop-point Widget — chapter 3's `data-stop` Slide (#115, spec #106,
 * ADR 0002).
 *
 * The bench chart reduced to one line and five prices. It reads off the
 * SAME `CURVES` array as the Slide before it, deliberately: there is no
 * second dataset to keep in sync, and if the chart's numbers ever move,
 * this Slide moves with them — labels, tooltip and turn-over included.
 * That array is `./curves.ts`, which this Widget's migration gave a module
 * of its own: the benchmark chart is still inline and a Widget module may
 * never import from another Widget's scope.
 *
 * The whole argument is MARGINAL, not cumulative — "this level cost you
 * €X more and bought you Y" — because cumulative spend is the claim the
 * previous Slide already made. The last level is the Slide: 61% more
 * money, 0.2 points less.
 *
 * NOTHING HERE IS A BUILD AND NOTHING IS INTERACTIVE. The chart draws
 * once, complete, on entry, and the Slide holds still while the room
 * reads it. Every number on screen is DERIVED from the curve, so nobody
 * has to re-transcribe a label when the data moves.
 *
 * THIS WIDGET DECLARES `enter` AND NO `sync`. It lands whole on arrival and
 * has no Fragment state to derive, so it declares no `fragSel` either — it
 * is the contract used without touching Fragments at all. That is also why
 * entering the Slide forward and entering it backward show the same chart:
 * there is nothing here that a direction could change.
 *
 * The draw is guarded by `data-built` on the `<svg>`, exactly as the inline
 * code guarded it, so the second arrival repaints nothing.
 */

import { CURVES } from "./curves";
import type { Widget } from "./deck-widgets";
import { q, svgEl } from "./dom";
import { USD_PER_EUR, fmtEur } from "./rates";

/** The Slide attribute this Widget answers to. */
const ATTR = "data-stop";

/** The one `<svg>` the chart is drawn into. Carries the `data-built` guard. */
const SVG = "[data-stop-svg]";

const STOP_CURVE = CURVES.find((c) => c.name === "claude-fable-5")!;
const STOP = {
  VB: { w: 1240, h: 600 },
  X0: 120, XN: 1194, Y0: 520, YN: 70,
  // The plot is framed on this curve alone, so the shape of ONE model's
  // diminishing return fills the Slide; the bench chart's shared scale
  // would squash it into the top-right corner. The y-range is tight on
  // purpose — the whole Slide turns on a 0.2-point drop, and on the
  // previous Slide's 0–80% axis that drop is under three pixels. The
  // axis is labelled and starts at a non-zero score, which is honest
  // here because the Slide compares levels of one curve, not models.
  cMin: 0, cMax: 24, sMin: 58, sMax: 71,
};
const stopEur = (usd: number) => usd / USD_PER_EUR;
const SX = (c: number) =>
  STOP.X0 + ((c - STOP.cMin) / (STOP.cMax - STOP.cMin)) * (STOP.XN - STOP.X0);
const SY = (s: number) =>
  STOP.Y0 - ((s - STOP.sMin) / (STOP.sMax - STOP.sMin)) * (STOP.Y0 - STOP.YN);
/** What level `i` cost ON TOP of level i−1, in euro, points and percent. */
function stopStep(i: number) {
  const p = STOP_CURVE.pts;
  return {
    eur: stopEur(p[i].cost) - stopEur(p[i - 1].cost),
    pts: p[i].rate - p[i - 1].rate,
    pct: Math.round((p[i].cost / p[i - 1].cost - 1) * 100),
  };
}
const stopPtsLabel = (d: number) =>
  `${d > 0 ? "+" : "−"}${Math.abs(d).toFixed(1)} pts`;

/**
 * Draw the axes, the two-part curve, the labels, the dots and the ring.
 * Runs once, guarded by `data-built` on the `<svg>`.
 *
 * `q` types the `<svg>` as `HTMLElement`, which is the one lie the shared
 * lookup tells; everything used here — `append`, `dataset` — is common to
 * HTML and SVG elements, and the CHILDREN are built by `svgEl` in the SVG
 * namespace, which is the part that actually matters. The lookup throws if
 * the element is missing, per ADR 0002: the Slide's markup always carries it,
 * so a miss is a broken Slide rather than a state to paint around. The inline
 * code returned silently instead.
 */
function build(slide: HTMLElement): void {
  const svg = q(slide, SVG);
  if (svg.dataset.built) return;
  const pts = STOP_CURVE.pts;
  const last = pts.length - 1;

  // Axis furniture, deliberately thin: no grid on x, a light one on y.
  // The Slide is a shape, not a chart to read values off. The x ticks
  // carry ROUND EURO values and sit at their true dollar position, so
  // nothing on screen is a converted-and-rounded number.
  for (const eur of [0, 5, 10, 15, 20]) {
    const t = svgEl("text", { x: SX(eur * USD_PER_EUR), y: STOP.Y0 + 30, class: "tick mid" });
    t.textContent = "€" + eur;
    svg.append(t);
  }
  for (const sc of [58, 60, 62, 64, 66, 68, 70]) {
    svg.append(
      svgEl("line", { x1: STOP.X0, x2: STOP.XN, y1: SY(sc), y2: SY(sc), class: "grid" }),
    );
    const t = svgEl("text", { x: STOP.X0 - 14, y: SY(sc) + 6, class: "tick end" });
    t.textContent = sc + "%";
    svg.append(t);
  }
  svg.append(
    svgEl("line", {
      x1: STOP.X0, x2: STOP.XN, y1: STOP.Y0, y2: STOP.Y0, class: "axis",
    }),
  );
  const xl = svgEl("text", {
    x: (STOP.X0 + STOP.XN) / 2, y: STOP.Y0 + 58, class: "axis-label mid",
  });
  xl.textContent = "cost per task";
  // Both axes say what they are, the same way the bench chart says it —
  // the score rotated onto its own axis, opposite the cost title. Same
  // furniture, same room: the room has read this pair once already.
  const ym = (STOP.Y0 + STOP.YN) / 2;
  const yl = svgEl("text", {
    x: 32, y: ym, class: "axis-label mid",
    transform: `rotate(-90 32 ${ym})`,
  });
  yl.textContent = "DeepSWE score";
  svg.append(yl);
  const head = svgEl("text", { x: STOP.X0, y: 34, class: "plot-title" });
  // Spelled, not a numeral: it is prose on a wall, and the count comes
  // off the data so a re-transcribed curve can never make the title lie.
  const WORD = ["no", "one", "two", "three", "four", "five", "six"];
  head.textContent =
    `${STOP_CURVE.name} — one model, ${WORD[pts.length] ?? pts.length} levels of effort`;
  svg.append(xl, head);

  // Two paths, not one: the climb, then the level that turns over. The
  // dip is the Slide's whole argument, so it is inked in the accent
  // rather than left to the eye to find in a single-colour line.
  const dOf = (from: number, to: number) =>
    pts
      .slice(from, to + 1)
      .map((pt, i) => `${i ? "L" : "M"} ${SX(pt.cost)} ${SY(pt.rate)}`)
      .join(" ");
  svg.append(svgEl("path", { d: dOf(0, last - 1), fill: "none", class: "stop-line",
    "stroke-linecap": "round", "stroke-linejoin": "round" }));
  svg.append(svgEl("path", { d: dOf(last - 1, last), fill: "none", class: "stop-line is-down",
    "stroke-linecap": "round", "stroke-linejoin": "round" }));

  // One label per point: what that level cost on top of the one before
  // it. Level 0 has no "before", so it carries its absolute price and
  // score instead — the baseline the rest is read against. The level's
  // NAME is not on the wall (low/medium/high…): the room reads the
  // shape and the prices, and the presenter says the names. Every label
  // sits DOWN AND RIGHT of its point, the one quarter the curve never
  // enters: it climbs left-to-right, so the space under the next
  // segment is always empty. The last one turns back to the left,
  // because there is no wall to its right.
  pts.forEach((pt, i) => {
    const down = i === last;
    // The last label hangs off the RIGHT WALL rather than off its own
    // point: the curve is flat by then, so a label under the point would
    // sit on the one before it. Anchored right, it clears the block
    // before it and still reads as the last point's own line.
    const x = down ? STOP.XN : SX(pt.cost) + 18;
    // Every number sits one short drop under its own dot — the name
    // line used to push it further away, and the last label further
    // still. The cheapest point sits low, close to the cost axis, so
    // its label rides beside the dot instead of under it.
    const y = SY(pt.rate) + (down ? 34 : i === 0 ? 26 : 34);
    const g = svgEl("text", {
      x, y, class: "stop-label" + (down ? " is-down" : ""),
      "text-anchor": down ? "end" : "start",
    });
    const val = svgEl("tspan", { x, class: "delta" });
    val.textContent = i
      ? `+${fmtEur(stopStep(i).eur)} → ${stopPtsLabel(stopStep(i).pts)}`
      : `${fmtEur(stopEur(pt.cost))} · ${pt.rate}%`;
    g.append(val);
    // The turn is the Slide: the last level gets the sentence the other
    // four don't need, so nobody has to do the arithmetic on the wall.
    if (down) {
      const why = svgEl("tspan", { x, dy: 26, class: "why" });
      why.textContent = `${stopStep(i).pct}% more money, less score`;
      g.append(why);
    }
    svg.append(g);
  });

  pts.forEach((pt, i) => {
    svg.append(svgEl("circle", {
      cx: SX(pt.cost), cy: SY(pt.rate), r: 7,
      class: "stop-dot" + (i === last ? " is-down" : ""), "data-stop-dot": i,
    }));
  });
  // The ring marks WHERE THE SPENDING STOPS PAYING — the one point the
  // Slide is about — so it is parked on the last level, not walked.
  svg.append(svgEl("circle", {
    cx: SX(pts[last].cost), cy: SY(pts[last].rate), r: 14, class: "stop-marker",
  }));

  svg.dataset.built = "1";
}

// Sanity net: this Slide's entire argument is that the LAST level costs
// more and scores less. If the chart's data is ever re-transcribed and
// that stops being true, the text is wrong and the Slide must be redone.
//
// At module scope, not in `init`, because that is where it ran inline: the
// Deck's script checked it as it loaded, long before the room reached the
// Slide. It is a DEV-only `console.warn`, so it is not work the room pays
// for and it is not the "loading the file does work" that ADR 0002 is
// against.
if (import.meta.env.DEV) {
  const p = STOP_CURVE.pts;
  const last = p[p.length - 1], prev = p[p.length - 2];
  if (!(last.cost > prev.cost && last.rate < prev.rate))
    console.warn("#33's stop-point slide: the curve no longer turns over");
}

/**
 * The stop-point Widget: one model's spend curve, and the level where more
 * money bought less score.
 */
export const stopPointWidget: Widget = {
  attr: ATTR,

  /**
   * The room arrived. Draw the chart, once.
   *
   * There is no `sync` and no `fragSel`: the Slide carries no Fragments, so
   * there is no state to derive and nothing for an arrow press to change.
   */
  enter(slide: HTMLElement): void {
    build(slide);
  },
};
