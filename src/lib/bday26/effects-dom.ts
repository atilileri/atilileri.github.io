/**
 * The browser side of the effects (`./effects.ts` is the pure side: the
 * on/off preference, the celebrations, and THE GATE every Game's effects go
 * through). This module makes the one `effects` object every Game page
 * imports:
 *
 *     import { effects } from "../../../lib/bday26/effects-dom";
 *     effects.sound("key");                       // one short sound
 *     const engine = effects.loop("engine");      // a continuous sound:
 *     engine.start({ speed, throttle }); engine.set({ speed }); engine.stop();
 *     effects.celebrate(c, el); effects.miss(el); // confetti + chime / bonk + shake
 *
 * With "Efektler: Kapalı" every call is a no-op and running loops stop the
 * moment she switches; before her first key or click no sound starts (the
 * browser's autoplay rule) and wanted loops wait for it. Loops also stop
 * whenever a shell screen covers the Round (GameShell.astro's script calls
 * `stopLoops`), so a pause, the leave confirm or the result is quiet.
 *
 * THE SWITCH. Every `[data-effects-toggle]` button (the HUD's, from
 * `EffectsToggle.astro`, rendered by GameShell on every Game) is bound by
 * `bindEffectsToggles()`. It never takes focus, so Enter and the Game's keys
 * stay the Game's.
 *
 * THE ENGINE. Sounds are synthesised with Web Audio, no files: short, soft
 * and through the effects bus (`./audio-dom.ts`) so the Games stay balanced. Confetti is one
 * fixed canvas over everything, `pointer-events: none`, its frame loop
 * running only while particles are alive; under `prefers-reduced-motion`
 * the confetti thins (`forReducedMotion`) and the shake is off in CSS.
 *
 * Music is not an effect: background music is `./music-dom.ts` with its own
 * switch, and the piano Games play through `./piano.ts` and
 * ignore this switch.
 */
import { bus, context, hz, noise } from "./audio-dom.ts";
import { openEffectsPreference } from "./browser.ts";
import {
  createEffects,
  forReducedMotion,
  type Celebration,
  type EffectsEngine,
  type LoopName,
  type LoopParams,
  type LoopVoice,
  type Shape,
  type SoundName,
} from "./effects.ts";

export type { Effects, Loop } from "./effects.ts";

const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

const engine: EffectsEngine = {
  play: (name) => play(name),
  loop: (name) => startLoop(name),
  burst(c, from) {
    const shown = reduced() ? forReducedMotion(c) : c;
    if (shown.particles > 0) burst(shown, from instanceof Element ? from : null);
  },
  shake(el) {
    if (el instanceof HTMLElement) shake(el);
  },
};

/** The one effects object of this page: every Game's sounds and visuals. */
export const effects = createEffects(openEffectsPreference(), engine);

// Her first key or click unlocks audio (capture, so a Game that stops the
// event still counts).
for (const type of ["pointerdown", "keydown"] as const) {
  window.addEventListener(type, () => effects.unlock(), { capture: true, once: true });
}
// A hidden tab is silent.
document.addEventListener("visibilitychange", () => {
  if (document.hidden) effects.stopLoops();
});

/** Binds every "Efektler: Açık/Kapalı" button: paints it, flips it. Once per page. */
export function bindEffectsToggles(root: ParentNode = document) {
  const toggles = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-effects-toggle]"));
  function paint() {
    for (const t of toggles) {
      const label = `Efektler: ${effects.on ? "Açık" : "Kapalı"}`;
      t.setAttribute("aria-pressed", String(effects.on));
      t.title = label;
      t.setAttribute("aria-label", label);
      const icon = t.querySelector("[data-effects-icon]");
      if (icon) icon.textContent = effects.on ? "✨" : "🔇";
      const text = t.querySelector("[data-effects-label]");
      if (text) text.textContent = label;
    }
  }
  for (const t of toggles) {
    t.addEventListener("mousedown", (e) => e.preventDefault());
    t.addEventListener("click", (e) => {
      e.stopPropagation();
      effects.unlock();
      if (effects.toggle()) effects.sound("chime");
    });
  }
  effects.onChange(paint);
  paint();
}

function shake(el: HTMLElement) {
  el.classList.remove("bd-shake");
  void el.offsetWidth; // restart the animation if it is still running
  el.classList.add("bd-shake");
  el.addEventListener("animationend", () => el.classList.remove("bd-shake"), { once: true });
}

// ── sounds ─────────────────────────────────────────────────────────

const vary = (x: number, by = 0.08) => x * (1 + (Math.random() - 0.5) * 2 * by);

/** One soft note: a quick attack, an exponential fade. */
function note(ac: AudioContext, out: AudioNode, midi: number, at: number, length: number, type: OscillatorType, level: number) {
  tone(ac, out, hz(midi), hz(midi), at, length, type, level);
}

/** A tone gliding from `f0` to `f1` Hz, with the same soft envelope. */
function tone(ac: AudioContext, out: AudioNode, f0: number, f1: number, at: number, length: number, type: OscillatorType, level: number, attack = 0.012) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(f0, at);
  if (f1 !== f0) osc.frequency.exponentialRampToValueAtTime(f1, at + length);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(level, at + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
  osc.connect(gain).connect(out);
  osc.start(at);
  osc.stop(at + length + 0.05);
}

/** A bell: the note and a quiet octave-and-a-fifth over it. */
function bell(ac: AudioContext, out: AudioNode, midi: number, at: number, length: number, level = 0.5) {
  note(ac, out, midi, at, length, "sine", level);
  note(ac, out, midi + 19, at, length * 0.6, "sine", level * 0.18);
}

/** A soft brass-like note: a sawtooth through a low-pass. */
function brass(ac: AudioContext, out: AudioNode, midi: number, at: number, length: number, level = 0.22) {
  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1800;
  filter.connect(out);
  note(ac, filter, midi, at, length, "sawtooth", level);
  note(ac, filter, midi - 12, at, length, "triangle", level * 0.6);
}

/** One coin landing: a bright metallic ping (two inharmonic partials). */
function coin(ac: AudioContext, out: AudioNode, at: number, level: number) {
  const f = 1900 + Math.random() * 1400;
  tone(ac, out, f, f, at, 0.22, "sine", level, 0.002);
  tone(ac, out, f * 2.4, f * 2.4, at, 0.12, "sine", level * 0.4, 0.002);
}

/** A puff of filtered noise; the filter's frequency glides `f0` → `f1`. */
function hiss(ac: AudioContext, out: AudioNode, at: number, length: number, level: number, filter: BiquadFilterType, f0: number, f1 = f0, q = 1, attack = 0.005) {
  const src = ac.createBufferSource();
  src.buffer = noise(ac);
  const bq = ac.createBiquadFilter();
  bq.type = filter;
  bq.Q.value = q;
  bq.frequency.setValueAtTime(f0, at);
  if (f1 !== f0) bq.frequency.exponentialRampToValueAtTime(f1, at + length);
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(level, at + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
  src.connect(bq).connect(gain).connect(out);
  src.start(at, Math.random() * 1.5);
  src.stop(at + length + 0.05);
}

/** The one-shot sounds, all synthesised (no files, nothing recorded) and
 *  short. BALANCE: the quiz celebrations peak near 0.18 of full scale; every
 *  other one-shot stays at or under that, the frequent ones (key ticks,
 *  footsteps, flips) well under it, and the loops lowest of all, so an
 *  evening of play stays gentle. Low thumps get a little more level than
 *  bright sounds because the ear hears them less. */
const SOUNDS: Partial<Record<SoundName, (ac: AudioContext, out: AudioNode, t: number) => void>> = {
  chime: celebration((ac, out, t, C) => {
    bell(ac, out, C + 4, t, 0.5);
    bell(ac, out, C + 11, t + 0.09, 0.7);
  }),
  "rich-chime": celebration((ac, out, t, C) => {
    [0, 4, 7, 12].forEach((d, i) => bell(ac, out, C + d, t + i * 0.07, 0.8, 0.42));
    note(ac, out, C - 12, t, 0.9, "triangle", 0.15);
  }),
  fanfare: celebration((ac, out, t, C) => {
    const B = C - 12; // C4 and up
    [0, 4, 7].forEach((d, i) => brass(ac, out, B + d, t + i * 0.11, 0.18));
    [0, 4, 7, 12].forEach((d) => brass(ac, out, B + d, t + 0.36, 0.9, 0.16));
    bell(ac, out, B + 24, t + 0.36, 1.0, 0.3);
  }),
  "grand-fanfare": celebration((ac, out, t, C) => {
    const B = C - 12;
    [0, 4, 7, 12, 7, 12].forEach((d, i) => brass(ac, out, B + d, t + i * 0.1, 0.16));
    [0, 4, 7, 12, 16].forEach((d) => brass(ac, out, B + d, t + 0.62, 1.4, 0.14));
    [24, 28, 31, 36].forEach((d, i) => bell(ac, out, B + d, t + 0.62 + i * 0.09, 1.2, 0.25));
  }),
  /** A Gift bought: a snare roll, then a big brass hit with a cymbal and
   *  bells raining down. The biggest sound on the site, still at the quiz
   *  celebrations' 0.35 gain. */
  "gift-fanfare": celebration((ac, out, t, C) => {
    const B = C - 12;
    for (let i = 0; i < 12; i++) hiss(ac, out, t + i * 0.04, 0.05, 0.05 + i * 0.012, "bandpass", 2400, 1800, 0.9, 0.003);
    const hit = t + 0.5;
    hiss(ac, out, hit, 1.6, 0.16, "highpass", 5000, 3500, 0.5, 0.004);
    tone(ac, out, 120, 55, hit, 0.4, "sine", 0.5, 0.004);
    [0, 7, 4, 12].forEach((d, i) => brass(ac, out, B + d, hit + i * 0.12, 0.14));
    [0, 4, 7, 12, 16].forEach((d) => brass(ac, out, B + d, hit + 0.5, 1.6, 0.14));
    [36, 31, 28, 24, 28, 31, 36, 40].forEach((d, i) => bell(ac, out, B + d, hit + 0.5 + i * 0.07, 1, 0.22));
  }),
  /** A Small prize: a short "ta-da-daa" brass call over a bell. */
  "prize-fanfare": celebration((ac, out, t, C) => {
    const B = C - 12;
    brass(ac, out, B + 7, t, 0.12);
    brass(ac, out, B + 7, t + 0.13, 0.12);
    [0, 4, 7, 12].forEach((d) => brass(ac, out, B + d + 5, t + 0.28, 0.9, 0.15));
    bell(ac, out, B + 29, t + 0.28, 1.0, 0.3);
  }),
  /** The slot's jackpot: a longer brass call than the Small prize's, a big
   *  held chord, and a shower of coins ringing down over it. */
  "jackpot-fanfare": celebration((ac, out, t, C) => {
    const B = C - 12;
    [7, 7, 7, 12].forEach((d, i) => brass(ac, out, B + d, t + i * 0.12, i < 3 ? 0.1 : 0.2, 0.15));
    const hit = t + 0.5;
    tone(ac, out, 110, 55, hit, 0.35, "sine", 0.4, 0.004);
    hiss(ac, out, hit, 1.2, 0.1, "highpass", 5000, 3500, 0.5, 0.004);
    [0, 4, 7, 12, 16].forEach((d) => brass(ac, out, B + d, hit, 1.5, 0.13));
    for (let i = 0; i < 22; i++) coin(ac, out, hit + 0.05 + i * 0.065 + Math.random() * 0.04, 0.13);
  }),
  /** Gifted points: a light rising glitter of high bells. */
  sparkle(ac, out, t) {
    const root = 84 + Math.floor(Math.random() * 3) * 2;
    [0, 4, 7, 11, 14, 19].forEach((d, i) => bell(ac, out, root + d, t + i * 0.05, 0.45, 0.06));
    hiss(ac, out, t, 0.4, 0.015, "highpass", 7000, 9000, 0.7, 0.05);
  },
  bonk: celebration((ac, out, t) => {
    const filter = ac.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 600;
    filter.connect(out);
    tone(ac, filter, 190, 85, t, 0.3, "sine", 0.7, 0.01);
  }),
  /** A sent row with a green or yellow in it: two quick rising notes. */
  "row-good"(ac, out, t) {
    bell(ac, out, 79, t, 0.22, 0.08);
    bell(ac, out, 84, t + 0.08, 0.3, 0.08);
  },
  /** A sent row all grey: a soft two-note fall, not a buzzer. */
  "row-wrong"(ac, out, t) {
    note(ac, out, 62, t, 0.16, "triangle", 0.07);
    note(ac, out, 57, t + 0.12, 0.26, "triangle", 0.07);
  },
  // ── Yürüyüş haritası ──
  /** A soft footstep on a dirt trail: a short low scuff. */
  step(ac, out, t) {
    hiss(ac, out, t, 0.07, 0.07, "lowpass", vary(700, 0.2), 250, 0.7, 0.004);
    tone(ac, out, vary(110, 0.1), 70, t, 0.06, "sine", 0.05, 0.004);
  },
  // ── Hollanda'da sürüş ──
  /** Tyres under hard braking: a short, muted whine (toned down after
   *  Atıl's listen: a triangle, not a saw, and well under the music). */
  brake(ac, out, t) {
    const bp = ac.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1900;
    bp.Q.value = 3;
    bp.connect(out);
    const lfo = ac.createOscillator();
    const depth = ac.createGain();
    lfo.frequency.value = 18;
    depth.gain.value = 60;
    lfo.connect(depth);
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(vary(1900, 0.05), t);
    osc.frequency.linearRampToValueAtTime(1650, t + 0.45);
    depth.connect(osc.frequency);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.014, t + 0.06);
    gain.gain.setValueAtTime(0.014, t + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    osc.connect(gain).connect(bp);
    for (const o of [osc, lfo]) {
      o.start(t);
      o.stop(t + 0.65);
    }
    hiss(ac, out, t, 0.45, 0.01, "bandpass", 2400, 1800, 0.8, 0.04);
  },
  /** A bicycle bell: "tring tring", inharmonic partials that ring out. */
  bell(ac, out, t) {
    for (const at of [t, t + 0.16]) {
      const f = vary(2350, 0.03);
      tone(ac, out, f, f, at, 0.5, "sine", 0.06, 0.002);
      tone(ac, out, f * 2.76, f * 2.76, at, 0.25, "sine", 0.02, 0.002);
      tone(ac, out, f * 0.5, f * 0.5, at, 0.12, "triangle", 0.015, 0.002);
    }
  },
  /** Passers-by chatting: a few soft vowel-like murmurs, no words. */
  chatter(ac, out, t) {
    const bp = ac.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = vary(900, 0.2);
    bp.Q.value = 3;
    bp.connect(out);
    const syllables = 4 + Math.floor(Math.random() * 3);
    let at = t;
    for (let i = 0; i < syllables; i++) {
      const len = 0.07 + Math.random() * 0.07;
      const f = 150 + Math.random() * 110;
      tone(ac, bp, f, f * vary(1, 0.15), at, len, "sawtooth", 0.05, 0.015);
      at += len + 0.02 + Math.random() * 0.05;
    }
  },
  /** The canal: a splash of falling noise and a couple of bubbles. */
  splash(ac, out, t) {
    hiss(ac, out, t, 0.6, 0.16, "lowpass", 4000, 300, 0.6, 0.01);
    hiss(ac, out, t + 0.05, 0.35, 0.08, "bandpass", 1800, 600, 1.2, 0.01);
    for (let i = 0; i < 3; i++) {
      const at = t + 0.25 + i * 0.12 + Math.random() * 0.05;
      const f = vary(500, 0.3);
      tone(ac, out, f, f * 1.8, at, 0.08, "sine", 0.04, 0.005);
    }
  },
  /** A curb or a crash: a low thump with a knock on top. */
  bump(ac, out, t) {
    tone(ac, out, 130, 45, t, 0.25, "sine", 0.22, 0.004);
    hiss(ac, out, t, 0.12, 0.12, "lowpass", 900, 200, 0.8, 0.002);
  },
  /** A mistake named: a short, soft two-tone warning (sines, lower and
   *  quieter than at first, so it informs without nagging). */
  warn(ac, out, t) {
    note(ac, out, 76, t, 0.11, "sine", 0.045);
    note(ac, out, 72, t + 0.12, 0.16, "sine", 0.045);
  },
  // ── Kayak macerası ──
  /** A jump: a rising whoosh of air. */
  jump(ac, out, t) {
    hiss(ac, out, t, 0.3, 0.06, "bandpass", 500, 2000, 1.5, 0.04);
  },
  /** Landing on the snow: a soft thud and a puff. */
  land(ac, out, t) {
    tone(ac, out, 95, 45, t, 0.2, "sine", 0.13, 0.004);
    hiss(ac, out, t, 0.18, 0.05, "lowpass", 1300, 300, 0.7, 0.004);
  },
  /** A flag taken: one bright little ding. */
  ding(ac, out, t) {
    bell(ac, out, 91 + Math.floor(Math.random() * 3) * 2, t, 0.35, 0.06);
  },
  /** A fall: a tumble of snow and a low bonk. */
  crash(ac, out, t) {
    hiss(ac, out, t, 0.55, 0.11, "lowpass", 2000, 250, 0.6, 0.006);
    tone(ac, out, 160, 55, t, 0.35, "sine", 0.13, 0.006);
    tone(ac, out, 120, 50, t + 0.12, 0.25, "triangle", 0.055, 0.006);
  },
  /** A checkpoint (or the finish) passed: a short rising chime. */
  checkpoint(ac, out, t) {
    [72, 76, 79, 84].forEach((m, i) => bell(ac, out, m, t + i * 0.07, 0.5, 0.06));
  },
  // ── Slot makinesi ──
  /** The lever pulled: a low mechanical clunk with a latch click on top. */
  lever(ac, out, t) {
    tone(ac, out, 150, 60, t, 0.18, "sine", 0.16, 0.004);
    hiss(ac, out, t, 0.1, 0.09, "lowpass", 1200, 250, 0.8, 0.002);
    hiss(ac, out, t + 0.07, 0.04, 0.05, "bandpass", 2600, 2200, 2.5, 0.002);
  },
  /** A reel stops: one firm click. */
  "reel-stop"(ac, out, t) {
    hiss(ac, out, t, 0.04, 0.08, "bandpass", vary(1800, 0.1), 1400, 2.5, 0.002);
    tone(ac, out, vary(700, 0.05), 420, t, 0.05, "triangle", 0.05, 0.002);
  },
  /** Two alike: a small happy jingle, bells skipping up an arpeggio. */
  "pair-jingle"(ac, out, t) {
    [0, 4, 7, 12].forEach((d, i) => bell(ac, out, 79 + d, t + i * 0.08, i === 3 ? 0.5 : 0.25, 0.09));
  },
  /** None alike: a short, soft "womp womp", falling, not a buzzer. */
  "no-win"(ac, out, t) {
    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1000;
    lp.connect(out);
    tone(ac, lp, 311, 294, t, 0.22, "triangle", 0.07, 0.02);
    tone(ac, lp, 277, 207, t + 0.25, 0.5, "triangle", 0.07, 0.02);
  },
  // ── Kelime avı ──
  /** A soft key tick: a click of noise and a tiny high blip. */
  key(ac, out, t) {
    hiss(ac, out, t, 0.03, 0.06, "bandpass", vary(3200, 0.15), vary(3200, 0.15), 2.5, 0.002);
    tone(ac, out, vary(1500), vary(1100), t, 0.035, "triangle", 0.03, 0.002);
  },
  /** Backspace: a lower, duller tock that slides down. */
  backspace(ac, out, t) {
    hiss(ac, out, t, 0.05, 0.05, "bandpass", 1300, 700, 2, 0.002);
    tone(ac, out, vary(620, 0.04), 380, t, 0.07, "triangle", 0.04, 0.003);
  },
  /** A tile turning over: a quick paper flick. */
  flip(ac, out, t) {
    hiss(ac, out, t, 0.09, 0.05, "bandpass", vary(900, 0.1), 3400, 1.4, 0.01);
    tone(ac, out, vary(700, 0.05), vary(1050, 0.05), t + 0.02, 0.05, "sine", 0.025, 0.004);
  },
  // ── Renk karıştır (the prototype on #215) ──
  // A drop into the paint: a soft round "plip" gliding down onto its tube's
  // note, on a pentatonic, so a recipe plays a little tune.
  "paint-red": paintDrop(67), // G4
  "paint-yellow": paintDrop(72), // C5
  "paint-blue": paintDrop(62), // D4
  "paint-white": paintDrop(76), // E5
  "paint-black": paintDrop(57), // A3
  /** A drop taken back: a short upward lift, quieter than the drop. */
  "paint-lift"(ac, out, t) {
    tone(ac, out, hz(60), hz(67), t, 0.11, "sine", 0.04, 0.006);
  },
  /** The 12th drop is the last: a dull low knock, not a buzzer. */
  "paint-full"(ac, out, t) {
    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 500;
    lp.connect(out);
    tone(ac, lp, 150, 90, t, 0.18, "sine", 0.12, 0.008);
  },
  /** Enter: a soft brush stroke across canvas. */
  brush(ac, out, t) {
    hiss(ac, out, t, 0.32, 0.035, "bandpass", 1200, 3200, 0.8, 0.06);
  },
};

/** Renk karıştır's drop on the tube's note `midi`. */
function paintDrop(midi: number) {
  return (ac: AudioContext, out: AudioNode, t: number) => {
    tone(ac, out, hz(midi + 7), hz(midi), t, 0.16, "sine", 0.07, 0.004);
    tone(ac, out, hz(midi + 12), hz(midi + 12), t + 0.01, 0.08, "sine", 0.012, 0.003);
    hiss(ac, out, t, 0.05, 0.008, "bandpass", 1800, 900, 2, 0.003);
  };
}

/** The quiz celebrations at their first, approved loudness: through a 0.35
 *  gain, in a key drawn fresh (C5 and up) so two chimes never sound the same. */
function celebration(make: (ac: AudioContext, out: AudioNode, t: number, C: number) => void) {
  return (ac: AudioContext, out: AudioNode, t: number) => {
    const g = ac.createGain();
    g.gain.value = 0.35;
    g.connect(out);
    make(ac, g, t, 72 + [0, 2, 4, 5, 7][Math.floor(Math.random() * 5)]!);
  };
}

function play(name: SoundName) {
  const ac = context();
  const make = SOUNDS[name];
  const master = bus("effects");
  if (!ac || !master || !make) return;
  make(ac, master, ac.currentTime + 0.02);
}

// ── loops ──────────────────────────────────────────────────────────

type LoopMaker = (ac: AudioContext, out: AudioNode) => { set(p: LoopParams, now: number): void; nodes: AudioScheduledSourceNode[] };

const smooth = (param: AudioParam, value: number, now: number, tc = 0.08) => param.setTargetAtTime(value, now, tc);

/** A looping noise source, started at a random place. */
function noiseLoop(ac: AudioContext): AudioBufferSourceNode {
  const src = ac.createBufferSource();
  src.buffer = noise(ac);
  src.loop = true;
  src.loopStart = 0;
  src.loopEnd = 2;
  return src;
}

const LOOPS: Partial<Record<LoopName, LoopMaker>> = {
  /** The car's engine. History: the first sawtooth growl was buzzy and too
   *  loud; its replacement (a 58→104 Hz sine plus a triangle, low-passed
   *  near 300–500 Hz) was pleasant but inaudible on Atıl's laptop, because
   *  laptop speakers reproduce almost nothing below ~150 Hz. The harmonic
   *  rebuild (70→160 Hz, level 0.06–0.09) was heard, but Atıl asked for it
   *  louder and lower.
   *
   *  So the sound lives in its harmonics, under a deep fundamental. One
   *  oscillator plays a custom wave, a rounded sum of ten harmonics (no
   *  odd-only hollowness, no saw edge) whose 3rd–8th are kept strong next
   *  to the fundamental: with a 45→100 Hz fundamental they land in the
   *  ~150–600 Hz band small speakers do play, and the ear fills in the low
   *  note it cannot hear (the "missing fundamental"), so it reads as a deep
   *  engine even on a laptop. A soft low-pass (Q 0.6, ~700 Hz idle to
   *  ~1100 Hz full speed and gas) rounds off the top so it sounds deep and
   *  never buzzes; throttle opens it a little, so pressing the gas brightens
   *  the tone as well as raising it. A fast, tiny amplitude flutter (~9 Hz,
   *  ±6%) gives it life like firing cylinders, plus a slow breath. Level
   *  about 0.11 at idle to 0.15 at full gas: well above the radio music
   *  (~0.04 peaks), below the loud one-shots. A gentle compressor on its
   *  own output catches any peak, so it never clips.
   *  Params: speed, throttle (0..1). */
  engine(ac, out) {
    const amps = [0, 1, 0.85, 0.8, 0.72, 0.62, 0.5, 0.36, 0.24, 0.14, 0.08];
    const wave = ac.createPeriodicWave(new Float32Array(amps.length), Float32Array.from(amps));
    const osc = ac.createOscillator();
    osc.setPeriodicWave(wave);
    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.Q.value = 0.6;
    lp.frequency.value = 700;
    const gain = ac.createGain();
    gain.gain.value = 0.0001;
    // The limiter: soft knee, high threshold, so it only touches the peaks.
    const limiter = ac.createDynamicsCompressor();
    limiter.threshold.value = -14;
    limiter.knee.value = 8;
    limiter.ratio.value = 6;
    limiter.attack.value = 0.005;
    limiter.release.value = 0.2;
    osc.connect(lp).connect(gain).connect(limiter).connect(out);
    // The flutter: a small fast wobble in the level, scaled with it.
    const flutter = ac.createOscillator();
    flutter.frequency.value = 9;
    const flutterDepth = ac.createGain();
    flutterDepth.gain.value = 0.007;
    flutter.connect(flutterDepth).connect(gain.gain);
    // A slow, shallow breath, so it lives without wobbling.
    const lfo = ac.createOscillator();
    lfo.frequency.value = 0.7;
    const breath = ac.createGain();
    breath.gain.value = 0.005;
    lfo.connect(breath).connect(gain.gain);
    let speed = 0;
    let throttle = 0;
    return {
      nodes: [osc, flutter, lfo],
      set(p, now) {
        speed = Math.max(0, Math.min(1, p.speed ?? speed));
        throttle = Math.max(0, Math.min(1, p.throttle ?? throttle));
        const f = 45 + speed * 48 + throttle * 7; // 45 Hz idle → 100 Hz flat out
        smooth(osc.frequency, f, now, 0.25);
        // The flutter follows the revs a little, so it quickens too.
        smooth(flutter.frequency, 7 + speed * 5, now, 0.3);
        smooth(lp.frequency, 700 + speed * 250 + throttle * 150, now, 0.25);
        const level = 0.11 + speed * 0.025 + throttle * 0.015;
        smooth(gain.gain, level, now, 0.3);
        smooth(flutterDepth.gain, level * 0.06, now, 0.3);
      },
    };
  },
  /** Skis on snow: a soft, filtered hush under the music (turned well down
   *  after Atıl's listen). A high-pass and a low-pass take the hiss out of
   *  the noise; the level follows her speed on a gentle (squared) curve and
   *  slowly, so a burst of speed swells it rather than snapping it.
   *  Param: speed (0..1). */
  swoosh(ac, out) {
    const src = noiseLoop(ac);
    const hp = ac.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 220;
    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.Q.value = 0.4;
    const gain = ac.createGain();
    gain.gain.value = 0.0001;
    src.connect(hp).connect(lp).connect(gain).connect(out);
    return {
      nodes: [src],
      set(p, now) {
        const v = Math.max(0, Math.min(1, p.speed ?? 0));
        smooth(lp.frequency, 700 + v * 700, now, 0.2);
        smooth(gain.gain, 0.0001 + v * v * 0.022, now, 0.2);
      },
    };
  },
  /** The slot's reels turning: a soft mechanical whirr, band-passed noise
   *  with a quick rattle in its level (about the rate the symbols pass)
   *  over a quiet motor tone. Param: reels, how many still run (0..3); the
   *  whirr thins as each one stops. */
  reels(ac, out) {
    const src = noiseLoop(ac);
    const bp = ac.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1300;
    bp.Q.value = 1.2;
    const gain = ac.createGain();
    gain.gain.value = 0.0001;
    src.connect(bp).connect(gain).connect(out);
    const rattle = ac.createOscillator();
    rattle.type = "square";
    rattle.frequency.value = 18;
    const depth = ac.createGain();
    depth.gain.value = 0.006;
    rattle.connect(depth).connect(gain.gain);
    const motor = ac.createOscillator();
    motor.type = "triangle";
    motor.frequency.value = 230;
    const motorGain = ac.createGain();
    motorGain.gain.value = 0.0001;
    motor.connect(motorGain).connect(out);
    return {
      nodes: [src, rattle, motor],
      set(p, now) {
        const share = Math.max(0, Math.min(3, p.reels ?? 3)) / 3;
        smooth(gain.gain, 0.0001 + share * 0.018, now, 0.04);
        smooth(depth.gain, share * 0.008, now, 0.04);
        smooth(motorGain.gain, 0.0001 + share * 0.012, now, 0.04);
        smooth(motor.frequency, 180 + share * 60, now, 0.06);
      },
    };
  },
  /** Distant traffic: a soft low rumble that breathes. Param: level (0..1). */
  traffic(ac, out) {
    const src = noiseLoop(ac);
    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 260;
    const gain = ac.createGain();
    gain.gain.value = 0.0001;
    const lfo = ac.createOscillator();
    lfo.frequency.value = 0.13;
    const swell = ac.createGain();
    swell.gain.value = 0.004;
    lfo.connect(swell).connect(gain.gain);
    src.connect(lp).connect(gain).connect(out);
    return {
      nodes: [src, lfo],
      set(p, now) {
        smooth(gain.gain, 0.014 * (p.level ?? 1), now, 0.5);
      },
    };
  },
};

/** A continuous sound: faded in, steered smoothly, faded out on stop. */
function startLoop(name: LoopName): LoopVoice {
  const ac = context();
  const make = LOOPS[name];
  const master = bus("effects");
  if (!ac || !master || !make) return { set() {}, stop() {} };
  const out = ac.createGain();
  out.gain.setValueAtTime(0.0001, ac.currentTime);
  out.gain.exponentialRampToValueAtTime(1, ac.currentTime + 0.15);
  out.connect(master);
  const voice = make(ac, out);
  for (const n of voice.nodes) n.start();
  let stopped = false;
  return {
    set(p) {
      if (!stopped) voice.set(p, ac.currentTime);
    },
    stop() {
      if (stopped) return;
      stopped = true;
      const now = ac.currentTime;
      out.gain.cancelScheduledValues(now);
      out.gain.setValueAtTime(out.gain.value || 0.0001, now);
      out.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      for (const n of voice.nodes) n.stop(now + 0.1);
      setTimeout(() => out.disconnect(), 200);
    },
  };
}

// ── confetti ───────────────────────────────────────────────────────

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  spin: number;
  turn: number;
  size: number;
  color: string;
  shape: Shape;
  life: number;
  ttl: number;
};

let canvas: HTMLCanvasElement | undefined;
let particles: Particle[] = [];
let running = false;

function surface(): CanvasRenderingContext2D | null {
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.className = "bd-confetti";
    canvas.setAttribute("aria-hidden", "true");
    document.body.append(canvas);
  }
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  const g = canvas.getContext("2d");
  g?.setTransform(dpr, 0, 0, dpr, 0, 0);
  return g;
}

function burst(c: Celebration, from?: Element | null) {
  if (!surface()) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const falling = c.size === "shower" || c.size === "grand";
  let ox = c.origin.x * w;
  let oy = c.origin.y * h;
  if (from && !falling) {
    const r = from.getBoundingClientRect();
    ox = r.left + r.width * (0.3 + Math.random() * 0.4);
    oy = r.top + r.height / 2;
  }
  const rad = (deg: number) => (deg * Math.PI) / 180;
  for (let i = 0; i < c.particles; i++) {
    const a = rad(c.angle + (Math.random() - 0.5) * c.spread);
    const speed = falling ? 2 + Math.random() * 4 : (c.size === "puff" ? 5 : 8) + Math.random() * 8;
    particles.push({
      // A shower rains across the whole width, from just above the top.
      x: falling ? Math.random() * w : ox,
      y: falling ? -20 - Math.random() * h * 0.5 : oy,
      vx: Math.cos(a) * speed,
      vy: -Math.sin(a) * speed,
      spin: Math.random() * Math.PI * 2,
      turn: (Math.random() - 0.5) * 0.3,
      size: (c.size === "puff" ? 5 : 7) + Math.random() * 6,
      color: c.colors[i % c.colors.length]!,
      shape: c.shapes[Math.floor(Math.random() * c.shapes.length)]!,
      life: 0,
      ttl: (falling ? 200 : c.size === "puff" ? 60 : 110) + Math.random() * 50,
    });
  }
  if (c.size === "grand") {
    // Two side cannons on top of the rain: the biggest one.
    for (const side of [0, 1]) {
      for (let i = 0; i < c.particles / 4; i++) {
        const a = rad((side ? 120 : 60) + (Math.random() - 0.5) * 40);
        const speed = 12 + Math.random() * 10;
        particles.push({
          x: side ? w : 0,
          y: h * 0.8,
          vx: Math.cos(a) * speed,
          vy: -Math.sin(a) * speed,
          spin: Math.random() * 6,
          turn: (Math.random() - 0.5) * 0.3,
          size: 7 + Math.random() * 6,
          color: c.colors[i % c.colors.length]!,
          shape: c.shapes[i % c.shapes.length]!,
          life: 0,
          ttl: 150 + Math.random() * 60,
        });
      }
    }
  }
  if (!running) {
    running = true;
    requestAnimationFrame(frame);
  }
}

function frame() {
  const g = surface();
  if (!g || !canvas) return;
  g.clearRect(0, 0, window.innerWidth, window.innerHeight);
  particles = particles.filter((p) => p.life < p.ttl && p.y < window.innerHeight + 40);
  for (const p of particles) {
    p.life += 1;
    p.vx *= 0.985;
    p.vy = p.vy * 0.985 + 0.18;
    p.x += p.vx + Math.sin(p.life / 9 + p.spin) * 0.6;
    p.y += p.vy;
    p.spin += p.turn;
    g.save();
    g.globalAlpha = Math.min(1, (p.ttl - p.life) / 25);
    g.translate(p.x, p.y);
    g.rotate(p.spin);
    g.fillStyle = p.color;
    draw(g, p.shape, p.size, Math.cos(p.spin * 1.7));
    g.restore();
  }
  if (particles.length) requestAnimationFrame(frame);
  else {
    running = false;
    g.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

/** One piece; `flip` squashes it so it seems to tumble. */
function draw(g: CanvasRenderingContext2D, shape: Shape, s: number, flip: number) {
  g.scale(1, Math.max(0.15, Math.abs(flip)));
  switch (shape) {
    case "square":
      g.fillRect(-s / 2, -s / 2, s, s);
      break;
    case "strip":
      g.fillRect(-s / 5, -s, (2 * s) / 5, 2 * s);
      break;
    case "circle":
      g.beginPath();
      g.arc(0, 0, s / 2, 0, Math.PI * 2);
      g.fill();
      break;
    case "star": {
      g.beginPath();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 ? s / 4 : s / 1.6;
        const a = (i * Math.PI) / 5 - Math.PI / 2;
        g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      g.closePath();
      g.fill();
      break;
    }
  }
}
