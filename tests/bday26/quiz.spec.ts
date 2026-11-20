import { expect, test, type Page } from "@playwright/test";
import { ANSWERS } from "../../src/lib/bday26/wordle.ts";

/**
 * The choice, puzzle and luck Games after review wave 2 (hafiza, nerede,
 * milyoner, sarki, wordle, slot): what she sees, read the way she reads it.
 * Runs in the `bday26` project beside `smoke.spec.ts`.
 */

/** No progress, the welcome screen already seen. */
async function fresh(page: Page) {
  await page.addInitScript(() => {
    if (localStorage.getItem("bday26:v1") == null) {
      localStorage.setItem("bday26:v1", JSON.stringify({ best: {}, jackpot: false, log: [] }));
    }
    localStorage.setItem("bday26:welcome", "seen");
  });
}

/** Milyoner: mark a choice and lock it, until a lock is wrong. Each loop
 *  answers one question; a right one moves on with any key. */
async function missAMilyonerQuestion(page: Page) {
  const wrong = page.getByText("Yanlış…");
  for (let q = 0; q < 12; q++) {
    const open = page.getByRole("list", { name: "Şıklar" }).getByRole("button", { disabled: false });
    await open.first().click();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    if (await wrong.isVisible()) return;
    await expect(page.getByText("Doğru!")).toBeVisible();
    await page.keyboard.press("x");
    await expect(page.getByText(`Soru ${q + 2}/12`)).toBeVisible();
  }
  throw new Error("twelve right answers in a row: no miss to look at");
}

test("Milyoner: a miss with both jokers unused says \"Jokerlerin duruyordu\"; after a joker it says nothing (review G6)", async ({ page }) => {
  await fresh(page);
  await page.goto("/20261209/milyoner/");
  await page.keyboard.press("Enter");
  await missAMilyonerQuestion(page);
  await expect(page.getByText("Jokerlerin duruyordu")).toBeVisible();
  await page.screenshot({ path: "test-results/quiz-milyoner-jokers-left.png" });

  // A new Round, "Seyirciye sor" first: the chart reads %, Turkish style.
  await page.keyboard.press("x");
  await page.getByRole("dialog", { name: "Tur bitti" }).waitFor();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Soru 1/12")).toBeVisible();
  await page.keyboard.press("s");
  const bars = page.getByRole("figure", { name: "Seyircinin oyları" });
  await expect(bars).toContainText(/%\d+/);
  await expect(bars).not.toContainText(/\d%/);
  await page.waitForTimeout(700); // the bars grow for 0.6 s
  await page.screenshot({ path: "test-results/quiz-milyoner-audience.png" });
  await missAMilyonerQuestion(page);
  await expect(page.getByText("Jokerlerin duruyordu")).toBeHidden();
});

test("\"Şarkıyı bil\": a wrong pick reads in full under its song in the result list, and the card still fits (review G5)", async ({ page }) => {
  // A random source of 0 deals every right title as D, so A misses all ten.
  await page.addInitScript(() => (Math.random = () => 0));
  await fresh(page);
  await page.goto("/20261209/sarki/");
  await page.keyboard.press("Enter");
  for (let i = 1; i <= 10; i++) {
    await expect(page.getByText(`Şarkı ${i}/10`)).toBeVisible();
    await page.keyboard.press("a");
    await page.keyboard.press("n");
  }
  const result = page.getByRole("dialog", { name: "Tur bitti" });
  await expect(result).toBeVisible();
  await expect(result).toContainText("10 hata");
  const picks = result.getByRole("list", { name: "Turun şarkıları" }).locator("small");
  await expect(picks).toHaveCount(10);
  // Every pick is whole: nothing clipped, nothing cut to "O…".
  const clipped = await picks.evaluateAll((els) => els.filter((el) => el.scrollWidth > el.clientWidth + 1).length);
  expect(clipped).toBe(0);
  for (const text of await picks.allInnerTexts()) expect(text).toMatch(/^senin cevabın: .{3,}/);
  const overflow = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  expect(overflow).toBe(0);
  await page.waitForTimeout(600);
  await page.screenshot({ path: "test-results/quiz-sarki-recap.png" });
});

test("Kelime avı: the word she saw last never opens the next Round, and the page keeps the word on screen for the tab (review I2)", async ({ page }) => {
  // A random source of 0 would open on ATIL; ATIL was the last word she saw.
  await page.addInitScript(() => {
    Math.random = () => 0;
    sessionStorage.setItem("bday26:wordle:last", "ATIL");
  });
  await fresh(page);
  await page.goto("/20261209/wordle/");
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-hint]")).not.toHaveText("");
  await expect(page.locator("[data-hint]")).not.toHaveText(ANSWERS.find((a) => a.answer === "ATIL")!.hint);
  const hint = (await page.locator("[data-hint]").innerText()).trim();
  const shown = ANSWERS.find((a) => a.hint === hint)!.answer;
  expect(await page.evaluate(() => sessionStorage.getItem("bday26:wordle:last"))).toBe(shown);
});

test("the slot machine: every jackpot puts the Small prize up large, and the next spin takes it down (review F5)", async ({ page }) => {
  // A random source of 0 draws the jackpot on every spin.
  await page.addInitScript(() => (Math.random = () => 0));
  await fresh(page);
  await page.goto("/20261209/slot/");
  const banner = page.locator("[data-jackpot-banner]");
  await expect(banner).toBeHidden();

  await page.keyboard.press(" ");
  await expect(page.getByRole("status")).toContainText("Jackpot", { timeout: 5000 });
  await expect(banner).toBeVisible();
  await expect(banner).toHaveText(/Küçük ödül kazandın:\s*Kazımalı dünya haritası!/);
  const size = await banner.locator(".jb-name").evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(size).toBeGreaterThanOrEqual(32);
  const overflow = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  expect(overflow).toBe(0);
  await page.waitForTimeout(700);
  await page.screenshot({ path: "test-results/quiz-slot-jackpot.png" });

  // A second jackpot, after the prize is already hers: the big line again.
  await page.keyboard.press(" ");
  await expect(banner).toBeHidden();
  await expect(page.locator("[data-spins]")).toHaveText("2", { timeout: 5000 });
  await expect(banner).toBeVisible();

  // A spin that is no jackpot takes it down.
  await page.evaluate(() => (Math.random = () => 0.5));
  await page.keyboard.press(" ");
  await expect(page.locator("[data-spins]")).toHaveText("3", { timeout: 5000 });
  await expect(banner).toBeHidden();
});

test("held keys do one thing: a held Enter in Hafıza lets a wrong pair settle, a held Esc on \"Son kararın mı?\" only takes it back (repeat audit)", async ({ page }) => {
  // A random source of 0 deals two different photos on the first two cards.
  await page.addInitScript(() => (Math.random = () => 0));
  await fresh(page);
  await page.goto("/20261209/hafiza/");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Hamle 0 / 15")).toBeVisible();
  await page.keyboard.press("Enter");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Hamle 1 / 15")).toBeVisible();
  await expect(page.getByRole("button", { name: /, açık$/ })).toHaveCount(2);
  // Enter held on the second card: its repeats must not hold the pair up
  // past its second (they used to restart the wait on every repeat).
  await page.keyboard.down("Enter");
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(200);
    await page.keyboard.down("Enter");
  }
  await expect(page.getByRole("button", { name: /, açık$/ })).toHaveCount(0, { timeout: 150 });
  await page.keyboard.up("Enter");

  await page.goto("/20261209/milyoner/");
  await page.keyboard.press("Enter");
  await page.keyboard.press("b");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Son kararın mı?")).toBeVisible();
  await page.keyboard.down("Escape");
  await page.keyboard.down("Escape");
  await page.keyboard.down("Escape");
  await page.keyboard.up("Escape");
  await expect(page.getByText("Son kararın mı?")).toBeHidden();
  await expect(page.getByText("Turdan çıkılsın mı?")).toBeHidden();
  await expect(page.getByText("Soru 1/12")).toBeVisible();
});
