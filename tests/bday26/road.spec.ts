import { expect, test, type Page } from "@playwright/test";

/**
 * The review fixes of the three real-time Games (driving, ski, hiking): what
 * she presses and what she sees, at the screens she plays on. Same project
 * and preview build as `smoke.spec.ts` (`npm run test:smoke`).
 */

/** No progress yet, welcome screen already seen. */
async function fresh(page: Page) {
  await page.addInitScript(() => {
    if (localStorage.getItem("bday26:v1") == null) {
      localStorage.setItem("bday26:v1", JSON.stringify({ best: {}, jackpot: false, log: [] }));
    }
    localStorage.setItem("bday26:welcome", "seen");
  });
}

/** A Game's tile on the hub, found by its name. */
function row(page: Page, name: string) {
  return page.getByRole("listitem").filter({ hasText: name });
}

/** A key press as a held key's auto-repeat sends it. */
async function repeatKey(page: Page, code: string, key: string) {
  await page.evaluate(([code, key]) => window.dispatchEvent(new KeyboardEvent("keydown", { code, key, repeat: true, bubbles: true })), [code, key]);
}

test("Hollanda'da sürüş: R starts the Round again at once and records nothing; a held R does not restart it twice (F1)", async ({ page }) => {
  await fresh(page);
  await page.goto("/20261209/surus/");
  const start = page.getByRole("dialog", { name: "Hollanda'da sürüş" });
  await expect(start.locator("li").filter({ has: page.locator("kbd", { hasText: /^R$/ }) })).toContainText("Baştan başla");

  await page.keyboard.press("Enter");
  await page.keyboard.down("ArrowUp");
  await expect(page.getByText("Hız sınırını aştın")).toBeVisible({ timeout: 12_000 });
  await page.keyboard.up("ArrowUp");
  await expect(page.locator("[data-hud-score]")).toHaveText("%97");

  // R: back on the start line with a clean slate and a fresh countdown.
  await page.keyboard.press("r");
  const count = page.locator("[data-count]");
  await expect(count).toBeVisible();
  await expect(page.locator("[data-hud-score]")).toHaveText("%100");
  await expect(page.locator("[data-hud-time]")).toHaveText("0:00");
  await expect(page.getByText("0 hafif", { exact: true })).toBeVisible();

  // Once the countdown is over, a held R's repeat changes nothing.
  await expect(count).toBeHidden({ timeout: 6000 });
  await repeatKey(page, "KeyR", "r");
  await page.waitForTimeout(200);
  await expect(count).toBeHidden();

  // Nothing was recorded: the tile still says she never played.
  await page.keyboard.press("Escape");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/20261209\/$/);
  await expect(row(page, "Hollanda'da sürüş")).toContainText("Henüz oynamadın");
});

/** How many lines the Game's HUD line takes: one box per line it wraps onto. */
async function hudLines(page: Page) {
  return page.locator(".hud-line").evaluate((el) => el.getClientRects().length);
}

for (const { path, name, hud } of [
  { path: "/20261209/surus/", name: "Hollanda'da sürüş", hud: "Hedef 1 / 7" },
  { path: "/20261209/kayak/", name: "Kayak macerası", hud: "Kaçan 0 / en çok 3" },
]) {
  test(`${name}: the HUD keeps to one line on a 1366 × 768 screen (F3, D3)`, async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await fresh(page);
    await page.goto(path);
    await page.keyboard.press("Enter");
    await expect(page.locator(".hud-line")).toContainText(hud);
    expect(await hudLines(page)).toBe(1);
  });
}

test("Hollanda'da sürüş: over the limit, her speed pulses amber before the mistake lands, then turns red (F3)", async ({ page }) => {
  await fresh(page);
  await page.goto("/20261209/surus/");
  await page.keyboard.press("Enter");
  const pill = page.locator("[data-speed-pill]");
  await expect(pill).not.toHaveClass(/warn/);
  await page.keyboard.down("ArrowUp");
  // The warning comes first, while the score is still whole …
  await expect(pill).toHaveClass(/warn/, { timeout: 12_000 });
  await expect(page.locator("[data-hud-score]")).toHaveText("%100");
  // … then the mistake, and the warning is over.
  await expect(page.getByText("Hız sınırını aştın")).toBeVisible();
  await expect(pill).not.toHaveClass(/warn/);
  await expect(pill).toHaveClass(/fast/);
  await page.keyboard.up("ArrowUp");
});
