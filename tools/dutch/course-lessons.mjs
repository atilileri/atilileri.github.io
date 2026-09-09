#!/usr/bin/env node
/*
 * Turn a week's NT2 course recording into material the Oracle can read.
 *
 *   node tools/dutch/course-lessons.mjs [--dry-run] [--limit N]
 *
 * The learner attends a live NT2 course. A new video lands in Drive after each
 * lesson. This script finds the lessons nobody has processed yet, derives an
 * mp3 and two transcripts from each, files them in Drive, and adds all three to
 * the Oracle notebook.
 *
 * Locked by issue #143. The reasoning lives there and in
 * docs/dutch/ORACLE-INVENTORY.md; this file only implements it.
 *
 * Three rules shape the code:
 *
 *   1. Drive is the master and the record of what is done. There is no state
 *      file. A lesson is unprocessed when its output is missing from Drive.
 *   2. Nothing is deleted and nothing is overwritten. Every upload lands on a
 *      .part name first and is renamed last, so an interrupted run never leaves
 *      a half file that looks finished.
 *   3. The script has no opinion about quality. A noisy transcript is still
 *      evidence, so it is written and kept.
 *
 * It is safe to re-run at any time, and safe to kill at any point.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const HOME = process.env.HOME;
const RCLONE = process.env.RCLONE || `${HOME}/bin/rclone`;
const FFMPEG = process.env.FFMPEG || `${HOME}/bin/ffmpeg`;
const NOTEBOOKLM = process.env.NOTEBOOKLM || `${HOME}/.local/bin/notebooklm`;
const TRANSCRIBE = new URL('../media/transcribe.js', import.meta.url).pathname;

// Read from the teacher's folder, which is a shortcut and is not writable.
// Write flat into the course folder, which is the learner's own.
const READ_DIR = 'gdrive:atili/Dutch/NT2 Taaldiensten/A0>A2/Ders kayitlari';
const WRITE_DIR = 'gdrive-rw:atili/Dutch/NT2 Taaldiensten';
const LIST_DIR = 'gdrive:atili/Dutch/NT2 Taaldiensten';
const NOTEBOOK = 'course - nt2 taaldiensten';
const COLLECTION = 'OracleDutch';
const PREFIX = 'NT2 Taaldiensten - les';
const VIDEO = /\.(mp4|mkv|mov|webm|m4v|avi)$/i;

const WORK = path.join(os.tmpdir(), 'docent-course-lessons');
const LOCK = path.join(WORK, 'run.lock');
const LOCK_MAX_AGE_MS = 3 * 60 * 60 * 1000; // A lock older than this is dead.

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitArg = args.indexOf('--limit');
const limit = limitArg === -1 ? Infinity : Number(args[limitArg + 1]);

const log = (...m) => console.log(...m);

// ---------------------------------------------------------------- the lock

/*
 * The lock answers "is someone working?". Drive answers "what is done?".
 * Only Drive is authoritative, so a lost lock costs a duplicated check and
 * never a duplicated file.
 */
function takeLock() {
  fs.mkdirSync(WORK, { recursive: true });
  if (fs.existsSync(LOCK)) {
    const held = JSON.parse(fs.readFileSync(LOCK, 'utf8'));
    const age = Date.now() - new Date(held.started).getTime();
    const alive = age < LOCK_MAX_AGE_MS && processExists(held.pid);
    if (alive) {
      log(`another run holds the lock (pid ${held.pid}, started ${held.started}). Nothing to do.`);
      return false;
    }
    log(`taking over a dead lock from pid ${held.pid}, started ${held.started}`);
  }
  fs.writeFileSync(LOCK, JSON.stringify({ pid: process.pid, started: new Date().toISOString() }));
  return true;
}

function processExists(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function releaseLock() {
  try {
    const held = JSON.parse(fs.readFileSync(LOCK, 'utf8'));
    if (held.pid === process.pid) fs.unlinkSync(LOCK);
  } catch {
    /* Someone else cleaned it up. That is fine. */
  }
}

// ---------------------------------------------------------------- naming

/*
 * The teacher writes 07-09-2026.mp4, day first. Every other dated name in this
 * corpus runs the other way, so a lesson is renamed to ISO order and sorts
 * chronologically. A name with no date keeps its own stem, untranslated.
 *
 * The upload time is never used. A lesson recorded on Monday and uploaded on
 * Friday would carry a date no later reader could tell was wrong.
 */
export function lessonName(filename) {
  const stem = filename.replace(/\.[^.]+$/, '');
  const dmy = stem.match(/^(\d{2})[-._](\d{2})[-._](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    if (Number(m) >= 1 && Number(m) <= 12 && Number(d) >= 1 && Number(d) <= 31) {
      return `${PREFIX} ${y}-${m}-${d}`;
    }
  }
  const ymd = stem.match(/^(\d{4})[-._](\d{2})[-._](\d{2})$/);
  if (ymd) return `${PREFIX} ${ymd[1]}-${ymd[2]}-${ymd[3]}`;
  return `NT2 Taaldiensten - ${stem}`;
}

// ---------------------------------------------------------------- Drive

function rclone(argv, { quiet = true } = {}) {
  const r = spawnSync(RCLONE, argv, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) {
    throw new Error(`rclone ${argv[0]} failed: ${(r.stderr || '').trim()}`);
  }
  return r.stdout;
}

function listDrive(remote) {
  const out = rclone(['lsjson', remote, '--files-only']);
  return JSON.parse(out || '[]');
}

/*
 * Upload under a temporary name, then rename. rclone's moveto is atomic per
 * file, so the final name appears only when the bytes are all there. That is
 * what makes "the output exists" a safe test for "this lesson is done".
 *
 * The temporary name prefixes the stem and keeps the extension. Drive assigns
 * a file's mime type from its extension at upload time and **a later rename
 * does not change it** — so an upload to `<name>.mp3.part` is stored for ever
 * as `application/x-partial-download`, and Gemini Notebook then refuses to
 * import it. Measured 2026-09-08, after it broke exactly this pipeline.
 */
function uploadFinal(localPath, finalName) {
  const temp = `.uploading-${finalName}`;
  rclone(['copyto', localPath, `${WRITE_DIR}/${temp}`]);
  rclone(['moveto', `${WRITE_DIR}/${temp}`, `${WRITE_DIR}/${finalName}`]);
}

// ---------------------------------------------------------------- notebook

function notebooklm(argv) {
  const r = spawnSync(NOTEBOOKLM, ['--quiet', ...argv], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  const text = (r.stdout || '').replace(/^Matched:.*\n/, '');
  let parsed = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    /* Not every command answers in JSON. */
  }
  if (parsed && parsed.error) throw new Error(parsed.message || 'notebooklm failed');
  if (r.status !== 0) throw new Error(`notebooklm ${argv[0]} failed: ${(r.stderr || '').trim()}`);
  return parsed;
}

/*
 * Membership comes from the collection, never from a title prefix — the rule in
 * docs/dutch/ORACLE.md. The account holds notebooks from other projects.
 */
function notebookId() {
  const j = notebooklm(['collection', 'notebooks', COLLECTION, '--json']);
  const all = j.notebooks || j;
  const found = all.find((n) => n.title === NOTEBOOK);
  if (!found) throw new Error(`no notebook titled "${NOTEBOOK}" in collection ${COLLECTION}`);
  return found.id;
}

/*
 * Audio enters by reference. add-drive demands a declared mime type whose only
 * non-native choice is pdf, so an mp3 goes in labelled as a PDF and the server
 * ignores the label. Measured 2026-09-08; see docs/dutch/ORACLE-INVENTORY.md.
 */
function addByReference(nbId, fileId, title) {
  notebooklm(['source', 'add-drive', fileId, title, '-n', nbId, '--mime-type', 'pdf', '--json']);
}

// ---------------------------------------------------------------- one lesson

function transcribe(localMedia, outPath, lang) {
  execFileSync('node', [TRANSCRIBE, localMedia, outPath], {
    env: { ...process.env, ASR_LANG: lang },
    stdio: ['ignore', 'ignore', 'inherit'],
  });
}

function processLesson(video, done, nbId) {
  const name = lessonName(video.Name);
  const wanted = { mp3: `${name}.mp3`, tr: `${name}.tr.txt`, nl: `${name}.nl.txt` };
  const missing = Object.entries(wanted).filter(([, f]) => !done.has(f));
  if (missing.length === 0) return { name, did: [] };

  log(`\n== ${name}  (from ${video.Name})`);
  log(`   missing: ${missing.map(([, f]) => f).join(', ')}`);
  if (dryRun) return { name, did: missing.map(([, f]) => f) };

  const local = path.join(WORK, video.Name);
  const mp3 = path.join(WORK, wanted.mp3);
  const did = [];

  // The video is only needed to make the audio, and the audio is what every
  // later step reads. So fetch and convert once, even when only a transcript
  // is missing.
  if (!fs.existsSync(mp3)) {
    log('   fetching the video');
    rclone(['copyto', `${READ_DIR}/${video.Name}`, local]);
    log('   extracting audio');
    execFileSync(FFMPEG, ['-v', 'error', '-i', local, '-vn', '-ac', '1', '-ar', '16000', '-b:a', '32k', mp3, '-y']);
  }

  for (const [kind, filename] of missing) {
    if (kind === 'mp3') {
      log('   uploading the audio');
      uploadFinal(mp3, filename);
    } else {
      // tr is the readable record of a Turkish-medium lesson. nl is a noisy
      // second pass that recovers Dutch the tr pass destroys. Both are kept:
      // a disagreement between them is the signal a word needs checking.
      const out = path.join(WORK, filename);
      if (fs.existsSync(out) && fs.statSync(out).size > 0) {
        // A previous run recognised this pass but was interrupted before the
        // upload. Recognition is the expensive step, so never repeat it.
        log(`   reusing the ${kind} transcript from an earlier run`);
      } else {
        log(`   transcribing (${kind}) — this takes about 15 minutes per hour of lesson`);
        transcribe(mp3, out, kind);
      }
      uploadFinal(out, filename);
    }
    did.push(filename);
  }

  // Add to the notebook only what this run created, and read the ids back from
  // Drive so a reference always points at the file that is really there.
  const landed = new Map(listDrive(LIST_DIR).map((f) => [f.Name, f.ID]));
  for (const filename of did) {
    const id = landed.get(filename);
    if (!id) {
      log(`   ! ${filename} is not in Drive yet; the notebook link waits for the next run`);
      continue;
    }
    log(`   linking ${filename} into the notebook`);
    addByReference(nbId, id, filename.replace(/\.(mp3|txt)$/, ''));
  }

  fs.rmSync(local, { force: true });
  return { name, did };
}

// ---------------------------------------------------------------- main

function main() {
  for (const p of [RCLONE, FFMPEG, NOTEBOOKLM, TRANSCRIBE]) {
    if (!fs.existsSync(p)) {
      console.error(`missing: ${p}`);
      process.exit(1);
    }
  }
  if (!dryRun && !takeLock()) return;
  try {
    const videos = listDrive(READ_DIR).filter((f) => VIDEO.test(f.Name));
    const done = new Set(listDrive(LIST_DIR).map((f) => f.Name));
    log(`${videos.length} recording(s) in the course folder, ${done.size} file(s) already derived`);

    const pending = videos.filter((v) => {
      const n = lessonName(v.Name);
      return !done.has(`${n}.mp3`) || !done.has(`${n}.tr.txt`) || !done.has(`${n}.nl.txt`);
    });
    if (pending.length === 0) {
      log('every lesson is processed. Nothing to do.');
      return;
    }
    log(`${pending.length} lesson(s) need work${dryRun ? ' (dry run — nothing will be written)' : ''}`);

    const nbId = dryRun ? null : notebookId();
    let count = 0;
    for (const v of pending) {
      if (count >= limit) {
        log(`\nstopping at --limit ${limit}; ${pending.length - count} lesson(s) left for the next run`);
        break;
      }
      try {
        processLesson(v, done, nbId);
      } catch (e) {
        // One bad lesson never stops the others. Nothing was deleted, so the
        // next run picks up exactly where this one failed.
        log(`   ! failed: ${e.message}`);
      }
      count += 1;
    }
  } finally {
    if (!dryRun) releaseLock();
  }
}

// Run only when this file is the command. A test that imports lessonName must
// not start a Drive scan, take the lock, or spawn a transcriber.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
