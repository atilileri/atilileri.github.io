/*
 * Tests for the catalogue's one arithmetic promise.
 *
 *   node --test src/lib/bday26/catalogue.test.ts
 *
 * The text of the catalogue is Atıl's to approve by eye, not a test's to pin.
 * What a test CAN pin is the promise the ledger leans on: every price is a
 * multiple of 10, so half of it — what a Return gives back — is a whole
 * number of Points (#176, spec "Progress state").
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { GAMES, GIFTS, SHOP_GIFTS } from "./catalogue.ts";

test("every Gift price is a multiple of 10, so a Return is always whole", () => {
  for (const gift of GIFTS) assert.equal(gift.price % 10, 0, `${gift.id}: ${gift.price}`);
});

test("the hub has 14 Games: 10 skill Games, 3 Prize Games, the slot machine last", () => {
  assert.equal(GAMES.length, 14);
  assert.deepEqual(
    GAMES.map((g) => g.id).slice(-4),
    ["bavul", "renk", "barista", "slot"],
  );
  assert.deepEqual(GAMES.filter((g) => g.prizeGame).map((g) => g.id), ["bavul", "renk", "barista"]);
  assert.equal(GAMES.filter((g) => g.luck).length, 1);
});

// #213 says 11: it counted the 13 Gifts of main. De Slak joined the shop the
// same day (Piyano's kanun song), so 14 − 2 = 12.
test("the shop shows 12 Gifts; the weekend trip and the paint set are Small prizes now, not Gifts", () => {
  assert.deepEqual(
    SHOP_GIFTS.map((g) => `${g.id} ${g.price}`),
    [
      "gezi 950",
      "objektif 850",
      "yinyin 800",
      "kayakekip 750",
      "pikap 500",
      "karsu 450",
      "atolye 400",
      "theragun 360",
      "urban 330",
      "kurs 290",
      "rocky 260",
      "deslak 100",
    ],
  );
});
