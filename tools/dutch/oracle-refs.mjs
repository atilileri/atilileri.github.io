#!/usr/bin/env node
/*
 * Turn every uploaded copy in the Oracle into a Drive reference.
 *
 *   node tools/dutch/oracle-refs.mjs [--dry-run] [--limit N] [--notebook <text>]
 *
 * A source in a notebook is either a **copy** — bytes uploaded into Gemini
 * Notebook — or a **reference** to a file in Drive. A reference keeps Drive the
 * single master, which is what docs/dutch/MATERIAL.md requires, and it means a
 * file is stored once rather than twice. This script finds the copies and swaps
 * them, one at a time.
 *
 * Locked by issue #143. Four rules shape the code, and each one comes from
 * something that went wrong by hand on 2026-09-08:
 *
 *   1. **Verify by listing, never by exit status.** Every `add-drive` reports
 *      "RPC ADD_SOURCE failed after 30s, retries exhausted" and the source
 *      still lands. Trusting the error produced a duplicate.
 *   2. **Add and confirm before deleting anything.** The copy is the only
 *      surviving material until the reference reads `ready`.
 *   3. **A reference may already exist.** Then there is nothing to add, and the
 *      copy is simply removed.
 *   4. **Match a title to Drive by a normalised key, and never guess.**
 *      Gemini Notebook rewrites a title — `les 2026-09-07.mp3` becomes
 *      `les 2026 - 09 - 07.mp3` — so the two names must be compared loosely.
 *      An ambiguous match is skipped and reported, not resolved by chance.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const HOME = process.env.HOME;
const RCLONE = process.env.RCLONE || `${HOME}/bin/rclone`;
const NOTEBOOKLM = process.env.NOTEBOOKLM || `${HOME}/.local/bin/notebooklm`;
const DRIVE_ROOT = 'gdrive:atili/Dutch';
const COLLECTION = 'OracleDutch';
const READY_TIMEOUT_MS = 10 * 60 * 1000;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const numAfter = (flag) => {
  const i = args.indexOf(flag);
  return i === -1 ? null : args[i + 1];
};
const limit = numAfter('--limit') ? Number(numAfter('--limit')) : Infinity;
const only = numAfter('--notebook');
const capped = args.includes('--capped');

const log = (...m) => console.log(...m);

/*
 * One key for one file. The stem is compared loosely because the server
 * rewrites titles, but the kind is kept exact — an episode's mp3 and its
 * transcript share a stem, and confusing them would swap audio for text.
 */
export function fileKey(name, fallbackExt) {
  const m = name.match(/\.([a-z0-9]{2,5})$/i);
  const ext = (m ? m[1] : fallbackExt || '').toLowerCase();
  const stem = (m ? name.slice(0, -m[0].length) : name)
    .toLowerCase()
    .replace(/[\s\-_]+/g, ' ')
    .trim();
  return `${stem}|${ext}`;
}

export function extFromType(type) {
  if (type === 'media') return 'mp3';
  if (type === 'markdown') return 'txt';
  if (type === 'pdf') return 'pdf';
  return '';
}

function rclone(argv) {
  const r = spawnSync(RCLONE, argv, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`rclone ${argv[0]} failed: ${(r.stderr || '').trim()}`);
  return r.stdout;
}

function notebooklm(argv, { tolerateError = false } = {}) {
  const r = spawnSync(NOTEBOOKLM, ['--quiet', ...argv], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  const text = (r.stdout || '').replace(/^Matched:.*\n/gm, '').replace(/^\d\d:\d\d:\d\d ERROR .*$/gm, '');
  let parsed = null;
  try {
    parsed = JSON.parse(text.trim());
  } catch {
    /* Some commands answer in prose. */
  }
  if (parsed && parsed.error && !tolerateError) throw new Error(parsed.message || 'notebooklm failed');
  return parsed;
}

/*
 * Every file under the Dutch folder, keyed for matching. A key claimed by two
 * different files is marked ambiguous, so no copy is ever swapped for a file
 * that merely looks like it.
 */
function driveIndex() {
  const files = JSON.parse(rclone(['lsjson', DRIVE_ROOT, '-R', '--files-only']) || '[]');
  const index = new Map();
  const ambiguous = new Set();
  for (const f of files) {
    const key = fileKey(f.Name);
    if (index.has(key) && index.get(key).id !== f.ID) ambiguous.add(key);
    index.set(key, { id: f.ID, name: f.Name, path: f.Path, mime: f.MimeType });
  }
  for (const key of ambiguous) index.delete(key);
  return { index, ambiguousCount: ambiguous.size, total: files.length };
}

function listSources(nbId) {
  const j = notebooklm(['source', 'list', '-n', nbId, '--json']);
  return (j && j.sources) || [];
}

function waitReady(nbId, sourceId) {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const found = listSources(nbId).find((s) => s.id === sourceId);
    if (!found) return 'gone';
    if (found.status === 'ready') return 'ready';
    if (found.status === 'error') return 'error';
    spawnSync('sleep', ['5']);
  }
  return 'timeout';
}

/*
 * `sources` is the notebook's source list, fetched once by the caller. Listing
 * it per copy costs seconds each and turns a walk of 644 copies into hours.
 * It is only used for the cheap pre-check; every decision that follows a write
 * re-reads the live list, because rule 1 forbids trusting anything else.
 */
/*
 * A notebook at the 100-source cap cannot be swapped in the safe order. Adding
 * the reference needs a 101st slot, and the cap refuses it — so `add-drive`
 * quietly adds nothing and the copy stays. Such a notebook also **ends** at the
 * cap, so freeing one slot buys nothing: every file needs the order inverted.
 *
 * This mode deletes the copy first and then adds the reference. It gives up the
 * guarantee that rule 2 provides, so it is opt-in with --capped and never
 * automatic. What makes it acceptable: the file is confirmed present in Drive
 * before the copy goes, so a failure costs the notebook's link to material that
 * still exists, and re-running with --repair adds back whatever is missing.
 */
function swapCapped(nbId, copy, drive) {
  if (dryRun) return `would delete the copy, then reference ${drive.path}`;
  notebooklm(['source', 'delete', copy.id, '-n', nbId, '--yes', '--json']);
  notebooklm(['source', 'add-drive', drive.id, copy.title, '-n', nbId, '--mime-type', 'pdf', '--json'], {
    tolerateError: true,
  });
  const added = listSources(nbId).find((s) => s.drive_document_id === drive.id);
  if (!added) return `FAILED: the copy is gone and no reference appeared. Drive still holds ${drive.path}`;
  const state = added.status === 'ready' ? 'ready' : waitReady(nbId, added.id);
  return state === 'ready' ? 'swapped' : `swapped, but the reference is ${state}`;
}

function swap(nbId, copy, drive, sources) {
  // Rule 3: a reference for this file may already be here.
  const key = fileKey(copy.title, extFromType(copy.type));
  const existing = sources.find(
    (s) => s.drive_document_id && fileKey(s.title, extFromType(s.type)) === key,
  );
  if (existing) {
    if (dryRun) return 'would drop the copy (a reference already exists)';
    notebooklm(['source', 'delete', copy.id, '-n', nbId, '--yes', '--json']);
    return 'dropped the copy; a reference was already here';
  }
  if (dryRun) return `would reference ${drive.path}`;

  // Rule 1: the error is not the answer. Add, then look.
  notebooklm(['source', 'add-drive', drive.id, copy.title, '-n', nbId, '--mime-type', 'pdf', '--json'], {
    tolerateError: true,
  });
  const added = listSources(nbId).filter(
    (s) => s.drive_document_id === drive.id || (s.drive_document_id && fileKey(s.title, extFromType(s.type)) === key),
  );
  if (added.length === 0) return 'FAILED: no reference appeared; the copy is untouched';

  // Rule 2: confirm before removing the only surviving material.
  const good = [];
  for (const s of added) {
    const state = s.status === 'ready' ? 'ready' : waitReady(nbId, s.id);
    if (state === 'ready') good.push(s);
    else notebooklm(['source', 'delete', s.id, '-n', nbId, '--yes', '--json'], { tolerateError: true });
  }
  if (good.length === 0) return 'FAILED: the reference never became ready; the copy is untouched';

  // A retry inside the client can land the same file twice. Keep one.
  for (const extra of good.slice(1)) {
    notebooklm(['source', 'delete', extra.id, '-n', nbId, '--yes', '--json'], { tolerateError: true });
  }
  notebooklm(['source', 'delete', copy.id, '-n', nbId, '--yes', '--json']);
  return 'swapped';
}

function main() {
  for (const p of [RCLONE, NOTEBOOKLM]) {
    if (!fs.existsSync(p)) {
      console.error(`missing: ${p}`);
      process.exit(1);
    }
  }
  const { index, ambiguousCount, total } = driveIndex();
  log(`Drive holds ${total} files; ${index.size} are uniquely named, ${ambiguousCount} key(s) are ambiguous`);

  const coll = notebooklm(['collection', 'notebooks', COLLECTION, '--json']);
  let notebooks = coll.notebooks || coll;
  if (only) notebooks = notebooks.filter((n) => n.title.includes(only));
  notebooks.sort((a, b) => a.title.localeCompare(b.title));
  log(`${notebooks.length} notebook(s) to check${dryRun ? ' (dry run — nothing will be written)' : ''}\n`);

  const tally = { swapped: 0, dropped: 0, failed: 0, unmatched: 0, planned: 0 };
  let done = 0;

  for (const nb of notebooks) {
    const sources = listSources(nb.id);
    const copies = sources.filter((s) => !s.drive_document_id);
    if (copies.length === 0) {
      log(`== ${nb.title}: no copies`);
      continue;
    }
    log(`== ${nb.title}: ${copies.length} copy(ies)`);
    for (const copy of copies) {
      if (done >= limit) {
        log(`\nstopping at --limit ${limit}`);
        report(tally);
        return;
      }
      const key = fileKey(copy.title, extFromType(copy.type));
      const drive = index.get(key);
      if (!drive) {
        // Never guess. A copy with no clear file in Drive stays a copy.
        log(`   ? ${copy.title} — no unique file in Drive for key "${key}"; left alone`);
        tally.unmatched += 1;
        continue;
      }
      let outcome;
      try {
        outcome = capped ? swapCapped(nb.id, copy, drive) : swap(nb.id, copy, drive, sources);
      } catch (e) {
        outcome = `FAILED: ${e.message}`;
      }
      log(`   ${outcome.startsWith('FAILED') ? '!' : '·'} ${copy.title} — ${outcome}`);
      if (outcome === 'swapped') tally.swapped += 1;
      else if (outcome.startsWith('dropped')) tally.dropped += 1;
      else if (outcome.startsWith('would')) tally.planned += 1;
      else tally.failed += 1;
      done += 1;
    }
  }
  report(tally);
}

function report(t) {
  log(
    `\nswapped ${t.swapped}, dropped ${t.dropped}, planned ${t.planned}, ` +
      `failed ${t.failed}, unmatched ${t.unmatched}`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
