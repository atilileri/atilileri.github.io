# Drive material is renamed, not indexed

The Dutch material in Google Drive arrived with names that carry no meaning — 753 exam media files called
`Track 10.mp3`, 100 called `TRNL047.mp3`, and a coursebook called `dutch.pdf` that is in fact *Dutch For
Dummies*. A Session cannot cite what it cannot name, and a learner cannot find a clip on a phone by scrolling a
folder of track numbers.

**We rename the files themselves rather than writing an index beside them.** An index is cheaper and carries no
risk, but it helps only the agent — it does nothing for a human browsing Drive, which is half the problem. So
the index still gets built, as a manifest, and the rename is driven from it.

Decided by [#138](https://github.com/atilileri/atilileri.github.io/issues/138). The naming convention itself is
in [`../MATERIAL.md`](../MATERIAL.md), and its reader-facing copy lives at the top of the Drive folder as
`00 README - what is here and how files are named.md`.

## Why this was not obviously safe

The material is also loaded into the Oracle — the user's Gemini Notebook (NotebookLM) notebooks. A rename that
minted a new file would have destroyed every source in them, and the notebooks are hand-built.

**Measured on 2026-09-05, not assumed.** `atili/Dutch/dutch.pdf` was renamed to
`Dutch For Dummies (Wiley).pdf` with `rclone moveto` inside one remote:

| | Name | Drive file id | Size | Modified |
| --- | --- | --- | --- | --- |
| before | `dutch.pdf` | `1DgEGffc1sl03LAqLaTx0Aw2yTZqRssyn` | 3 078 393 | 2026-07-05T18:47:18Z |
| after | `Dutch For Dummies (Wiley).pdf` | `1DgEGffc1sl03LAqLaTx0Aw2yTZqRssyn` | 3 078 393 | 2026-07-05T18:47:18Z |

rclone reported `Server Side Moves: 1`. The id and the modification time did not change, so no file was created
and none was deleted. The user then checked the notebook: **the source was still readable, and its title had
followed the rename.** Drive addresses a file by id, never by name, so a rename is invisible to anything holding
the id.

This produces two rules that bind every later rename in this folder:

1. **Every write is `moveto` within one remote.** Never `copy` then `delete` — that mints a new id and deletes
   the old one, which is the one event that kills a notebook source.
2. **Never overwrite.** `rclone moveto` silently replaces a file already at the destination, so the manifest is
   checked for duplicate targets before any write runs. A collision stops the run and reports the pair.

## Consequences

- **The manifest is the undo log.** [`../DRIVE-RENAME.csv`](../DRIVE-RENAME.csv) holds `old_path,new_path,file_id`
  for every file touched. The id column makes the undo exact even if a name is changed again by hand later.
- **`DRIVE-INVENTORY.md` is regenerated** after each body, because it records facts and its facts have moved.
- **One name was removed for privacy, not for clarity.** The recorded NT2 Taaldiensten class was called
  `Serap ile tanisma dersi.mp4`, naming the teacher — and this public repo had published that name in the
  inventory. [`../READING-MATERIAL.md`](../READING-MATERIAL.md) forbids publishing a name found in material, so
  the file is renamed and the old name is scrubbed from the inventory rather than recorded in the manifest's
  public row.
- **`dutch-listening/` keeps its names**, which were already good — except eight that were **corrupted in
  Drive** (`11-marga-klomp├⌐.mp3` for `11-marga-klompé.mp3`). Those are repaired as data, not restyled.
- Write access to Drive is now exercised, which partly pre-empts
  [#130](https://github.com/atilileri/atilileri.github.io/issues/130). The user granted it **conditionally for
  this map, with a human gate before every batch**. #130 still owns the general rule.
