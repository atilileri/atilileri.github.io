/**
 * Celebration effects for the choice quizzes (Milyoner, "Bu nerede?"), added
 * after Atıl's play test: confetti on a canvas over the page and short sounds
 * made with Web Audio. This file is the pure side, pinned under `node --test`:
 *
 *   - her on/off switch, "Efektler: Açık/Kapalı", kept under its own
 *     `localStorage` key (`bday26:effects`). It is UI state: not progress, not
 *     in the Save code. On by default, shared by every Game. A storage that
 *     throws leaves it on, and the switch then lasts the visit.
 *   - which celebration a right answer gets: its size and sound grow with
 *     Milyoner's band, and its colours, shapes and direction are drawn fresh
 *     each time so two never look the same.
 *
 * The browser side — the canvas, the sounds, the HUD button — is
 * `./effects-dom.ts`; `src/components/bday26/EffectsToggle.astro` is the
 * button's markup.
 */
import type { KeyValueStore } from "./ledger.ts";

/** Her switch's own key: "off" or "on"; missing means on. */
export const EFFECTS_KEY = "bday26:effects";

export type EffectsPreference = {
  readonly on: boolean;
  toggle(): boolean;
};

export type Size = "puff" | "burst" | "shower" | "grand";
export type Sound = "chime" | "rich-chime" | "fanfare" | "grand-fanfare";

export type Shape = "square" | "circle" | "strip" | "star";

export type Celebration = {
  size: Size;
  sound: Sound;
  particles: number;
  /** The confetti's colours, as CSS colours. */
  colors: string[];
  shapes: Shape[];
  /** Where the burst leaves from, as fractions of the screen (0,0 top left). */
  origin: { x: number; y: number };
  /** Which way it flies, degrees: 90 is straight up, 270 straight down. */
  angle: number;
  /** How wide the fan opens, degrees. */
  spread: number;
};

const LOOK: Record<Size, { sound: Sound; particles: number; spread: number }> = {
  puff: { sound: "chime", particles: 28, spread: 50 },
  burst: { sound: "rich-chime", particles: 90, spread: 80 },
  shower: { sound: "fanfare", particles: 200, spread: 40 },
  grand: { sound: "grand-fanfare", particles: 360, spread: 60 },
};

/** The site's warm birthday colours, plus a few party mixes. */
const PALETTES: string[][] = [
  ["#e8735a", "#f6c453", "#5bb98c", "#6aa7e8", "#c486e0"],
  ["#ff8fab", "#ffd166", "#ffffff", "#f4978e", "#fbc4ab"],
  ["#2ec4b6", "#ff9f1c", "#e71d36", "#ffbf69", "#cbf3f0"],
  ["#d4a017", "#f6e27a", "#fff3b0", "#e09f3e", "#ffffff"],
  ["#7b2cbf", "#c77dff", "#ff70a6", "#ffd670", "#70d6ff"],
  ["#06d6a0", "#118ab2", "#ffd166", "#ef476f", "#f8f9fa"],
];
const SHAPES: Shape[] = ["square", "circle", "strip", "star"];

function pick<T>(items: readonly T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length) % items.length]!;
}

function shuffled<T>(items: readonly T[], rng: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** One celebration of this size, its colours, shapes and direction drawn fresh. */
function celebration(size: Size, rng: () => number): Celebration {
  const look = LOOK[size];
  const colors = shuffled(pick(PALETTES, rng), rng).slice(0, 3 + Math.floor(rng() * 3));
  const shapes = shuffled(SHAPES, rng).slice(0, 1 + Math.floor(rng() * SHAPES.length));
  const falling = size === "shower" || size === "grand";
  // Small bursts go up from somewhere over the choices; big ones rain from
  // the top, blown a little to one side.
  const origin = falling ? { x: 0.5, y: 0 } : { x: 0.25 + rng() * 0.5, y: 0.6 + rng() * 0.25 };
  const angle = Math.round((falling ? 270 : 90) + (rng() - 0.5) * 50);
  return { size, sound: look.sound, particles: look.particles, colors, shapes, origin, angle, spread: look.spread };
}

/** Milyoner's right answer: bands Q1–6 easy, Q7–10 medium, Q11–12 hard; 12/12 the most. */
export function milyonerCelebration(questionNumber: number, rng: () => number): Celebration {
  const size: Size = questionNumber >= 12 ? "grand" : questionNumber >= 11 ? "shower" : questionNumber >= 7 ? "burst" : "puff";
  return celebration(size, rng);
}

/** "Bu nerede?": a right answer, any photo. */
export function neredeCelebration(rng: () => number): Celebration {
  return { ...celebration("burst", rng), sound: "chime" };
}

/** A Round with no miss, on the result screen. */
export function perfectRoundCelebration(rng: () => number): Celebration {
  return celebration("grand", rng);
}

/** `prefers-reduced-motion`: the sound stays; a small puff goes, a big one thins to a few. */
export function forReducedMotion(c: Celebration): Celebration {
  return { ...c, particles: c.size === "puff" ? 0 : Math.floor(c.particles / 10) };
}

export function createEffectsPreference(store: KeyValueStore): EffectsPreference {
  let on = true;
  try {
    on = store.getItem(EFFECTS_KEY) !== "off";
  } catch {
    // Storage blocked: effects stay on, the default.
  }
  return {
    get on() {
      return on;
    },
    toggle() {
      on = !on;
      try {
        store.setItem(EFFECTS_KEY, on ? "on" : "off");
      } catch {
        // Quota full or blocked: the switch holds for this visit only.
      }
      return on;
    },
  };
}
