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
 * The last case (#196) walks the Save code the way she would: copy it from
 * Yedekle, buy, meet the backup prompt, paste a typo and the real code into
 * Geri yükle, confirm, and find the restore on the next visit.
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

/**
 * A later evening: two more Games played (nerede 90, kadraj 100 → 473 Points
 * earned) and the Rocky Horror night already bought at its price, 260. So
 * the Balance is 213, and a Return brings back half of 260 = 130 → 343,
 * enough to buy it again.
 */
const A_LATER_EVENING = {
  best: { ...AN_EVENING.best, nerede: 90, kadraj: 100 },
  jackpot: true,
  log: [{ kind: "buy", gift: "rocky", paid: 260 }],
};

/** Plant progress for her FIRST visit only: the script runs on every
 *  navigation, and a reload must find what she did, not the seed again.
 *  Progress is not a first visit, so the welcome screen (#195) is planted as
 *  already seen too — in its own key, as the spec has it — or the modal
 *  would sit over every tile and button these cases click. */
async function seed(page: import("@playwright/test").Page, progress: object) {
  await page.addInitScript((p) => {
    if (localStorage.getItem("bday26:v1") == null) {
      localStorage.setItem("bday26:v1", JSON.stringify(p));
    }
    localStorage.setItem("bday26:welcome", "seen");
  }, progress);
}

/** The welcome screen, found by the line it opens with (#191, #195). */
function welcome(page: import("@playwright/test").Page) {
  return page.getByRole("dialog", { name: "Nice yıllara güzel sevgilim" });
}

/** The Balance as she sees it: in the strip and in the shop head, agreeing. */
function balance(page: import("@playwright/test").Page) {
  return page.locator('[data-stat="balance"]');
}

/** A Game's tile or a Gift's row, found the way she finds it: by its name. */
function row(page: import("@playwright/test").Page, name: string) {
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
  await expect(row(page, "Hafıza kartları")).toContainText("%100");
  await expect(row(page, "Hafıza kartları")).toContainText("100 puan");
  await expect(row(page, "Hafıza kartları")).toContainText("Kazandın!");
  await expect(row(page, "Milyoner")).toContainText("%88");
  await expect(row(page, "Milyoner")).toContainText("88 puan");
  await expect(row(page, "Milyoner")).toContainText("Rekorun %88 · %95 yapınca senin");

  // 95.5 is written as %95 and earns 95 Points; it is over the bar.
  await expect(row(page, "Kelime avı")).toContainText("%95");
  await expect(row(page, "Kelime avı")).toContainText("95 puan");
  await expect(row(page, "Kelime avı")).toContainText("Kazandın!");

  // The slot machine: a score but no Points, the prize from the jackpot.
  await expect(row(page, "Slot makinesi")).toContainText("%40");
  await expect(row(page, "Slot makinesi")).toContainText("Puan vermez");
  await expect(row(page, "Slot makinesi")).toContainText("Kazandın!");

  // Never played.
  await expect(row(page, "Piyano")).toContainText("Henüz oynamadın");
  await expect(row(page, "Piyano")).toContainText("%95 yapınca senin");
  await expect(row(page, "Piyano")).not.toContainText("Rekorun");
});

test("a buy she can afford lowers the Balance at once, and survives a reload", async ({ page }) => {
  await seed(page, AN_EVENING);
  await page.goto(HUB);
  await expect(balance(page)).toHaveText(["283", "283"]);

  // 290 > 283: the button is there, but cannot be pressed, and says why.
  const kurs = row(page, "Online fotoğraf kursu");
  await expect(kurs.getByRole("button", { name: "Al", exact: true })).toBeDisabled();
  await expect(kurs).toContainText("7 eksik");

  // 260 ≤ 283: bought. The price leaves the Balance now, the Gift moves up.
  const rocky = row(page, "Rocky Horror film gecesi");
  await rocky.getByRole("button", { name: "Al", exact: true }).click();
  await expect(balance(page)).toHaveText(["23", "23"]);
  await expect(page.getByText("Sende olanlar")).toBeVisible();
  await expect(rocky.getByRole("button", { name: "İade et · +130" })).toBeVisible();
  await expect(rocky.getByRole("button", { name: "Al", exact: true })).toBeHidden();

  // 23 buys nothing: every "Al" left is disabled.
  for (const al of await page.getByRole("button", { name: "Al", exact: true }).all()) {
    await expect(al).toBeDisabled();
  }

  // The next visit finds the buy, not the seed.
  await page.reload();
  await expect(balance(page)).toHaveText(["23", "23"]);
  await expect(rocky.getByRole("button", { name: "İade et · +130" })).toBeVisible();
});

test("a Return asks first; confirmed, half the price comes back and the Gift is buyable again", async ({ page }) => {
  await seed(page, A_LATER_EVENING);
  await page.goto(HUB);
  await expect(balance(page)).toHaveText(["213", "213"]);
  const rocky = row(page, "Rocky Horror film gecesi");
  const returnButton = rocky.getByRole("button", { name: "İade et · +130" });

  // She changes her mind at the question: nothing moves.
  const asked: string[] = [];
  page.on("dialog", (dialog) => {
    asked.push(dialog.message());
    void dialog.dismiss();
  });
  await returnButton.click();
  expect(asked).toHaveLength(1);
  expect(asked[0]).toContain("Emin misin?");
  expect(asked[0]).toContain("130 puan geri gelir");
  await expect(balance(page)).toHaveText(["213", "213"]);
  await expect(returnButton).toBeVisible();

  // She confirms: half of what she paid is back, the Gift is in the shop again.
  page.removeAllListeners("dialog");
  page.on("dialog", (dialog) => void dialog.accept());
  await returnButton.click();
  await expect(balance(page)).toHaveText(["343", "343"]);
  await expect(page.getByText("Sende olanlar")).toBeHidden();
  const buyAgain = rocky.getByRole("button", { name: "Al", exact: true });
  await expect(buyAgain).toBeEnabled();

  // And a Return is not final: she buys it back.
  await buyAgain.click();
  await expect(balance(page)).toHaveText(["83", "83"]);
  await expect(returnButton).toBeVisible();
});

test("the whole hub fits her 1920×1080 screen: no scroll, the shop in view", async ({ page }) => {
  // A held Gift adds the "Sende olanlar" block, the taller case for the shop.
  await seed(page, A_LATER_EVENING);
  await page.goto(HUB);
  await expect(page.getByText("Sende olanlar")).toBeVisible();

  const overflow = await page.evaluate(() => ({
    down: document.documentElement.scrollHeight - window.innerHeight,
    across: document.documentElement.scrollWidth - window.innerWidth,
  }));
  expect(overflow).toEqual({ down: 0, across: 0 });

  // The far corners, whole and unscrolled: the last tile, the held Gift at
  // the top of the shop, and the cheapest Gift still for sale at its bottom.
  await expect(row(page, "Slot makinesi")).toBeInViewport({ ratio: 1 });
  await expect(row(page, "Rocky Horror film gecesi")).toBeInViewport({ ratio: 1 });
  await expect(row(page, "Online fotoğraf kursu")).toBeInViewport({ ratio: 1 });
});

test("the welcome screen greets her once by itself, and \"Hoş geldin\" reopens it", async ({ page }) => {
  // A fresh browser, no seed: the first visit. It opens by itself, whole on
  // her screen, with the one line #191 fixed and a sentence each on Games,
  // Points and Gifts (the glossary's words; the sentences are Atıl's call).
  await page.goto(HUB);
  await expect(welcome(page)).toBeVisible();
  await expect(welcome(page)).toBeInViewport({ ratio: 1 });
  await expect(welcome(page).getByRole("heading")).toHaveText("Nice yıllara güzel sevgilim");
  await expect(welcome(page)).toContainText(/oyun/i);
  await expect(welcome(page)).toContainText(/puan/i);
  await expect(welcome(page)).toContainText(/hediye/i);

  // Closed with its button; the second visit does not open it.
  await welcome(page).getByRole("button").click();
  await expect(welcome(page)).toBeHidden();
  await page.reload();
  await expect(page.getByRole("heading", { name: "İyi ki doğdun, Çağla!" })).toBeVisible();
  await expect(welcome(page)).toBeHidden();

  // The hub's link brings it back any time; Esc and Enter both close it.
  const reopen = page.getByRole("button", { name: "Hoş geldin" });
  await reopen.click();
  await expect(welcome(page)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(welcome(page)).toBeHidden();
  await reopen.click();
  await expect(welcome(page)).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(welcome(page)).toBeHidden();

  // Her progress was never touched: still a fresh start behind the welcome.
  await expect(balance(page)).toHaveText(["0", "0"]);
});

test("Yedekle shows a Save code; a typo is refused; the right code restores her progress after she sees both", async ({ page }) => {
  await seed(page, AN_EVENING);
  await page.goto(HUB);
  const tools = page.getByRole("navigation", { name: "Araçlar" });

  // Yedekle: one line of URL-safe text in a field she can copy from.
  await tools.getByRole("button", { name: "Yedekle" }).click();
  const yedekle = page.getByRole("dialog", { name: "Yedekle" });
  const codeField = yedekle.getByRole("textbox");
  await expect(codeField).toHaveValue(/^[A-Za-z0-9_-]{20,}$/);
  const code = await codeField.inputValue();
  await yedekle.getByRole("button", { name: "Kapat" }).click();
  await expect(yedekle).toBeHidden();

  // A buy is followed by the backup prompt, and its button opens Yedekle.
  await row(page, "Rocky Horror film gecesi").getByRole("button", { name: "Al", exact: true }).click();
  await expect(balance(page)).toHaveText(["23", "23"]);
  const prompt = page.getByRole("status").filter({ hasText: "Yedek kodunu" });
  await expect(prompt).toBeVisible();
  await prompt.getByRole("button", { name: "Yedekle" }).click();
  await expect(yedekle).toBeVisible();
  await yedekle.getByRole("button", { name: "Kapat" }).click();

  // Geri yükle: one character changed is caught, in Turkish.
  await tools.getByRole("button", { name: "Geri yükle" }).click();
  const geriYukle = page.getByRole("dialog", { name: "Geri yükle" });
  const pasteField = geriYukle.getByRole("textbox");
  const confirm = geriYukle.getByRole("button", { name: "Bununla değiştir" });
  await pasteField.fill(code.slice(0, 5) + (code[5] === "A" ? "B" : "A") + code.slice(6));
  await expect(geriYukle.getByText("Bu kod tutmuyor")).toBeVisible();
  await expect(confirm).toBeDisabled();

  // The code from before the buy: both summaries side by side, then replace.
  await pasteField.fill(code);
  await expect(geriYukle.getByText("Bu kod tutmuyor")).toBeHidden();
  const compare = geriYukle.getByRole("table");
  await expect(compare.getByRole("row", { name: /^Bakiye/ }).getByRole("cell")).toHaveText(["23", "283"]);
  await expect(compare.getByRole("row", { name: /^Sendeki hediyeler/ }).getByRole("cell")).toHaveText([
    "Rocky Horror film gecesi",
    "—",
  ]);
  await confirm.click();
  await expect(geriYukle).toBeHidden();
  await expect(balance(page)).toHaveText(["283", "283"]);
  await expect(page.getByText("Sende olanlar")).toBeHidden();

  // Restored progress is what the next visit finds.
  await page.reload();
  await expect(balance(page)).toHaveText(["283", "283"]);
});

test("a Game opens on its start screen, and a Round she leaves scores nothing (#194)", async ({ page }) => {
  // A fresh start, welcome already seen: the tile must still say "never
  // played" when she comes back from a Round she left.
  await seed(page, { best: {}, jackpot: false, log: [] });
  await page.goto("/20261209/hafiza/");

  // The start screen: name, one-line rule, the keys, Enter to begin.
  const start = page.getByRole("dialog", { name: "Hafıza kartları" });
  await expect(start).toBeVisible();
  await expect(start).toContainText("8 çift fotoğrafı eşle");
  await expect(start).toContainText("Kartı çevir");
  await expect(start.getByRole("button", { name: /Başla/ })).toBeVisible();
  const overflow = await page.evaluate(() => ({
    down: document.documentElement.scrollHeight - window.innerHeight,
    across: document.documentElement.scrollWidth - window.innerWidth,
  }));
  expect(overflow).toEqual({ down: 0, across: 0 });

  // Enter: the Round is on, the HUD counts moves from zero.
  await page.keyboard.press("Enter");
  await expect(start).toBeHidden();
  await expect(page.getByText("Hamle 0")).toBeVisible();

  // Esc asks first; Esc again goes on with the Round.
  const question = page.getByRole("dialog", { name: "Turdan çıkılsın mı?" });
  await page.keyboard.press("Escape");
  await expect(question).toBeVisible();
  await expect(question).toContainText("Yarım bırakılan tur skor vermez.");
  await page.keyboard.press("Escape");
  await expect(question).toBeHidden();

  // Esc, Enter: back on the hub, and the Round she left changed nothing.
  await page.keyboard.press("Escape");
  await expect(question).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/20261209\/$/);
  await expect(row(page, "Hafıza kartları")).toContainText("Henüz oynamadın");
  await expect(page.getByText("0/11 oynandı")).toBeVisible();
});
