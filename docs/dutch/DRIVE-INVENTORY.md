# Drive inventory: every Dutch file in `atili/Dutch`

What the user holds in Google Drive, file by file, read with `rclone` rather than typed by hand.
**This file records facts, not choices.** [`MATERIAL.md`](./MATERIAL.md) says where material lives and how its
files are named; [`LISTENING-INVENTORY.md`](./LISTENING-INVENTORY.md) covers the podcast corpus in depth;
[`READING-MATERIAL.md`](./READING-MATERIAL.md) says how the agent reads any of it;
[#94](https://github.com/atilileri/atilileri.github.io/issues/94) rules on licences.

**Read on 2026-09-05, and `dutch-listening/` re-read on 2026-09-06.** A scan of the whole Drive — 22,728
directories — found Dutch material in exactly one place, `atili/Dutch`, and nowhere else. Nothing here is
committed to this repo, and most of it never can be.

**Two changes on 2026-09-06 that this file only partly reflects.** First, **`dutch-listening/` was flattened**
at the user's instruction: every source's `audio/` folder is gone and its files sit in the source folder, so a
transcript can sit beside its audio. `librivox-nl/` keeps a folder per book, because two books cannot share one
`metadata.json`. The moves were server-side, so **every Drive file id survived unchanged** — 178 ids for Een
Beetje Nederlands and 148 for the other sources, all verified against a snapshot taken first. Second, a
**machine transcription run is in progress**: it writes one `.txt` beside each audio file it reads, and it will
add about 640 of them. The `dutch-listening/` listing below was regenerated after the flattening; the
`DUO oefenexamens NT2/` sections were not, so they do not yet list the transcripts already landing there.
**Regenerate the whole file once the run finishes.**

**Totals: 1,282 files, 8.6 GiB, in 31 folders**, plus the index at the top of the folder that repeats the
naming convention for anyone browsing Drive.

| Extension | Files |
| --- | --- |
| `.mp3` | 706 |
| `.opus` | 306 |
| `.txt` | 87 |
| `.pdf` | 62 |
| `.mp4` | 54 |
| `.webm` | 53 |
| `.json` | 7 |
| `.rss` | 4 |
| `.djvu`, `.md` | 1 each |

## The four bodies of material

**1. The DUO practice exams — `DUO oefenexamens NT2/`, 801 files, 1.04 GiB.** The complete published *openbaar
examen* set for **2023, 2024 and 2025**, both programmes, all four skills. Each year and skill has an
`opgavenboekje` (the questions) and a `beoordelingsmodel` (the marking scheme) — **48 PDFs** — and the
Luisteren and Spreken papers keep their media in an `audio/` folder beside them.

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

**3. The listening corpus — `dutch-listening/`, 336 audio and text files, 5.38 GiB, plus the machine
transcripts now arriving.** Landed by
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

## Every file

Sizes as read on 2026-09-05, after the rename. Folders are listed by depth, then alphabetically.

**`atili/Dutch/`** — 13 files, 639.3 MB

- `00 README - what is here and how files are named.md` — 4 KB
- `Adım Adım Hollandaca (Ferhad Yıldız).pdf` — 551 KB
- `Basiscursus 1 - woordenlijst Nederlands-Turks (Boom, 2013).pdf` — 159 KB
- `Dutch For Dummies (Wiley).pdf` — 2.9 MB
- `Dutch Short Stories for Beginners.pdf` — 8.9 MB
- `Nederlands in actie - methode voor hoogopgeleide anderstaligen (Coutinho).pdf` — 24.2 MB
- `Nederlands in gang - A0-A2 (Coutinho, 2017).pdf` — 11.2 MB
- `Nederlands op niveau - B1-B2 (Coutinho).pdf` — 11.8 MB
- `Survival Dutch (Dutch Academy Eindhoven).pdf` — 2.2 MB
- `Teach Yourself Dutch (Quist & Strik).pdf` — 60.6 MB
- `Van Dale Groot Beeldwoordenboek NL-EN-FR-DE.djvu` — 48.6 MB
- `Van Dale Groot Beeldwoordenboek NL-EN-FR-DE.pdf` — 468.1 MB
- `Van Start - woordenlijst Nederlands-Turks (Boom, 2019).pdf` — 89 KB

**`atili/Dutch/30 Günde Hollandaca/`** — 28 files, 433.3 MB

- `30 Günde Hollandaca - Bölüm 01.mp3` — 6.8 MB
- `30 Günde Hollandaca - Bölüm 02.mp3` — 10.9 MB
- `30 Günde Hollandaca - Bölüm 03.mp3` — 12.6 MB
- `30 Günde Hollandaca - Bölüm 04.mp3` — 13.2 MB
- `30 Günde Hollandaca - Bölüm 05.mp3` — 12.3 MB
- `30 Günde Hollandaca - Bölüm 06.mp3` — 25.7 MB
- `30 Günde Hollandaca - Bölüm 07.mp3` — 28.7 MB
- `30 Günde Hollandaca - Bölüm 08.mp3` — 16.6 MB
- `30 Günde Hollandaca - Bölüm 09.mp3` — 24.3 MB
- `30 Günde Hollandaca - Bölüm 10.mp3` — 17.9 MB
- `30 Günde Hollandaca - Bölüm 11.mp3` — 9.4 MB
- `30 Günde Hollandaca - Bölüm 12.mp3` — 12.4 MB
- `30 Günde Hollandaca - Bölüm 13.mp3` — 14.6 MB
- `30 Günde Hollandaca - Bölüm 14.mp3` — 20.8 MB
- `30 Günde Hollandaca - Bölüm 16.mp3` — 9.5 MB
- `30 Günde Hollandaca - Bölüm 17.mp3` — 10.6 MB
- `30 Günde Hollandaca - Bölüm 18.mp3` — 11.4 MB
- `30 Günde Hollandaca - Bölüm 19.mp3` — 16.4 MB
- `30 Günde Hollandaca - Bölüm 20.mp3` — 7.4 MB
- `30 Günde Hollandaca - Bölüm 21.mp3` — 17.8 MB
- `30 Günde Hollandaca - Bölüm 22.mp3` — 21.8 MB
- `30 Günde Hollandaca - Bölüm 23.mp3` — 20.7 MB
- `30 Günde Hollandaca - Bölüm 24.mp3` — 17.2 MB
- `30 Günde Hollandaca - Bölüm 25.mp3` — 10.5 MB
- `30 Günde Hollandaca - Bölüm 26.mp3` — 16.3 MB
- `30 Günde Hollandaca - Bölüm 27.mp3` — 8.5 MB
- `30 Günde Hollandaca - Bölüm 28.mp3` — 20.3 MB
- `30 Günde Hollandaca - Bölüm 29.mp3` — 18.6 MB

**`atili/Dutch/DUO oefenexamens NT2/`** — 48 files, 29.9 MB

- `2023 Lezen I - beoordelingsmodel.pdf` — 65 KB
- `2023 Lezen I - opgavenboekje.pdf` — 413 KB
- `2023 Lezen II - beoordelingsmodel.pdf` — 68 KB
- `2023 Lezen II - opgavenboekje.pdf` — 540 KB
- `2023 Luisteren I - beoordelingsmodel.pdf` — 155 KB
- `2023 Luisteren I - opgavenboekje.pdf` — 2.4 MB
- `2023 Luisteren II - beoordelingsmodel.pdf` — 201 KB
- `2023 Luisteren II - opgavenboekje.pdf` — 1.6 MB
- `2023 Schrijven I - beoordelingsmodel.pdf` — 275 KB
- `2023 Schrijven I - opgavenboekje.pdf` — 504 KB
- `2023 Schrijven II - beoordelingsmodel.pdf` — 247 KB
- `2023 Schrijven II - opgavenboekje.pdf` — 321 KB
- `2023 Spreken I - beoordelingsmodel.pdf` — 359 KB
- `2023 Spreken I - opgavenboekje.pdf` — 4.2 MB
- `2023 Spreken II - beoordelingsmodel.pdf` — 304 KB
- `2023 Spreken II - opgavenboekje.pdf` — 2.6 MB
- `2024 Lezen I - beoordelingsmodel.pdf` — 63 KB
- `2024 Lezen I - opgavenboekje.pdf` — 591 KB
- `2024 Lezen II - beoordelingsmodel.pdf` — 68 KB
- `2024 Lezen II - opgavenboekje.pdf` — 473 KB
- `2024 Luisteren I - beoordelingsmodel.pdf` — 155 KB
- `2024 Luisteren I - opgavenboekje.pdf` — 1.2 MB
- `2024 Luisteren II - beoordelingsmodel.pdf` — 196 KB
- `2024 Luisteren II - opgavenboekje.pdf` — 620 KB
- `2024 Schrijven I - beoordelingsmodel.pdf` — 270 KB
- `2024 Schrijven I - opgavenboekje.pdf` — 445 KB
- `2024 Schrijven II - beoordelingsmodel.pdf` — 247 KB
- `2024 Schrijven II - opgavenboekje.pdf` — 421 KB
- `2024 Spreken I - beoordelingsmodel.pdf` — 360 KB
- `2024 Spreken I - opgavenboekje.pdf` — 2.9 MB
- `2024 Spreken II - beoordelingsmodel.pdf` — 305 KB
- `2024 Spreken II - opgavenboekje.pdf` — 1.1 MB
- `2025 Lezen I - beoordelingsmodel.pdf` — 225 KB
- `2025 Lezen I - opgavenboekje.pdf` — 590 KB
- `2025 Lezen II - beoordelingsmodel.pdf` — 267 KB
- `2025 Lezen II - opgavenboekje.pdf` — 647 KB
- `2025 Luisteren I - beoordelingsmodel.pdf` — 140 KB
- `2025 Luisteren I - opgavenboekje.pdf` — 515 KB
- `2025 Luisteren II - beoordelingsmodel.pdf` — 140 KB
- `2025 Luisteren II - opgavenboekje.pdf` — 207 KB
- `2025 Schrijven I - beoordelingsmodel.pdf` — 289 KB
- `2025 Schrijven I - opgavenboekje.pdf` — 359 KB
- `2025 Schrijven II - beoordelingsmodel.pdf` — 274 KB
- `2025 Schrijven II - opgavenboekje.pdf` — 295 KB
- `2025 Spreken I - beoordelingsmodel.pdf` — 321 KB
- `2025 Spreken I - opgavenboekje.pdf` — 1.2 MB
- `2025 Spreken II - beoordelingsmodel.pdf` — 222 KB
- `2025 Spreken II - opgavenboekje.pdf` — 966 KB

**`atili/Dutch/Goethe book2 TR-NL/`** — 100 files, 124.6 MB

- `TRNL 001 - Kişiler.mp3` — 1014 KB
- `TRNL 002 - Aile.mp3` — 1003 KB
- `TRNL 003 - Tanımak, öğrenmek, anlamak.mp3` — 1.0 MB
- `TRNL 004 - Okulda.mp3` — 1.2 MB
- `TRNL 005 - Ülkeler ve diller.mp3` — 1.3 MB
- `TRNL 006 - Okumak ve yazmak.mp3` — 1.1 MB
- `TRNL 007 - Sayılar.mp3` — 1.2 MB
- `TRNL 008 - Saatler.mp3` — 1.1 MB
- `TRNL 009 - Haftanın günleri.mp3` — 1.1 MB
- `TRNL 010 - Dün - bugün - yarın.mp3` — 1.2 MB
- `TRNL 011 - Aylar.mp3` — 1.0 MB
- `TRNL 012 - İçecekler.mp3` — 1.3 MB
- `TRNL 013 - Faaliyetler.mp3` — 1.1 MB
- `TRNL 014 - Renkler.mp3` — 1.5 MB
- `TRNL 015 - Meyve ve gıda maddeleri.mp3` — 1.4 MB
- `TRNL 016 - Mevsimler ve hava.mp3` — 1.1 MB
- `TRNL 017 - Evde.mp3` — 1.2 MB
- `TRNL 018 - Ev temizliği.mp3` — 1.3 MB
- `TRNL 019 - Mutfakta.mp3` — 1.3 MB
- `TRNL 020 - Small Talk 1 (Kısa sohbet 1).mp3` — 1.2 MB
- `TRNL 021 - Small Talk 2 (Kısa sohbet 2).mp3` — 1.3 MB
- `TRNL 022 - Small Talk 3 (Kısa sohbet 3).mp3` — 1.2 MB
- `TRNL 023 - Dil öğrenmek.mp3` — 1.3 MB
- `TRNL 024 - Randevulaşmak.mp3` — 1.3 MB
- `TRNL 025 - Şehirde.mp3` — 1.2 MB
- `TRNL 026 - Doğada.mp3` — 1.2 MB
- `TRNL 027 - Otelde - varış.mp3` — 1.2 MB
- `TRNL 028 - Otelde - şikâyetler.mp3` — 1.3 MB
- `TRNL 029 - Restoranda 1.mp3` — 1.1 MB
- `TRNL 030 - Restoranda 2.mp3` — 1.2 MB
- `TRNL 031 - Restoranda 3.mp3` — 1.2 MB
- `TRNL 032 - Restoranda 4.mp3` — 1.2 MB
- `TRNL 033 - Tren istasyonunda.mp3` — 1.4 MB
- `TRNL 034 - Trende.mp3` — 1.3 MB
- `TRNL 035 - Havalimanında.mp3` — 1.4 MB
- `TRNL 036 - Toplu taşıma.mp3` — 1.3 MB
- `TRNL 037 - Yolda.mp3` — 1.2 MB
- `TRNL 038 - Takside.mp3` — 1.2 MB
- `TRNL 039 - Araba arızası.mp3` — 1.1 MB
- `TRNL 040 - Yol sormak.mp3` — 1.3 MB
- `TRNL 041 - Oryantasyon.mp3` — 1.2 MB
- `TRNL 042 - Şehir turu.mp3` — 1.3 MB
- `TRNL 043 - Hayvanat bahçesinde.mp3` — 1.1 MB
- `TRNL 044 - Gece çıkmak.mp3` — 1.3 MB
- `TRNL 045 - Sinemada.mp3` — 1.1 MB
- `TRNL 046 - Diskoda.mp3` — 1.1 MB
- `TRNL 047 - Seyahat hazırlıkları.mp3` — 1.5 MB
- `TRNL 048 - Tatil aktiviteleri.mp3` — 1.2 MB
- `TRNL 049 - Spor.mp3` — 1.2 MB
- `TRNL 050 - Yüzme havuzunda.mp3` — 1.0 MB
- `TRNL 051 - Alışveriş yapmak.mp3` — 1.4 MB
- `TRNL 052 - Alışveriş merkezinde.mp3` — 1.4 MB
- `TRNL 053 - Mağazalar.mp3` — 1.5 MB
- `TRNL 054 - Alışveriş yapmak.mp3` — 1.1 MB
- `TRNL 055 - Çalışmak.mp3` — 1.2 MB
- `TRNL 056 - Duygular.mp3` — 1.1 MB
- `TRNL 057 - Doktorda.mp3` — 1.2 MB
- `TRNL 058 - Vücudun bölümleri.mp3` — 1.2 MB
- `TRNL 059 - Postanede.mp3` — 1.3 MB
- `TRNL 060 - Bankada.mp3` — 1.3 MB
- `TRNL 061 - Sıralama sayıları.mp3` — 1.3 MB
- `TRNL 062 - Soru sormak 1.mp3` — 1.1 MB
- `TRNL 063 - Soru sormak 2.mp3` — 1.2 MB
- `TRNL 064 - Olumsuz yanıt 1.mp3` — 1.1 MB
- `TRNL 065 - Olumsuz yanıt 2.mp3` — 1.2 MB
- `TRNL 066 - İyelik zamiri 1.mp3` — 1.3 MB
- `TRNL 067 - İyelik zamiri 2.mp3` — 1.2 MB
- `TRNL 068 - büyük - küçük.mp3` — 1.2 MB
- `TRNL 069 - ihtiyacı olmak - istemek.mp3` — 1.2 MB
- `TRNL 070 - bir şey arzu etmek.mp3` — 1.2 MB
- `TRNL 071 - bir şey istemek.mp3` — 1.2 MB
- `TRNL 072 - bir şeyler yapmak zorunda olmak.mp3` — 1.2 MB
- `TRNL 073 - bir şeylere muktedir olmak, yapabilmek.mp3` — 1.3 MB
- `TRNL 074 - bir şey rica etmek.mp3` — 1.2 MB
- `TRNL 075 - bir şeyler sebep göstermek 1.mp3` — 1.2 MB
- `TRNL 076 - bir şeyler sebep göstermek 2.mp3` — 1.2 MB
- `TRNL 077 - bir şeyler sebep göstermek 3.mp3` — 1.4 MB
- `TRNL 078 - Sıfatlar 1.mp3` — 1.1 MB
- `TRNL 079 - Sıfatlar 2.mp3` — 1.4 MB
- `TRNL 080 - Sıfatlar 3.mp3` — 1.1 MB
- `TRNL 081 - Geçmiş zaman 1.mp3` — 1.4 MB
- `TRNL 082 - Geçmiş zaman 2.mp3` — 1.5 MB
- `TRNL 083 - Geçmiş zaman 3.mp3` — 1.1 MB
- `TRNL 084 - Geçmiş zaman 4.mp3` — 1.4 MB
- `TRNL 085 - Sorular - Geçmiş zaman 1.mp3` — 1.2 MB
- `TRNL 086 - Sorular - Geçmiş zaman 2.mp3` — 1.2 MB
- `TRNL 087 - Yardımcı fiillerin geçmiş zamanı 1.mp3` — 1.4 MB
- `TRNL 088 - Yardımcı fiillerin geçmiş zamanı 2.mp3` — 1.4 MB
- `TRNL 089 - Emir kipi 1.mp3` — 1.4 MB
- `TRNL 090 - Emir kipi 2.mp3` — 1.0 MB
- `TRNL 091 - (ki) li yan cümleler.mp3` — 1.3 MB
- `TRNL 092 - (ki) li yan cümleler.mp3` — 1.4 MB
- `TRNL 093 - -mayıp - -meyip, -madığı - mediği li yan cümleler.mp3` — 1.4 MB
- `TRNL 094 - Bağlaçlar 1.mp3` — 1.4 MB
- `TRNL 095 - Bağlaçlar 2.mp3` — 1.5 MB
- `TRNL 096 - Bağlaçlar 3.mp3` — 1.5 MB
- `TRNL 097 - Bağlaçlar 4.mp3` — 1.8 MB
- `TRNL 098 - Çift bağlaçlar.mp3` — 1.6 MB
- `TRNL 099 - Belirten.mp3` — 1.4 MB
- `TRNL 100 - Nitelik zarfları.mp3` — 1.3 MB

**`atili/Dutch/NT2 Taaldiensten - tanışma dersi A0-A2/`** — 1 files, 577.0 MB

- `NT2 Taaldiensten - tanışma dersi A0-A2 - weer en klimaat.mp4` — 577.0 MB

**`atili/Dutch/Van Dale Groot Beeldwoordenboek (3 delen)/`** — 3 files, 468.2 MB

- `Van Dale Groot Beeldwoordenboek - deel 1 van 3.pdf` — 199.5 MB
- `Van Dale Groot Beeldwoordenboek - deel 2 van 3.pdf` — 199.4 MB
- `Van Dale Groot Beeldwoordenboek - deel 3 van 3.pdf` — 69.4 MB

**`atili/Dutch/DUO oefenexamens NT2/2023 Luisteren I/audio/`** — 100 files, 143.3 MB

- `2023 Luisteren I - 01 - instructie.mp3` — 556 KB
- `2023 Luisteren I - 01 - instructie.opus` — 570 KB
- `2023 Luisteren I - 02 - Een gesprek met een autoverkoper - introductie.mp3` — 2.9 MB
- `2023 Luisteren I - 02 - Een gesprek met een autoverkoper - introductie.opus` — 3.2 MB
- `2023 Luisteren I - 03 - Een gesprek met een autoverkoper - opgave 1.mp3` — 808 KB
- `2023 Luisteren I - 03 - Een gesprek met een autoverkoper - opgave 1.opus` — 760 KB
- `2023 Luisteren I - 04 - Een gesprek met een autoverkoper - opgave 2.mp3` — 1.1 MB
- `2023 Luisteren I - 04 - Een gesprek met een autoverkoper - opgave 2.opus` — 984 KB
- `2023 Luisteren I - 05 - Een gesprek met een autoverkoper - opgave 3.mp3` — 713 KB
- `2023 Luisteren I - 05 - Een gesprek met een autoverkoper - opgave 3.opus` — 643 KB
- `2023 Luisteren I - 06 - Een gesprek met een autoverkoper - opgave 4.mp3` — 748 KB
- `2023 Luisteren I - 06 - Een gesprek met een autoverkoper - opgave 4.opus` — 689 KB
- `2023 Luisteren I - 07 - Een gesprek met een autoverkoper - opgave 5.mp3` — 810 KB
- `2023 Luisteren I - 07 - Een gesprek met een autoverkoper - opgave 5.opus` — 727 KB
- `2023 Luisteren I - 08 - Een gesprek met een reisbegeleider - introductie.mp3` — 794 KB
- `2023 Luisteren I - 08 - Een gesprek met een reisbegeleider - introductie.opus` — 740 KB
- `2023 Luisteren I - 09 - Een gesprek met een reisbegeleider - opgave 6.mp3` — 719 KB
- `2023 Luisteren I - 09 - Een gesprek met een reisbegeleider - opgave 6.opus` — 570 KB
- `2023 Luisteren I - 10 - Een gesprek met een reisbegeleider - opgave 7.mp3` — 1.2 MB
- `2023 Luisteren I - 10 - Een gesprek met een reisbegeleider - opgave 7.opus` — 995 KB
- `2023 Luisteren I - 11 - Een gesprek met een reisbegeleider - opgave 8.mp3` — 1.3 MB
- `2023 Luisteren I - 11 - Een gesprek met een reisbegeleider - opgave 8.opus` — 1.0 MB
- `2023 Luisteren I - 12 - Een gesprek met een reisbegeleider - opgave 9.mp3` — 1.1 MB
- `2023 Luisteren I - 12 - Een gesprek met een reisbegeleider - opgave 9.opus` — 890 KB
- `2023 Luisteren I - 13 - Een les van de drogisterijdocent - introductie.mp3` — 837 KB
- `2023 Luisteren I - 13 - Een les van de drogisterijdocent - introductie.opus` — 1.0 MB
- `2023 Luisteren I - 14 - Een les van de drogisterijdocent - opgave 10.mp3` — 1.0 MB
- `2023 Luisteren I - 14 - Een les van de drogisterijdocent - opgave 10.opus` — 1.1 MB
- `2023 Luisteren I - 15 - Een les van de drogisterijdocent - opgave 11.mp3` — 770 KB
- `2023 Luisteren I - 15 - Een les van de drogisterijdocent - opgave 11.opus` — 795 KB
- `2023 Luisteren I - 16 - Een les van de drogisterijdocent - opgave 12.mp3` — 739 KB
- `2023 Luisteren I - 16 - Een les van de drogisterijdocent - opgave 12.opus` — 752 KB
- `2023 Luisteren I - 17 - Een les van de drogisterijdocent - opgave 13.mp3` — 799 KB
- `2023 Luisteren I - 17 - Een les van de drogisterijdocent - opgave 13.opus` — 819 KB
- `2023 Luisteren I - 18 - Een les van de drogisterijdocent - opgave 14.mp3` — 844 KB
- `2023 Luisteren I - 18 - Een les van de drogisterijdocent - opgave 14.opus` — 874 KB
- `2023 Luisteren I - 19 - Een les van de drogisterijdocent - opgave 15.mp3` — 1.2 MB
- `2023 Luisteren I - 19 - Een les van de drogisterijdocent - opgave 15.opus` — 1.2 MB
- `2023 Luisteren I - 20 - Een les van de drogisterijdocent - opgave 16.mp3` — 825 KB
- `2023 Luisteren I - 20 - Een les van de drogisterijdocent - opgave 16.opus` — 816 KB
- `2023 Luisteren I - 21 - Een gesprek over een kringloopwinkel - introductie.mp3` — 1.4 MB
- `2023 Luisteren I - 21 - Een gesprek over een kringloopwinkel - introductie.opus` — 1.8 MB
- `2023 Luisteren I - 22 - Een gesprek over een kringloopwinkel - opgave 17.mp3` — 943 KB
- `2023 Luisteren I - 22 - Een gesprek over een kringloopwinkel - opgave 17.opus` — 1.2 MB
- `2023 Luisteren I - 23 - Een gesprek over een kringloopwinkel - opgave 18.mp3` — 904 KB
- `2023 Luisteren I - 23 - Een gesprek over een kringloopwinkel - opgave 18.opus` — 1.1 MB
- `2023 Luisteren I - 24 - Een gesprek over een kringloopwinkel - opgave 19.mp3` — 648 KB
- `2023 Luisteren I - 24 - Een gesprek over een kringloopwinkel - opgave 19.opus` — 816 KB
- `2023 Luisteren I - 25 - Een gesprek over een kringloopwinkel - opgave 20.mp3` — 938 KB
- `2023 Luisteren I - 25 - Een gesprek over een kringloopwinkel - opgave 20.opus` — 1.1 MB
- `2023 Luisteren I - 26 - Een gesprek over een kringloopwinkel - opgave 21.mp3` — 641 KB
- `2023 Luisteren I - 26 - Een gesprek over een kringloopwinkel - opgave 21.opus` — 780 KB
- `2023 Luisteren I - 27 - Een gesprek over een kringloopwinkel - opgave 22.mp3` — 743 KB
- `2023 Luisteren I - 27 - Een gesprek over een kringloopwinkel - opgave 22.opus` — 938 KB
- `2023 Luisteren I - 28 - Een gesprek over een kringloopwinkel - opgave 23.mp3` — 559 KB
- `2023 Luisteren I - 28 - Een gesprek over een kringloopwinkel - opgave 23.opus` — 689 KB
- `2023 Luisteren I - 29 - Een gesprek over een kringloopwinkel - opgave 24.mp3` — 807 KB
- `2023 Luisteren I - 29 - Een gesprek over een kringloopwinkel - opgave 24.opus` — 956 KB
- `2023 Luisteren I - 30 - Een gesprek met een stewardess - introductie.mp3` — 1.3 MB
- `2023 Luisteren I - 30 - Een gesprek met een stewardess - introductie.opus` — 1.1 MB
- `2023 Luisteren I - 31 - Een gesprek met een stewardess - opgave 25.mp3` — 842 KB
- `2023 Luisteren I - 31 - Een gesprek met een stewardess - opgave 25.opus` — 861 KB
- `2023 Luisteren I - 32 - Een gesprek met een stewardess - opgave 26.mp3` — 999 KB
- `2023 Luisteren I - 32 - Een gesprek met een stewardess - opgave 26.opus` — 1.0 MB
- `2023 Luisteren I - 33 - Een gesprek met een stewardess - opgave 27.mp3` — 1020 KB
- `2023 Luisteren I - 33 - Een gesprek met een stewardess - opgave 27.opus` — 1.0 MB
- `2023 Luisteren I - 34 - Een gesprek met een stewardess - opgave 28.mp3` — 814 KB
- `2023 Luisteren I - 34 - Een gesprek met een stewardess - opgave 28.opus` — 833 KB
- `2023 Luisteren I - 35 - Een gesprek met een stewardess - opgave 29.mp3` — 781 KB
- `2023 Luisteren I - 35 - Een gesprek met een stewardess - opgave 29.opus` — 780 KB
- `2023 Luisteren I - 36 - instructie videodeel.mp3` — 211 KB
- `2023 Luisteren I - 36 - instructie videodeel.opus` — 214 KB
- `2023 Luisteren I - 37 - Een video over de burgemeester van Zeist - introductie 1.mp3` — 284 KB
- `2023 Luisteren I - 37 - Een video over de burgemeester van Zeist - introductie 1.opus` — 260 KB
- `2023 Luisteren I - 38 - Een video over de burgemeester van Zeist - introductie 2.mp4` — 1.6 MB
- `2023 Luisteren I - 38 - Een video over de burgemeester van Zeist - introductie 2.webm` — 2.4 MB
- `2023 Luisteren I - 39 - instructie.mp3` — 114 KB
- `2023 Luisteren I - 39 - instructie.opus` — 105 KB
- `2023 Luisteren I - 40 - Een video over de burgemeester van Zeist - opgave 30.mp4` — 4.4 MB
- `2023 Luisteren I - 40 - Een video over de burgemeester van Zeist - opgave 30.webm` — 5.0 MB
- `2023 Luisteren I - 41 - Een video over de burgemeester van Zeist - opgave 31.mp4` — 1.7 MB
- `2023 Luisteren I - 41 - Een video over de burgemeester van Zeist - opgave 31.webm` — 3.2 MB
- `2023 Luisteren I - 42 - Een video over de burgemeester van Zeist - opgave 32.mp4` — 5.0 MB
- `2023 Luisteren I - 42 - Een video over de burgemeester van Zeist - opgave 32.webm` — 7.7 MB
- `2023 Luisteren I - 43 - Een video over de burgemeester van Zeist - opgave 33.mp4` — 2.9 MB
- `2023 Luisteren I - 43 - Een video over de burgemeester van Zeist - opgave 33.webm` — 3.2 MB
- `2023 Luisteren I - 44 - Een video over de burgemeester van Zeist - opgave 34.mp4` — 1.7 MB
- `2023 Luisteren I - 44 - Een video over de burgemeester van Zeist - opgave 34.webm` — 2.3 MB
- `2023 Luisteren I - 45 - Een video over de burgemeester van Zeist - opgave 35.mp4` — 4.7 MB
- `2023 Luisteren I - 45 - Een video over de burgemeester van Zeist - opgave 35.webm` — 5.3 MB
- `2023 Luisteren I - 46 - Een video over Leren presenteren - introductie.mp3` — 292 KB
- `2023 Luisteren I - 46 - Een video over Leren presenteren - introductie.opus` — 262 KB
- `2023 Luisteren I - 47 - Een video over Leren presenteren - opgave 36.mp4` — 1.8 MB
- `2023 Luisteren I - 47 - Een video over Leren presenteren - opgave 36.webm` — 3.3 MB
- `2023 Luisteren I - 48 - Een video over Leren presenteren - opgave 37.mp4` — 4.0 MB
- `2023 Luisteren I - 48 - Een video over Leren presenteren - opgave 37.webm` — 6.2 MB
- `2023 Luisteren I - 49 - Een video over Leren presenteren - opgave 38.mp4` — 3.2 MB
- `2023 Luisteren I - 49 - Een video over Leren presenteren - opgave 38.webm` — 5.5 MB
- `2023 Luisteren I - 50 - Een video over Leren presenteren.mp3` — 102 KB
- `2023 Luisteren I - 50 - Een video over Leren presenteren.opus` — 116 KB

**`atili/Dutch/DUO oefenexamens NT2/2023 Luisteren II/audio/`** — 98 files, 161.3 MB

- `2023 Luisteren II - 01 - instructie.mp3` — 556 KB
- `2023 Luisteren II - 01 - instructie.opus` — 570 KB
- `2023 Luisteren II - 02 - Een gesprek over het starten van een bedrijf - introductie.mp3` — 2.7 MB
- `2023 Luisteren II - 02 - Een gesprek over het starten van een bedrijf - introductie.opus` — 2.9 MB
- `2023 Luisteren II - 03 - Een gesprek over het starten van een bedrijf - opgave 1.mp3` — 1012 KB
- `2023 Luisteren II - 03 - Een gesprek over het starten van een bedrijf - opgave 1.opus` — 875 KB
- `2023 Luisteren II - 04 - Een gesprek over het starten van een bedrijf - opgave 2.mp3` — 970 KB
- `2023 Luisteren II - 04 - Een gesprek over het starten van een bedrijf - opgave 2.opus` — 846 KB
- `2023 Luisteren II - 05 - Een gesprek over het starten van een bedrijf - opgave 3.mp3` — 1.5 MB
- `2023 Luisteren II - 05 - Een gesprek over het starten van een bedrijf - opgave 3.opus` — 1.3 MB
- `2023 Luisteren II - 06 - Een gesprek over het starten van een bedrijf - opgave 4.mp3` — 1.3 MB
- `2023 Luisteren II - 06 - Een gesprek over het starten van een bedrijf - opgave 4.opus` — 1.2 MB
- `2023 Luisteren II - 07 - Een gesprek over het starten van een bedrijf - opgave 5.mp3` — 830 KB
- `2023 Luisteren II - 07 - Een gesprek over het starten van een bedrijf - opgave 5.opus` — 719 KB
- `2023 Luisteren II - 08 - Een gesprek over het starten van een bedrijf - opgave 6.mp3` — 972 KB
- `2023 Luisteren II - 08 - Een gesprek over het starten van een bedrijf - opgave 6.opus` — 844 KB
- `2023 Luisteren II - 09 - Een gesprek over het starten van een bedrijf - opgave 7.mp3` — 765 KB
- `2023 Luisteren II - 09 - Een gesprek over het starten van een bedrijf - opgave 7.opus` — 669 KB
- `2023 Luisteren II - 10 - Een gesprek over het starten van een bedrijf - opgave 8.mp3` — 1.2 MB
- `2023 Luisteren II - 10 - Een gesprek over het starten van een bedrijf - opgave 8.opus` — 1.0 MB
- `2023 Luisteren II - 11 - Een gesprek over het starten van een bedrijf - opgave 9.mp3` — 1.4 MB
- `2023 Luisteren II - 11 - Een gesprek over het starten van een bedrijf - opgave 9.opus` — 1.2 MB
- `2023 Luisteren II - 12 - Een gesprek over het starten van een bedrijf - opgave 10.mp3` — 1.5 MB
- `2023 Luisteren II - 12 - Een gesprek over het starten van een bedrijf - opgave 10.opus` — 1.3 MB
- `2023 Luisteren II - 13 - Een gesprek met de directeur van De Helling in Arnhem - introductie.mp3` — 1.1 MB
- `2023 Luisteren II - 13 - Een gesprek met de directeur van De Helling in Arnhem - introductie.opus` — 1022 KB
- `2023 Luisteren II - 14 - Een gesprek met de directeur van De Helling in Arnhem - opgave 11.mp3` — 1.8 MB
- `2023 Luisteren II - 14 - Een gesprek met de directeur van De Helling in Arnhem - opgave 11.opus` — 1.4 MB
- `2023 Luisteren II - 15 - Een gesprek met de directeur van De Helling in Arnhem - opgave 12.mp3` — 2.0 MB
- `2023 Luisteren II - 15 - Een gesprek met de directeur van De Helling in Arnhem - opgave 12.opus` — 1.5 MB
- `2023 Luisteren II - 16 - Een gesprek met de directeur van De Helling in Arnhem - opgave 13.mp3` — 1.9 MB
- `2023 Luisteren II - 16 - Een gesprek met de directeur van De Helling in Arnhem - opgave 13.opus` — 1.4 MB
- `2023 Luisteren II - 17 - Een gesprek met de directeur van De Helling in Arnhem - opgave 14.mp3` — 1.2 MB
- `2023 Luisteren II - 17 - Een gesprek met de directeur van De Helling in Arnhem - opgave 14.opus` — 941 KB
- `2023 Luisteren II - 18 - Een gesprek met de directeur van De Helling in Arnhem - opgave 15.mp3` — 1.7 MB
- `2023 Luisteren II - 18 - Een gesprek met de directeur van De Helling in Arnhem - opgave 15.opus` — 1.3 MB
- `2023 Luisteren II - 19 - Een gesprek met de directeur van De Helling in Arnhem - opgave 16.mp3` — 1.5 MB
- `2023 Luisteren II - 19 - Een gesprek met de directeur van De Helling in Arnhem - opgave 16.opus` — 1.1 MB
- `2023 Luisteren II - 20 - Een gesprek met de directeur van De Helling in Arnhem - opgave 17.mp3` — 1.8 MB
- `2023 Luisteren II - 20 - Een gesprek met de directeur van De Helling in Arnhem - opgave 17.opus` — 1.4 MB
- `2023 Luisteren II - 21 - Een gesprek met de directeur van De Helling in Arnhem - opgave 18.mp3` — 1.9 MB
- `2023 Luisteren II - 21 - Een gesprek met de directeur van De Helling in Arnhem - opgave 18.opus` — 1.4 MB
- `2023 Luisteren II - 22 - Een gesprek met de directeur van De Helling in Arnhem - opgave 19.mp3` — 1.5 MB
- `2023 Luisteren II - 22 - Een gesprek met de directeur van De Helling in Arnhem - opgave 19.opus` — 1.1 MB
- `2023 Luisteren II - 23 - Een gesprek met de directeur van De Helling in Arnhem - opgave 20.mp3` — 1.7 MB
- `2023 Luisteren II - 23 - Een gesprek met de directeur van De Helling in Arnhem - opgave 20.opus` — 1.3 MB
- `2023 Luisteren II - 24 - Een gesprek met een boswachter - introductie.mp3` — 1.5 MB
- `2023 Luisteren II - 24 - Een gesprek met een boswachter - introductie.opus` — 1.6 MB
- `2023 Luisteren II - 25 - Een gesprek met een boswachter - opgave 21.mp3` — 726 KB
- `2023 Luisteren II - 25 - Een gesprek met een boswachter - opgave 21.opus` — 871 KB
- `2023 Luisteren II - 26 - Een gesprek met een boswachter - opgave 22.mp3` — 754 KB
- `2023 Luisteren II - 26 - Een gesprek met een boswachter - opgave 22.opus` — 878 KB
- `2023 Luisteren II - 27 - Een gesprek met een boswachter - opgave 23.mp3` — 772 KB
- `2023 Luisteren II - 27 - Een gesprek met een boswachter - opgave 23.opus` — 890 KB
- `2023 Luisteren II - 28 - Een gesprek met een boswachter - opgave 24.mp3` — 739 KB
- `2023 Luisteren II - 28 - Een gesprek met een boswachter - opgave 24.opus` — 885 KB
- `2023 Luisteren II - 29 - Een gesprek met een boswachter - opgave 25.mp3` — 491 KB
- `2023 Luisteren II - 29 - Een gesprek met een boswachter - opgave 25.opus` — 580 KB
- `2023 Luisteren II - 30 - Een gesprek met een boswachter - opgave 26.mp3` — 738 KB
- `2023 Luisteren II - 30 - Een gesprek met een boswachter - opgave 26.opus` — 869 KB
- `2023 Luisteren II - 31 - Een gesprek tussen student en studieadviseur - introductie.mp3` — 638 KB
- `2023 Luisteren II - 31 - Een gesprek tussen student en studieadviseur - introductie.opus` — 641 KB
- `2023 Luisteren II - 32 - Een gesprek tussen student en studieadviseur - opgave 27.mp3` — 832 KB
- `2023 Luisteren II - 32 - Een gesprek tussen student en studieadviseur - opgave 27.opus` — 839 KB
- `2023 Luisteren II - 33 - Een gesprek tussen student en studieadviseur - opgave 28.mp3` — 781 KB
- `2023 Luisteren II - 33 - Een gesprek tussen student en studieadviseur - opgave 28.opus` — 769 KB
- `2023 Luisteren II - 34 - Een gesprek tussen student en studieadviseur - opgave 29.mp3` — 873 KB
- `2023 Luisteren II - 34 - Een gesprek tussen student en studieadviseur - opgave 29.opus` — 846 KB
- `2023 Luisteren II - 35 - Een gesprek tussen student en studieadviseur - opgave 30.mp3` — 804 KB
- `2023 Luisteren II - 35 - Een gesprek tussen student en studieadviseur - opgave 30.opus` — 801 KB
- `2023 Luisteren II - 36 - Een gesprek tussen student en studieadviseur - opgave 31.mp3` — 824 KB
- `2023 Luisteren II - 36 - Een gesprek tussen student en studieadviseur - opgave 31.opus` — 813 KB
- `2023 Luisteren II - 37 - Een gesprek tussen student en studieadviseur - opgave 32.mp3` — 1.3 MB
- `2023 Luisteren II - 37 - Een gesprek tussen student en studieadviseur - opgave 32.opus` — 1.3 MB
- `2023 Luisteren II - 38 - instructie videodeel.mp3` — 211 KB
- `2023 Luisteren II - 38 - instructie videodeel.opus` — 214 KB
- `2023 Luisteren II - 39 - Een video over het lerarentekort - introductie.mp3` — 272 KB
- `2023 Luisteren II - 39 - Een video over het lerarentekort - introductie.opus` — 246 KB
- `2023 Luisteren II - 40 - Een video over het lerarentekort - opgave 33.mp4` — 7.2 MB
- `2023 Luisteren II - 40 - Een video over het lerarentekort - opgave 33.webm` — 8.8 MB
- `2023 Luisteren II - 41 - Een video over het lerarentekort - opgave 34.mp4` — 5.3 MB
- `2023 Luisteren II - 41 - Een video over het lerarentekort - opgave 34.webm` — 7.2 MB
- `2023 Luisteren II - 42 - Een video over het lerarentekort - opgave 35.mp4` — 2.8 MB
- `2023 Luisteren II - 42 - Een video over het lerarentekort - opgave 35.webm` — 3.8 MB
- `2023 Luisteren II - 43 - Een video over het lerarentekort - opgave 36.mp4` — 4.9 MB
- `2023 Luisteren II - 43 - Een video over het lerarentekort - opgave 36.webm` — 6.0 MB
- `2023 Luisteren II - 44 - Een video over een ondernemer van het bedrijf Yoghurt Barn - introductie.mp3` — 464 KB
- `2023 Luisteren II - 44 - Een video over een ondernemer van het bedrijf Yoghurt Barn - introductie.opus` — 420 KB
- `2023 Luisteren II - 45 - Een video over een ondernemer van het bedrijf Yoghurt Barn - opgave 37.mp4` — 3.1 MB
- `2023 Luisteren II - 45 - Een video over een ondernemer van het bedrijf Yoghurt Barn - opgave 37.webm` — 4.2 MB
- `2023 Luisteren II - 46 - Een video over een ondernemer van het bedrijf Yoghurt Barn - opgave 38.mp4` — 3.6 MB
- `2023 Luisteren II - 46 - Een video over een ondernemer van het bedrijf Yoghurt Barn - opgave 38.webm` — 5.4 MB
- `2023 Luisteren II - 47 - Een video over een ondernemer van het bedrijf Yoghurt Barn - opgave 39.mp4` — 2.2 MB
- `2023 Luisteren II - 47 - Een video over een ondernemer van het bedrijf Yoghurt Barn - opgave 39.webm` — 3.5 MB
- `2023 Luisteren II - 48 - Een video over een ondernemer van het bedrijf Yoghurt Barn - opgave 40.mp4` — 3.3 MB
- `2023 Luisteren II - 48 - Een video over een ondernemer van het bedrijf Yoghurt Barn - opgave 40.webm` — 4.2 MB
- `2023 Luisteren II - 49 - Een video over een ondernemer van het bedrijf Yoghurt Barn.mp3` — 102 KB
- `2023 Luisteren II - 49 - Een video over een ondernemer van het bedrijf Yoghurt Barn.opus` — 116 KB

**`atili/Dutch/DUO oefenexamens NT2/2023 Spreken I/audio/`** — 36 files, 22.0 MB

- `2023 Spreken I - 01 - deel 1 instructie.mp3` — 1.1 MB
- `2023 Spreken I - 01 - deel 1 instructie.opus` — 1.3 MB
- `2023 Spreken I - 02 - opgave 1 - Kappersopleiding.mp3` — 441 KB
- `2023 Spreken I - 02 - opgave 1 - Kappersopleiding.opus` — 465 KB
- `2023 Spreken I - 03 - opgave 2 - Persoon beschrijven.mp3` — 421 KB
- `2023 Spreken I - 03 - opgave 2 - Persoon beschrijven.opus` — 439 KB
- `2023 Spreken I - 04 - opgave 3 - Halve dagen werken.mp3` — 234 KB
- `2023 Spreken I - 04 - opgave 3 - Halve dagen werken.opus` — 207 KB
- `2023 Spreken I - 05 - opgave 4 - Belegde broodjes.mp3` — 332 KB
- `2023 Spreken I - 05 - opgave 4 - Belegde broodjes.opus` — 319 KB
- `2023 Spreken I - 06 - opgave 5 - Opleiding volgen.mp3` — 504 KB
- `2023 Spreken I - 06 - opgave 5 - Opleiding volgen.opus` — 455 KB
- `2023 Spreken I - 07 - opgave 6 - Voor de kat zorgen.mp3` — 425 KB
- `2023 Spreken I - 07 - opgave 6 - Voor de kat zorgen.opus` — 391 KB
- `2023 Spreken I - 08 - opgave 7 - Geen stage.mp3` — 447 KB
- `2023 Spreken I - 08 - opgave 7 - Geen stage.opus` — 511 KB
- `2023 Spreken I - 09 - opgave 8 - Verdrietig.mp3` — 314 KB
- `2023 Spreken I - 09 - opgave 8 - Verdrietig.opus` — 291 KB
- `2023 Spreken I - 10 - deel 2 instructie.mp3` — 1.5 MB
- `2023 Spreken I - 10 - deel 2 instructie.opus` — 2.0 MB
- `2023 Spreken I - 11 - opgave 9 - Introductiedag.mp3` — 806 KB
- `2023 Spreken I - 11 - opgave 9 - Introductiedag.opus` — 722 KB
- `2023 Spreken I - 12 - opgave 10 - Lang weekend weg.mp3` — 385 KB
- `2023 Spreken I - 12 - opgave 10 - Lang weekend weg.opus` — 507 KB
- `2023 Spreken I - 13 - opgave 11 - Kopiëren.mp3` — 608 KB
- `2023 Spreken I - 13 - opgave 11 - Kopiëren.opus` — 556 KB
- `2023 Spreken I - 14 - opgave 12 - Bezoeker.mp3` — 695 KB
- `2023 Spreken I - 14 - opgave 12 - Bezoeker.opus` — 658 KB
- `2023 Spreken I - 15 - opgave 13 - Nieuwe studieruimte.mp3` — 679 KB
- `2023 Spreken I - 15 - opgave 13 - Nieuwe studieruimte.opus` — 639 KB
- `2023 Spreken I - 16 - opgave 14 - Voetbal of hardlopen.mp3` — 776 KB
- `2023 Spreken I - 16 - opgave 14 - Voetbal of hardlopen.opus` — 713 KB
- `2023 Spreken I - 17 - opgave 15 - Sollicitatie.mp3` — 759 KB
- `2023 Spreken I - 17 - opgave 15 - Sollicitatie.opus` — 630 KB
- `2023 Spreken I - 18 - opgave 16 - Meesters.mp3` — 587 KB
- `2023 Spreken I - 18 - opgave 16 - Meesters.opus` — 547 KB

**`atili/Dutch/DUO oefenexamens NT2/2023 Spreken II/audio/`** — 32 files, 25.6 MB

- `2023 Spreken II - 01 - deel 1 instructie.mp3` — 1.5 MB
- `2023 Spreken II - 01 - deel 1 instructie.opus` — 1.2 MB
- `2023 Spreken II - 02 - opgave 1 - Stage of scriptie.mp3` — 196 KB
- `2023 Spreken II - 02 - opgave 1 - Stage of scriptie.opus` — 173 KB
- `2023 Spreken II - 03 - opgave 2 - Eerste keer vliegen.mp3` — 508 KB
- `2023 Spreken II - 03 - opgave 2 - Eerste keer vliegen.opus` — 369 KB
- `2023 Spreken II - 04 - opgave 3 - Weekenddienst.mp3` — 483 KB
- `2023 Spreken II - 04 - opgave 3 - Weekenddienst.opus` — 442 KB
- `2023 Spreken II - 05 - opgave 4 - Keuze laptop.mp3` — 453 KB
- `2023 Spreken II - 05 - opgave 4 - Keuze laptop.opus` — 387 KB
- `2023 Spreken II - 06 - deel 2 instructie.mp3` — 2.3 MB
- `2023 Spreken II - 06 - deel 2 instructie.opus` — 1.9 MB
- `2023 Spreken II - 07 - opgave 5 - Last van feestjes.mp3` — 424 KB
- `2023 Spreken II - 07 - opgave 5 - Last van feestjes.opus` — 588 KB
- `2023 Spreken II - 08 - opgave 6 - Sportjournalist.mp3` — 604 KB
- `2023 Spreken II - 08 - opgave 6 - Sportjournalist.opus` — 612 KB
- `2023 Spreken II - 09 - opgave 7 - Vrijwilligerswerk.mp3` — 658 KB
- `2023 Spreken II - 09 - opgave 7 - Vrijwilligerswerk.opus` — 658 KB
- `2023 Spreken II - 10 - opgave 8 - Stage in ziekenhuis.mp3` — 467 KB
- `2023 Spreken II - 10 - opgave 8 - Stage in ziekenhuis.opus` — 625 KB
- `2023 Spreken II - 11 - opgave 9 - Makelaar.mp3` — 792 KB
- `2023 Spreken II - 11 - opgave 9 - Makelaar.opus` — 802 KB
- `2023 Spreken II - 12 - opgave 10 - Festival.mp3` — 591 KB
- `2023 Spreken II - 12 - opgave 10 - Festival.opus` — 589 KB
- `2023 Spreken II - 13 - opgave 11 - Niet storen.mp3` — 683 KB
- `2023 Spreken II - 13 - opgave 11 - Niet storen.opus` — 697 KB
- `2023 Spreken II - 14 - opgave 12 - Rijbewijs vanaf 17 jaar.mp3` — 835 KB
- `2023 Spreken II - 14 - opgave 12 - Rijbewijs vanaf 17 jaar.opus` — 825 KB
- `2023 Spreken II - 15 - deel 3 instructie.mp3` — 582 KB
- `2023 Spreken II - 15 - deel 3 instructie.opus` — 463 KB
- `2023 Spreken II - 16 - opgave 13 - Toerisme.mp3` — 1.6 MB
- `2023 Spreken II - 16 - opgave 13 - Toerisme.opus` — 3.0 MB

**`atili/Dutch/DUO oefenexamens NT2/2024 Luisteren I/audio/`** — 61 files, 129.1 MB

- `2024 Luisteren I - 01 - instructie.mp3` — 556 KB
- `2024 Luisteren I - 01 - instructie.opus` — 570 KB
- `2024 Luisteren I - 02 - Een gesprek met een hoofdconducteur van de Nederlandse Spoorwegen - introductie.mp3` — 2.8 MB
- `2024 Luisteren I - 03 - Een gesprek met een hoofdconducteur van de Nederlandse Spoorwegen - opgave 1.mp3` — 1.0 MB
- `2024 Luisteren I - 04 - Een gesprek met een hoofdconducteur van de Nederlandse Spoorwegen - opgave 2.mp3` — 836 KB
- `2024 Luisteren I - 05 - Een gesprek met een hoofdconducteur van de Nederlandse Spoorwegen - opgave 3.mp3` — 868 KB
- `2024 Luisteren I - 06 - Een gesprek met een hoofdconducteur van de Nederlandse Spoorwegen - opgave 4.mp3` — 820 KB
- `2024 Luisteren I - 07 - Een gesprek met een hoofdconducteur van de Nederlandse Spoorwegen - opgave 5.mp3` — 802 KB
- `2024 Luisteren I - 08 - Een gesprek met een hoofdconducteur van de Nederlandse Spoorwegen - opgave 6.mp3` — 1.0 MB
- `2024 Luisteren I - 09 - Een gesprek met een mbo-studente van de opleiding tot gastvrouw - introductie.mp3` — 1.4 MB
- `2024 Luisteren I - 10 - Een gesprek met een mbo-studente van de opleiding tot gastvrouw - opgave 7.mp3` — 569 KB
- `2024 Luisteren I - 11 - Een gesprek met een mbo-studente van de opleiding tot gastvrouw - opgave 8.mp3` — 633 KB
- `2024 Luisteren I - 12 - Een gesprek met een mbo-studente van de opleiding tot gastvrouw - opgave 9.mp3` — 870 KB
- `2024 Luisteren I - 13 - Een gesprek met een mbo-studente van de opleiding tot gastvrouw - opgave 10.mp3` — 683 KB
- `2024 Luisteren I - 14 - Een gesprek met een mbo-studente van de opleiding tot gastvrouw - opgave 11.mp3` — 697 KB
- `2024 Luisteren I - 15 - Een gesprek met een mbo-studente van de opleiding tot gastvrouw - opgave 12.mp3` — 691 KB
- `2024 Luisteren I - 16 - Een gesprek met een mbo-studente van de opleiding tot gastvrouw - opgave 13.mp3` — 1.2 MB
- `2024 Luisteren I - 17 - Een gesprek met een mbo-studente van de opleiding tot gastvrouw - opgave 14.mp3` — 1.0 MB
- `2024 Luisteren I - 18 - Een gesprek met een mbo-studente van de opleiding tot gastvrouw - opgave 15.mp3` — 829 KB
- `2024 Luisteren I - 19 - Een gesprek met een marktkoopman - introductie.mp3` — 1.1 MB
- `2024 Luisteren I - 20 - Een gesprek met een marktkoopman - opgave 16.mp3` — 823 KB
- `2024 Luisteren I - 21 - Een gesprek met een marktkoopman - opgave 17.mp3` — 806 KB
- `2024 Luisteren I - 22 - Een gesprek met een marktkoopman - opgave 18.mp3` — 850 KB
- `2024 Luisteren I - 23 - Een gesprek met een marktkoopman - opgave 19.mp3` — 940 KB
- `2024 Luisteren I - 24 - Een gesprek met een marktkoopman - opgave 20.mp3` — 710 KB
- `2024 Luisteren I - 25 - Een gesprek met een marktkoopman - opgave 21.mp3` — 710 KB
- `2024 Luisteren I - 26 - Een gesprek met een marktkoopman - opgave 22.mp3` — 805 KB
- `2024 Luisteren I - 27 - Een gesprek met een marktkoopman.mp3` — 813 KB
- `2024 Luisteren I - 28 - Een gesprek met een huisartsassistent - introductie.mp3` — 1.3 MB
- `2024 Luisteren I - 29 - Een gesprek met een huisartsassistent - opgave 24.mp3` — 1.0 MB
- `2024 Luisteren I - 30 - Een gesprek met een huisartsassistent - opgave 25.mp3` — 1.1 MB
- `2024 Luisteren I - 31 - Een gesprek met een huisartsassistent - opgave 26.mp3` — 997 KB
- `2024 Luisteren I - 33 - Een gesprek met een huisartsassistent - opgave 27.mp3` — 1.4 MB
- `2024 Luisteren I - 34 - Een gesprek met een huisartsassistent - opgave 28.mp3` — 587 KB
- `2024 Luisteren I - 35 - Een gesprek met een huisartsassistent - opgave 29.mp3` — 749 KB
- `2024 Luisteren I - 36 - Een gesprek met een huisartsassistent - opgave 30.mp3` — 802 KB
- `2024 Luisteren I - 37 - instructie videodeel.mp3` — 211 KB
- `2024 Luisteren I - 37 - instructie videodeel.opus` — 214 KB
- `2024 Luisteren I - 38 - Een interview met een beeldhouwer van houten beelden - introductie.mp3` — 613 KB
- `2024 Luisteren I - 39 - Een interview met een beeldhouwer van houten beelden - introductie 2.mp4` — 1.3 MB
- `2024 Luisteren I - 39 - Een interview met een beeldhouwer van houten beelden - introductie 2.webm` — 2.0 MB
- `2024 Luisteren I - 40 - instructie.mp3` — 114 KB
- `2024 Luisteren I - 40 - instructie.opus` — 105 KB
- `2024 Luisteren I - 41 - Een interview met een beeldhouwer van houten beelden - opgave 31.mp4` — 4.1 MB
- `2024 Luisteren I - 41 - Een interview met een beeldhouwer van houten beelden - opgave 31.webm` — 7.8 MB
- `2024 Luisteren I - 42 - Een interview met een beeldhouwer van houten beelden - opgave 32.mp4` — 4.9 MB
- `2024 Luisteren I - 42 - Een interview met een beeldhouwer van houten beelden - opgave 32.webm` — 8.4 MB
- `2024 Luisteren I - 43 - Een interview met een beeldhouwer van houten beelden - opgave 33.mp4` — 3.5 MB
- `2024 Luisteren I - 43 - Een interview met een beeldhouwer van houten beelden - opgave 33.webm` — 6.1 MB
- `2024 Luisteren I - 44 - Een interview met een beeldhouwer van houten beelden - opgave 34.mp4` — 3.7 MB
- `2024 Luisteren I - 44 - Een interview met een beeldhouwer van houten beelden - opgave 34.webm` — 6.2 MB
- `2024 Luisteren I - 45 - Een interview met een beeldhouwer van houten beelden - opgave 35.mp4` — 3.7 MB
- `2024 Luisteren I - 45 - Een interview met een beeldhouwer van houten beelden - opgave 35.webm` — 6.2 MB
- `2024 Luisteren I - 46 - Een interview met een beeldhouwer van houten beelden - opgave 36.mp4` — 5.3 MB
- `2024 Luisteren I - 46 - Een interview met een beeldhouwer van houten beelden - opgave 36.webm` — 8.5 MB
- `2024 Luisteren I - 47 - Een interview met een beeldhouwer van houten beelden - opgave 37.mp4` — 4.9 MB
- `2024 Luisteren I - 47 - Een interview met een beeldhouwer van houten beelden - opgave 37.webm` — 8.3 MB
- `2024 Luisteren I - 48 - Een interview met een beeldhouwer van houten beelden - opgave 38.mp4` — 3.7 MB
- `2024 Luisteren I - 48 - Een interview met een beeldhouwer van houten beelden - opgave 38.webm` — 6.1 MB
- `2024 Luisteren I - 49 - Een interview met een beeldhouwer van houten beelden.mp3` — 102 KB
- `2024 Luisteren I - 49 - Een interview met een beeldhouwer van houten beelden.opus` — 116 KB

**`atili/Dutch/DUO oefenexamens NT2/2024 Luisteren II/audio/`** — 92 files, 167.9 MB

- `2024 Luisteren II - 01 - instructie.mp3` — 556 KB
- `2024 Luisteren II - 01 - instructie.opus` — 570 KB
- `2024 Luisteren II - 02 - Een gastcollege over waterbeheer - introductie.mp3` — 3.4 MB
- `2024 Luisteren II - 02 - Een gastcollege over waterbeheer - introductie.opus` — 3.4 MB
- `2024 Luisteren II - 03 - Een gastcollege over waterbeheer - opgave 1.mp3` — 1.4 MB
- `2024 Luisteren II - 03 - Een gastcollege over waterbeheer - opgave 1.opus` — 1.2 MB
- `2024 Luisteren II - 04 - Een gastcollege over waterbeheer - opgave 2.mp3` — 1.4 MB
- `2024 Luisteren II - 04 - Een gastcollege over waterbeheer - opgave 2.opus` — 1.1 MB
- `2024 Luisteren II - 05 - Een gastcollege over waterbeheer - opgave 3.mp3` — 1.4 MB
- `2024 Luisteren II - 05 - Een gastcollege over waterbeheer - opgave 3.opus` — 1.1 MB
- `2024 Luisteren II - 06 - Een gastcollege over waterbeheer - opgave 4.mp3` — 1.3 MB
- `2024 Luisteren II - 06 - Een gastcollege over waterbeheer - opgave 4.opus` — 1.1 MB
- `2024 Luisteren II - 07 - Een gastcollege over waterbeheer - opgave 5.mp3` — 1.3 MB
- `2024 Luisteren II - 07 - Een gastcollege over waterbeheer - opgave 5.opus` — 1.1 MB
- `2024 Luisteren II - 08 - Een gastcollege over waterbeheer - opgave 6.mp3` — 1.6 MB
- `2024 Luisteren II - 08 - Een gastcollege over waterbeheer - opgave 6.opus` — 1.3 MB
- `2024 Luisteren II - 09 - Een gastcollege over waterbeheer - opgave 7.mp3` — 1.2 MB
- `2024 Luisteren II - 09 - Een gastcollege over waterbeheer - opgave 7.opus` — 1.0 MB
- `2024 Luisteren II - 10 - Een gastcollege over waterbeheer - opgave 8.mp3` — 1.7 MB
- `2024 Luisteren II - 10 - Een gastcollege over waterbeheer - opgave 8.opus` — 1.4 MB
- `2024 Luisteren II - 11 - Een gesprek met een vrijwilliger van de Ouderenbond - introductie.mp3` — 1.2 MB
- `2024 Luisteren II - 11 - Een gesprek met een vrijwilliger van de Ouderenbond - introductie.opus` — 1.3 MB
- `2024 Luisteren II - 12 - Een gesprek met een vrijwilliger van de Ouderenbond - opgave 9.mp3` — 695 KB
- `2024 Luisteren II - 12 - Een gesprek met een vrijwilliger van de Ouderenbond - opgave 9.opus` — 641 KB
- `2024 Luisteren II - 13 - Een gesprek met een vrijwilliger van de Ouderenbond - opgave 10.mp3` — 727 KB
- `2024 Luisteren II - 13 - Een gesprek met een vrijwilliger van de Ouderenbond - opgave 10.opus` — 683 KB
- `2024 Luisteren II - 14 - Een gesprek met een vrijwilliger van de Ouderenbond - opgave 11.mp3` — 1.7 MB
- `2024 Luisteren II - 14 - Een gesprek met een vrijwilliger van de Ouderenbond - opgave 11.opus` — 1.6 MB
- `2024 Luisteren II - 15 - Een gesprek met een vrijwilliger van de Ouderenbond - opgave 12.mp3` — 1.0 MB
- `2024 Luisteren II - 15 - Een gesprek met een vrijwilliger van de Ouderenbond - opgave 12.opus` — 1011 KB
- `2024 Luisteren II - 16 - Een gesprek met een vrijwilliger van de Ouderenbond - opgave 13.mp3` — 1.5 MB
- `2024 Luisteren II - 16 - Een gesprek met een vrijwilliger van de Ouderenbond - opgave 13.opus` — 1.3 MB
- `2024 Luisteren II - 17 - Een gesprek met een vrijwilliger van de Ouderenbond - opgave 14.mp3` — 1.4 MB
- `2024 Luisteren II - 17 - Een gesprek met een vrijwilliger van de Ouderenbond - opgave 14.opus` — 1.4 MB
- `2024 Luisteren II - 18 - Een gesprek met een vrijwilliger van de Ouderenbond - opgave 15.mp3` — 797 KB
- `2024 Luisteren II - 18 - Een gesprek met een vrijwilliger van de Ouderenbond - opgave 15.opus` — 732 KB
- `2024 Luisteren II - 19 - Een gesprek met twee binnenhuisarchitecten - introductie.mp3` — 1.7 MB
- `2024 Luisteren II - 19 - Een gesprek met twee binnenhuisarchitecten - introductie.opus` — 1.6 MB
- `2024 Luisteren II - 20 - Een gesprek met twee binnenhuisarchitecten - opgave 16.mp3` — 1.1 MB
- `2024 Luisteren II - 20 - Een gesprek met twee binnenhuisarchitecten - opgave 16.opus` — 1.1 MB
- `2024 Luisteren II - 21 - Een gesprek met twee binnenhuisarchitecten - opgave 17.mp3` — 903 KB
- `2024 Luisteren II - 21 - Een gesprek met twee binnenhuisarchitecten - opgave 17.opus` — 840 KB
- `2024 Luisteren II - 22 - Een gesprek met twee binnenhuisarchitecten - opgave 18.mp3` — 619 KB
- `2024 Luisteren II - 22 - Een gesprek met twee binnenhuisarchitecten - opgave 18.opus` — 598 KB
- `2024 Luisteren II - 23 - Een gesprek met twee binnenhuisarchitecten - opgave 19.mp3` — 1.3 MB
- `2024 Luisteren II - 23 - Een gesprek met twee binnenhuisarchitecten - opgave 19.opus` — 1.2 MB
- `2024 Luisteren II - 24 - Een gesprek met twee binnenhuisarchitecten - opgave 20.mp3` — 873 KB
- `2024 Luisteren II - 24 - Een gesprek met twee binnenhuisarchitecten - opgave 20.opus` — 884 KB
- `2024 Luisteren II - 25 - Een gesprek met twee binnenhuisarchitecten - opgave 21.mp3` — 965 KB
- `2024 Luisteren II - 25 - Een gesprek met twee binnenhuisarchitecten - opgave 21.opus` — 978 KB
- `2024 Luisteren II - 26 - Een gesprek over wilgen knotten - introductie.mp3` — 1.5 MB
- `2024 Luisteren II - 26 - Een gesprek over wilgen knotten - introductie.opus` — 1.5 MB
- `2024 Luisteren II - 27 - Een gesprek over wilgen knotten - opgave 22.mp3` — 1.1 MB
- `2024 Luisteren II - 27 - Een gesprek over wilgen knotten - opgave 22.opus` — 901 KB
- `2024 Luisteren II - 28 - Een gesprek over wilgen knotten - opgave 23.mp3` — 1.4 MB
- `2024 Luisteren II - 28 - Een gesprek over wilgen knotten - opgave 23.opus` — 1.2 MB
- `2024 Luisteren II - 29 - Een gesprek over wilgen knotten - opgave 24.mp3` — 732 KB
- `2024 Luisteren II - 29 - Een gesprek over wilgen knotten - opgave 24.opus` — 616 KB
- `2024 Luisteren II - 30 - Een gesprek over wilgen knotten - opgave 25.mp3` — 1.6 MB
- `2024 Luisteren II - 30 - Een gesprek over wilgen knotten - opgave 25.opus` — 1.3 MB
- `2024 Luisteren II - 31 - Een gesprek over wilgen knotten - opgave 26.mp3` — 761 KB
- `2024 Luisteren II - 31 - Een gesprek over wilgen knotten - opgave 26.opus` — 647 KB
- `2024 Luisteren II - 32 - Een gesprek over wilgen knotten - opgave 27.mp3` — 661 KB
- `2024 Luisteren II - 32 - Een gesprek over wilgen knotten - opgave 27.opus` — 579 KB
- `2024 Luisteren II - 33 - Een gesprek over wilgen knotten - opgave 28.mp3` — 1.0 MB
- `2024 Luisteren II - 33 - Een gesprek over wilgen knotten - opgave 28.opus` — 891 KB
- `2024 Luisteren II - 34 - instructie videodeel.mp3` — 211 KB
- `2024 Luisteren II - 34 - instructie videodeel.opus` — 214 KB
- `2024 Luisteren II - 35 - Een gesprek over duurzame mode - introductie.mp3` — 500 KB
- `2024 Luisteren II - 35 - Een gesprek over duurzame mode - introductie.opus` — 408 KB
- `2024 Luisteren II - 36 - Een gesprek over duurzame mode - opgave 29.mp4` — 5.6 MB
- `2024 Luisteren II - 36 - Een gesprek over duurzame mode - opgave 29.webm` — 9.5 MB
- `2024 Luisteren II - 37 - Een gesprek over duurzame mode - opgave 30.mp4` — 5.7 MB
- `2024 Luisteren II - 37 - Een gesprek over duurzame mode - opgave 30.webm` — 8.6 MB
- `2024 Luisteren II - 38 - Een gesprek over duurzame mode - opgave 31.mp4` — 3.3 MB
- `2024 Luisteren II - 38 - Een gesprek over duurzame mode - opgave 31.webm` — 5.5 MB
- `2024 Luisteren II - 39 - Een gesprek over duurzame mode - opgave 32.mp4` — 2.7 MB
- `2024 Luisteren II - 39 - Een gesprek over duurzame mode - opgave 32.webm` — 4.0 MB
- `2024 Luisteren II - 40 - Een gesprek over duurzame mode - opgave 33.mp4` — 4.8 MB
- `2024 Luisteren II - 40 - Een gesprek over duurzame mode - opgave 33.webm` — 6.9 MB
- `2024 Luisteren II - 41 - Een filmpje over een bijzondere fiets - introductie.mp3` — 285 KB
- `2024 Luisteren II - 41 - Een filmpje over een bijzondere fiets - introductie.opus` — 263 KB
- `2024 Luisteren II - 42 - Een filmpje over een bijzondere fiets - opgave 34.mp4` — 2.7 MB
- `2024 Luisteren II - 42 - Een filmpje over een bijzondere fiets - opgave 34.webm` — 3.3 MB
- `2024 Luisteren II - 43 - Een filmpje over een bijzondere fiets - opgave 35.mp4` — 5.8 MB
- `2024 Luisteren II - 43 - Een filmpje over een bijzondere fiets - opgave 35.webm` — 6.4 MB
- `2024 Luisteren II - 44 - Een filmpje over een bijzondere fiets - opgave 36.mp4` — 1.9 MB
- `2024 Luisteren II - 44 - Een filmpje over een bijzondere fiets - opgave 36.webm` — 2.7 MB
- `2024 Luisteren II - 45 - Een filmpje over een bijzondere fiets - opgave 37.mp4` — 3.8 MB
- `2024 Luisteren II - 45 - Een filmpje over een bijzondere fiets - opgave 37.webm` — 5.7 MB
- `2024 Luisteren II - 46 - Een filmpje over een bijzondere fiets.mp3` — 102 KB
- `2024 Luisteren II - 46 - Een filmpje over een bijzondere fiets.opus` — 116 KB

**`atili/Dutch/DUO oefenexamens NT2/2024 Spreken I/audio/`** — 38 files, 21.8 MB

- `2024 Spreken I - 01 - deel 1 instructie.mp3` — 1.1 MB
- `2024 Spreken I - 01 - deel 1 instructie.opus` — 1.3 MB
- `2024 Spreken I - 02 - opgave 1 - Foto's van een huwelijk.mp3` — 378 KB
- `2024 Spreken I - 02 - opgave 1 - Foto's van een huwelijk.opus` — 305 KB
- `2024 Spreken I - 03 - opgave 2 - Agenda.mp3` — 539 KB
- `2024 Spreken I - 03 - opgave 2 - Agenda.opus` — 436 KB
- `2024 Spreken I - 04 - opgave 3 - Boodschappen gedaan.mp3` — 293 KB
- `2024 Spreken I - 04 - opgave 3 - Boodschappen gedaan.opus` — 371 KB
- `2024 Spreken I - 05 - opgave 4 - Stageplaats.mp3` — 323 KB
- `2024 Spreken I - 05 - opgave 4 - Stageplaats.opus` — 347 KB
- `2024 Spreken I - 06 - opgave 5 - Kaaswinkel.mp3` — 367 KB
- `2024 Spreken I - 06 - opgave 5 - Kaaswinkel.opus` — 394 KB
- `2024 Spreken I - 07 - opgave 6 - Schoolkantine (tweede versie).mp3` — 359 KB
- `2024 Spreken I - 07 - opgave 6 - Schoolkantine (tweede versie).opus` — 324 KB
- `2024 Spreken I - 07 - opgave 6 - Schoolkantine.mp3` — 389 KB
- `2024 Spreken I - 07 - opgave 6 - Schoolkantine.opus` — 333 KB
- `2024 Spreken I - 08 - opgave 7 - Feestavond in de buurt.mp3` — 223 KB
- `2024 Spreken I - 08 - opgave 7 - Feestavond in de buurt.opus` — 242 KB
- `2024 Spreken I - 09 - opgave 8 - Dierverzorger.mp3` — 503 KB
- `2024 Spreken I - 09 - opgave 8 - Dierverzorger.opus` — 595 KB
- `2024 Spreken I - 10 - deel 2 instructie.mp3` — 1.5 MB
- `2024 Spreken I - 10 - deel 2 instructie.opus` — 2.0 MB
- `2024 Spreken I - 11 - opgave 9 - Keuze taal.mp3` — 625 KB
- `2024 Spreken I - 11 - opgave 9 - Keuze taal.opus` — 844 KB
- `2024 Spreken I - 12 - opgave 10 - Begeleid wonen.mp3` — 671 KB
- `2024 Spreken I - 12 - opgave 10 - Begeleid wonen.opus` — 625 KB
- `2024 Spreken I - 13 - opgave 11 - Meer bewegen.mp3` — 392 KB
- `2024 Spreken I - 13 - opgave 11 - Meer bewegen.opus` — 614 KB
- `2024 Spreken I - 14 - opgave 12 - Dingen vervangen.mp3` — 574 KB
- `2024 Spreken I - 14 - opgave 12 - Dingen vervangen.opus` — 773 KB
- `2024 Spreken I - 15 - opgave 13 - Schoolkeuze.mp3` — 406 KB
- `2024 Spreken I - 15 - opgave 13 - Schoolkeuze.opus` — 559 KB
- `2024 Spreken I - 16 - opgave 14 - Stage in Spanje.mp3` — 623 KB
- `2024 Spreken I - 16 - opgave 14 - Stage in Spanje.opus` — 625 KB
- `2024 Spreken I - 17 - opgave 15 - Yoga.mp3` — 512 KB
- `2024 Spreken I - 17 - opgave 15 - Yoga.opus` — 752 KB
- `2024 Spreken I - 18 - opgave 16 - Machines.mp3` — 538 KB
- `2024 Spreken I - 18 - opgave 16 - Machines.opus` — 489 KB

**`atili/Dutch/DUO oefenexamens NT2/2024 Spreken II/audio/`** — 32 files, 28.4 MB

- `2024 Spreken II - 01 - deel 1 instructie.mp3` — 1.5 MB
- `2024 Spreken II - 01 - deel 1 instructie.opus` — 1.2 MB
- `2024 Spreken II - 02 - opgave 1 - Rijexamen.mp3` — 592 KB
- `2024 Spreken II - 02 - opgave 1 - Rijexamen.opus` — 615 KB
- `2024 Spreken II - 03 - opgave 2 - 's Avonds college.mp3` — 431 KB
- `2024 Spreken II - 03 - opgave 2 - 's Avonds college.opus` — 423 KB
- `2024 Spreken II - 04 - opgave 3 - Bezorgdienst.mp3` — 487 KB
- `2024 Spreken II - 04 - opgave 3 - Bezorgdienst.opus` — 524 KB
- `2024 Spreken II - 05 - opgave 4 - Vragen stellen.mp3` — 601 KB
- `2024 Spreken II - 05 - opgave 4 - Vragen stellen.opus` — 494 KB
- `2024 Spreken II - 06 - deel 2 instructie.mp3` — 2.3 MB
- `2024 Spreken II - 06 - deel 2 instructie.opus` — 1.9 MB
- `2024 Spreken II - 07 - opgave 5 - Kamer verven.mp3` — 631 KB
- `2024 Spreken II - 07 - opgave 5 - Kamer verven.opus` — 676 KB
- `2024 Spreken II - 08 - opgave 6 - Tas.mp3` — 790 KB
- `2024 Spreken II - 08 - opgave 6 - Tas.opus` — 749 KB
- `2024 Spreken II - 09 - opgave 7 - Pasje aanvragen.mp3` — 821 KB
- `2024 Spreken II - 09 - opgave 7 - Pasje aanvragen.opus` — 790 KB
- `2024 Spreken II - 10 - opgave 8 - Uitwisseling.mp3` — 706 KB
- `2024 Spreken II - 10 - opgave 8 - Uitwisseling.opus` — 830 KB
- `2024 Spreken II - 11 - opgave 9 - Ontevreden over cursus.mp3` — 477 KB
- `2024 Spreken II - 11 - opgave 9 - Ontevreden over cursus.opus` — 631 KB
- `2024 Spreken II - 12 - opgave 10 - Hogeschool of universiteit-.mp3` — 428 KB
- `2024 Spreken II - 12 - opgave 10 - Hogeschool of universiteit-.opus` — 595 KB
- `2024 Spreken II - 13 - opgave 11 - Geld voor goed doel.mp3` — 741 KB
- `2024 Spreken II - 13 - opgave 11 - Geld voor goed doel.opus` — 801 KB
- `2024 Spreken II - 14 - opgave 12 - Maximumsnelheid.mp3` — 453 KB
- `2024 Spreken II - 14 - opgave 12 - Maximumsnelheid.opus` — 598 KB
- `2024 Spreken II - 15 - deel 3 instructie.mp3` — 582 KB
- `2024 Spreken II - 15 - deel 3 instructie.opus` — 463 KB
- `2024 Spreken II - 16 - opgave 13 - Geluidsoverlast.mp3` — 3.0 MB
- `2024 Spreken II - 16 - opgave 13 - Geluidsoverlast.opus` — 3.0 MB

**`atili/Dutch/DUO oefenexamens NT2/2025 Luisteren I/audio/`** — 100 files, 128.6 MB

- `2025 Luisteren I - 01 - instructie.mp3` — 556 KB
- `2025 Luisteren I - 01 - instructie.opus` — 570 KB
- `2025 Luisteren I - 02 - Een gesprek met een decaan van natuuropleidingen - introductie.mp3` — 2.5 MB
- `2025 Luisteren I - 02 - Een gesprek met een decaan van natuuropleidingen - introductie.opus` — 3.2 MB
- `2025 Luisteren I - 03 - Een gesprek met een decaan van natuuropleidingen - opgave 1.mp3` — 738 KB
- `2025 Luisteren I - 03 - Een gesprek met een decaan van natuuropleidingen - opgave 1.opus` — 855 KB
- `2025 Luisteren I - 04 - Een gesprek met een decaan van natuuropleidingen - opgave 2.mp3` — 825 KB
- `2025 Luisteren I - 04 - Een gesprek met een decaan van natuuropleidingen - opgave 2.opus` — 921 KB
- `2025 Luisteren I - 05 - Een gesprek met een decaan van natuuropleidingen - opgave 3.mp3` — 1.0 MB
- `2025 Luisteren I - 05 - Een gesprek met een decaan van natuuropleidingen - opgave 3.opus` — 1.2 MB
- `2025 Luisteren I - 06 - Een gesprek met een decaan van natuuropleidingen - opgave 4.mp3` — 566 KB
- `2025 Luisteren I - 06 - Een gesprek met een decaan van natuuropleidingen - opgave 4.opus` — 678 KB
- `2025 Luisteren I - 07 - Een gesprek met een decaan van natuuropleidingen - opgave 5.mp3` — 793 KB
- `2025 Luisteren I - 07 - Een gesprek met een decaan van natuuropleidingen - opgave 5.opus` — 944 KB
- `2025 Luisteren I - 08 - Een gesprek met Janine van der Deure over veranderingen in - introductie.mp3` — 1.2 MB
- `2025 Luisteren I - 08 - Een gesprek met Janine van der Deure over veranderingen in - introductie.opus` — 1.1 MB
- `2025 Luisteren I - 09 - Een gesprek met Janine van der Deure over veranderingen in - opgave 6.mp3` — 1.4 MB
- `2025 Luisteren I - 09 - Een gesprek met Janine van der Deure over veranderingen in - opgave 6.opus` — 1.3 MB
- `2025 Luisteren I - 10 - Een gesprek met Janine van der Deure over veranderingen in - opgave 7.mp3` — 1.0 MB
- `2025 Luisteren I - 10 - Een gesprek met Janine van der Deure over veranderingen in - opgave 7.opus` — 964 KB
- `2025 Luisteren I - 11 - Een gesprek met Janine van der Deure over veranderingen in - opgave 8.mp3` — 1.5 MB
- `2025 Luisteren I - 11 - Een gesprek met Janine van der Deure over veranderingen in - opgave 8.opus` — 1.3 MB
- `2025 Luisteren I - 12 - Een gesprek met Janine van der Deure over veranderingen in - opgave 9.mp3` — 1.7 MB
- `2025 Luisteren I - 12 - Een gesprek met Janine van der Deure over veranderingen in - opgave 9.opus` — 1.5 MB
- `2025 Luisteren I - 13 - Een gesprek met Janine van der Deure over veranderingen in - opgave 10.mp3` — 1.2 MB
- `2025 Luisteren I - 13 - Een gesprek met Janine van der Deure over veranderingen in - opgave 10.opus` — 1.1 MB
- `2025 Luisteren I - 14 - Een gesprek met Janine van der Deure over veranderingen in - opgave 11.mp3` — 1.1 MB
- `2025 Luisteren I - 14 - Een gesprek met Janine van der Deure over veranderingen in - opgave 11.opus` — 978 KB
- `2025 Luisteren I - 15 - Een gesprek met Janine van der Deure over veranderingen in - opgave 12.mp3` — 1.1 MB
- `2025 Luisteren I - 15 - Een gesprek met Janine van der Deure over veranderingen in - opgave 12.opus` — 977 KB
- `2025 Luisteren I - 16 - Een gesprek met Janine van der Deure over veranderingen in - opgave 13.mp3` — 978 KB
- `2025 Luisteren I - 16 - Een gesprek met Janine van der Deure over veranderingen in - opgave 13.opus` — 883 KB
- `2025 Luisteren I - 17 - Een functioneringsgesprek - introductie.mp3` — 845 KB
- `2025 Luisteren I - 17 - Een functioneringsgesprek - introductie.opus` — 887 KB
- `2025 Luisteren I - 18 - Een functioneringsgesprek - opgave 14.mp3` — 1021 KB
- `2025 Luisteren I - 18 - Een functioneringsgesprek - opgave 14.opus` — 1.1 MB
- `2025 Luisteren I - 19 - Een functioneringsgesprek - opgave 15.mp3` — 714 KB
- `2025 Luisteren I - 19 - Een functioneringsgesprek - opgave 15.opus` — 717 KB
- `2025 Luisteren I - 20 - Een functioneringsgesprek - opgave 16.mp3` — 1.1 MB
- `2025 Luisteren I - 20 - Een functioneringsgesprek - opgave 16.opus` — 1.2 MB
- `2025 Luisteren I - 21 - Een functioneringsgesprek - opgave 17.mp3` — 849 KB
- `2025 Luisteren I - 21 - Een functioneringsgesprek - opgave 17.opus` — 858 KB
- `2025 Luisteren I - 22 - Een functioneringsgesprek - opgave 18.mp3` — 1019 KB
- `2025 Luisteren I - 22 - Een functioneringsgesprek - opgave 18.opus` — 1.0 MB
- `2025 Luisteren I - 23 - Een gesprek met een suppoost - introductie.mp3` — 843 KB
- `2025 Luisteren I - 23 - Een gesprek met een suppoost - introductie.opus` — 848 KB
- `2025 Luisteren I - 24 - Een gesprek met een suppoost - opgave 19.mp3` — 677 KB
- `2025 Luisteren I - 24 - Een gesprek met een suppoost - opgave 19.opus` — 844 KB
- `2025 Luisteren I - 25 - Een gesprek met een suppoost.mp3` — 421 KB
- `2025 Luisteren I - 25 - Een gesprek met een suppoost.opus` — 527 KB
- `2025 Luisteren I - 26 - Een gesprek met een suppoost.mp3` — 566 KB
- `2025 Luisteren I - 26 - Een gesprek met een suppoost.opus` — 676 KB
- `2025 Luisteren I - 27 - Een gesprek met een suppoost.mp3` — 777 KB
- `2025 Luisteren I - 27 - Een gesprek met een suppoost.opus` — 944 KB
- `2025 Luisteren I - 28 - Een gesprek met een suppoost.mp3` — 457 KB
- `2025 Luisteren I - 28 - Een gesprek met een suppoost.opus` — 586 KB
- `2025 Luisteren I - 29 - Een gesprek met een personal trainer - introductie.mp3` — 733 KB
- `2025 Luisteren I - 29 - Een gesprek met een personal trainer - introductie.opus` — 693 KB
- `2025 Luisteren I - 30 - Een gesprek met een personal trainer - opgave 24.mp3` — 1.1 MB
- `2025 Luisteren I - 30 - Een gesprek met een personal trainer - opgave 24.opus` — 918 KB
- `2025 Luisteren I - 31 - Een gesprek met een personal trainer - opgave 25.mp3` — 1.2 MB
- `2025 Luisteren I - 31 - Een gesprek met een personal trainer - opgave 25.opus` — 942 KB
- `2025 Luisteren I - 32 - Een gesprek met een personal trainer - opgave 26.mp3` — 629 KB
- `2025 Luisteren I - 32 - Een gesprek met een personal trainer - opgave 26.opus` — 502 KB
- `2025 Luisteren I - 33 - Een gesprek met een personal trainer - opgave 27.mp3` — 1.1 MB
- `2025 Luisteren I - 33 - Een gesprek met een personal trainer - opgave 27.opus` — 915 KB
- `2025 Luisteren I - 34 - Een gesprek met een personal trainer - opgave 28.mp3` — 673 KB
- `2025 Luisteren I - 34 - Een gesprek met een personal trainer - opgave 28.opus` — 546 KB
- `2025 Luisteren I - 35 - Een gesprek met een personal trainer - opgave 29.mp3` — 1.1 MB
- `2025 Luisteren I - 35 - Een gesprek met een personal trainer - opgave 29.opus` — 877 KB
- `2025 Luisteren I - 36 - Een gesprek met een personal trainer - opgave 30.mp3` — 897 KB
- `2025 Luisteren I - 36 - Een gesprek met een personal trainer - opgave 30.opus` — 704 KB
- `2025 Luisteren I - 37 - Een gesprek met een personal trainer - opgave 31.mp3` — 947 KB
- `2025 Luisteren I - 37 - Een gesprek met een personal trainer - opgave 31.opus` — 767 KB
- `2025 Luisteren I - 38 - Een gesprek met een personal trainer - opgave 32.mp3` — 863 KB
- `2025 Luisteren I - 38 - Een gesprek met een personal trainer - opgave 32.opus` — 703 KB
- `2025 Luisteren I - 39 - instructie videodeel.mp3` — 211 KB
- `2025 Luisteren I - 39 - instructie videodeel.opus` — 214 KB
- `2025 Luisteren I - 40 - Een gesprek met een onderwijsassistente - introductie 1.mp3` — 341 KB
- `2025 Luisteren I - 40 - Een gesprek met een onderwijsassistente - introductie 1.opus` — 354 KB
- `2025 Luisteren I - 41 - Een gesprek met een onderwijsassistente - introductie 2.mp4` — 2.5 MB
- `2025 Luisteren I - 41 - Een gesprek met een onderwijsassistente - introductie 2.webm` — 5.6 MB
- `2025 Luisteren I - 42 - instructie.mp3` — 114 KB
- `2025 Luisteren I - 42 - instructie.opus` — 105 KB
- `2025 Luisteren I - 43 - Een gesprek met een onderwijsassistente - opgave 33.mp4` — 1.8 MB
- `2025 Luisteren I - 43 - Een gesprek met een onderwijsassistente - opgave 33.webm` — 4.2 MB
- `2025 Luisteren I - 44 - Een gesprek met een onderwijsassistente - opgave 34.mp4` — 3.1 MB
- `2025 Luisteren I - 44 - Een gesprek met een onderwijsassistente - opgave 34.webm` — 5.9 MB
- `2025 Luisteren I - 45 - Een gesprek met een onderwijsassistente - opgave 35.mp4` — 2.2 MB
- `2025 Luisteren I - 45 - Een gesprek met een onderwijsassistente - opgave 35.webm` — 4.7 MB
- `2025 Luisteren I - 46 - Een gesprek met een onderwijsassistente - opgave 36.mp4` — 1.7 MB
- `2025 Luisteren I - 46 - Een gesprek met een onderwijsassistente - opgave 36.webm` — 3.8 MB
- `2025 Luisteren I - 47 - Een gesprek met een onderwijsassistente - opgave 37.mp4` — 2.0 MB
- `2025 Luisteren I - 47 - Een gesprek met een onderwijsassistente - opgave 37.webm` — 6.8 MB
- `2025 Luisteren I - 48 - Een gesprek met een onderwijsassistente - opgave 38.mp4` — 1.2 MB
- `2025 Luisteren I - 48 - Een gesprek met een onderwijsassistente - opgave 38.webm` — 2.6 MB
- `2025 Luisteren I - 49 - Een gesprek met een onderwijsassistente - opgave 39.mp4` — 2.3 MB
- `2025 Luisteren I - 49 - Een gesprek met een onderwijsassistente - opgave 39.webm` — 4.8 MB
- `2025 Luisteren I - 50 - Een gesprek met een onderwijsassistente.mp3` — 102 KB
- `2025 Luisteren I - 50 - Een gesprek met een onderwijsassistente.opus` — 116 KB

**`atili/Dutch/DUO oefenexamens NT2/2025 Luisteren II/audio/`** — 96 files, 159.1 MB

- `2025 Luisteren II - 01 - instructie.mp3` — 556 KB
- `2025 Luisteren II - 01 - instructie.opus` — 570 KB
- `2025 Luisteren II - 02 - Een sollicitatiegesprek met een hbo-docent - introductie.mp3` — 2.9 MB
- `2025 Luisteren II - 02 - Een sollicitatiegesprek met een hbo-docent - introductie.opus` — 3.3 MB
- `2025 Luisteren II - 03 - Een sollicitatiegesprek met een hbo-docent - opgave 1.mp3` — 1.1 MB
- `2025 Luisteren II - 03 - Een sollicitatiegesprek met een hbo-docent - opgave 1.opus` — 1.3 MB
- `2025 Luisteren II - 04 - Een sollicitatiegesprek met een hbo-docent - opgave 2.mp3` — 1.0 MB
- `2025 Luisteren II - 04 - Een sollicitatiegesprek met een hbo-docent - opgave 2.opus` — 1.1 MB
- `2025 Luisteren II - 05 - Een sollicitatiegesprek met een hbo-docent - opgave 3.mp3` — 833 KB
- `2025 Luisteren II - 05 - Een sollicitatiegesprek met een hbo-docent - opgave 3.opus` — 928 KB
- `2025 Luisteren II - 06 - Een sollicitatiegesprek met een hbo-docent - opgave 4.mp3` — 717 KB
- `2025 Luisteren II - 06 - Een sollicitatiegesprek met een hbo-docent - opgave 4.opus` — 803 KB
- `2025 Luisteren II - 07 - Een sollicitatiegesprek met een hbo-docent - opgave 5.mp3` — 880 KB
- `2025 Luisteren II - 07 - Een sollicitatiegesprek met een hbo-docent - opgave 5.opus` — 1013 KB
- `2025 Luisteren II - 08 - Een sollicitatiegesprek met een hbo-docent - opgave 6.mp3` — 846 KB
- `2025 Luisteren II - 08 - Een sollicitatiegesprek met een hbo-docent - opgave 6.opus` — 957 KB
- `2025 Luisteren II - 09 - Een sollicitatiegesprek met een hbo-docent - opgave 7.mp3` — 709 KB
- `2025 Luisteren II - 09 - Een sollicitatiegesprek met een hbo-docent - opgave 7.opus` — 808 KB
- `2025 Luisteren II - 10 - Een sollicitatiegesprek met een hbo-docent - opgave 8.mp3` — 649 KB
- `2025 Luisteren II - 10 - Een sollicitatiegesprek met een hbo-docent - opgave 8.opus` — 734 KB
- `2025 Luisteren II - 11 - Een gesprek met een zorggroepmanager - introductie.mp3` — 1.5 MB
- `2025 Luisteren II - 11 - Een gesprek met een zorggroepmanager - introductie.opus` — 1.4 MB
- `2025 Luisteren II - 12 - Een gesprek met een zorggroepmanager - opgave 9.mp3` — 722 KB
- `2025 Luisteren II - 12 - Een gesprek met een zorggroepmanager - opgave 9.opus` — 960 KB
- `2025 Luisteren II - 13 - Een gesprek met een zorggroepmanager - opgave 10.mp3` — 619 KB
- `2025 Luisteren II - 13 - Een gesprek met een zorggroepmanager - opgave 10.opus` — 826 KB
- `2025 Luisteren II - 14 - Een gesprek met een zorggroepmanager - opgave 11.mp3` — 534 KB
- `2025 Luisteren II - 14 - Een gesprek met een zorggroepmanager - opgave 11.opus` — 708 KB
- `2025 Luisteren II - 15 - Een gesprek met een zorggroepmanager - opgave 12.mp3` — 827 KB
- `2025 Luisteren II - 15 - Een gesprek met een zorggroepmanager - opgave 12.opus` — 1.1 MB
- `2025 Luisteren II - 16 - Een gesprek met een zorggroepmanager - opgave 13.mp3` — 601 KB
- `2025 Luisteren II - 16 - Een gesprek met een zorggroepmanager - opgave 13.opus` — 815 KB
- `2025 Luisteren II - 17 - Een gesprek met een zorggroepmanager - opgave 14.mp3` — 674 KB
- `2025 Luisteren II - 17 - Een gesprek met een zorggroepmanager - opgave 14.opus` — 876 KB
- `2025 Luisteren II - 18 - Een gesprek met een zorggroepmanager - opgave 15.mp3` — 463 KB
- `2025 Luisteren II - 18 - Een gesprek met een zorggroepmanager - opgave 15.opus` — 639 KB
- `2025 Luisteren II - 19 - Lezing sportrusten - introductie.mp3` — 2.3 MB
- `2025 Luisteren II - 19 - Lezing sportrusten - introductie.opus` — 2.5 MB
- `2025 Luisteren II - 20 - Lezing sportrusten - opgave 16.mp3` — 879 KB
- `2025 Luisteren II - 20 - Lezing sportrusten - opgave 16.opus` — 1.0 MB
- `2025 Luisteren II - 21 - Lezing sportrusten - opgave 17.mp3` — 770 KB
- `2025 Luisteren II - 21 - Lezing sportrusten - opgave 17.opus` — 935 KB
- `2025 Luisteren II - 22 - Lezing sportrusten - opgave 18.mp3` — 651 KB
- `2025 Luisteren II - 22 - Lezing sportrusten - opgave 18.opus` — 786 KB
- `2025 Luisteren II - 23 - Lezing sportrusten - opgave 19.mp3` — 971 KB
- `2025 Luisteren II - 23 - Lezing sportrusten - opgave 19.opus` — 1.0 MB
- `2025 Luisteren II - 24 - Lezing sportrusten - opgave 20.mp3` — 887 KB
- `2025 Luisteren II - 24 - Lezing sportrusten - opgave 20.opus` — 1.0 MB
- `2025 Luisteren II - 25 - Lezing sportrusten - opgave 21.mp3` — 674 KB
- `2025 Luisteren II - 25 - Lezing sportrusten - opgave 21.opus` — 803 KB
- `2025 Luisteren II - 26 - Lezing sportrusten - opgave 22.mp3` — 914 KB
- `2025 Luisteren II - 26 - Lezing sportrusten - opgave 22.opus` — 1.0 MB
- `2025 Luisteren II - 27 - Lezing sportrusten - opgave 23.mp3` — 883 KB
- `2025 Luisteren II - 27 - Lezing sportrusten - opgave 23.opus` — 1.0 MB
- `2025 Luisteren II - 28 - Lezing sportrusten - opgave 24.mp3` — 904 KB
- `2025 Luisteren II - 28 - Lezing sportrusten - opgave 24.opus` — 1.1 MB
- `2025 Luisteren II - 29 - Een interview met theaterdocent Marloes Heemskerk - introductie.mp3` — 660 KB
- `2025 Luisteren II - 29 - Een interview met theaterdocent Marloes Heemskerk - introductie.opus` — 633 KB
- `2025 Luisteren II - 30 - Een interview met theaterdocent Marloes Heemskerk - opgave 25.mp3` — 1.4 MB
- `2025 Luisteren II - 30 - Een interview met theaterdocent Marloes Heemskerk - opgave 25.opus` — 1.1 MB
- `2025 Luisteren II - 31 - Een interview met theaterdocent Marloes Heemskerk - opgave 26.mp3` — 1.6 MB
- `2025 Luisteren II - 31 - Een interview met theaterdocent Marloes Heemskerk - opgave 26.opus` — 1.2 MB
- `2025 Luisteren II - 32 - Een interview met theaterdocent Marloes Heemskerk - opgave 27.mp3` — 1.5 MB
- `2025 Luisteren II - 32 - Een interview met theaterdocent Marloes Heemskerk - opgave 27.opus` — 1.2 MB
- `2025 Luisteren II - 33 - Een interview met theaterdocent Marloes Heemskerk - opgave 28.mp3` — 1.3 MB
- `2025 Luisteren II - 33 - Een interview met theaterdocent Marloes Heemskerk - opgave 28.opus` — 1.0 MB
- `2025 Luisteren II - 34 - Een interview met theaterdocent Marloes Heemskerk - opgave 29.mp3` — 1.6 MB
- `2025 Luisteren II - 34 - Een interview met theaterdocent Marloes Heemskerk - opgave 29.opus` — 1.3 MB
- `2025 Luisteren II - 35 - Een interview met theaterdocent Marloes Heemskerk - opgave 30.mp3` — 1.7 MB
- `2025 Luisteren II - 35 - Een interview met theaterdocent Marloes Heemskerk - opgave 30.opus` — 1.3 MB
- `2025 Luisteren II - 36 - instructie videodeel.mp3` — 211 KB
- `2025 Luisteren II - 36 - instructie videodeel.opus` — 214 KB
- `2025 Luisteren II - 37 - Een interview met een stadsgids - introductie 1.mp3` — 337 KB
- `2025 Luisteren II - 37 - Een interview met een stadsgids - introductie 1.opus` — 343 KB
- `2025 Luisteren II - 38 - Een interview met een stadsgids - introductie 2.mp4` — 1.0 MB
- `2025 Luisteren II - 38 - Een interview met een stadsgids - introductie 2.webm` — 2.1 MB
- `2025 Luisteren II - 39 - instructie.mp3` — 114 KB
- `2025 Luisteren II - 39 - instructie.opus` — 105 KB
- `2025 Luisteren II - 40 - Een interview met een stadsgids - opgave 31.mp4` — 2.8 MB
- `2025 Luisteren II - 40 - Een interview met een stadsgids - opgave 31.webm` — 6.9 MB
- `2025 Luisteren II - 41 - Een interview met een stadsgids - opgave 32.mp4` — 3.4 MB
- `2025 Luisteren II - 41 - Een interview met een stadsgids - opgave 32.webm` — 8.6 MB
- `2025 Luisteren II - 42 - Een interview met een stadsgids - opgave 33.mp4` — 2.8 MB
- `2025 Luisteren II - 42 - Een interview met een stadsgids - opgave 33.webm` — 6.3 MB
- `2025 Luisteren II - 43 - Een interview met een stadsgids - opgave 34.mp4` — 2.8 MB
- `2025 Luisteren II - 43 - Een interview met een stadsgids - opgave 34.webm` — 7.0 MB
- `2025 Luisteren II - 44 - Een interview met een stadsgids - opgave 35.mp4` — 3.0 MB
- `2025 Luisteren II - 44 - Een interview met een stadsgids - opgave 35.webm` — 7.2 MB
- `2025 Luisteren II - 45 - Een interview met een stadsgids - opgave 36.mp4` — 2.8 MB
- `2025 Luisteren II - 45 - Een interview met een stadsgids - opgave 36.webm` — 6.4 MB
- `2025 Luisteren II - 46 - Een interview met een stadsgids - opgave 37.mp4` — 2.6 MB
- `2025 Luisteren II - 46 - Een interview met een stadsgids - opgave 37.webm` — 5.8 MB
- `2025 Luisteren II - 47 - Een interview met een stadsgids - opgave 38.mp4` — 3.8 MB
- `2025 Luisteren II - 47 - Een interview met een stadsgids - opgave 38.webm` — 9.7 MB
- `2025 Luisteren II - 48 - Een interview met een stadsgids.mp3` — 102 KB
- `2025 Luisteren II - 48 - Een interview met een stadsgids.opus` — 116 KB

**`atili/Dutch/DUO oefenexamens NT2/2025 Spreken I/audio/`** — 36 files, 21.7 MB

- `2025 Spreken I - 01 - deel 1 instructie.mp3` — 1.0 MB
- `2025 Spreken I - 01 - deel 1 instructie.opus` — 1.3 MB
- `2025 Spreken I - 02 - opgave 1 - Helpen in de tuin.mp3` — 351 KB
- `2025 Spreken I - 02 - opgave 1 - Helpen in de tuin.opus` — 309 KB
- `2025 Spreken I - 03 - opgave 2 - Nieuw rooster.mp3` — 511 KB
- `2025 Spreken I - 03 - opgave 2 - Nieuw rooster.opus` — 481 KB
- `2025 Spreken I - 04 - opgave 3 - Een concert.mp3` — 428 KB
- `2025 Spreken I - 04 - opgave 3 - Een concert.opus` — 442 KB
- `2025 Spreken I - 05 - opgave 4 - Sleutels kwijt.mp3` — 386 KB
- `2025 Spreken I - 05 - opgave 4 - Sleutels kwijt.opus` — 349 KB
- `2025 Spreken I - 06 - opgave 5 - Zaterdag of zondag-.mp3` — 445 KB
- `2025 Spreken I - 06 - opgave 5 - Zaterdag of zondag-.opus` — 483 KB
- `2025 Spreken I - 07 - opgave 6 - Te laat.mp3` — 481 KB
- `2025 Spreken I - 07 - opgave 6 - Te laat.opus` — 386 KB
- `2025 Spreken I - 08 - opgave 7 - Bibliotheek.mp3` — 312 KB
- `2025 Spreken I - 08 - opgave 7 - Bibliotheek.opus` — 407 KB
- `2025 Spreken I - 09 - opgave 8 - Pakketjes.mp3` — 248 KB
- `2025 Spreken I - 09 - opgave 8 - Pakketjes.opus` — 323 KB
- `2025 Spreken I - 10 - deel 2 instructie.mp3` — 1.4 MB
- `2025 Spreken I - 10 - deel 2 instructie.opus` — 1.9 MB
- `2025 Spreken I - 11 - opgave 9 - Naar zee.mp3` — 466 KB
- `2025 Spreken I - 11 - opgave 9 - Naar zee.opus` — 675 KB
- `2025 Spreken I - 12 - opgave 10 - Pizza's bezorgen.mp3` — 590 KB
- `2025 Spreken I - 12 - opgave 10 - Pizza's bezorgen.opus` — 580 KB
- `2025 Spreken I - 13 - opgave 11 - Opleiding Fotografie.mp3` — 590 KB
- `2025 Spreken I - 13 - opgave 11 - Opleiding Fotografie.opus` — 784 KB
- `2025 Spreken I - 14 - opgave 12 - Welke sport-.mp3` — 785 KB
- `2025 Spreken I - 14 - opgave 12 - Welke sport-.opus` — 881 KB
- `2025 Spreken I - 15 - opgave 13 - Kamers opruimen.mp3` — 692 KB
- `2025 Spreken I - 15 - opgave 13 - Kamers opruimen.opus` — 828 KB
- `2025 Spreken I - 16 - opgave 14 - Kinderfeest.mp3` — 463 KB
- `2025 Spreken I - 16 - opgave 14 - Kinderfeest.opus` — 664 KB
- `2025 Spreken I - 17 - opgave 15 - Student Landbouwschool.mp3` — 523 KB
- `2025 Spreken I - 17 - opgave 15 - Student Landbouwschool.opus` — 604 KB
- `2025 Spreken I - 18 - opgave 16 - Lunchpauze.mp3` — 423 KB
- `2025 Spreken I - 18 - opgave 16 - Lunchpauze.opus` — 619 KB

**`atili/Dutch/DUO oefenexamens NT2/2025 Spreken II/audio/`** — 32 files, 30.0 MB

- `2025 Spreken II - 01 - deel 1 instructie.mp3` — 1.3 MB
- `2025 Spreken II - 01 - deel 1 instructie.opus` — 1.2 MB
- `2025 Spreken II - 02 - opgave 1 - Nieuwe personeelsruimte.mp3` — 590 KB
- `2025 Spreken II - 02 - opgave 1 - Nieuwe personeelsruimte.opus` — 578 KB
- `2025 Spreken II - 03 - opgave 2 - Oefening op werkplek.mp3` — 537 KB
- `2025 Spreken II - 03 - opgave 2 - Oefening op werkplek.opus` — 527 KB
- `2025 Spreken II - 04 - opgave 3 - Teksten nakijken en verbeteren.mp3` — 521 KB
- `2025 Spreken II - 04 - opgave 3 - Teksten nakijken en verbeteren.opus` — 499 KB
- `2025 Spreken II - 05 - opgave 4 - Glasbak.mp3` — 641 KB
- `2025 Spreken II - 05 - opgave 4 - Glasbak.opus` — 657 KB
- `2025 Spreken II - 06 - deel 2 instructie.mp3` — 2.1 MB
- `2025 Spreken II - 06 - deel 2 instructie.opus` — 1.8 MB
- `2025 Spreken II - 07 - opgave 5 - Mentorprogramma.mp3` — 864 KB
- `2025 Spreken II - 07 - opgave 5 - Mentorprogramma.opus` — 803 KB
- `2025 Spreken II - 08 - opgave 6 - Wachttijden.mp3` — 864 KB
- `2025 Spreken II - 08 - opgave 6 - Wachttijden.opus` — 981 KB
- `2025 Spreken II - 09 - opgave 7 - Pakket voor de buren.mp3` — 833 KB
- `2025 Spreken II - 09 - opgave 7 - Pakket voor de buren.opus` — 804 KB
- `2025 Spreken II - 10 - opgave 8 - Studiereis Kunstgeschiedenis.mp3` — 696 KB
- `2025 Spreken II - 10 - opgave 8 - Studiereis Kunstgeschiedenis.opus` — 805 KB
- `2025 Spreken II - 11 - opgave 9 - Brandveiligheid.mp3` — 752 KB
- `2025 Spreken II - 11 - opgave 9 - Brandveiligheid.opus` — 904 KB
- `2025 Spreken II - 12 - opgave 10 - Uitstapje.mp3` — 670 KB
- `2025 Spreken II - 12 - opgave 10 - Uitstapje.opus` — 699 KB
- `2025 Spreken II - 13 - opgave 11 - Straat afsluiten.mp3` — 865 KB
- `2025 Spreken II - 13 - opgave 11 - Straat afsluiten.opus` — 987 KB
- `2025 Spreken II - 14 - opgave 12 - Tijd of geld-.mp3` — 524 KB
- `2025 Spreken II - 14 - opgave 12 - Tijd of geld-.opus` — 691 KB
- `2025 Spreken II - 15 - deel 3 instructie.mp3` — 465 KB
- `2025 Spreken II - 15 - deel 3 instructie.opus` — 400 KB
- `2025 Spreken II - 16 - opgave 13 - Vrije tijd kinderen.mp3` — 2.8 MB
- `2025 Spreken II - 16 - opgave 13 - Vrije tijd kinderen.opus` — 2.9 MB

### The listening corpus, file by file

Collapsed because [`LISTENING-INVENTORY.md`](./LISTENING-INVENTORY.md) is the file to read about
these. Listed here only so this inventory is complete.

<details>
<summary>337 files in <code>dutch-listening/</code></summary>

**`atili/Dutch/dutch-listening/`** — 1 files, 879 B

- `README.md` — 879 B

**`atili/Dutch/dutch-listening/echt-gebeurd/`** — 32 files, 369.3 MB

- `afl-550-een-nieuwe-taal-micha-wertheim.mp3` — 11.0 MB
- `afl-551-verliefd-daan-buringa.mp3` — 14.2 MB
- `afl-552-voor-het-eerst-rozemarijn-den-dulk.mp3` — 13.1 MB
- `afl-553-verdwaald-peter-wijga.mp3` — 9.9 MB
- `afl-554-puberdagboek-mathilde-drooger.mp3` — 12.5 MB
- `afl-555-de-expert-pablo-nollet.mp3` — 11.2 MB
- `afl-556-geheim-david-van-den-bosch.mp3` — 10.9 MB
- `afl-557-bij-mij-in-de-straat-sanne-pols.mp3` — 13.1 MB
- `afl-558-voor-het-eerst-tobi-lakmaker.mp3` — 10.2 MB
- `afl-559-voor-het-laatst-felix-kreier.mp3` — 10.2 MB
- `afl-560-bezoek-feeke-rensen.mp3` — 9.7 MB
- `afl-561-bloed-marlinde-van-zessen.mp3` — 10.1 MB
- `afl-562-puberdagboek-kim-hopmans.mp3` — 9.8 MB
- `afl-563-verdwaald-nathalie-baartman.mp3` — 13.2 MB
- `afl-564-zweet-pepijn-schoneveld.mp3` — 12.6 MB
- `afl-565-geheim-djoni-de-vos.mp3` — 15.3 MB
- `afl-566-heimwee-maarten-westerveen.mp3` — 9.1 MB
- `afl-567-voetbal-linda-polman.mp3` — 16.4 MB
- `afl-568-verzet-lisa-drijfhout.mp3` — 10.3 MB
- `afl-569-tranen-ionica-smeets.mp3` — 10.2 MB
- `afl-570-zweet-bibi-roos.mp3` — 10.5 MB
- `afl-571-bloed-henk-asbreuk.mp3` — 10.3 MB
- `afl-572-verliefd-david-goovaerts.mp3` — 10.2 MB
- `afl-573-de-parade-renette-kwakkenbos-en-marlinde-van-zessen.mp3` — 15.3 MB
- `afl-574-zweet-henri-oogjen.mp3` — 11.3 MB
- `afl-575-puberdagboek-christine-margés.mp3` — 16.2 MB
- `afl-576-de-parade-esma-ҫürük-en-thijs-van-litsenburg.mp3` — 13.7 MB
- `afl-577-de-parade-arianne-hinz-en-martijn-winkler.mp3` — 17.6 MB
- `afl-578-de-parade-verhalen-uit-het-publiek.mp3` — 16.8 MB
- `afl-579-het-huwelijk-maaike-dirkje-hop.mp3` — 12.5 MB
- `episodes.json` — 16 KB
- `feed.rss` — 2.0 MB

**`atili/Dutch/dutch-listening/eenbeetjenederlands/`** — 181 files, 2.1 GiB

- `0-trailer.mp3` — 1.3 MB
- `1-aletta-jacobs.mp3` — 10.6 MB
- `1-aletta-jacobs.txt` — 9 KB
- `10-oranjekoorts.mp3` — 26.2 MB
- `10-oranjekoorts.txt` — 9 KB
- `11-marga-klompé.mp3` — 31.9 MB
- `11-marga-klompé.txt` — 11 KB
- `12-praten-met-devika-partiman-stem-op-een-vrouw---bonus.mp3` — 27.5 MB
- `12-praten-met-devika-partiman-stem-op-een-vrouw---bonus.txt` — 33 KB
- `13-vlaams.mp3` — 12.2 MB
- `13-vlaams.txt` — 12 KB
- `14-praten-met-sietske---bonus.mp3` — 30.6 MB
- `14-praten-met-sietske---bonus.txt` — 37 KB
- `15-rembrandt-van-rijn.mp3` — 11.6 MB
- `15-rembrandt-van-rijn.txt` — 11 KB
- `16-de-nachtwacht---bonus.mp3` — 22.9 MB
- `16-de-nachtwacht---bonus.txt` — 8 KB
- `17-onderwijs-in-nederland.mp3` — 52.0 MB
- `17-onderwijs-in-nederland.txt` — 18 KB
- `18-wie-is-robin---bonus.mp3` — 4.9 MB
- `18-wie-is-robin---bonus.txt` — 5 KB
- `19-sinterklaas.mp3` — 11.2 MB
- `19-sinterklaas.txt` — 11 KB
- `2-de-elfstedentocht.mp3` — 28.0 MB
- `2-de-elfstedentocht.txt` — 8 KB
- `20-gronings-gas.mp3` — 13.2 MB
- `20-gronings-gas.txt` — 13 KB
- `21-karel-ende-elegast.mp3` — 35.2 MB
- `21-karel-ende-elegast.txt` — 11 KB
- `22-wubbo-ockels.mp3` — 22.9 MB
- `22-wubbo-ockels.txt` — 7 KB
- `23-watersnoodramp-1953.mp3` — 12.5 MB
- `23-watersnoodramp-1953.txt` — 12 KB
- `24-tulpen.mp3` — 23.9 MB
- `24-tulpen.txt` — 8 KB
- `25-typisch-nederlands-kinderen-voor-kinderen.mp3` — 3.5 MB
- `25-typisch-nederlands-kinderen-voor-kinderen.txt` — 4 KB
- `26-waddeneilanden.mp3` — 34.3 MB
- `26-waddeneilanden.txt` — 10 KB
- `27-typisch-nederlands-drop.mp3` — 4.1 MB
- `27-typisch-nederlands-drop.txt` — 4 KB
- `28-het-levenslied.mp3` — 24.2 MB
- `28-het-levenslied.txt` — 8 KB
- `29-typisch-nederlands-de-kringverjaardag.mp3` — 3.8 MB
- `29-typisch-nederlands-de-kringverjaardag.txt` — 4 KB
- `3-verkiezingen.mp3` — 11.9 MB
- `3-verkiezingen.txt` — 11 KB
- `30-stikstofcrisis.mp3` — 28.5 MB
- `30-stikstofcrisis.txt` — 9 KB
- `31-typisch-nederlands-tikkie.mp3` — 10.1 MB
- `31-typisch-nederlands-tikkie.txt` — 4 KB
- `32-romeinen-in-nederland.mp3` — 24.1 MB
- `32-romeinen-in-nederland.txt` — 8 KB
- `33-typisch-nederlands-top-2000.mp3` — 10.9 MB
- `33-typisch-nederlands-top-2000.txt` — 5 KB
- `34-prinsjesdag.mp3` — 23.4 MB
- `34-prinsjesdag.txt` — 7 KB
- `35-troonrede.mp3` — 38.0 MB
- `35-troonrede.txt` — 12 KB
- `36-typisch-nederlands-beschuit-met-muisjes.mp3` — 8.8 MB
- `36-typisch-nederlands-beschuit-met-muisjes.txt` — 3 KB
- `37-misdaad-en-straf.mp3` — 27.8 MB
- `37-misdaad-en-straf.txt` — 9 KB
- `38-de-heinekenontvoering.mp3` — 23.6 MB
- `38-de-heinekenontvoering.txt` — 7 KB
- `39-typisch-limburgs-vlaai.mp3` — 12.4 MB
- `39-typisch-limburgs-vlaai.txt` — 4 KB
- `4-het-wilhelmus.mp3` — 9.3 MB
- `4-het-wilhelmus.txt` — 7 KB
- `40-de-bijlmer.mp3` — 38.8 MB
- `40-de-bijlmer.txt` — 12 KB
- `41-bijlmerramp.mp3` — 36.1 MB
- `41-bijlmerramp.txt` — 11 KB
- `42-typisch-nederlands-geboortekaartjes.mp3` — 11.5 MB
- `42-typisch-nederlands-geboortekaartjes.txt` — 4 KB
- `43-carnaval.mp3` — 28.9 MB
- `43-carnaval.txt` — 8 KB
- `44-anne-frank.mp3` — 19.9 MB
- `44-anne-frank.txt` — 7 KB
- `45-mata-hari.mp3` — 23.3 MB
- `45-mata-hari.txt` — 7 KB
- `46-johannes-vermeer.mp3` — 19.8 MB
- `46-johannes-vermeer.txt` — 6 KB
- `47-de-grondwet.mp3` — 18.6 MB
- `47-de-grondwet.txt` — 6 KB
- `48-euthanasie.mp3` — 28.3 MB
- `48-euthanasie.txt` — 9 KB
- `49-drugsbeleid.mp3` — 25.9 MB
- `49-drugsbeleid.txt` — 8 KB
- `5-de-zuiderzeewerken-de-afsluitdijk-flevoland.mp3` — 11.8 MB
- `5-de-zuiderzeewerken-de-afsluitdijk-flevoland.txt` — 11 KB
- `50-computerpioniers.mp3` — 31.5 MB
- `50-computerpioniers.txt` — 9 KB
- `51-de-digitale-stad.mp3` — 24.6 MB
- `51-de-digitale-stad.txt` — 8 KB
- `52-bokito-dominomus.mp3` — 15.8 MB
- `52-bokito-dominomus.txt` — 5 KB
- `53-buienradar-9292.mp3` — 10.9 MB
- `53-buienradar-9292.txt` — 4 KB
- `54-efteling-madurodam.mp3` — 13.4 MB
- `54-efteling-madurodam.txt` — 4 KB
- `55-bonuskaart-guldens.mp3` — 16.4 MB
- `55-bonuskaart-guldens.txt` — 6 KB
- `56-kapsalon-patatdebat.mp3` — 13.8 MB
- `56-kapsalon-patatdebat.txt` — 5 KB
- `57-andré-rieu-andré-hazes.mp3` — 14.9 MB
- `57-andré-rieu-andré-hazes.txt` — 5 KB
- `58-neutraal-moresnet.mp3` — 27.9 MB
- `58-neutraal-moresnet.txt` — 9 KB
- `59-fietsen.mp3` — 25.7 MB
- `59-fietsen.txt` — 9 KB
- `6-koningsdag.mp3` — 9.7 MB
- `6-koningsdag.txt` — 8 KB
- `60-anton-de-kom.mp3` — 24.4 MB
- `60-anton-de-kom.txt` — 7 KB
- `61-de-dom-van-utrecht.mp3` — 21.9 MB
- `61-de-dom-van-utrecht.txt` — 6 KB
- `62-het-mirakel-van-amsterdam.mp3` — 28.1 MB
- `62-het-mirakel-van-amsterdam.txt` — 8 KB
- `63-antoni-van-leeuwenhoek.mp3` — 26.1 MB
- `63-antoni-van-leeuwenhoek.txt` — 8 KB
- `64-jan-van-eyck.mp3` — 29.5 MB
- `64-jan-van-eyck.txt` — 9 KB
- `65-limburgs.mp3` — 26.6 MB
- `65-limburgs.txt` — 8 KB
- `66-zwangerschap-in-nederland.mp3` — 34.4 MB
- `66-zwangerschap-in-nederland.txt` — 11 KB
- `67-tachtigjarige-oorlog-deel-1.mp3` — 34.8 MB
- `67-tachtigjarige-oorlog-deel-1.txt` — 10 KB
- `68-tachtigjarige-oorlog-deel-2.mp3` — 49.7 MB
- `68-tachtigjarige-oorlog-deel-2.txt` — 15 KB
- `69-anna-maria-van-schurman.mp3` — 24.1 MB
- `69-anna-maria-van-schurman.txt` — 7 KB
- `7-tweede-wereldoorlog-in-nederland.mp3` — 23.5 MB
- `7-tweede-wereldoorlog-in-nederland.txt` — 21 KB
- `70-natuur-in-nederland.mp3` — 38.7 MB
- `70-natuur-in-nederland.txt` — 11 KB
- `71-limburgse-mijnen.mp3` — 46.3 MB
- `71-limburgse-mijnen.txt` — 14 KB
- `72-nederlandse-cariben.mp3` — 38.3 MB
- `72-nederlandse-cariben.txt` — 11 KB
- `73-reinaert-de-vos.mp3` — 60.6 MB
- `73-reinaert-de-vos.txt` — 18 KB
- `74-provo.mp3` — 47.7 MB
- `74-provo.txt` — 14 KB
- `75-heksenvervolging.mp3` — 40.0 MB
- `75-heksenvervolging.txt` — 14 KB
- `76-hyves.mp3` — 32.4 MB
- `76-hyves.txt` — 11 KB
- `77-achternamen.mp3` — 45.3 MB
- `77-achternamen.txt` — 14 KB
- `78-soldaat-van-oranje.mp3` — 38.9 MB
- `78-soldaat-van-oranje.txt` — 11 KB
- `79-michiel-de-ruyter.mp3` — 33.7 MB
- `79-michiel-de-ruyter.txt` — 10 KB
- `8-annie-mg-schmidt.mp3` — 27.9 MB
- `8-annie-mg-schmidt.txt` — 9 KB
- `80-kneppelfreed.mp3` — 37.2 MB
- `80-kneppelfreed.txt` — 11 KB
- `81-volkshuisvesting.mp3` — 39.1 MB
- `81-volkshuisvesting.txt` — 13 KB
- `82-de-biesbosch.mp3` — 11.8 MB
- `82-de-biesbosch.txt` — 10 KB
- `83-van-gogh-deel-1-de-jonge-jaren.mp3` — 40.6 MB
- `83-van-gogh-deel-1-de-jonge-jaren.txt` — 13 KB
- `84-van-gogh-deel-2-de-kunstenaar.mp3` — 23.0 MB
- `84-van-gogh-deel-2-de-kunstenaar.txt` — 17 KB
- `85-ramses-shaffy.mp3` — 12.8 MB
- `85-ramses-shaffy.txt` — 9 KB
- `86-gabber.mp3` — 16.2 MB
- `86-gabber.txt` — 13 KB
- `87-homohuwelijk.mp3` — 15.9 MB
- `87-homohuwelijk.txt` — 12 KB
- `9-willem-barentsz.mp3` — 14.2 MB
- `9-willem-barentsz.txt` — 13 KB
- `episodes.json` — 56 KB
- `feed.rss` — 357 KB
- `trailer-seizoen-5-introductie-yvette.asr.txt` — 957 B
- `trailer-seizoen-5-introductie-yvette.mp3` — 1.7 MB
- `trailer-seizoen-8.mp3` — 7.2 MB
- `word-nu-vriend-van-de-podcast-via-petjeafcom.mp3` — 4.5 MB

**`atili/Dutch/dutch-listening/librivox-nl/`** — 1 files, 25 KB

- `catalogue-210-titles.json` — 25 KB

**`atili/Dutch/dutch-listening/nos-jeugdjournaal/`** — 42 files, 1.1 GiB

- `2025-05-28 - crèmes-serums-en-lotion-maken-kinderen-hun-huid-kapot.mp3` — 27.9 MB
- `2025-06-04 - wat-is-de-echte-reden-dat-wilders-is-gestopt.mp3` — 26.0 MB
- `2025-06-18 - waarom-zijn-er-27000-agenten-nodig-voor-één-vergadering.mp3` — 28.3 MB
- `2025-06-25 - bye-bye-basisschool-hoe-neem-je-goed-afscheid.mp3` — 28.3 MB
- `2025-08-20 - offline-wat-is-het-probleem.mp3` — 27.5 MB
- `2025-08-21 - offline-hoe-schadelijk-is-een-telefoon.mp3` — 28.0 MB
- `2025-08-22 - offline-wanneer-ben-je-klaar-voor-een-telefoon.mp3` — 29.5 MB
- `2025-09-10 - is-het-slecht-om-de-hele-dag-op-school-te-zitten.mp3` — 26.2 MB
- `2025-09-17 - waarom-is-pesten-niet-verboden.mp3` — 28.2 MB
- `2025-09-24 - is-er-een-spinnenplaag-in-nederland.mp3` — 29.0 MB
- `2025-10-01 - zijn-drones-cool-of-gevaarlijk.mp3` — 28.7 MB
- `2025-10-08 - hoe-weet-je-wat-echt-is-over-de-oorlog-in-gaza.mp3` — 27.6 MB
- `2025-10-15 - is-het-gevaarlijk-om-politicus-te-zijn.mp3` — 28.1 MB
- `2025-10-29 - hoe-kun-je-samenwerken-met-je-grootste-tegenstander.mp3` — 30.1 MB
- `2025-11-05 - kapot-en-giftig-hoe-weet-je-of-spullen-in-webshops-goed-zijn.mp3` — 29.8 MB
- `2025-11-12 - wat-gebeurt-er-als-we-niets-doen-aan-klimaatverandering.mp3` — 28.4 MB
- `2025-11-19 - hoe-werd-suriname-onafhankelijk-van-nederland.mp3` — 30.3 MB
- `2025-11-26 - feest-hoe-wordt-de-jeugdjournaalpodcast-gemaakt.mp3` — 41.3 MB
- `2025-12-03 - moeten-kinderen-zich-voorbereiden-op-een-noodsituatie.mp3` — 27.8 MB
- `2025-12-10 - hoe-zwaar-is-het-om-youtuber-te-zijn.mp3` — 28.2 MB
- `2025-12-17 - hoe-zorg-je-dat-het-kerstdiner-een-succes-wordt.mp3` — 29.1 MB
- `2026-01-10 - 45-jaar-jeugdjournaal-hoe-kijken-oud-presentatoren-daarop-terug.mp3` — 49.7 MB
- `2026-01-28 - hoe-zorg-je-dat-je-klaar-bent-voor-de-doorstroomtoets.mp3` — 26.5 MB
- `2026-02-04 - hoe-win-je-goud-op-de-olympische-winterspelen.mp3` — 29.7 MB
- `2026-02-18 - wordt-rob-jetten-een-goede-minister-president-voor-nederland.mp3` — 28.7 MB
- `2026-02-25 - waarom-moeten-steeds-meer-kinderen-naar-halt.mp3` — 29.7 MB
- `2026-03-04 - waarom-wordt-iran-aangevallen.mp3` — 29.2 MB
- `2026-03-11 - hoe-kies-je-de-middelbare-school-die-bij-jou-past.mp3` — 30.1 MB
- `2026-03-18 - wat-hebben-kinderen-nou-aan-gemeenteraadsverkiezingen.mp3` — 23.8 MB
- `2026-04-01 - hoe-bedenk-je-de-perfecte-grap.mp3` — 30.8 MB
- `2026-04-15 - waarom-zien-we-steeds-vaker-ratten.mp3` — 28.9 MB
- `2026-04-29 - waarom-wordt-er-zo-weinig-gepraat-over-roma-en-sinti-in-de-tweede-were.mp3` — 29.7 MB
- `2026-05-13 - moeten-kinderen-zich-zorgen-maken-over-het-hantavirus.mp3` — 29.2 MB
- `2026-05-20 - waarom-lopen-de-protesten-tegen-asielzoekers-uit-de-hand.mp3` — 29.5 MB
- `2026-06-03 - hoe-volg-je-een-concert-als-je-blind-of-slechtziend-bent.mp3` — 28.4 MB
- `2026-06-10 - waarom-worden-aangespoelde-walvissen-onderzocht.mp3` — 31.9 MB
- `2026-06-17 - alles-wat-je-moet-weten-om-mee-te-kunnen-praten-over-het-wk-voetbal.mp3` — 30.1 MB
- `2026-06-25 - waarom-is-het-belangrijk-om-te-praten-over-de-dood.mp3` — 31.2 MB
- `2026-07-01 - hoe-blijf-je-veilig-bij-onweer.mp3` — 29.9 MB
- `2026-08-26 - extra-roxy-dekker-over-haar-muziek-en-grote-liefde-koen.mp3` — 13.8 MB
- `episodes.json` — 28 KB
- `feed.rss` — 471 KB

**`atili/Dutch/dutch-listening/zeg-het-in-het-nederlands/`** — 60 files, 1.6 GiB

- `01 - de boekenweek en een favoriete schrijver.mp3` — 11.4 MB
- `02 - de lente en de gemeenteraadsverkiezingen.mp3` — 14.7 MB
- `03 - Pasen en het paasfeest.mp3` — 15.8 MB
- `04 - de tulp, nationaal symbool van Nederland.mp3` — 15.1 MB
- `05 - de Nationale Museumweek en de pronkstukken.mp3` — 20.8 MB
- `06 - sport, topsport en voetbal.mp3` — 14.9 MB
- `07 - Koningsdag, de koning en kroonprinses Amalia.mp3` — 14.2 MB
- `08 - dodenherdenking en bevrijdingsdag.mp3` — 19.6 MB
- `09 - het Songfestival, de Molendag en Moederdag.mp3` — 15.8 MB
- `10 - Pinksteren, kastelen en Annie M.G. Schmidt.mp3` — 21.6 MB
- `11 - Bluetooth.mp3` — 17.0 MB
- `12 - de provincie Friesland.mp3` — 16.3 MB
- `13 - Hollandse Nieuwe en haring.mp3` — 19.7 MB
- `14 - studeren en Aletta Jacobs.mp3` — 23.3 MB
- `15 - droogte, dijken en Prinsjesdag.mp3` — 17.4 MB
- `16 - de kunstenaar Escher.mp3` — 19.4 MB
- `17 - kerstmis, kerstbomen en vuurwerk.mp3` — 18.4 MB
- `18 - het Rembrandtjaar en de Nachtwacht.mp3` — 22.9 MB
- `19 - liefde, trouwen en huwelijken.mp3` — 34.2 MB
- `20 - Martinus Nijhoff, de boekenweek en de verkiezingen.mp3` — 25.0 MB
- `21 - Rotterdam, de haven en de Erasmusbrug.mp3` — 24.8 MB
- `22 - de grutto en Berend Botje.mp3` — 20.4 MB
- `23 - Sint Maarten en de feestdagen.mp3` — 24.7 MB
- `24 - Multatuli en Max Havelaar (tweede publicatie).mp3` — 31.4 MB
- `24 - Multatuli en Max Havelaar.mp3` — 31.6 MB
- `25 - professor Oort, de sterrenkundige.mp3` — 26.0 MB
- `26 - bevallingen in Nederland.mp3` — 30.2 MB
- `27 - corona, de zomer en de Noordzee.mp3` — 30.8 MB
- `28 - gezelligheid.mp3` — 26.2 MB
- `29 - Vondel en Gijsbrecht van Aemstel.mp3` — 27.7 MB
- `30 - auto's, fietsen en snelwegen.mp3` — 31.0 MB
- `31 - moderne architectuur.mp3` — 35.2 MB
- `32 - het stembiljet en schaken.mp3` — 32.5 MB
- `33 - bier, Heineken en de ontvoering.mp3` — 34.0 MB
- `34 - voetbal, het EK en Johan Cruijff.mp3` — 27.4 MB
- `35 - water, wateroverlast en de Betuwe.mp3` — 29.1 MB
- `36 - mode, kleding en de textielindustrie.mp3` — 33.3 MB
- `37 - Nederlands eten en aardappels.mp3` — 25.2 MB
- `38 - de schrijver Gerard Reve.mp3` — 36.7 MB
- `39 - Hugo de Groot.mp3` — 37.6 MB
- `40 - lekkere hapjes en de lelijke eend.mp3` — 28.0 MB
- `41 - de Nederlandse Antillen en de zilvervloot.mp3` — 38.8 MB
- `42 - boeken lezen en kinderboeken.mp3` — 38.4 MB
- `43 - Nederlandse popmuziek en de Top 2000.mp3` — 43.6 MB
- `44 - Golden Earring.mp3` — 46.9 MB
- `45 - de overwintering op Nova Zembla.mp3` — 34.4 MB
- `46 - de Nederlandse mentaliteit.mp3` — 30.7 MB
- `47 - de kunstbeweging Cobra en de Vijftigers.mp3` — 35.3 MB
- `48 - stakingen, lonen en vakbonden.mp3` — 29.3 MB
- `49 - Mata Hari.mp3` — 48.2 MB
- `50 - de ijstijd, de hunebedden en de eerste boeren.mp3` — 50.6 MB
- `51 - hoogveen, turf en Vincent van Gogh.mp3` — 45.4 MB
- `52 - de Lage Landen en Vlaanderen.mp3` — 48.1 MB
- `53 - Marten Toonder, Tom Poes en Olivier B. Bommel.mp3` — 36.1 MB
- `54 - water, terpen en dijken.mp3` — 47.3 MB
- `54a - kerstberichtje.mp3` — 1.5 MB
- `55 - ingenieur Cornelis Lely en de Afsluitdijk.mp3` — 40.4 MB
- `56 - het werk op de Afsluitdijk.mp3` — 28.7 MB
- `episodes.json` — 23 KB
- `feed.rss` — 86 KB

**`atili/Dutch/dutch-listening/librivox-nl/ali_baba_en_de_veertig_roovers_1411_librivox/`** — 5 files, 51.4 MB

- `Ali Baba en de veertig roovers - deel 01.mp3` — 11.8 MB
- `Ali Baba en de veertig roovers - deel 02.mp3` — 12.2 MB
- `Ali Baba en de veertig roovers - deel 03.mp3` — 15.1 MB
- `Ali Baba en de veertig roovers - deel 04.mp3` — 12.4 MB
- `metadata.json` — 2 KB

**`atili/Dutch/dutch-listening/librivox-nl/zoon_dik_trom_0908_librivox/`** — 15 files, 128.5 MB

- `De zoon van Dik Trom - hoofdstuk 01 (Kieviet).mp3` — 2.4 MB
- `De zoon van Dik Trom - hoofdstuk 02 (Kieviet).mp3` — 5.3 MB
- `De zoon van Dik Trom - hoofdstuk 03 (Kieviet).mp3` — 5.8 MB
- `De zoon van Dik Trom - hoofdstuk 04 (Kieviet).mp3` — 5.6 MB
- `De zoon van Dik Trom - hoofdstuk 05 (Kieviet).mp3` — 11.4 MB
- `De zoon van Dik Trom - hoofdstuk 06 (Kieviet).mp3` — 12.7 MB
- `De zoon van Dik Trom - hoofdstuk 07 (Kieviet).mp3` — 9.8 MB
- `De zoon van Dik Trom - hoofdstuk 08 (Kieviet).mp3` — 13.8 MB
- `De zoon van Dik Trom - hoofdstuk 09 (Kieviet).mp3` — 8.6 MB
- `De zoon van Dik Trom - hoofdstuk 10 (Kieviet).mp3` — 9.2 MB
- `De zoon van Dik Trom - hoofdstuk 11 (Kieviet).mp3` — 12.9 MB
- `De zoon van Dik Trom - hoofdstuk 12 (Kieviet).mp3` — 12.4 MB
- `De zoon van Dik Trom - hoofdstuk 13 (Kieviet).mp3` — 15.2 MB
- `De zoon van Dik Trom - hoofdstuk 14 (Kieviet).mp3` — 3.3 MB
- `metadata.json` — 3 KB
</details>
