#!/usr/bin/env node
/*
 * Write the path of every Dutch file in Drive to docs/dutch/drive-files.txt.
 *
 *   node tools/dutch/drive-files.mjs [--dry-run] [--out <path>]
 *
 * The file this writes is the **offline route to a file in Drive**: route 2 of
 * docs/dutch/LISTENING.md searches it rather than the network. A Session greps
 * it for a word and reads the matching lines; nothing reads it whole, which is
 * why it carries a path and nothing else — see docs/dutch/INVENTORY.md.
 *
 * It replaces the hand-written "Every file" section of DRIVE-INVENTORY.md,
 * which was 1,418 of that document's 1,578 lines and went stale every week as
 * the course recordings landed. Two things improve by generating it:
 *
 *   1. **It is complete.** The hand-written listing collapsed every transcript
 *      into "plus N machine transcripts", so a grep for a transcript's name
 *      found nothing. All 2,201 files are named here.
 *   2. **It is re-derivable.** Refreshing it is this command, so nobody keeps
 *      it true by hand.
 *
 * Locked by issue #152. Drive is read-only to the agent (issue #133), and this
 * script only lists, so it needs nothing beyond the `gdrive` remote.
 */
import { spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';

const HOME = process.env.HOME;
const RCLONE = process.env.RCLONE || `${HOME}/bin/rclone`;
const DRIVE_ROOT = 'gdrive:atili/Dutch';
const DEFAULT_OUT = 'docs/dutch/drive-files.txt';

/*
 * Sort the way a reader scans: a folder's files together, and inside a folder
 * in the order a name implies. `localeCompare` with `numeric` keeps
 * "Bölüm 09" before "Bölüm 10" and sorts the Turkish and Dutch names by their
 * own letters rather than by byte value.
 */
export function sortPaths(paths) {
  return [...paths].sort((a, b) =>
    a.localeCompare(b, 'nl', { numeric: true, sensitivity: 'variant' }),
  );
}

export function listDrive({ rclone = RCLONE, root = DRIVE_ROOT } = {}) {
  const r = spawnSync(rclone, ['lsf', '-R', '--files-only', root], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (r.error) throw new Error(`cannot run ${rclone}: ${r.error.message}`);
  if (r.status !== 0) throw new Error(`rclone exited ${r.status}: ${r.stderr.trim()}`);
  const paths = r.stdout.split('\n').map((l) => l.trim()).filter(Boolean);
  if (paths.length === 0) throw new Error(`${root} listed no files`);
  return sortPaths(paths);
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const i = args.indexOf('--out');
  const out = i === -1 ? DEFAULT_OUT : args[i + 1];

  const paths = listDrive();
  const body = paths.join('\n') + '\n';
  const before = existsSync(out) ? readFileSync(out, 'utf8') : '';

  if (body === before) {
    console.error(`${out} is already current: ${paths.length} files`);
    return;
  }
  if (!dryRun) writeFileSync(out, body);
  console.error(
    `${dryRun ? 'would write' : 'wrote'} ${paths.length} files to ${out}` +
      (before ? ` (was ${before.split('\n').filter(Boolean).length})` : ''),
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main();
  } catch (err) {
    console.error(`drive-files: ${err.message}`);
    process.exit(1);
  }
}
