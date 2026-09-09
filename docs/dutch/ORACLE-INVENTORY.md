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
- **A modality may carry a variant**, when one source publishes the same content twice and the difference
  matters to a Session. *Nederlands in gang* is the only case today: `audio met pauzes` holds the
  listen-and-repeat recordings, in the source's own words, so a search for the content lands on the plain
  recording and never on the one full of silence. The variant splits the transcripts the same way, which keeps
  every audio notebook paired one-to-one with a text one.

No name repeats the collection. `OracleDutch` was a prefix on all 16 notebooks until 2026-09-08; the
collection does that work, and the prefix cost 12 identical characters at the front of every tile in a grid
that truncates.

## The shelf, at a glance

29 notebooks, 1,771 sources.

| Notebook | Level | Sources | Holds |
| --- | --- | --- | --- |
| `books - library` | A0–B2 *(per book, below)* | 13 | Every course book, dictionary and word list |
| `books - nederlands in gang - audio` | **A0–A2** *(the book's own level)* | 71 | The recordings Coutinho publishes with the book |
| `books - nederlands in gang - audio met pauzes` | **A0–A2** | 36 | The same recordings with gaps for repeating |
| `books - nederlands in gang - transcript` | **A0–A2** | 71 | The 71 recordings as text |
| `books - nederlands in gang - transcript met pauzes` | **A0–A2** | 36 | The 36 repeat versions as text |
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
| `turkish - 30 gunde hollandaca` | unrated | 84 | 28 recordings, each with a Turkish **and** a Dutch transcript |
| `scratch` | — | 0 | Empty on purpose. The only notebook a Session writes to. |

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

### One book also has its audio — four notebooks

*Nederlands in gang* is the only book on the shelf whose recordings are here too, added 2026-09-09 by
[#144](https://github.com/atilileri/atilileri.github.io/issues/144). The 107 recordings and their 107 machine
transcripts sit in Drive at `Nederlands in gang - audio/`, and the four notebooks hold **references, never
copies**.

**Why four and not one.** 214 sources cannot fit under the 100-source cap. The split follows the material's own
distinction rather than a chapter range: a `met pauzes` recording is the same text read with gaps for
repeating, so it belongs beside its plain twin but must never be what a content search returns.

| Notebook | Sources | Ask it for |
| --- | --- | --- |
| `books - nederlands in gang - audio` | 71 | The dialogue, the listening text or an exercise clip, chapters 1–18 |
| `books - nederlands in gang - transcript` | 71 | The same, as exact text |
| `books - nederlands in gang - audio met pauzes` | 36 | The listen-and-repeat version, when the *pauses* are the point |
| `books - nederlands in gang - transcript met pauzes` | 36 | Rarely. Its words repeat the plain transcript |

**Search the plain notebooks first.** The `met pauzes` pair exists so the material is complete, not because a
Session usually wants it.

**The transcripts are machine-written and say so in their first line.** They come from
`tools/media/transcribe.js`, offline, at about 3.2x realtime. Accuracy on this material is good — the
recordings are scripted, studio-clean, A0–A2 speech — but a transcript is still evidence about the audio and
never the book's printed text. **For the printed text, ask `books - library`**, which holds the PDF.

**This notebook family pairs with the book.** A grammar question belongs in `books - library`; *"how does this
dialogue actually sound, and what is said in it"* belongs here.

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
- **`turkish - 30 gunde hollandaca`** — 28 tracks, `30 Günde Hollandaca - Bölüm 01.mp3` upward, each with
  **two** transcripts: `.tr.txt` and `.nl.txt`. The content is drills — chapter 1 is the alphabet read aloud,
  chapter 20 is a noun list — so ask it for vocabulary, never for explanation.

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

**Two Drive routes exist and they behave differently.** Telling them apart matters, because one of them
carries audio and the other refuses it.

- **`source add-drive` adds a Drive file by reference, and it carries audio.** Measured 2026-09-08: an mp3
  from `dutch-listening/echt-gebeurd` went in, reached `ready`, and a search returned verbatim Dutch from the
  episode. The command demands a declared `--mime-type`, whose only non-native choice is `pdf`, **so an mp3
  goes in labelled as a PDF and the server ignores the label** — the stored type comes back as
  `google_drive`. Every audio source already on this shelf has that type, so this is the route that loaded the
  whole corpus.
- **`source add-drive-file` downloads and re-uploads, and it is the route to avoid.** It refuses audio by
  type, naming its own set — *"Accepted: csv, docx, epub, markdown, md, pdf, pptx, txt"* — and then **fails on
  a `.txt` as well**, which is in that list: it copies the file under a temporary name such as
  `nlm-drive-dblluc9x.txt` and the source lands at `error`. Measured on two transcripts, 2026-09-09. Use
  `source add-drive` for text too.
- **A local upload works for anything** — `source add <file> --type file`. Both lesson recordings went in this
  way on 2026-09-08, before the reference route was measured, and 56 transcripts followed on 2026-09-09. **It
  stores a copy, not a pointer**, and the copy shows up as type `pasted_text` rather than `google_drive` —
  which is how those 56 were found and converted to references. Keep it as the fallback, never the default.

**Prefer the reference route.** It uploads nothing, so Drive stays the master as
[`MATERIAL.md`](./MATERIAL.md) requires, and the notebook holds a pointer rather than a copy. Its cost is that
it rests on undeclared behaviour of an unofficial client — see
[adr/0009](./adr/0009-the-shelf-rests-on-an-unofficial-client.md).

**Every source on this shelf is a reference.** Measured 2026-09-09 across all 29 notebooks: **1,771 sources,
1,771 references, no copies and none in an error state.** It was not always so — 647 sources were uploaded
copies, and `tools/dutch/oracle-refs.mjs` converted them, adding the reference and confirming it `ready`
before deleting each copy. **Keep it that way**: a copy stores the same bytes twice and hides a file from the
Drive folder that is supposed to be the master. Check with `source list --json` and read `drive_document_id` —
a copy has none.

### Five traps in the reference route

All five were met on 2026-09-08 and 2026-09-09, and each one cost a wrong conclusion before it was understood.

1. **Drive fixes a file's mime type at upload and never revises it on rename.** A file uploaded as
   `<name>.mp3.part` and then renamed is stored for ever as `application/x-partial-download`, and Gemini
   Notebook refuses to import it — *"API returned no data for Drive source"*. So an atomic upload must keep the
   extension and vary the **stem**: `.uploading-<name>.mp3`. Check a file with
   `rclone lsjson` and expect `audio/mpeg` or `text/plain`.
2. **The client reports a failure when the add succeeded.** Every `add-drive` in that session printed
   *"RPC ADD_SOURCE failed after 30s, retries exhausted"* and the source landed anyway. Reading the error as
   truth and retrying created a duplicate. **Verify by listing sources, never by exit status.**
3. **A failed add can leave a source stuck in `error` state**, which still counts against the 100-source cap.
   List with `--status error` and delete what you find.
4. **A notebook at the 100-source cap cannot be converted in the safe order.** Replacing a copy with a
   reference normally means *add, confirm, then delete*, which needs a 101st slot — so at the cap the add
   quietly does nothing and the copy stays. Freeing one slot buys nothing either, because such a notebook
   **ends** at the cap too. Every file there needs the order inverted: **delete the copy, then add the
   reference**, which is what `tools/dutch/oracle-refs.mjs --capped` does. Confirm the file is in Drive first,
   so a failure costs the notebook's link and never the material.
5. **One `add-drive` call can create more than one source.** The client retries internally, so a retry can land
   even when the caller made a single call. Measured 2026-09-09 on
   [#144](https://github.com/atilileri/atilileri.github.io/issues/144): 71 audio files produced **100** sources
   — the cap — and 36 produced **72**, every extra one a second row carrying the same `drive_document_id`. So
   **verify a run by de-duplicating on `drive_document_id`, never by counting sources**, and clean up by
   deleting the later row until each Drive file appears exactly once. This is trap 2 from the other side: the
   client's report of what it did is evidence in neither direction.

### The title is not yours to choose

**Gemini Notebook rewrites a source title**, spacing out hyphens: `les 2026-09-07.mp3` is stored as
`les 2026 - 09 - 07.mp3`. That is where every spaced-dash title on this shelf comes from — `afl - 550 - een -
nieuwe - taal …` was never typed that way. A caller cannot prevent it, so **match a title to a Drive filename
loosely**: lower-case it, collapse runs of spaces, hyphens and underscores into one separator, and compare the
extension exactly, so an episode's mp3 never matches its own transcript.

### Adding a lesson recording, step by step

A video still needs converting, because the 200 MB source limit rejects an hour of video and no route accepts
`video/mp4` at all.

1. `rclone copy` the `.mp4` to a scratch directory.
2. `ffmpeg -vn -ac 1 -ar 16000 -b:a 32k` — an hour becomes about **14 MB**, and takes about 6 seconds.
3. `rclone copyto` the mp3 to `.uploading-<name>.mp3` in `NT2 Taaldiensten`, then `rclone moveto` it to its
   final name. Trap 1 explains the two steps.
4. `notebooklm source add-drive <file-id> "<title>" -n <id> --mime-type pdf`.
5. **List the notebook's sources** and find the one carrying that `drive_document_id`. Trap 2 explains why the
   command's own answer is not enough.
6. `notebooklm source wait <source-id> -n <id>` until the status is `ready`.

[#143](https://github.com/atilileri/atilileri.github.io/issues/143) turns this into a script.

The video track carries the slides, and this route drops it. The slides folder in Drive
(`A0>A2/Ders slaytlari`) is empty today, and #143 rules it **out of scope** until it fills.

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
4. **Turkish-mediated transcripts come in two passes, and neither is exact.** Recognition sets one language
   per run, so a recording that alternates Turkish and Dutch mangles whichever half it was not told to expect.
   `30 Günde Hollandaca` was transcribed twice on 2026-09-09 for that reason — 56 passes, 3.15 hours of audio,
   no failures — and the two passes disagree usefully: chapter 20 gives `ziekenhuis` and `Zij is niet jong` in
   the Dutch pass against `Ziktenhuis` and `Zij es niet jong` in the Turkish one. **Read the pass that matches
   the language you want**, and treat either as a hint, never as a quotation. The Goethe `book2` transcripts
   carry the same flaw and are marked unreliable in
   [`LISTENING-INVENTORY.md`](./LISTENING-INVENTORY.md).
5. **A notebook source title can lag behind a Drive rename.** On 2026-09-06 two Goethe sources and every
   30 Günde source still carried pre-rename names; by 2026-09-08 all of them matched Drive. The title does
   catch up, so a mismatch means the survey is stale, not that the file is wrong.
6. **Filenames are not a level signal.** No file is named for A2, B1 or B2. The Level column above is a rough
   guide, and only the `(CvTE)` rows are certain — Programma I *is* B1 and Programma II *is* B2, by the exam
   board's definition. A notebook can hold mixed levels, so when the level of a specific file matters, Docent
   asks the Oracle and judges the answer.

## What is not in the Oracle

Deliberately absent, because the repo already holds them and a file read is exact and free:

- **Taalprofielen 2015**, the curriculum spine — [`sources/`](./sources/).
- **The KNM eindtermen.**
- **The 50k frequency ranking** and **Poort & Rodd's cognate list**.

Ask the Oracle nothing that a committed file answers.
