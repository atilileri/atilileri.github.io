/**
 * The one Web Audio plumbing the effects (`./effects-dom.ts`) and the
 * background music (`./music-dom.ts`) share: one `AudioContext` per page,
 * made lazily on the first sound (her first gesture, the browser's autoplay
 * rule), and two buses into it, so each layer has its own level:
 *
 *   effects ── gain 1    ─┐
 *   music   ── gain 0.5  ─┴─► destination
 *
 * The music's tracks are written at levels well under the effects' (see the
 * BALANCE note in `./music-dom.ts`); the bus halves them once more, so the
 * effects always sit on top. No Web Audio means a silent page, never an error.
 *
 * `unlockOnGesture` is the one gesture listener both layers use to let sound
 * start: it keeps listening until the context really runs.
 */

let audio: AudioContext | undefined;
const buses: Partial<Record<Bus, GainNode>> = {};

export type Bus = "effects" | "music";
const LEVEL: Record<Bus, number> = { effects: 1, music: 0.5 };

/** The page's AudioContext, resumed if the browser suspended it; undefined without Web Audio. */
export function context(): AudioContext | undefined {
  try {
    if (!audio) audio = new AudioContext();
    if (audio.state === "suspended") void audio.resume();
    return audio;
  } catch {
    return undefined; // no Web Audio: a silent page
  }
}

/** The page's AudioContext if a sound already made one; never creates it. */
function existing(): AudioContext | undefined {
  return audio;
}

/** What the unlock needs to see of an AudioContext. */
type Unlockable = Pick<EventTarget, "addEventListener"> & { readonly state: string; resume(): Promise<void> };

/**
 * Her keys and clicks unlock audio (the browser's autoplay rule) until it
 * really plays (review B5). On every `pointerdown` and `keydown` (capture
 * phase, so a Game that stops the event still counts) it calls `unlock` —
 * the effects' or the music's, which only lets sound start — and resumes
 * the page's AudioContext if a sound made one that the browser left
 * "suspended": Chrome does that when the first key is one it does not count
 * as a gesture (Esc, a modifier), and a single `once` listener then left
 * the music silent for good. The listener goes when the context reports
 * "running". `target` and `audio` are for `audio-dom.test.ts`.
 */
export function unlockOnGesture(
  unlock: () => void,
  { target = window, audio: peek = existing }: { target?: EventTarget; audio?: () => Unlockable | undefined } = {},
): void {
  const types = ["pointerdown", "keydown"] as const;
  let watched: Unlockable | undefined;
  const done = () => {
    for (const type of types) target.removeEventListener(type, onGesture, { capture: true });
  };
  function onGesture() {
    unlock();
    const ac = peek();
    if (!ac) return; // nothing has sounded yet: keep listening
    if (ac.state === "running") return done();
    void ac.resume();
    if (watched !== ac) {
      watched = ac;
      ac.addEventListener("statechange", () => {
        if (ac.state === "running") done();
      });
    }
  }
  for (const type of types) target.addEventListener(type, onGesture, { capture: true });
}

/** A layer's bus into the speakers (made once). */
export function bus(name: Bus): GainNode | undefined {
  const ac = context();
  if (!ac) return undefined;
  let g = buses[name];
  if (!g) {
    g = ac.createGain();
    g.gain.value = LEVEL[name];
    g.connect(ac.destination);
    buses[name] = g;
  }
  return g;
}

/** A MIDI note number in Hz (69 = A4 = 440). */
export const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

let noiseBuffer: AudioBuffer | undefined;
/** Two seconds of white noise, made once. */
export function noise(ac: AudioContext): AudioBuffer {
  if (!noiseBuffer) {
    noiseBuffer = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}
