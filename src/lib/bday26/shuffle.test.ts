/*
 * Tests for the one shuffle every dealt Game uses (memory, "Bu nerede?",
 * Milyoner, "Şarkıyı bil", Kelime avı).
 *
 *   node --test src/lib/bday26/shuffle.test.ts
 *
 * Expected orders are worked by hand on Fisher–Yates with a fixed random
 * source, not read back from the code.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { shuffle } from "./shuffle.ts";

test("a random source of 0 rotates the list one place: each step swaps with the first item", () => {
  assert.deepEqual(shuffle(["a", "b", "c", "d"], () => 0), ["b", "c", "d", "a"]);
});

test("a random source just under 1 keeps the order: each step swaps an item with itself", () => {
  assert.deepEqual(shuffle(["a", "b", "c", "d"], () => 0.999), ["a", "b", "c", "d"]);
});

test("the list handed in is left as it was, and every item comes back once", () => {
  const items = [1, 2, 3, 4, 5, 6];
  let x = 7;
  const out = shuffle(items, () => ((x = (x * 9301 + 49297) % 233280) / 233280));
  assert.deepEqual(items, [1, 2, 3, 4, 5, 6]);
  assert.deepEqual([...out].sort(), [1, 2, 3, 4, 5, 6]);
});

test("a source that returns 1 by mistake still lands inside the list", () => {
  assert.deepEqual(shuffle(["a", "b", "c"], () => 1), ["a", "b", "c"]);
});
