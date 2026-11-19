/*
 * Tests for the background music's pure side: her "Müzik: Açık/Kapalı"
 * switch and THE GATE every page's music goes through.
 *
 *   node --test src/lib/bday26/music.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createMusic, createMusicPreference, milyonerIntensity, MUSIC_KEY, type MusicEngine, type TrackName } from "./music.ts";

function memory(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
  };
}

test("music is on for a first visit, and off is remembered under its own key", () => {
  const store = memory();
  assert.equal(createMusicPreference(store).on, true);
  createMusicPreference(store).toggle();
  assert.equal(createMusicPreference(store).on, false);
  assert.equal(store.data.get(MUSIC_KEY), "off");
  assert.equal(MUSIC_KEY, "bday26:music");
  assert.equal(store.data.has("bday26:effects"), false);
});

test("a blocked storage still gives music, on by default, and the switch works for this visit", () => {
  const blocked = {
    getItem: (): string | null => {
      throw new Error("SecurityError");
    },
    setItem: () => {
      throw new Error("QuotaExceeded");
    },
  };
  const pref = createMusicPreference(blocked);
  assert.equal(pref.on, true);
  assert.equal(pref.toggle(), false);
  assert.equal(pref.on, false);
});

/** A recording engine: every voice it starts, and what happened to it. */
function recorder() {
  const log: string[] = [];
  const engine: MusicEngine = {
    start(track: TrackName, params) {
      log.push(`start ${track} ${JSON.stringify(params)}`);
      return {
        set: (p) => void log.push(`set ${track} ${JSON.stringify(p)}`),
        stop: () => void log.push(`stop ${track}`),
      };
    },
  };
  return { log, engine };
}

function onPref(on = true) {
  return createMusicPreference(memory(on ? {} : { [MUSIC_KEY]: "off" }));
}

test("no music before her first gesture; the track asked for starts on it", () => {
  const { log, engine } = recorder();
  const music = createMusic(onPref(), engine);
  music.play("hafiza");
  assert.deepEqual(log, []);
  music.unlock();
  assert.deepEqual(log, ["start hafiza {}"]);
});

test("one track at a time: a new one fades the old out first; the same one again only steers it", () => {
  const { log, engine } = recorder();
  const music = createMusic(onPref(), engine);
  music.unlock();
  music.play("milyoner", { band: 0 });
  music.play("milyoner", { band: 1 });
  music.play("slot");
  assert.deepEqual(log, ["start milyoner {\"band\":0}", "set milyoner {\"band\":1}", "stop milyoner", "start slot {}"]);
});

test("off fades the track out at once; on brings this place's track back, steered as last asked", () => {
  const { log, engine } = recorder();
  const music = createMusic(onPref(), engine);
  const heard: boolean[] = [];
  music.onChange((on) => heard.push(on));
  music.unlock();
  music.play("milyoner", { band: 0 });
  assert.equal(music.toggle(), false);
  music.set({ band: 2 });
  assert.equal(music.toggle(), true);
  assert.deepEqual(log, ["start milyoner {\"band\":0}", "stop milyoner", "start milyoner {\"band\":2}"]);
  assert.deepEqual(heard, [false, true]);
});

test("music switched off on an earlier visit stays silent until she turns it on", () => {
  const { log, engine } = recorder();
  const music = createMusic(onPref(false), engine);
  music.unlock();
  music.play("hub");
  assert.deepEqual(log, []);
  music.toggle();
  assert.deepEqual(log, ["start hub {}"]);
});

test("stop ends the track and forgets it: switching on again brings nothing back", () => {
  const { log, engine } = recorder();
  const music = createMusic(onPref(), engine);
  music.unlock();
  music.play("nerede");
  music.stop();
  music.toggle();
  music.toggle();
  assert.deepEqual(log, ["start nerede {}", "stop nerede"]);
});

test("the leave confirm and a hidden page each pause the music; it comes back only when both are gone", () => {
  const { log, engine } = recorder();
  const music = createMusic(onPref(), engine);
  music.unlock();
  music.play("hafiza");
  music.hold("confirm");
  music.hold("hidden");
  music.release("confirm");
  assert.deepEqual(log, ["start hafiza {}", "stop hafiza"]);
  music.release("hidden");
  assert.deepEqual(log, ["start hafiza {}", "stop hafiza", "start hafiza {}"]);
});

test("a hold is not the switch: turning music on during the leave confirm stays quiet until it closes", () => {
  const { log, engine } = recorder();
  const music = createMusic(onPref(false), engine);
  music.unlock();
  music.play("slot");
  music.hold("confirm");
  music.toggle();
  assert.deepEqual(log, []);
  music.release("confirm");
  assert.deepEqual(log, ["start slot {}"]);
});

test("Milyoner's music grows with the band: Q1–6 calm, Q7–10 tighter, Q11–12 the most", () => {
  assert.deepEqual([1, 6, 7, 10, 11, 12].map(milyonerIntensity), [0, 0, 1, 1, 2, 2]);
});
