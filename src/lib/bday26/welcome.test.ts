/*
 * Tests for the welcome screen's "seen" flag.
 *
 *   node --test src/lib/bday26/welcome.test.ts
 *
 * Seam 1 of the spec (#192, "Testing Decisions"): a plain module with
 * injected storage, run in Node with no browser. Each test plays a visit or
 * two the way the hub does — ask whether to show the welcome, mark it seen when she closes it —
 * and reads what she would get on the next visit. None of them looks at how
 * the flag is written, only that it is not her progress (#195: "UI state in
 * its own key, outside the progress state and the Save code").
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createWelcome } from "./welcome.ts";
import { STORAGE_KEY as PROGRESS_KEY } from "./ledger.ts";
import { memoryStore, blockedStore } from "./test-store.ts";

test("a fresh browser shows the welcome on the first visit and not on the second", () => {
  const browser = memoryStore();
  const firstVisit = createWelcome(browser);
  assert.equal(firstVisit.shouldShow(), true);
  firstVisit.markSeen();

  const secondVisit = createWelcome(browser);
  assert.equal(secondVisit.shouldShow(), false);
});

test("a visit that leaves before closing the welcome shows it again on the next", () => {
  // The hub marks it seen on close only: a reload while it is open is no close.
  const browser = memoryStore();
  assert.equal(createWelcome(browser).shouldShow(), true);

  const reload = createWelcome(browser);
  assert.equal(reload.shouldShow(), true);
  reload.markSeen();
  assert.equal(createWelcome(browser).shouldShow(), false);
});

test("her progress is not the flag: a browser holding progress but no flag still shows the welcome", () => {
  // A Save code restored on a new device (#196) brings progress, not the flag.
  const browser = memoryStore({
    [PROGRESS_KEY]: JSON.stringify({ best: { hafiza: 100 }, jackpot: false, log: [] }),
  });
  assert.equal(createWelcome(browser).shouldShow(), true);
});

test("marking the welcome seen leaves her progress byte for byte as it was", () => {
  const progress = JSON.stringify({ best: { milyoner: 88 }, jackpot: true, log: [] });
  const browser = memoryStore({ [PROGRESS_KEY]: progress });
  createWelcome(browser).markSeen();
  assert.equal(browser.data.get(PROGRESS_KEY), progress);
});

test("a browser that blocks storage greets her every visit rather than never, and marking seen does not throw", () => {
  const blocked = blockedStore();
  const welcome = createWelcome(blocked);
  assert.equal(welcome.shouldShow(), true);
  assert.doesNotThrow(() => welcome.markSeen());
});
