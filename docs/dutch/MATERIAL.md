# Source material: where it lives

Every piece of Dutch source material this journey uses has exactly one home. This file is the index of those
homes and the provenance of the files kept in the repo.
Decided by [#89](https://github.com/atilileri/atilileri.github.io/issues/89); constrained by
[#94](https://github.com/atilileri/atilileri.github.io/issues/94), which put third-party licence compliance
outside the agent's scope. **This file records locations and provenance. It is not a licence register.**

The audio corpus has its own inventory: [`LISTENING-INVENTORY.md`](./LISTENING-INVENTORY.md).
Everything in Drive, file by file, is listed in [`DRIVE-INVENTORY.md`](./DRIVE-INVENTORY.md).
**How the agent actually reads any of it — audio, video, scanned pages — is
[`READING-MATERIAL.md`](./READING-MATERIAL.md).**

## The four homes

Material lives in one of four places. Nothing lives in two.

1. **This repo, at [`docs/dutch/sources/`](./sources/).** Small, structured, stable, and read by the agent.
   Everything here is committed and public.
2. **The user's Google Drive.** Large media, and anything the repo should not carry — the listening corpus of
   [#96](https://github.com/atilileri/atilileri.github.io/issues/96), plus whatever
   [#133](https://github.com/atilileri/atilileri.github.io/issues/133) found — **1,927 files, 8.6 GiB**, listed in
   [`DRIVE-INVENTORY.md`](./DRIVE-INVENTORY.md), including the complete 2023–2025 DUO practice exams and, since
   2026-09-07, **a transcript beside every audio file**. The agent
   now reads this folder with `rclone` at read-only scope, and **may write to it with `gdrive-rw` once a human
   confirms the batch** — [#130](https://github.com/atilileri/atilileri.github.io/issues/130), recorded in
   [`AUTOMATION.md`](./AUTOMATION.md). Converted copies and transcripts of third-party audio land here, not in
   this repo.
3. **The Oracle** ([#134](https://github.com/atilileri/atilileri.github.io/issues/134)). The textbooks and their
   scans. The agent asks the Oracle a question and gets an answer; it never copies the book. **In practice today
   the Oracle is a collection of Gemini Notebook (NotebookLM) notebooks**, stated by the user on 2026-09-05, with
   the files behind them in Drive. It holds *Nederlands op niveau* and the captured exam material. #134 still owns
   what the Oracle **is** — this line records what exists, not a lock.
4. **The live web.** Material that stays at its URL and is fetched when a Session needs it. Nothing is mirrored.

**There is no fifth home inside the repo.** A file in this repo is committed, or it is not in this repo. The
journey adds no gitignored directory of material, because a gitignored blob is a private file that looks
public, and the publicness lock forbids that ambiguity. The private staging directory
`/home/neo/private/dutch-*` sits outside the repo and outside git.

## How files in Drive are named

**A filename in `atili/Dutch` explains itself**, so that a file still makes sense once it is sent to a phone,
away from its folder. The shape is a sortable prefix and a prose tail:

```
<identity> - <nn> - <what it is>.<ext>
```

- **The prefix repeats the folder's identity.** Redundant inside the folder, essential outside it.
- **The number is zero-padded**, so a media player keeps exam order.
- **Names are in the language of the source, and transcribed, never translated.** Exam names come out of the
  exam's own `opgavenboekje`, word for word. Turkish courses keep Turkish names.
- **A converted copy shares its original's name** and differs only by extension. The published file is the
  master.
- **No filename carries a person's name** found inside the material. See
  [`READING-MATERIAL.md`](./READING-MATERIAL.md).
- **Punctuation is plain ASCII** — a hyphen, never a dash; a straight apostrophe, never a curly one.

| Body | Example |
| --- | --- |
| Exam media | `2023 Luisteren I - 17 - Een les van de drogisterijdocent - opgave 13.mp3` |
| Exam papers | `2023 Luisteren I - opgavenboekje.pdf`, `2023 Luisteren I - beoordelingsmodel.pdf` |
| Books | `Nederlands in gang - A0-A2 (Coutinho, 2017).pdf` |
| Coursebook audio | `Nederlands in gang - 01 - dialoog.mp3`, `Nederlands in gang - 17 - opdracht 04c.mp3` |
| Goethe book2 | `TRNL 007 - Sayılar.mp3` |
| Podcasts | `50 - de ijstijd, de hunebedden en de eerste boeren.mp3` |

**This binds new material too.** Anything added to `atili/Dutch` later is named the same way. The same rule,
written for someone browsing Drive rather than reading this repo, sits at the top of the folder as
`00 README - what is here and how files are named.md`; its source is [`DRIVE-README.md`](./DRIVE-README.md),
so edit that and re-upload rather than editing the copy in Drive.

## How content points at material

A **Lesson** carries one optional Provenance string, locked by
[#94](https://github.com/atilileri/atilileri.github.io/issues/94). That string is the only pointer convention,
and it names the home:

| Home | Provenance string |
| --- | --- |
| This repo | the repo path — `docs/dutch/sources/taalprofielen-2015.txt` |
| Drive | `Drive: <folder>/<file>` |
| The Oracle | `Oracle: <book title>, ch. <n>, <date asked>` |
| The live web | the URL, plus the date read |

An **Item** carries no provenance. A word comes from everywhere.

A **Clip** in a Session uses the same strings, and adds the duration or time range, the judged
level band beside any declared claim, and — for Drive material — optionally a Drive link
beside the `Drive:` string. The format is in [`LISTENING.md`](./LISTENING.md).

## What is in the repo, and where it came from

The files below are third-party works, kept verbatim or mechanically extracted. They are **not** the author's
own content, so `LICENSE-CONTENT` (CC BY 4.0) does not describe them; each row names its own terms.

| File | What it is | Source | Fetched | Terms |
| --- | --- | --- | --- | --- |
| [`sources/taalprofielen-2015.txt`](./sources/taalprofielen-2015.txt) | The Dutch CEFR can-do descriptors, per skill × A1–C2, with descriptor ids such as `LEB1-1a`. The curriculum spine for the Plan ([#85](https://github.com/atilileri/atilileri.github.io/issues/85)). 145 pages, 255 KB. | SLO, *Taalprofielen 2015*, [PDF](https://slo.nl/publish/pages/2890/taalprofielen-2015.pdf) | 2026-09-05 | The publisher grants copying, distribution **and derived material**, with attribution. |
| [`sources/knm-eindtermen.txt`](./sources/knm-eindtermen.txt) | Bijlage 2 of the Regeling inburgering 2021 — the legally binding KNM exam objectives, eight themes, numbered `1.1.1` upward. The KNM half of the Plan. | [wetten.overheid.nl, BWBR0045574](https://wetten.overheid.nl/BWBR0045574), consolidated text of **2026-04-18** | 2026-09-05 | A Dutch government regulation. No copyright. |
| [`sources/frequency-nl-50k.txt`](./sources/frequency-nl-50k.txt) | 50,000 Dutch word forms by frequency, `word count` per line, from OpenSubtitles 2018. Orders vocabulary for Item selection. | [hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords), `content/2018/nl/nl_50k.txt` | 2026-09-05 | CC BY-SA 4.0. |
| [`sources/cognates-false-friends.csv`](./sources/cognates-false-friends.csv) | Poort & Rodd's 284 Dutch/English word pairs — 58 identical cognates, 76 non-identical cognates, 72 false friends, 78 translation equivalents — with orthographic similarity, rated meaning, spelling and pronunciation overlap, Dutch frequency, and one example sentence each. The seed for the `bridge` and `trap` fields ([#84](https://github.com/atilileri/atilileri.github.io/issues/84)). | [OSF `tcdxb`](https://osf.io/tcdxb/), *The Database of…* `.xlsx` | 2026-09-05 | CC BY 4.0. |

**Two files are extractions, not copies.** `taalprofielen-2015.txt` came out of the PDF with `pdfjs-dist`
4.10.38, one `=== page N ===` marker per page; tables lost their column structure, the prose and the descriptor
ids did not. `knm-eindtermen.txt` is the Bijlage 2 section of the regulation's HTML, stripped of markup.
Re-extract from the source URL rather than hand-editing either file.

**The KNM objectives carry a date.** DUO changed the KNM content in July, so anything generated from
`knm-eindtermen.txt` states which consolidated text it used.

## What is deliberately not in the repo

- **The textbooks.** They go to the Oracle. See [#94](https://github.com/atilileri/atilileri.github.io/issues/94).
- **The listening corpus.** 5.4 GB in Drive. See [`LISTENING-INVENTORY.md`](./LISTENING-INVENTORY.md).
- **Tatoeba's aligned sentences and the UD_Dutch-Alpino treebank.** Both are useful and neither has a proven
  need. They come in when a ticket names one.
- **The official practice exams.** They are no longer downloadable — see below.

## The exam papers are browser-only

Research [#77](https://github.com/atilileri/atilileri.github.io/issues/77) reported that CvTE published
complete past papers for 2021–2023, downloadable. **That is no longer true.** As of 2026-09-05,
`staatsexamensnt2.nl/voorbereiden/examens-oefenen` offers exactly one route — the *oefenomgeving* at
`oefenexamensnt2.nl`, an Angular application over an API at `/api/facet-service-openbaar` whose routes are not
discoverable from the client bundle. This matches [#96](https://github.com/atilileri/atilileri.github.io/issues/96)'s
finding for the DUO practice exams. Reaching either one **from a script** needs a browser.
[#130](https://github.com/atilileri/atilileri.github.io/issues/130) allows browser automation, but only against a
**named target**, and neither of these is on the list — so a human keeps fetching this material by hand.
[#135](https://github.com/atilileri/atilileri.github.io/issues/135) may propose adding one.

**The material itself is no longer missing.** The user captured it by hand on 2026-09-05, into Drive and into the
Oracle's notebooks. So the map has exam material; what it lacks is an *unattended* route to more of it. That
distinction matters to [#95](https://github.com/atilileri/atilileri.github.io/issues/95), which can now judge
luisteren against real exam tasks. #130 answered the narrowed question: **yes, a human keeps fetching it**, because
the allowlist admits only the Oracle and `nos.nl`.
