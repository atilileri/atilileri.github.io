/*
 * Tests for Atıl's corner: what it accepts as a gift of Points.
 *
 *   node --test src/lib/bday26/admin.test.ts
 *
 * The panel's DOM is the smoke's (tests/bday26/smoke.spec.ts); this file
 * tests the one rule the corner adds on top of the ledger's "a whole number
 * above 0": a gift is at most 10 000 Points (review A4), so a stray key or a
 * pasted 1e308 never reaches her Balance. Each refusal is one Turkish
 * sentence.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { GIFT_MAX, readGiftAmount } from "./admin.ts";

test("a gift is a whole number from 1 to 10 000", () => {
  assert.equal(GIFT_MAX, 10_000);
  assert.deepEqual(readGiftAmount("1"), { ok: true, points: 1 });
  assert.deepEqual(readGiftAmount("500"), { ok: true, points: 500 });
  assert.deepEqual(readGiftAmount(" 10000 "), { ok: true, points: 10_000 });
});

test("anything else is refused with one Turkish sentence that names the range", () => {
  for (const raw of ["", "0", "-5", "2.5", "10001", "1e308", "Infinity", "abc", "1e3x"]) {
    const outcome = readGiftAmount(raw);
    assert.equal(outcome.ok, false, raw);
    if (!outcome.ok) assert.equal(outcome.message, "1 ile 10.000 arasında bir tam sayı yaz.", raw);
  }
});
