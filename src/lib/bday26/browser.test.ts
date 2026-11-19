/*
 * Tests for the browser side of the ledger: how a page opens it.
 *
 *   node --test src/lib/bday26/browser.test.ts
 *
 * Seam 1 of the spec (#192, "Testing Decisions"), at the one place the ledger
 * meets the browser. The browser is a system boundary, so it is a fake here:
 * an object with `localStorage` and `navigator.storage`, nothing else. Each
 * test opens a ledger the way the hub does and reads what she would see on
 * the next visit. What the spec pins (#193): progress lives in `localStorage`,
 * `navigator.storage.persist()` is asked once, and a browser that blocks
 * storage still gets a working hub. #195 adds the welcome screen's flag,
 * opened on the same browser the same way.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { openLedger, openWelcome, type BrowserLike } from "./browser.ts";

/** A browser with working storage. `persisted` counts the persist() calls. */
function fakeBrowser(): BrowserLike & { persisted: number } {
  const data = new Map<string, string>();
  const fake = {
    persisted: 0,
    localStorage: {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => void data.set(key, value),
    },
    navigator: {
      storage: {
        persist: async () => {
          fake.persisted += 1;
          return true;
        },
      },
    },
  };
  return fake;
}

test("a Round recorded on one visit is her Best score on the next", () => {
  const browser = fakeBrowser();
  openLedger(browser).recordRound("hafiza", 90);

  const nextVisit = openLedger(browser);
  assert.equal(nextVisit.bestOf("hafiza"), 90);
  assert.equal(nextVisit.earned(), 90);
});

test("the browser is asked to persist her storage once, not once per ledger", () => {
  const browser = fakeBrowser();
  openLedger(browser);
  openLedger(browser);
  assert.equal(browser.persisted, 1);
});

test("a browser that blocks storage and has no persist still opens a working hub", () => {
  const blocked: BrowserLike = {
    get localStorage(): never {
      throw new Error("SecurityError: storage is disabled");
    },
    navigator: {},
  };
  const ledger = openLedger(blocked);
  ledger.recordRound("wordle", 96);
  assert.equal(ledger.earned(), 96);
  assert.ok(ledger.buy("rocky").ok === false, "260 is more than 96, so the buy is refused");
});

test("the welcome she closed on one visit stays closed on the next; a blocked browser shows it again", () => {
  const browser = fakeBrowser();
  const firstVisit = openWelcome(browser);
  assert.equal(firstVisit.shouldShow(), true);
  firstVisit.markSeen();
  assert.equal(openWelcome(browser).shouldShow(), false);

  const blocked: BrowserLike = {
    get localStorage(): never {
      throw new Error("SecurityError: storage is disabled");
    },
  };
  assert.equal(openWelcome(blocked).shouldShow(), true);
});
