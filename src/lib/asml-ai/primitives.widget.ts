/**
 * The primitives Widget — Chapter 2, the `data-primitives` Slide (#112, spec
 * #106, ADR 0002).
 *
 * Eight blocks of a context window in three groups, with a panel beside them.
 * The room walks the blocks with the clicker, or clicks one directly, and the
 * panel shows what that block contains, why it exists and when it is paid for.
 * The blocks' text is server-rendered from `primitiveGroups` in the Deck's
 * page file; this Widget only decides which block is lit and which card is up.
 *
 * ONE STATE, AND IT IS REVEAL'S. The Fragment index selects the block: `shown`
 * is 0 at rest and the panel shows the summary card; `shown` of 1 lights the
 * first block, and so on to 8. So the clicker's → walks the eight blocks with
 * no binding of its own, and a click on a block navigates the Deck to that
 * block's Fragment rather than painting anything itself — pointer and clicker
 * share one state and can never disagree.
 *
 * The Widget holds NO state of its own. The whole picture is derived from
 * `shown`, which is what makes arriving from the left and arriving from the
 * right land on the same picture, and what makes `sync` idempotent.
 *
 * WHAT DID NOT MOVE, AND WHY. The click binding — the listeners on the blocks
 * and on the `← clear` button — is still in the Deck's page file. It navigates
 * with `deck.getIndices` and `deck.slide`, and the contract hands a Widget no
 * reveal.js instance: `init` takes no arguments (ADR 0002). Moving it here
 * would mean changing the contract, which is a decision this migration ticket
 * does not carry. It is the one Widget in the Deck that navigates the Deck.
 */

import type { Widget } from "./deck-widgets";

/**
 * The primitives Widget: the eight blocks of a context window, one lit at a
 * time.
 */
export const primitivesWidget: Widget = {
  attr: "data-primitives",
  fragSel: "[data-prim-frag-row]",

  sync(slide: HTMLElement, shown: number): void {
    // -1 is the summary panel, 0-7 pick a block.
    const index = shown - 1;

    slide.querySelectorAll<HTMLElement>("[data-prim-block]").forEach((b) => {
      const on = Number(b.dataset.primBlock) === index;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", String(on));
    });

    const key = index < 0 ? "summary" : String(index);
    slide
      .querySelectorAll<HTMLElement>("[data-prim-card]")
      .forEach((c) => c.classList.toggle("is-on", c.dataset.primCard === key));

    // The Slide dims its own window while a block is up; that is a CSS rule
    // keyed off this class, not something painted here.
    slide.classList.toggle("has-selection", index >= 0);
  },
};
