import { defineConfig, devices } from "@playwright/test";

/**
 * The Deck walk (issue #107, spec #106).
 *
 * The walk drives a *preview build*, not the dev server: the room sees the
 * built Deck, and the dev server's HMR client injects markup the goldens
 * would then carry.
 *
 * The port is dedicated so a `npm run dev` or `npm run preview` already open
 * on 4321/4322 cannot be mistaken for the Deck under test.
 */
const PORT = 4331;

export default defineConfig({
  testDir: "./tests",
  // The walk is one long test that owns the browser and steps a stateful
  // Deck. Running anything beside it would only make the screenshots noisy.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  timeout: 20 * 60 * 1000,
  expect: {
    // A screenshot assertion retries until the frame settles. 30s is the cap
    // per state; it belongs here, on `expect`, not inside `toHaveScreenshot`,
    // which takes no `timeout` and silently ignored it until `astro check`
    // caught the mistake.
    timeout: 30_000,
    // Bit-identical was tried first and does not hold. Two sources of noise
    // survive every amount of settling, and both were checked by eye against
    // the diff before this number was chosen:
    //
    //   - Chromium rasterises glyph edges a shade differently depending on
    //     which Slides reveal.js has parked in `past` and `future` around the
    //     current one, so a Slide reached forward and the same Slide reached
    //     backward scatter ~85 antialiased pixels along text.
    //   - On chapter 5's wayfinder Slide, one card sits one composited pixel
    //     lower entering backward than entering forward. Same card, same text,
    //     same column — ~850 pixels of edge.
    //
    // 1200 covers both with headroom. It is 0.08% of a 1600x900 frame, and a
    // Widget painting the wrong Fragment state moves pixels by the tens of
    // thousands, so this buys quiet without buying blindness.
    toHaveScreenshot: { maxDiffPixels: 1200 },
  },
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    // reveal.js is configured for a 1600x900 canvas. Matching it means the
    // Deck is captured at scale 1 and the goldens hold real pixels rather
    // than a resampling of them.
    viewport: { width: 1600, height: 900 },
    deviceScaleFactor: 1,
    trace: "off",
    video: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1600, height: 900 } },
    },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --host 127.0.0.1`,
    url: `http://127.0.0.1:${PORT}/decks/asml-ai/`,
    reuseExistingServer: false,
    timeout: 180_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
