import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { parsePool } from "../../src/lib/bday26/milyoner.ts";
import { LEVELS, choices, shortestRoute } from "../../src/lib/bday26/yuruyus.ts";

/** Milyoner's questions, read from the document the Game reads. */
const POOL = parsePool(readFileSync(new URL("../../docs/bday26/milyoner-questions.md", import.meta.url), "utf8"));

/**
 * The Game shell's cards in a real browser (review fixes D1, D2, D6, L1).
 * Runs in the `bday26` Playwright project beside `smoke.spec.ts`, against
 * the same preview build.
 *
 * What the node suite (`shell.test.ts`, `prize-hints.test.ts`) cannot see:
 * that the lines the controller computes reach the cards she reads — the
 * Points line, the Best score flash, the prize hint on the start and result
 * cards — and that the real-time Games pause when the tab is hidden. The
 * expected texts are the review's wording; the expected numbers follow the
 * glossary's rules (1% of a Best score = 1 Point, rounded down; Prize Games
 * give none).
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

test("a skill Game: the start card says what %95 means; a first %100 says İlk rekorun! and the Points it brought (D1, D2, D6)", async ({ page }) => {
  // 88 Points already earned in Hafıza kartları, so the total is 88 + 100.
  await seed(page, { best: { hafiza: 88 }, jackpot: false, log: [] });
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
  await page.goto("/20261209/yuruyus/");
  const start = page.getByRole("dialog", { name: "Yürüyüş haritası" });
  await expect(start).toContainText("%95 için her haritada rotan en kısadan en fazla %15 uzun olsun");

  await page.keyboard.press("Enter");
  for (let level = 1; level <= 3; level++) {
    await expect(page.locator("[data-hud-level]")).toHaveText(`Seviye ${level}/3`);
    const name = (await page.locator("[data-hud-map]").innerText()).trim();
    const map = LEVELS[level - 1]!.maps.find((m) => m.name === name)!;
    const best = shortestRoute(map);
    for (let i = 1; i < best.route.length; i++) {
      const key = choices(map, best.route.slice(0, i)).indexOf(best.route[i]!) + 1;
      await page.keyboard.press(String(key));
    }
    await expect(page.getByText("Zirvedesin. Rotan hazır mı?")).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: level < 3 ? /Sonraki seviye/ : /Sonuç/ })).toBeVisible();
    await page.keyboard.press("Enter");
  }

  const result = page.getByRole("dialog", { name: "Tur bitti" });
  await expect(result.locator("[data-shell-score]")).toHaveText("%100");
  await expect(result).toContainText("+100 puan · toplam 188");
  await expect(result).toContainText("İlk rekorun!");
  await expect(result).not.toContainText("Yeni rekor!");
  // Won right here: the hint has nothing left to explain.
  await expect(result).toContainText("Küçük ödül kazandın: Piknik günü!");
  await expect(result).not.toContainText("%95 için");

  // Back to the hub and in again: the start card has dropped the hint too.
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/20261209\/$/);
  await page.goto("/20261209/yuruyus/");
  await expect(start).not.toContainText("%95 için");
});

test("a Prize Game: the result says it gives no Points, no flash for a %0, and the hint again (D1, D2, D6)", async ({ page }) => {
  await seed(page, { best: {}, jackpot: false, log: [] });
  await page.goto("/20261209/bavul/");
  const start = page.getByRole("dialog", { name: "Bavul hazırla" });
  await expect(start).toContainText("%95 için olmazsa olmazların hepsi bavulda, en çok 1 boş kare");

  // An empty bag closed at once: %0.
  await page.keyboard.press("Enter");
  await page.keyboard.press("k");
  await page.keyboard.press("Enter");
  const result = page.getByRole("dialog", { name: "Tur bitti" });
  await expect(result.locator("[data-shell-score]")).toHaveText("%0");
  await expect(result).toContainText("Bu oyun puan vermez");
  await expect(result).not.toContainText("rekor");
  await expect(result).toContainText("%95 için olmazsa olmazların hepsi bavulda, en çok 1 boş kare");
});

test("a skill Game Round that changes no Points says so, with the Best score as she reads it (D1)", async ({ page }) => {
  await seed(page, { best: { milyoner: 88.4 }, jackpot: false, log: [] });
  await page.goto("/20261209/milyoner/");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Soru 1/12")).toBeVisible();

  // A wrong answer on the first question ends the Round at %0. The document
  // lists the right answer first; pick any other choice on screen.
  const text = (await page.locator("[data-text]").innerText()).trim();
  const question = POOL.find((q) => q.text === text)!;
  expect(question, `"${text}" is in the question document`).toBeDefined();
  const labels = await page.locator("[data-choice] [data-label]").allInnerTexts();
  const wrong = labels.findIndex((l) => l.trim() !== question.choices[0]);
  await page.keyboard.press("abcd"[wrong]!);
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");

  const result = page.getByRole("dialog", { name: "Tur bitti" });
  await expect(result.locator("[data-shell-score]")).toHaveText("%0", { timeout: 15_000 });
  await expect(result).toContainText("Rekorun %88 · puanın değişmedi");
  await expect(result).not.toContainText("rekorun!");
  await expect(result).not.toContainText("Yeni rekor!");
  await expect(result).toContainText("%95 için 12 sorunun 12'si");
});
for (const { path, name } of [
  { path: "/20261209/surus/", name: "Hollanda'da sürüş" },
  { path: "/20261209/kayak/", name: "Kayak macerası" },
]) {
  test(`${name}: a hidden tab pauses the Round, and only P resumes it (L1)`, async ({ page }) => {
    await seed(page, { best: {}, jackpot: false, log: [] });
    await page.goto(path);
    await expect(page.getByRole("dialog", { name })).toBeVisible();
    await page.keyboard.press("Enter");
    const overlay = page.getByRole("status").filter({ hasText: "Duraklatıldı" });
    const time = page.locator("[data-hud-time]");
    await expect(time).not.toHaveText(/^0:00(\.0)?$/, { timeout: 6000 });
    await expect(overlay).toBeHidden();

    // The tab goes to the background (no window blur: only the page hides).
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
      Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect(overlay).toBeVisible();
    const held = await time.innerText();

    // Back in front: still paused until P.
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", { configurable: true, get: () => false });
      Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "visible" });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.waitForTimeout(400);
    await expect(overlay).toBeVisible();
    await expect(time).toHaveText(held);
    await page.keyboard.press("p");
    await expect(overlay).toBeHidden();
    await expect(time).not.toHaveText(held);
  });
}

test("inside a Game both switches stay out of the Tab order, and still flip on a click (L5, F4)", async ({ page }) => {
  await seed(page, { best: {}, jackpot: false, log: [] });
  await page.goto("/20261209/hafiza/");
  for (const name of [/^Efektler/, /^Müzik/]) {
    const toggle = page.getByRole("button", { name });
    await expect(toggle).toHaveAttribute("tabindex", "-1");
  }
  const music = page.getByRole("button", { name: /^Müzik/ });
  await music.click();
  await expect(music).toHaveAccessibleName("Müzik: Kapalı");
  await expect(music.locator("[data-switch-icon]")).toHaveText("🔇");
  await expect(page.getByRole("button", { name: /^Efektler/ }).locator("[data-switch-icon]")).toHaveText("✨");
});
