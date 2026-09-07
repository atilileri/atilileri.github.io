# Listening material inventory

What Dutch listening material exists, what was landed, and what only a human can get.
Produced by [#96](https://github.com/atilileri/atilileri.github.io/issues/96). **This file records facts, not choices.**
[#97](https://github.com/atilileri/atilileri.github.io/issues/97) selects the sources; [#94](https://github.com/atilileri/atilileri.github.io/issues/94) rules on licences; [#89](https://github.com/atilileri/atilileri.github.io/issues/89) decides where material lives in the repo.

## Where the files are

**The audio now lives in the user's Google Drive, and nowhere else on this machine.** It was landed to
`/home/neo/private/dutch-listening/`, uploaded on 2026-09-05, and the local copy was then deleted at the user's
instruction. Nothing was ever committed to this repo. Every downloaded source is copyrighted except the LibriVox
recordings. [#89](https://github.com/atilileri/atilileri.github.io/issues/89) has since fixed the homes and the pointer
convention in [`MATERIAL.md`](./MATERIAL.md): Drive is one of the four homes, and audio stays there.

The tree that went up: one directory per source, each holding `feed.rss`, an `episodes.json` index and `audio/`.

**Every source was flattened on 2026-09-06**, at the user's instruction, because the files are sources in his
NotebookLM notebooks. The `audio/` folders are gone, and each episode now sits in its source folder beside its
transcript, which shares the episode's name — the naming rule in [`MATERIAL.md`](./MATERIAL.md). Two details:
`eenbeetjenederlands/` also lost `transcript/`, so its 87 human transcripts moved up to sit beside their
episodes; and `librivox-nl/` keeps a folder per book, because each book carries its own `metadata.json`.
**A machine transcript takes the plain `.txt`, except in `eenbeetjenederlands/`, where a human transcript
already owns that name — there it is `<episode>.asr.txt`.**

**Every Drive file id survived unchanged.** The moves were server-side, and the ids were snapshotted first and
compared afterwards: 178 of 178 for Een Beetje Nederlands, 148 of 148 for the other four sources, none lost.
The snapshots are `/home/neo/private/eenbeetje-ids-before.tsv` and `dl-before.json`.

The Drive copy is now the only copy of the **87 transcripts**. The
audio itself is re-fetchable — every podcast from its feed, both LibriVox titles from the Internet Archive — so a lost
Drive folder costs time, not material. The agent **may read that Drive folder**, and may write to it behind a human
confirmation — [#130](https://github.com/atilileri/atilileri.github.io/issues/130), recorded in
[`AUTOMATION.md`](./AUTOMATION.md); the folder's contents are on
[#133](https://github.com/atilileri/atilileri.github.io/issues/133)'s list.

**Every source now has a transcript, and the run that made them is finished.** On 2026-09-07 the agent
transcribed **644 files, 69.4 hours of audio, with no failures**, locally and offline, and wrote one text file
beside each audio file. That covers every source in the table below and all 394 DUO exam clips. Two bodies were
left out on purpose: `30 Günde Hollandaca`, whose files are word drills with no spoken topic, and the NT2
Taaldiensten class recordings, which show identifiable people. **The Goethe `book2` transcripts are marked
unreliable** — those clips alternate Turkish and Dutch, and recognition mangles Dutch embedded in Turkish
speech; their header records `language=auto`.

**The "Transcript" column below no longer says what the agent can read.** Since 2026-09-05 the agent transcribes
Dutch speech locally, at **96.1% word accuracy against a human transcript** and about **4x realtime** — so every
hour in this table is readable, published transcript or not, and so are the 306 exam listening clips in
`DUO oefenexamens NT2/`. The column still matters, because a published transcript is exact, free and already written;
a generated one costs CPU time and drifts on names. See [`READING-MATERIAL.md`](./READING-MATERIAL.md) for the
measured limits. What a Session should reach for stays with
[#97](https://github.com/atilileri/atilileri.github.io/issues/97).

## Landed by the agent

| Source | Folder | Items | Audio | Size | Level | Transcript | Licence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [Een Beetje Nederlands](https://www.eenbeetjenederlands.nl/) | `eenbeetjenederlands/` | 91 of 91 (whole feed) | 19.6 h | 2.25 GB | Self-declared B1/B2 | **Yes — 87 free full transcripts**, median 1,534 words | © the podcast. Feed and transcripts are public and free; `robots.txt` allows everything |
| [Zeg het in het Nederlands](https://dutchidiom.com/shownotes-zeg-het-in-het-nederlands/) | `zeg-het-in-het-nederlands/` | 58 of 58 (whole feed) | 29.9 h | 1.72 GB | Self-declared "slow Dutch", reviewers say A2–B1 | No — PDF transcripts are **sold**, episodes 1–40 only | © the podcast. Audio free via SoundCloud feed |
| [NOS Jeugdjournaal podcast](https://podcast.npo.nl/feed/nos-jeugdjournaal.xml) | `nos-jeugdjournaal/` | 40 newest of 172 | 13.9 h | 1.23 GB | Native, written for children | No | © NOS/NPO. `podcast.npo.nl/robots.txt` is `Disallow:` — everything allowed |
| [Echt Gebeurd](https://www.omnycontent.com/d/playlist/61ee9ca4-a1b2-4660-9651-b2b70035edf5/0c13f220-bf12-49ed-9d47-b2f100f7c60c/c39fca6c-3f36-4b12-a7e8-b2f100f7c61a/podcast.rss) | `echt-gebeurd/` | 30 newest of 579 | 5.8 h | 0.39 GB | Native, unscripted, many accents | No | © the podcast. `omnycontent.com/robots.txt` is `Allow: /` |
| [LibriVox Dutch](https://archive.org/) | `librivox-nl/` | 2 of 210 titles landed | ~5 h | 0.18 GB | Native, literary, pre-1930 language | The Project Gutenberg e-text is the transcript | **Public domain** (`creativecommons.org/licenses/publicdomain/`) |

**Total landed: 237 audio files (219 podcast episodes plus 18 audiobook chapters), about 74 hours, 5.4 GB.**

The two LibriVox titles are *De zoon van Dik Trom* and *Ali Baba en de veertig roovers*, both children's books.
`librivox-nl/catalogue-210-titles.json` holds the full catalogue: **210 Dutch titles, 361 GB**, each fetchable with one command.

### How to read `episodes.json`

One record per episode: `title`, `link`, `date`, `dur`, `url` (the original enclosure), `audio` (the local file),
`bytes`, and for Een Beetje Nederlands `transcript` and `transcript_words`.

## Left for the user

Ordered by what each one is worth.

1. **Corpus Gesproken Nederlands (CGN)** — [taalmaterialen.ivdnt.org](https://taalmaterialen.ivdnt.org/download/tstc-corpus-gesproken-nederlands/).
   **900 hours of spoken standard Dutch with full transcriptions and annotations**, from the Dutch Language Institute.
   Free, but a human must sign a licence agreement and log in. Nothing else on this list comes close for volume of
   transcribed native speech.
2. **DUO official A2 listening practice exams** — [inburgeren.nl/examen-doen/oefenen.jsp](https://www.inburgeren.nl/examen-doen/oefenen.jsp).
   Three listening exams, free, **browser-only**. They run inside `oefenexamensduo.optimumassessment.com`, a JavaScript
   app with no download and no API this ticket could find (three guessed endpoints returned 404). The audio cannot be
   landed; the exams can be sat online.
3. **Staatsexamen NT2 B1/B2 practice environment** — [nt2-oefenomgeving.facet.onl](https://nt2-oefenomgeving.facet.onl/facet-openbaar-portaal/)
   and [oefenexamensnt2.nl](https://oefenexamensnt2.nl). The official practice exams at **the target level**. Also a
   JavaScript app, also browser-only. `staatsexamensnt2.nl` lists no downloadable files at all.
4. **NOS Journaal in Makkelijke Taal** — [npo.nl/start/serie/nos-journaal-in-makkelijke-taal](https://npo.nl/start/serie/nos-journaal-in-makkelijke-taal/afleveringen).
   A daily 10-minute news bulletin in deliberately simple Dutch, three subjects, slow pace, hard words explained. It is
   the single best level fit found. **Video on NPO Start only** — an account and a Dutch IP address; there is no podcast
   feed (`podcast.npo.nl/feed/nos-journaal-in-makkelijke-taal.xml` returns 404).
5. **Zeg het in het Nederlands transcript PDFs** — [dutchidiom.com](https://dutchidiom.com/shownotes-zeg-het-in-het-nederlands/).
   Sold through Payloadz, episodes 1–40, in sets of ten. Price not shown on the public page. This would give 58 landed
   episodes a text pair.
6. **Een Beetje Nederlands "Vriend van de Podcast"** — [petjeaf.com](https://www.eenbeetjenederlands.nl/).
   A few euro a month. Adds bonus episodes plus **PDF exercise material** — word lists, a vocabulary quiz, a puzzle and
   an assignment per episode. The plain transcripts are already landed; this buys the exercises.
7. **Graded readers with audio** — Intertaal's *Amsteldijk* and *Hoogspanning* series, and Eenvoudig Communiceren's
   *Leeslicht*. Commercial, ISBN per title. #77 already carries the reading shopping list; only the audio editions are new here.
8. **YouTube learner channels** — [Bart de Pau](https://www.youtube.com/user/1000DutchWords) (free 40-lesson
   *1000 most common words* course), [Dutchies to be / Learn Dutch with Kim](https://www.youtube.com/@learndutchwithkim)
   (A0–B1, taught in Dutch). Watchable now, **not downloaded**: #129 measured that YouTube's `robots.txt` disallows the
   paths any transcript or media tool uses. If the user wants these as files, they must export them.

## Open corpora — found, judged, not landed

- **Mozilla Common Voice, Dutch** — **CC0**, so it may be committed. `cv-corpus-9.0` holds 99.2 validated hours,
  90,204 clips, 2.68 GB. Every clip is **one read sentence averaging 4.3 seconds**, so it can feed pronunciation but
  never an exam-length listening task. Manifests live at [common-voice/cv-dataset](https://github.com/common-voice/cv-dataset).
- **Wikimedia Commons, `Category:Dutch pronunciation`** — **875,832 audio files**, one spoken word each, CC-licensed,
  reachable through the MediaWiki API with no key. Worthless for listening comprehension, **strong for per-Item word
  audio** in the `recognition` direction, and it may answer the map's open "pronunciation correctness" question with
  recorded human speech instead of synthesis.
- **VoxForge Dutch** — GPL, exists, tiny and dated. Recorded only so nobody re-treads it.

## Dead ends, so nobody re-treads them

- **Reddit is unreachable.** `r/learndutch` blocks our fetcher by name; `reddit.com/*.json` returns 403 and the domain
  is refused by the search tool. The forum half of this ticket was answered from the **Dutch Grammar Forum** and from
  three independent podcast round-ups instead. `dutchgrammar.com` itself returns 403 to a direct fetch.
- **nt2taalmenu.nl** publishes free A1/A2/B1 listening exercises, but each one is a **BookWidgets iframe**. The widget
  page is an 11 KB JavaScript shell with no media URL. Usable in a browser, not landable.
- **`podcast.npo.nl` has no feed** for *NOS Journaal in Makkelijke Taal*, *Echt Gebeurd* or *NOS op 3* — all 404.
  Echt Gebeurd is on Omny, not NPO.
- **LibriVox's own search endpoint returns an empty body**, and its API ignores a `language` filter. Dutch titles are
  found through the Internet Archive scrape API with `language:(nld)` — `Dutch` matches nothing.
- **`inburgeren.nl/robots.txt` disallows `/*.pdf$`**, which matters for the writing and KNM practice PDFs, not for listening.

## What the learners say

Three independent round-ups ([Mezzoguild](https://www.mezzoguild.com/learn/dutch/resources/podcasts/),
[DutchReview](https://dutchreview.com/expat/learn-dutch/podcasts-learn-dutch/),
[All Language Resources](https://www.alllanguageresources.com/dutch-podcasts/)) agree on a short list:

- **Een Beetje Nederlands** and **Zeg het in het Nederlands** are the two learner podcasts every list names, and the
  only two praised **for their transcripts**. Both are landed.
- **Echt Gebeurd** is the most-recommended *native* podcast, valued because ordinary people tell their own stories, so
  the learner hears real accents rather than a presenter voice. Every list calls it intermediate-to-advanced.
- Named repeatedly, none landed, all native and advanced: *De Dag*, *De Universiteit van Nederland*,
  *Yous & Yay*, *De Man Met de Microfoon*, *SBS Dutch* (Australian, Dutch-language), *Op Z'n Vlaams* and *DS Vandaag*
  (both Flemish).
- **DutchPod101** appears on every list and is **paid past the first episodes**. No reviewer recommends it over the free two.
- One forum finding worth keeping: a learner warns that LibriVox Dutch is **"old-fashioned"**, which the 1900s
  publication dates confirm.
