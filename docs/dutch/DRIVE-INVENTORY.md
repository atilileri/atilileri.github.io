# Drive inventory: every Dutch file in `atili/Dutch`

What the user holds in Google Drive, file by file. Produced by
[#133](https://github.com/atilileri/atilileri.github.io/issues/133), read directly with `rclone` rather than
typed by hand. **This file records facts, not choices.**
[`MATERIAL.md`](./MATERIAL.md) says where material lives; [`LISTENING-INVENTORY.md`](./LISTENING-INVENTORY.md)
covers the podcast corpus in depth; [`READING-MATERIAL.md`](./READING-MATERIAL.md) says how the agent reads any
of it; [#94](https://github.com/atilileri/atilileri.github.io/issues/94) rules on licences.

**Read on 2026-09-05.** A scan of the whole Drive — 22,728 directories — found Dutch material in exactly one
place, `atili/Dutch`, and nowhere else. Nothing here is committed to this repo, and most of it never can be.

**Totals: 1,281 files, 8.61 GiB, in 31 folders.** Read again after the conversion of 2026-09-05 (below).

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

**1. The DUO practice exams — `oefenexamensnt2/`, 801 files, 1.04 GiB.** The complete published *openbaar
examen* set for **2023, 2024 and 2025**, both programmes, all four skills. Every year carries, per skill and
per programme, an `opgavenboekje` (the question booklet) and a `beoordelingsmodel` (the marking scheme) —
**48 PDFs** — plus the media the Luisteren and Spreken papers play: 306 `.opus`, 53 `.webm` (VP8 video with
Vorbis audio) and 35 `.mp3` as published, and since 2026-09-05 a converted `.mp3` or `.mp4` sibling beside
every one of the first two (see below).

This **overturns a recorded finding.** [`MATERIAL.md`](./MATERIAL.md) and
[#96](https://github.com/atilileri/atilileri.github.io/issues/96) both recorded the practice exams as
unreachable — an Angular application with no discoverable API. The user extracted them by hand. The agent's
finding was about the *agent's* reach, and it stands as that; the material itself is now here.

Three tickets should read this folder before they resolve.
[#95](https://github.com/atilileri/atilileri.github.io/issues/95) asks what can honestly be done for spreken
and luisteren — there are now **six real spreken papers with prompts and marking schemes**.
[#85](https://github.com/atilileri/atilileri.github.io/issues/85) marked every spreken Objective `unsupported`
on the evidence available then. [#82](https://github.com/atilileri/atilileri.github.io/issues/82)'s **Exam
task** now has authentic examples to be modelled on, rather than invented from a description.

**Licence, unresolved.** These are published by DUO, a Dutch government body, for candidates to practise with.
Dutch law treats works published by a public authority generously, but the folder carries no licence statement
and this file does not rule. [#94](https://github.com/atilileri/atilileri.github.io/issues/94) decides whether
any of it may be committed. Until then it stays in Drive.

**2. The coursebooks and dictionaries — 12 files at the folder root, 641 MB.** Four named NT2 methods
(Coutinho's *Nederlands in gang* A0–A2, *Nederlands in actie* and *Nederlands op niveau* for B1–B2, plus
*Teach Yourself Dutch*), *Dutch For Dummies* (Wiley — the filename `dutch.pdf` hides it; the PDF metadata
names it), a graded reader, a Dutch Academy Eindhoven handout, a Turkish-medium course, two Turkish word
lists, and the **Van Dale Groot Beeldwoordenboek** — a four-language picture dictionary shipped as a 468 MB
PDF, a 49 MB DjVu, and three split PDF parts.

These are the Oracle's material, home 3 in [`MATERIAL.md`](./MATERIAL.md). They are commercial works: the
agent asks the Oracle about them and never copies them.
[#134](https://github.com/atilileri/atilileri.github.io/issues/134) decides what the Oracle is.

**3. The listening corpus — `dutch-listening/`, 336 files, 5.38 GiB.** Landed by
[#96](https://github.com/atilileri/atilileri.github.io/issues/96) and inventoried source by source in
[`LISTENING-INVENTORY.md`](./LISTENING-INVENTORY.md). **Drive is the only copy of the 87 Een Beetje Nederlands
transcripts** — the local tree was deleted after the upload, and no transcript is re-fetchable. The audio is.

**4. Three older audio sets — 129 files, 1.13 GiB.** All three were identified on 2026-09-05 by reading them —
ID3 tags, a transcription of one clip, and stills from the video. See
[`READING-MATERIAL.md`](./READING-MATERIAL.md) for how. None of them leaves Drive.

- **`TRNL-all/`** — 100 clips of about 2 min 53 s, 4.8 hours in total, mono 48 kbps, dated 2016. The first clip
  opens *"Birçok dilde işitsel kurslar"* and then teaches `ik`, `ik en jij`, `wij beiden`, `hij en zij`, each
  Turkish phrase followed by its Dutch. That is **Goethe-Verlag's *book2* / 50LANGUAGES course, Turkish to
  Dutch, lesson 1**, whose numbering runs to exactly 100. Goethe-Verlag distributes it free for private and
  school use; the exact terms are the publisher's to state, and no one has checked them against reuse here.
  **This is the only set of the three that is plausibly free**, and it is paired Turkish–Dutch audio, which is
  what the Turkish-first lock asks for.
- **`30gundehollandaca/`** — 28 MP3, a Turkish "Dutch in 30 days" course. Its ID3 tags read `Bilinmeyen albüm
  (7.11.2018 16:42:26)`, `Parça 1`, `Bilinmeyen sanatçı` — an untagged **CD rip made on 7 November 2018**.
  Commercial.
- **`CursusA0A2/`** — one 577 MB recording, **56 minutes, 1080p**, cut in Clipchamp. It is a **recorded live
  online NT2 class run by NT2 Taaldiensten**, whose name is in the slide footer. The slides are Dutch and at
  the stated A0–A2 level: *Zinnen maken* drills `gaan, komen, eten, drinken, wonen, werken, hebben, spreken`,
  and *Afsluiting* closes with `de les was leuk / niet leuk / makkelijk / moeilijk`. **It shows a named teacher
  and several identifiable students, one with an email address on screen.** Treat it as private: no name, face
  or address from it may ever be published, whatever the publicness lock says about the journey's own
  artifacts.

  Transcribing all 56 minutes settles what it is worth. **It is a taster class, not a course lesson** — the
  teacher says outright that the session exists *"to show what I do in an online lesson"*, not to teach, and it
  closes by quoting the timetable and price structure of the real A2 and B1 groups. The teaching that does
  happen is weather vocabulary — `hittegolf`, `bosbrand`, `sneeuwen`, `onweer`, `droog` — explained in Turkish.
  So its value here is **not the content but the format**: 56 minutes of a real teacher teaching Dutch through
  Turkish, which is the register this journey is trying to write. Useful to
  [#90](https://github.com/atilileri/atilileri.github.io/issues/90) as a model, not as material.

  It also demonstrated a limit worth recording. The recording alternates Turkish and Dutch, and the Turkish came
  back clean while the embedded Dutch words were mangled — `hittegolf` as *"Hitticholf"*, `bosbrand` as *"Bosch
  Brand"*, `onweer` as *"on wear"*. This is the per-segment language problem in
  [`READING-MATERIAL.md`](./READING-MATERIAL.md), seen in the wild.

**The loose PDFs name their own publishers**, read out of the files on the same day: `van_start-woordenlijst_turks-web.pdf`
is **© Boom uitgevers Amsterdam, 2019** and `woordenlijst_nederlands_turks.pdf` is **© 2013 Uitgeverij Boom**
(*Basiscursus 1*, keyed per lesson); `dutch.pdf` is **Dutch For Dummies (Wiley)** — the filename hides it;
`Survival-Dutch.pdf` is a **Dutch Academy Eindhoven** handout; and `2129-Adim_Adim_Hollandaca…pdf` reserves all
rights to its author, runs to **58 pages not the 158 its filename claims**, and still carries the PDF title
*"Adım adım Almanca"* from the same author's German book. So the two Turkish word lists — the only ones that
looked like they might be free — are both Boom's. That lead is closed.

## The media was converted on 2026-09-05

The exam media arrived in two formats that a browser preview and a phone player often refuse. Both were
converted with a static **ffmpeg 7.0.2**, and **every converted file sits beside its original**, same folder,
same name, different extension — `Track 2.opus` has a sibling `Track 2.mp3`.

| From | Count | Was | To | Settings |
| --- | --- | --- | --- | --- |
| `.opus` | 306, 265 MB | Ogg Opus, 48 kHz stereo, ~129 kbps | `.mp3`, 268 MB | libmp3lame VBR `-q:a 2`, ~190 kbps |
| `.webm` | 53, 298 MB | VP8 video 510×382 at 25 fps, Vorbis audio | `.mp4`, 177 MB | H.264 `-crf 20`, AAC 192 kbps, `+faststart` |

**Nothing was replaced.** The originals are still there — they are the higher-quality copy, and DUO may not
publish them forever. The 35 files that were already `.mp3` were left untouched rather than re-encoded.

**Verified, not assumed.** All 359 outputs exist, none is empty, and no file drifted more than 0.35 s from its
source: 5.61 hours of audio in, 5.61 hours out. Every `.opus` has an `.mp3` sibling and every `.webm` has an
`.mp4` sibling, checked against Drive after the upload.

Both conversions are lossy-to-lossy, so a generation of quality is gone. The bitrates were chosen to sit above
the source so the loss stays inaudible, but **the original is the master**. The agent itself needs none of
this — ffmpeg reads opus and webm directly. The converted copies exist for notebook upload, for Drive's
in-browser player, and for the Session links the learner opens on a phone or a laptop.

## Every file

Sizes as read on 2026-09-05, after the conversion. Folders are listed alphabetically.

**`atili/Dutch/`** — 12 files, 639.3 MB

- `2129-Adim_Adim_Hollandaca-Ferhad_Yildiz-Baki-158s.pdf` — 551 KB
- `Dutch, Teach Yourself (Quist & Strik).pdf` — 60.6 MB
- `Dutch-Short-Stories-For-Beginners.pdf` — 8.9 MB
- `Nederlands in actie: Methode Nederlands voor hoogopgeleide anderstaligen.pdf` — 24.2 MB
- `Survival-Dutch.pdf` — 2.2 MB
- `dutch.pdf` — 2.9 MB
- `nederlands-in-gang-2017.pdf` — 11.2 MB
- `nederlands-op-niveau.pdf` — 11.8 MB
- `van-dale-groot-beeldwoordenboek-nederlands-english-franais-deutsch-9789066489738.djvu` — 48.6 MB
- `van-dale-groot-beeldwoordenboek-nederlands-english-franais-deutsch-9789066489738.pdf` — 468.1 MB
- `van_start-woordenlijst_turks-web.pdf` — 89 KB
- `woordenlijst_nederlands_turks.pdf` — 159 KB

**`atili/Dutch/30gundehollandaca/`** — 28 files, 433.3 MB

- `30gundehollandaca (1).mp3` — 6.8 MB
- `30gundehollandaca (10).mp3` — 17.9 MB
- `30gundehollandaca (11).mp3` — 9.4 MB
- `30gundehollandaca (12).mp3` — 12.4 MB
- `30gundehollandaca (13).mp3` — 14.6 MB
- `30gundehollandaca (14).mp3` — 20.8 MB
- `30gundehollandaca (15).mp3` — 9.5 MB
- `30gundehollandaca (16).mp3` — 10.6 MB
- `30gundehollandaca (17).mp3` — 11.4 MB
- `30gundehollandaca (18).mp3` — 16.4 MB
- `30gundehollandaca (19).mp3` — 7.4 MB
- `30gundehollandaca (2).mp3` — 10.9 MB
- `30gundehollandaca (20).mp3` — 17.8 MB
- `30gundehollandaca (21).mp3` — 21.8 MB
- `30gundehollandaca (22).mp3` — 20.7 MB
- `30gundehollandaca (23).mp3` — 17.2 MB
- `30gundehollandaca (24).mp3` — 10.5 MB
- `30gundehollandaca (25).mp3` — 16.3 MB
- `30gundehollandaca (26).mp3` — 8.5 MB
- `30gundehollandaca (27).mp3` — 20.3 MB
- `30gundehollandaca (28).mp3` — 18.6 MB
- `30gundehollandaca (3).mp3` — 12.6 MB
- `30gundehollandaca (4).mp3` — 13.2 MB
- `30gundehollandaca (5).mp3` — 12.3 MB
- `30gundehollandaca (6).mp3` — 25.7 MB
- `30gundehollandaca (7).mp3` — 28.7 MB
- `30gundehollandaca (8).mp3` — 16.6 MB
- `30gundehollandaca (9).mp3` — 24.3 MB

**`atili/Dutch/CursusA0A2/`** — 1 files, 577.0 MB

- `Serap ile tanisma dersi.mp4` — 577.0 MB

**`atili/Dutch/TRNL-all/`** — 100 files, 124.6 MB

- `TRNL001.mp3` — 1014 KB
- `TRNL002.mp3` — 1003 KB
- `TRNL003.mp3` — 1.0 MB
- `TRNL004.mp3` — 1.2 MB
- `TRNL005.mp3` — 1.3 MB
- `TRNL006.mp3` — 1.1 MB
- `TRNL007.mp3` — 1.2 MB
- `TRNL008.mp3` — 1.1 MB
- `TRNL009.mp3` — 1.1 MB
- `TRNL010.mp3` — 1.2 MB
- `TRNL011.mp3` — 1.0 MB
- `TRNL012.mp3` — 1.3 MB
- `TRNL013.mp3` — 1.1 MB
- `TRNL014.mp3` — 1.5 MB
- `TRNL015.mp3` — 1.4 MB
- `TRNL016.mp3` — 1.1 MB
- `TRNL017.mp3` — 1.2 MB
- `TRNL018.mp3` — 1.3 MB
- `TRNL019.mp3` — 1.3 MB
- `TRNL020.mp3` — 1.2 MB
- `TRNL021.mp3` — 1.3 MB
- `TRNL022.mp3` — 1.2 MB
- `TRNL023.mp3` — 1.3 MB
- `TRNL024.mp3` — 1.3 MB
- `TRNL025.mp3` — 1.2 MB
- `TRNL026.mp3` — 1.2 MB
- `TRNL027.mp3` — 1.2 MB
- `TRNL028.mp3` — 1.3 MB
- `TRNL029.mp3` — 1.1 MB
- `TRNL030.mp3` — 1.2 MB
- `TRNL031.mp3` — 1.2 MB
- `TRNL032.mp3` — 1.2 MB
- `TRNL033.mp3` — 1.4 MB
- `TRNL034.mp3` — 1.3 MB
- `TRNL035.mp3` — 1.4 MB
- `TRNL036.mp3` — 1.3 MB
- `TRNL037.mp3` — 1.2 MB
- `TRNL038.mp3` — 1.2 MB
- `TRNL039.mp3` — 1.1 MB
- `TRNL040.mp3` — 1.3 MB
- `TRNL041.mp3` — 1.2 MB
- `TRNL042.mp3` — 1.3 MB
- `TRNL043.mp3` — 1.1 MB
- `TRNL044.mp3` — 1.3 MB
- `TRNL045.mp3` — 1.1 MB
- `TRNL046.mp3` — 1.1 MB
- `TRNL047.mp3` — 1.5 MB
- `TRNL048.mp3` — 1.2 MB
- `TRNL049.mp3` — 1.2 MB
- `TRNL050.mp3` — 1.0 MB
- `TRNL051.mp3` — 1.4 MB
- `TRNL052.mp3` — 1.4 MB
- `TRNL053.mp3` — 1.5 MB
- `TRNL054.mp3` — 1.1 MB
- `TRNL055.mp3` — 1.2 MB
- `TRNL056.mp3` — 1.1 MB
- `TRNL057.mp3` — 1.2 MB
- `TRNL058.mp3` — 1.2 MB
- `TRNL059.mp3` — 1.3 MB
- `TRNL060.mp3` — 1.3 MB
- `TRNL061.mp3` — 1.3 MB
- `TRNL062.mp3` — 1.1 MB
- `TRNL063.mp3` — 1.2 MB
- `TRNL064.mp3` — 1.1 MB
- `TRNL065.mp3` — 1.2 MB
- `TRNL066.mp3` — 1.3 MB
- `TRNL067.mp3` — 1.2 MB
- `TRNL068.mp3` — 1.2 MB
- `TRNL069.mp3` — 1.2 MB
- `TRNL070.mp3` — 1.2 MB
- `TRNL071.mp3` — 1.2 MB
- `TRNL072.mp3` — 1.2 MB
- `TRNL073.mp3` — 1.3 MB
- `TRNL074.mp3` — 1.2 MB
- `TRNL075.mp3` — 1.2 MB
- `TRNL076.mp3` — 1.2 MB
- `TRNL077.mp3` — 1.4 MB
- `TRNL078.mp3` — 1.1 MB
- `TRNL079.mp3` — 1.4 MB
- `TRNL080.mp3` — 1.1 MB
- `TRNL081.mp3` — 1.4 MB
- `TRNL082.mp3` — 1.5 MB
- `TRNL083.mp3` — 1.1 MB
- `TRNL084.mp3` — 1.4 MB
- `TRNL085.mp3` — 1.2 MB
- `TRNL086.mp3` — 1.2 MB
- `TRNL087.mp3` — 1.4 MB
- `TRNL088.mp3` — 1.4 MB
- `TRNL089.mp3` — 1.4 MB
- `TRNL090.mp3` — 1.0 MB
- `TRNL091.mp3` — 1.3 MB
- `TRNL092.mp3` — 1.4 MB
- `TRNL093.mp3` — 1.4 MB
- `TRNL094.mp3` — 1.4 MB
- `TRNL095.mp3` — 1.5 MB
- `TRNL096.mp3` — 1.5 MB
- `TRNL097.mp3` — 1.8 MB
- `TRNL098.mp3` — 1.6 MB
- `TRNL099.mp3` — 1.4 MB
- `TRNL100.mp3` — 1.3 MB

**`atili/Dutch/oefenexamensnt2/`** — 48 files, 29.9 MB

- `2023 Lezen I openbaar examen  tekst- en opgavenboekje (papier).pdf` — 413 KB
- `2023 Lezen I openbaar examen beoordelingsmodel (papier).pdf` — 65 KB
- `2023 Lezen II openbaar examen  tekst- en opgavenboekje (papier).pdf` — 540 KB
- `2023 Lezen II openbaar examen beoordelingsmodel (papier).pdf` — 68 KB
- `2023 Luisteren I openbaar examen  opgavenboekje (papier).pdf` — 2.4 MB
- `2023 Luisteren I openbaar examen beoordelingsmodel (papier).pdf` — 155 KB
- `2023 Luisteren II openbaar examen  opgavenboekje (papier).pdf` — 1.6 MB
- `2023 Luisteren II openbaar examen beoordelingsmodel (papier).pdf` — 201 KB
- `2023 Schrijven I openbaar examen  opgavenboekje (papier).pdf` — 504 KB
- `2023 Schrijven I openbaar examen beoordelingsmodel (papier).pdf` — 275 KB
- `2023 Schrijven II openbaar examen  opgavenboekje (papier).pdf` — 321 KB
- `2023 Schrijven II openbaar examen beoordelingsmodel (papier).pdf` — 247 KB
- `2023 Spreken I openbaar examen  opgavenboekje (papier).pdf` — 4.2 MB
- `2023 Spreken I openbaar examen beoordelingsmodel (papier).pdf` — 359 KB
- `2023 Spreken II openbaar examen  opgavenboekje (papier).pdf` — 2.6 MB
- `2023 Spreken II openbaar examen beoordelingsmodel (papier).pdf` — 304 KB
- `2024 Lezen I openbaar examen  tekst- en opgavenboekje (papier).pdf` — 591 KB
- `2024 Lezen I openbaar examen beoordelingsmodel (papier).pdf` — 63 KB
- `2024 Lezen II openbaar examen  tekst- en opgavenboekje (papier).pdf` — 473 KB
- `2024 Lezen II openbaar examen beoordelingsmodel (papier).pdf` — 68 KB
- `2024 Luisteren I openbaar examen  opgavenboekje (papier).pdf` — 1.2 MB
- `2024 Luisteren I openbaar examen beoordelingsmodel (papier).pdf` — 155 KB
- `2024 Luisteren II openbaar examen  opgavenboekje (papier).pdf` — 620 KB
- `2024 Luisteren II openbaar examen beoordelingsmodel (papier).pdf` — 196 KB
- `2024 Schrijven I openbaar examen  opgavenboekje (papier).pdf` — 445 KB
- `2024 Schrijven I openbaar examen beoordelingsmodel (papier).pdf` — 270 KB
- `2024 Schrijven II openbaar examen  opgavenboekje (papier).pdf` — 421 KB
- `2024 Schrijven II openbaar examen beoordelingsmodel (papier).pdf` — 247 KB
- `2024 Spreken I openbaar examen  opgavenboekje (papier).pdf` — 2.9 MB
- `2024 Spreken I openbaar examen beoordelingsmodel (papier).pdf` — 360 KB
- `2024 Spreken II openbaar examen  opgavenboekje (papier).pdf` — 1.1 MB
- `2024 Spreken II openbaar examen beoordelingsmodel (papier).pdf` — 305 KB
- `2025 Lezen I openbaar examen  tekst- en opgavenboekje (papier).pdf` — 590 KB
- `2025 Lezen I openbaar examen beoordelingsmodel (papier).pdf` — 225 KB
- `2025 Lezen II openbaar examen beoordelingsmodel (papier).pdf` — 267 KB
- `2025 Lezen II openbaar examen tekst- en opgavenboekje (papier).pdf` — 647 KB
- `2025 Luisteren I openbaar examen  opgavenboekje (papier).pdf` — 515 KB
- `2025 Luisteren I openbaar examen beoordelingsmodel (papier).pdf` — 140 KB
- `2025 Luisteren II openbaar examen  opgavenboekje (papier).pdf` — 207 KB
- `2025 Luisteren II openbaar examen beoordelingsmodel (papier).pdf` — 140 KB
- `2025 Schrijven I openbaar examen  opgavenboekje (papier).pdf` — 359 KB
- `2025 Schrijven I openbaar examen beoordelingsmodel (papier).pdf` — 289 KB
- `2025 Schrijven II openbaar examen  opgavenboekje (papier).pdf` — 295 KB
- `2025 Schrijven II openbaar examen beoordelingsmodel (papier).pdf` — 274 KB
- `2025 Spreken I openbaar examen  opgavenboekje (papier).pdf` — 1.2 MB
- `2025 Spreken I openbaar examen beoordelingsmodel (papier).pdf` — 321 KB
- `2025 Spreken II openbaar examen  opgavenboekje (papier).pdf` — 966 KB
- `2025 Spreken II openbaar examen beoordelingsmodel (papier).pdf` — 222 KB

**`atili/Dutch/oefenexamensnt2/2023 Luisteren I openbaar examen audio- en videobestanden/losse fragmenten/`** — 100 files, 143.3 MB

- `Track 10.mp3` — 1.2 MB
- `Track 10.opus` — 995 KB
- `Track 11.mp3` — 1.3 MB
- `Track 11.opus` — 1.0 MB
- `Track 12.mp3` — 1.1 MB
- `Track 12.opus` — 890 KB
- `Track 13_intro.mp3` — 837 KB
- `Track 13_intro.opus` — 1.0 MB
- `Track 14.mp3` — 1.0 MB
- `Track 14.opus` — 1.1 MB
- `Track 15.mp3` — 770 KB
- `Track 15.opus` — 795 KB
- `Track 16.mp3` — 739 KB
- `Track 16.opus` — 752 KB
- `Track 17.mp3` — 799 KB
- `Track 17.opus` — 819 KB
- `Track 18.mp3` — 844 KB
- `Track 18.opus` — 874 KB
- `Track 19.mp3` — 1.2 MB
- `Track 19.opus` — 1.2 MB
- `Track 1_instructie.mp3` — 556 KB
- `Track 1_instructie.opus` — 570 KB
- `Track 20.mp3` — 825 KB
- `Track 20.opus` — 816 KB
- `Track 21_intro.mp3` — 1.4 MB
- `Track 21_intro.opus` — 1.8 MB
- `Track 22.mp3` — 943 KB
- `Track 22.opus` — 1.2 MB
- `Track 23.mp3` — 904 KB
- `Track 23.opus` — 1.1 MB
- `Track 24.mp3` — 648 KB
- `Track 24.opus` — 816 KB
- `Track 25.mp3` — 938 KB
- `Track 25.opus` — 1.1 MB
- `Track 26.mp3` — 641 KB
- `Track 26.opus` — 780 KB
- `Track 27.mp3` — 743 KB
- `Track 27.opus` — 938 KB
- `Track 28.mp3` — 559 KB
- `Track 28.opus` — 689 KB
- `Track 29.mp3` — 807 KB
- `Track 29.opus` — 956 KB
- `Track 2_intro.mp3` — 2.9 MB
- `Track 2_intro.opus` — 3.2 MB
- `Track 3.mp3` — 808 KB
- `Track 3.opus` — 760 KB
- `Track 30_intro.mp3` — 1.3 MB
- `Track 30_intro.opus` — 1.1 MB
- `Track 31.mp3` — 842 KB
- `Track 31.opus` — 861 KB
- `Track 32.mp3` — 999 KB
- `Track 32.opus` — 1.0 MB
- `Track 33.mp3` — 1020 KB
- `Track 33.opus` — 1.0 MB
- `Track 34.mp3` — 814 KB
- `Track 34.opus` — 833 KB
- `Track 35.mp3` — 781 KB
- `Track 35.opus` — 780 KB
- `Track 36_instructie videodeel.mp3` — 211 KB
- `Track 36_instructie videodeel.opus` — 214 KB
- `Track 37_intro1.mp3` — 284 KB
- `Track 37_intro1.opus` — 260 KB
- `Track 38_intro2.mp4` — 1.6 MB
- `Track 38_intro2.webm` — 2.4 MB
- `Track 39_instructie.mp3` — 114 KB
- `Track 39_instructie.opus` — 105 KB
- `Track 4.mp3` — 1.1 MB
- `Track 4.opus` — 984 KB
- `Track 40.mp4` — 4.4 MB
- `Track 40.webm` — 5.0 MB
- `Track 41.mp4` — 1.7 MB
- `Track 41.webm` — 3.2 MB
- `Track 42.mp4` — 5.0 MB
- `Track 42.webm` — 7.7 MB
- `Track 43.mp4` — 2.9 MB
- `Track 43.webm` — 3.2 MB
- `Track 44.mp4` — 1.7 MB
- `Track 44.webm` — 2.3 MB
- `Track 45.mp4` — 4.7 MB
- `Track 45.webm` — 5.3 MB
- `Track 46_intro.mp3` — 292 KB
- `Track 46_intro.opus` — 262 KB
- `Track 47.mp4` — 1.8 MB
- `Track 47.webm` — 3.3 MB
- `Track 48.mp4` — 4.0 MB
- `Track 48.webm` — 6.2 MB
- `Track 49.mp4` — 3.2 MB
- `Track 49.webm` — 5.5 MB
- `Track 5.mp3` — 713 KB
- `Track 5.opus` — 643 KB
- `Track 50_bron en disclaimer.mp3` — 102 KB
- `Track 50_bron en disclaimer.opus` — 116 KB
- `Track 6.mp3` — 748 KB
- `Track 6.opus` — 689 KB
- `Track 7.mp3` — 810 KB
- `Track 7.opus` — 727 KB
- `Track 8_intro.mp3` — 794 KB
- `Track 8_intro.opus` — 740 KB
- `Track 9.mp3` — 719 KB
- `Track 9.opus` — 570 KB

**`atili/Dutch/oefenexamensnt2/2023 Luisteren II openbaar examen audio- en videobestanden/`** — 98 files, 161.3 MB

- `Track 10.mp3` — 1.2 MB
- `Track 10.opus` — 1.0 MB
- `Track 11.mp3` — 1.4 MB
- `Track 11.opus` — 1.2 MB
- `Track 12.mp3` — 1.5 MB
- `Track 12.opus` — 1.3 MB
- `Track 14.mp3` — 1.8 MB
- `Track 14.opus` — 1.4 MB
- `Track 15.mp3` — 2.0 MB
- `Track 15.opus` — 1.5 MB
- `Track 16.mp3` — 1.9 MB
- `Track 16.opus` — 1.4 MB
- `Track 17.mp3` — 1.2 MB
- `Track 17.opus` — 941 KB
- `Track 18.mp3` — 1.7 MB
- `Track 18.opus` — 1.3 MB
- `Track 19.mp3` — 1.5 MB
- `Track 19.opus` — 1.1 MB
- `Track 1_instructie.mp3` — 556 KB
- `Track 1_instructie.opus` — 570 KB
- `Track 20.mp3` — 1.8 MB
- `Track 20.opus` — 1.4 MB
- `Track 21.mp3` — 1.9 MB
- `Track 21.opus` — 1.4 MB
- `Track 22.mp3` — 1.5 MB
- `Track 22.opus` — 1.1 MB
- `Track 23.mp3` — 1.7 MB
- `Track 23.opus` — 1.3 MB
- `Track 24_intro.mp3` — 1.5 MB
- `Track 24_intro.opus` — 1.6 MB
- `Track 25.mp3` — 726 KB
- `Track 25.opus` — 871 KB
- `Track 26.mp3` — 754 KB
- `Track 26.opus` — 878 KB
- `Track 27.mp3` — 772 KB
- `Track 27.opus` — 890 KB
- `Track 28.mp3` — 739 KB
- `Track 28.opus` — 885 KB
- `Track 29.mp3` — 491 KB
- `Track 29.opus` — 580 KB
- `Track 2_intro.mp3` — 2.7 MB
- `Track 2_intro.opus` — 2.9 MB
- `Track 3.mp3` — 1012 KB
- `Track 3.opus` — 875 KB
- `Track 30.mp3` — 738 KB
- `Track 30.opus` — 869 KB
- `Track 31_intro.mp3` — 638 KB
- `Track 31_intro.opus` — 641 KB
- `Track 32.mp3` — 832 KB
- `Track 32.opus` — 839 KB
- `Track 33.mp3` — 781 KB
- `Track 33.opus` — 769 KB
- `Track 34.mp3` — 873 KB
- `Track 34.opus` — 846 KB
- `Track 35.mp3` — 804 KB
- `Track 35.opus` — 801 KB
- `Track 36.mp3` — 824 KB
- `Track 36.opus` — 813 KB
- `Track 37.mp3` — 1.3 MB
- `Track 37.opus` — 1.3 MB
- `Track 38_instructie videodeel.mp3` — 211 KB
- `Track 38_instructie videodeel.opus` — 214 KB
- `Track 39_intro.mp3` — 272 KB
- `Track 39_intro.opus` — 246 KB
- `Track 4.mp3` — 970 KB
- `Track 4.opus` — 846 KB
- `Track 40.mp4` — 7.2 MB
- `Track 40.webm` — 8.8 MB
- `Track 41.mp4` — 5.3 MB
- `Track 41.webm` — 7.2 MB
- `Track 42.mp4` — 2.8 MB
- `Track 42.webm` — 3.8 MB
- `Track 43.mp4` — 4.9 MB
- `Track 43.webm` — 6.0 MB
- `Track 44_intro.mp3` — 464 KB
- `Track 44_intro.opus` — 420 KB
- `Track 45.mp4` — 3.1 MB
- `Track 45.webm` — 4.2 MB
- `Track 46.mp4` — 3.6 MB
- `Track 46.webm` — 5.4 MB
- `Track 47.mp4` — 2.2 MB
- `Track 47.webm` — 3.5 MB
- `Track 48.mp4` — 3.3 MB
- `Track 48.webm` — 4.2 MB
- `Track 49_bron en disclaimer.mp3` — 102 KB
- `Track 49_bron en disclaimer.opus` — 116 KB
- `Track 5.mp3` — 1.5 MB
- `Track 5.opus` — 1.3 MB
- `Track 6.mp3` — 1.3 MB
- `Track 6.opus` — 1.2 MB
- `Track 7.mp3` — 830 KB
- `Track 7.opus` — 719 KB
- `Track 8.mp3` — 972 KB
- `Track 8.opus` — 844 KB
- `Track 9.mp3` — 765 KB
- `Track 9.opus` — 669 KB
- `track 13_intro.mp3` — 1.1 MB
- `track 13_intro.opus` — 1022 KB

**`atili/Dutch/oefenexamensnt2/2023 Spreken I openbaar examen audiobestanden/`** — 36 files, 22.0 MB

- `Track 10_deel 2 instructie.mp3` — 1.5 MB
- `Track 10_deel 2 instructie.opus` — 2.0 MB
- `Track 11.mp3` — 806 KB
- `Track 11.opus` — 722 KB
- `Track 12.mp3` — 385 KB
- `Track 12.opus` — 507 KB
- `Track 13.mp3` — 608 KB
- `Track 13.opus` — 556 KB
- `Track 14.mp3` — 695 KB
- `Track 14.opus` — 658 KB
- `Track 15.mp3` — 679 KB
- `Track 15.opus` — 639 KB
- `Track 16.mp3` — 776 KB
- `Track 16.opus` — 713 KB
- `Track 17.mp3` — 759 KB
- `Track 17.opus` — 630 KB
- `Track 18.mp3` — 587 KB
- `Track 18.opus` — 547 KB
- `Track 1_deel 1 instructie.mp3` — 1.1 MB
- `Track 1_deel 1 instructie.opus` — 1.3 MB
- `Track 2.mp3` — 441 KB
- `Track 2.opus` — 465 KB
- `Track 3.mp3` — 421 KB
- `Track 3.opus` — 439 KB
- `Track 4.mp3` — 234 KB
- `Track 4.opus` — 207 KB
- `Track 5.mp3` — 332 KB
- `Track 5.opus` — 319 KB
- `Track 6.mp3` — 504 KB
- `Track 6.opus` — 455 KB
- `Track 7.mp3` — 425 KB
- `Track 7.opus` — 391 KB
- `Track 8.mp3` — 447 KB
- `Track 8.opus` — 511 KB
- `Track 9.mp3` — 314 KB
- `Track 9.opus` — 291 KB

**`atili/Dutch/oefenexamensnt2/2023 Spreken II openbaar examen audiobestanden/Audio zips/`** — 32 files, 25.6 MB

- `Track 10_Opgave 8.mp3` — 467 KB
- `Track 10_Opgave 8.opus` — 625 KB
- `Track 11_Opgave 9.mp3` — 792 KB
- `Track 11_Opgave 9.opus` — 802 KB
- `Track 12_Opgave 10.mp3` — 591 KB
- `Track 12_Opgave 10.opus` — 589 KB
- `Track 13_Opgave 11.mp3` — 683 KB
- `Track 13_Opgave 11.opus` — 697 KB
- `Track 14_Opgave 12.mp3` — 835 KB
- `Track 14_Opgave 12.opus` — 825 KB
- `Track 15_deel 3 instructie.mp3` — 582 KB
- `Track 15_deel 3 instructie.opus` — 463 KB
- `Track 16_Opgave 13.mp3` — 1.6 MB
- `Track 16_Opgave 13.opus` — 3.0 MB
- `Track 1_deel 1 instructie.mp3` — 1.5 MB
- `Track 1_deel 1 instructie.opus` — 1.2 MB
- `Track 2_Opgave 1.mp3` — 196 KB
- `Track 2_Opgave 1.opus` — 173 KB
- `Track 3_Opgave 2.mp3` — 508 KB
- `Track 3_Opgave 2.opus` — 369 KB
- `Track 4_Opgave 3.mp3` — 483 KB
- `Track 4_Opgave 3.opus` — 442 KB
- `Track 5_Opgave 4.mp3` — 453 KB
- `Track 5_Opgave 4.opus` — 387 KB
- `Track 6_ deel 2 instructie.mp3` — 2.3 MB
- `Track 6_ deel 2 instructie.opus` — 1.9 MB
- `Track 7_Opgave 5.mp3` — 424 KB
- `Track 7_Opgave 5.opus` — 588 KB
- `Track 8_Opgave 6.mp3` — 604 KB
- `Track 8_Opgave 6.opus` — 612 KB
- `Track 9_Opgave 7.mp3` — 658 KB
- `Track 9_Opgave 7.opus` — 658 KB

**`atili/Dutch/oefenexamensnt2/2024 Luisteren I openbaar examen audio- en videobestanden/`** — 61 files, 129.1 MB

- `Track 10 opgave 7.mp3` — 569 KB
- `Track 11 opgave 8.mp3` — 633 KB
- `Track 12 opgave 9.mp3` — 870 KB
- `Track 13 opgave 10.mp3` — 683 KB
- `Track 14 opgave 11.mp3` — 697 KB
- `Track 15 opgave 12.mp3` — 691 KB
- `Track 16 opgave 13.mp3` — 1.2 MB
- `Track 17 opgave 14.mp3` — 1.0 MB
- `Track 18  opgave 15.mp3` — 829 KB
- `Track 19 intro bakkerij stoepje.mp3` — 1.1 MB
- `Track 1_instructie.mp3` — 556 KB
- `Track 1_instructie.opus` — 570 KB
- `Track 2 intro Hoofdconducteur NS.mp3` — 2.8 MB
- `Track 20 opgave 16.mp3` — 823 KB
- `Track 21 opgave 17.mp3` — 806 KB
- `Track 22 opgave 18.mp3` — 850 KB
- `Track 23 opgave 19.mp3` — 940 KB
- `Track 24 opgave 20.mp3` — 710 KB
- `Track 25 opgave 21.mp3` — 710 KB
- `Track 26 opgave 22.mp3` — 805 KB
- `Track 27 opgave 23.mp3` — 813 KB
- `Track 28 intro Huisartsassistent.mp3` — 1.3 MB
- `Track 29 opgave 24.mp3` — 1.0 MB
- `Track 3 opgave 1.mp3` — 1.0 MB
- `Track 30 opgave 25.mp3` — 1.1 MB
- `Track 31 opgave 26.mp3` — 997 KB
- `Track 33 opgave 27.mp3` — 1.4 MB
- `Track 34 opgave 28.mp3` — 587 KB
- `Track 35 opgave 29.mp3` — 749 KB
- `Track 36 opgave 30.mp3` — 802 KB
- `Track 37_instructie videodeel.mp3` — 211 KB
- `Track 37_instructie videodeel.opus` — 214 KB
- `Track 38 intro 1 Beeldhouwer houten beelden.mp3` — 613 KB
- `Track 39 intro 2 Beeldhouwer houten beelden.mp4` — 1.3 MB
- `Track 39 intro 2 Beeldhouwer houten beelden.webm` — 2.0 MB
- `Track 4 opgave 2.mp3` — 836 KB
- `Track 40_instructie.mp3` — 114 KB
- `Track 40_instructie.opus` — 105 KB
- `Track 41 opgave 31.mp4` — 4.1 MB
- `Track 41 opgave 31.webm` — 7.8 MB
- `Track 42 opgave 32.mp4` — 4.9 MB
- `Track 42 opgave 32.webm` — 8.4 MB
- `Track 43 opgave 33.mp4` — 3.5 MB
- `Track 43 opgave 33.webm` — 6.1 MB
- `Track 44 opgave 34.mp4` — 3.7 MB
- `Track 44 opgave 34.webm` — 6.2 MB
- `Track 45 opgave 35.mp4` — 3.7 MB
- `Track 45 opgave 35.webm` — 6.2 MB
- `Track 46 opgave 36.mp4` — 5.3 MB
- `Track 46 opgave 36.webm` — 8.5 MB
- `Track 47 opgave 37.mp4` — 4.9 MB
- `Track 47 opgave 37.webm` — 8.3 MB
- `Track 48 opgave 38.mp4` — 3.7 MB
- `Track 48 opgave 38.webm` — 6.1 MB
- `Track 49_bron en disclaimer.mp3` — 102 KB
- `Track 49_bron en disclaimer.opus` — 116 KB
- `Track 5 opgave 3.mp3` — 868 KB
- `Track 6 opgave 4.mp3` — 820 KB
- `Track 7 opgave 5.mp3` — 802 KB
- `Track 8 opgave 6.mp3` — 1.0 MB
- `Track 9 intro Mbo-opleiding gastvrouw.mp3` — 1.4 MB

**`atili/Dutch/oefenexamensnt2/2024 Luisteren II openbaar examen audio- en videobestanden/`** — 92 files, 167.9 MB

- `Track 10_opgave 8.mp3` — 1.7 MB
- `Track 10_opgave 8.opus` — 1.4 MB
- `Track 11_intro.mp3` — 1.2 MB
- `Track 11_intro.opus` — 1.3 MB
- `Track 12_opgave 9.mp3` — 695 KB
- `Track 12_opgave 9.opus` — 641 KB
- `Track 13_opgave 10.mp3` — 727 KB
- `Track 13_opgave 10.opus` — 683 KB
- `Track 14_opgave 11.mp3` — 1.7 MB
- `Track 14_opgave 11.opus` — 1.6 MB
- `Track 15_opgave 12.mp3` — 1.0 MB
- `Track 15_opgave 12.opus` — 1011 KB
- `Track 16_opgave 13.mp3` — 1.5 MB
- `Track 16_opgave 13.opus` — 1.3 MB
- `Track 17_opgave 14.mp3` — 1.4 MB
- `Track 17_opgave 14.opus` — 1.4 MB
- `Track 18_opgave 15.mp3` — 797 KB
- `Track 18_opgave 15.opus` — 732 KB
- `Track 19_intro.mp3` — 1.7 MB
- `Track 19_intro.opus` — 1.6 MB
- `Track 1_instructie.mp3` — 556 KB
- `Track 1_instructie.opus` — 570 KB
- `Track 20_opgave 16.mp3` — 1.1 MB
- `Track 20_opgave 16.opus` — 1.1 MB
- `Track 21_opgave 17.mp3` — 903 KB
- `Track 21_opgave 17.opus` — 840 KB
- `Track 22_opgave 18.mp3` — 619 KB
- `Track 22_opgave 18.opus` — 598 KB
- `Track 23_opgave 19.mp3` — 1.3 MB
- `Track 23_opgave 19.opus` — 1.2 MB
- `Track 24_opgave 20.mp3` — 873 KB
- `Track 24_opgave 20.opus` — 884 KB
- `Track 25_opgave 21.mp3` — 965 KB
- `Track 25_opgave 21.opus` — 978 KB
- `Track 26_intro.mp3` — 1.5 MB
- `Track 26_intro.opus` — 1.5 MB
- `Track 27_opgave 22.mp3` — 1.1 MB
- `Track 27_opgave 22.opus` — 901 KB
- `Track 28_opgave 23.mp3` — 1.4 MB
- `Track 28_opgave 23.opus` — 1.2 MB
- `Track 29_opgave 24.mp3` — 732 KB
- `Track 29_opgave 24.opus` — 616 KB
- `Track 2_intro.mp3` — 3.4 MB
- `Track 2_intro.opus` — 3.4 MB
- `Track 30_opgave 25.mp3` — 1.6 MB
- `Track 30_opgave 25.opus` — 1.3 MB
- `Track 31_opgave 26.mp3` — 761 KB
- `Track 31_opgave 26.opus` — 647 KB
- `Track 32_opgave 27.mp3` — 661 KB
- `Track 32_opgave 27.opus` — 579 KB
- `Track 33_opgave 28.mp3` — 1.0 MB
- `Track 33_opgave 28.opus` — 891 KB
- `Track 34_instructie videodeel.mp3` — 211 KB
- `Track 34_instructie videodeel.opus` — 214 KB
- `Track 35_intro.mp3` — 500 KB
- `Track 35_intro.opus` — 408 KB
- `Track 36_opgave 29.mp4` — 5.6 MB
- `Track 36_opgave 29.webm` — 9.5 MB
- `Track 37_opgave 30.mp4` — 5.7 MB
- `Track 37_opgave 30.webm` — 8.6 MB
- `Track 38_opgave 31.mp4` — 3.3 MB
- `Track 38_opgave 31.webm` — 5.5 MB
- `Track 39_opgave 32.mp4` — 2.7 MB
- `Track 39_opgave 32.webm` — 4.0 MB
- `Track 3_opgave 1.mp3` — 1.4 MB
- `Track 3_opgave 1.opus` — 1.2 MB
- `Track 40_opgave 33.mp4` — 4.8 MB
- `Track 40_opgave 33.webm` — 6.9 MB
- `Track 41_intro.mp3` — 285 KB
- `Track 41_intro.opus` — 263 KB
- `Track 42_opgave 34.mp4` — 2.7 MB
- `Track 42_opgave 34.webm` — 3.3 MB
- `Track 43_opgave 35.mp4` — 5.8 MB
- `Track 43_opgave 35.webm` — 6.4 MB
- `Track 44_opgave 36.mp4` — 1.9 MB
- `Track 44_opgave 36.webm` — 2.7 MB
- `Track 45_opgave 37.mp4` — 3.8 MB
- `Track 45_opgave 37.webm` — 5.7 MB
- `Track 46_bron en disclaimer.mp3` — 102 KB
- `Track 46_bron en disclaimer.opus` — 116 KB
- `Track 4_opgave 2.mp3` — 1.4 MB
- `Track 4_opgave 2.opus` — 1.1 MB
- `Track 5_opgave 3.mp3` — 1.4 MB
- `Track 5_opgave 3.opus` — 1.1 MB
- `Track 6_opgave 4.mp3` — 1.3 MB
- `Track 6_opgave 4.opus` — 1.1 MB
- `Track 7_opgave 5.mp3` — 1.3 MB
- `Track 7_opgave 5.opus` — 1.1 MB
- `Track 8_opgave 6.mp3` — 1.6 MB
- `Track 8_opgave 6.opus` — 1.3 MB
- `Track 9_opgave 7.mp3` — 1.2 MB
- `Track 9_opgave 7.opus` — 1.0 MB

**`atili/Dutch/oefenexamensnt2/2024 Spreken I openbaar examen audiobestanden/Zips audio/`** — 38 files, 21.8 MB

- `Track 10_deel_2_instructie.mp3` — 1.5 MB
- `Track 10_deel_2_instructie.opus` — 2.0 MB
- `Track 11_Opgave 9.mp3` — 625 KB
- `Track 11_Opgave 9.opus` — 844 KB
- `Track 12_Opgave 10.mp3` — 671 KB
- `Track 12_Opgave 10.opus` — 625 KB
- `Track 13_Opgave 11.mp3` — 392 KB
- `Track 13_Opgave 11.opus` — 614 KB
- `Track 14_Opgave 12.mp3` — 574 KB
- `Track 14_Opgave 12.opus` — 773 KB
- `Track 15_Opgave 13.mp3` — 406 KB
- `Track 15_Opgave 13.opus` — 559 KB
- `Track 16_Opgave 14.mp3` — 623 KB
- `Track 16_Opgave 14.opus` — 625 KB
- `Track 17_Opgave 15.mp3` — 512 KB
- `Track 17_Opgave 15.opus` — 752 KB
- `Track 18_Opgave 16.mp3` — 538 KB
- `Track 18_Opgave 16.opus` — 489 KB
- `Track 1_deel_1_instructie.mp3` — 1.1 MB
- `Track 1_deel_1_instructie.opus` — 1.3 MB
- `Track 2_Opgave 1.mp3` — 378 KB
- `Track 2_Opgave 1.opus` — 305 KB
- `Track 3_Opgave 2.mp3` — 539 KB
- `Track 3_Opgave 2.opus` — 436 KB
- `Track 4_Opgave 3.mp3` — 293 KB
- `Track 4_Opgave 3.opus` — 371 KB
- `Track 5_Opgave 4.mp3` — 323 KB
- `Track 5_Opgave 4.opus` — 347 KB
- `Track 6_Opgave 5.mp3` — 367 KB
- `Track 6_Opgave 5.opus` — 394 KB
- `Track 7_Opgave 6.mp3` — 389 KB
- `Track 7_Opgave 6.opus` — 333 KB
- `Track 7_Opgave 6_.mp3` — 359 KB
- `Track 7_Opgave 6_.opus` — 324 KB
- `Track 8_Opgave 7.mp3` — 223 KB
- `Track 8_Opgave 7.opus` — 242 KB
- `Track 9_Opgave 8.mp3` — 503 KB
- `Track 9_Opgave 8.opus` — 595 KB

**`atili/Dutch/oefenexamensnt2/2024 Spreken II openbaar examen audiobestanden/Zips audio/`** — 32 files, 28.4 MB

- `Track 10_Opgave 8.mp3` — 706 KB
- `Track 10_Opgave 8.opus` — 830 KB
- `Track 11_Opgave 9.mp3` — 477 KB
- `Track 11_Opgave 9.opus` — 631 KB
- `Track 12_Opgave 10.mp3` — 428 KB
- `Track 12_Opgave 10.opus` — 595 KB
- `Track 13_Opgave 11.mp3` — 741 KB
- `Track 13_Opgave 11.opus` — 801 KB
- `Track 14_Opgave 12.mp3` — 453 KB
- `Track 14_Opgave 12.opus` — 598 KB
- `Track 15_deel_3_instructie.mp3` — 582 KB
- `Track 15_deel_3_instructie.opus` — 463 KB
- `Track 16_Opgave 13.mp3` — 3.0 MB
- `Track 16_Opgave 13.opus` — 3.0 MB
- `Track 1_deel_1_instructie.mp3` — 1.5 MB
- `Track 1_deel_1_instructie.opus` — 1.2 MB
- `Track 2_Opgave 1.mp3` — 592 KB
- `Track 2_Opgave 1.opus` — 615 KB
- `Track 3_Opgave 2.mp3` — 431 KB
- `Track 3_Opgave 2.opus` — 423 KB
- `Track 4_Opgave 3.mp3` — 487 KB
- `Track 4_Opgave 3.opus` — 524 KB
- `Track 5_Opgave 4.mp3` — 601 KB
- `Track 5_Opgave 4.opus` — 494 KB
- `Track 6_deel_2_instructie.mp3` — 2.3 MB
- `Track 6_deel_2_instructie.opus` — 1.9 MB
- `Track 7_Opgave 5.mp3` — 631 KB
- `Track 7_Opgave 5.opus` — 676 KB
- `Track 8_Opgave 6.mp3` — 790 KB
- `Track 8_Opgave 6.opus` — 749 KB
- `Track 9_Opgave 7.mp3` — 821 KB
- `Track 9_Opgave 7.opus` — 790 KB

**`atili/Dutch/oefenexamensnt2/2025 Luisteren I openbaar examen audio- en videobestanden/`** — 100 files, 128.6 MB

- `Track 10 _opgave 7.mp3` — 1.0 MB
- `Track 10 _opgave 7.opus` — 964 KB
- `Track 11_opgave 8.mp3` — 1.5 MB
- `Track 11_opgave 8.opus` — 1.3 MB
- `Track 12 _opgave 9.mp3` — 1.7 MB
- `Track 12 _opgave 9.opus` — 1.5 MB
- `Track 13 _opgave 10.mp3` — 1.2 MB
- `Track 13 _opgave 10.opus` — 1.1 MB
- `Track 14 _opgave 11.mp3` — 1.1 MB
- `Track 14 _opgave 11.opus` — 978 KB
- `Track 15 _opgave 12.mp3` — 1.1 MB
- `Track 15 _opgave 12.opus` — 977 KB
- `Track 16 _opgave 13.mp3` — 978 KB
- `Track 16 _opgave 13.opus` — 883 KB
- `Track 17_intro.mp3` — 845 KB
- `Track 17_intro.opus` — 887 KB
- `Track 18_opgave 14.mp3` — 1021 KB
- `Track 18_opgave 14.opus` — 1.1 MB
- `Track 19_opgave 15.mp3` — 714 KB
- `Track 19_opgave 15.opus` — 717 KB
- `Track 1_instructie.mp3` — 556 KB
- `Track 1_instructie.opus` — 570 KB
- `Track 20_opgave 16.mp3` — 1.1 MB
- `Track 20_opgave 16.opus` — 1.2 MB
- `Track 21_opgave 17.mp3` — 849 KB
- `Track 21_opgave 17.opus` — 858 KB
- `Track 22_opgave 18.mp3` — 1019 KB
- `Track 22_opgave 18.opus` — 1.0 MB
- `Track 23_intro.mp3` — 843 KB
- `Track 23_intro.opus` — 848 KB
- `Track 24_opgave 19.mp3` — 677 KB
- `Track 24_opgave 19.opus` — 844 KB
- `Track 25_opgave 20.mp3` — 421 KB
- `Track 25_opgave 20.opus` — 527 KB
- `Track 26_opgave 21.mp3` — 566 KB
- `Track 26_opgave 21.opus` — 676 KB
- `Track 27_opgave 22.mp3` — 777 KB
- `Track 27_opgave 22.opus` — 944 KB
- `Track 28_opgave 23.mp3` — 457 KB
- `Track 28_opgave 23.opus` — 586 KB
- `Track 29_intro.mp3` — 733 KB
- `Track 29_intro.opus` — 693 KB
- `Track 2_Intro.mp3` — 2.5 MB
- `Track 2_Intro.opus` — 3.2 MB
- `Track 30_opgave 24.mp3` — 1.1 MB
- `Track 30_opgave 24.opus` — 918 KB
- `Track 31_opgave 25.mp3` — 1.2 MB
- `Track 31_opgave 25.opus` — 942 KB
- `Track 32_opgave 26.mp3` — 629 KB
- `Track 32_opgave 26.opus` — 502 KB
- `Track 33_opgave 27.mp3` — 1.1 MB
- `Track 33_opgave 27.opus` — 915 KB
- `Track 34_opgave 28.mp3` — 673 KB
- `Track 34_opgave 28.opus` — 546 KB
- `Track 35_opgave 29.mp3` — 1.1 MB
- `Track 35_opgave 29.opus` — 877 KB
- `Track 36_opgave 30.mp3` — 897 KB
- `Track 36_opgave 30.opus` — 704 KB
- `Track 37_opgave 31.mp3` — 947 KB
- `Track 37_opgave 31.opus` — 767 KB
- `Track 38_opgave 32.mp3` — 863 KB
- `Track 38_opgave 32.opus` — 703 KB
- `Track 39_instructie videodeel.mp3` — 211 KB
- `Track 39_instructie videodeel.opus` — 214 KB
- `Track 3_opgave 1.mp3` — 738 KB
- `Track 3_opgave 1.opus` — 855 KB
- `Track 40_Intro1.mp3` — 341 KB
- `Track 40_Intro1.opus` — 354 KB
- `Track 41_Intro2.mp4` — 2.5 MB
- `Track 41_Intro2.webm` — 5.6 MB
- `Track 42_instructie.mp3` — 114 KB
- `Track 42_instructie.opus` — 105 KB
- `Track 43_opgave 33.mp4` — 1.8 MB
- `Track 43_opgave 33.webm` — 4.2 MB
- `Track 44_opgave 34.mp4` — 3.1 MB
- `Track 44_opgave 34.webm` — 5.9 MB
- `Track 45_opgave 35.mp4` — 2.2 MB
- `Track 45_opgave 35.webm` — 4.7 MB
- `Track 46_opgave 36.mp4` — 1.7 MB
- `Track 46_opgave 36.webm` — 3.8 MB
- `Track 47_opgave 37.mp4` — 2.0 MB
- `Track 47_opgave 37.webm` — 6.8 MB
- `Track 48_opgave 38.mp4` — 1.2 MB
- `Track 48_opgave 38.webm` — 2.6 MB
- `Track 49_opgave 39.mp4` — 2.3 MB
- `Track 49_opgave 39.webm` — 4.8 MB
- `Track 4_opgave 2.mp3` — 825 KB
- `Track 4_opgave 2.opus` — 921 KB
- `Track 50_bron en disclaimer.mp3` — 102 KB
- `Track 50_bron en disclaimer.opus` — 116 KB
- `Track 5_opgave 3.mp3` — 1.0 MB
- `Track 5_opgave 3.opus` — 1.2 MB
- `Track 6_opgave 4.mp3` — 566 KB
- `Track 6_opgave 4.opus` — 678 KB
- `Track 7_opgave 5.mp3` — 793 KB
- `Track 7_opgave 5.opus` — 944 KB
- `Track 8_Intro.mp3` — 1.2 MB
- `Track 8_Intro.opus` — 1.1 MB
- `Track 9_opgave 6.mp3` — 1.4 MB
- `Track 9_opgave 6.opus` — 1.3 MB

**`atili/Dutch/oefenexamensnt2/2025 Luisteren II openbaar examen audio- en videobestanden/`** — 96 files, 159.1 MB

- `Track 10_opgave 8.mp3` — 649 KB
- `Track 10_opgave 8.opus` — 734 KB
- `Track 11_Intro.mp3` — 1.5 MB
- `Track 11_Intro.opus` — 1.4 MB
- `Track 12_opgave 9.mp3` — 722 KB
- `Track 12_opgave 9.opus` — 960 KB
- `Track 13_opgave 10.mp3` — 619 KB
- `Track 13_opgave 10.opus` — 826 KB
- `Track 14_opgave 11.mp3` — 534 KB
- `Track 14_opgave 11.opus` — 708 KB
- `Track 15_opgave 12.mp3` — 827 KB
- `Track 15_opgave 12.opus` — 1.1 MB
- `Track 16_opgave 13.mp3` — 601 KB
- `Track 16_opgave 13.opus` — 815 KB
- `Track 17_opgave 14.mp3` — 674 KB
- `Track 17_opgave 14.opus` — 876 KB
- `Track 18_opgave 15.mp3` — 463 KB
- `Track 18_opgave 15.opus` — 639 KB
- `Track 19_intro.mp3` — 2.3 MB
- `Track 19_intro.opus` — 2.5 MB
- `Track 1_instructie.mp3` — 556 KB
- `Track 1_instructie.opus` — 570 KB
- `Track 20_opgave 16.mp3` — 879 KB
- `Track 20_opgave 16.opus` — 1.0 MB
- `Track 21_opgave 17.mp3` — 770 KB
- `Track 21_opgave 17.opus` — 935 KB
- `Track 22_opgave 18.mp3` — 651 KB
- `Track 22_opgave 18.opus` — 786 KB
- `Track 23_opgave 19.mp3` — 971 KB
- `Track 23_opgave 19.opus` — 1.0 MB
- `Track 24_opgave 20.mp3` — 887 KB
- `Track 24_opgave 20.opus` — 1.0 MB
- `Track 25_opgave 21.mp3` — 674 KB
- `Track 25_opgave 21.opus` — 803 KB
- `Track 26_opgave 22.mp3` — 914 KB
- `Track 26_opgave 22.opus` — 1.0 MB
- `Track 27_opgave 23.mp3` — 883 KB
- `Track 27_opgave 23.opus` — 1.0 MB
- `Track 28_opgave 24.mp3` — 904 KB
- `Track 28_opgave 24.opus` — 1.1 MB
- `Track 29_intro.mp3` — 660 KB
- `Track 29_intro.opus` — 633 KB
- `Track 2_intro.mp3` — 2.9 MB
- `Track 2_intro.opus` — 3.3 MB
- `Track 30_opgave 25.mp3` — 1.4 MB
- `Track 30_opgave 25.opus` — 1.1 MB
- `Track 31_opgave 26.mp3` — 1.6 MB
- `Track 31_opgave 26.opus` — 1.2 MB
- `Track 32_opgave 27.mp3` — 1.5 MB
- `Track 32_opgave 27.opus` — 1.2 MB
- `Track 33_opgave 28.mp3` — 1.3 MB
- `Track 33_opgave 28.opus` — 1.0 MB
- `Track 34_opgave 29.mp3` — 1.6 MB
- `Track 34_opgave 29.opus` — 1.3 MB
- `Track 35_opgave 30.mp3` — 1.7 MB
- `Track 35_opgave 30.opus` — 1.3 MB
- `Track 36_instructie videodeel.mp3` — 211 KB
- `Track 36_instructie videodeel.opus` — 214 KB
- `Track 37_intro 1.mp3` — 337 KB
- `Track 37_intro 1.opus` — 343 KB
- `Track 38_intro 2.mp4` — 1.0 MB
- `Track 38_intro 2.webm` — 2.1 MB
- `Track 39_instructie.mp3` — 114 KB
- `Track 39_instructie.opus` — 105 KB
- `Track 3_opgave 1.mp3` — 1.1 MB
- `Track 3_opgave 1.opus` — 1.3 MB
- `Track 40_opgave 31.mp4` — 2.8 MB
- `Track 40_opgave 31.webm` — 6.9 MB
- `Track 41_opgave 32.mp4` — 3.4 MB
- `Track 41_opgave 32.webm` — 8.6 MB
- `Track 42_opgave 33.mp4` — 2.8 MB
- `Track 42_opgave 33.webm` — 6.3 MB
- `Track 43_opgave 34.mp4` — 2.8 MB
- `Track 43_opgave 34.webm` — 7.0 MB
- `Track 44_opgave 35.mp4` — 3.0 MB
- `Track 44_opgave 35.webm` — 7.2 MB
- `Track 45_opgave 36.mp4` — 2.8 MB
- `Track 45_opgave 36.webm` — 6.4 MB
- `Track 46_opgave 37.mp4` — 2.6 MB
- `Track 46_opgave 37.webm` — 5.8 MB
- `Track 47_opgave 38.mp4` — 3.8 MB
- `Track 47_opgave 38.webm` — 9.7 MB
- `Track 48_bron en disclaimer.mp3` — 102 KB
- `Track 48_bron en disclaimer.opus` — 116 KB
- `Track 4_opgave 2.mp3` — 1.0 MB
- `Track 4_opgave 2.opus` — 1.1 MB
- `Track 5_opgave 3.mp3` — 833 KB
- `Track 5_opgave 3.opus` — 928 KB
- `Track 6_opgave 4.mp3` — 717 KB
- `Track 6_opgave 4.opus` — 803 KB
- `Track 7_opgave 5.mp3` — 880 KB
- `Track 7_opgave 5.opus` — 1013 KB
- `Track 8_opgave 6.mp3` — 846 KB
- `Track 8_opgave 6.opus` — 957 KB
- `Track 9_opgave 7.mp3` — 709 KB
- `Track 9_opgave 7.opus` — 808 KB

**`atili/Dutch/oefenexamensnt2/2025 Spreken I openbaar examen audiobestanden/`** — 36 files, 21.7 MB

- `Track 10_deel 2 instructie.mp3` — 1.4 MB
- `Track 10_deel 2 instructie.opus` — 1.9 MB
- `Track 11_Opgave 9.mp3` — 466 KB
- `Track 11_Opgave 9.opus` — 675 KB
- `Track 12_Opgave 10.mp3` — 590 KB
- `Track 12_Opgave 10.opus` — 580 KB
- `Track 13_Opgave 11.mp3` — 590 KB
- `Track 13_Opgave 11.opus` — 784 KB
- `Track 14_Opgave 12.mp3` — 785 KB
- `Track 14_Opgave 12.opus` — 881 KB
- `Track 15_Opgave 13.mp3` — 692 KB
- `Track 15_Opgave 13.opus` — 828 KB
- `Track 16_Opgave 14.mp3` — 463 KB
- `Track 16_Opgave 14.opus` — 664 KB
- `Track 17_Opgave 15.mp3` — 523 KB
- `Track 17_Opgave 15.opus` — 604 KB
- `Track 18_Opgave 16.mp3` — 423 KB
- `Track 18_Opgave 16.opus` — 619 KB
- `Track 1_deel 1 instructie.mp3` — 1.0 MB
- `Track 1_deel 1 instructie.opus` — 1.3 MB
- `Track 2_Opgave 1.mp3` — 351 KB
- `Track 2_Opgave 1.opus` — 309 KB
- `Track 3_Opgave 2.mp3` — 511 KB
- `Track 3_Opgave 2.opus` — 481 KB
- `Track 4_Opgave 3.mp3` — 428 KB
- `Track 4_Opgave 3.opus` — 442 KB
- `Track 5_Opgave 4.mp3` — 386 KB
- `Track 5_Opgave 4.opus` — 349 KB
- `Track 6_Opgave 5.mp3` — 445 KB
- `Track 6_Opgave 5.opus` — 483 KB
- `Track 7_Opgave 6.mp3` — 481 KB
- `Track 7_Opgave 6.opus` — 386 KB
- `Track 8_Opgave 7.mp3` — 312 KB
- `Track 8_Opgave 7.opus` — 407 KB
- `Track 9_Opgave 8.mp3` — 248 KB
- `Track 9_Opgave 8.opus` — 323 KB

**`atili/Dutch/oefenexamensnt2/2025 Spreken II openbaar examen audiobestanden/`** — 32 files, 30.0 MB

- `Track 10_Opgave 8.mp3` — 696 KB
- `Track 10_Opgave 8.opus` — 805 KB
- `Track 11_Opgave 9.mp3` — 752 KB
- `Track 11_Opgave 9.opus` — 904 KB
- `Track 12_Opgave 10.mp3` — 670 KB
- `Track 12_Opgave 10.opus` — 699 KB
- `Track 13_Opgave 11.mp3` — 865 KB
- `Track 13_Opgave 11.opus` — 987 KB
- `Track 14_Opgave 12.mp3` — 524 KB
- `Track 14_Opgave 12.opus` — 691 KB
- `Track 15_deel 3 instructie.mp3` — 465 KB
- `Track 15_deel 3 instructie.opus` — 400 KB
- `Track 16_Opgave 13.mp3` — 2.8 MB
- `Track 16_Opgave 13.opus` — 2.9 MB
- `Track 1_deel 1 instructie.mp3` — 1.3 MB
- `Track 1_deel 1 instructie.opus` — 1.2 MB
- `Track 2_Opgave 1.mp3` — 590 KB
- `Track 2_Opgave 1.opus` — 578 KB
- `Track 3_Opgave 2.mp3` — 537 KB
- `Track 3_Opgave 2.opus` — 527 KB
- `Track 4_Opgave 3.mp3` — 521 KB
- `Track 4_Opgave 3.opus` — 499 KB
- `Track 5_Opgave 4.mp3` — 641 KB
- `Track 5_Opgave 4.opus` — 657 KB
- `Track 6_deel 2 instructie.mp3` — 2.1 MB
- `Track 6_deel 2 instructie.opus` — 1.8 MB
- `Track 7_Opgave 5.mp3` — 864 KB
- `Track 7_Opgave 5.opus` — 803 KB
- `Track 8_Opgave 6.mp3` — 864 KB
- `Track 8_Opgave 6.opus` — 981 KB
- `Track 9_Opgave 7.mp3` — 833 KB
- `Track 9_Opgave 7.opus` — 804 KB

**`atili/Dutch/van-dale-groot-beeldwoordenboek-split/`** — 3 files, 468.2 MB

- `van-dale-groot-beeldwoordenboek-nederlands-english-franais-deutsch-9789066489738_part_1.pdf` — 199.5 MB
- `van-dale-groot-beeldwoordenboek-nederlands-english-franais-deutsch-9789066489738_part_2.pdf` — 199.4 MB
- `van-dale-groot-beeldwoordenboek-nederlands-english-franais-deutsch-9789066489738_part_3.pdf` — 69.4 MB

### The listening corpus, file by file

Collapsed because [`LISTENING-INVENTORY.md`](./LISTENING-INVENTORY.md) is the file to read about
these. Listed here only so this inventory is complete.

<details>
<summary>336 files in <code>dutch-listening/</code></summary>

**`atili/Dutch/dutch-listening/`** — 1 files, 1 KB

- `README.md` — 1 KB

**`atili/Dutch/dutch-listening/echt-gebeurd/`** — 2 files, 2.0 MB

- `episodes.json` — 16 KB
- `feed.rss` — 2.0 MB

**`atili/Dutch/dutch-listening/echt-gebeurd/audio/`** — 30 files, 367.2 MB

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
- `afl-575-puberdagboek-christine-marg├⌐s.mp3` — 16.2 MB
- `afl-576-de-parade-esma-╥½├╝r├╝k-en-thijs-van-litsenburg.mp3` — 13.7 MB
- `afl-577-de-parade-arianne-hinz-en-martijn-winkler.mp3` — 17.6 MB
- `afl-578-de-parade-verhalen-uit-het-publiek.mp3` — 16.8 MB
- `afl-579-het-huwelijk-maaike-dirkje-hop.mp3` — 12.5 MB

**`atili/Dutch/dutch-listening/eenbeetjenederlands/`** — 2 files, 414 KB

- `episodes.json` — 56 KB
- `feed.rss` — 357 KB

**`atili/Dutch/dutch-listening/eenbeetjenederlands/audio/`** — 91 files, 2141.7 MB

- `0-trailer.mp3` — 1.3 MB
- `1-aletta-jacobs.mp3` — 10.6 MB
- `10-oranjekoorts.mp3` — 26.2 MB
- `11-marga-klomp├⌐.mp3` — 31.9 MB
- `12-praten-met-devika-partiman-stem-op-een-vrouw---bonus.mp3` — 27.5 MB
- `13-vlaams.mp3` — 12.2 MB
- `14-praten-met-sietske---bonus.mp3` — 30.6 MB
- `15-rembrandt-van-rijn.mp3` — 11.6 MB
- `16-de-nachtwacht---bonus.mp3` — 22.9 MB
- `17-onderwijs-in-nederland.mp3` — 52.0 MB
- `18-wie-is-robin---bonus.mp3` — 4.9 MB
- `19-sinterklaas.mp3` — 11.2 MB
- `2-de-elfstedentocht.mp3` — 28.0 MB
- `20-gronings-gas.mp3` — 13.2 MB
- `21-karel-ende-elegast.mp3` — 35.2 MB
- `22-wubbo-ockels.mp3` — 22.9 MB
- `23-watersnoodramp-1953.mp3` — 12.5 MB
- `24-tulpen.mp3` — 23.9 MB
- `25-typisch-nederlands-kinderen-voor-kinderen.mp3` — 3.5 MB
- `26-waddeneilanden.mp3` — 34.3 MB
- `27-typisch-nederlands-drop.mp3` — 4.1 MB
- `28-het-levenslied.mp3` — 24.2 MB
- `29-typisch-nederlands-de-kringverjaardag.mp3` — 3.8 MB
- `3-verkiezingen.mp3` — 11.9 MB
- `30-stikstofcrisis.mp3` — 28.5 MB
- `31-typisch-nederlands-tikkie.mp3` — 10.1 MB
- `32-romeinen-in-nederland.mp3` — 24.1 MB
- `33-typisch-nederlands-top-2000.mp3` — 10.9 MB
- `34-prinsjesdag.mp3` — 23.4 MB
- `35-troonrede.mp3` — 38.0 MB
- `36-typisch-nederlands-beschuit-met-muisjes.mp3` — 8.8 MB
- `37-misdaad-en-straf.mp3` — 27.8 MB
- `38-de-heinekenontvoering.mp3` — 23.6 MB
- `39-typisch-limburgs-vlaai.mp3` — 12.4 MB
- `4-het-wilhelmus.mp3` — 9.3 MB
- `40-de-bijlmer.mp3` — 38.8 MB
- `41-bijlmerramp.mp3` — 36.1 MB
- `42-typisch-nederlands-geboortekaartjes.mp3` — 11.5 MB
- `43-carnaval.mp3` — 28.9 MB
- `44-anne-frank.mp3` — 19.9 MB
- `45-mata-hari.mp3` — 23.3 MB
- `46-johannes-vermeer.mp3` — 19.8 MB
- `47-de-grondwet.mp3` — 18.6 MB
- `48-euthanasie.mp3` — 28.3 MB
- `49-drugsbeleid.mp3` — 25.9 MB
- `5-de-zuiderzeewerken-de-afsluitdijk-flevoland.mp3` — 11.8 MB
- `50-computerpioniers.mp3` — 31.5 MB
- `51-de-digitale-stad.mp3` — 24.6 MB
- `52-bokito-dominomus.mp3` — 15.8 MB
- `53-buienradar-9292.mp3` — 10.9 MB
- `54-efteling-madurodam.mp3` — 13.4 MB
- `55-bonuskaart-guldens.mp3` — 16.4 MB
- `56-kapsalon-patatdebat.mp3` — 13.8 MB
- `57-andr├⌐-rieu-andr├⌐-hazes.mp3` — 14.9 MB
- `58-neutraal-moresnet.mp3` — 27.9 MB
- `59-fietsen.mp3` — 25.7 MB
- `6-koningsdag.mp3` — 9.7 MB
- `60-anton-de-kom.mp3` — 24.4 MB
- `61-de-dom-van-utrecht.mp3` — 21.9 MB
- `62-het-mirakel-van-amsterdam.mp3` — 28.1 MB
- `63-antoni-van-leeuwenhoek.mp3` — 26.1 MB
- `64-jan-van-eyck.mp3` — 29.5 MB
- `65-limburgs.mp3` — 26.6 MB
- `66-zwangerschap-in-nederland.mp3` — 34.4 MB
- `67-tachtigjarige-oorlog-deel-1.mp3` — 34.8 MB
- `68-tachtigjarige-oorlog-deel-2.mp3` — 49.7 MB
- `69-anna-maria-van-schurman.mp3` — 24.1 MB
- `7-tweede-wereldoorlog-in-nederland.mp3` — 23.5 MB
- `70-natuur-in-nederland.mp3` — 38.7 MB
- `71-limburgse-mijnen.mp3` — 46.3 MB
- `72-nederlandse-cariben.mp3` — 38.3 MB
- `73-reinaert-de-vos.mp3` — 60.6 MB
- `74-provo.mp3` — 47.7 MB
- `75-heksenvervolging.mp3` — 40.0 MB
- `76-hyves.mp3` — 32.4 MB
- `77-achternamen.mp3` — 45.3 MB
- `78-soldaat-van-oranje.mp3` — 38.9 MB
- `79-michiel-de-ruyter.mp3` — 33.7 MB
- `8-annie-mg-schmidt.mp3` — 27.9 MB
- `80-kneppelfreed.mp3` — 37.2 MB
- `81-volkshuisvesting.mp3` — 39.1 MB
- `82-de-biesbosch.mp3` — 11.8 MB
- `83-van-gogh-deel-1-de-jonge-jaren.mp3` — 40.6 MB
- `84-van-gogh-deel-2-de-kunstenaar.mp3` — 23.0 MB
- `85-ramses-shaffy.mp3` — 12.8 MB
- `86-gabber.mp3` — 16.2 MB
- `87-homohuwelijk.mp3` — 15.9 MB
- `9-willem-barentsz.mp3` — 14.2 MB
- `trailer-seizoen-5-introductie-yvette.mp3` — 1.7 MB
- `trailer-seizoen-8.mp3` — 7.2 MB
- `word-nu-vriend-van-de-podcast-via-petjeafcom.mp3` — 4.5 MB

**`atili/Dutch/dutch-listening/eenbeetjenederlands/transcript/`** — 87 files, 862 KB

- `1-aletta-jacobs.txt` — 9 KB
- `10-oranjekoorts.txt` — 9 KB
- `11-marga-klomp├⌐.txt` — 11 KB
- `12-praten-met-devika-partiman-stem-op-een-vrouw---bonus.txt` — 33 KB
- `13-vlaams.txt` — 12 KB
- `14-praten-met-sietske---bonus.txt` — 37 KB
- `15-rembrandt-van-rijn.txt` — 11 KB
- `16-de-nachtwacht---bonus.txt` — 8 KB
- `17-onderwijs-in-nederland.txt` — 18 KB
- `18-wie-is-robin---bonus.txt` — 5 KB
- `19-sinterklaas.txt` — 11 KB
- `2-de-elfstedentocht.txt` — 8 KB
- `20-gronings-gas.txt` — 13 KB
- `21-karel-ende-elegast.txt` — 11 KB
- `22-wubbo-ockels.txt` — 7 KB
- `23-watersnoodramp-1953.txt` — 12 KB
- `24-tulpen.txt` — 8 KB
- `25-typisch-nederlands-kinderen-voor-kinderen.txt` — 4 KB
- `26-waddeneilanden.txt` — 10 KB
- `27-typisch-nederlands-drop.txt` — 4 KB
- `28-het-levenslied.txt` — 8 KB
- `29-typisch-nederlands-de-kringverjaardag.txt` — 4 KB
- `3-verkiezingen.txt` — 11 KB
- `30-stikstofcrisis.txt` — 9 KB
- `31-typisch-nederlands-tikkie.txt` — 4 KB
- `32-romeinen-in-nederland.txt` — 8 KB
- `33-typisch-nederlands-top-2000.txt` — 5 KB
- `34-prinsjesdag.txt` — 7 KB
- `35-troonrede.txt` — 12 KB
- `36-typisch-nederlands-beschuit-met-muisjes.txt` — 3 KB
- `37-misdaad-en-straf.txt` — 9 KB
- `38-de-heinekenontvoering.txt` — 7 KB
- `39-typisch-limburgs-vlaai.txt` — 4 KB
- `4-het-wilhelmus.txt` — 7 KB
- `40-de-bijlmer.txt` — 12 KB
- `41-bijlmerramp.txt` — 11 KB
- `42-typisch-nederlands-geboortekaartjes.txt` — 4 KB
- `43-carnaval.txt` — 8 KB
- `44-anne-frank.txt` — 7 KB
- `45-mata-hari.txt` — 7 KB
- `46-johannes-vermeer.txt` — 6 KB
- `47-de-grondwet.txt` — 6 KB
- `48-euthanasie.txt` — 9 KB
- `49-drugsbeleid.txt` — 8 KB
- `5-de-zuiderzeewerken-de-afsluitdijk-flevoland.txt` — 11 KB
- `50-computerpioniers.txt` — 9 KB
- `51-de-digitale-stad.txt` — 8 KB
- `52-bokito-dominomus.txt` — 5 KB
- `53-buienradar-9292.txt` — 4 KB
- `54-efteling-madurodam.txt` — 4 KB
- `55-bonuskaart-guldens.txt` — 6 KB
- `56-kapsalon-patatdebat.txt` — 5 KB
- `57-andr├⌐-rieu-andr├⌐-hazes.txt` — 5 KB
- `58-neutraal-moresnet.txt` — 9 KB
- `59-fietsen.txt` — 9 KB
- `6-koningsdag.txt` — 8 KB
- `60-anton-de-kom.txt` — 7 KB
- `61-de-dom-van-utrecht.txt` — 6 KB
- `62-het-mirakel-van-amsterdam.txt` — 8 KB
- `63-antoni-van-leeuwenhoek.txt` — 8 KB
- `64-jan-van-eyck.txt` — 9 KB
- `65-limburgs.txt` — 8 KB
- `66-zwangerschap-in-nederland.txt` — 11 KB
- `67-tachtigjarige-oorlog-deel-1.txt` — 10 KB
- `68-tachtigjarige-oorlog-deel-2.txt` — 15 KB
- `69-anna-maria-van-schurman.txt` — 7 KB
- `7-tweede-wereldoorlog-in-nederland.txt` — 21 KB
- `70-natuur-in-nederland.txt` — 11 KB
- `71-limburgse-mijnen.txt` — 14 KB
- `72-nederlandse-cariben.txt` — 11 KB
- `73-reinaert-de-vos.txt` — 18 KB
- `74-provo.txt` — 14 KB
- `75-heksenvervolging.txt` — 14 KB
- `76-hyves.txt` — 11 KB
- `77-achternamen.txt` — 14 KB
- `78-soldaat-van-oranje.txt` — 11 KB
- `79-michiel-de-ruyter.txt` — 10 KB
- `8-annie-mg-schmidt.txt` — 9 KB
- `80-kneppelfreed.txt` — 11 KB
- `81-volkshuisvesting.txt` — 13 KB
- `82-de-biesbosch.txt` — 10 KB
- `83-van-gogh-deel-1-de-jonge-jaren.txt` — 13 KB
- `84-van-gogh-deel-2-de-kunstenaar.txt` — 17 KB
- `85-ramses-shaffy.txt` — 9 KB
- `86-gabber.txt` — 13 KB
- `87-homohuwelijk.txt` — 12 KB
- `9-willem-barentsz.txt` — 13 KB

**`atili/Dutch/dutch-listening/librivox-nl/`** — 1 files, 25 KB

- `catalogue-210-titles.json` — 25 KB

**`atili/Dutch/dutch-listening/librivox-nl/audio/ali_baba_en_de_veertig_roovers_1411_librivox/`** — 5 files, 51.4 MB

- `alibaba_01_anoniem_64kb.mp3` — 11.8 MB
- `alibaba_02_anoniem_64kb.mp3` — 12.2 MB
- `alibaba_03_anoniem_64kb.mp3` — 15.1 MB
- `alibaba_04_anoniem_64kb.mp3` — 12.4 MB
- `metadata.json` — 2 KB

**`atili/Dutch/dutch-listening/librivox-nl/audio/zoon_dik_trom_0908_librivox/`** — 15 files, 128.5 MB

- `metadata.json` — 3 KB
- `trom2_01_kieviet_64kb.mp3` — 2.4 MB
- `trom2_02_kieviet_64kb.mp3` — 5.3 MB
- `trom2_03_kieviet_64kb.mp3` — 5.8 MB
- `trom2_04_kieviet_64kb.mp3` — 5.6 MB
- `trom2_05_kieviet_64kb.mp3` — 11.4 MB
- `trom2_06_kieviet_64kb.mp3` — 12.7 MB
- `trom2_07_kieviet_64kb.mp3` — 9.8 MB
- `trom2_08_kieviet_64kb.mp3` — 13.8 MB
- `trom2_09_kieviet_64kb.mp3` — 8.6 MB
- `trom2_10_kieviet_64kb.mp3` — 9.2 MB
- `trom2_11_kieviet_64kb.mp3` — 12.9 MB
- `trom2_12_kieviet_64kb.mp3` — 12.4 MB
- `trom2_13_kieviet_64kb.mp3` — 15.2 MB
- `trom2_14_kieviet_64kb.mp3` — 3.3 MB

**`atili/Dutch/dutch-listening/nos-jeugdjournaal/`** — 2 files, 499 KB

- `episodes.json` — 28 KB
- `feed.rss` — 471 KB

**`atili/Dutch/dutch-listening/nos-jeugdjournaal/audio/`** — 40 files, 1169.0 MB

- `45-jaar-jeugdjournaal-hoe-kijken-oud-presentatoren-daarop-terug.mp3` — 49.7 MB
- `alles-wat-je-moet-weten-om-mee-te-kunnen-praten-over-het-wk-voetbal.mp3` — 30.1 MB
- `bye-bye-basisschool-hoe-neem-je-goed-afscheid.mp3` — 28.3 MB
- `cr├¿mes-serums-en-lotion-maken-kinderen-hun-huid-kapot.mp3` — 27.9 MB
- `extra-roxy-dekker-over-haar-muziek-en-grote-liefde-koen.mp3` — 13.8 MB
- `feest-hoe-wordt-de-jeugdjournaalpodcast-gemaakt.mp3` — 41.3 MB
- `hoe-bedenk-je-de-perfecte-grap.mp3` — 30.8 MB
- `hoe-blijf-je-veilig-bij-onweer.mp3` — 29.9 MB
- `hoe-kies-je-de-middelbare-school-die-bij-jou-past.mp3` — 30.1 MB
- `hoe-kun-je-samenwerken-met-je-grootste-tegenstander.mp3` — 30.1 MB
- `hoe-volg-je-een-concert-als-je-blind-of-slechtziend-bent.mp3` — 28.4 MB
- `hoe-weet-je-wat-echt-is-over-de-oorlog-in-gaza.mp3` — 27.6 MB
- `hoe-werd-suriname-onafhankelijk-van-nederland.mp3` — 30.3 MB
- `hoe-win-je-goud-op-de-olympische-winterspelen.mp3` — 29.7 MB
- `hoe-zorg-je-dat-het-kerstdiner-een-succes-wordt.mp3` — 29.1 MB
- `hoe-zorg-je-dat-je-klaar-bent-voor-de-doorstroomtoets.mp3` — 26.5 MB
- `hoe-zwaar-is-het-om-youtuber-te-zijn.mp3` — 28.2 MB
- `is-er-een-spinnenplaag-in-nederland.mp3` — 29.0 MB
- `is-het-gevaarlijk-om-politicus-te-zijn.mp3` — 28.1 MB
- `is-het-slecht-om-de-hele-dag-op-school-te-zitten.mp3` — 26.2 MB
- `kapot-en-giftig-hoe-weet-je-of-spullen-in-webshops-goed-zijn.mp3` — 29.8 MB
- `moeten-kinderen-zich-voorbereiden-op-een-noodsituatie.mp3` — 27.8 MB
- `moeten-kinderen-zich-zorgen-maken-over-het-hantavirus.mp3` — 29.2 MB
- `offline-hoe-schadelijk-is-een-telefoon.mp3` — 28.0 MB
- `offline-wanneer-ben-je-klaar-voor-een-telefoon.mp3` — 29.5 MB
- `offline-wat-is-het-probleem.mp3` — 27.5 MB
- `waarom-is-het-belangrijk-om-te-praten-over-de-dood.mp3` — 31.2 MB
- `waarom-is-pesten-niet-verboden.mp3` — 28.2 MB
- `waarom-lopen-de-protesten-tegen-asielzoekers-uit-de-hand.mp3` — 29.5 MB
- `waarom-moeten-steeds-meer-kinderen-naar-halt.mp3` — 29.7 MB
- `waarom-worden-aangespoelde-walvissen-onderzocht.mp3` — 31.9 MB
- `waarom-wordt-er-zo-weinig-gepraat-over-roma-en-sinti-in-de-tweede-were.mp3` — 29.7 MB
- `waarom-wordt-iran-aangevallen.mp3` — 29.2 MB
- `waarom-zien-we-steeds-vaker-ratten.mp3` — 28.9 MB
- `waarom-zijn-er-27000-agenten-nodig-voor-├⌐├⌐n-vergadering.mp3` — 28.3 MB
- `wat-gebeurt-er-als-we-niets-doen-aan-klimaatverandering.mp3` — 28.4 MB
- `wat-hebben-kinderen-nou-aan-gemeenteraadsverkiezingen.mp3` — 23.8 MB
- `wat-is-de-echte-reden-dat-wilders-is-gestopt.mp3` — 26.0 MB
- `wordt-rob-jetten-een-goede-minister-president-voor-nederland.mp3` — 28.7 MB
- `zijn-drones-cool-of-gevaarlijk.mp3` — 28.7 MB

**`atili/Dutch/dutch-listening/zeg-het-in-het-nederlands/`** — 2 files, 109 KB

- `episodes.json` — 23 KB
- `feed.rss` — 86 KB

**`atili/Dutch/dutch-listening/zeg-het-in-het-nederlands/audio/`** — 58 files, 1645.1 MB

- `34-zeg-het-in-het-nederlands.mp3` — 27.4 MB
- `35-zeg-het-in-het-nederlands.mp3` — 29.1 MB
- `36-zeg-het-in-het-nederlands.mp3` — 33.3 MB
- `37-zeg-het-in-het-nederlands.mp3` — 25.2 MB
- `38-zeg-het-in-het-nederlands.mp3` — 36.7 MB
- `39-zeg-het-in-het-nederlands.mp3` — 37.6 MB
- `40-zeg-het-in-het-nederlands.mp3` — 28.0 MB
- `41-zeg-het-in-het-nederlands.mp3` — 38.8 MB
- `42-zeg-het-in-het-nederlands.mp3` — 38.4 MB
- `43-zeg-het-in-het-nederlands.mp3` — 43.6 MB
- `44-zeg-het-in-het-nederlands.mp3` — 46.9 MB
- `45-zeg-het-in-het-nederlands.mp3` — 34.4 MB
- `46-zeg-het-in-het-nederlands.mp3` — 30.7 MB
- `47-zeg-het-in-het-nederlands.mp3` — 35.3 MB
- `48-zeg-het-in-het-nederlands.mp3` — 29.3 MB
- `49-zeg-het-in-het-nederlands.mp3` — 48.2 MB
- `50-zeg-het-in-het-nederlands.mp3` — 50.6 MB
- `51-zeg-het-in-het-nederlands.mp3` — 45.4 MB
- `52-zeg-het-in-het-nederlands.mp3` — 48.1 MB
- `53-zeg-het-in-het-nederlands.mp3` — 36.1 MB
- `54-zeg-het-in-het-nederlands.mp3` — 47.3 MB
- `55-zeg-het-in-het-nederlands.mp3` — 40.4 MB
- `56-zeg-het-in-het-nederlands.mp3` — 28.7 MB
- `even-een-kerstberichtje.mp3` — 1.5 MB
- `zeg-het---in-het-nederlands-24.mp3` — 31.4 MB
- `zeg-het-in-het-nederlands-01.mp3` — 11.4 MB
- `zeg-het-in-het-nederlands-02.mp3` — 14.7 MB
- `zeg-het-in-het-nederlands-03.mp3` — 15.8 MB
- `zeg-het-in-het-nederlands-04.mp3` — 15.1 MB
- `zeg-het-in-het-nederlands-05.mp3` — 20.8 MB
- `zeg-het-in-het-nederlands-06.mp3` — 14.9 MB
- `zeg-het-in-het-nederlands-07.mp3` — 14.2 MB
- `zeg-het-in-het-nederlands-08.mp3` — 19.6 MB
- `zeg-het-in-het-nederlands-09.mp3` — 15.8 MB
- `zeg-het-in-het-nederlands-10.mp3` — 21.6 MB
- `zeg-het-in-het-nederlands-11.mp3` — 17.0 MB
- `zeg-het-in-het-nederlands-12.mp3` — 16.3 MB
- `zeg-het-in-het-nederlands-13.mp3` — 19.7 MB
- `zeg-het-in-het-nederlands-14.mp3` — 23.3 MB
- `zeg-het-in-het-nederlands-15.mp3` — 17.4 MB
- `zeg-het-in-het-nederlands-16.mp3` — 19.4 MB
- `zeg-het-in-het-nederlands-17.mp3` — 18.4 MB
- `zeg-het-in-het-nederlands-18.mp3` — 22.9 MB
- `zeg-het-in-het-nederlands-19.mp3` — 34.2 MB
- `zeg-het-in-het-nederlands-20.mp3` — 25.0 MB
- `zeg-het-in-het-nederlands-21.mp3` — 24.8 MB
- `zeg-het-in-het-nederlands-22.mp3` — 20.4 MB
- `zeg-het-in-het-nederlands-23.mp3` — 24.7 MB
- `zeg-het-in-het-nederlands-24.mp3` — 31.6 MB
- `zeg-het-in-het-nederlands-25.mp3` — 26.0 MB
- `zeg-het-in-het-nederlands-26.mp3` — 30.2 MB
- `zeg-het-in-het-nederlands-27.mp3` — 30.8 MB
- `zeg-het-in-het-nederlands-28.mp3` — 26.2 MB
- `zeg-het-in-het-nederlands-29.mp3` — 27.7 MB
- `zeg-het-in-het-nederlands-30.mp3` — 31.0 MB
- `zeg-het-in-het-nederlands-31.mp3` — 35.2 MB
- `zeg-het-in-het-nederlands-32.mp3` — 32.5 MB
- `zeg-het-in-het-nederlands-33.mp3` — 34.0 MB

</details>
