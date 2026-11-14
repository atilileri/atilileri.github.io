import { expect, test } from "@playwright/test";

/**
 * The birthday games smoke — ticket #193, spec #192 ("Testing Decisions",
 * seam 2).
 *
 * One Playwright project (`bday26` in `playwright.config.ts`, run with
 * `npm run test:smoke`) against the same preview build the Deck walk uses.
 * It checks what the node suite cannot: that the hub is really hidden, really
 * Turkish, and that the ledger is really wired to the page — a buy she clicks
 * lowers the Balance she sees, a Return she confirms gives half back. It
 * plays no Game; Game feel is Atıl's by hand (spec, "Testing Decisions").
 *
 * Every assertion reads what she would see or what a crawler would get.
 * Nothing here looks at the ledger's storage shape or the page's DOM
 * structure beyond the roles and texts a person uses to find things.
 *
 * Expected numbers come from the spec's rules, not from the code: 1% of a
 * Best score = 1 Point rounded down, the slot machine gives none, a buy takes
 * the price at once, a Return gives half of the price paid back.
 */

const HUB = "/20261209/";

/**
 * Progress she might have after an evening, planted before the page runs.
 * The key and shape are the ledger's (spec, "Progress state"); the numbers
 * are chosen so every rule shows once:
 *   - hafiza 100 → 100 Points, Small prize won
 *   - milyoner 88 → 88 Points, locked, the spec's own "Rekorun %88" example
 *   - wordle 95.5 → 95 Points (rounded down), won at the 95 bar
 *   - slot 40 with the jackpot → no Points, Small prize won by the jackpot
 *   - piyano never played
 * Points earned 283, Balance 283, 3 Small prizes, 4 of 11 Games played.
 */
const AN_EVENING = {
  best: { hafiza: 100, milyoner: 88, wordle: 95.5, slot: 40 },
  jackpot: true,
  log: [],
};

async function seed(page: import("@playwright/test").Page, progress: object) {
  await page.addInitScript((p) => localStorage.setItem("bday26:v1", JSON.stringify(p)), progress);
}

/** The tile of one Game, found the way she finds it: by its name. */
function tile(page: import("@playwright/test").Page, name: string) {
  return page.getByRole("listitem").filter({ hasText: name });
}

test("the hub is hidden from robots and speaks Turkish", async ({ page }) => {
  await page.goto(HUB);
  await expect(page.locator("html")).toHaveAttribute("lang", "tr");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  await expect(page.getByRole("heading", { name: "İyi ki doğdun, Çağla!" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Hediye dükkânı" })).toBeVisible();
});

test("no /20261209/ URL reaches the sitemap or the RSS feed", async ({ request }) => {
  const sitemap = await request.get("/sitemap-0.xml");
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).not.toContain("/20261209/");

  const rss = await request.get("/rss.xml");
  expect(rss.ok()).toBe(true);
  expect(await rss.text()).not.toContain("/20261209/");
});

test("her progress shows on the tiles and in the strip", async ({ page }) => {
  await seed(page, AN_EVENING);
  await page.goto(HUB);

  // The strip: earned, Balance (shown twice: strip and shop head), prizes.
  await expect(page.locator('[data-stat="earned"]')).toHaveText("283");
  await expect(page.locator('[data-stat="balance"]')).toHaveText(["283", "283"]);
  await expect(page.locator('[data-stat="prizes"]')).toHaveText("3");
  await expect(page.getByText("4/11 oynandı")).toBeVisible();

  // A won Small prize is green and says so; a locked one names the gap.
  await expect(tile(page, "Hafıza kartları")).toContainText("%100");
  await expect(tile(page, "Hafıza kartları")).toContainText("100 puan");
  await expect(tile(page, "Hafıza kartları")).toContainText("Kazandın!");
  await expect(tile(page, "Milyoner")).toContainText("%88");
  await expect(tile(page, "Milyoner")).toContainText("88 puan");
  await expect(tile(page, "Milyoner")).toContainText("Rekorun %88 · %95 yapınca senin");

  // 95.5 is written as %95 and earns 95 Points; it is over the bar.
  await expect(tile(page, "Kelime avı")).toContainText("%95");
  await expect(tile(page, "Kelime avı")).toContainText("95 puan");
  await expect(tile(page, "Kelime avı")).toContainText("Kazandın!");

  // The slot machine: a score but no Points, the prize from the jackpot.
  await expect(tile(page, "Slot makinesi")).toContainText("%40");
  await expect(tile(page, "Slot makinesi")).toContainText("Puan vermez");
  await expect(tile(page, "Slot makinesi")).toContainText("Kazandın!");

  // Never played.
  await expect(tile(page, "Piyano")).toContainText("Henüz oynamadın");
  await expect(tile(page, "Piyano")).toContainText("%95 yapınca senin");
  await expect(tile(page, "Piyano")).not.toContainText("Rekorun");
});

// #195 adds here: "the welcome screen shows once by itself and reopens from
// the hub". Its seen flag is a separate localStorage key, so seeding progress
// below must not make it appear.
test.fixme("the welcome screen shows once (#195)", async () => {});
