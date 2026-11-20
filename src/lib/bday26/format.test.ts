/*
 * Tests for the one set of number formatters every bday26 page writes with.
 *
 *   node --test src/lib/bday26/format.test.ts
 *
 * Expected strings are the Turkish forms she reads on the pages, written by
 * hand: a dot between thousands, a comma before decimals.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { formatDecimal, formatPoints, formatScore, formatTenths } from "./format.ts";

test("Points are whole, with a Turkish thousands dot", () => {
  assert.equal(formatPoints(250), "250");
  assert.equal(formatPoints(1000), "1.000");
  assert.equal(formatPoints(999.6), "1.000");
});

test("a score reads %88, rounded down like the Points it earns", () => {
  assert.equal(formatScore(87.9), "%87");
  assert.equal(formatScore(100), "%100");
  assert.equal(formatScore(0), "%0");
});

test("a decimal keeps its digits, with a Turkish comma", () => {
  assert.equal(formatDecimal(8.84), "8,8");
  assert.equal(formatDecimal(23), "23,0");
  assert.equal(formatDecimal(1.25, 2), "1,25");
  assert.equal(formatDecimal(18.4, 0), "18");
});

test("tenths drop a trailing zero: 23 kg, not 23,0 kg", () => {
  assert.equal(formatTenths(23), "23");
  assert.equal(formatTenths(2.46), "2,5");
  assert.equal(formatTenths(12.04), "12");
});
