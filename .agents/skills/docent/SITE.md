# The files a Session writes

Three forms render on the site under `/nederlands/`. Each is one file, written in Turkish prose with Dutch quoted. The site builds on push, so a page goes live a minute or two after the push. The schemas are in `src/content.config.ts`; a file that breaks them breaks the build, so run `npm run build` before the commit when you are unsure.

| Form | File | Page |
| --- | --- | --- |
| Lesson | `src/content/nederlands/lessons/<slug>.mdx` | `/nederlands/lesson/<slug>/` |
| Tekst | `src/content/nederlands/teksten/<slug>.md` | `/nederlands/tekst/<slug>/` |
| Session | `src/content/nederlands/sessions/<date>-<theme>.md` | `/nederlands/session/<date>-<theme>/` |

A slug is lowercase ASCII words joined by hyphens. The site reads the Plan and the Items itself; never copy them into a page.

## Lesson

About ten minutes of reading on one Angle. It explains and holds no questions — questions live in the Session.

```mdx
---
title: "İptal etmek: afzeggen ve arkadaşları"
description: "Grupta bir maçı nazikçe iptal etmenin kalıpları."
date: 2026-10-21
objective: LEB1-1a
items: [afzeggen, plek, invaller]
---

Turkish prose, Dutch quoted: `Ik moet helaas afzeggen.`

<Split item="afzeggen" />

<Reveal summary="Cevabı göster">`Wie wil mijn plek?`</Reveal>
```

- **List every Item it teaches in `items`**, by id.
- **Show a Split the first time the Lesson introduces a word that has one**, with `<Split item="<id>" />`.
- **At most three Traps** in a Lesson.
- A grammar rule is taught here, in prose and tables.

## Tekst

A short Dutch text in the Session's Theme, written only for a *lezen* Objective. The page shows, in this order: the word list, the Dutch text, the Turkish gist, the questions.

```md
---
title: "Een avond in de padelgroep"
date: 2026-10-21
session: 2026-10-21-padel-app
items: [afzeggen, plek, invaller]
gist: "Turkish gist in two or three sentences."
prompts: [P13, P14, P15]
---

The Dutch text, and nothing else.
```

- **At most ten new words**, the same Items the Session added; `items` is the word list.
- **The body is Dutch only.** The gist and the questions come from the frontmatter and the Session.
- **`prompts`** names the Session's Prompts that ask about this text.

## Session

The record of one Session: what was asked and what the learner answered. Write it with every Prompt before the questions start, then fill in each answer as it comes. Its status is read off the Prompts: no answer yet is `planned`, some is `partial`, all answered or skipped is `complete`.

```md
---
title: "Padel: iptal mesajları"
date: 2026-10-21
theme: padel-app
objective: LEB1-1a
angle: "lexicon: cancelling and swapping places"
lessons: [iptal-etmek-afzeggen]
teksten: [een-avond-in-de-padelgroep]
episode:
  title: "Websites grote organisaties offline, zorgverzekering wordt duurder"
  url: "https://www.youtube.com/watch?v=Jjyj2gGI3UQ"
  date: 2026-10-21
intakes: [170, 171]
limits: ["Oracle'a ulaşılamadı: kitaplarda arama yapılmadı."]
prompts:
  - id: P1
    type: item
    item: fiets
    direction: recognition
    ask: "`fiets` ne demek?"
    answer: "bisiklet"
    answered: 2026-10-21
    verdict: correct
  - id: P2
    type: open
    objective: LEB1-1a
    ask: "Grupta bir maçı iptal eden kısa bir mesaj yaz."
    answer: "Sorry, ik kan vanavond niet."
    answered: 2026-10-21
    feedback: "Turkish feedback."
  - id: P3
    type: open
    objective: LEB1-1a
    ask: "Episode'da hangi haber ilk sırada?"
    skipped: true
---
```

- **`date` is the first run.** A resumed Session keeps it; each `answered` is the real day of that answer.
- **An `item` Prompt** names one Item and one Direction. `recognition` shows the Dutch and asks for the meaning; `production` gives the Turkish and asks for the Dutch. It gets a `verdict`: `correct`, `close` or `incorrect`, plus `feedback` when it is not `correct`.
- **An `open` Prompt** names an Objective, gets `feedback` and no Verdict.
- **`answer` is verbatim**, exactly as the learner typed it.
- **`limits`** holds one Turkish line for each route that failed.
- The body is optional: a few lines of Turkish notes.

## Components

Lessons may use these, with no import line. Nothing else — never script code.

| Component | Does |
| --- | --- |
| `<Reveal summary="…">answer</Reveal>` | Hides an answer until the learner opens it |
| `<HideColumn column={2}>` around a Markdown table | Lets the learner hide one column, e.g. the Turkish of a conjugation table |
| `<Split item="<id>" />` | Draws the Item's Split ([SPLIT-FORMAT.md](SPLIT-FORMAT.md)) |

Every page reads completely with JavaScript off.

## Pictures

- **File**: `public/images/nederlands/<owner>.webp`, where `<owner>` is `hook-<item-id>`, `trap-<item-id>`, `lesson-<slug>` or `tekst-<slug>`. Drawing it is in [ORACLE.md](ORACLE.md#drawing-a-picture).
- **On the page**: a plain `<img src="/images/nederlands/<owner>.webp" alt="…">`, whose `alt` describes the drawn scene in Turkish.
- **A Hook's Picture shows beside the Hook**, after the answer — never inside a Prompt.
- **No page depends on a Picture.** Its owner teaches in text without it.
