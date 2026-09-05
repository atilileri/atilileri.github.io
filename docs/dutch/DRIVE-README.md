# What is here, and how the files are named

This is the source copy of the file uploaded to the top of `atili/Dutch` in Google Drive as
`00 README - what is here and how files are named.md`. Edit it here; re-upload it after a change.
The same convention, written for a reader who is in this repo rather than in Drive, is the
"How files in Drive are named" section of [`MATERIAL.md`](./MATERIAL.md).

---

## What is here

This folder holds the Dutch material for the learning journey at
`https://github.com/atilileri/atilileri.github.io`. Roughly 1,280 files, 8.6 GB.

| Folder | What it holds |
| --- | --- |
| *(top level)* | The coursebooks, the word lists and the picture dictionary, one file per book. |
| `DUO oefenexamens NT2/` | The published NT2 practice exams for 2023, 2024 and 2025 — both programmes, all four skills. Each year and skill has an `opgavenboekje` (the questions) and a `beoordelingsmodel` (the marking scheme), and the Luisteren and Spreken papers have an `audio/` folder beside them. |
| `dutch-listening/` | Five podcast and audiobook sources, each with its own `audio/` folder, its feed, and an `episodes.json` listing what was downloaded. *Een Beetje Nederlands* also has `transcript/`. |
| `Goethe book2 TR-NL/` | The 100-lesson Goethe-Verlag *book2* course, Turkish to Dutch. |
| `30 Günde Hollandaca/` | A Turkish audio course. See the note on its numbering below. |
| `NT2 Taaldiensten - tanışma dersi A0-A2/` | One recorded online class, taught in Turkish. |
| `Van Dale Groot Beeldwoordenboek (3 delen)/` | The picture dictionary, split into three parts because the whole file is too large to upload in one piece. |

## How the files are named

**A filename should explain itself**, so that a file still makes sense after you send one clip to
yourself and open it on a phone, away from its folder.

```
<identity> - <nn> - <what it is>.<extension>
```

- **The prefix repeats the folder's identity.** `2023 Luisteren I - 17 - …` is redundant inside its
  own folder and essential everywhere else.
- **The number is zero-padded**, so a media player keeps the exam in order.
- **Names are in the language of the source, and are transcribed, never translated.** The exam names
  come out of the exam's own booklet, word for word, so no translation error can enter. The Turkish
  courses keep Turkish names.
- **A converted copy shares its original's name** and differs only in extension. `… - 17 - ….opus` is
  the file as published; `… - 17 - ….mp3` is a conversion of it, for players that refuse Opus. The
  original is the better copy.
- **No filename contains the name of a person** found inside the material.
- **Punctuation is plain ASCII** — a hyphen, never a dash; a straight apostrophe, never a curly one.

Examples:

```
2023 Luisteren I - 02 - Een gesprek met een autoverkoper - introductie.mp3
2023 Luisteren I - 17 - Een les van de drogisterijdocent - opgave 13.mp3
2023 Spreken I - 02 - opgave 1 - Kappersopleiding.mp3
2023 Luisteren I - opgavenboekje.pdf
Nederlands in gang - A0-A2 (Coutinho, 2017).pdf
TRNL 007 - Sayılar.mp3
50 - de ijstijd, de hunebedden en de eerste boeren.mp3
```

**This applies to new material too.** Anything added to this folder later is named the same way.

## Three things the renaming uncovered

- **`30 Günde Hollandaca` is missing chapter 15.** The audio announces its own `Bölüm` number, and
  those numbers run 1–14 and then 16–29. The old filenames ran `(1)` to `(28)` and hid the gap. The
  names now carry the real chapter number.
- **`DUO oefenexamens NT2/2024 Spreken I` has two versions of one track.** DUO published `Track 7`
  twice, with different audio. The later one is marked `(tweede versie)`.
- **Eight files in `dutch-listening/` had corrupted names.** An accented letter was mangled when they
  were downloaded — `klomp├⌐` instead of `klompé`. They are repaired.

## Where the record is

Every rename is listed in `docs/dutch/DRIVE-RENAME.csv` in the repository, as
`body,old_path,new_path,file_id`. That file is the undo log. It records the **Drive file id**, which
does not change when a file is renamed — which is also why renaming this folder did not break the
Gemini Notebook sources built on it.
