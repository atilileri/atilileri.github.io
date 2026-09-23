/**
 * The stop-point Widget — chapter 3's `data-stop` Slide (#115, spec #106,
 * ADR 0002).
 *
 * The bench chart reduced to one line and five prices. It reads off the
 * SAME `CURVES` array as the Slide before it, deliberately: there is no
 * second dataset to keep in sync, and if the chart's numbers ever move,
 * this Slide moves with them — labels, tooltip and the knee included.
 * That array is `./curves.ts`, which this Widget's migration gave a module
 * of its own: the benchmark chart is still inline and a Widget module may
 * never import from another Widget's scope.
 *
 * The whole argument is MARGINAL, not cumulative — "this level cost you
 * €X more and bought you Y" — because cumulative spend is the claim the
 * previous Slide already made. The TOP of the curve is the Slide: from
 * HIGH to MAX the price rises 95% and the score rises 0.8 points, which
 * is smaller than the error bar on either point. The three top levels
 * are one number the benchmark cannot tell apart, sold at three prices.
 *
 * It used to frame `claude-fable-5`, whose last level scored LOWER than
 * the one before it. That model is not in the company's picker, and no
 * model that is turns over at all — so the argument moved from "the last
 * dot dips" to "the last dots are the same dot". That is the stronger
 * version of the same lesson: a dip invites "then use xhigh", a tie
 * invites "then stop paying for max".
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
import { USD_PER_EUR, eurOfUsd, fmtEur } from "./rates";

/** The Slide attribute this Widget answers to. */
const ATTR = "data-stop";

/** The one `<svg>` the chart is drawn into. Carries the `data-built` guard. */
const SVG = "[data-stop-svg]";

/**
 * The one curve this Slide frames. A data miss gets the same sentence ADR 0002
 * gives a DOM miss: throw where it happened. `!` would let a renamed model in
 * `curves.ts` reach the DEV block below as `undefined` and take down
 * `mountWidgets` — and every Widget with it — at module load.
 */
const STOP_CURVE = (() => {
  const c = CURVES.find((c) => c.name === "claude-opus-5");
  if (!c) throw new Error("curves.ts has no claude-opus-5 curve");
  return c;
})();

/**
 * THE KNEE: the first level past which every further step buys less score
 * than that step's own 95% confidence interval. Everything from the knee
 * to the top is one number the benchmark cannot separate, so the Slide
 * inks that stretch in the accent and parks the ring on the knee itself.
 *
 * Derived, never transcribed. A re-transcription that moves the knee moves
 * the ink, the ring and the closing sentence with it — the Slide can never
 * be left pointing at a level the data no longer supports.
 */
const KNEE = (() => {
  const p = STOP_CURVE.pts;
  for (let i = 1; i < p.length - 1; i++) {
    let flat = true;
    for (let j = i + 1; j < p.length; j++)
      if (p[j].rate - p[j - 1].rate >= p[j].ci) flat = false;
    if (flat) return i;
  }
  return p.length - 1;
})();
const STOP = {
  X0: 120, XN: 1194, Y0: 520, YN: 70,
  // The plot is framed on this curve alone, so the shape of ONE model's
  // diminishing return fills the Slide; the bench chart's shared scale
  // would squash it into the top-right corner. The y-range is tight on
  // purpose — the whole Slide turns on a 0.8-point gain, and on the
  // previous Slide's 0–80% axis that gain is under six pixels. The
  // axis is labelled and starts at a non-zero score, which is honest
  // here because the Slide compares levels of one curve, not models.
  cMin: 0, cMax: 13, sMin: 56, sMax: 80,
};
const SX = (c: number) =>
  STOP.X0 + ((c - STOP.cMin) / (STOP.cMax - STOP.cMin)) * (STOP.XN - STOP.X0);
const SY = (s: number) =>
  STOP.Y0 - ((s - STOP.sMin) / (STOP.sMax - STOP.sMin)) * (STOP.Y0 - STOP.YN);
/** What level `i` cost ON TOP of level i−1, in euro, points and percent. */
function stopStep(i: number) {
  const p = STOP_CURVE.pts;
  return {
    eur: eurOfUsd(p[i].cost) - eurOfUsd(p[i - 1].cost),
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
  // Both ladders are DERIVED from the frame, not typed. A re-transcription
  // that moves the curve moves the frame, and a typed ladder would then draw
  // marks the plot no longer reaches — or stop short of the curve's own top,
  // which is how this Slide broke when it changed model.
  const maxEur = STOP.cMax / USD_PER_EUR;
  const eurStep = maxEur <= 15 ? 2 : 5;
  const eurTicks: number[] = [];
  for (let e = 0; e <= maxEur; e += eurStep) eurTicks.push(e);
  const SCORE_STEP = 4;
  const scoreTicks: number[] = [];
  for (
    let sc = Math.ceil(STOP.sMin / SCORE_STEP) * SCORE_STEP;
    sc <= STOP.sMax;
    sc += SCORE_STEP
  ) scoreTicks.push(sc);

  for (const eur of eurTicks) {
    const t = svgEl("text", { x: SX(eur * USD_PER_EUR), y: STOP.Y0 + 30, class: "tick mid" });
    t.textContent = "€" + eur;
    svg.append(t);
  }
  for (const sc of scoreTicks) {
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

  // Two paths, not one: the climb up to the knee, then the flat top. The
  // flat is the Slide's whole argument, so it is inked in the accent
  // rather than left to the eye to find in a single-colour line.
  const dOf = (from: number, to: number) =>
    pts
      .slice(from, to + 1)
      .map((pt, i) => `${i ? "L" : "M"} ${SX(pt.cost)} ${SY(pt.rate)}`)
      .join(" ");
  svg.append(svgEl("path", { d: dOf(0, KNEE), fill: "none", class: "stop-line",
    "stroke-linecap": "round", "stroke-linejoin": "round" }));
  svg.append(svgEl("path", { d: dOf(KNEE, last), fill: "none", class: "stop-line is-flat",
    "stroke-linecap": "round", "stroke-linejoin": "round" }));

  // ONE LABEL PER CLIMBING LEVEL, and ONE for the whole flat stretch.
  //
  // Every level used to carry its own marginal price, and on this curve that
  // printed three near-identical lines on top of each other: past the knee
  // the scores barely move, so the labels sit at the same height and their
  // text runs together. The flat stretch is ONE claim, so it gets ONE label —
  // which is also the honest shape of the argument. The room is not being
  // asked to compare xhigh with max; it is being asked to stop before both.
  //
  // The level's NAME is not on the wall (low/medium/high…): the room reads
  // the shape and the prices, and the presenter says the names.
  pts.slice(0, KNEE + 1).forEach((pt, i) => {
    // Up to the knee the curve climbs steeply, so the space DOWN AND RIGHT of
    // each point is empty and the label rides there. The knee's own label is
    // the exception twice over: it sits to the LEFT of its point, because the
    // stretch label owns everything to the right, and ABOVE the line rather
    // than under it, because the wedge under the knee is where the level
    // before it already put its own label.
    const atKnee = i === KNEE;
    const x = atKnee ? SX(pt.cost) - 18 : SX(pt.cost) + 18;
    // The cheapest point sits low, close to the cost axis, so its label rides
    // beside the dot instead of a full drop under it.
    const y = SY(pt.rate) + (atKnee ? -22 : i === 0 ? 26 : 34);
    const g = svgEl("text", {
      x, y, class: "stop-label", "text-anchor": atKnee ? "end" : "start",
    });
    const val = svgEl("tspan", { x, class: "delta" });
    val.textContent = i
      ? `+${fmtEur(stopStep(i).eur)} → ${stopPtsLabel(stopStep(i).pts)}`
      : `${fmtEur(eurOfUsd(pt.cost))} · ${pt.rate}%`;
    g.append(val);
    svg.append(g);
  });

  // The flat stretch, as one block ABOVE the line it describes. Above,
  // because everything below the flat top belongs to the climb's own labels,
  // and right-anchored to the wall, because the stretch ends there.
  {
    const k = pts[KNEE], top = pts[last];
    const x = STOP.XN;
    const y = SY(top.rate) - 58;
    const g = svgEl("text", {
      x, y, class: "stop-label is-flat", "text-anchor": "end",
    });
    const val = svgEl("tspan", { x, class: "delta" });
    val.textContent =
      `+${fmtEur(eurOfUsd(top.cost) - eurOfUsd(k.cost))} → ` +
      stopPtsLabel(top.rate - k.rate);
    const why = svgEl("tspan", { x, dy: 26, class: "why" });
    why.textContent =
      `${Math.round((top.cost / k.cost - 1) * 100)}% more money past the ring` +
      ` — a gain inside the ±${top.ci} error bar`;
    g.append(val, why);
    svg.append(g);
  }

  pts.forEach((pt, i) => {
    svg.append(svgEl("circle", {
      cx: SX(pt.cost), cy: SY(pt.rate), r: 7,
      class: "stop-dot" + (i >= KNEE ? " is-flat" : ""), "data-stop-dot": i,
    }));
  });
  // The ring marks WHERE THE SPENDING STOPS PAYING — the one point the
  // Slide is about — so it is parked on the KNEE, not on the top. The top
  // is where the money ends up; the knee is the level the room should buy,
  // and a ring around the most expensive dot would say the opposite.
  svg.append(svgEl("circle", {
    cx: SX(pts[KNEE].cost), cy: SY(pts[KNEE].rate), r: 14, class: "stop-marker",
  }));

  svg.dataset.built = "1";
}

// Sanity net: this Slide's entire argument is that the top of the curve
// FLATTENS — that past the knee, more money buys a difference smaller
// than the benchmark's own error bar. If the chart's data is ever
// re-transcribed and that stops being true, the Slide must be redone.
//
// At module scope, not in `init`, because that is where it ran inline: the
// Deck's script checked it as it loaded, long before the room reached the
// Slide. It is a DEV-only `console.warn`, so it is not work the room pays
// for and it is not the "loading the file does work" that ADR 0002 is
// against.
// Runs at module load, as it did inline. ⚠ Imports hoist, so this is now
// EARLIER than the inline script body rather than partway through it. Dev
// only, and nothing the room or the walk sees, but "the same moment" would
// not be true.
if (import.meta.env.DEV) {
  const p = STOP_CURVE.pts;
  const last = p[p.length - 1], knee = p[KNEE];
  if (!(KNEE < p.length - 1 && last.cost > knee.cost))
    console.warn("#33's stop-point slide: the curve no longer flattens");
  if (last.rate - knee.rate >= last.ci)
    console.warn("#33's stop-point slide: the flat top is no longer inside the error bar");
}

/**
 * The stop-point Widget: one model's spend curve, and the level past which
 * more money buys less than the error bar.
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
