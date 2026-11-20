/**
 * The browser side of the background music (`./music.ts` is the pure side:
 * her switch and THE GATE). This module makes the one `music` object a page
 * imports:
 *
 *     import { music } from "../../../lib/bday26/music-dom";
 *     music.play("hafiza");                     // this place's track
 *     music.play("milyoner", { band: 1 });      // the same track: only steers it
 *     music.set({ tension: 1 }); music.stop();
 *
 * GameShell plays a Game's track by itself (its `music` prop), pauses it
 * while the leave confirm is open, and renders the "Müzik: Açık/Kapalı"
 * switch next to "Efektler"; the hub plays "hub" from its own script. A
 * hidden tab is silent and picks the track up again when she comes back.
 * Nothing sounds before her first key or click (the browser's autoplay
 * rule); a track asked for earlier waits for it, and her gestures keep
 * unlocking until audio really runs, so a first key the browser does not
 * count (Esc) cannot leave the music silent (`unlockOnGesture`).
 *
 * THE SWITCH. Every "Müzik" switch (`MusicToggle.astro`) is bound by
 * `bindMusicToggles()`, a thin call to the binder both switches share
 * (`./switch-dom.ts`). Like the effects' switch a click never takes focus,
 * so Enter and the Game's keys stay the Game's.
 *
 * THE SYNTH. Every track is written here as a few bars of chords, bass,
 * melody and percussion for a small step sequencer (16th notes, scheduled
 * a little ahead on the AudioContext's clock, so the loop is seamless and
 * the tempo can change between steps). No files. Every tune is original
 * except the ski Game's, an arrangement of the public-domain "Jingle
 * Bells" chorus (1857); nothing is copied from any modern song or show
 * theme. A track fades in over 0.8 s and out over 0.8 s; a new track fades
 * the old one out first.
 *
 * BALANCE. The effects' celebrations peak near 0.18 of full scale. A
 * track's busiest moment is written to stay near 0.08 and goes through the
 * music bus at 0.5 (`./audio-dom.ts`), so the music sits around a quarter of
 * the celebrations and every effect plays clearly on top of it. The two
 * real-time Games turn this round for their continuous sounds (after
 * Atıl's listen): the ski swoosh peaks at 0.022 and the car's engine hum
 * at 0.022, traffic at 0.014, all under their track's ~0.04 after the bus,
 * while their one-shots (a flag, a bump) still sit on top of it.
 *
 * Nobody has listened to these tracks yet: they want Atıl's ears before
 * the evening.
 */
import { bus, context, hz, noise, unlockOnGesture } from "./audio-dom.ts";
import { openMusicPreference } from "./browser.ts";
import { bindSwitches } from "./switch-dom.ts";
import { createMusic, type MusicEngine, type MusicParams, type TrackName } from "./music.ts";

export type { Music, TrackName } from "./music.ts";

const FADE = 0.8;
/** How far ahead the sequencer schedules, seconds; it wakes every 25 ms. */
const AHEAD = 0.12;

const engine: MusicEngine = { start: (track, params) => startTrack(track, params) };

/** The one music object of this page. */
export const music = createMusic(openMusicPreference(), engine);

// Her keys and clicks unlock the music until the AudioContext really runs.
unlockOnGesture(() => music.unlock());
document.addEventListener("visibilitychange", () => {
  if (document.hidden) music.hold("hidden");
  else music.release("hidden");
});

/** Binds every "Müzik: Açık/Kapalı" switch (`./switch-dom.ts`): paints it,
 *  flips it. Once per page. */
export function bindMusicToggles(root: ParentNode = document) {
  bindSwitches("music", music, { root });
}

// ── the sequencer ──────────────────────────────────────────────────

/** One step to schedule: where, when, how long a 16th is, and the steering. */
type Step = { ac: AudioContext; out: AudioNode; t: number; dur: number; step: number; bar: number; p: MusicParams };

type Track = {
  /** 16th-note steps in one loop. */
  steps: number;
  bpm(p: MusicParams): number;
  play(s: Step): void;
  /** An optional sound of its own the whole track goes through (the car
   *  radio's EQ): given the track's output, returns where notes go. */
  chain?(ac: AudioContext, out: AudioNode): AudioNode;
};

function startTrack(name: TrackName, initial: MusicParams) {
  const ac = context();
  const into = bus("music");
  const track = TRACKS[name];
  if (!ac || !into) return { set() {}, stop() {} };
  const params: MusicParams = { ...initial };
  const out = ac.createGain();
  const now = ac.currentTime;
  out.gain.setValueAtTime(0, now);
  out.gain.linearRampToValueAtTime(1, now + FADE);
  out.connect(into);
  const dest = track.chain ? track.chain(ac, out) : out;

  let step = 0;
  let next = now + 0.05;
  const tick = () => {
    while (next < ac.currentTime + AHEAD) {
      const dur = 60 / track.bpm(params) / 4;
      track.play({ ac, out: dest, t: next, dur, step: step % 16, bar: Math.floor(step / 16), p: params });
      next += dur;
      step = (step + 1) % track.steps;
    }
  };
  tick();
  const timer = window.setInterval(tick, 25);
  let stopped = false;
  return {
    set(p: MusicParams) {
      Object.assign(params, p);
    },
    stop() {
      if (stopped) return;
      stopped = true;
      const at = ac.currentTime;
      out.gain.cancelScheduledValues(at);
      out.gain.setValueAtTime(out.gain.value, at);
      out.gain.linearRampToValueAtTime(0, at + FADE);
      // Keep playing under the fade, then let go.
      window.setTimeout(() => {
        window.clearInterval(timer);
        out.disconnect();
      }, (FADE + AHEAD + 0.3) * 1000);
    },
  };
}

// ── instruments ────────────────────────────────────────────────────

/** A note with a quick attack and an exponential fade over `len` seconds. */
function blip(s: Step, midi: number, at: number, len: number, type: OscillatorType, level: number, attack = 0.01, out: AudioNode = s.out, detune = 0) {
  const { ac } = s;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = hz(midi);
  osc.detune.value = detune;
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(level, at + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, at + len);
  osc.connect(g).connect(out);
  osc.start(at);
  osc.stop(at + len + 0.05);
}

/** A lowpass filter into the track, for one note or chord. */
function filtered(s: Step, cutoff: number, q = 0.7): BiquadFilterNode {
  const lp = s.ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = cutoff;
  lp.Q.value = q;
  lp.connect(s.out);
  return lp;
}

/** A soft sustained chord: two detuned voices a note, slow in and out. */
function pad(s: Step, notes: number[], at: number, len: number, level: number, type: OscillatorType = "triangle", cutoff = 1400, swell = false) {
  const { ac } = s;
  const g = ac.createGain();
  g.gain.setValueAtTime(0, at);
  if (swell) {
    g.gain.linearRampToValueAtTime(level, at + len * 0.95);
  } else {
    g.gain.linearRampToValueAtTime(level, at + Math.min(0.4, len * 0.3));
    g.gain.setValueAtTime(level, at + len * 0.75);
  }
  g.gain.linearRampToValueAtTime(0, at + len);
  g.connect(filtered(s, cutoff));
  for (const m of notes) {
    for (const d of [-7, 7]) {
      const osc = ac.createOscillator();
      osc.type = type;
      osc.frequency.value = hz(m);
      osc.detune.value = d;
      osc.connect(g);
      osc.start(at);
      osc.stop(at + len + 0.05);
    }
  }
}

/** A round bass note: triangle with a sine an octave under. */
function bass(s: Step, midi: number, at: number, len: number, level = 0.06) {
  blip(s, midi, at, len, "triangle", level, 0.008);
  blip(s, midi - 12, at, len, "sine", level * 0.7, 0.008);
}

/** A music-box tine: a pure tone and a faint bright partial, ringing out. */
function tine(s: Step, midi: number, at: number, level = 0.03, len = 1.4) {
  blip(s, midi, at, len, "sine", level, 0.003);
  blip(s, midi + 24, at, len * 0.3, "sine", level * 0.25, 0.002);
}

/** A soft electric-piano note: sine body, a little triangle bite. */
function keys(s: Step, midi: number, at: number, len: number, level = 0.03) {
  blip(s, midi, at, len, "sine", level, 0.006);
  blip(s, midi, at, len * 0.4, "triangle", level * 0.35, 0.004);
}

/** A vibraphone-ish note: two sines a few Hz apart beat like its tremolo. */
function vibe(s: Step, midi: number, at: number, len: number, level = 0.028) {
  blip(s, midi, at, len, "sine", level, 0.004);
  blip(s, midi, at, len, "sine", level * 0.6, 0.004, s.out, 9);
  blip(s, midi + 12, at, len * 0.25, "sine", level * 0.2, 0.003);
}

/** A whistle: a sine with a slow vibrato, eased in. */
function whistle(s: Step, midi: number, at: number, len: number, level = 0.022) {
  const { ac } = s;
  const osc = ac.createOscillator();
  const lfo = ac.createOscillator();
  const depth = ac.createGain();
  const g = ac.createGain();
  osc.type = "sine";
  osc.frequency.value = hz(midi);
  lfo.frequency.value = 5.5;
  depth.gain.value = hz(midi) * 0.008;
  lfo.connect(depth).connect(osc.frequency);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(level, at + 0.05);
  g.gain.setValueAtTime(level, at + len * 0.7);
  g.gain.exponentialRampToValueAtTime(0.0001, at + len);
  osc.connect(g).connect(s.out);
  for (const o of [osc, lfo]) {
    o.start(at);
    o.stop(at + len + 0.05);
  }
}

/** A puff of filtered noise: hats, shakers, claps, risers. */
function noiseHit(s: Step, at: number, len: number, level: number, type: BiquadFilterType, freq: number, q = 1, attack = 0.002, freqTo = freq) {
  const { ac } = s;
  const src = ac.createBufferSource();
  src.buffer = noise(ac);
  src.loop = true;
  const bq = ac.createBiquadFilter();
  bq.type = type;
  bq.Q.value = q;
  bq.frequency.setValueAtTime(freq, at);
  if (freqTo !== freq) bq.frequency.exponentialRampToValueAtTime(freqTo, at + len);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(level, at + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, at + len);
  src.connect(bq).connect(g).connect(s.out);
  src.start(at, Math.random() * 1.5);
  src.stop(at + len + 0.05);
}

const hat = (s: Step, at: number, level = 0.012) => noiseHit(s, at, 0.035, level, "highpass", 7500);
const shaker = (s: Step, at: number, level = 0.008) => noiseHit(s, at, 0.07, level, "bandpass", 5200, 1.2, 0.015);
const clap = (s: Step, at: number, level = 0.02) => noiseHit(s, at, 0.13, level, "bandpass", 1500, 0.9);
const ride = (s: Step, at: number, level = 0.01) => noiseHit(s, at, 0.25, level, "highpass", 6000, 0.6, 0.002);

/** A soft kick: a sine dropping in pitch. */
function kick(s: Step, at: number, level = 0.08) {
  const { ac } = s;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.frequency.setValueAtTime(115, at);
  osc.frequency.exponentialRampToValueAtTime(45, at + 0.14);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(level, at + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.22);
  osc.connect(g).connect(s.out);
  osc.start(at);
  osc.stop(at + 0.25);
}

/** Notes of a melody, by step in its bar: [step, midi, length in steps]. */
type Line = [number, number, number][];
/** The note of `line` that starts on this step, if any. */
const at = (line: Line | undefined, step: number) => line?.find(([st]) => st === step);

// ── the tracks ─────────────────────────────────────────────────────

const TRACKS: Record<TrackName, Track> = {
  /**
   * Oyun salonu: warm and cheerful, not loud. F major, 96 bpm, four bars
   * (F – Dm – B♭ – C): a soft pad, a round bass on 1 and 3, an
   * electric-piano tune, a shaker on the off-beats and a little bell at the
   * turn of the loop.
   */
  hub: {
    steps: 64,
    bpm: () => 96,
    play(s) {
      const { step, bar, t, dur } = s;
      const chords = [[57, 60, 65], [57, 62, 65], [58, 62, 65], [55, 60, 64]];
      const roots = [41, 38, 46, 36];
      const tune: Line[] = [
        [[0, 72, 3], [4, 74, 2], [6, 72, 2], [8, 69, 4], [12, 65, 4]],
        [[0, 69, 3], [4, 72, 2], [6, 74, 2], [8, 77, 6], [14, 76, 2]],
        [[0, 74, 3], [4, 72, 2], [6, 70, 2], [8, 74, 4], [12, 77, 4]],
        [[0, 76, 4], [4, 74, 2], [6, 72, 2], [8, 67, 4], [12, 72, 4]],
      ];
      if (step === 0) pad(s, chords[bar]!, t, dur * 16, 0.018, "triangle", 1100);
      if (step === 0) bass(s, roots[bar]! + 12, t, dur * 6, 0.05);
      if (step === 8) bass(s, roots[bar]! + 19, t, dur * 6, 0.04);
      if (step === 0) kick(s, t, 0.035);
      if (step % 4 === 2) shaker(s, t, 0.006);
      const n = at(tune[bar], step);
      if (n) keys(s, n[1], t, dur * n[2] * 1.3, 0.028);
      if (bar === 3 && step === 14) tine(s, 89, t, 0.012, 1.2);
    },
  },

  /**
   * Milyoner: a tense, pulsing quiz-show bed. A minor (Am – Am – F – E),
   * eighth-note bass through a filter. It grows with the band
   * (`intensity` 0/1/2 from `milyonerIntensity`): faster (92 → 104 → 116
   * bpm), the filter opens, hats then a sixteenth-note arpeggio join, and
   * a stab marks the turn. With `tension` (her "Son kararın mı?") the
   * groove drops to a heartbeat under a slowly swelling chord.
   */
  milyoner: {
    steps: 64,
    bpm: (p) => [92, 104, 116][p.band ?? 0] ?? 92,
    play(s) {
      const { step, bar, t, dur, p } = s;
      const band = p.band ?? 0;
      const roots = [45, 45, 41, 40];
      const chords = [[57, 60, 64], [57, 60, 64], [57, 60, 65], [56, 59, 64]];
      if (p.tension) {
        // A heartbeat, a held dominant swelling, a breath of noise rising.
        if (step === 0 || step === 8) kick(s, t, 0.07);
        if (step === 3 || step === 11) kick(s, t, 0.045);
        if (step === 0) {
          pad(s, [52, 56, 59, 64], t, dur * 16, 0.022, "sawtooth", 700, true);
          noiseHit(s, t, dur * 16, 0.012, "bandpass", 400, 1.5, dur * 14, 3000);
        }
        return;
      }
      const cutoff = [450, 750, 1200][band]!;
      if (step % 2 === 0) {
        const lp = filtered(s, cutoff, 4);
        const m = roots[bar]! + (band >= 1 && step % 4 === 2 ? 12 : 0);
        blip(s, m, t, dur * 1.7, "sawtooth", 0.05, 0.005, lp);
      }
      if (step === 0) pad(s, chords[bar]!, t, dur * 16, 0.012 + band * 0.004, "sawtooth", 500 + band * 300);
      if (step % 8 === 0 || (band >= 1 && step % 4 === 0)) kick(s, t, 0.06);
      if (step % 4 === 0) blip(s, 103, t, 0.03, "sine", 0.01, 0.002); // the clock's tick
      if (band >= 1 && step % 4 === 2) hat(s, t, 0.012);
      if (band >= 2) {
        if (step % 2 === 1) hat(s, t, 0.006);
        const tones = chords[bar]!;
        blip(s, tones[step % 3]! + 12, t, dur * 0.9, "triangle", 0.014, 0.004);
      }
      if (band >= 1 && bar === 3 && step === 12) pad(s, [64, 68, 71], t, dur * 4, 0.02, "sawtooth", 1800);
    },
  },

  /**
   * "Bu nerede?": light and curious, a little travel tune. D major, 108
   * bpm (D – Bm – G – A, the G with a raised fourth for the curious
   * touch): a plucked arpeggio, a bouncy bass, a rim on 2 and 4, a soft
   * shaker, and a whistled call and answer.
   */
  nerede: {
    steps: 64,
    bpm: () => 108,
    play(s) {
      const { step, bar, t, dur } = s;
      const chord = [[62, 66, 69, 74], [59, 62, 66, 71], [55, 59, 61, 67], [57, 61, 64, 69]][bar]!;
      const root = [50, 47, 43, 45][bar]!;
      const order = [0, 1, 2, 1, 3, 2, 1, 2];
      if (step % 2 === 0) {
        const lp = filtered(s, 2200);
        blip(s, chord[order[step / 2]!]!, t, dur * 2.5, "triangle", 0.022, 0.003, lp);
      }
      const b = ([[0, 0, 3], [6, 7, 2], [10, 0, 2], [14, 12, 1]] as Line).find(([st]) => st === step);
      if (b) bass(s, root + b[1], t, dur * b[2], 0.05);
      if (step === 4 || step === 12) clap(s, t, 0.014);
      if (step % 2 === 1) shaker(s, t, 0.005);
      const tune: Line[] = [
        [[0, 81, 2], [2, 78, 2], [4, 76, 4], [8, 78, 2], [10, 81, 2], [12, 83, 4]],
        [],
        [[0, 79, 2], [2, 81, 2], [4, 83, 4], [8, 85, 2], [10, 83, 2], [12, 81, 4]],
        [[0, 78, 6], [8, 76, 6]],
      ];
      const n = at(tune[bar], step);
      if (n) whistle(s, n[1], t, dur * n[2], 0.018);
    },
  },

  /**
   * Hafıza kartları: calm and gentle, a music box. C major, 72 bpm
   * (C – Am – F – G): tines rolling an arpeggio in eighths, a slow tune on
   * top, a warm low pad, no drums.
   */
  hafiza: {
    steps: 64,
    bpm: () => 72,
    play(s) {
      const { step, bar, t, dur } = s;
      const chord = [[72, 76, 79, 84], [69, 72, 76, 81], [65, 69, 72, 77], [67, 71, 74, 79]][bar]!;
      const low = [[48, 55], [45, 52], [41, 48], [43, 50]][bar]!;
      const order = [0, 2, 1, 3, 2, 1, 3, 2];
      if (step % 2 === 0) tine(s, chord[order[step / 2]!]!, t, 0.016, 1.1);
      const tune: Line[] = [
        [[0, 88, 8], [8, 86, 4], [12, 84, 4]],
        [[0, 84, 8], [8, 83, 4], [12, 81, 4]],
        [[0, 81, 8], [8, 84, 4], [12, 89, 4]],
        [[0, 86, 8], [8, 83, 4], [12, 79, 4]],
      ];
      const n = at(tune[bar], step);
      if (n) tine(s, n[1], t, 0.024, 2);
      if (step === 0) pad(s, low, t, dur * 16, 0.02, "sine", 900);
    },
  },

  /**
   * Slot: a jolly casino lounge. G major, 116 bpm, swung (G – Em – Am –
   * D7): a walking bass, a ride cymbal's swing, vibraphone chords on the
   * Charleston beat and a vibraphone tune.
   */
  slot: {
    steps: 64,
    bpm: () => 116,
    play(s) {
      const { step, bar, t, dur } = s;
      // Swing: the off-beat eighth comes late, near the last triplet.
      const when = step % 4 === 2 ? t + dur * 0.6 : t;
      const walk = [[43, 47, 50, 52], [40, 43, 47, 50], [45, 48, 52, 54], [50, 48, 45, 42]][bar]!;
      const chord = [[59, 62, 64, 67], [55, 59, 62, 64], [55, 60, 64, 67], [54, 57, 60, 64]][bar]!;
      if (step % 4 === 0) bass(s, walk[step / 4]!, t, dur * 3.5, 0.05);
      if (step % 4 === 0 || step === 6 || step === 14) ride(s, when, step % 4 === 0 ? 0.009 : 0.006);
      if (step === 4 || step === 12) hat(s, t, 0.01);
      if (step === 0 || step === 6) for (const m of chord) vibe(s, m, when, dur * 3, 0.01);
      const tune: Line[] = [
        [[0, 74, 3], [6, 76, 2], [8, 79, 4], [14, 78, 2]],
        [[0, 76, 6], [8, 74, 2], [10, 71, 2], [12, 74, 4]],
        [[0, 72, 3], [6, 76, 2], [8, 79, 2], [10, 81, 2], [12, 79, 4]],
        [[0, 78, 4], [4, 76, 2], [6, 74, 2], [8, 72, 4], [12, 69, 4]],
      ];
      const n = at(tune[bar], step);
      if (n) vibe(s, n[1], when, dur * n[2] * 1.4, 0.026);
    },
  },

  /**
   * Kayak macerası: a fun sleigh ride. The chorus of "Jingle Bells"
   * (James Lord Pierpont, 1857, public domain), arranged here: C major,
   * 126 bpm, sixteen bars (C C C C | F C D7 G7 | C C C C | F C G7 C).
   * Sleigh bells on every eighth, a bouncy bass (root, octave hop, fifth,
   * pickup), soft piano chords on 2 and 4, the tune on a bright electric
   * piano with a glockenspiel sparkle an octave up.
   */
  kayak: {
    steps: 256,
    bpm: () => 126,
    play(s) {
      const { step, bar, t, dur } = s;
      const C = [60, 64, 67], F = [60, 65, 69], D7 = [60, 62, 66], G7 = [59, 62, 65];
      const chords = [C, C, C, C, F, C, D7, G7, C, C, C, C, F, C, G7, C];
      const roots = [48, 48, 48, 48, 53, 48, 50, 55, 48, 48, 48, 48, 53, 48, 55, 48];
      const chord = chords[bar]!;
      const root = roots[bar]!;
      // The bells: every eighth, the beat a little louder, a light shake between.
      if (step % 2 === 0) sleighBell(s, t, step % 4 === 0 ? 0.014 : 0.009);
      else shaker(s, t, 0.004);
      if (step === 0 || step === 8) kick(s, t, 0.04);
      if (step === 4 || step === 12) clap(s, t, 0.008);
      // The bass bounces: root, a quick octave hop, the fifth, a pickup.
      const b = ([[0, 0, 3], [6, 12, 1], [8, 7, 3], [14, 12, 1]] as Line).find(([st]) => st === step);
      if (b) bass(s, root + b[1], t, dur * (b[2] + 0.5), 0.045);
      if (step === 4 || step === 12) for (const m of chord) keys(s, m, t, dur * 2.5, 0.009);
      const e = 76, g = 79, c = 72, d = 74, f = 77;
      const one: Line = [[0, e, 4], [4, e, 4], [8, e, 8]];
      const three: Line = [[0, e, 4], [4, g, 4], [8, c, 6], [14, d, 2]];
      const five: Line = [[0, f, 4], [4, f, 4], [8, f, 6], [14, f, 2]];
      const six: Line = [[0, f, 4], [4, e, 4], [8, e, 4], [12, e, 2], [14, e, 2]];
      const tune: Line[] = [
        one, one, three, [[0, e, 16]],
        five, six, [[0, e, 4], [4, d, 4], [8, d, 4], [12, e, 4]], [[0, d, 8], [8, g, 8]],
        one, one, three, [[0, e, 16]],
        five, six, [[0, g, 4], [4, g, 4], [8, f, 4], [12, d, 4]], [[0, c, 16]],
      ];
      const n = at(tune[bar], step);
      if (n) {
        keys(s, n[1], t, dur * Math.min(n[2], 6) * 1.2, 0.03);
        tine(s, n[1] + 12, t, 0.008, 0.5);
      }
    },
  },

  /**
   * Hollanda'da sürüş: a relaxed, cheerful tune on the car radio. B♭
   * major, 100 bpm, eight bars (B♭ – Gm – E♭ – F | B♭ – Dm – E♭ – F),
   * original: a round bass, electric-piano chords on the off-beats, a
   * light kick, rim and hat, and an electric-piano tune. Everything goes
   * through the radio (`radio`): a band-limited, slightly warm EQ, with a
   * crackle now and then. A short tuning sweep of static plays whenever a
   * voice starts and whenever the page bumps `tune` (each new Round).
   */
  surus: {
    steps: 128,
    bpm: () => 100,
    chain: radio,
    play(s) {
      const { step, bar, t, dur, p } = s;
      if ((p.tune ?? 0) !== p.tuned) {
        p.tuned = p.tune ?? 0;
        tuning(s, t);
      }
      const Bb = [62, 65, 70], Gm = [62, 67, 70], Eb = [63, 67, 70], F = [60, 65, 69], Dm = [62, 65, 69];
      const chord = [Bb, Gm, Eb, F, Bb, Dm, Eb, F][bar]!;
      const root = [46, 43, 51, 53, 46, 50, 51, 53][bar]!;
      const b = ([[0, 0, 3], [6, 0, 1], [8, 7, 3], [12, 12, 2], [14, 7, 2]] as Line).find(([st]) => st === step);
      if (b) bass(s, root + b[1], t, dur * (b[2] + 0.4), 0.05);
      if (step % 4 === 2) for (const m of chord) keys(s, m, t, dur * 1.4, 0.011);
      if (step === 0 || step === 7 || step === 8) kick(s, t, step === 7 ? 0.03 : 0.05);
      if (step === 4 || step === 12) clap(s, t, 0.012);
      if (step % 2 === 0) hat(s, t, step % 4 === 0 ? 0.008 : 0.011);
      if (step === 0 && Math.random() < 0.35) crackle(s, t + Math.random() * dur * 16);
      const tune: Line[] = [
        [[0, 74, 2], [2, 77, 2], [4, 79, 4], [8, 77, 2], [10, 74, 2], [12, 72, 4]],
        [[0, 70, 2], [2, 72, 2], [4, 74, 6], [12, 79, 4]],
        [[0, 79, 2], [2, 77, 2], [4, 75, 4], [8, 74, 2], [10, 75, 2], [12, 77, 4]],
        [[0, 72, 6], [8, 69, 2], [10, 72, 2], [12, 77, 4]],
        [[0, 82, 4], [4, 81, 2], [6, 79, 2], [8, 77, 4], [12, 74, 4]],
        [[0, 77, 2], [2, 74, 2], [4, 69, 4], [8, 72, 2], [10, 74, 2], [12, 77, 4]],
        [[0, 79, 3], [4, 75, 2], [6, 79, 2], [8, 82, 4], [12, 79, 4]],
        [[0, 77, 6], [8, 72, 2], [10, 74, 2], [12, 72, 4]],
      ];
      const n = at(tune[bar], step);
      if (n) keys(s, n[1], t, dur * n[2] * 1.3, 0.03);
    },
  },

  /**
   * Renk karıştır, "Atölye": a calm painting studio (the prototype on #215,
   * which Atıl played). 68 bpm, four bars of Fmaj7 – Em7 – Dm9 – Cmaj7 (slow,
   * open, a little Lydian): a soft pad, a low bass on the bar, a nylon pluck
   * picking the chord, a music-box tine for a tune that moves only every
   * half bar, and a brush on 2 and 4 you barely hear. Original; its busiest
   * moment stays under the other tracks' ~0.08.
   */
  renk: {
    steps: 64,
    bpm: () => 68,
    play(s) {
      const { step, bar, t, dur } = s;
      const chords = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 64], [48, 52, 55, 59]];
      const roots = [41, 40, 38, 36];
      const tune = [[[0, 76], [8, 72]], [[0, 74], [8, 71]], [[0, 69], [8, 72]], [[0, 71], [10, 67]]];
      const ch = chords[bar]!;
      if (step === 0) {
        pad(s, ch, t, dur * 16, 0.014, "triangle", 900);
        blip(s, roots[bar]!, t, dur * 12, "sine", 0.045, 0.02);
        blip(s, roots[bar]! + 12, t, dur * 8, "triangle", 0.016, 0.02);
      }
      // The nylon pluck: a triangle with a quick bright sine on top.
      const pick = [0, 2, 1, 3, 2, 1, 3, 1];
      if (step % 2 === 0 && step !== 14) {
        const m = ch[pick[step / 2]!]! + 12;
        const level = step === 0 ? 0.026 : 0.018;
        blip(s, m, t, dur * 5, "triangle", level, 0.004);
        blip(s, m + 12, t, dur * 1.25, "sine", level * 0.3, 0.002);
      }
      const n = tune[bar]!.find(([st]) => st === step);
      if (n) tine(s, n[1]! + 12, t, 0.012, 2.2);
      if (step === 4 || step === 12) noiseHit(s, t, 0.22, 0.004, "bandpass", 3000, 0.7, 0.04);
    },
  },

  /**
   * Barista, "Kahve molası": a cosy café loop, original (the prototype's,
   * #216, which Atıl heard and kept). B♭ major, 84 bpm, swung 8ths, four
   * bars of a ii–V–I–VI turnaround (Cm9 – F13 – B♭maj9 – G7): a walking
   * bass, electric-piano chords in a Charleston rhythm, a vibraphone tune,
   * brushes (ride on the beat, a swung shaker) and a soft kick.
   */
  barista: {
    steps: 64,
    bpm: () => 84,
    play(s) {
      const { step, bar, t, dur } = s;
      const sw = step % 4 === 2 ? dur * 0.3 : 0; // swing the off-beat 8ths
      const chords = [[58, 62, 63, 67], [57, 62, 63, 67], [57, 60, 62, 65], [53, 59, 63, 65]][bar]!;
      const walk = [[48, 51, 55, 53], [53, 57, 60, 52], [46, 50, 53, 45], [43, 47, 50, 49]][bar]!;
      const tune: Line[] = [
        [[0, 74, 3], [6, 72, 2], [10, 70, 5]],
        [[0, 72, 2], [4, 69, 2], [8, 67, 6]],
        [[2, 69, 2], [4, 70, 2], [6, 74, 4], [12, 77, 4]],
        [[0, 75, 4], [6, 74, 2], [8, 71, 7]],
      ];
      if (step % 4 === 0) bass(s, walk[step / 4]!, t, dur * 3.6, 0.045);
      if (step === 0) for (const m of chords) keys(s, m, t, dur * 5, 0.014);
      if (step === 6) for (const m of chords) keys(s, m, t + dur * 0.3, dur * 3, 0.011);
      const n = at(tune[bar], step);
      if (n) vibe(s, n[1], t + sw, dur * n[2] * 1.4, 0.024);
      if (step % 4 === 0) noiseHit(s, t, 0.22, 0.008, "highpass", 6500, 0.6);
      if (step % 4 === 2) noiseHit(s, t + sw, 0.08, 0.006, "bandpass", 5000, 1.2, 0.015);
      if (step === 0 || step === 10) kick(s, t, 0.03);
    },
  },

  /**
   * Bavul hazırla, "Yolculuk": a calm, light travel tune, the prototype's
   * (#214). D major, 88 bpm, four bars (D – Bm – G – A), original: a soft
   * "train" shaker on the eighths, a round bass on 1 and 3, plucked chords
   * on the off-beats, a whistled tune, a little bell at the turn.
   */
  bavul: {
    steps: 64,
    bpm: () => 88,
    play(s) {
      const { step, bar, t, dur } = s;
      const chords = [[62, 66, 69], [59, 62, 66], [59, 62, 67], [61, 64, 69]][bar]!;
      const root = [38, 35, 43, 45][bar]!;
      if (step % 2 === 0) shaker(s, t, step % 4 === 0 ? 0.009 : 0.005);
      if (step === 0 || step === 8) bass(s, root, t, dur * 6, 0.05);
      if (step === 6 || step === 14) blip(s, root + 7, t, dur * 2, "triangle", 0.03, 0.008);
      if (step === 4 || step === 10 || step === 12) {
        for (const m of chords) {
          blip(s, m, t, dur * 2.2, "triangle", 0.012, 0.004);
          blip(s, m + 12, t, dur * 1.2, "sine", 0.005, 0.003);
        }
      }
      const tune: Line[] = [
        [[0, 74, 4], [4, 78, 2], [6, 76, 2], [8, 74, 6]],
        [[0, 71, 4], [4, 74, 2], [6, 78, 2], [8, 76, 6]],
        [[0, 74, 3], [4, 71, 2], [6, 74, 2], [8, 79, 4], [12, 78, 4]],
        [[0, 76, 6], [8, 73, 4], [12, 69, 4]],
      ];
      const n = at(tune[bar], step);
      if (n) whistle(s, n[1], t, dur * n[2] * 1.1, 0.018);
      if (bar === 3 && step === 14) tine(s, 86, t, 0.012, 1.2);
    },
  },
};

// ── the ski and the radio's own sounds ─────────────────────────────

/** A sleigh bell: a shake of bright noise and a few high, slightly
 *  inharmonic jingles that ring out quickly. */
function sleighBell(s: Step, at: number, level: number) {
  noiseHit(s, at, 0.08, level, "bandpass", 8500, 1.6, 0.003);
  for (const m of [101, 105, 108]) {
    blip(s, m, at + Math.random() * 0.012, 0.11, "sine", level * 0.35, 0.002, s.out, (Math.random() - 0.5) * 60);
  }
}

/** The car radio: a band-limited (telephone-ish) EQ with a little
 *  presence and a soft saturation for warmth. Returns the chain's input. */
function radio(ac: AudioContext, out: AudioNode): AudioNode {
  const hp = ac.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 280;
  hp.Q.value = 0.7;
  const presence = ac.createBiquadFilter();
  presence.type = "peaking";
  presence.frequency.value = 1500;
  presence.Q.value = 0.8;
  presence.gain.value = 4;
  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 3400;
  lp.Q.value = 0.9;
  // Warmth: drive a gentle tanh curve, then bring the level back.
  const drive = ac.createGain();
  drive.gain.value = 5;
  const shaper = ac.createWaveShaper();
  const curve = new Float32Array(1024);
  for (let i = 0; i < curve.length; i++) {
    const x = (i / (curve.length - 1)) * 2 - 1;
    curve[i] = Math.tanh(1.5 * x) / Math.tanh(1.5);
  }
  shaper.curve = curve;
  const trim = ac.createGain();
  trim.gain.value = 0.15;
  hp.connect(presence).connect(lp).connect(drive).connect(shaper).connect(trim).connect(out);
  return hp;
}

/** Tuning in: a short sweep of static and a faint whistle sliding into place. */
function tuning(s: Step, at: number) {
  noiseHit(s, at, 0.5, 0.05, "bandpass", 700, 2.5, 0.02, 2600);
  const { ac } = s;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(2200, at);
  osc.frequency.exponentialRampToValueAtTime(900, at + 0.4);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(0.012, at + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.45);
  osc.connect(g).connect(s.out);
  osc.start(at);
  osc.stop(at + 0.5);
}

/** A crackle on the air: a tick of bright noise, now and then. */
function crackle(s: Step, at: number) {
  noiseHit(s, at, 0.015, 0.012, "highpass", 2500);
  noiseHit(s, at + 0.04 + Math.random() * 0.05, 0.01, 0.007, "highpass", 3000);
}
