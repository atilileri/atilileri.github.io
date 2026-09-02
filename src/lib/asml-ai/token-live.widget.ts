/**
 * The live-tokenizer Widget — Chapter 3's `data-token-live` Slide (#114, spec
 * #106, ADR 0002).
 *
 * The vocabulary Slide. It breaks whichever prompt is on screen into token
 * chips and puts the token count above them, so the room sees that the model
 * never reads words — only indices into a vocabulary. The right-hand panel is
 * static markup (see the Deck's frontmatter): there is no renderer and no rAF
 * loop here, and no typing. The Slide arrives finished, and its one Fragment
 * swaps the plain sentence for the real prompt — the one with a report
 * attached.
 *
 * THIS WIDGET READS A FLAG, NOT A COUNT. It declares no `fragSel`. The two
 * `[data-tk-msg]` blocks share `data-fragment-index="0"`, so one arrow press
 * fades one out and the other in; the Widget's whole state is whether
 * `[data-tk-swap]` is `.visible`. It reads that inside `sync` and does not
 * declare `shown` at all.
 *
 * IT HAS NO `init`. Issue #114 expected one, for "a textarea the room types
 * into". That textarea is on the capability showcase Deck, not this one:
 * `[data-tok-input]` appears nowhere in this Deck's markup. This Widget owns
 * no listener and no one-time setup, so it declares `attr` and `sync` and
 * nothing else. Its three DOM handles used to be looked up at module scope,
 * at load, for a Slide the room had not reached; they are looked up inside
 * `sync` now, from the Slide the registry hands over.
 *
 * It holds NO state of its own — every chip is derived from the Fragment
 * state — which is what makes arriving from either side land on the same
 * picture, and `sync` idempotent.
 */

import type { Widget } from "./deck-widgets";
import { q } from "./dom";
import { fmtInt } from "./rates";
import { tokenize } from "./tokenize";

/** The Slide attribute this Widget answers to. */
const ATTR = "data-token-live";

/**
 * The second prompt, the one with the report attached. Read as a flag:
 * `.visible` means the room has pressed → and the real prompt is on screen.
 */
const SWAP = "[data-tk-swap]";

/** Either prompt block. The FIRST is the plain sentence the Slide opens on. */
const MSG = "[data-tk-msg]";

/** Where the chips are written, and the counter above them. */
const CHIPS = "[data-tk-chips]";
const LIVE_N = "[data-tk-live-n]";

/**
 * The billed prompt of the next Slide, to the token. The question itself is
 * ~15 tokens; the rest is the attached report, which this Slide counts but
 * never shows — the chips only ever show what is on screen.
 */
const TK_ATTACHED_TOTAL = 1240;

/**
 * The chips are written as one HTML string, so the prompt's text has to be
 * escaped. One caller, so it lives here rather than in `dom.ts` — that
 * module's bar is a helper more than one Widget uses today.
 */
const escapeHtml = (s: string) =>
  s.replace(
    /[<>&"]/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]!,
  );

/**
 * The live-tokenizer Widget: the prompt on screen, in the model's units.
 */
export const tokenLiveWidget: Widget = {
  attr: ATTR,

  /**
   * Draw whichever prompt the Fragment currently shows.
   *
   * `shown` is not declared: this Widget has no Fragment row, so the registry
   * would hand it 0 in every state.
   */
  sync(slide: HTMLElement): void {
    const swapped = q(slide, SWAP).classList.contains("visible");
    const msg = swapped ? q(slide, SWAP) : q(slide, MSG);
    const raw = q(msg, ".tk-msg-text").textContent || "";
    const toks = tokenize(raw.replace(/\s+/g, " ").trim());
    q(slide, CHIPS).innerHTML = toks
      .slice(-60)
      .map((t) => {
        const sp = t.text.startsWith(" ") ? " data-sp" : "";
        return `<span class="tk-chip"${sp}><span class="t">${escapeHtml(
          t.text.trimStart(),
        )}</span><span class="id">${t.id}</span></span>`;
      })
      .join("");
    // The counter shows the WHOLE billed prompt once swapped, not the sixty
    // chips on screen — the attached report is counted and never shown.
    q(slide, LIVE_N).textContent = fmtInt(
      swapped ? TK_ATTACHED_TOTAL : toks.length,
    );
    // The inline code also recorded this number in the cost dial's `countShown`
    // WeakMap. That entry was written and never read: the map is read only by
    // `countUp`, whose two call sites are the bill table's AIC and EUR cells,
    // and this counter is never counted up. It is dropped rather than carried
    // across a module boundary, where it would couple two Widgets through a
    // shared scope for no effect the room can see.
  },
};
