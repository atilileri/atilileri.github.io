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
