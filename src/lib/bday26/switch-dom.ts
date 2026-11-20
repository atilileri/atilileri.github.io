/**
 * The site's on/off switches (review L5): "Efektler: Açık/Kapalı" and
 * "Müzik: Açık/Kapalı", one look and one binder for both. The markup is
 * `src/components/bday26/PrefSwitch.astro` (or its two thin wrappers,
 * `EffectsToggle.astro` and `MusicToggle.astro`); `bindSwitches` finds every
 * `[data-switch="<kind>"]` button, paints its icon, label, `title` and
 * `aria-pressed` from the preference, repaints on every change, and flips
 * the preference on a click. `./effects-dom.ts` (`bindEffectsToggles`) and
 * `./music-dom.ts` (`bindMusicToggles`) call it with their own object.
 * What a switch stores is `./switch-preference.ts`.
 *
 * A click never moves focus (mousedown is cancelled), so Enter and a Game's
 * keys stay where they were; whether Tab reaches the switch is the
 * component's `focusable` prop. No `window` at load: the component's
 * frontmatter reads `SWITCH_LOOK` at build time.
 */

export type SwitchKind = "effects" | "music";

/** Each switch's name and its two icons (on, off). */
export const SWITCH_LOOK: Record<SwitchKind, { name: string; on: string; off: string }> = {
  effects: { name: "Efektler", on: "✨", off: "🔇" },
  music: { name: "Müzik", on: "🎵", off: "🔇" },
};

/** What the switch says: "Efektler: Açık", "Müzik: Kapalı". */
export function switchLabel(kind: SwitchKind, on: boolean): string {
  return `${SWITCH_LOOK[kind].name}: ${on ? "Açık" : "Kapalı"}`;
}

/** What a switch flips: the effects or the music object. */
export type Switchable = {
  readonly on: boolean;
  /** Flip; returns the new state. */
  toggle(): boolean;
  /** A click is her gesture: audio may start. */
  unlock(): void;
  onChange(listener: (on: boolean) => void): void;
};

/** Binds every `[data-switch="<kind>"]` button under `root`: paints it, and
 *  flips `target` on a click (then `afterToggle` with the new state). Once
 *  per page per kind. */
export function bindSwitches(kind: SwitchKind, target: Switchable, options: { afterToggle?: (on: boolean) => void; root?: ParentNode } = {}) {
  const root = options.root ?? document;
  const look = SWITCH_LOOK[kind];
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>(`[data-switch="${kind}"]`));
  function paint() {
    const label = switchLabel(kind, target.on);
    for (const b of buttons) {
      b.setAttribute("aria-pressed", String(target.on));
      b.title = label;
      b.setAttribute("aria-label", label);
      const icon = b.querySelector("[data-switch-icon]");
      if (icon) icon.textContent = target.on ? look.on : look.off;
      const text = b.querySelector("[data-switch-label]");
      if (text) text.textContent = label;
    }
  }
  for (const b of buttons) {
    b.addEventListener("mousedown", (e) => e.preventDefault());
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      target.unlock();
      // Toggle first: `afterToggle?.(target.toggle())` would skip the toggle
      // itself whenever there is no `afterToggle`.
      const on = target.toggle();
      options.afterToggle?.(on);
    });
  }
  target.onChange(paint);
  paint();
}
