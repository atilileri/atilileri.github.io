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
import { GAMES, GIFTS } from "./catalogue.ts";

test("every Gift price is a multiple of 10, so a Return is always whole", () => {
  for (const gift of GIFTS) assert.equal(gift.price % 10, 0, `${gift.id}: ${gift.price}`);
});

test("the hub has 11 Games, one of them luck, and 14 Gifts", () => {
  assert.equal(GAMES.length, 11);
  assert.equal(GAMES.filter((g) => g.luck).length, 1);
  assert.equal(GIFTS.length, 14);
});
