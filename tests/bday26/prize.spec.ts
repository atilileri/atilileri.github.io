import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { targetPool } from "../../src/lib/bday26/renk.ts";

/**
 * The review fixes in the three Prize Games and Kadraj (E2, E4, F6, I1), in
 * a real browser. Runs in the `bday26` Playwright project beside
 * `smoke.spec.ts`, against the same preview build.
 *
 * What the node suites (`renk.test.ts`, `kadraj.test.ts`, `bavul.test.ts`)
 * cannot see: that the live meter reaches the page on every drop, that the
 * page deals its photos through the shuffle, and that the last trip card
 * survives a trip to the hub. The dice are pinned with `Math.random`, so
 * the expected order and card follow from the rules by hand.
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

const EMPTY = { best: {}, jackpot: false, log: [] };

test("Renk karıştır: the Yakınlık meter follows every drop, and the target's own recipe reads %100 (E2)", async ({ page }) => {
  await seed(page, EMPTY);
  await page.goto("/20261209/renk/");
  const start = page.getByRole("dialog", { name: "Renk karıştır" });
  await expect(start).toContainText("en fazla 3 tüpten, en fazla 10 damlalık");
  await page.keyboard.press("Enter");

  const near = page.locator("[data-near-pct]");
  await expect(near).toHaveText("—");
  await page.keyboard.press("1");
  await expect(near).toHaveText(/^%\d+$/);
  await page.keyboard.press("Backspace");
  await expect(near).toHaveText("—");

  // The target swatch's colour names its recipe in the pool; its drops make it exactly.
  // Its inline colour, not the computed one, which eases in over 0.18 s.
  const rgb = await page.locator("[data-target]").evaluate((el) => (el as HTMLElement).style.backgroundColor);
  const hex = `#${(rgb.match(/\d+/g) ?? []).slice(0, 3).map((n) => Number(n).toString(16).padStart(2, "0")).join("")}`;
  const target = targetPool().find((t) => t.hex.toLowerCase() === hex);
  expect(target, hex).toBeTruthy();
  const recipe = target!.recipe;
  expect(recipe.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(10);
  expect(recipe.filter((n) => n > 0).length).toBeLessThanOrEqual(3);
  for (const [tube, n] of recipe.entries()) {
    for (let i = 0; i < n; i++) await page.keyboard.press(String(tube + 1));
  }
  await expect(near).toHaveText("%100");

  // Confirmed, the reveal agrees: ΔE 0, %100.
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-de]")).toHaveText("0,0");
  await expect(page.locator("[data-pts]")).toHaveText("→ %100");
});

test("Kadraj: the Round deals its five photos through the shuffle, not in photos.json order (E4)", async ({ page }) => {
  await seed(page, EMPTY);
  // Always 0: the shuffle swaps each photo with the first in turn, so the
  // second photo of photos.json comes first and the first comes last.
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
  const photos: { file: string; subject?: unknown }[] = JSON.parse(
    readFileSync(new URL("../../public/20261209/photos/photos.json", import.meta.url), "utf8"),
  );
  const files = photos.filter((p) => p.subject).map((p) => p.file);
  expect(files).toHaveLength(5);

  await page.goto("/20261209/kadraj/");
  await page.keyboard.press("Enter");
  const photo = page.locator("[data-photo]");
  for (const [i, file] of [files[1], files[2], files[3], files[4], files[0]].entries()) {
    await expect(page.getByText(`Fotoğraf ${i + 1}/5`)).toBeVisible();
    await expect(page.getByRole("button", { name: /Kırp/ })).toBeEnabled();
    await expect(photo).toHaveAttribute("src", new RegExp(`${file}$`));
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: i < 4 ? /Sonraki fotoğraf/ : /Sonuç/ })).toBeVisible();
    await page.keyboard.press("Enter");
  }
  await expect(page.getByRole("dialog", { name: "Tur bitti" })).toBeVisible();
});

test("Bavul hazırla: the panel leads with the bag's fill, and the next visit draws another trip card (F6, I1)", async ({ page }) => {
  await seed(page, EMPTY);
  // Always 0: the first card is card 0; with card 0 last, the next is card 1.
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
  await page.goto("/20261209/bavul/");
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-big]")).toHaveText("0 / 48 kare");
  await expect(page.locator("[data-live-score]")).toHaveText("%0");
  const trip = page.locator("[data-trip-name]");
  const first = (await trip.innerText()).trim();
  expect(first).toBe("Lüksemburg'da yürüyüş");

  // Esc with an empty hand, Enter: back to the hub, the Round left unscored.
  await page.keyboard.press("Escape");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/20261209\/$/);

  await page.goto("/20261209/bavul/");
  await page.keyboard.press("Enter");
  await expect(trip).not.toHaveText(first);
  await expect(trip).toHaveText("Brugge'de şehir turu");
});
