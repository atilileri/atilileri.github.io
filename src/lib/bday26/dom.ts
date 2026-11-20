/**
 * The birthday games' small DOM helpers (review L4), shared by the Game
 * pages, the hub, the Proof, the shell and admin instead of a copy on each.
 * Browser side; nothing here touches `document` at load, so a module that
 * imports it still loads under `node --test`.
 */

/** The one element `selector` finds under `root` (the page by default).
 *  Throws when the markup lacks it: a page built without its own markup is
 *  a bug to see at once, not a state to handle. */
export function one<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`bday26: the markup is missing ${selector}`);
  return el;
}

/** Restart a one-shot CSS animation keyed on the class `cls`: drop it, force
 *  a reflow so the browser sees it gone, put it back. With `removeOnEnd`, the
 *  class goes again when the animation ends. */
export function restartAnimation(el: HTMLElement, cls: string, { removeOnEnd = false } = {}): void {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
  if (removeOnEnd) el.addEventListener("animationend", () => el.classList.remove(cls), { once: true });
}

/** The same for an animation keyed on an empty attribute (`[data-hop]`). */
export function restartAttributeAnimation(el: HTMLElement, name: string): void {
  el.removeAttribute(name);
  void el.offsetWidth;
  el.setAttribute(name, "");
}
