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
 * It does the same for the course supplements — the teacher's slide decks and
 * one-page sheets. Each gets an OCR text file in Drive, and a deck is also
 * linked into the notebook by reference. An image is represented by its OCR
 * file alone, because the notebook cannot reference an image in Drive.
 *
 * Locked by issues #143 (recordings) and #145 (supplements). The reasoning
 * lives there and in docs/dutch/ORACLE-INVENTORY.md; this file only
 * implements it.
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
import zlib from 'node:zlib';

const HOME = process.env.HOME;
const RCLONE = process.env.RCLONE || `${HOME}/bin/rclone`;
const FFMPEG = process.env.FFMPEG || `${HOME}/bin/ffmpeg`;
const NOTEBOOKLM = process.env.NOTEBOOKLM || `${HOME}/.local/bin/notebooklm`;
const TRANSCRIBE = new URL('../media/transcribe.js', import.meta.url).pathname;
const OCR = new URL('../media/ocr.js', import.meta.url).pathname;
// Tesseract stores its language data in the working directory. Run it from a
// cache outside the repo, so the data is fetched once and never committed.
const OCR_CACHE = path.join(HOME, '.cache', 'docent-ocr');
const OCR_LANG = 'nld+tur';

// Read from the teacher's folders, which sit in a shortcut and are not writable.
// Write flat into the course folder, which is the learner's own.
const READ_DIR = 'gdrive:atili/Dutch/NT2 Taaldiensten/A0>A2/Ders kayitlari';
const SUPPLEMENT_DIR = 'gdrive:atili/Dutch/NT2 Taaldiensten/A0>A2/Ders slaytlari';
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

// ---------------------------------------------------------------- supplements

/*
 * A supplement keeps the teacher's stem, untranslated, behind the word
 * "supplement" so it never sorts into the dated lesson series.
 *
 * Only a known extension is stripped. The teacher uploads files with no
 * extension at all ("De stamboom"), and a stem like "Les 1.1" has a dot of its
 * own — stripping any last dot would turn it into "Les 1".
 */
const SUPPLEMENT_EXT = /\.(pptx|png|jpe?g)$/i;

export function supplementName(filename) {
  return `NT2 Taaldiensten - supplement ${filename.replace(SUPPLEMENT_EXT, '')}`;
}

/*
 * The kind comes from Drive's mime type, never from the extension, for the
 * same reason. Anything else is logged and skipped rather than guessed at.
 */
const SUPPLEMENT_KINDS = {
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'deck',
  'image/png': 'image',
  'image/jpeg': 'image',
};

export function supplementKind(mimeType) {
  return SUPPLEMENT_KINDS[mimeType] || null;
}

/*
 * The OCR file is read by the Oracle, not by the learner, so it is plain
 * English around the material. Each block names where its text came from:
 * the slide's own text layer, or Tesseract's reading of a picture. The header
 * says what the file is, because a search result shows no context.
 */
export function ocrDocument({ file, kind, date, blocks }) {
  const n = blocks.length;
  const what = kind === 'deck' ? `deck, ${n} slide${n === 1 ? '' : 's'}` : 'one-page sheet';
  const lines = [
    `Machine reading of the NT2 course supplement "${file}" (${what}).`,
    `Made by tools/dutch/course-lessons.mjs on ${date}. Errors are possible; the original in Drive is the authority.`,
    `"text" is the slide's own text. "ocr" is Tesseract (${OCR_LANG}) reading a picture, with its confidence.`,
  ];
  for (const block of blocks) {
    lines.push('', `[${block.label}]`);
    for (const part of block.parts) {
      lines.push(`${part.head}:`);
      const body = part.body.trim();
      lines.push(body ? body.replace(/^/gm, '  ') : '  (nothing)');
    }
  }
  return `${lines.join('\n')}\n`;
}

// A .pptx is a zip. This machine has no unzip, and the pipeline stays Node, so
// read the central directory directly. Stored and deflated entries only, which
// is all an Office file uses.
export function readZip(buf) {
  let eocd = buf.length - 22;
  while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd -= 1;
  if (eocd < 0) throw new Error('not a zip file');
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const entries = new Map();
  for (let i = 0; i < count; i += 1) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error('broken zip directory');
    const method = buf.readUInt16LE(p + 10);
    const size = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const skip = nameLen + buf.readUInt16LE(p + 30) + buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);
    const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    const raw = buf.subarray(start, start + size);
    if (method === 0) entries.set(name, raw);
    else if (method === 8) entries.set(name, zlib.inflateRawSync(raw));
    p += 46 + skip;
  }
  return entries;
}

const unescapeXml = (s) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&');

function relationships(xml) {
  const map = new Map();
  for (const [tag] of xml.matchAll(/<Relationship\b[^>]*>/g)) {
    const id = tag.match(/\bId="([^"]*)"/);
    const target = tag.match(/\bTarget="([^"]*)"/);
    if (id && target) map.set(id[1], target[1]);
  }
  return map;
}

/*
 * The slides of a deck in presentation order, each with its text paragraphs and
 * the pictures it shows, in the order they appear. Slide file numbers are not
 * the order: a teacher who moves a slide changes only presentation.xml.
 */
export function deckSlides(entries) {
  const text = (name) => (entries.has(name) ? entries.get(name).toString('utf8') : '');
  const deckRels = relationships(text('ppt/_rels/presentation.xml.rels'));
  const ids = [...text('ppt/presentation.xml').matchAll(/<p:sldId\b[^>]*\br:id="([^"]*)"/g)].map((m) => m[1]);
  return ids.map((rid, i) => {
    const file = `ppt/${deckRels.get(rid)}`;
    const xml = text(file);
    const rels = relationships(text(file.replace(/slides\/(slide\d+\.xml)$/, 'slides/_rels/$1.rels')));
    const paragraphs = [...xml.matchAll(/<a:p>([\s\S]*?)<\/a:p>/g)]
      .map((m) => [...m[1].matchAll(/<a:t>([^<]*)<\/a:t>/g)].map((t) => unescapeXml(t[1])).join(''))
      .map((line) => line.trim())
      .filter(Boolean);
    const pictures = [...xml.matchAll(/r:embed="([^"]*)"/g)]
      .map((m) => rels.get(m[1]))
      .filter(Boolean)
      .map((target) => path.posix.normalize(path.posix.join('ppt/slides', target)));
    return { number: i + 1, hidden: /<p:sld\b[^>]*\bshow="0"/.test(xml), paragraphs, pictures };
  });
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

/*
 * A supplement links two sources in two steps, and a run can die between them.
 * So a supplement links a Drive file only when the notebook lacks it, which
 * makes a re-run finish the job instead of adding a second copy.
 *
 * The key is the Drive file id, never the title: Gemini Notebook rewrites a
 * title as it stores it, spacing out hyphens, so a title check would miss.
 */
function notebookDriveIds(nbId) {
  const j = notebooklm(['source', 'list', '-n', nbId, '--json']);
  return new Set((j.sources || []).map((s) => s.drive_document_id).filter(Boolean));
}

function linkOnce(nbId, linked, fileId, title) {
  if (linked.has(fileId)) {
    log(`   ${title} is already in the notebook`);
    return;
  }
  log(`   linking ${title} into the notebook`);
  addByReference(nbId, fileId, title);
  linked.add(fileId);
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

// ---------------------------------------------------------------- one supplement

const OCR_READS = /\.(png|jpe?g|bmp|webp)$/i;

function ocrImage(localImage) {
  fs.mkdirSync(OCR_CACHE, { recursive: true });
  const r = spawnSync('node', [OCR, localImage], {
    cwd: OCR_CACHE,
    env: { ...process.env, OCR_LANG },
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
  if (r.status !== 0) throw new Error(`ocr failed on ${path.basename(localImage)}: ${(r.stderr || '').trim()}`);
  const confidence = (r.stderr.match(/confidence (\d+)%/) || [])[1];
  return { text: r.stdout, confidence: confidence ? `${confidence}%` : 'unknown' };
}

/*
 * Every picture is read once. A logo on every slide would otherwise repeat its
 * noise 25 times; later slides point back at the first reading instead.
 */
export function readDeck(localDeck, scratch) {
  const entries = readZip(fs.readFileSync(localDeck));
  const seen = new Map();
  return deckSlides(entries).map((slide) => {
    const parts = [{ head: 'text', body: slide.paragraphs.join('\n') }];
    for (const picture of slide.pictures) {
      const name = path.posix.basename(picture);
      if (seen.has(picture)) {
        parts.push({ head: `ocr ${name}`, body: `(the same picture as slide ${seen.get(picture)})` });
        continue;
      }
      seen.set(picture, slide.number);
      if (!OCR_READS.test(name) || !entries.has(picture)) {
        parts.push({ head: `ocr ${name}`, body: '(not read: OCR takes raster pictures only)' });
        continue;
      }
      const file = path.join(scratch, name);
      fs.writeFileSync(file, entries.get(picture));
      const { text, confidence } = ocrImage(file);
      parts.push({ head: `ocr ${name}, confidence ${confidence}`, body: text });
    }
    return { label: `slide ${slide.number}${slide.hidden ? ', hidden' : ''}`, parts };
  });
}

function processSupplement(file, kind, done, nbId, linked) {
  const name = supplementName(file.Name);
  const ocrFile = `${name}.ocr.txt`;
  if (done.has(ocrFile)) return;

  log(`\n== ${name}  (${kind}, from ${file.Name})`);
  log(`   missing: ${ocrFile}`);
  if (dryRun) return;

  const scratch = path.join(WORK, 'supplement');
  fs.rmSync(scratch, { recursive: true, force: true });
  fs.mkdirSync(scratch, { recursive: true });
  // The local copy gets an extension from its kind, whatever the teacher named it.
  const local = path.join(scratch, kind === 'deck' ? 'original.pptx' : `original${path.extname(file.Name) || '.img'}`);
  log('   fetching');
  rclone(['copyto', `${SUPPLEMENT_DIR}/${file.Name}`, local]);

  log('   reading (text layer and OCR)');
  const blocks =
    kind === 'deck'
      ? readDeck(local, scratch)
      : (() => {
          const { text, confidence } = ocrImage(local);
          return [{ label: 'page', parts: [{ head: `ocr, confidence ${confidence}`, body: text }] }];
        })();
  const out = path.join(scratch, ocrFile);
  const date = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(out, ocrDocument({ file: file.Name, kind, date, blocks }));

  // The deck goes in by reference from the teacher's folder. It is linked
  // before the OCR file lands, because the OCR file is the "done" marker: once
  // it exists, no later run looks at this supplement again.
  if (kind === 'deck') linkOnce(nbId, linked, file.ID, name);

  log(`   uploading ${ocrFile}`);
  uploadFinal(out, ocrFile);
  const landed = listDrive(LIST_DIR).find((f) => f.Name === ocrFile);
  if (!landed) {
    log(`   ! ${ocrFile} is not in Drive yet; link it by hand or delete it and re-run`);
    return;
  }
  linkOnce(nbId, linked, landed.ID, ocrFile.replace(/\.txt$/, ''));
  fs.rmSync(scratch, { recursive: true, force: true });
}

function processSupplements(done, nbId) {
  const files = listDrive(SUPPLEMENT_DIR);
  const pending = [];
  for (const f of files) {
    const kind = supplementKind(f.MimeType);
    if (!kind) {
      log(`skipping supplement ${f.Name}: ${f.MimeType} is not a deck or an image`);
      continue;
    }
    if (!done.has(`${supplementName(f.Name)}.ocr.txt`)) pending.push({ f, kind });
  }
  log(`${files.length} supplement(s) in the slides folder, ${pending.length} need work`);
  if (pending.length === 0) return;
  const linked = dryRun ? new Set() : notebookDriveIds(nbId);
  for (const { f, kind } of pending) {
    try {
      processSupplement(f, kind, done, nbId, linked);
    } catch (e) {
      log(`   ! failed: ${e.message}`);
    }
  }
}

// ---------------------------------------------------------------- main

function main() {
  for (const p of [RCLONE, FFMPEG, NOTEBOOKLM, TRANSCRIBE, OCR]) {
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
    if (pending.length === 0) log('every lesson is processed.');
    else log(`${pending.length} lesson(s) need work${dryRun ? ' (dry run — nothing will be written)' : ''}`);

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

    // Supplements run after the lessons. They are cheap — seconds of OCR,
    // against minutes of recognition — and --limit counts lessons only.
    log('');
    processSupplements(done, nbId);
  } finally {
    if (!dryRun) releaseLock();
  }
}

// Run only when this file is the command. A test that imports lessonName must
// not start a Drive scan, take the lock, or spawn a transcriber.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
