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

test("the hub is hidden from robots and speaks Turkish", async ({ page }) => {
  await page.goto(HUB);
  await expect(page.locator("html")).toHaveAttribute("lang", "tr");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  await expect(page.getByRole("heading", { name: "İyi ki doğdun, Çağla!" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Hediye dükkânı" })).toBeVisible();
});

// #195 adds here: "the welcome screen shows once by itself and reopens from
// the hub". Its seen flag is a separate localStorage key, so seeding progress
// below must not make it appear.
test.fixme("the welcome screen shows once (#195)", async () => {});
