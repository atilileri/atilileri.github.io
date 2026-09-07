# Oracle inventory

What each notebook in the Oracle holds, so a Session knows where to ask before it asks.
Surveyed 2026-09-06 by [#134](https://github.com/atilileri/atilileri.github.io/issues/134).
**This file records facts, not choices.** What the Oracle *is* and what Docent may do with it is
[`ORACLE.md`](./ORACLE.md). Where material lives is [`MATERIAL.md`](./MATERIAL.md).

## How to reach it

The client is `notebooklm-py`, installed with `uv tool install "notebooklm-py[browser,headless]"`. Its durable
credential sits at `~/.notebooklm/profiles/default/storage_state.json` — a
**Machine credential** under [`AUTOMATION.md`](./AUTOMATION.md), never committed.

Three rules bind every call:

- **Filter on the `OracleDutch` prefix.** The account holds 27 notebooks; only 16 belong to this journey.
- **Address with `-n <id>`, never `notebooklm use`.** The context command is stateful, so two Sessions would
  collide on it.
- **Pass `--quiet`.** Without it the CLI prints a `Matched: …` banner to stdout and breaks JSON parsing.

## Account limits

| Limit | Value | Consequence |
| --- | --- | --- |
| Sources per notebook | **100** | A source family splits across notebooks. `OracleDutchTRNL` is **full**. |
| Size per source | **200 MB** | The Van Dale picture dictionary is split into three parts. |

## The shelf, at a glance

| Notebook | Family | Sources | Holds |
| --- | --- | --- | --- |
| `OracleDutchPDF` | books | 13 | Every course book, dictionary and word list |
| `OracleDutch-exam-2023-1` | exams | 66 | NT2 Programma I, 2023 — four skills |
| `OracleDutch-exam-2023-2` | exams | 65 | NT2 Programma II, 2023 |
| `OracleDutch-exam-2024-1` | exams | 66 | NT2 Programma I, 2024 |
| `OracleDutch-exam-2024-2` | exams | 61 | NT2 Programma II, 2024 |
| `OracleDutch-exam-2025-1` | exams | 67 | NT2 Programma I, 2025 |
| `OracleDutch-exam-2025-2` | exams | 63 | NT2 Programma II, 2025 |
| `OracleDutch-eenbeetjenederlands-voice` | listening | 91 | Een Beetje Nederlands, the audio |
| `OracleDutch-eenbeetjenederlands-transcript` | listening | 88 | Een Beetje Nederlands, the human transcripts |
| `OracleDutch-zeg-het-in-het-nederlands` | listening | 58 | Zeg het in het Nederlands, the audio |
| `OracleDutch-nos-jeugdjournaal` | listening | 40 | NOS Jeugdjournaal, the audio |
| `OracleDutch-echt-gebeurd` | listening | 30 | Echt Gebeurd, the audio |
| `OracleDutch-librivox-nl` | listening | 18 | Two public-domain audiobooks |
| `OracleDutchTRNL` | Turkish | 100 | A Turkish–Dutch audio course, complete and **full** |
| `OracleDutch30gunde` | Turkish | 28 | *30 Günde Hollandaca*, a Turkish audio course |
| `OracleDutch-scratch` | scratch | 0 | Empty on purpose. The only notebook a Session writes to. |

**Google transcribes the audio itself.** Measured on 2026-09-06: a question to
`OracleDutch-nos-jeugdjournaal` returned verbatim Dutch speech with the source file named. So every audio
notebook is a searchable Dutch corpus, not a shelf of opaque files.

## The books — `OracleDutchPDF`

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

Three of these are Turkish-mediated, which matters under the Turkish-first lock
([adr/0002](./adr/0002-turkish-prose-quoted-english.md)): a Turkish explanation of a Dutch rule already exists
and does not need inventing.

## The exams — six notebooks

Each notebook is **one year, one Programma**: `-1` is Programma I (B1, the `exam` Tier) and `-2` is
Programma II (B2, the `stretch` Tier). Years 2023, 2024 and 2025.

Each holds, for all four skills (Lezen, Luisteren, Schrijven, Spreken):

- an **opgavenboekje** — the task booklet, the questions as the candidate sees them;
- a **beoordelingsmodel** — the marking model, which is the answer key **and the scoring rules**;
- the **Luisteren audio**, 53 to 60 mp3 tracks per notebook.

Naming differs by year, so match loosely, never exactly:

- **2023** names the audio by content — `2023 Luisteren I - 02 - Een gesprek met een autoverkoper - introductie.mp3`.
- **2024 and 2025** name it by position — `Track 9_opgave 7.mp3`, with spacing that varies between files.

**One gap.** `OracleDutch-exam-2025-1` holds 7 PDFs, not 8: the *Luisteren I opgavenboekje* is missing, so
that year has the marking model for listening but not the task booklet. Every other exam notebook is complete.

## The listening corpus — six notebooks

| Notebook | Range | Note |
| --- | --- | --- |
| `-eenbeetjenederlands-voice` | trailer, episodes 1–90 | Slow, scripted Dutch history and culture |
| `-eenbeetjenederlands-transcript` | 88 `.txt` files | **The same podcast as text.** Exact, published, free to search |
| `-zeg-het-in-het-nederlands` | episodes 1–58 | Two naming schemes coexist: `34 - zeg - het …` and `zeg - het … - 33` |
| `-nos-jeugdjournaal` | 2025-05-28 → 2026-08-26 | Dated news for children. The best level fit found for B1 |
| `-echt-gebeurd` | afleveringen 550–579 | Native storytelling, unscripted, hardest of the five |
| `-librivox-nl` | `alibaba` (chapters), `trom2` (chapters) | Two public-domain audiobooks, the only committable licence |

**Een Beetje Nederlands is split by modality, not by the source cap.** Ask `-transcript` when the exact
wording matters; ask `-voice` when the audio itself matters. They are the same 90-odd episodes.

## The Turkish-mediated audio — two notebooks

- **`OracleDutchTRNL`** — 100 lessons, numbered 001–100 with no gaps and no duplicates, titled in Turkish by
  topic (`TRNL 003 - Tanımak, öğrenmek, anlamak.mp3`). **This notebook is at the 100-source cap.** A new file
  needs a second notebook.
- **`OracleDutch30gunde`** — 28 tracks of *30 Günde Hollandaca*, still under their raw filenames
  (`30gundehollandaca (14).mp3`), so a title says nothing about the lesson. Ask by content, never by name.

## Known drift

Three things a Session should expect, none of them errors.

1. **A notebook source title does not follow a Drive rename.** The title is a snapshot taken when the source
   was added. Two `OracleDutchTRNL` sources still carry pre-rename names, `TRNL007.mp3` and `TRNL011.mp3`,
   while the other 98 carry the [#139](https://github.com/atilileri/atilileri.github.io/issues/139) names.
2. **Some titles carry mojibake** from the upload — `11 - marga - klomp├⌐.mp3` is Marga Klompé. Match on the
   number, not the accented word.
3. **Filenames are not a level signal.** Nothing in a title states A2, B1 or B2. Level comes from the exam
   notebooks or from the human, never from a name.

## What is not in the Oracle

Deliberately absent, because the repo already holds them and a file read is exact and free:

- **Taalprofielen 2015**, the curriculum spine — [`sources/`](./sources/).
- **The KNM eindtermen.**
- **The 50k frequency ranking** and **Poort & Rodd's cognate list**.

Ask the Oracle nothing that a committed file answers.
