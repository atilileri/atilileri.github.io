import { expect, test } from "@playwright/test";
import { ANSWERS } from "../../src/lib/bday26/wordle.ts";
import { MAPS, choices, shortestRoute } from "../../src/lib/bday26/yuruyus.ts";

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

  // A won Small prize is green and says so; a locked one shows only its name
  // (how to win it is the welcome screen's to say).
  await expect(row(page, "Hafıza kartları")).toContainText("%100");
  await expect(row(page, "Hafıza kartları")).toContainText("100 puan");
  await expect(row(page, "Hafıza kartları")).toContainText("Kazandın!");
  await expect(row(page, "Milyoner")).toContainText("%88");
  await expect(row(page, "Milyoner")).toContainText("88 puan");
  await expect(row(page, "Milyoner")).toContainText("Yemek Kartı");
  await expect(row(page, "Milyoner")).not.toContainText("yapınca senin");
  await expect(row(page, "Milyoner")).not.toContainText("Kazandın!");

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
  await expect(row(page, "Piyano")).not.toContainText("yapınca senin");
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

  // The backup prompt that follows the buy goes when she says "Sonra".
  const prompt = page.getByRole("status").filter({ hasText: "Yedek kodunu" });
  await prompt.getByRole("button", { name: "Sonra" }).click();
  await expect(prompt).toBeHidden();

  // 23 buys nothing: every "Al" left is disabled.
  for (const al of await page.getByRole("button", { name: "Al", exact: true }).all()) {
    await expect(al).toBeDisabled();
  }

  // The next visit finds the buy, not the seed.
  await page.reload();
  await expect(balance(page)).toHaveText(["23", "23"]);
  await expect(rocky.getByRole("button", { name: "İade et · +130" })).toBeVisible();
});

test("a Gift's description opens on a resting hover or on focus, not on a sweep", async ({ page }) => {
  await seed(page, AN_EVENING);
  await page.goto(HUB);
  const gezi = row(page, "Bir haftalık gezi");
  const desc = gezi.getByText(/^Mont-Saint-Martin/);
  const height = async () => (await desc.boundingBox())!.height;
  const shut = await height();

  // A sweep across the list (in and out before the hover intent) opens nothing.
  await gezi.hover();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(400);
  expect(await height()).toBe(shut);

  // Resting on it opens it smoothly to more lines; leaving closes it again.
  await gezi.hover();
  await expect.poll(height).toBeGreaterThan(shut * 2);
  await page.mouse.move(0, 0);
  await expect.poll(height).toBe(shut);

  // Keyboard focus opens it the same way.
  await gezi.focus();
  await expect.poll(height).toBeGreaterThan(shut * 2);
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

/**
 * The hub at her 1920×1080 screen, two smaller laptops and a phone: it may
 * scroll down, never across, and every tile keeps its content inside its
 * card (cards grow, the grid reflows 3 → 2 → 1, the shop drops below on a
 * phone). "Inside" is measured by the boxes she sees: every element of a
 * tile lies within the tile's own rectangle.
 */
for (const [width, height] of [
  [1920, 1080],
  [1280, 800],
  [1130, 870],
  [390, 844],
] as const) {
  test(`the hub at ${width}×${height}: no sideways scroll, no tile spills out of its card`, async ({ page }) => {
    // A held Gift adds the "Sende olanlar" block, the taller case for the shop.
    await page.setViewportSize({ width, height });
    await seed(page, A_LATER_EVENING);
    await page.goto(HUB);
    await expect(page.getByText("Sende olanlar")).toBeVisible();
    await expect(row(page, "Slot makinesi")).toContainText("Kazandın!");

    const across = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(across).toBe(0);

    const spills = await page.evaluate(() => {
      const out: string[] = [];
      for (const tile of document.querySelectorAll<HTMLElement>("li[data-game]")) {
        const card = tile.getBoundingClientRect();
        for (const el of tile.querySelectorAll("*")) {
          const box = el.getBoundingClientRect();
          if (box.width === 0 && box.height === 0) continue;
          if (box.left < card.left - 1 || box.right > card.right + 1 || box.top < card.top - 1 || box.bottom > card.bottom + 1) {
            out.push(`${tile.dataset.game}: ${(el.textContent ?? "").trim().slice(0, 30)}`);
          }
        }
      }
      return out;
    });
    expect(spills).toEqual([]);

    // The 🎂 in the corner tilts on hover; the tilt must not grow the page.
    const extent = () =>
      page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.scrollHeight]);
    const before = await extent();
    await page.getByRole("button", { name: "Atıl'ın köşesi" }).hover();
    await page.waitForFunction(() => {
      const cake = document.querySelector(".adm-cake");
      return cake && getComputedStyle(cake).transform !== "none" && cake.getAnimations().length === 0;
    });
    expect(await extent()).toEqual(before);
    await page.mouse.move(width / 2, 10);

    // On her own screen the shop is still all in view beside the tiles.
    if (width === 1920) {
      await expect(row(page, "Rocky Horror film gecesi")).toBeInViewport({ ratio: 1 });
      await expect(row(page, "Online fotoğraf kursu")).toBeInViewport({ ratio: 1 });
    }
  });
}

test("the welcome screen greets her by itself until she closes it once, and \"Hoş geldin\" reopens it", async ({ page }) => {
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

  // Seen means closed: a reload before she closes it greets her again.
  await page.reload();
  await expect(welcome(page)).toBeVisible();

  // Closed with its button; the next visit does not open it.
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
  await page.clock.install();
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

  // A buy is followed by the backup prompt. It waits for her, however long
  // she looks away, and its button opens Yedekle.
  await row(page, "Rocky Horror film gecesi").getByRole("button", { name: "Al", exact: true }).click();
  await expect(balance(page)).toHaveText(["23", "23"]);
  const prompt = page.getByRole("status").filter({ hasText: "Yedek kodunu" });
  await expect(prompt).toBeVisible();
  await page.clock.fastForward("01:00");
  await expect(prompt).toBeVisible();
  await prompt.getByRole("button", { name: "Yedekle" }).click();
  await expect(yedekle).toBeVisible();
  await expect(prompt).toBeHidden();
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

test("Atıl's corner: a wrong password is refused, 1047 opens it, 50 Gifted points raise the Balance and survive a reload", async ({ page }) => {
  await seed(page, AN_EVENING);
  await page.goto(HUB);
  await expect(balance(page)).toHaveText(["283", "283"]);

  await page.getByRole("button", { name: "Atıl'ın köşesi" }).click();
  const corner = page.getByRole("dialog", { name: "Atıl'ın köşesi" });
  const password = corner.getByLabel("Şifre");
  await password.fill("1234");
  await password.press("Enter");
  await expect(corner.getByText("Olmadı, bir daha dene")).toBeVisible();
  await expect(corner.getByRole("button", { name: "Hediye et" })).toBeHidden();

  await password.fill("1047");
  await password.press("Enter");
  await corner.getByRole("button", { name: "+50" }).click();
  await corner.getByLabel("Not").fill("sürpriz");
  await corner.getByRole("button", { name: "Hediye et" }).click();
  await expect(corner.getByRole("listitem").filter({ hasText: "sürpriz" })).toContainText("+50");
  await corner.getByRole("button", { name: "Kapat" }).click();
  await expect(corner).toBeHidden();

  // Gifted points are Balance, not Points earned.
  await expect(balance(page)).toHaveText(["333", "333"]);
  await expect(page.locator('[data-stat="earned"]')).toHaveText("283");
  await expect(page.getByText("+50 hediye puan")).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "Yedek kodunu" })).toBeVisible();

  await page.reload();
  await expect(balance(page)).toHaveText(["333", "333"]);
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

test("\"Bu nerede?\" opens on its start screen, and Enter puts the first photo up with four places (#199)", async ({ page }) => {
  await seed(page, { best: {}, jackpot: false, log: [] });
  await page.goto("/20261209/nerede/");

  // The start screen: name, rule, the answer keys, the Small prize, Enter to begin.
  const start = page.getByRole("dialog", { name: "Bu nerede?" });
  await expect(start).toBeVisible();
  await expect(start).toContainText("Fotoğraftaki yeri bul");
  await expect(start).toContainText("Yeri seç");
  await expect(start).toContainText("Paleis Het Loo gezisi");
  await expect(start.getByRole("button", { name: /Başla/ })).toBeVisible();

  // Enter: photo 1 of 10, no miss yet, four places under it, all on one screen.
  await page.keyboard.press("Enter");
  await expect(start).toBeHidden();
  await expect(page.getByText("Fotoğraf 1/10 · Hata 0")).toBeVisible();
  await expect(page.getByRole("list", { name: "Yerler" }).getByRole("button")).toHaveCount(4);
  const overflow = await page.evaluate(() => ({
    down: document.documentElement.scrollHeight - window.innerHeight,
    across: document.documentElement.scrollWidth - window.innerWidth,
  }));
  expect(overflow).toEqual({ down: 0, across: 0 });
});

test("\"Şarkıyı bil\" opens on its start screen with its keys, its prize and the piano's credit (#204)", async ({ page }) => {
  // No Round here: Enter would start the piano, and Game feel is Atıl's by hand.
  await seed(page, { best: {}, jackpot: false, log: [] });
  await page.goto("/20261209/sarki/");

  const start = page.getByRole("dialog", { name: "Şarkıyı bil" });
  await expect(start).toBeVisible();
  await expect(start).toContainText("Şarkıyı seç");
  await expect(start).toContainText("Bir daha dinle");
  await expect(start).toContainText("Dodo'da kahvaltı");
  await expect(start.getByRole("button", { name: /Başla/ })).toBeVisible();
  await expect(page.getByText(/FluidR3 GM.*CC BY 3\.0/)).toBeAttached();
});

test("\"Şarkıyı bil\" ends on the Round's 10 songs, each marked and playable, and a play click leaves Enter to Yeni tur (#204)", async ({ page }) => {
  await seed(page, { best: {}, jackpot: false, log: [] });
  await page.goto("/20261209/sarki/");
  await page.keyboard.press("Enter");
  // Ten answers, always A; any key moves on.
  for (let i = 1; i <= 10; i++) {
    await expect(page.getByText(`Şarkı ${i}/10`)).toBeVisible();
    await page.keyboard.press("a");
    await page.keyboard.press("n");
  }
  const result = page.getByRole("dialog", { name: "Tur bitti" });
  await expect(result).toBeVisible();
  const songs = result.getByRole("list", { name: "Turun şarkıları" }).getByRole("listitem");
  await expect(songs).toHaveCount(10);
  await expect(songs.first()).toContainText("1.");
  await expect(songs.first()).toContainText(/[✓✗]/);
  const plays = result.getByRole("button", { name: /^Dinle: / });
  await expect(plays).toHaveCount(10);

  await plays.nth(3).click();
  await page.keyboard.press("Enter");
  await expect(result).toBeHidden();
  await expect(page.getByText("Şarkı 1/10")).toBeVisible();
});

test("Piyano opens on its start screen with the three songs and their caps; 3 picks Zor (#205)", async ({ page }) => {
  // No Round here: Enter would start the piano, and Game feel is Atıl's by hand.
  await seed(page, { best: {}, jackpot: false, log: [] });
  await page.goto("/20261209/piyano/");

  const start = page.getByRole("dialog", { name: "Piyano" });
  await expect(start).toBeVisible();
  await expect(start).toContainText("De Slak'ta akşam yemeği");
  const songs = start.getByRole("radiogroup", { name: "Şarkı" });
  await expect(songs.getByRole("radio")).toHaveText([/Kolay.*İyi ki doğdun.*%70/, /Orta.*Hadi Bakalım.*%85/, /Zor.*Türk Marşı.*%100/]);
  await expect(songs.getByRole("radio", { name: /Kolay/ })).toHaveAttribute("aria-checked", "true");

  await page.keyboard.press("3");
  await expect(songs.getByRole("radio", { name: /Zor/ })).toHaveAttribute("aria-checked", "true");
  await expect(songs.getByRole("radio", { name: /Kolay/ })).toHaveAttribute("aria-checked", "false");
  await expect(start).toBeVisible();
  await expect(page.getByText(/FluidR3 GM.*CC BY 3\.0/)).toBeAttached();
});

test("Milyoner: Esc on \"Son kararın mı?\" takes the answer back without leaving, and Yarı yarıya leaves two choices (#198)", async ({ page }) => {
  await seed(page, { best: {}, jackpot: false, log: [] });
  await page.goto("/20261209/milyoner/");
  await expect(page.getByRole("dialog", { name: "Milyoner" })).toContainText("Yemek Kartı");

  // Enter: question 1 of 12, four choices; B marked, Enter asks.
  await page.keyboard.press("Enter");
  await expect(page.getByText("Soru 1/12")).toBeVisible();
  const choices = page.getByRole("list", { name: "Şıklar" }).getByRole("button");
  await expect(choices).toHaveCount(4);
  await page.keyboard.press("b");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Son kararın mı?")).toBeVisible();

  // Esc here is "Vazgeç": the question stays, no leave question, no hub.
  await page.keyboard.press("Escape");
  await expect(page.getByText("Son kararın mı?")).toBeHidden();
  await expect(page.getByText("Turdan çıkılsın mı?")).toBeHidden();
  await expect(page.getByText("Soru 1/12")).toBeVisible();

  // Y takes away two wrong choices; the joker is spent for the Round.
  await page.keyboard.press("y");
  await expect(page.getByRole("list", { name: "Şıklar" }).getByRole("button", { disabled: false })).toHaveCount(2);
  await expect(page.getByRole("button", { name: /Yarı yarıya/ })).toBeDisabled();
});

test("the slot machine: a spin lands its score on the machine, no result screen, and Esc is the hub (#200)", async ({ page }) => {
  await seed(page, { best: {}, jackpot: false, log: [] });
  await page.goto("/20261209/slot/");

  // No start screen (story 54): the machine is ready, Space to spin, and the
  // Small prize line as the hub's tile has it — its name, no how-to hint.
  await expect(page.getByRole("dialog", { name: "Slot makinesi" })).toBeHidden();
  const display = page.getByRole("status");
  await expect(display).toContainText("Boşluk");
  const machine = page.locator("[data-machine]");
  await expect(machine).toContainText("Kazımalı dünya haritası");
  await expect(machine).not.toContainText("Jackpot'ta senin");
  await expect(machine).not.toContainText("yapınca senin");
  // With no start screen, the machine itself carries the key legend.
  const legend = machine.getByRole("list", { name: "Tuşlar" });
  await expect(legend).toBeVisible();
  await expect(legend).toContainText("Boşluk ya da kola tıkla");
  await expect(legend).toContainText("çevir");
  await expect(legend).toContainText("Esc");
  await expect(legend).toContainText("salona dön");
  const overflow = await page.evaluate(() => ({
    down: document.documentElement.scrollHeight - window.innerHeight,
    across: document.documentElement.scrollWidth - window.innerWidth,
  }));
  expect(overflow).toEqual({ down: 0, across: 0 });

  // The first Space: the reels turn and stop, and the score shows on the
  // machine itself; no "Tur bitti" card.
  await page.keyboard.press(" ");
  await expect(display).toContainText(/%(0|50|100)/, { timeout: 5000 });
  await expect(page.getByRole("dialog", { name: "Tur bitti" })).toBeHidden();

  // A click on the lever spins too: a second Round, landed on the machine.
  await page.getByRole("button", { name: "Kolu çek" }).click();
  await expect(page.locator("[data-spins]")).toHaveText("2", { timeout: 5000 });
  await expect(display).toContainText(/%(0|50|100)/);

  // Esc between spins is the hub at once, with no question. The Round was
  // recorded (a Best score on the tile) and gave no Points.
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/20261209\/$/);
  await expect(row(page, "Slot makinesi")).toContainText(/%(0|50|100)/);
  await expect(row(page, "Slot makinesi")).toContainText("Puan vermez");
  await expect(page.locator('[data-stat="earned"]')).toHaveText("0");
  await expect(page.getByText("1/11 oynandı")).toBeVisible();
});

test("the Proof lists what she holds and won, and its check code is the tail of the Save code Yedekle shows (#197)", async ({ page }) => {
  // Rocky Horror held; hafiza, wordle, kadraj won at the bar, the slot by its
  // jackpot. First the code Yedekle shows, to compare the paper against.
  await seed(page, A_LATER_EVENING);
  await page.goto(HUB);
  const tools = page.getByRole("navigation", { name: "Araçlar" });
  await tools.getByRole("button", { name: "Yedekle" }).click();
  const yedekle = page.getByRole("dialog", { name: "Yedekle" });
  const code = await yedekle.getByRole("textbox").inputValue();
  await yedekle.getByRole("button", { name: "Kapat" }).click();

  // The hub's "Belge" link opens the Proof, Turkish like the rest.
  await tools.getByRole("link", { name: "Belge" }).click();
  await expect(page).toHaveURL(/\/20261209\/belge\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "tr");

  // The Gift she holds with its line; the Small prizes she won, in the hub's
  // order, each with the Game that gave it; today's date, written out.
  const gifts = page.getByRole("list", { name: "Sendeki hediyeler" });
  await expect(gifts.getByRole("listitem")).toHaveText([/Rocky Horror film gecesi/]);
  await expect(gifts).toContainText("The Rocky Horror Picture Show ile şarkılı, danslı bir film gecesi.");
  const prizes = page.getByRole("list", { name: "Kazandığın küçük ödüller" });
  await expect(prizes.getByRole("listitem")).toHaveText([
    /Mei Wah'da akşam yemeği/,
    /Paper Apps: The Games/,
    /Sage bottomless portafiltre/,
    /Kazımalı dünya haritası/,
  ]);
  await expect(prizes).toContainText("Hafıza kartları");
  await expect(page.getByText(/^\d{1,2} \S+ \d{4}$/)).toBeVisible();

  // The check code is the code's last six characters; the whole code is on
  // the paper too, so the paper is the last backup.
  await expect(page.getByText(code.slice(-6), { exact: true })).toBeVisible();
  await expect(page.getByText(code, { exact: true })).toBeVisible();

  // On paper the UI goes away; the one-page fit is Atıl's to check by hand.
  const print = page.getByRole("button", { name: "Yazdır" });
  const back = page.getByRole("link", { name: /Salona dön/ });
  await expect(print).toBeVisible();
  await expect(back).toBeVisible();
  await page.emulateMedia({ media: "print" });
  await expect(print).toBeHidden();
  await expect(back).toBeHidden();
});

test("Kelime avı: a short row is refused, the answer from its İpucu wins %100, and the hub tile shows it (#201)", async ({ page }) => {
  await seed(page, { best: {}, jackpot: false, log: [] });
  await page.goto("/20261209/wordle/");
  const start = page.getByRole("dialog", { name: "Kelime avı" });
  await expect(start).toContainText("Paper Apps: The Games");

  // Enter: the HUD, the hint from the first second, the whole grid of six rows.
  await page.keyboard.press("Enter");
  await expect(page.getByText("Tahmin 1/6 · Şimdi bilirsen %100")).toBeVisible();
  const hint = (await page.locator("[data-hint]").innerText()).trim();
  const answer = ANSWERS.find((a) => a.hint === hint)?.answer;
  expect(answer, `no answer has the hint "${hint}"`).toBeDefined();
  await expect(page.getByRole("row")).toHaveCount(6);

  // One letter and Enter: refused, nothing sent.
  await page.keyboard.press("a");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Eksik harf var")).toBeVisible();
  await expect(page.getByText("Tahmin 1/6")).toBeVisible();

  // Take it back and type the answer: plain letters on the physical keys,
  // in small letters (so a dotted i must come up İ), and Ç Ğ I Ö Ş Ü on the
  // on-screen keyboard — Playwright has no keydown for those.
  await page.keyboard.press("Backspace");
  const keyboard = page.getByRole("group", { name: "Klavye" });
  for (const letter of answer!.replace(/ /g, "")) {
    const small = letter.toLocaleLowerCase("tr");
    if (/^[a-z]$/.test(small)) await page.keyboard.press(small);
    else await keyboard.getByRole("button", { name: letter, exact: true }).click();
  }
  await page.keyboard.press("Enter");
  const result = page.getByRole("dialog", { name: "Tur bitti" });
  await expect(result).toBeVisible();
  await expect(result).toContainText("%100");
  await expect(result).toContainText("1. tahminde buldun");
  await expect(result).toContainText("Küçük ödül kazandın: Paper Apps: The Games!");
  const overflow = await page.evaluate(() => ({
    down: document.documentElement.scrollHeight - window.innerHeight,
    across: document.documentElement.scrollWidth - window.innerWidth,
  }));
  expect(overflow).toEqual({ down: 0, across: 0 });

  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/20261209\/$/);
  await expect(row(page, "Kelime avı")).toContainText("%100");
  await expect(row(page, "Kelime avı")).toContainText("Kazandın!");
});

test("Yürüyüş haritası: walked by number keys along the shortest route, it scores %100 and the hub tile shows it (#202)", async ({ page }) => {
  await seed(page, { best: {}, jackpot: false, log: [] });
  // The same throw on every page load, so a repeat map would show every time.
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
  await page.goto("/20261209/yuruyus/");
  const start = page.getByRole("dialog", { name: "Yürüyüş haritası" });
  await expect(start).toContainText("Piknik günü");
  await expect(start).toContainText("en kısanın %10 fazlasına kadar %100");

  // The map is dealt at random; the HUD names it, and the core knows its shortest route.
  await page.keyboard.press("Enter");
  const name = (await page.locator("[data-hud-map]").innerText()).trim();
  const map = MAPS.find((m) => m.name === name);
  expect(map, `no map is called "${name}"`).toBeDefined();
  const best = shortestRoute(map!);

  // One step and Backspace: back at the car park.
  await page.keyboard.press("1");
  await expect(page.getByText("1 patika")).toBeVisible();
  await page.keyboard.press("Backspace");
  await expect(page.getByText("0 patika")).toBeVisible();

  // The badges number the choices clockwise from north; press the one on the shortest route.
  for (let i = 1; i < best.route.length; i++) {
    const key = choices(map!, best.route.slice(0, i)).indexOf(best.route[i]!) + 1;
    await page.keyboard.press(String(key));
  }
  await expect(page.getByText("Zirvedesin. Rotan hazır mı?")).toBeVisible();
  await page.keyboard.press("Enter");
  const result = page.getByRole("dialog", { name: "Tur bitti" });
  await expect(result).toContainText("%100");
  await expect(result).toContainText("en kısa rotayı buldun!");
  await expect(result).toContainText("Küçük ödül kazandın: Piknik günü!");

  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/20261209\/$/);
  await expect(row(page, "Yürüyüş haritası")).toContainText("%100");

  // Back on the hiking page, a fresh page load: not the map she just walked,
  // even with the dice pinned to the same throw.
  await page.goto("/20261209/yuruyus/");
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-hud-map]")).not.toHaveText(name);
});

test("Kadraj: five crops by keys, a reveal after each, the five on the result card and its score on the hub tile (#203)", async ({ page }) => {
  await seed(page, { best: {}, jackpot: false, log: [] });
  await page.goto("/20261209/kadraj/");
  const start = page.getByRole("dialog", { name: "Kadraj" });
  await expect(start).toContainText("Sage bottomless portafiltre");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Fotoğraf 1/5")).toBeVisible();

  // Each photo: shrink and turn the box, crop it, see the reveal, go on.
  for (let i = 1; i <= 5; i++) {
    await expect(page.getByText(`Fotoğraf ${i}/5`)).toBeVisible();
    await expect(page.getByRole("button", { name: /Kırp/ })).toBeEnabled(); // the photo is in
    await page.keyboard.press("q");
    await page.keyboard.press("x");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: i < 5 ? /Sonraki/ : /Sonuç/ })).toBeVisible();
    await page.keyboard.press("Enter");
  }

  const result = page.getByRole("dialog", { name: "Tur bitti" });
  await expect(result.getByRole("img", { name: /^Fotoğraf \d$/ })).toHaveCount(5);
  await expect(result).toContainText("en düşük · %5");
  const score = (await result.locator("[data-shell-score]").innerText()).trim();
  const overflow = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  expect(overflow).toBe(0);

  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/20261209\/$/);
  await expect(row(page, "Kadraj")).toContainText(score);
});

test("Hollanda'da sürüş: full gas down the first street, the HUD names the speeding as it happens and the score drops to %97 (#206)", async ({ page }) => {
  await seed(page, { best: {}, jackpot: false, log: [] });
  await page.goto("/20261209/surus/");
  const start = page.getByRole("dialog", { name: "Hollanda'da sürüş" });
  await expect(start).toContainText("Çift bisiklet çantası");
  await expect(start).toContainText("Ağır hata −%10");
  await expect(start).toContainText("Kanala düşme");
  const overflow = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  expect(overflow).toBe(0);

  // Enter, the 3 s countdown, then the gas held down: 30 + 3 km/h for 1.5 s is a light mistake.
  await page.keyboard.press("Enter");
  await expect(page.getByText("1 / 7")).toBeVisible();
  await page.keyboard.down("ArrowUp");
  await expect(page.getByText("Hız sınırını aştın")).toBeVisible({ timeout: 12_000 });
  await page.keyboard.up("ArrowUp");
  await expect(page.locator("[data-hud-score]")).toHaveText("%97");
  await expect(page.getByText("1 hafif")).toBeVisible();
});

test("Kayak macerası: riding into the first rock is a fall, P stops the clock, and a Round left before the finish scores nothing (#207)", async ({ page }) => {
  await seed(page, { best: {}, jackpot: false, log: [] });
  await page.goto("/20261209/kayak/");
  const start = page.getByRole("dialog", { name: "Kayak macerası" });
  await expect(start).toContainText("Termal spa günü");
  await expect(start).toContainText("Baştan başla");
  const overflow = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  expect(overflow).toBe(0);

  // No jump: the first rock on the fixed course stops her within a few seconds.
  await page.keyboard.press("Enter");
  await expect(page.getByText("0 / 72")).toBeVisible();
  await expect(page.getByText("Düştün! Kontrol noktasına dönülüyor")).toBeVisible({ timeout: 10_000 });

  // P: the slope stands still and the clock with it.
  await page.keyboard.press("p");
  await expect(page.getByText("Duraklatıldı")).toBeVisible();
  const time = page.locator("[data-hud-time]");
  const frozen = await time.innerText();
  await page.waitForTimeout(400);
  await expect(time).toHaveText(frozen);

  // Esc, then Çık: a Round that never reached the finish leaves the tile unplayed.
  await page.keyboard.press("Escape");
  await expect(page.getByText("Turdan çıkılsın mı?")).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/20261209\/$/);
  await expect(row(page, "Kayak macerası")).toContainText("Henüz oynamadın");
});

/**
 * The pause both real-time Games share (Atıl's fixes after #206, #207): P
 * pauses and P resumes; a lost window focus pauses too and stays paused when
 * the focus comes back, until she presses P. The overlay says so, and the
 * clock stands still under it.
 */
for (const { path, name } of [
  { path: "/20261209/surus/", name: "Hollanda'da sürüş" },
  { path: "/20261209/kayak/", name: "Kayak macerası" },
]) {
  test(`${name}: P pauses and resumes; a lost focus pauses until P`, async ({ page }) => {
    await seed(page, { best: {}, jackpot: false, log: [] });
    await page.goto(path);
    const start = page.getByRole("dialog", { name });
    await expect(start.getByRole("listitem").filter({ hasText: "Duraklat" })).toContainText("P");
    await page.keyboard.press("Enter");
    const overlay = page.getByRole("status").filter({ hasText: "Duraklatıldı" });
    const time = page.locator("[data-hud-time]");
    await expect(time).not.toHaveText(/^0:00(\.0)?$/, { timeout: 6000 });

    await page.keyboard.press("p");
    await expect(overlay).toBeVisible();
    await expect(overlay).toContainText("Devam etmek için P'ye bas");
    const held = await time.innerText();
    await page.waitForTimeout(400);
    await expect(time).toHaveText(held);
    await page.keyboard.press("p");
    await expect(overlay).toBeHidden();
    await expect(time).not.toHaveText(held);

    await page.evaluate(() => window.dispatchEvent(new Event("blur")));
    await expect(overlay).toBeVisible();
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await page.waitForTimeout(400);
    await expect(overlay).toBeVisible();
    await page.keyboard.press("p");
    await expect(overlay).toBeHidden();
  });
}
