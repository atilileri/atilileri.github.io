/*
 * Tests for the audio unlock (`unlockOnGesture` in `./audio-dom.ts`, review
 * B5): her keys and clicks keep unlocking audio until the page's
 * AudioContext really runs.
 *
 *   node --test src/lib/bday26/audio-dom.test.ts
 *
 * Seam: `unlockOnGesture` with the window handed in as a plain `EventTarget`
 * and the page's AudioContext as a fake whose `state` the test sets, the way
 * Chrome leaves it "suspended" after a key that is not a user gesture (Esc,
 * a modifier) and "running" after one that is.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { unlockOnGesture } from "./audio-dom.ts";

function fakeAudio(state: "suspended" | "running") {
  const ac = Object.assign(new EventTarget(), {
    state: state as string,
    resumes: 0,
    resume() {
      ac.resumes += 1;
      return Promise.resolve();
    },
    /** The browser lets it run (a real gesture's resume took). */
    run() {
      ac.state = "running";
      ac.dispatchEvent(new Event("statechange"));
    },
  });
  return ac;
}

const press = (win: EventTarget) => win.dispatchEvent(new Event("keydown"));
const click = (win: EventTarget) => win.dispatchEvent(new Event("pointerdown"));

test("her first key unlocks, and with the context already running the listener goes", () => {
  const win = new EventTarget();
  const ac = fakeAudio("running");
  let unlocks = 0;
  unlockOnGesture(() => void (unlocks += 1), { target: win, audio: () => ac });
  press(win);
  press(win);
  click(win);
  assert.equal(unlocks, 1);
});

test("a key that leaves the context suspended does not end it: the next key resumes it", () => {
  const win = new EventTarget();
  const ac = fakeAudio("suspended");
  let unlocks = 0;
  unlockOnGesture(() => void (unlocks += 1), { target: win, audio: () => ac });
  press(win); // Esc: no gesture in Chrome's eyes
  assert.equal(ac.resumes, 1);
  click(win); // a real click
  assert.equal(ac.resumes, 2);
  assert.equal(unlocks, 2);
  ac.run();
  press(win);
  assert.equal(unlocks, 2, "running: no more listening");
  assert.equal(ac.resumes, 2);
});

test("before any sound made a context, every gesture still unlocks and none is created", () => {
  const win = new EventTarget();
  let unlocks = 0;
  let ac: ReturnType<typeof fakeAudio> | undefined;
  unlockOnGesture(() => void (unlocks += 1), { target: win, audio: () => ac });
  press(win);
  click(win);
  assert.equal(unlocks, 2);
  // A sound made the context later, outside a gesture: suspended.
  ac = fakeAudio("suspended");
  press(win);
  assert.equal(ac.resumes, 1);
  ac.state = "running";
  press(win);
  assert.equal(unlocks, 4);
  press(win);
  assert.equal(unlocks, 4);
});
