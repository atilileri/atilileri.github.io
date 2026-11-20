/*
 * Tests for her pause in the real-time Games (`./pause-dom.ts`, review L1).
 *
 *   node --test src/lib/bday26/pause-dom.test.ts
 *
 * Seam: `createPause` with its window and document handed in as plain
 * `EventTarget`s, so it runs under `node --test`. A page here is a few
 * recorders: the overlay's `hidden`, the held keys, the frame loop, the
 * effects and the music. The rule pinned is the one `PauseOverlay.astro`
 * announces: P pauses and P resumes; a lost window focus or a hidden tab
 * pauses too and stays paused until P; nothing pauses with no Round running.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createPause } from "./pause-dom.ts";

function openPage() {
  const win = new EventTarget();
  const doc = Object.assign(new EventTarget(), { hidden: false });
  const overlay = { hidden: true };
  const held = new Set<string>(["ArrowUp"]);
  const ran = { start: 0, stop: 0, stopLoops: 0 };
  const holds = new Set<string>();
  let roundRunning = true;
  const pause = createPause({
    canPause: () => roundRunning,
    loop: { start: () => void (ran.start += 1), stop: () => void (ran.stop += 1) },
    keys: held,
    effects: { stopLoops: () => void (ran.stopLoops += 1) },
    music: { hold: (r) => void holds.add(r), release: (r) => void holds.delete(r) },
    overlay,
    win,
    doc,
  });
  const key = (code: string, extra: Partial<{ repeat: boolean; ctrlKey: boolean; altKey: boolean; metaKey: boolean }> = {}) =>
    win.dispatchEvent(Object.assign(new Event("keydown"), { code, repeat: false, ctrlKey: false, altKey: false, metaKey: false, ...extra }));
  return {
    pause,
    overlay,
    held,
    ran,
    holds,
    key,
    win,
    doc,
    endRound: () => void (roundRunning = false),
  };
}

test("P pauses: the overlay shows, held keys let go, the world and its sounds stop, the music holds", () => {
  const p = openPage();
  p.key("KeyP");
  assert.equal(p.pause.paused, true);
  assert.equal(p.overlay.hidden, false);
  assert.equal(p.held.size, 0);
  assert.equal(p.ran.stop, 1);
  assert.equal(p.ran.stopLoops, 1);
  assert.deepEqual([...p.holds], ["pause"]);
});

test("P again resumes: the overlay goes, the music comes back, the world moves on", () => {
  const p = openPage();
  p.key("KeyP");
  p.key("KeyP");
  assert.equal(p.pause.paused, false);
  assert.equal(p.overlay.hidden, true);
  assert.deepEqual([...p.holds], []);
  assert.equal(p.ran.start, 1);
});

test("a held P does not flicker, and Ctrl/Alt/Meta+P is the browser's", () => {
  const p = openPage();
  p.key("KeyP", { repeat: true });
  p.key("KeyP", { ctrlKey: true });
  p.key("KeyP", { altKey: true });
  p.key("KeyP", { metaKey: true });
  assert.equal(p.pause.paused, false);
});

test("a lost window focus pauses, and coming back does not resume: only P does", () => {
  const p = openPage();
  p.win.dispatchEvent(new Event("blur"));
  assert.equal(p.pause.paused, true);
  p.win.dispatchEvent(new Event("focus"));
  assert.equal(p.pause.paused, true);
  p.key("KeyP");
  assert.equal(p.pause.paused, false);
});

test("a hidden tab pauses too, and showing it again does not resume", () => {
  const p = openPage();
  p.doc.hidden = true;
  p.doc.dispatchEvent(new Event("visibilitychange"));
  assert.equal(p.pause.paused, true);
  assert.equal(p.overlay.hidden, false);
  p.doc.hidden = false;
  p.doc.dispatchEvent(new Event("visibilitychange"));
  assert.equal(p.pause.paused, true);
});

test("a second reason to pause while paused changes nothing: one stop, one hold", () => {
  const p = openPage();
  p.key("KeyP");
  p.win.dispatchEvent(new Event("blur"));
  p.doc.hidden = true;
  p.doc.dispatchEvent(new Event("visibilitychange"));
  assert.equal(p.ran.stop, 1);
  assert.equal(p.pause.paused, true);
});

test("with no Round running nothing pauses, though a lost focus still lets go of held keys", () => {
  const p = openPage();
  p.endRound();
  p.key("KeyP");
  assert.equal(p.pause.paused, false);
  p.held.add("ArrowUp");
  p.win.dispatchEvent(new Event("blur"));
  assert.equal(p.pause.paused, false);
  assert.equal(p.overlay.hidden, true);
  assert.equal(p.held.size, 0);
});

test("clear lifts the pause quietly for a new or abandoned Round: overlay hidden, music back, the loop left to the page", () => {
  const p = openPage();
  p.key("KeyP");
  p.pause.clear();
  assert.equal(p.pause.paused, false);
  assert.equal(p.overlay.hidden, true);
  assert.deepEqual([...p.holds], []);
  assert.equal(p.ran.start, 0, "the page starts its loop itself");
});
