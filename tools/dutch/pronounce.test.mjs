// Offline tests for the pure parts of pronounce.mjs, plus one fail-soft test
// with a stubbed fetch. Run: node --test tools/dutch/
import { test } from "node:test";
import assert from "node:assert/strict";
import { lookupKey, readIpa, needsWork, enrich } from "./pronounce.mjs";

test("lookupKey strips a leading article and nothing else", () => {
  assert.equal(lookupKey("de kat"), "kat");
  assert.equal(lookupKey("het huis"), "huis");
  assert.equal(lookupKey("een fiets"), "fiets");
  assert.equal(lookupKey("de  kat "), "kat");
  // "zich" and multi-word verbs are named that way on Commons. Keep them.
  assert.equal(lookupKey("zich vervelen"), "zich vervelen");
  assert.equal(lookupKey("uit elkaar gaan"), "uit elkaar gaan");
  // "deur" opens with "de" and must survive whole.
  assert.equal(lookupKey("deur"), "deur");
});

test("lookupKey refuses an Item with no usable nl", () => {
  for (const bad of [undefined, null, 42, "", "   "]) assert.equal(lookupKey(bad), "");
});

const page = (body) => `{{=eng=}}\n*{{IPA|/ENGLISH/|eng}}\n\n{{=nld=}}\n${body}\n`;

test("readIpa reads the Dutch section, never another language", () => {
  assert.equal(readIpa(page("*{{IPA-nl-standaard|kɑt}}")), "/kɑt/");
  assert.equal(readIpa(page("*{{IPA|/mɑn/|nld}}")), "/mɑn/");
  assert.equal(readIpa("{{=eng=}}\n*{{IPA|/ENGLISH/|eng}}"), null);
});

test("readIpa prefers the standard transcription", () => {
  assert.equal(readIpa(page("*{{IPA-nl-standaard|ɣəˈzɛləx}};  {{IPA|/χəˈzɛləx/|nld}}")), "/ɣəˈzɛləx/");
});

test("readIpa rejects an editor's placeholder", () => {
  assert.equal(readIpa(page("*{{IPA|/xxxx/|nld}}")), null);
  assert.equal(readIpa(page("*{{IPA|xxx|nld}}")), null);
  // A placeholder must not hide a real transcription later on the page.
  assert.equal(readIpa(page("*{{IPA|/xxxx/|nld}}\n*{{IPA|/fits/|nld}}")), "/fits/");
});

test("needsWork fills a gap, keeps a hit, and holds a fresh miss", () => {
  const day = 86_400_000;
  const ago = (d) => new Date(Date.now() - d * day).toISOString().slice(0, 10);
  assert.deepEqual(needsWork({}, false), { audio: true, ipa: true, any: true });
  assert.equal(needsWork({ say: "File:Nl-kat.ogg", ipa: "/kɑt/" }, true).any, false);

  const miss = { say: "none", sayChecked: ago(200), ipa: "none", ipaChecked: ago(3) };
  assert.equal(needsWork(miss, false).any, false, "a miss is left alone without --recheck");
  const again = needsWork(miss, true);
  assert.equal(again.audio, true, "a 200-day-old miss is retried");
  assert.equal(again.ipa, false, "a 3-day-old miss is not");
});

test("an outage writes nothing at all", async () => {
  const real = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error("simulated outage"); };
  try {
    const items = [{ nl: "fiets" }];
    const stats = await enrich(items);
    assert.deepEqual(items, [{ nl: "fiets" }], "no miss and no date may be written");
    assert.equal(stats.failed, 2);
  } finally { globalThis.fetch = real; }
});

test("one source down leaves the other source's field filled", async () => {
  const real = globalThis.fetch;
  globalThis.fetch = async (u, o) => String(u).includes("commons.")
    ? new Response("boom", { status: 503 }) : real(u, o);
  try {
    const items = [{ nl: "fiets" }];
    await enrich(items);
    assert.equal(items[0].say, undefined, "audio stays absent, to be retried");
    assert.equal(items[0].ipa, "/fits/");
  } finally { globalThis.fetch = real; }
});
