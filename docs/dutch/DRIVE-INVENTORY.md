# Drive inventory: every Dutch file in `atili/Dutch`

What the user holds in Google Drive, file by file, read with `rclone` rather than typed by hand.
**This file records facts, not choices.** [`MATERIAL.md`](./MATERIAL.md) says where material lives and how its
files are named; [`LISTENING-INVENTORY.md`](./LISTENING-INVENTORY.md) covers the podcast corpus in depth;
[`READING-MATERIAL.md`](./READING-MATERIAL.md) says how the agent reads any of it;
[#94](https://github.com/atilileri/atilileri.github.io/issues/94) rules on licences.

**Read on 2026-09-05, and the whole folder re-read on 2026-09-07.** A scan of the whole Drive — 22,728
directories — found Dutch material in exactly one place, `atili/Dutch`, and nowhere else. Nothing here is
committed to this repo, and most of it never can be.

**Two changes finished on 2026-09-07, and this file reflects both.** First, **every `audio/` folder is gone**,
at the user's instruction: the DUO exam media and the listening corpus now sit in their own folders, so a
transcript can sit beside its audio. `librivox-nl/` keeps a folder per book, because two books cannot share one
`metadata.json`. The moves were server-side, so **every id of the user's own material survived unchanged** —
178 for Een Beetje Nederlands, 148 for the other listening sources and 1,007 for the DUO exams, each verified
against a snapshot taken first. Forty-five ids did change, all of them machine transcripts written earlier that
day, because the uploader was running while the move was in flight; the content was compared and is identical.

Second, the **machine transcription run finished**: 644 files, 69.4 hours of audio, no failures, read locally
and offline. Drive now holds **732 transcripts** — the user's 87 plus 645 written by machine. One body is
left untranscribed on purpose, the NT2 Taaldiensten class recordings, and
[`LISTENING-INVENTORY.md`](./LISTENING-INVENTORY.md) says why. `30 Günde Hollandaca` was the second such
folder and no longer is: it carries 28 transcripts today.

**Totals, measured 2026-09-23: 2,257 files in `atili/Dutch`**, plus the index at the top of the folder that
repeats the naming convention for anyone browsing Drive. **The count is [`drive-files.txt`](./drive-files.txt)
and is not maintained here** — it is read from Drive by `tools/dutch/drive-files.mjs`, never computed from
the previous total, because the folder grows between reads and the weekly course recordings
([#143](https://github.com/atilileri/atilileri.github.io/issues/143)) land themselves. The 8.99 GiB measured
on 2026-09-09 is the last size anyone needed; `rclone size` gives today's.

**The mix, on 2026-09-23.** Derived from `drive-files.txt`, so it is recomputed rather than edited:

```
grep -o '\.[a-zA-Z0-9]*$' docs/dutch/drive-files.txt | tr 'A-Z' 'a-z' | sort | uniq -c | sort -rn
```

| Extension | Files |
| --- | --- |
| `.txt` | 920 |
| `.mp3` | 818 |
| `.opus` | 306 |
| `.mp4` | 69 |
| `.pdf` | 63 |
| `.webm` | 53 |
| `.json` | 12 |
| `.md` | 5 |
| `.rss` | 4 |
| `.pptx`, `.log`, `.jpg`, `.djvu`, `.csv` | 6 |

## The four bodies of material

**1. The DUO practice exams — `DUO oefenexamens NT2/`, 1,196 files, 1.04 GiB.** The complete published *openbaar
examen* set for **2023, 2024 and 2025**, both programmes, all four skills. Each year and skill has an
`opgavenboekje` (the questions) and a `beoordelingsmodel` (the marking scheme) — **48 PDFs** — and the
Luisteren and Spreken papers keep their media, and its transcripts, in the year-and-skill folder itself.

The user extracted these by hand. That matters, because
[#96](https://github.com/atilileri/atilileri.github.io/issues/96) recorded the practice exams as unreachable —
an Angular application with no discoverable API. That finding was about the *agent's* reach and still holds;
the material itself is here.

Three tickets should read this folder before they resolve.
[#95](https://github.com/atilileri/atilileri.github.io/issues/95) asks what can honestly be done for spreken
and luisteren, and there are **six real spreken papers with prompts and marking schemes**.
[#85](https://github.com/atilileri/atilileri.github.io/issues/85) marked every spreken Objective `unsupported`
on the evidence available then. [#82](https://github.com/atilileri/atilileri.github.io/issues/82)'s **Exam
task** has authentic examples to model on.

Two things about this set are worth knowing before using it:

- **`2024 Spreken I` has two versions of track 07.** DUO published it twice, with different audio and different
  dates. The later one is marked `(tweede versie)`.
- **Licence, unruled here.** DUO published these for candidates to practise with, and the CvTE notice in each
  booklet states its own terms. This file does not interpret them;
  [#94](https://github.com/atilileri/atilileri.github.io/issues/94) put licence compliance outside the agent's
  scope.

**2. The coursebooks and dictionaries — 13 files at the folder root, 641 MB.** Four NT2 methods (Coutinho's
*Nederlands in gang* A0–A2, *Nederlands in actie*, *Nederlands op niveau* B1–B2, plus *Teach Yourself Dutch*),
*Dutch For Dummies*, a graded reader, a Dutch Academy Eindhoven handout, a Turkish-medium course, two Turkish
word lists, and the **Van Dale Groot Beeldwoordenboek** — a four-language picture dictionary held as a 468 MB
PDF, a 49 MB DjVu, and three split parts in their own folder.

Each filename names its book and publisher, read from the PDF metadata rather than guessed. Both Turkish word
lists are Boom's — *Van Start* (2019) and *Basiscursus 1* (2013) — which closes the one lead that looked as
though it might be freely licensed. `Adım Adım Hollandaca` reserves all rights to its author, runs to **58
pages** despite the 158 its original filename claimed, and still carries the PDF title *"Adım adım Almanca"*
from the same author's German book.

These are the Oracle's material, home 3 in [`MATERIAL.md`](./MATERIAL.md). They are commercial works: the
agent asks the Oracle about them and never copies them.
[#134](https://github.com/atilileri/atilileri.github.io/issues/134) decides what the Oracle is.

**One of them has its audio here too — `Nederlands in gang - audio/`, 214 files, 180.5 MB.** This is the
audio Coutinho publishes with *Nederlands in gang*, the A0–A2 method: **107 recordings across the book's 18
chapters**, plus a machine transcript of each. Four kinds of recording, and every chapter has the first two:

- **the `dialoog`** that opens each chapter, and
- **the `intensieve luistertekst`**, the intensive listening text from the chapter's extra material;
- **33 `opdracht` clips**, the audio a numbered exercise needs;
- **`het alfabet` and `telwoorden`** in chapter 1, which teach the letters and the numbers.

**Thirty-six of the 107 are a `met pauzes` version** — the same recording with gaps for repeating aloud, which
the book's preface tells the learner to use. Every chapter has one for its `dialoog`; chapters 14 and 17 have
none for their listening text.

**The chapter number in a filename is the book's own.** The recordings announce it — *"Dialoog bij
hoofdstuk 1"* — and the book's contents pages, read through the Oracle, name all 18 chapters. The name carries
the number and not the chapter title, at the learner's request.

**The audio is commercial, exactly like the book it belongs to**, so it never leaves Drive. It is on the
Oracle by reference only — four notebooks, listed in
[`ORACLE-INVENTORY.md`](./ORACLE-INVENTORY.md).

**3. The listening corpus — `dutch-listening/`, 486 files, 5.38 GiB.** Landed by
[#96](https://github.com/atilileri/atilileri.github.io/issues/96) and inventoried source by source in
[`LISTENING-INVENTORY.md`](./LISTENING-INVENTORY.md). **Drive is the only copy of the 87 Een Beetje Nederlands
transcripts** — the local tree was deleted after the upload, and no transcript is re-fetchable. The audio is.

**4. Three Turkish-medium sets — 129 files, 1.13 GiB.** All three were identified by reading them: ID3 tags, a
transcription, and stills from the video. See [`READING-MATERIAL.md`](./READING-MATERIAL.md) for how. None of
them leaves Drive.

- **`Goethe book2 TR-NL/`** — 100 clips, about 4.8 hours, mono 48 kbps, dated 2016. Goethe-Verlag's *book2* /
  50LANGUAGES course, Turkish to Dutch, one file per lesson, numbered as the publisher numbers them.
  Goethe-Verlag distributes it free for private and school use; the exact terms are the publisher's to state.
  **This is the only one of the three that is plausibly free**, and it is paired Turkish–Dutch audio, which is
  what the Turkish-first lock asks for.
- **`30 Günde Hollandaca/`** — 28 MP3, a Turkish "Dutch in 30 days" course, an untagged CD rip from **7
  November 2018**. Commercial. Each file is a word-and-phrase drill with no spoken topic, so it is named by the
  `Bölüm` number the audio announces. **Chapter 15 is absent**: the set runs 1–14 and 16–29.
- **`NT2 Taaldiensten - A0-A2/`** — where the user keeps **shortcuts to recorded online NT2 classes**, added as
  each class happens. The recordings are run by NT2 Taaldiensten and are **owned by the school, not by the
  user**; what lives here is a Drive shortcut, so the agent can open a recording but can neither copy nor
  rename the underlying file.

  The one recorded so far is **56 minutes, 1080p**, an A0–A2 class taught in Turkish. **It is a taster class,
  not a course lesson** — the teacher says the session exists *"to show what I do in an online lesson"*, and it
  closes by quoting the timetable and prices of the real A2 and B1 groups. The teaching that does happen is
  weather vocabulary — `hittegolf`, `bosbrand`, `sneeuwen`, `onweer`, `droog` — explained in Turkish. So its
  value is **the format, not the content**: a real teacher teaching Dutch through Turkish, which is the
  register this journey is trying to write. Useful to
  [#90](https://github.com/atilileri/atilileri.github.io/issues/90) as a model, not as material.

  **These recordings show identifiable people** — a named teacher, several students, one with an email address
  on screen. No name, face or address from them may ever be published, whatever the publicness lock says about
  the journey's own artifacts.

  One recording also demonstrated a limit worth keeping. It alternates Turkish and Dutch; the Turkish
  transcribed cleanly while the embedded Dutch was mangled — `hittegolf` as *"Hitticholf"*, `bosbrand` as
  *"Bosch Brand"*, `onweer` as *"on wear"*. That is the per-segment language problem in
  [`READING-MATERIAL.md`](./READING-MATERIAL.md), seen in the wild.

## The exam media exists in two formats

The exam media was published as Ogg Opus and VP8 webm, which a browser preview and a phone player often refuse.
**Every such file has a converted sibling in the same folder, under the same name**, differing only in
extension: 306 `.opus` with an `.mp3` beside it, 53 `.webm` with an `.mp4`. Converted with a static ffmpeg
7.0.2, audio at libmp3lame VBR `-q:a 2` and video at H.264 `-crf 20` with AAC 192 kbps and `+faststart`.

**The published file is the master.** Nothing was replaced, the 35 files already published as `.mp3` were left
alone, and both conversions are lossy-to-lossy — the bitrates sit above the source so the loss stays inaudible.
All 359 outputs were checked: none empty, and none drifted more than 0.35 s from its source.

The agent needs none of this, since ffmpeg reads opus and webm directly. The conversions exist for notebook
upload, for Drive's in-browser player, and for the Session links the learner opens on a phone.

## Every file is in `drive-files.txt`, not here

**The path of every file in `atili/Dutch` is [`drive-files.txt`](./drive-files.txt)**, one path per line,
sorted, with no sizes. It is generated by `node tools/dutch/drive-files.mjs` from `rclone lsf`, and Docent
refreshes it when a Session needs Drive material. **Search it; never read it whole** — it is about 2,250
lines, and the rule that governs it is [`INVENTORY.md`](./INVENTORY.md).

```
grep -i 'hunebedden' docs/dutch/drive-files.txt
```

This file used to carry that listing by hand, at 1,418 lines against 160 of prose, and
[#152](https://github.com/atilileri/atilileri.github.io/issues/152) cut it. Generating it fixed two things at
once:

- **The listing is now complete.** The hand-written one collapsed every transcript into *"plus N machine
  transcripts"*, so a grep for a transcript's own name found nothing. All of them are named now.
- **It had already drifted.** The first generated run read **2,257 files, not the 2,201** measured on
  2026-09-09 — the weekly course recordings ([#143](https://github.com/atilileri/atilileri.github.io/issues/143))
  land by themselves. It also shows 28 transcripts under `30 Günde Hollandaca/`, which this document twice
  called untranscribed; `LISTENING-INVENTORY.md` was the one that stayed right.

**A size is not recorded, because none is used.** The two sizes any decision ever rested on — the 468 MB Van
Dale and the 58-page `Adım Adım Hollandaca` — are in the prose above, where they were argued. For anything
else, ask Drive: `~/bin/rclone size gdrive:atili/Dutch/<folder>`.

**This document keeps what a listing cannot give**: which four bodies of material these are, what each is
for, what their licences turned out to be, and the traps found by reading them. That is above, and it is not
generated by anything.
