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

25 notebooks, 1,500 sources.

| Notebook | Sources | Holds |
| --- | --- | --- |
| `books - library` | 13 | Every course book, dictionary and word list |
| `course - nt2 taaldiensten` | 2 | Recordings of a live NT2 course, taught in Turkish |
| `exam - 2023 I` | 66 | NT2 Programma I, 2023 — papers and listening audio |
| `exam - 2023 I - transcript` | 68 | The same year as text |
| `exam - 2023 II` | 65 | NT2 Programma II, 2023 |
| `exam - 2023 II - transcript` | 65 | |
| `exam - 2024 I` | 66 | NT2 Programma I, 2024 |
| `exam - 2024 I - transcript` | 67 | |
| `exam - 2024 II` | 61 | NT2 Programma II, 2024 |
| `exam - 2024 II - transcript` | 62 | |
| `exam - 2025 I` | 68 | NT2 Programma I, 2025 |
| `exam - 2025 I - transcript` | 68 | |
| `exam - 2025 II` | 63 | NT2 Programma II, 2025 |
| `exam - 2025 II - transcript` | 64 | |
| `listening - een beetje nederlands - audio` | 91 | Slow, scripted Dutch history and culture |
| `listening - een beetje nederlands - transcript` | 92 | The published human transcripts |
| `listening - zeg het in het nederlands - audio` | 59 | Holds one duplicate — see *Known gaps* |
| `listening - zeg het in het nederlands - transcript` | 58 | |
| `listening - nos jeugdjournaal` | 80 | 40 recordings **and** their 40 transcripts |
| `listening - echt gebeurd` | 60 | 30 recordings and their 30 transcripts |
| `listening - librivox` | 36 | 18 recordings and their 18 transcripts |
| `turkish - goethe book2 - audio` | 98 | A Turkish–Dutch audio course |
| `turkish - goethe book2 - transcript` | 100 | **Full.** |
| `turkish - 30 gunde hollandaca` | 28 | *30 Günde Hollandaca*, audio only |
| `scratch` | 0 | Empty on purpose. The only notebook a Session writes to. |

**Google transcribes audio itself.** Measured 2026-09-06 and again 2026-09-08: a question to an audio notebook
returns verbatim speech with the source file named. So every audio notebook is a searchable corpus, whether or
not a separate transcript notebook exists.

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
| `zeg het in het nederlands - audio` | episodes 1–58 | One episode is stored twice — see *Known gaps* |
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

A Drive video does not go in directly, and **no audio file does either**. `source add-drive-file` accepts only
`csv, docx, epub, markdown, md, pdf, pptx, txt`, so every mp3 on this shelf arrived through the web interface
or as a local upload. The 200 MB source limit also rejects an hour of video. The route that works, measured on
both recordings:

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
   gives no reason. **Add these two through the web interface**, where every other file in that notebook came
   from. The lessons are still searchable as text.
2. **`listening - zeg het in het nederlands - audio` holds a duplicate.**
   `25 - professor Oort, de sterrenkundige.mp3` appears twice, which is why the notebook shows 59 sources for
   58 episodes. Audio and text pair by name on every episode.
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
6. **Filenames are not a level signal.** No file is named for A2, B1 or B2, so a Session cannot read the level
   off a name. Level comes from the exam notebooks, or from the learner.

## What is not in the Oracle

Deliberately absent, because the repo already holds them and a file read is exact and free:

- **Taalprofielen 2015**, the curriculum spine — [`sources/`](./sources/).
- **The KNM eindtermen.**
- **The 50k frequency ranking** and **Poort & Rodd's cognate list**.

Ask the Oracle nothing that a committed file answers.
