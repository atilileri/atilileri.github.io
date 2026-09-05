# Source material: where it lives

Every piece of Dutch source material this journey uses has exactly one home. This file is the index of those
homes and the provenance of the files kept in the repo.
Decided by [#89](https://github.com/atilileri/atilileri.github.io/issues/89); constrained by
[#94](https://github.com/atilileri/atilileri.github.io/issues/94), which put third-party licence compliance
outside the agent's scope. **This file records locations and provenance. It is not a licence register.**

The audio corpus has its own inventory: [`LISTENING-INVENTORY.md`](./LISTENING-INVENTORY.md).

## The four homes

Material lives in one of four places. Nothing lives in two.

1. **This repo, at [`docs/dutch/sources/`](./sources/).** Small, structured, stable, and read by the agent.
   Everything here is committed and public.
2. **The user's Google Drive.** Large media, and anything the repo should not carry — the listening corpus of
   [#96](https://github.com/atilileri/atilileri.github.io/issues/96), plus whatever
   [#133](https://github.com/atilileri/atilileri.github.io/issues/133) finds. Whether the agent may read that
   folder is [#130](https://github.com/atilileri/atilileri.github.io/issues/130)'s decision.
3. **The Oracle** ([#134](https://github.com/atilileri/atilileri.github.io/issues/134)). The textbooks and their
   scans. The agent asks the Oracle a question and gets an answer; it never copies the book.
4. **The live web.** Material that stays at its URL and is fetched when a Session needs it. Nothing is mirrored.

**There is no fifth home inside the repo.** A file in this repo is committed, or it is not in this repo. The
journey adds no gitignored directory of material, because a gitignored blob is a private file that looks
public, and the publicness lock forbids that ambiguity. The private staging directory
`/home/neo/private/dutch-*` sits outside the repo and outside git.

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
finding for the DUO practice exams. Reaching either one needs a browser, which is
[#130](https://github.com/atilileri/atilileri.github.io/issues/130)'s and
[#135](https://github.com/atilileri/atilileri.github.io/issues/135)'s decision to make.
