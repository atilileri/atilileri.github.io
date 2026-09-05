# How to read material

The agent reads text, images and PDFs by itself. It cannot hear audio and it cannot watch video. This file says
how it reads the rest anyway, and what each route costs, so a Session can choose one without guessing.

**This file records capability, not choice.** It says what the agent *can* read and how. Which material a Session
*should* reach for stays with [#97](https://github.com/atilileri/atilileri.github.io/issues/97), and whether the
agent may drive external tools at all stays with [#130](https://github.com/atilileri/atilileri.github.io/issues/130).
Nothing here settles either.

Where the material lives is [`MATERIAL.md`](./MATERIAL.md). What is in Drive, file by file, is
[`DRIVE-INVENTORY.md`](./DRIVE-INVENTORY.md). The scripts named below live in
[`tools/media/`](../../tools/media/).

## What needs no tooling at all

The agent reads these directly, with no script and no conversion:

- **Text** of any kind — Markdown, CSV, JSON, subtitle files, transcripts.
- **Images** — PNG, JPEG. It sees the picture, not the filename.
- **PDFs** — up to 20 pages per read. Use `pdftext.js` instead when the question is *does this book mention X*,
  because searching one extracted file beats twenty page reads.

It cannot read **audio** or **video**. Everything below exists to close that gap.

## The four routes

| Material | Route | Command |
| --- | --- | --- |
| A file in Drive | copy it down first; never work in place | `~/bin/rclone copy "gdrive:<path>" <dir>` |
| Speech in any format | transcribe to timestamped text | `node tools/media/transcribe.js <file> [out.txt]` |
| A long PDF | extract the text layer, then search it | `node tools/media/pdftext.js <file.pdf> [out.txt]` |
| Video | frames to look at, plus the speech as text | `node tools/media/frames.js <file> <dir>` then `transcribe.js` |
| A scanned page with no text layer | OCR | `node tools/media/ocr.js <image> [out.txt]` |

Install everything with `bash tools/media/setup.sh`. It needs no root and no `pip`; this machine grants neither.

## Reaching Drive

Two rclone remotes exist. **`gdrive` is read-only and is the default.** `gdrive-rw` can write, and is named only
on a command that must write — so a write is always deliberate. Use `copy`, never `sync`, which would delete
originals.

```sh
~/bin/rclone lsf gdrive:atili/Dutch --recursive          # what is there
~/bin/rclone lsjson gdrive:atili/Dutch --files-only      # with sizes and types
~/bin/rclone copy "gdrive:atili/Dutch/<file>" /tmp/work/ # bring one down
```

Copy into a scratch directory outside the repo. Material from Drive is not repo material, and
[`MATERIAL.md`](./MATERIAL.md) forbids a fifth home: a file is committed and public, or it is not in this repo.

## What transcription costs, and how good it is

Measured on this machine, 8 CPU cores, no GPU, no key, no network:

- **Accuracy: 96.1%** of the words in a human transcript recovered — 1,547 of 1,610, on episode 1 of *Een Beetje
  Nederlands*, checked against that episode's own published transcript. What it misses is punctuation and
  sentence boundaries, not vocabulary.
- **Speed: about 4x realtime.** A 13-minute podcast takes about 3.5 minutes. A 3-minute exam listening clip takes
  about 45 seconds. A 56-minute recording takes about 14 minutes.

So **a Session can afford to transcribe an exam clip or a short podcast while the learner waits. It cannot afford
a lecture.** Transcribe anything long ahead of time and keep the text.

Three limits worth knowing before trusting the output:

1. **It reports words, never sound.** It cannot tell you whether Dutch is pronounced well, natural or regional.
   Judging that is a listening task for a person — which is why
   [#137](https://github.com/atilileri/atilileri.github.io/issues/137) exists and is not solved by this.
2. **Language is set per run, not per sentence.** The default is Dutch. Automatic detection runs per segment, so
   a recording that alternates Turkish and Dutch comes back with segments labelled wrongly and words mangled
   across the two. For paired bilingual audio, transcribe twice — once forced to each language — and read the two
   passes side by side.
3. **Names and rare words drift.** Proper nouns, URLs and brand names are the usual errors. Check a name against
   the source before it reaches a Lesson.

## Reading a video

The agent never sees motion. It sees stills and reads the speech. In practice that answers most questions a
recording raises: `frames.js` spreads frames across the recording, and slides, whiteboards and on-screen text
come through clearly enough to identify a course and its level.

One structural trap: an MP4 written by a phone or a web editor often stores its index at the **end** of the file,
so a partial download cannot be probed at all. Either fetch the whole file or accept that you cannot read it.

## Before you use what you read

- **Reading is not permission to publish.** Almost everything in Drive is commercial or reserved — see
  [`DRIVE-INVENTORY.md`](./DRIVE-INVENTORY.md). A transcript the agent generated is still a copy of someone's
  work. It informs a Lesson; it is not pasted into one, and it is not committed.
- **Recordings contain people.** The lesson recording in Drive shows a named teacher and several identifiable
  students, one with an email address on screen. Never publish a name, a face or an address found in material.
  This is the same boundary [`adr/0001-the-profile-is-public.md`](./adr/0001-the-profile-is-public.md) draws
  around the learner.
- **Cite the home, not the route.** A Lesson's Provenance names where the material lives —
  `Drive: <folder>/<file>` — as [`MATERIAL.md`](./MATERIAL.md) sets out. How the agent read it is not provenance.
