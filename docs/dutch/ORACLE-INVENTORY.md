# Oracle inventory

What each notebook in the Oracle holds, so a Session knows where to ask before it asks.
Surveyed and reshaped 2026-09-08 by [#134](https://github.com/atilileri/atilileri.github.io/issues/134).
**This file records facts, not choices.** What the Oracle *is* and what Docent may do with it is
[`ORACLE.md`](./ORACLE.md). Where material lives is [`MATERIAL.md`](./MATERIAL.md).

## How to reach it

The client is `notebooklm-py`, installed with `uv tool install "notebooklm-py[browser,headless]"`. Its durable
credential sits at `~/.notebooklm/profiles/default/storage_state.json` — a **Machine credential** under
[`AUTOMATION.md`](./AUTOMATION.md), never committed.

Three rules bind every call:

- **Expand the `OracleDutch` collection** — `notebooklm collection notebooks OracleDutch --json`. A collection
  is a real container that the API expands, and the learner controls its membership in the interface. The
  account holds notebooks from other projects, so **membership is never guessed from a title**.
- **Address with `-n <id>`. Never use `notebooklm use`,** which is stateful and would let two Sessions collide.
- **Pass `--quiet`.** Without it the CLI prints a `Matched: …` banner to stdout and breaks JSON parsing.

## Account limits

| Limit | Value | Consequence |
| --- | --- | --- |
| Sources per notebook | **100** | A source family splits across notebooks. `turkish - goethe book2 - transcript` is **full**. |
| Size per source | **200 MB** | An hour of video needs its audio extracted first. See *Adding a lesson recording*. |

## How a notebook is named

`<family> - <source> - <modality>`, in lower case, with ` - ` between the parts.

- The **family** comes first, so an alphabetical list sorts into blocks: `books`, `course`, `exam`,
  `listening`, `scratch`, `turkish`.
- The **source** mirrors its folder in Drive, because [`MATERIAL.md`](./MATERIAL.md) makes Drive the master.
- The **modality** — `audio` or `transcript`, always singular — appears **only when a source is split across
  two notebooks**. A source whose audio and text fit together under the 100-source cap has no modality suffix,
  and holds both.

No name repeats the collection. `OracleDutch` was a prefix on all 16 notebooks until 2026-09-08; the
collection does that work, and the prefix cost 12 identical characters at the front of every tile in a grid
that truncates.

## The shelf, at a glance

25 notebooks, 1,499 sources.

| Notebook | Level | Sources | Holds |
| --- | --- | --- | --- |
| `books - library` | A0–B2 *(per book, below)* | 13 | Every course book, dictionary and word list |
| `course - nt2 taaldiensten` | A0–A2 *(the course's own name)* | 2 | Recordings of a live NT2 course, taught in Turkish |
| `exam - 2023 I` | **B1** *(CvTE)* | 66 | NT2 Programma I, 2023 — papers and listening audio |
| `exam - 2023 I - transcript` | **B1** *(CvTE)* | 68 | The same year as text |
| `exam - 2023 II` | **B2** *(CvTE)* | 65 | NT2 Programma II, 2023 |
| `exam - 2023 II - transcript` | **B2** *(CvTE)* | 65 | The same year as text |
| `exam - 2024 I` | **B1** *(CvTE)* | 66 | NT2 Programma I, 2024 |
| `exam - 2024 I - transcript` | **B1** *(CvTE)* | 67 | The same year as text |
| `exam - 2024 II` | **B2** *(CvTE)* | 61 | NT2 Programma II, 2024 |
| `exam - 2024 II - transcript` | **B2** *(CvTE)* | 62 | The same year as text |
| `exam - 2025 I` | **B1** *(CvTE)* | 68 | NT2 Programma I, 2025 |
| `exam - 2025 I - transcript` | **B1** *(CvTE)* | 68 | The same year as text |
| `exam - 2025 II` | **B2** *(CvTE)* | 63 | NT2 Programma II, 2025 |
| `exam - 2025 II - transcript` | **B2** *(CvTE)* | 64 | The same year as text |
| `listening - een beetje nederlands - audio` | B1–B2 *(self-declared)* | 91 | Slow, scripted Dutch history and culture |
| `listening - een beetje nederlands - transcript` | B1–B2 *(self-declared)* | 92 | The published human transcripts |
| `listening - zeg het in het nederlands - audio` | A2–B1 *(reviewers)* | 58 | 58 recordings |
| `listening - zeg het in het nederlands - transcript` | A2–B1 *(reviewers)* | 58 | The same 58 episodes as text |
| `listening - nos jeugdjournaal` | native, for children | 80 | 40 recordings **and** their 40 transcripts |
| `listening - echt gebeurd` | native, unscripted | 60 | 30 recordings and their 30 transcripts |
| `listening - librivox` | native, literary | 36 | 18 recordings and their 18 transcripts |
| `turkish - goethe book2 - audio` | unrated | 98 | A Turkish–Dutch audio course |
| `turkish - goethe book2 - transcript` | unrated | 100 | **Full.** |
| `turkish - 30 gunde hollandaca` | unrated | 28 | *30 Günde Hollandaca*, audio only |
| `scratch` | — | 0 | Empty on purpose. The only notebook a Session writes to. |

**Google transcribes audio itself.** Measured 2026-09-06 and again 2026-09-08: a question to an audio notebook
returns verbatim speech with the source file named. So every audio notebook is a searchable corpus, whether or
not a separate transcript notebook exists.

### Where the level comes from

**A filename never states a level, so the notebook carries it instead.** Every source inside one notebook comes
from a single body of material, so the level belongs to the notebook, and this table is where Docent reads it.
Each claim names its evidence:

- **`(CvTE)`** — certain. Programma I *is* B1 and Programma II *is* B2, by the exam board's definition. **The
  exam notebooks are the only ground truth on this shelf**, which is what makes job 11 possible: to rate
  anything else, compare it against an exam task.
- **`(self-declared)`** and **`(reviewers)`** — the publisher's or the audience's claim, recorded in
  [`LISTENING-INVENTORY.md`](./LISTENING-INVENTORY.md). Useful, not authoritative.
- **`native`** — made for Dutch speakers, so no CEFR level applies. Treat it as above B2 unless a Session
  proves otherwise.
- **`unrated`** — no evidence exists. **Docent does not guess a level for these; it either avoids the notebook
  or rates it against an exam notebook first, and the rating is written here.**

## The books — `books - library`

Thirteen PDFs. The three Coutinho methods are the spine of the shelf, and they ladder by level.

| Book | Level | Ask it about |
| --- | --- | --- |
| *Nederlands in gang* (Coutinho, 2017) | A0–A2 | Beginner grammar, the article rules, first vocabulary |
| *Nederlands in actie* (Coutinho) | A2–B1 | The `exam` Tier — B1 grammar and topic order |
| *Nederlands op niveau* (Coutinho) | B1–B2 | The `stretch` Tier |
| *Teach Yourself Dutch* (Quist & Strik) | beginner | A second explanation when Coutinho's is thin |
| *Dutch For Dummies* (Wiley) | beginner | Plain-English framing of a rule |
| *Survival Dutch* (Dutch Academy Eindhoven) | A1 | Everyday survival phrases |
| *Dutch Short Stories for Beginners* | A1–A2 | Graded reading passages |
| *Van Dale Groot Beeldwoordenboek*, parts 1–3 | all | Picture-dictionary vocabulary by domain |
| *Adım Adım Hollandaca* (Ferhad Yıldız) | beginner | Dutch grammar explained **in Turkish** |
| *Basiscursus 1 — woordenlijst NL–TR* (Boom, 2013) | A1–A2 | Dutch–Turkish word list |
| *Van Start — woordenlijst NL–TR* (Boom, 2019) | A1 | Dutch–Turkish word list |

Three are Turkish-mediated, which matters under the Turkish-first lock
([adr/0002](./adr/0002-turkish-prose-quoted-english.md)): a Turkish explanation of a Dutch rule already exists
and does not need inventing.

## The exams — twelve notebooks

Each pair is **one year, one Programma**: `I` is Programma I (B1, the `exam` Tier) and `II` is Programma II
(B2, the `stretch` Tier). Years 2023, 2024 and 2025.

The base notebook holds, for all four skills (Lezen, Luisteren, Schrijven, Spreken):

- an **opgavenboekje** — the task booklet, the questions as the candidate sees them;
- a **beoordelingsmodel** — the marking model, which is the answer key **and** the scoring rules;
- the **Luisteren audio**, 53 to 60 mp3 tracks.

The `- transcript` notebook holds the same listening material as text.

Naming differs by year, so match loosely, never exactly:

- **2023** names the audio by content — `2023 Luisteren I - 02 - Een gesprek met een autoverkoper - introductie.mp3`.
- **2024 and 2025** name it by position — `Track 9_opgave 7.mp3`, with spacing that varies between files.

## The listening corpus — seven notebooks

| Notebook | Range | Note |
| --- | --- | --- |
| `een beetje nederlands - audio` | trailer, episodes 1–90 | Slow, scripted Dutch history and culture |
| `een beetje nederlands - transcript` | 92 `.txt` files | **Published human transcripts.** Exact wording, free to search |
| `zeg het in het nederlands - audio` | episodes 1–58 | |
| `zeg het in het nederlands - transcript` | 58 `.txt` files | Pairs with the audio by name, episode for episode |
| `nos jeugdjournaal` | 2025-05-28 → 2026-08-26 | Dated news for children. The best level fit found for B1 |
| `echt gebeurd` | afleveringen 550–579 | Native storytelling, unscripted, hardest of the set |
| `librivox` | `alibaba`, `trom2` | Two public-domain audiobooks, the only committable licence |

**Een Beetje Nederlands splits by modality, not by the cap.** Ask `- transcript` when the exact wording
matters; ask `- audio` when the sound matters. They are the same episodes.

## The Turkish-mediated material — three notebooks

- **`turkish - goethe book2 - audio`** — 98 lessons, titled in Turkish by topic
  (`TRNL 003 - Tanımak, öğrenmek, anlamak.mp3`).
- **`turkish - goethe book2 - transcript`** — 100 texts, numbered 001–100 with no gaps. **At the cap.**
- **`turkish - 30 gunde hollandaca`** — 28 tracks, `30 Günde Hollandaca - Bölüm 01.mp3` upward. **No
  transcripts, on purpose** — see *Known gaps*.

## The live course — `course - nt2 taaldiensten`

Recordings of an NT2 course the learner attends, from Drive folder `NT2 Taaldiensten`. **This notebook grows**
— a new recording appears after each lesson.

- `NT2 Taaldiensten - tanisma dersi - weer en klimaat` — 56 min, the introduction lesson, weather vocabulary.
- `NT2 Taaldiensten - les 2026-09-07` — 59 min.

**The teacher speaks Turkish and teaches Dutch words**, so a search in this notebook returns Turkish prose
around Dutch terms. It is the closest thing on the shelf to the learner's own classroom, which makes it the
right place to ask what a lesson has already covered.

**These recordings carry other people's voices.**
[`LISTENING-INVENTORY.md`](./LISTENING-INVENTORY.md) excluded them from the Drive transcription run for that
reason. The notebook is private and nothing from it is published, so the publicness lock is not touched — but a
Lesson must never quote a classmate.

### Adding a lesson recording

**A notebook accepts audio; the *Drive* route does not.** Keep the two apart, because confusing them makes the
shelf look more closed than it is.

- **A local upload of audio works** — `source add <file> --type file`. Measured many times on 2026-09-08.
- **No Drive route carries audio.** `source add-drive-file` accepts only
  `csv, docx, epub, markdown, md, pdf, pptx, txt`; `source add-drive` takes only native Docs, Slides, Sheets
  and PDF; and a Drive share URL passed to `source add` fails to fetch. So the `google_drive` mp3 sources
  already on this shelf came from the web interface, which has a route the API does not expose.
- **A transcript is a `.txt`, so a transcript *can* go in by Drive reference.** Text and audio take different
  routes.

The 200 MB source limit also rejects an hour of video. The route that works for a lesson recording, measured on
both:

1. `rclone copy` the `.mp4` to a scratch directory.
2. `ffmpeg -vn -ac 1 -ar 16000 -b:a 32k` — an hour becomes about **14 MB**, and takes about 6 seconds.
3. `notebooklm source add "<file>.mp3" --type file -n <id> --title "<name>"`.
4. `notebooklm source wait <source-id> -n <id>` until the status is `ready`.

The video track carries the slides, and this route drops it. The slides folder in Drive
(`A0>A2/Ders slaytlari`) is empty today; when it fills, add the slides as their own sources.

## Known gaps

Six things a Session should expect. None is an error, and Docent repairs none of them —
[`ORACLE.md`](./ORACLE.md) leaves the shelf to the learner.

1. **Two Goethe lessons have no recording.** `TRNL 007 - Sayılar` and `TRNL 011 - Aylar` exist in Drive and
   their transcripts are on the shelf, but the audio notebook holds neither. **Google rejects both files**,
   reproducibly: the upload succeeds and processing then fails. Measured 2026-09-08 — the audio decodes
   cleanly at normal loudness, a sibling file of identical format and size (`TRNL 006`) uploads and processes,
   and the failure survives a re-encode, a metadata strip, an `m4a` container and a different notebook. The API
   gives no reason, **and the web interface refuses them too** — the learner confirmed it on 2026-09-08. These
   two are therefore **left out for good**, not pending. The lessons stay searchable as text.
2. ~~A duplicate in `listening - zeg het in het nederlands - audio`.~~ **Fixed 2026-09-08.**
   `25 - professor Oort, de sterrenkundige.mp3` had been added twice from the same Drive file; the later row
   was deleted. The notebook now holds 58 sources, and audio and text pair by name on every episode.
3. **The exam video tasks exist as text only.** Each `exam - … - transcript` notebook holds about ten more
   files than its audio notebook — the DUO video tasks, such as *Een video over de burgemeester van Zeist*.
   The video itself is not on the shelf.
4. **`turkish - 30 gunde hollandaca` has no transcripts, on purpose.** The transcription run of 2026-09-07
   covered 644 files and 69.4 hours with no failures, and
   [`LISTENING-INVENTORY.md`](./LISTENING-INVENTORY.md) records this body as deliberately excluded: the files
   are word drills with no spoken topic. The same note marks the Goethe `book2` transcripts **unreliable**,
   because those clips alternate Turkish and Dutch and recognition mangles Dutch inside Turkish speech. Treat
   a Turkish-mediated transcript as a hint, never as a quotation.
5. **A notebook source title can lag behind a Drive rename.** On 2026-09-06 two Goethe sources and every
   30 Günde source still carried pre-rename names; by 2026-09-08 all of them matched Drive. The title does
   catch up, so a mismatch means the survey is stale, not that the file is wrong.
6. **Filenames are not a level signal.** No file is named for A2, B1 or B2, so a Session cannot read a level
   off a name. **The Level column above carries it instead**, per notebook and with its evidence — see
   *Where the level comes from*.

## What is not in the Oracle

Deliberately absent, because the repo already holds them and a file read is exact and free:

- **Taalprofielen 2015**, the curriculum spine — [`sources/`](./sources/).
- **The KNM eindtermen.**
- **The 50k frequency ranking** and **Poort & Rodd's cognate list**.

Ask the Oracle nothing that a committed file answers.
