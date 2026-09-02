/**
 * The DOM helpers more than one Widget uses. Spec #106, ADR 0002.
 *
 * The Deck's fourteen Widgets are moving out of one inline `<script>` into one
 * module each. A Widget module must never import from another Widget module —
 * that would put a Slide's behaviour back into a shared scope under a new
 * name. So the handful of helpers that two or more Widgets genuinely share
 * live here, and every Widget imports them from one place.
 *
 * The bar for this module is "more than one Widget uses it, today". A helper
 * used by exactly one Widget stays with that Widget and travels in its own
 * migration commit; moving it here first would only move it twice.
 *
 * There are four. `el` and `svgEl` build an element and set it up in one
 * expression. That is the whole reason they exist: a Widget that builds a
 * diagram writes one line per node instead of four, so the shape of the
 * diagram is readable in the code that draws it. `q` is the element lookup
 * and `countFragments` is the Fragment-row count every Widget wants.
 */

/**
 * One element of a Slide, by selector. Throws when nothing matches.
 *
 * A Widget's selectors name elements the Slide's markup ALWAYS carries, so a
 * miss is a broken Slide rather than a state to paint around, and this throws
 * where it happened instead of failing later somewhere else. The selector is
 * in the message because a Widget's selectors are its own — `[data-se-column]`
 * says the session Slide as surely as a Widget name would.
 *
 * Use `slide.querySelector` directly for an element that is genuinely optional.
 */
export function q(root: HTMLElement, sel: string): HTMLElement {
  const node = root.querySelector<HTMLElement>(sel);
  if (!node) throw new Error(`no element matches ${sel}`);
  return node;
}

/**
 * How many Fragments are visible inside `sel`, the Fragment row named by a
 * Widget's `fragSel`.
 *
 * NEVER a count of `.fragment.visible` across the whole Slide: a Slide holds
 * Fragments that belong to no Widget — a Closing line, a callout — so that
 * number would be wrong. The count is always taken INSIDE the row.
 *
 * The registry counts this for every Widget it calls `sync` on. It lives here,
 * and not there, because the session Widget's `resize` handler is not a reveal
 * event, so it is handed no number and has to count the same row itself — and
 * the rule above deserves one home rather than two.
 */
export function countFragments(slide: HTMLElement, sel: string): number {
  const row = slide.querySelector(sel);
  return row ? row.querySelectorAll(".fragment.visible").length : 0;
}

/**
 * Every Slide in the Deck carrying `attr`, the Slide attribute a Widget
 * answers to.
 *
 * `init` runs once at startup, before reveal has moved anywhere, so a Widget
 * that binds a listener or re-measures on resize cannot be handed a Slide by
 * the registry the way `sync` and `enter` are. It has to find its own, and
 * every such Widget walks the document for the same attribute it already
 * declares as `attr`. That walk lives here rather than being written out once
 * per Widget.
 *
 * The Deck renders one Slide per attribute today, but this returns a list: a
 * Slide attribute is markup, and nothing stops a second Slide carrying one.
 */
export function slidesWith(attr: string): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(`[${attr}]`)];
}

/**
 * Build an HTML element, optionally with a class and text.
 *
 * `cls` is omitted for an element that carries no class; `txt` is set only
 * when it is not `null`/`undefined`, so `el("i")` yields an empty element
 * rather than one containing the string "undefined".
 *
 * This is the collapse ADR 0002 asks for: the stochastic Slide's `stochEl`
 * and the hallucination Slide's `halEl` were this function, twice, under two
 * names. They are one function under one name.
 */
export function el(tag: string, cls?: string, txt?: string): HTMLElement {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (txt != null) n.textContent = txt;
  return n;
}

/** The SVG namespace. Private: `svgEl` is the only thing that needs it. */
const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Build an SVG element with its attributes.
 *
 * Every value is stringified, so a caller can pass the numbers it already has
 * — `svgEl("line", { x1: L, x2: R, y1: y, y2: y, class: "grid" })` — instead
 * of formatting coordinates at each call site.
 *
 * Named `svgEl` and not `el` because the two are not interchangeable: an SVG
 * element must be created in the SVG namespace or the browser lays it out as
 * unknown HTML and paints nothing. The Widgets that draw with it are the
 * benchmark curves, the stop-point and the lottery scatter.
 */
export function svgEl(
  tag: string,
  attrs: Record<string, string | number>,
): SVGElement {
  const n = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  return n;
}
