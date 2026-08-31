/**
 * The smart-zone Widget — Chapter 4, the `data-smartzone` Slide (#111, spec
 * #106, ADR 0002).
 *
 * The first Widget to leave the Deck's inline `<script>`, and the simplest
 * real one in the Deck: one `sync`, one Fragment row, no listeners the room
 * drives, and no timer. What it does is unchanged; only where it lives is.
 *
 * The Slide's data — the three states, the tank's marks, the block palette —
 * lives beside this file in `smart-zone.ts`, and everything there that is a
 * decision rather than a number is documented there. Read that header before
 * changing what the room sees.
 *
 * Four Fragments were designed and two are in the markup: the Fragment row
 * holds two, so `shown` runs 0 → 2 and the three states run turn 1 → turn 10
 * → turn 20. The Closing line is SPOKEN (Atil, 2026-08-25); the Widget never
 * shows it, so there is no further Fragment.
 *
 * The Widget holds NO state of its own. Every pixel is derived from `shown`,
 * which is what makes arriving from the left and arriving from the right land
 * on the same picture, and what makes `sync` idempotent.
 */

import type { Widget } from "./deck-widgets";
import { el } from "./dom";
import { HARD, PALE, PALETTE, SOFT, STATES, WINDOW } from "./smart-zone";

/**
 * One of this Widget's own elements, by selector.
 *
 * Every selector below names an element the Slide's markup always carries, so
 * a miss is a broken Slide rather than a state to paint around, and it throws
 * where it happened instead of failing later somewhere else.
 */
function q(slide: HTMLElement, sel: string): HTMLElement {
  const node = slide.querySelector<HTMLElement>(sel);
  if (!node) throw new Error(`smart zone: no element matches ${sel}`);
  return node;
}

/**
 * A position along the tank, as a percentage.
 *
 * LINEAR against the advertised window, and it has to stay linear: a log scale
 * made the tank read ~68% full while the gauge above it read 21%, which
 * contradicts the Slide's own argument. The band sitting close to the left
 * edge IS the point — a session can be deep in the dumb zone with most of the
 * window still free.
 */
function pct(n: number): number {
  return (n / WINDOW) * 100;
}

/** The channels of a `#rrggbb` string. */
function rgb(hex: string): number[] {
  return [1, 3, 5].map((k) => parseInt(hex.slice(k, k + 2), 16));
}

/**
 * A block's colour at vividness `t`: its own colour at 1, the theme's pale
 * grey at 0. The blocks arrive as themselves and end as one grey field, which
 * is the Slide's argument — nothing was deleted, it all just became the same
 * to the model.
 */
function mix(hex: string, t: number): string {
  const [r1, g1, b1] = rgb(hex);
  const [r2, g2, b2] = rgb(PALE);
  const c = (a: number, b: number) => Math.round(a * t + b * (1 - t));
  return `rgb(${c(r1, r2)}, ${c(g1, g2)}, ${c(b1, b2)})`;
}

/**
 * The smart-zone Widget: the session filling up until the model can no longer
 * tell one turn from another.
 */
export const smartZoneWidget: Widget = {
  attr: "data-smartzone",
  fragSel: "[data-sz-frag-row]",

  sync(slide: HTMLElement, shown: number): void {
    const s = STATES[Math.min(shown, STATES.length - 1)];

    q(slide, "[data-sz-turn]").textContent =
      `${s.turn} · ${s.tokens.toLocaleString("en-US")} tokens in the session`;
    q(slide, "[data-sz-gauge]").textContent = s.gauge;
    q(slide, "[data-sz-fill]").style.width = `${pct(s.tokens)}%`;

    // Turn 1 holds still: the same tokens against the same tank is the same
    // width, on every press. ⚠ Do not size it against the fill — that is a
    // different percentage each time and it animates.
    q(slide, "[data-sz-mine]").style.width = `${pct(s.mine)}%`;

    const band = q(slide, "[data-sz-band]");
    band.style.left = `${pct(SOFT)}%`;
    band.style.width = `${pct(HARD) - pct(SOFT)}%`;
    q(slide, "[data-sz-mark-soft]").style.left = `${pct(SOFT)}%`;
    q(slide, "[data-sz-mark-hard]").style.left = `${pct(HARD)}%`;
    // The dumb zone starts where the band ends and runs to the far edge.
    q(slide, "[data-sz-dumb]").style.left = `${pct(HARD)}%`;
    // The three causes sit under the zone they explain, from the same mark.
    q(slide, "[data-sz-causes]").style.left = `${pct(HARD)}%`;

    // The window's contents. Each block arrives in its own colour and is mixed
    // toward the theme's pale grey as the session grows, so by the last
    // Fragment they are indistinguishable from one another. The field is
    // emptied and refilled, which is what makes a repaint at the same `shown`
    // land on exactly the same blocks.
    const field = q(slide, "[data-sz-blocks]");
    field.textContent = "";
    for (let b = 0; b < s.blocks; b++) {
      const block = el("i", "sz-block");
      block.style.background = mix(PALETTE[b % PALETTE.length], s.vivid);
      block.style.animationDelay = `${Math.min(b, 30) * 10}ms`;
      field.append(block);
    }

    // What the field above the tank now means. It reads the BLOCKS, not the
    // tank — attention, not tokens.
    q(slide, "[data-sz-read]").textContent = s.read;

    slide.querySelectorAll<HTMLElement>("[data-sz-line]").forEach((line, n) => {
      line.classList.toggle("dead", n >= s.live);
    });
  },
};
