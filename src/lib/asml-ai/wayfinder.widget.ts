/**
 * The wayfinder-map Widget — Chapter 5, the `data-wayfinder` Slide (#113,
 * spec #106, ADR 0002; the picture is comp E of #98, built by #105).
 *
 * Nine tickets move between four columns across four steps. The board is
 * re-rendered from `wayfinder-map.ts` on every Fragment change, then FLIP puts
 * the motion back: each ticket is measured BEFORE the repaint and slides from
 * where it was to where it now is, so the room watches a ticket LEAVE Blocked
 * rather than watching a table re-draw. A ticket that did not exist rises in
 * instead, which is what makes the spawn on step 1 read as a spawn.
 *
 * ⚠ REVEAL SCALES THE CANVAS, so the measured pixels are divided by
 * `deck.getScale()` before they drive the transform. A build that forgets this
 * gets drift at every viewport except 1600×900 (#98). That is why this Widget
 * keeps the reveal instance from `init`: it is the SECOND reader of the
 * argument the contract was widened for, and the first that needs it inside
 * `sync` rather than inside a listener it binds itself.
 *
 * ⚠ HISTORY COMPRESSES, and it is not decoration: nine full cards run off the
 * bottom of the canvas. A ticket closed on an EARLIER step drops to a one-line
 * ledger row, and only the ones closing NOW show their answer. Without this
 * the last two steps overflow.
 *
 * The Widget holds NO state of its own — the whole board is derived from
 * `shown`, which is what makes arriving from the left and arriving from the
 * right land on the same picture, and what makes `sync` idempotent. The one
 * thing that is not derived is the FLIP, and it cannot be: it is the
 * difference between the board that was on screen and the board that now is,
 * so it is read from the DOM immediately before the repaint.
 *
 * ONE GUARD BECAME A THROW. The inline version returned silently when the
 * board was missing; `q` throws instead, which is what ADR 0002 records for
 * the session Widget and sanctions for later migrations — the Slide's markup
 * always carries the board, so a miss is a broken Slide rather than a state to
 * paint around.
 */

import type { RevealApi, Widget } from "./deck-widgets";
import { q } from "./dom";
import { FOG, OUT, STEPS, TICKETS, type MapTicket } from "./wayfinder-map";

/** The Slide attribute this Widget answers to. */
const ATTR = "data-wayfinder";

/** How long a travelling ticket is in flight, and the CSS that carries it. */
const FLIP_MS = 520;
const FLIP_EASE = "cubic-bezier(.2,.72,.2,1)";

/**
 * The reveal instance, kept from `init` for `getScale` alone.
 *
 * `sync` is handed a Slide and a number, not the Deck, so the scale has to
 * come from somewhere and this is the only Widget that needs it after startup.
 *
 * ⚠ THE `|| 1` FALLBACK BELOW CANNOT FIRE, and is kept only because this is a
 * move: `mountWidgets` runs every `init` before it binds a single event, so
 * `revealDeck` is set before any `sync`, and reveal always supplies
 * `getScale`. The inline version wrote `(deck as any).getScale?.() || 1` and
 * this reproduces it exactly. It is worth knowing that the fallback is not a
 * safety net — a scale of 1 where the canvas is scaled is the drift #98 exists
 * to prevent, so if it ever did fire, it would hide the bug rather than
 * survive it. Hardening it is a behaviour change and belongs in its own ticket.
 */
let revealDeck: RevealApi | null = null;

/** How far a ticket already closed before `at` counts as closed. */
function closedAt(id: number, at: number): boolean {
  return (TICKETS.find((t) => t.id === id)?.closed ?? 99) <= at;
}

/** One ticket's markup, in the column it is standing in on this step. */
function card(t: MapTicket, state: string, step: number): string {
  if (state === "done" && t.closed < step) {
    return `<p class="wf-row ty-${t.type}" data-tid="t${t.id}"><span class="tick">closed</span><span class="id">#${t.id}</span><span class="q">${t.q}</span></p>`;
  }
  const blocker =
    state === "blocked" ? `<span class="blk">waits on #${t.blockedBy}</span>` : "";
  // A freed ticket says which ticket freed it, on the step it moves.
  const freed =
    state === "open" && t.blockedBy && closedAt(t.blockedBy, step)
      ? `<span class="freed">#${t.blockedBy} closed</span>`
      : "";
  const born = t.born && t.from === step ? `<span class="born">${t.born}</span>` : "";
  const ans = state === "done" ? `<span class="a">${t.a}</span>` : "";
  return `<div class="wf-card ${state} ty-${t.type}" data-tid="t${t.id}"><span class="head"><span class="ty">${t.type}</span><span class="id">#${t.id}</span></span><span class="q">${t.q}</span>${blocker}${freed}${born}${ans}</div>`;
}

/**
 * The wayfinder-map Widget: nine tickets, four columns, four steps.
 */
export const wayfinderWidget: Widget = {
  attr: ATTR,

  /**
   * This Widget's Fragment row. It is NOT the row chapter 5's step Widget
   * counts, and not one of the three the earlier migrations named: the map
   * lives in its own component and carries its own counters, so it names its
   * own row.
   */
  fragSel: "[data-wf-frag-row]",

  init(deck: RevealApi): void {
    revealDeck = deck;
  },

  sync(slide: HTMLElement, shown: number): void {
    const board = q(slide, "[data-wf-board]");
    // The map's own word for `shown`: the four steps the room walks it in.
    const step = shown;
    const slot = (k: string) => q(slide, `[data-wf-slot='${k}']`);

    // ── Measure, so the repaint below can be un-done into a slide ──
    const before = new Map<string, DOMRect>();
    board
      .querySelectorAll<HTMLElement>("[data-tid]")
      .forEach((e) => before.set(e.dataset.tid!, e.getBoundingClientRect()));
    const firstPaint = before.size === 0;

    const cols: Record<string, string[]> = { done: [], open: [], blocked: [] };
    for (const t of TICKETS) {
      if (t.from > step) continue;
      const state =
        t.closed <= step
          ? "done"
          : t.blockedBy && !closedAt(t.blockedBy, step)
            ? "blocked"
            : "open";
      cols[state].push(card(t, state, step));
    }
    slot("done").innerHTML = cols.done.join("");
    slot("open").innerHTML = cols.open.join("");
    slot("blocked").innerHTML =
      cols.blocked.join("") || `<p class="wf-empty">nothing waiting</p>`;

    // Fog: in scope, written down, not sharp enough to ask. A patch leaves
    // the column either by graduating into a ticket or by being ruled out
    // of scope — the second one is why this filters against OUT as well.
    slot("fog").innerHTML = FOG.filter(
      (f) => f.graduates < 0 || f.graduates > step,
    )
      .filter((f) => !OUT.some((o) => o.text === f.text && o.from <= step))
      .map((f) => `<p class="wf-fog" data-tid="f${f.text}">${f.text}</p>`)
      .join("");
    slot("out").innerHTML = OUT.filter((o) => o.from <= step)
      .map((o) => `<p class="wf-out" data-tid="o${o.text}">${o.text}</p>`)
      .join("");

    const open = cols.open.length,
      blocked = cols.blocked.length,
      done = cols.done.length;
    q(slide, "[data-wf-tally]").textContent =
      `${done + open + blocked} tickets · ${done} closed · ${blocked} blocked`;
    // The last beat: nothing left to decide, so the map goes orange and
    // hands itself to /to-spec.
    const finished = open + blocked === 0;
    q(slide, "[data-wf-map]").classList.toggle("ready", finished);
    board.classList.toggle("clear", finished);
    q(slide, "[data-wf-col='open']").classList.toggle("lit", open > 0);
    q(slide, "[data-wf-step]").innerHTML = STEPS[Math.min(step, STEPS.length - 1)];

    // ── Play: every ticket travels from where it was; new ones rise in ──
    const k = revealDeck?.getScale?.() || 1;
    board.querySelectorAll<HTMLElement>("[data-tid]").forEach((e) => {
      const was = before.get(e.dataset.tid!);
      if (!was) {
        if (!firstPaint) e.classList.add("wf-in");
        return;
      }
      const now = e.getBoundingClientRect();
      const dx = (was.left - now.left) / k;
      const dy = (was.top - now.top) / k;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      e.style.transition = "none";
      e.style.transform = `translate(${dx}px, ${dy}px)`;
      e.classList.add("wf-moving");
      requestAnimationFrame(() => {
        e.style.transition = `transform ${FLIP_MS}ms ${FLIP_EASE}`;
        e.style.transform = "";
        window.setTimeout(() => e.classList.remove("wf-moving"), FLIP_MS + 20);
      });
    });
  },
};
