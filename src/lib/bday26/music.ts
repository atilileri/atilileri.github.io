/**
 * Background music for the hub and six Games (Milyoner, "Bu nerede?",
 * Hafıza kartları, the slot machine, the ski and driving Games): short loops synthesised with
 * Web Audio, no files. This file is the pure side, pinned under `node --test`:
 *
 *   - her switch, "Müzik: Açık/Kapalı", under its own `localStorage` key
 *     (`bday26:music`), on by default, built like the effects' switch and
 *     independent of it: UI state, not progress, not in the Save code.
 *   - THE GATE, `createMusic`: one track at a time; it sounds only while the
 *     switch is on, after her first gesture, and while nothing holds it (the
 *     shell's leave confirm, a hidden tab). Switching on, or the last hold
 *     going, brings this place's track back by itself.
 *   - how Milyoner's band steers its track.
 *
 * The browser side — the synth, the fades, the buttons — is
 * `./music-dom.ts`. The piano Games' music (`./piano.ts`) is Game content,
 * not background music, and ignores this switch.
 */
import type { KeyValueStore } from "./ledger.ts";
import { createSwitchPreference, type EffectsPreference } from "./effects.ts";

/** Her music switch's own key: "off" or "on"; missing means on. */
export const MUSIC_KEY = "bday26:music";

export type MusicPreference = EffectsPreference;

export function createMusicPreference(store: KeyValueStore): MusicPreference {
  return createSwitchPreference(store, MUSIC_KEY);
}

/** Milyoner's intensity for question `n`: 0 for Q1–6, 1 for Q7–10, 2 for Q11–12. */
export function milyonerIntensity(n: number): number {
  return n >= 11 ? 2 : n >= 7 ? 1 : 0;
}

/** Every place with its own background music. */
export type TrackName = "hub" | "milyoner" | "nerede" | "hafiza" | "slot" | "kayak" | "surus" | "renk" | "barista";

/** A track's steering (Milyoner's band, its "Son kararın mı?" tension). */
export type MusicParams = Record<string, number>;

/** One playing track, as the engine plays it: faded in on start, out on stop. */
export type MusicVoice = { set(params: MusicParams): void; stop(): void };

/** What really makes the music: Web Audio in the browser, a recorder in the tests. */
export type MusicEngine = { start(track: TrackName, params: MusicParams): MusicVoice };

export type Music = {
  readonly on: boolean;
  /** Flip the switch; returns the new state. */
  toggle(): boolean;
  /** Her first gesture happened: audio may start. */
  unlock(): void;
  /** This place's track, wanted from now on. The same track again only
   *  merges in the params; another one fades the old out first. */
  play(track: TrackName, params?: MusicParams): void;
  /** Steer the wanted track (remembered while it is silent). */
  set(params: MusicParams): void;
  /** No music here any more. */
  stop(): void;
  /** Pause for a reason ("confirm": the shell's leave question, "hidden":
   *  the tab is away). Music resumes when every reason is released. */
  hold(reason: string): void;
  release(reason: string): void;
  /** Called after every toggle with the new state (the buttons repaint). */
  onChange(listener: (on: boolean) => void): void;
};

export function createMusic(pref: MusicPreference, engine: MusicEngine): Music {
  let unlocked = false;
  let wanted: { track: TrackName; params: MusicParams } | undefined;
  let voice: { track: TrackName; voice: MusicVoice } | undefined;
  const listeners: ((on: boolean) => void)[] = [];
  const holds = new Set<string>();

  /** The one rule: a voice plays exactly the wanted track, and only while
   *  the switch is on, audio is unlocked and nothing holds it. */
  function sync() {
    const should = wanted && pref.on && unlocked && holds.size === 0 ? wanted : undefined;
    if (voice && voice.track !== should?.track) {
      voice.voice.stop();
      voice = undefined;
    }
    if (should && !voice) voice = { track: should.track, voice: engine.start(should.track, { ...should.params }) };
  }

  return {
    get on() {
      return pref.on;
    },
    toggle() {
      const on = pref.toggle();
      sync();
      for (const f of listeners) f(on);
      return on;
    },
    unlock() {
      if (unlocked) return;
      unlocked = true;
      sync();
    },
    play(track, params = {}) {
      if (wanted?.track === track) {
        Object.assign(wanted.params, params);
        if (voice && Object.keys(params).length) voice.voice.set(params);
        return;
      }
      wanted = { track, params: { ...params } };
      sync();
    },
    set(params) {
      if (!wanted) return;
      Object.assign(wanted.params, params);
      voice?.voice.set(params);
    },
    stop() {
      wanted = undefined;
      sync();
    },
    hold(reason) {
      holds.add(reason);
      sync();
    },
    release(reason) {
      holds.delete(reason);
      sync();
    },
    onChange(listener) {
      listeners.push(listener);
    },
  };
}
