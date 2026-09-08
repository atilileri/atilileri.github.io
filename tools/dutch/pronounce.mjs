#!/usr/bin/env node
// Fill each Item's pronunciation fields from Wikimedia Commons and nl.wiktionary.
// Idempotent: it scans the whole inventory, fills only what is missing, and a
// second run on unchanged input changes nothing.
// Usage and rules: docs/dutch/PRONUNCIATION.md

import { readFileSync, writeFileSync } from "node:fs";

// The four fields this script owns. Rename here if the Item taxonomy renames them.
const F = {
  say: "say",
  credit: "sayCredit",
  sayChecked: "sayChecked",
  ipa: "ipa",
  ipaChecked: "ipaChecked",
};

const DEFAULT_FILE = "docs/dutch/items.json";
const RECHECK_DAYS = 90;
const BATCH = 50;
const UA = "dutch-journey/1.0 (https://github.com/atilileri/atilileri.github.io)";

// ---------------------------------------------------------------- lookup key

// Commons names a file after the bare word. A leading article is the only
// prefix measured to break the lookup; "zich" and multi-word verbs are kept.
const ARTICLE = /^(de|het|een)\s+/i;
export function lookupKey(nl) {
  if (typeof nl !== "string") return "";
  return nl.trim().replace(ARTICLE, "").replace(/\s+/g, " ").trim();
}

// ------------------------------------------------------------------- the API

async function mediawiki(host, params) {
  const u = new URL(`https://${host}/w/api.php`);
  u.searchParams.set("format", "json");
  u.searchParams.set("formatversion", "2");
  u.searchParams.set("origin", "*");
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const res = await fetch(u, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${host} returned HTTP ${res.status}`);
  const body = await res.json();
  if (body.error) throw new Error(`${host}: ${body.error.info}`);
  return body;
}

const chunk = (xs, n) =>
  Array.from({ length: Math.ceil(xs.length / n) }, (_, i) => xs.slice(i * n, i * n + n));

const stripHtml = (s) =>
  String(s ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

// Does File:Nl-<word>.ogg exist, and under which licence?
export async function lookupAudio(keys) {
  const found = new Map();
  for (const part of chunk(keys, BATCH)) {
    const body = await mediawiki("commons.wikimedia.org", {
      action: "query",
      titles: part.map((k) => `File:Nl-${k}.ogg`).join("|"),
      prop: "imageinfo",
      iiprop: "extmetadata",
    });
    for (const page of body.query?.pages ?? []) {
      if (page.missing) continue;
      const meta = page.imageinfo?.[0]?.extmetadata ?? {};
      const author = stripHtml(meta.Artist?.value);
      const licence = stripHtml(meta.LicenseShortName?.value);
      found.set(page.title.toLowerCase(), {
        say: page.title,
        credit: [author, licence].filter(Boolean).join(", ") || null,
      });
    }
  }
  // Report one answer per key, so a miss is an answer and not a gap.
  return new Map(keys.map((k) => [k, found.get(`file:nl-${k}.ogg`) ?? null]));
}

// nl.wiktionary opens each language section with a bare {{=xxx=}} line — no
// heading marks around it. Read only the Dutch one, so a homograph in another
// language never supplies the transcription.
function dutchSection(wikitext) {
  const parts = wikitext.split(/^\{\{=([a-z]{3})=\}\}[ \t]*$/m);
  for (let i = 1; i < parts.length; i += 2) if (parts[i] === "nld") return parts[i + 1];
  return null;
}

// An editor's stub reads /xxxx/. It is a placeholder, never a transcription.
const PLACEHOLDER = /^[\/\[]?x+[\/\]]?$/i;
export function readIpa(wikitext) {
  const nl = dutchSection(wikitext);
  if (!nl) return null;
  const pick = (re) => {
    for (const m of nl.matchAll(re)) {
      const v = m[1].trim().replace(/^[\/\[]|[\/\]]$/g, "").trim();
      if (v && !PLACEHOLDER.test(v)) return `/${v}/`;
    }
    return null;
  };
  return pick(/\{\{IPA-nl-standaard\|([^|}]+)/g) ?? pick(/\{\{IPA\|([^|}]+)/g);
}

export async function lookupIpa(keys) {
  const found = new Map();
  for (const part of chunk(keys, BATCH)) {
    const body = await mediawiki("nl.wiktionary.org", {
      action: "query",
      titles: part.join("|"),
      prop: "revisions",
      rvprop: "content",
      rvslots: "main",
    });
    const norm = new Map(part.map((k) => [k.toLowerCase(), k]));
    for (const page of body.query?.pages ?? []) {
      const key = norm.get(page.title.toLowerCase());
      if (!key || page.missing) continue;
      const text = page.revisions?.[0]?.slots?.main?.content;
      if (text) found.set(key, readIpa(text));
    }
  }
  return new Map(keys.map((k) => [k, found.get(k) ?? null]));
}

// ------------------------------------------------------------- the gap rules

const today = () => new Date().toISOString().slice(0, 10);

function ageInDays(iso) {
  const then = Date.parse(iso);
  return Number.isNaN(then) ? Infinity : (Date.now() - then) / 86_400_000;
}

// An Item needs work when a field is absent, or when a recorded miss is stale
// and --recheck asked for it. A filled field is never touched.
export function needsWork(item, recheck) {
  const stale = (miss, on) =>
    miss === "none" && recheck && ageInDays(item[on]) >= RECHECK_DAYS;
  const audio = item[F.say] === undefined || stale(item[F.say], F.sayChecked);
  const ipa = item[F.ipa] === undefined || stale(item[F.ipa], F.ipaChecked);
  return { audio, ipa, any: audio || ipa };
}

// ----------------------------------------------------------------- the run

// Keep the owned fields in a fixed order at the end of an Item, so a refill
// produces a one-line diff instead of a reshuffle.
function reorder(item) {
  const owned = [F.say, F.credit, F.sayChecked, F.ipa, F.ipaChecked];
  const kept = {};
  for (const k of owned) if (k in item) { kept[k] = item[k]; delete item[k]; }
  for (const k of owned) if (k in kept) item[k] = kept[k];
}

export async function enrich(items, { recheck = false, log = () => {} } = {}) {
  const work = items.map((it, i) => ({ i, key: lookupKey(it.nl), need: needsWork(it, recheck) }))
    .filter((w) => w.need.any && w.key);
  const stats = { scanned: items.length, considered: work.length, audio: 0, ipa: 0, misses: 0, failed: 0 };
  if (work.length === 0) return stats;

  const uniq = (ws) => [...new Set(ws.map((w) => w.key))];
  const audioWork = work.filter((w) => w.need.audio);
  const ipaWork = work.filter((w) => w.need.ipa);

  // Fail soft. A network error must leave the field absent, never write a miss,
  // so the next run retries it and one bad moment never mutes a word.
  let audio = new Map(), ipa = new Map();
  try {
    if (audioWork.length) audio = await lookupAudio(uniq(audioWork));
  } catch (err) { stats.failed++; log(`  ! Commons unreachable, audio left for next run: ${err.message}`); }
  try {
    if (ipaWork.length) ipa = await lookupIpa(uniq(ipaWork));
  } catch (err) { stats.failed++; log(`  ! nl.wiktionary unreachable, IPA left for next run: ${err.message}`); }

  for (const w of work) {
    const item = items[w.i];
    if (w.need.audio && audio.has(w.key)) {
      const hit = audio.get(w.key);
      if (hit) {
        item[F.say] = hit.say;
        item[F.credit] = hit.credit;
        delete item[F.sayChecked];
        stats.audio++;
      } else {
        // A date is written beside a miss only. It means "confirmed absent on
        // this day", which is the one thing --recheck needs to know.
        item[F.say] = "none";
        delete item[F.credit];
        item[F.sayChecked] = today();
        stats.misses++;
      }
    }
    if (w.need.ipa && ipa.has(w.key)) {
      const hit = ipa.get(w.key);
      if (hit) {
        item[F.ipa] = hit;
        delete item[F.ipaChecked];
        stats.ipa++;
      } else {
        item[F.ipa] = "none";
        item[F.ipaChecked] = today();
      }
    }
    reorder(item);
  }
  return stats;
}

// -------------------------------------------------------------------- CLI

function parseArgs(argv) {
  const opts = { file: DEFAULT_FILE, recheck: false, dryRun: false, words: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--recheck") opts.recheck = true;
    else if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--file") opts.file = argv[++i];
    else if (a === "--words") { opts.words = argv.slice(i + 1); break; }
    else if (a === "--help" || a === "-h") opts.help = true;
    else throw new Error(`unknown argument: ${a}`);
  }
  return opts;
}

const HELP = `Fill Item pronunciation fields from Wikimedia Commons and nl.wiktionary.

  node tools/dutch/pronounce.mjs [--file <path>] [--recheck] [--dry-run]
  node tools/dutch/pronounce.mjs --words <word> [<word> ...]

  --file      Item inventory, a JSON array (default ${DEFAULT_FILE})
  --recheck   Also retry misses older than ${RECHECK_DAYS} days
  --dry-run   Report the changes and write nothing
  --words     Look words up and print the result; touches no file`;

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) { console.log(HELP); return; }

  if (opts.words) {
    const items = opts.words.map((nl) => ({ nl }));
    await enrich(items, { log: (m) => console.error(m) });
    console.log(JSON.stringify(items, null, 2));
    return;
  }

  const raw = JSON.parse(readFileSync(opts.file, "utf8"));
  const items = Array.isArray(raw) ? raw : raw.items;
  if (!Array.isArray(items)) throw new Error(`${opts.file} holds no Item array`);
  const before = JSON.stringify(raw);

  const stats = await enrich(items, { recheck: opts.recheck, log: (m) => console.error(m) });
  const changed = JSON.stringify(raw) !== before;
  if (changed && !opts.dryRun) writeFileSync(opts.file, JSON.stringify(raw, null, 2) + "\n");

  console.error(
    `${opts.dryRun ? "would fill" : "filled"} ${stats.audio} audio, ${stats.ipa} IPA; ` +
    `${stats.misses} recorded as none; ${stats.considered} of ${stats.scanned} Items needed work` +
    (stats.failed ? `; ${stats.failed} source unreachable` : "")
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => { console.error(`pronounce: ${err.message}`); process.exit(1); });
}
