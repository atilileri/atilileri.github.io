/**
 * Effects for every Game, added after Atıl's play tests: confetti on a canvas
 * over the page and short sounds made with Web Audio (key ticks, footsteps,
 * an engine, a swoosh, …). This file is the pure side, pinned under
 * `node --test`:
 *
 *   - THE GATE, `createEffects`: the common API every Game's sounds and
 *     visuals go through (`sound`, `loop`, `celebrate`, `miss`). Off means
 *     no-op and every loop stops at once; nothing sounds before her first
 *     gesture. The engine is injected, so the tests record it.
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
import { createSwitchPreference, type SwitchPreference } from "./switch-preference.ts";

/** Her switch's own key: "off" or "on"; missing means on. */
export const EFFECTS_KEY = "bday26:effects";

export type Size = "puff" | "burst" | "shower" | "grand";
export type Sound = "chime" | "rich-chime" | "fanfare" | "grand-fanfare" | "gift-fanfare" | "prize-fanfare" | "jackpot-fanfare" | "sparkle";

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

/** A Gift bought in the shop: the biggest party there is, with its own fanfare. */
export function giftCelebration(rng: () => number): Celebration {
  return { ...celebration("grand", rng), sound: "gift-fanfare" };
}

/** A Small prize won (a Round first lifts the Best score to 95, or a jackpot)
 *  and, in a Prize Game, every later Round at 95 (the shell's
 *  `RoundResult.celebrate`): a shower, smaller than a Gift's, and a short
 *  brass call. */
export function smallPrizeCelebration(rng: () => number): Celebration {
  return { ...celebration("shower", rng), sound: "prize-fanfare" };
}

/** The slot's jackpot: the Small prize's shower, its sound grown into a
 *  bigger brass fanfare with a cascade of coins. One celebration in place
 *  of the prize's, so the two never double up. */
export function jackpotCelebration(rng: () => number): Celebration {
  return { ...smallPrizeCelebration(rng), sound: "jackpot-fanfare" };
}

/** Gifted points from Atıl's corner: a light sparkle, a few stars. */
export function sparkleCelebration(rng: () => number): Celebration {
  return { ...celebration("puff", rng), shapes: ["star"], particles: 18, sound: "sparkle" };
}

/** Renk karıştır: a colour matched (ΔE ≤ 1) — a small puff and the chime. */
export function renkMatchCelebration(rng: () => number): Celebration {
  return celebration("puff", rng);
}

/** `prefers-reduced-motion`: the sound stays; a small puff goes, a big one thins to a few. */
export function forReducedMotion(c: Celebration): Celebration {
  return { ...c, particles: c.size === "puff" ? 0 : Math.floor(c.particles / 10) };
}

// ── the gate ────────────────────────────────────────────────────────

/** Every one-shot sound a Game can ask for, all synthesised in `./effects-dom.ts`. */
export type SoundName =
  | Sound
  | "bonk"
  // Kelime avı
  | "key"
  | "backspace"
  | "flip"
  | "row-good"
  | "row-wrong"
  // Yürüyüş haritası
  | "step"
  // Hollanda'da sürüş
  | "brake"
  | "bell"
  | "chatter"
  | "splash"
  | "bump"
  | "warn"
  // Kayak macerası
  | "jump"
  | "land"
  | "ding"
  | "crash"
  | "checkpoint"
  // Slot makinesi
  | "lever"
  | "reel-stop"
  | "pair-jingle"
  | "no-win"
  // Renk karıştır: a drop of each tube on its own note, a drop taken back,
  // the 12-drop cap, the brush stroke on Enter
  | "paint-red"
  | "paint-yellow"
  | "paint-blue"
  | "paint-white"
  | "paint-black"
  | "paint-lift"
  | "paint-full"
  | "brush"
  // Barista
  | "thud"
  // Bavul hazırla (rotate is "flip", refused "row-wrong", a must-have "row-good")
  | "pick"
  | "place"
  | "take-out"
  | "gate"
  | "zip";

/** The continuous sounds: started, steered by params each frame, stopped. */
export type LoopName = "engine" | "traffic" | "swoosh" | "reels" | "grind" | "pour";

/** A loop's steering, each 0..1 (speed, throttle, …). */
export type LoopParams = Record<string, number>;

/** One running loop voice, as the engine plays it. */
export type LoopVoice = { set(params: LoopParams): void; stop(): void };

/** What really makes the sound and the picture: Web Audio and a canvas in the
 *  browser (`./effects-dom.ts`), a recorder in the tests. */
export type EffectsEngine = {
  play(name: SoundName): void;
  loop(name: LoopName): LoopVoice;
  burst(c: Celebration, from?: unknown): void;
  shake(el: unknown): void;
};

/** A Game's handle on one continuous sound. Every call is safe at any time:
 *  with effects off, or before her first gesture, it only remembers. */
export type Loop = {
  /** Wanted from now on (idempotent), with these params merged in. */
  start(params?: LoopParams): void;
  /** Steer it; does not start a stopped loop. */
  set(params: LoopParams): void;
  /** Not wanted any more. */
  stop(): void;
};

/**
 * THE COMMON API every Game's effects go through. With the switch off every
 * call is a no-op and running loops stop at once; before `unlock` (her first
 * key or click, which the browser needs before any audio) sounds are dropped
 * and wanted loops wait. A loop is a wish (wanted + params) and the engine
 * voice exists only while it is wanted, effects are on and audio is unlocked,
 * so switching back on brings a wanted loop back by itself.
 */
export type Effects = {
  readonly on: boolean;
  /** Flip the switch; returns the new state. */
  toggle(): boolean;
  /** Her first gesture happened: audio may start. */
  unlock(): void;
  /** One short sound. */
  sound(name: SoundName): void;
  /** The handle on a continuous sound; one per name, the same every call. */
  loop(name: LoopName): Loop;
  /** Every loop stops (pause, the leave confirm, a screen over the Round). */
  stopLoops(): void;
  /** Confetti and its sound; `from` aims a small burst at an element. */
  celebrate(c: Celebration, from?: unknown): void;
  /** A wrong answer: the bonk, and `chosen` shakes. */
  miss(chosen?: unknown): void;
  /** Called after every toggle with the new state (the HUD button repaints). */
  onChange(listener: (on: boolean) => void): void;
};

export function createEffects(pref: SwitchPreference, engine: EffectsEngine): Effects {
  let unlocked = false;
  const loops = new Map<LoopName, { wanted: boolean; params: LoopParams; voice?: LoopVoice; sync(): void }>();
  const listeners: ((on: boolean) => void)[] = [];
  const live = () => pref.on && unlocked;
  const syncAll = () => {
    for (const l of loops.values()) l.sync();
  };

  const fx: Effects = {
    get on() {
      return pref.on;
    },
    toggle() {
      const on = pref.toggle();
      syncAll();
      for (const f of listeners) f(on);
      return on;
    },
    unlock() {
      if (unlocked) return;
      unlocked = true;
      syncAll();
    },
    sound(name) {
      if (live()) engine.play(name);
    },
    loop(name) {
      let state = loops.get(name);
      if (!state) {
        const s: { wanted: boolean; params: LoopParams; voice?: LoopVoice; sync(): void } = {
          wanted: false,
          params: {},
          sync() {
            const should = s.wanted && live();
            if (should && !s.voice) {
              s.voice = engine.loop(name);
              s.voice.set({ ...s.params });
            } else if (!should && s.voice) {
              s.voice.stop();
              s.voice = undefined;
            }
          },
        };
        loops.set(name, s);
        state = s;
      }
      const s = state;
      return {
        start(params) {
          if (params) Object.assign(s.params, params);
          const was = s.voice;
          s.wanted = true;
          s.sync();
          if (params && was) was.set(params);
        },
        set(params) {
          Object.assign(s.params, params);
          s.voice?.set(params);
        },
        stop() {
          s.wanted = false;
          s.sync();
        },
      };
    },
    stopLoops() {
      for (const l of loops.values()) l.wanted = false;
      syncAll();
    },
    celebrate(c, from) {
      if (!pref.on) return;
      fx.sound(c.sound);
      if (c.particles > 0) engine.burst(c, from);
    },
    miss(chosen) {
      if (!pref.on) return;
      fx.sound("bonk");
      if (chosen) engine.shake(chosen);
    },
    onChange(listener) {
      listeners.push(listener);
    },
  };
  return fx;
}

export function createEffectsPreference(store: KeyValueStore): SwitchPreference {
  return createSwitchPreference(store, EFFECTS_KEY);
}
