import { chromium, expect, test, type Page } from "@playwright/test";

/**
 * The birthday games smoke, part two: the review fixes on the hub, the
 * ledger and the Proof (review A1, C1–C5, D4, H1, M6). Same project and
 * build as `smoke.spec.ts` (`npm run test:smoke`); kept apart so that file
 * stays the walk of each ticket as it shipped.
 *
 * Every assertion reads what she would see: texts, roles, focus, boxes on
 * her screen, pages of the printed Proof. Seeds use the ledger's key and
 * shape (spec, "Progress state"), as `smoke.spec.ts` does.
 */

const HUB = "/20261209/";
const PROOF = "/20261209/belge/";

/** Plant progress for her first visit only, welcome already seen (see
 *  `seed` in smoke.spec.ts for why). */
async function seed(page: Page, progress: object) {
  await page.addInitScript((p) => {
    if (localStorage.getItem("bday26:v1") == null) {
      localStorage.setItem("bday26:v1", JSON.stringify(p));
    }
    localStorage.setItem("bday26:welcome", "seen");
  }, progress);
}

function balance(page: Page) {
  return page.locator('[data-stat="balance"]');
}

function row(page: Page, name: string) {
  return page.getByRole("listitem").filter({ hasText: name });
}

/** 283 Points: hafiza 100, milyoner 88, wordle 95.5 (95), slot no Points. */
const AN_EVENING = {
  best: { hafiza: 100, milyoner: 88, wordle: 95.5, slot: 40 },
  jackpot: true,
  log: [],
};

/**
 * The fullest Proof she could print: four Gifts with long lines, nine Small
 * prizes (seven skill Games and two Prize Games at the bar), and a gift from
 * Atıl. 700 earned + 2,000 gifted − 2,650 paid = 50 left.
 */
const A_FULL_PROOF = {
  best: {
    milyoner: 100,
    nerede: 100,
    hafiza: 100,
    wordle: 100,
    sarki: 100,
    piyano: 100,
    kadraj: 100,
    bavul: 96,
    renk: 97,
  },
  jackpot: false,
  log: [
    { kind: "buy", gift: "gezi", paid: 950 },
    { kind: "buy", gift: "yinyin", paid: 800 },
    { kind: "buy", gift: "pikap", paid: 500 },
    { kind: "buy", gift: "atolye", paid: 400 },
  ],
  gifted: [{ points: 2000, note: "Doğum günü sürprizi, bir de bulaşıklar için", at: "2026-12-09T10:00:00.000Z" }],
};

// ─────────────────────────────────────────────────────────── the Proof

test("the Proof prints the gifted total, and the fullest Proof fits one A4 page (review H1, M6)", async ({ page }) => {
  await seed(page, A_FULL_PROOF);
  await page.goto(PROOF);
  await expect(page.getByRole("list", { name: "Sendeki hediyeler" }).getByRole("listitem")).toHaveCount(4);
  await expect(page.getByRole("list", { name: "Kazandığın küçük ödüller" }).getByRole("listitem")).toHaveCount(9);
  await expect(page.getByText("Atıl'dan hediye puan: 2.000")).toBeVisible();

  await page.emulateMedia({ media: "print" });
  const pdf = (await page.pdf({ format: "A4" })).toString("latin1");
  const pages = pdf.match(/\/Type\s*\/Page(?!s)/g) ?? [];
  expect(pages).toHaveLength(1);
});

test("with no gift from Atıl the Proof prints no gifted total", async ({ page }) => {
  await seed(page, AN_EVENING);
  await page.goto(PROOF);
  await expect(page.getByRole("list", { name: "Kazandığın küçük ödüller" }).getByRole("listitem")).toHaveCount(3);
  await expect(page.getByText("Atıl'dan hediye puan")).toHaveCount(0);
});

// ──────────────────────────────────────────── fresh progress (review A1)

/** 283 Points, as AN_EVENING, but the slot machine never played. */
const NO_SLOT_YET = { best: { hafiza: 100, milyoner: 88, wordle: 95.5 }, jackpot: false, log: [] };

test("Back to the hub after a Round, then a buy: the new Best score survives (review A1)", async ({ baseURL }) => {
  // Playwright turns the back/forward cache off, and its headless shell has
  // none at all; this case needs it on, the way her Chrome has it, so it
  // runs in full Chromium (new headless) without Playwright's switch.
  const browser = await chromium.launch({ channel: "chromium", ignoreDefaultArgs: ["--disable-back-forward-cache"] });
  try {
    const context = await browser.newContext({ baseURL, viewport: { width: 1920, height: 1080 } });
    await context.addInitScript((p) => {
      if (localStorage.getItem("bday26:v1") == null) localStorage.setItem("bday26:v1", JSON.stringify(p));
      localStorage.setItem("bday26:welcome", "seen");
      // Note whether a page came back from the cache, so the case knows it
      // tested what it means to.
      addEventListener("pageshow", (event) => {
        if (event.persisted) sessionStorage.setItem("restored-from-bfcache", "yes");
      });
    }, NO_SLOT_YET);
    const page = await context.newPage();

    await page.goto(HUB);
    await expect(balance(page)).toHaveText(["283", "283"]);
    const slot = row(page, "Slot makinesi");
    await expect(slot.locator("[data-best]")).toHaveText("—");

    // A Round on the slot machine: one spin.
    await slot.getByRole("link", { name: "Oyna" }).click();
    await expect(page).toHaveURL(/\/20261209\/slot\/$/);
    // The page's module script binds Space; under a full suite's load a key
    // pressed at URL change can land before it does.
    await page.waitForLoadState("load");
    await page.keyboard.press(" ");
    await expect(page.getByRole("status")).toContainText(/%\d+/, { timeout: 5000 });

    // Back: the hub shows the Round, not what it held when she left.
    // (A page restored from the cache fires no "load"; wait for the commit.)
    await page.goBack({ waitUntil: "commit" });
    await expect(page).toHaveURL(/\/20261209\/$/);
    await expect(slot.locator("[data-best]")).toHaveText(/^%\d+$/);
    expect(await page.evaluate(() => sessionStorage.getItem("restored-from-bfcache"))).toBe("yes");
    const best = await slot.locator("[data-best]").textContent();

    // A buy now keeps that Best score, on this visit and the next.
    await row(page, "Rocky Horror film gecesi").getByRole("button", { name: "Al", exact: true }).click();
    await page.getByRole("dialog", { name: /Alıyor musun\?$/ }).getByRole("button", { name: "Al", exact: true }).click();
    await expect(balance(page)).toHaveText(["23", "23"]);
    await page.reload();
    await expect(slot.locator("[data-best]")).toHaveText(best!);
    await expect(balance(page)).toHaveText(["23", "23"]);
  } finally {
    await browser.close();
  }
});

test("a buy in a second tab repaints the hub in the first (review A1)", async ({ context }) => {
  await context.addInitScript((p) => {
    if (localStorage.getItem("bday26:v1") == null) localStorage.setItem("bday26:v1", JSON.stringify(p));
    localStorage.setItem("bday26:welcome", "seen");
  }, AN_EVENING);
  const first = await context.newPage();
  await first.goto(HUB);
  await expect(balance(first)).toHaveText(["283", "283"]);

  const second = await context.newPage();
  await second.goto(HUB);
  await row(second, "Rocky Horror film gecesi").getByRole("button", { name: "Al", exact: true }).click();
  await second.getByRole("dialog", { name: /Alıyor musun\?$/ }).getByRole("button", { name: "Al", exact: true }).click();
  await expect(balance(second)).toHaveText(["23", "23"]);

  await expect(balance(first)).toHaveText(["23", "23"]);
  await expect(row(first, "Rocky Horror film gecesi").getByRole("button", { name: "İade et · +130" })).toBeVisible();
});

// ───────────────────────────────────────── the shop (review C1–C5, K1)

for (const [width, height] of [
  [1920, 1080],
  [1366, 768],
] as const) {
  test(`at ${width}×${height} the backup prompt sits in the shop, covers no "Oyna", and leaves when Yedekle opens (review C1)`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await seed(page, AN_EVENING);
    await page.goto(HUB);
    await row(page, "Rocky Horror film gecesi").getByRole("button", { name: "Al", exact: true }).click();
    await page.getByRole("dialog", { name: /Alıyor musun\?$/ }).getByRole("button", { name: "Al", exact: true }).click();

    const prompt = page.getByRole("status").filter({ hasText: "Yedek kodunu" });
    await expect(prompt).toBeInViewport({ ratio: 1 });
    const box = (await prompt.boundingBox())!;
    const shop = (await page.locator("[data-shop]").boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(shop.x);
    expect(box.x + box.width).toBeLessThanOrEqual(shop.x + shop.width);

    const covered: string[] = [];
    for (const play of await page.getByRole("link", { name: "Oyna" }).all()) {
      const b = await play.boundingBox();
      if (!b) continue;
      const apart =
        b.x + b.width <= box.x || box.x + box.width <= b.x || b.y + b.height <= box.y || box.y + box.height <= b.y;
      if (!apart) covered.push((await play.getAttribute("href")) ?? "?");
    }
    expect(covered).toEqual([]);

    await page.getByRole("navigation", { name: "Araçlar" }).getByRole("button", { name: "Yedekle" }).click();
    await expect(page.getByRole("dialog", { name: "Yedekle" })).toBeVisible();
    await expect(prompt).toBeHidden();
  });
}

test("by keyboard: Enter on a Gift asks first, a held Enter cannot answer, Esc says no, Enter says yes (review C2)", async ({ page }) => {
  await seed(page, AN_EVENING);
  await page.goto(HUB);
  const rocky = row(page, "Rocky Horror film gecesi");
  const ask = page.getByRole("dialog", { name: "Rocky Horror film gecesi · 260 puan. Alıyor musun?" });
  await rocky.focus();

  // Held down: the first Enter opens the card, its repeats answer nothing.
  await page.keyboard.down("Enter");
  await expect(ask).toBeVisible();
  await page.keyboard.down("Enter");
  await page.keyboard.down("Enter");
  await page.keyboard.up("Enter");
  await expect(ask).toBeVisible();
  await expect(balance(page)).toHaveText(["283", "283"]);

  // Tab stays on the card's two buttons; Enter on "Vazgeç" is a no.
  const yes = ask.getByRole("button", { name: "Al", exact: true });
  const no = ask.getByRole("button", { name: "Vazgeç" });
  await expect(yes).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(no).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(yes).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(no).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(ask).toBeHidden();
  await expect(balance(page)).toHaveText(["283", "283"]);
  await expect(rocky).toBeFocused();

  // Esc is a no too, and focus comes back to the Gift.
  await page.keyboard.press("Enter");
  await expect(ask).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(ask).toBeHidden();
  await expect(balance(page)).toHaveText(["283", "283"]);
  await expect(rocky).toBeFocused();

  // Enter, Enter: bought.
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await expect(ask).toBeHidden();
  await expect(balance(page)).toHaveText(["23", "23"]);
  await expect(rocky.getByRole("button", { name: "İade et · +130" })).toBeVisible();
  await expect(rocky).toBeFocused();

  // On a held Gift, Enter asks for the Return the same way.
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Rocky Horror film gecesi · 130 puan geri gelir. İade ediyor musun?" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(balance(page)).toHaveText(["23", "23"]);
});

test("before her first Round no Gift says \"eksik\", only its price; after one, a Gift she cannot afford does (review C4)", async ({ page }) => {
  await seed(page, { best: {}, jackpot: false, log: [], gifted: [{ points: 50, at: "2026-12-09T10:00:00.000Z" }] });
  await page.goto(HUB);
  await expect(balance(page)).toHaveText(["50", "50"]);
  await expect(row(page, "Bir haftalık gezi")).toContainText("950");
  await expect(page.locator("[data-shop]").getByText(/eksik/).locator("visible=true")).toHaveCount(0);

  // One Round of Milyoner at %10: 60 Points in all, 890 short of the trip.
  await page.evaluate(() => {
    const p = JSON.parse(localStorage.getItem("bday26:v1")!);
    p.best = { milyoner: 10 };
    localStorage.setItem("bday26:v1", JSON.stringify(p));
  });
  await page.reload();
  await expect(row(page, "Bir haftalık gezi")).toContainText("890 eksik");
});

test("the shop is one Tab stop: Up and Down move between Gifts, and Tab comes back to the one she was on (review C5)", async ({ page }) => {
  await seed(page, AN_EVENING);
  await page.goto(HUB);
  const inShop = () => page.evaluate(() => document.activeElement?.closest("[data-shop]") != null);

  // From the last Game's "Oyna", Tab lands on the first Gift, and the next
  // Tab leaves the shop: no second Gift, no "Al" on the way.
  await page.getByRole("link", { name: "Oyna" }).last().focus();
  await page.keyboard.press("Tab");
  await expect(row(page, "Bir haftalık gezi")).toBeFocused();
  await page.keyboard.press("Tab");
  expect(await inShop()).toBe(false);

  await page.keyboard.press("Shift+Tab");
  await expect(row(page, "Bir haftalık gezi")).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(row(page, "Yeni objektif")).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(row(page, "Yin Yin konseri")).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(row(page, "Yeni objektif")).toBeFocused();
  await page.keyboard.press("End");
  await expect(row(page, "De Slak'ta akşam yemeği")).toBeFocused();

  // Away and back: the shop remembers the Gift she was on.
  await page.keyboard.press("Tab");
  expect(await inShop()).toBe(false);
  await page.keyboard.press("Shift+Tab");
  await expect(row(page, "De Slak'ta akşam yemeği")).toBeFocused();
});

// ───────────────────────────────────────────── the tiles (review D4)

test("every tile with a bar labels its tick %95 and says what it is for; the slot has no bar (review D4)", async ({ page }) => {
  await seed(page, AN_EVENING);
  await page.goto(HUB);
  const tip = "%95 yapınca küçük ödül senin";
  await expect(page.getByTitle(tip)).toHaveCount(13);
  await expect(row(page, "Milyoner").getByTitle(tip)).toHaveText("%95");
  await expect(row(page, "Milyoner").getByTitle(tip).getByText("%95")).toBeVisible();
  await expect(row(page, "Slot makinesi").getByTitle(tip)).toHaveCount(0);
});
