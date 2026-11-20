import { expect, test, type Page } from "@playwright/test";

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
  await page.screenshot({ path: "test-results/quiz-milyoner-audience.png" });
  await missAMilyonerQuestion(page);
  await expect(page.getByText("Jokerlerin duruyordu")).toBeHidden();
});
