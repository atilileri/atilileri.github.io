import { expect, test, type Page } from "@playwright/test";

/**
 * The Deck walk — issue #107, spec #106, ADR 0002.
 *
 * Steps every Slide and every Fragment of the Deck at `/decks/asml-ai`,
 * forward from the first state to the last and then backward from the last to
 * the first, and asserts every state against a committed golden screenshot.
 *
 * The goldens were captured from the Deck as it stands before the first Widget
 * moved into a module. That is the whole point: the walk asserts equivalence
 * against the real Deck, not against a judgement of what the Deck should look
 * like.
 *
 * ── One golden per state, both directions ────────────────────────────────
 *
 * A state's golden is named from the Deck's own coordinates, so the forward
 * pass and the backward pass compare the *same* file. That is what turns the
 * Deck's one unwritten rule — entering a Slide from the left and entering it
 * from the right must land on the same picture — into an assertion instead of
 * a promise repeated in six comments.
 *
 * ── The three animated Widgets ───────────────────────────────────────────
 *
 * Spec #106 names three Widgets that make screenshot comparison noisy, and
 * asks for each to be settled before capture or excluded in writing. Here is
 * the record for all three:
 *
 *   1. The count-up (`data-one-number`, Slide 4.3.2) — SETTLED, not excluded.
 *      `playCount` runs a requestAnimationFrame ramp for 900 ms and then stops
 *      on a fixed final number. SETTLE_MS waits past it, so the golden holds
 *      the landed number. The ramp's intermediate frames are not captured;
 *      only the number the room is left looking at is asserted.
 *
 *   2. The terminal replay (`data-terminal`) — NOT REACHED, so nothing is
 *      excluded. Its controller is still in the Deck's script, inherited from
 *      the capability showcase, but no Slide in this Deck carries the
 *      `data-terminal` attribute. The walk therefore reaches no state in which
 *      it runs. If a Slide ever gains the attribute, its ~4 s replay will not
 *      settle inside SETTLE_MS and this note must be revisited.
 *
 *   3. The Wash (the 780 ms blue wipe on the two Wash dividers) — its
 *      SETTLED END STATE is asserted; the WIPE ITSELF IS EXCLUDED. The Wash is
 *      a CSS animation with `forwards` fill that ends back at `scaleX(0)`,
 *      i.e. invisible. Two things exclude the wipe: `animations: "disabled"`
 *      fast-forwards CSS animations to their end state at capture, and
 *      SETTLE_MS waits past 780 ms anyway. So the goldens for the chapter 1
 *      and chapter 6 Wash dividers show the Slide *after* the Wash has passed.
 *      Whether the Wash fired at all, and whether it looked right mid-flight,
 *      is checked by eye and by nothing else.
 *
 * One more timer is worth naming even though the spec does not: the cost
 * dial's 900 ms `lit` glow on its formula row. SETTLE_MS is set past it too,
 * so the goldens hold the unlit, resting dial.
 */

const DECK_URL = "/decks/asml-ai/";

/**
 * How long to wait on a state before capturing it.
 *
 * It has to clear the longest settling animation the walk can land on:
 * reveal.js's own 400 ms Slide transition, the count-up's 900 ms ramp, the
 * cost dial's 900 ms glow and the Wash's 780 ms wipe — each of which starts on
 * arrival, so they overlap rather than queue. 1300 ms clears all of them with
 * room to spare. Playwright then keeps re-shooting until two frames match
 * before it compares, so this is a floor and not a guess.
 */
const SETTLE_MS = 1300;

/**
 * The number of states the walk visits: every Slide plus every Fragment inside
 * it, counted once. Asserted rather than merely observed, so that a refactor
 * that quietly adds or drops a Fragment fails loudly instead of silently
 * walking a shorter Deck and passing.
 */
const EXPECTED_STATES = 67;

/** A hard stop, so a Deck that never reaches its end cannot hang the run. */
const MAX_STEPS = 500;

const SHOT = { animations: "disabled", caret: "hide" } as const;

/**
 * States that need more tolerance than the run-wide one in
 * `playwright.config.ts`, with the reason. Nothing goes in here without a
 * measured number and an explanation.
 *
 * `h09-v00-f00` is the benchmark chart Slide. The chart measures its own plot
 * box and sizes its viewBox from the box's aspect ratio (`fitPlot`). That box
 * lands at 509.78 px high on some page loads and 510.73 px on others — a
 * sub-pixel layout coin-flip in the Deck itself, present on a visible and fully
 * settled Slide with the fonts already in hand, and unchanged by forcing a
 * re-layout and a redraw. The viewBox rounds to 528 or 529 accordingly and the
 * whole chart shifts one pixel, which is ~2900 differing pixels of line and
 * label edge. It is the Deck's own jitter, not the walk's, and it is the one
 * Widget ADR 0002 singles out for measuring itself. 4000 covers both layouts
 * and still catches a chart that draws the wrong data.
 */
const PER_STATE_MAX_DIFF_PIXELS: Record<string, number> = {
  "h09-v00-f00": 4000,
};

function shotFor(key: string) {
  const override = PER_STATE_MAX_DIFF_PIXELS[key];
  return override === undefined ? SHOT : { ...SHOT, maxDiffPixels: override };
}

/**
 * The Deck's own coordinates for one state: horizontal Slide, vertical Slide
 * inside a stack, and the number of Fragments shown. Reveal reports the
 * Fragment *index*, which is -1 before the first Fragment; the golden names
 * carry the count instead, because that is what the Widgets derive from.
 */
async function stateKey(page: Page): Promise<string> {
  return page.evaluate(() => {
    const deck = (window as unknown as { __deck: RevealLike }).__deck;
    const { h, v, f } = deck.getIndices();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `h${pad(h)}-v${pad(v ?? 0)}-f${pad((f ?? -1) + 1)}`;
  });
}

/**
 * Press the arrow once. Returns false when the Deck did not move, which is how
 * the walk finds each end without being told how long the Deck is.
 */
async function step(page: Page, direction: "next" | "prev"): Promise<boolean> {
  return page.evaluate((dir) => {
    const deck = (window as unknown as { __deck: RevealLike }).__deck;
    const before = JSON.stringify(deck.getIndices());
    deck[dir]();
    return before !== JSON.stringify(deck.getIndices());
  }, direction);
}

/** Wait out the animations listed in this file's header. */
async function settle(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.waitForTimeout(SETTLE_MS);
}

type RevealLike = {
  isReady: () => boolean;
  getIndices: () => { h: number; v?: number; f?: number };
  next: () => void;
  prev: () => void;
};

test("the Deck paints the same picture forward and backward at every state", async ({
  page,
}) => {
  await page.goto(DECK_URL, { waitUntil: "load" });
  // The Deck exposes its reveal.js instance as `window.__deck`. The walk drives
  // that rather than synthesising key presses, so it steps Slides and Fragments
  // by the same call the clicker makes and never races the key handler.
  await page.waitForFunction(() => {
    const deck = (window as unknown as { __deck?: RevealLike }).__deck;
    return Boolean(deck && deck.isReady());
  });
  await page.evaluate(() => document.fonts.ready.then(() => undefined));

  const forward: string[] = [];
  for (let i = 0; i < MAX_STEPS; i++) {
    const key = await stateKey(page);
    forward.push(key);
    await settle(page);
    await expect(page, `forward: ${key}`).toHaveScreenshot(`${key}.png`, shotFor(key));
    if (!(await step(page, "next"))) break;
  }
  expect(forward.length, "the forward pass reached the last state").toBeLessThan(
    MAX_STEPS,
  );
  expect(forward.length, "states visited forward").toBe(EXPECTED_STATES);

  const backward: string[] = [];
  for (let i = 0; i < MAX_STEPS; i++) {
    const key = await stateKey(page);
    backward.push(key);
    await settle(page);
    // The same golden the forward pass asserted. Entering from the right must
    // land on the picture entering from the left landed on.
    await expect(page, `backward: ${key}`).toHaveScreenshot(`${key}.png`, shotFor(key));
    if (!(await step(page, "prev"))) break;
  }
  expect(backward, "the backward pass retraces the forward pass").toEqual(
    [...forward].reverse(),
  );
});
