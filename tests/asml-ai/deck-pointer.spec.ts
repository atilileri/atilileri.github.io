import { expect, test, type Locator, type Page } from "@playwright/test";
import { CURVES } from "../../src/lib/asml-ai/curves";
import { MODELS } from "../../src/lib/asml-ai/rates";

/**
 * The pointer spec — issue #124, spec #106, ADR 0002.
 *
 * The Deck walk (`deck-walk.spec.ts`) is a clicker. It presses arrows through
 * all 67 states and photographs each one, which is what a move has to prove
 * and the whole reason it exists. It never touches a mouse, so every pointer
 * behaviour in the Deck is unasserted by it.
 *
 * This spec is the pointer. Same seam — the rendered Deck against a preview
 * build — and a separate file on purpose: the walk is one long test that owns
 * the browser and steps a stateful Deck, and its goldens are the record of
 * what the Deck looked like before the refactor started. It must stay readable
 * as exactly that. Nothing here touches it.
 *
 * ── Scope, and why these three Widgets ───────────────────────────────────
 *
 * Thirteen Widgets are in the registry. Nine bind no listener at all, so the
 * clicker is their only hand and the walk already covers them. Four bind a
 * pointer or a resize listener, and three of them are here:
 *
 *   1. The benchmark chart (`data-bench`) — chip, hover, resize.
 *   2. The cost dial (`data-cost-dial`) — knob drag, bill-row click.
 *   3. The context primitives (`data-primitives`) — block click.
 *
 * The first two are the two eager Widgets, and the pointer is nearly all they
 * do; their clicker behaviour is close to nothing, so the walk proves close to
 * nothing about them. The third is here for a different reason: it is the one
 * Widget in the Deck where the pointer and the clicker drive the SAME state,
 * and its module says they "can never disagree". Nothing checked that. The
 * last test in this file does.
 *
 * The session Slide's `resize` re-measure is the fourth pointer-ish Widget and
 * it is deliberately out. Asserting it means resizing the browser and reading
 * a measured number, which is the noisiest assertion on the list for the least
 * protected behaviour.
 *
 * ── DOM, not pixels, except twice ────────────────────────────────────────
 *
 * Every assertion here reads DOM state. It is steadier than a screenshot and
 * it names the behaviour rather than photographing it.
 *
 * Two assertions are screenshots, because DOM state only proxies what they
 * protect. Both shoot ONE small element, never the page:
 *
 *   - The filtered chart. The filter writes `opacity` on each curve group, so
 *     DOM proves the code ran. It does not prove the room sees a dimmed
 *     family, which is the point of the chip.
 *   - The lit bill row. `is-lit` is a hook for a CSS rule that lives in the
 *     theme file. DOM proves the hook; only a picture proves the rule.
 *
 * ── One thing that is NOT tested here, and why ───────────────────────────
 *
 * The 900 ms knob glow's own appearance. Its DOM hooks are asserted below —
 * `data-hot` on the knob, `.lit` on the formula term, and both cleared when
 * the timer fires. A screenshot of a glow that clears itself after 900 ms is a
 * race, and a racy golden is worse than no golden.
 */

const DECK_URL = "/decks/asml-ai/";

/** The cost dial's glow clears itself after 900 ms. Wait past it, never on it. */
const GLOW_MS = 900;

/** The chart's resize handler debounces for 150 ms. Wait past it. */
const RESIZE_DEBOUNCE_MS = 150;

type RevealLike = {
  isReady: () => boolean;
  getIndices: (slide?: Element) => { h: number; v?: number; f?: number };
  slide: (h: number, v?: number, f?: number) => void;
  next: () => void;
};

/**
 * Open the Deck and wait until reveal.js is ready and the fonts are in hand.
 *
 * Fonts matter even to the DOM assertions: the chart measures its own plot box
 * and the label solver measures text, so a draw before the fonts land is a
 * draw against the wrong widths.
 */
async function openDeck(page: Page): Promise<void> {
  await page.goto(DECK_URL, { waitUntil: "load" });
  await page.waitForFunction(() => {
    const deck = (window as unknown as { __deck?: RevealLike }).__deck;
    return Boolean(deck && deck.isReady());
  });
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

/**
 * Move the room to the Slide carrying `attr`, and return that Slide.
 *
 * The Slide attribute is what a Widget declares, so navigating by it means
 * this spec never carries a Slide number that a re-ordered Deck would break.
 * That is the same reason `slidesWith` exists in `dom.ts`.
 */
async function gotoWidget(page: Page, attr: string): Promise<Locator> {
  await page.evaluate((a) => {
    const deck = (window as unknown as { __deck: RevealLike }).__deck;
    const slide = document.querySelector(`[${a}]`);
    if (!slide) throw new Error(`no Slide carries ${a}`);
    const at = deck.getIndices(slide);
    deck.slide(at.h, at.v ?? 0);
  }, attr);
  // reveal's Slide transition is 400 ms. Arrival work — the cost dial's
  // count-up from zero among it — starts when it ends.
  await page.waitForTimeout(400);
  return page.locator(`[${attr}]`);
}

/** Reveal's Fragment index for the current Slide. -1 before the first one. */
async function fragmentIndex(page: Page): Promise<number> {
  return page.evaluate(() => {
    const deck = (window as unknown as { __deck: RevealLike }).__deck;
    return deck.getIndices().f ?? -1;
  });
}

/** Drag straight up from the middle of `target` by `dy` screen pixels. */
async function dragUp(page: Page, target: Locator, dy: number): Promise<void> {
  const box = await target.boundingBox();
  if (!box) throw new Error("the drag target has no box");
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  // Two moves, not one: the knob only reads a move that follows a
  // `pointerdown`, and a single jump is a less honest drag than a path.
  await page.mouse.move(x, y - dy / 2);
  await page.mouse.move(x, y - dy);
  await page.mouse.up();
}

/** Every number in one column of the bill table, parsed out of its text. */
async function billColumn(slide: Locator, sel: string): Promise<number[]> {
  const texts = await slide.locator(sel).allTextContents();
  return texts.map((t) => Number(t.replace(/[^0-9.]/g, "")));
}

test.describe("the benchmark chart, driven by the pointer", () => {
  test("a legend chip filters the chart to one family, and a second click releases it", async ({
    page,
  }) => {
    await openDeck(page);
    const slide = await gotoWidget(page, "data-bench");
    const legend = slide.locator("[data-bench-legend]");
    const curves = slide.locator("[data-bench-svg] g.curve");

    // Every family is shown at rest, so no curve is dimmed and the legend
    // carries no filtered state.
    await expect(legend).not.toHaveClass(/filtered/);
    const total = await curves.count();
    expect(total, "the chart draws one group per model").toBe(CURVES.length);

    const anthropic = legend.getByRole("button", { name: "Anthropic" });
    await anthropic.click();

    await expect(legend, "the legend says a filter is on").toHaveClass(/filtered/);
    await expect(anthropic, "the picked chip says it is picked").toHaveClass(/on/);
    const lit = await slide
      .locator('[data-bench-svg] g.curve[opacity="1"]')
      .count();
    const anthropicCurves = CURVES.filter((c) => c.fam === "Anthropic").length;
    expect(lit, "only the picked family stays at full opacity").toBe(
      anthropicCurves,
    );
    expect(lit, "the filter dims something").toBeLessThan(total);

    // DOM proves the opacity was written. Only a picture proves the room sees
    // a dimmed family — which is the whole job of the chip.
    await expect(slide.locator(".bench-plot")).toHaveScreenshot(
      "bench-filtered-anthropic.png",
      {
        animations: "disabled",
        // The chart measures its own plot box and its viewBox rounds to 528 or
        // 529 on a sub-pixel layout coin-flip, shifting every line and label by
        // one pixel. `deck-walk.spec.ts` documents the measurement; this is the
        // same jitter on a smaller crop.
        maxDiffPixels: 4000,
      },
    );

    await anthropic.click();
    await expect(legend, "a second click releases the filter").not.toHaveClass(
      /filtered/,
    );
    await expect(anthropic).not.toHaveClass(/on/);
    expect(
      await slide.locator('[data-bench-svg] g.curve[opacity="1"]').count(),
      "releasing the filter brings every family back",
    ).toBe(total);
  });

  test("hovering a point raises the tip with that point's own figures", async ({
    page,
  }) => {
    await openDeck(page);
    const slide = await gotoWidget(page, "data-bench");
    const tip = slide.locator("[data-bench-tip]");
    await expect(tip, "the tip is down until the pointer asks for it").toBeHidden();

    // The generous hit target over each mark, and the only transparent circle
    // the chart draws.
    const targets = slide.locator('[data-bench-svg] circle[fill="transparent"]');
    // `force` because the chart draws one generous hit target per point and
    // they overlap. Which one the browser hands the event to does not matter:
    // the assertions below read the tip's OWN model name and check the figures
    // against that model, so any real point passes and a wrong one fails.
    await targets.first().hover({ force: true });
    await expect(tip).toBeVisible();

    // The tip must describe ONE configuration: the model's name, and the
    // effort, score, cost, tokens and steps of the point under the pointer —
    // not a mixture of two points of the same model.
    const name = await tip.locator("b").first().textContent();
    const curve = CURVES.find((c) => c.name === name);
    expect(curve, `the tip names a model on the leaderboard, got ${name}`).toBeTruthy();
    const text = (await tip.textContent()) ?? "";
    const described = curve!.pts.filter(
      (pt) =>
        text.includes(pt.eff.toLowerCase()) &&
        text.includes(`${pt.rate.toFixed(1)}%`) &&
        text.includes(`$${pt.cost.toFixed(2)}`) &&
        text.includes(pt.tok) &&
        text.includes(String(pt.steps)),
    );
    expect(
      described.length,
      `the tip describes exactly one configuration of ${name}`,
    ).toBe(1);

    await slide.locator(".bench-plot").hover({ position: { x: 2, y: 2 }, force: true });
    await expect(tip, "leaving the plot puts the tip down").toBeHidden();
  });

  test("the tip stays inside the plot when the point it explains is at the right edge", async ({
    page,
  }) => {
    await openDeck(page);
    const slide = await gotoWidget(page, "data-bench");
    const targets = slide.locator('[data-bench-svg] circle[fill="transparent"]');

    // The dearest configuration sits furthest right, because cost runs
    // left-to-right. Its tip has to flip to the left of the pointer or it
    // would hang off the wall.
    const count = await targets.count();
    let rightmost = 0;
    let rightmostX = -Infinity;
    for (let i = 0; i < count; i++) {
      const box = await targets.nth(i).boundingBox();
      if (box && box.x > rightmostX) {
        rightmostX = box.x;
        rightmost = i;
      }
    }
    await targets.nth(rightmost).hover({ force: true });

    const fits = await slide.evaluate((el) => {
      const tip = el.querySelector<HTMLElement>("[data-bench-tip]")!;
      const plot = el.querySelector<HTMLElement>(".bench-plot")!;
      return {
        left: tip.offsetLeft,
        right: tip.offsetLeft + tip.offsetWidth,
        plotWidth: plot.offsetWidth,
      };
    });
    expect(fits.left, "the tip does not run off the left wall").toBeGreaterThanOrEqual(0);
    expect(fits.right, "the tip does not run off the right wall").toBeLessThanOrEqual(
      fits.plotWidth,
    );
  });

  test("a resized window redraws the chart rather than leaving the old marks", async ({
    page,
  }) => {
    await openDeck(page);
    const slide = await gotoWidget(page, "data-bench");
    const svg = slide.locator("[data-bench-svg]");

    // Mark the marks that are on screen now. `drawBench` empties the SVG
    // before it redraws, so a mark that survives a resize is a mark that was
    // never redrawn. This is the assertion, and it is the honest one — see
    // below for what a resize does NOT change.
    await svg.evaluate((el) =>
      el.querySelectorAll("g.curve").forEach((g) => g.setAttribute("data-before", "")),
    );
    const before = await svg.getAttribute("viewBox");

    await page.setViewportSize({ width: 1600, height: 1200 });
    await page.waitForTimeout(RESIZE_DEBOUNCE_MS * 4);

    expect(
      await slide.locator("[data-bench-svg] g.curve[data-before]").count(),
      "no mark from before the resize survives",
    ).toBe(0);
    expect(
      await slide.locator("[data-bench-svg] g.curve").count(),
      "the redraw puts every model back",
    ).toBe(CURVES.length);

    // THE VIEWBOX DOES NOT MOVE, AND THAT IS CORRECT. `fitPlot` shapes the
    // coordinate box to the RATIO of the plot's measured box, and reveal.js
    // scales its 1600x900 canvas uniformly to fit any window. So both sides of
    // the plot's box change by the same factor and the ratio is what it was.
    // Asserting a changed viewBox here was tried first and it fails against a
    // Deck that is working: the room's projector gets the same chart shape at
    // any aspect, and only the redraw itself is observable.
    expect(await svg.getAttribute("viewBox"), "the chart keeps its shape").toBe(
      before,
    );
  });
});

test.describe("the cost dial, driven by the pointer", () => {
  test("dragging a knob moves every figure in the table at once", async ({ page }) => {
    await openDeck(page);
    const slide = await gotoWidget(page, "data-cost-dial");
    // The arrival count-up runs 420 ms from zero. Read the table after it.
    await page.waitForTimeout(600);

    const knob = slide.locator('[data-knob="input"]');
    const knobValue = knob.locator("[data-knob-val]");
    const before = {
      knob: Number((await knobValue.textContent())!.replace(/[^0-9]/g, "")),
      aic: await billColumn(slide, "[data-row-aic]"),
      eur: await billColumn(slide, "[data-row-eur]"),
    };
    expect(before.aic, "one row per model").toHaveLength(MODELS.length);

    // Up is more tokens. The knob reads 220 screen pixels as its full travel.
    await dragUp(page, knob.locator(".bk-track"), 55);

    const after = {
      knob: Number((await knobValue.textContent())!.replace(/[^0-9]/g, "")),
      aic: await billColumn(slide, "[data-row-aic]"),
      eur: await billColumn(slide, "[data-row-eur]"),
    };
    expect(after.knob, "dragging up buys more tokens").toBeGreaterThan(before.knob);
    // THE SIMULTANEITY IS THE ARGUMENT: one shared token count, so one drag
    // has to move every model's bill, not the row under the hand.
    for (let i = 0; i < MODELS.length; i++) {
      expect(after.aic[i], `${MODELS[i].name} costs more AIC`).toBeGreaterThan(
        before.aic[i],
      );
      expect(after.eur[i], `${MODELS[i].name} costs more euro`).toBeGreaterThan(
        before.eur[i],
      );
    }

    const fill = await knob.locator("[data-knob-fill]").evaluate((el) => el.style.height);
    expect(fill, "the knob's fill follows its value").toMatch(/^\d+(\.\d+)?%$/);
  });

  test("a drag lights the knob under the hand and its own term, and the glow clears itself", async ({
    page,
  }) => {
    await openDeck(page);
    const slide = await gotoWidget(page, "data-cost-dial");
    await page.waitForTimeout(600);

    await dragUp(page, slide.locator('[data-knob="output"] .bk-track'), 40);

    // One knob and one term: the drag says which of the three lines of the
    // formula the room is watching move. Read in ONE evaluate, because the
    // glow expires 900 ms after the drag and four retrying assertions would
    // race it.
    const glow = await slide.evaluate((el) => ({
      hot: [...el.querySelectorAll<HTMLElement>("[data-knob][data-hot]")].map(
        (k) => k.dataset.knob,
      ),
      lit: [...el.querySelectorAll<HTMLElement>("[data-term].lit")].map(
        (t) => t.dataset.term,
      ),
    }));
    expect(glow.hot, "the knob under the hand is the hot one").toEqual(["output"]);
    expect(glow.lit, "its own term in the formula is the lit one").toEqual(["output"]);

    // The glow clears itself, so the Slide is left at rest with no help.
    await page.waitForTimeout(GLOW_MS + 400);
    expect(
      await slide.locator("[data-knob][data-hot]").count(),
      "no knob stays hot",
    ).toBe(0);
    expect(
      await slide.locator(".bt-formula .lit").count(),
      "no formula term stays lit",
    ).toBe(0);
  });

  test("clicking a bill row lifts it, and a second click releases it", async ({
    page,
  }) => {
    await openDeck(page);
    const slide = await gotoWidget(page, "data-cost-dial");
    await page.waitForTimeout(600);

    const table = slide.locator("[data-bill-table]");
    const rows = slide.locator("[data-bill-row]");
    await expect(table, "no row is lifted at rest").not.toHaveClass(/has-lit/);

    // The Presenter's "start on Flash, then reach for Opus" needs something to
    // click. One row at a time, and the table dims the rest.
    // The model name cell, not the row's centre: the knob cell has `rowspan`
    // over every row, so the centre of a row is a knob.
    await rows.nth(2).locator(".bt-model").click();
    await expect(table).toHaveClass(/has-lit/);
    await expect(rows.nth(2)).toHaveClass(/is-lit/);
    expect(await slide.locator("[data-bill-row].is-lit").count(), "one row").toBe(1);

    // `is-lit` is a hook for a rule in the theme file. DOM proves the hook.
    // Shot after the arrival glow is long gone, so no timer is in the frame.
    await expect(table).toHaveScreenshot("bill-row-lit.png", {
      animations: "disabled",
    });

    await rows.nth(2).locator(".bt-model").click();
    await expect(table, "a second click puts the row back").not.toHaveClass(/has-lit/);
    expect(await slide.locator("[data-bill-row].is-lit").count(), "no row").toBe(0);
  });

  test("a click on a knob does not also count as a click on the row it sits in", async ({
    page,
  }) => {
    await openDeck(page);
    const slide = await gotoWidget(page, "data-cost-dial");
    await page.waitForTimeout(600);

    // The knob cell has `rowspan` over every row, so it lives inside the FIRST
    // one. Without the guard, reaching for a knob would lift that row.
    await slide.locator('[data-knob="cached"] .bk-track').click();
    expect(
      await slide.locator("[data-bill-row].is-lit").count(),
      "reaching for a knob lifts no row",
    ).toBe(0);

    await dragUp(page, slide.locator('[data-knob="cached"] .bk-track'), 30);
    expect(
      await slide.locator("[data-bill-row].is-lit").count(),
      "dragging a knob lifts no row",
    ).toBe(0);
  });
});

test.describe("the context primitives, driven by the pointer", () => {
  /** What the Slide is showing: the lit block, the card up, and the dimming. */
  async function panelState(slide: Locator) {
    return slide.evaluate((el) => ({
      lit: [...el.querySelectorAll<HTMLElement>("[data-prim-block].is-on")].map(
        (b) => b.dataset.primBlock,
      ),
      pressed: [...el.querySelectorAll<HTMLElement>('[data-prim-block][aria-pressed="true"]')].map(
        (b) => b.dataset.primBlock,
      ),
      card: [...el.querySelectorAll<HTMLElement>("[data-prim-card].is-on")].map(
        (c) => c.dataset.primCard,
      ),
      dimmed: el.classList.contains("has-selection"),
    }));
  }

  test("the pointer and the clicker land on the same picture", async ({ page }) => {
    await openDeck(page);
    const slide = await gotoWidget(page, "data-primitives");

    // THE RULE THIS WIDGET EXISTS FOR. A block click does not paint: it moves
    // the Deck to that block's Fragment and lets `sync` paint from there. So
    // the two hands share one state and cannot disagree. Nothing checked it
    // until this test.
    const block = 3;
    await slide.locator(`[data-prim-block="${block}"]`).click();
    expect(await fragmentIndex(page), "the click moved the Deck").toBe(block);
    const byPointer = await panelState(slide);
    expect(byPointer.lit, "the clicked block is the lit one").toEqual([String(block)]);

    // Back to the summary, then walk to the same block with the arrow alone.
    await slide.locator("[data-prim-clear]").click();
    expect(await fragmentIndex(page), "clear returns to the summary").toBe(-1);
    for (let i = 0; i <= block; i++) {
      await page.evaluate(() => {
        (window as unknown as { __deck: RevealLike }).__deck.next();
      });
    }
    expect(await fragmentIndex(page), "the arrow reached the same Fragment").toBe(block);

    expect(
      await panelState(slide),
      "the arrow and the click leave the Slide identical",
    ).toEqual(byPointer);
  });

  test("the clear button returns the panel to its summary card", async ({ page }) => {
    await openDeck(page);
    const slide = await gotoWidget(page, "data-primitives");

    const atRest = await panelState(slide);
    expect(atRest.card, "the summary is up on arrival").toEqual(["summary"]);
    expect(atRest.lit, "no block is lit on arrival").toEqual([]);
    expect(atRest.dimmed, "the window is undimmed on arrival").toBe(false);

    await slide.locator('[data-prim-block="5"]').click();
    const picked = await panelState(slide);
    expect(picked.card, "the picked block's card is up").toEqual(["5"]);
    expect(picked.dimmed, "the Slide dims its window behind a card").toBe(true);
    expect(picked.pressed, "the picked block says it is pressed").toEqual(["5"]);

    await slide.locator("[data-prim-clear]").click();
    expect(
      await panelState(slide),
      "clear puts the Slide back exactly as it arrived",
    ).toEqual(atRest);
  });
});
