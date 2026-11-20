import { expect, test, type Page } from "@playwright/test";

/**
 * Piyano, the piano Game, in a real browser (review fixes B1, F1, D3, D5).
 * Runs in the `bday26` Playwright project beside `smoke.spec.ts`, against
 * the same preview build.
 *
 * No key is pressed on a lane here: every note falls past unhit, so the
 * HUD's "Kaçan" count is the song clock made visible — it rises only while
 * the song runs. Game feel and the songs' sound stay Atıl's, by hand.
 */

/** Plant progress for her first visit only, welcome already seen (as in
 *  `smoke.spec.ts`). */
async function seed(page: Page, progress: object) {
  await page.addInitScript((p) => {
    if (localStorage.getItem("bday26:v1") == null) {
      localStorage.setItem("bday26:v1", JSON.stringify(p));
    }
    localStorage.setItem("bday26:welcome", "seen");
  }, progress);
}

const misses = (page: Page) => page.locator("[data-hud-misses]");

/** Start the picked song and wait until a note has fallen past unhit. */
async function startAndMissOne(page: Page) {
  await page.keyboard.press("Enter");
  await expect(misses(page)).not.toHaveText("0", { timeout: 20_000 });
}

test("Piyano: a lost window focus or a hidden tab pauses the song, and no note is missed while it waits (B1)", async ({ page }) => {
  await seed(page, { best: {}, jackpot: false, log: [] });
  await page.goto("/20261209/piyano/");
  await expect(page.getByRole("dialog", { name: "Piyano" })).toBeVisible();
  await startAndMissOne(page);
  const overlay = page.getByRole("status").filter({ hasText: "Duraklatıldı" });
  await expect(overlay).toBeHidden();

  // She clicks into another window: the song stops where it was.
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await expect(overlay).toBeVisible();
  const held = await misses(page).innerText();
  await page.waitForTimeout(3000); // Kolay drops about three notes in 3 s
  await expect(misses(page)).toHaveText(held);
  await page.keyboard.press("p");
  await expect(overlay).toBeHidden();
  await expect(misses(page)).toHaveText(held);
  // … and runs on from there.
  await expect(misses(page)).not.toHaveText(held, { timeout: 10_000 });

  // The tab goes to the background: the same, and only P brings it back.
  const before = await misses(page).innerText();
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(overlay).toBeVisible();
  const hidden = await misses(page).innerText();
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => false });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForTimeout(3000);
  await expect(overlay).toBeVisible();
  await expect(misses(page)).toHaveText(hidden);
  expect(Number(hidden) - Number(before)).toBeLessThanOrEqual(1);
  await page.keyboard.press("p");
  await expect(overlay).toBeHidden();
  await expect(page.getByRole("dialog", { name: "Tur bitti" })).toBeHidden();
});

test("Piyano: R starts the same song again at once and records nothing; a held R does not restart again (F1)", async ({ page }) => {
  await seed(page, { best: {}, jackpot: false, log: [] });
  await page.goto("/20261209/piyano/");
  const start = page.getByRole("dialog", { name: "Piyano" });
  await expect(start).toContainText("Baştan başla");
  await page.keyboard.press("2");
  await startAndMissOne(page);

  await page.keyboard.down("r");
  await expect(misses(page)).toHaveText("0");
  await expect(page.locator("[data-hud-song]")).toHaveText("Für Elise");
  await expect(page.getByRole("dialog", { name: "Tur bitti" })).toBeHidden();
  await expect(misses(page)).not.toHaveText("0", { timeout: 20_000 });
  // The same R still held: the browser repeats it, and the Round goes on.
  const going = Number(await misses(page).innerText());
  await page.keyboard.down("r");
  await page.waitForTimeout(300);
  expect(Number(await misses(page).innerText())).toBeGreaterThanOrEqual(going);
  await page.keyboard.up("r");

  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem("bday26:v1") ?? "{}"));
  expect(progress.log).toEqual([]);
  expect(progress.best).toEqual({});
});

test("Piyano: Zor's HUD counts mistakes against the Small prize's budget; Kolay shows no budget (D3)", async ({ page }) => {
  await seed(page, { best: {}, jackpot: false, log: [] });
  await page.goto("/20261209/piyano/");
  const start = page.getByRole("dialog", { name: "Piyano" });
  const budget = page.locator("[data-hud-budget]");

  await startAndMissOne(page);
  await expect(budget).toBeHidden();
  await page.keyboard.press("Escape");
  await page.keyboard.press("Enter"); // "Çık": back to the hub, not scored
  await page.goto("/20261209/piyano/");

  // The budget is the number the start card's prize hint names.
  const hint = /en fazla (\d+) hata/.exec(await start.innerText());
  expect(hint).not.toBeNull();
  await page.keyboard.press("3");
  await page.keyboard.press("Enter");
  await expect(budget).toBeVisible();
  await expect(budget).toHaveText(new RegExp(`Hata 0 / ${hint![1]}$`));
  await expect(budget).toHaveText(new RegExp(`Hata [1-9]\\d* / ${hint![1]}$`), { timeout: 20_000 });
});

test("Piyano: the start card picks the level she played last; a first visit picks Kolay (D5)", async ({ page }) => {
  await seed(page, { best: {}, jackpot: false, log: [] });
  await page.goto("/20261209/piyano/");
  const start = page.getByRole("dialog", { name: "Piyano" });
  const songs = start.getByRole("radiogroup", { name: "Şarkı" });
  await expect(songs.getByRole("radio", { name: /Kolay/ })).toHaveAttribute("aria-checked", "true");
  await expect(start).toContainText("Küçük ödül yalnız Zor'da");

  await page.keyboard.press("3");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Escape");
  await page.keyboard.press("Enter"); // "Çık"

  await page.goto("/20261209/piyano/");
  await expect(songs.getByRole("radio", { name: /Zor/ })).toHaveAttribute("aria-checked", "true");
  await expect(songs.getByRole("radio", { name: /Kolay/ })).toHaveAttribute("aria-checked", "false");
});
