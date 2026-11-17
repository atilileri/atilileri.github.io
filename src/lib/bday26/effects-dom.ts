/**
 * The browser side of the celebration effects (`./effects.ts` is the pure
 * side and says what they are for). Three parts, all started by
 * `mountEffects()`, once per page:
 *
 *   - THE SWITCH. Every `[data-effects-toggle]` button (the HUD's, from
 *     `EffectsToggle.astro`) shows and flips her preference. It never takes
 *     focus, so Enter and the Game's keys stay the Game's.
 *   - CONFETTI. One fixed canvas over everything (the result veil too),
 *     `pointer-events: none`, made on the first celebration; its frame loop
 *     runs only while particles are alive.
 *   - SOUNDS. Synthesised with Web Audio, no files: a chime for a right
 *     answer (richer, then a fanfare, as the celebration grows) and a soft low
 *     bonk for a wrong one. The AudioContext is made on her first answer —
 *     a key or a click, so Chrome's autoplay rule is met.
 *
 * Nothing here waits: `celebrate` and `miss` start their show and return, so
 * the Game's 1.5 s pause and "any key skips" are untouched. With the switch
 * off they do nothing at all — plain green and red. Under
 * `prefers-reduced-motion` the sound stays and the confetti thins
 * (`forReducedMotion`); the shake is switched off in CSS.
 */
import { openEffectsPreference } from "./browser.ts";
import { forReducedMotion, type Celebration, type Shape, type Sound } from "./effects.ts";

export type Effects = {
  readonly on: boolean;
  /** A right answer: confetti and its sound. `from` aims a small burst at an element. */
  celebrate(c: Celebration, from?: Element | null): void;
  /** A wrong answer: the bonk, and her choice shakes. */
  miss(chosen?: Element | null): void;
};

export function mountEffects(): Effects {
  const pref = openEffectsPreference();
  const toggles = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-effects-toggle]"));

  function paint() {
    for (const t of toggles) {
      const label = `Efektler: ${pref.on ? "Açık" : "Kapalı"}`;
      t.setAttribute("aria-pressed", String(pref.on));
      t.title = label;
      t.setAttribute("aria-label", label);
      const icon = t.querySelector("[data-effects-icon]");
      if (icon) icon.textContent = pref.on ? "✨" : "🔇";
      const text = t.querySelector("[data-effects-label]");
      if (text) text.textContent = label;
    }
  }
  for (const t of toggles) {
    t.addEventListener("mousedown", (e) => e.preventDefault());
    t.addEventListener("click", (e) => {
      e.stopPropagation();
      if (pref.toggle()) play("chime");
      paint();
    });
  }
  paint();

  const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

  return {
    get on() {
      return pref.on;
    },
    celebrate(c, from) {
      if (!pref.on) return;
      play(c.sound);
      const shown = reduced() ? forReducedMotion(c) : c;
      if (shown.particles > 0) burst(shown, from);
    },
    miss(chosen) {
      if (!pref.on) return;
      play("bonk");
      if (chosen instanceof HTMLElement) shake(chosen);
    },
  };
}

function shake(el: HTMLElement) {
  el.classList.remove("bd-shake");
  void el.offsetWidth; // restart the animation if it is still running
  el.classList.add("bd-shake");
  el.addEventListener("animationend", () => el.classList.remove("bd-shake"), { once: true });
}

// ── sounds ─────────────────────────────────────────────────────────

let audio: AudioContext | undefined;

function context(): AudioContext | undefined {
  try {
    audio ??= new AudioContext();
    if (audio.state === "suspended") void audio.resume();
    return audio;
  } catch {
    return undefined; // no Web Audio: a silent celebration
  }
}

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

/** One soft note: a quick attack, an exponential fade. */
function note(ac: AudioContext, out: AudioNode, midi: number, at: number, length: number, type: OscillatorType, level: number) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = hz(midi);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(level, at + 0.012);
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

function play(sound: Sound | "bonk") {
  const ac = context();
  if (!ac) return;
  const out = ac.createGain();
  out.gain.value = 0.35;
  out.connect(ac.destination);
  const t = ac.currentTime + 0.02;
  // A different key each time, so two chimes never sound quite the same.
  const k = [0, 2, 4, 5, 7][Math.floor(Math.random() * 5)]!;
  const C = 72 + k; // C5 and up
  switch (sound) {
    case "chime":
      bell(ac, out, C + 4, t, 0.5);
      bell(ac, out, C + 11, t + 0.09, 0.7);
      break;
    case "rich-chime":
      [0, 4, 7, 12].forEach((d, i) => bell(ac, out, C + d, t + i * 0.07, 0.8, 0.42));
      note(ac, out, C - 12, t, 0.9, "triangle", 0.15);
      break;
    case "fanfare": {
      const B = 60 + k; // C4 and up
      [0, 4, 7].forEach((d, i) => brass(ac, out, B + d, t + i * 0.11, 0.18));
      [0, 4, 7, 12].forEach((d) => brass(ac, out, B + d, t + 0.36, 0.9, 0.16));
      bell(ac, out, B + 24, t + 0.36, 1.0, 0.3);
      break;
    }
    case "grand-fanfare": {
      const B = 60 + k;
      [0, 4, 7, 12, 7, 12].forEach((d, i) => brass(ac, out, B + d, t + i * 0.1, 0.16));
      [0, 4, 7, 12, 16].forEach((d) => brass(ac, out, B + d, t + 0.62, 1.4, 0.14));
      [24, 28, 31, 36].forEach((d, i) => bell(ac, out, B + d, t + 0.62 + i * 0.09, 1.2, 0.25));
      break;
    }
    case "bonk": {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      const filter = ac.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 600;
      osc.type = "sine";
      osc.frequency.setValueAtTime(190, t);
      osc.frequency.exponentialRampToValueAtTime(85, t + 0.22);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.7, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      osc.connect(filter).connect(gain).connect(out);
      osc.start(t);
      osc.stop(t + 0.35);
      break;
    }
  }
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
