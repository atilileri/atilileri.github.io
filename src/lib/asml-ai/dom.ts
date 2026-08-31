/**
 * The DOM helpers more than one Widget uses. Spec #106, ADR 0002.
 *
 * The Deck's sixteen Widgets are moving out of one inline `<script>` into one
 * module each. A Widget module must never import from another Widget module —
 * that would put a Slide's behaviour back into a shared scope under a new
 * name. So the handful of helpers that two or more Widgets genuinely share
 * live here, and every Widget imports them from one place.
 *
 * The bar for this module is "more than one Widget uses it, today". A helper
 * used by exactly one Widget stays with that Widget and travels in its own
 * migration commit; moving it here first would only move it twice.
 *
 * Both helpers below build an element and set it up in one expression. That is
 * the whole reason they exist: a Widget that builds a diagram writes one line
 * per node instead of four, so the shape of the diagram is readable in the
 * code that draws it.
 */

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
 * unknown HTML and paints nothing. The two Widgets that draw charts — the
 * benchmark curves and the stop-point — call this one.
 */
export function svgEl(
  tag: string,
  attrs: Record<string, string | number>,
): SVGElement {
  const n = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  return n;
}
