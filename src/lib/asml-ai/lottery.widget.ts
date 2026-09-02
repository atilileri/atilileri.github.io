/**
 * The lottery Widget — Chapter 6's `data-lottery` Slide (#114, spec #106,
 * ADR 0002).
 *
 * Eighteen attempts at the same job, plotted as result quality against tokens
 * spent. The Slide opens on the BEFORE cloud — a wide, noisy spray touching
 * all four quadrants — and one Fragment collapses it into the AFTER cloud, a
 * tight cluster in the ship-ready, on-budget corner. The dots are drawn at
 * their AFTER coordinates and translated out to their BEFORE ones, so the
 * collapse is one CSS transition rather than a redraw.
 *
 * The Slide is now purely the scatter: its caption block was removed (Atil,
 * 2026-08-02) and the 3-of-18 / 16-of-18 figures moved into the presenter
 * note, so there is no on-screen text to swap — only the class that moves the
 * cloud.
 *
 * THIS WIDGET READS A FLAG, NOT A COUNT. It declares no `fragSel`: the Slide
 * carries exactly one Fragment, `[data-lottery-collapse]`, and the Widget
 * draws one of two states from whether it is `.visible`. It reads that inside
 * `sync` and does not declare `shown` at all.
 *
 * WHY READING THE FLAG IS THE SAME AS THE `if` CHAIN IT REPLACES. The inline
 * `onFragment` keyed off the Fragment ELEMENT — `if (f.hasAttribute(
 * "data-lottery-collapse"))` — and passed reveal's own `shown` boolean. The
 * registry instead resolves the Slide with `event.fragment.closest("section")`
 * and syncs every Widget on it. Those fire in exactly the same states, in both
 * directions, for two reasons: this Slide has ONE Fragment, so the only
 * Fragment event it can raise is that Fragment's; and reveal adds and removes
 * the `visible` class on every changed Fragment BEFORE it dispatches
 * `fragmentshown`/`fragmenthidden`, so the flag read here equals the boolean
 * the old branch was handed. The arrival branch already read the same flag.
 *
 * `enter` BUILDS, `sync` STATES. The build is one-time, guarded by
 * `data-built` on the `<svg>` exactly as the inline code guarded it, and the
 * state is derived from the Fragment on every arrival and every arrow press —
 * which is what makes stepping backward onto this Slide land on the collapsed
 * cloud instead of replaying the collapse, and what makes `sync` idempotent.
 */

import type { Widget } from "./deck-widgets";
import { q, svgEl } from "./dom";

/** The Slide attribute this Widget answers to. */
const ATTR = "data-lottery";

/**
 * The one Fragment on the Slide. Read as a flag: `.visible` is the collapsed
 * cloud, absent is the scattered one.
 */
const COLLAPSE = "[data-lottery-collapse]";

/** The plot. Built once into, then given one class to move the cloud. */
const SVG = "[data-lottery-svg]";

// ── Reliability scatter (result quality × spend) ──────────────
//    Deterministic, presenter-driven: on entry the same dots sit
//    scattered; a reveal fragment collapses them into the target box.
const LOT = {
  VB: { w: 980, h: 600 },
  // plot frame (x grows right = more tokens; y grows down = worse).
  // Y0 sits high enough to leave room for the x-axis label beneath it.
  X0: 130, XN: 930, Y0: 470, YN: 60,
  xBudget: 530, yShip: 265, // thresholds at the MIDDLE of each axis
  // 18 attempts. Both populations share the same truth — more tokens
  // roughly buys more quality (a positive trend). before = a wide,
  // noisy spray touching all four quadrants. after = the SAME truth
  // shifted: high quality reached at far fewer tokens, spend narrowed
  // toward the left, spread tightened. It's a distribution shift, not
  // a collapse — a couple of attempts still miss.
  before: [
    [230, 400], [300, 340], [190, 300],
    [380, 300], [450, 250], [500, 240], [430, 360], [560, 200], [610, 300],
    [700, 180], [780, 140], [850, 120], [720, 240], [900, 160], [820, 220],
    [300, 150], [840, 380], [560, 430],
  ],
  // still a positive trend — quality rises with tokens — but a flatter
  // slope, pulled left and tightened. Best quality still costs a little
  // more (right edge of the band); two attempts still miss.
  after: [
    [205, 250], [220, 200], [240, 255],
    [255, 190], [270, 235], [290, 168], [300, 225], [315, 150], [330, 205],
    [350, 140], [365, 215], [465, 120], [380, 150], [400, 195], [420, 120],
    [445, 180], [560, 175], [455, 300],
  ],
  // strategically chosen attempts leave a dotted trail along their
  // path, each teaching a distinct vector: up (quality at same spend),
  // left (quality kept, tokens slashed), up-left (a dear miss rescued).
  TRACE: [0, 11, 16],
};
/**
 * Draw the plot frame, the fitted trend lines, the traces and the eighteen
 * dots. Runs once, guarded by `data-built` on the `<svg>`.
 *
 * `q` types the `<svg>` as `HTMLElement`, which is the one lie the shared
 * lookup tells; everything used here — `append`, `dataset`, `classList` — is
 * common to HTML and SVG elements, and the CHILDREN are built by `svgEl` in
 * the SVG namespace, which is the part that actually matters.
 */
function build(slide: HTMLElement): void {
  const svg = q(slide, SVG);
  if (svg.dataset.built) return;
  const { X0, XN, Y0, YN, xBudget, yShip } = LOT;
  // target zone
  svg.append(svgEl("rect", {
    x: X0, y: YN, width: xBudget - X0, height: yShip - YN,
    rx: 10, class: "lot-zone",
  }));
  const zl = svgEl("text", { x: X0 + 14, y: YN + 30, class: "lot-zone-lbl" });
  zl.textContent = "SHIP-READY · ON BUDGET";
  svg.append(zl);
  // axes
  svg.append(svgEl("line", { x1: X0, y1: Y0, x2: XN, y2: Y0, class: "lot-axis" }));
  svg.append(svgEl("line", { x1: X0, y1: Y0, x2: X0, y2: YN, class: "lot-axis" }));
  // threshold guides
  svg.append(svgEl("line", { x1: X0, y1: yShip, x2: XN, y2: yShip, class: "lot-guide" }));
  svg.append(svgEl("line", { x1: xBudget, y1: Y0, x2: xBudget, y2: YN, class: "lot-guide" }));
  // axis titles
  const yt = svgEl("text", { x: X0 - 40, y: (Y0 + YN) / 2, class: "lot-axtitle",
    transform: `rotate(-90 ${X0 - 40} ${(Y0 + YN) / 2})` });
  yt.textContent = "Result quality →";
  svg.append(yt);
  const xt = svgEl("text", { x: (X0 + XN) / 2, y: Y0 + 42, class: "lot-axtitle" });
  xt.textContent = "Tokens spent →";
  svg.append(xt);
  // threshold indicators, sat where each guide line meets its axis
  const qb = svgEl("text", { x: X0 + 12, y: yShip - 12, class: "lot-thresh" });
  qb.textContent = "acceptable quality";
  svg.append(qb);
  const bb = svgEl("text", {
    x: xBudget - 12, y: Y0 - 14, class: "lot-thresh", "text-anchor": "end",
  });
  bb.textContent = "monthly budget";
  svg.append(bb);
  // ── Fitted trend lines, one per state ────────────────────────────
  // Ordinary least squares over each cloud, computed here rather than
  // hard-coded so the lines cannot drift if the point sets are ever
  // retuned. Both slopes are NEGATIVE in SVG space (y grows downward),
  // i.e. both clouds really do trend "more tokens → better results".
  //
  // OUTLIERS ARE EXCLUDED FROM THE FIT (Atil, 2026-08-02) — the last
  // three "before" points and the last two "after" points. That is not
  // arbitrary trimming: those points are the deliberately odd ones the
  // set was built with — before's lucky win, dear miss and bad miss
  // (the "touches all four quadrants" tail), and after's two attempts
  // that still miss. They stay ON SCREEN, because the honest picture
  // includes them; they are just kept out of the line so the fit
  // describes the body of the distribution rather than being dragged by
  // its tail. Both counts are tied to the tail's length, so anything
  // appended to these arrays lands INSIDE the fit unless this changes.
  //
  // Each line spans only its own fitted points' x-range, so it reads as
  // a fit of those points rather than a prediction beyond them.
  const FIT_DROP = { before: 3, after: 2 };
  const fit = (pts: number[][]) => {
    const n = pts.length;
    const mx = pts.reduce((s, p) => s + p[0], 0) / n;
    const my = pts.reduce((s, p) => s + p[1], 0) / n;
    let num = 0, den = 0;
    for (const [x, y] of pts) {
      num += (x - mx) * (y - my);
      den += (x - mx) * (x - mx);
    }
    const slope = den === 0 ? 0 : num / den;
    const xs = pts.map((p) => p[0]);
    const x1 = Math.min(...xs), x2 = Math.max(...xs);
    return {
      x1, x2,
      y1: my + slope * (x1 - mx),
      y2: my + slope * (x2 - mx),
    };
  };
  for (const [pts, drop, cls] of [
    [LOT.before, FIT_DROP.before, "lot-fit lot-fit-before"],
    [LOT.after, FIT_DROP.after, "lot-fit lot-fit-after"],
  ] as const) {
    const body = (pts as number[][]).slice(0, pts.length - drop);
    const f = fit(body);
    svg.append(svgEl("line", {
      x1: f.x1, y1: f.y1, x2: f.x2, y2: f.y2, class: cls,
    }));
  }

  // dotted traces for the chosen few — drawn first so they sit BEHIND
  // the dots; they fade in as the attempts travel (.go).
  LOT.TRACE.forEach((i) => {
    const [bx, by] = LOT.before[i];
    const [ax, ay] = LOT.after[i];
    svg.append(svgEl("line", {
      x1: bx, y1: by, x2: ax, y2: ay, class: "lot-trace",
    }));
  });
  // dots — base position is the AFTER coord; a per-dot translate offsets
  // them out to the scattered BEFORE coord until the box collapses (.go).
  LOT.before.forEach(([bx, by], i) => {
    const [ax, ay] = LOT.after[i];
    const c = svgEl("circle", { cx: ax, cy: ay, r: 12, class: "lot-dot" });
    c.setAttribute(
      "style",
      `--tf:translate(${bx - ax}px,${by - ay}px);--d:${(i % 6) * 40}ms`,
    );
    svg.append(c);
  });
  svg.dataset.built = "1";
}

/**
 * The one class that moves the cloud. There is no on-screen text to swap —
 * see the header.
 */
function paint(slide: HTMLElement, collapsed: boolean): void {
  q(slide, SVG).classList.toggle("go", collapsed);
}

/**
 * The lottery Widget: the same eighteen attempts, before and after.
 */
export const lotteryWidget: Widget = {
  attr: ATTR,

  /** Build once, then let `sync` place the cloud. */
  enter(slide: HTMLElement): void {
    build(slide);
  },

  /**
   * Match the picture to reveal's Fragment state. Entering forward the
   * collapse Fragment is not shown yet (→ scattered); entering backward
   * from the next Slide it is already shown (→ collapsed). Forcing
   * "before" here would desync the arrows — → would find no Fragment
   * and skip the Slide.
   *
   * `shown` is not declared: this Widget has no Fragment row, so the registry
   * would hand it 0 in every state.
   */
  sync(slide: HTMLElement): void {
    paint(slide, q(slide, COLLAPSE).classList.contains("visible"));
  },
};
