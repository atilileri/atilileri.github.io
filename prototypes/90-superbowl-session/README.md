# PROTOTYPE — one Superbowl-themed Session, end to end (throwaway)

Primary source for [#90](https://github.com/atilileri/atilileri.github.io/issues/90) on map
[#74](https://github.com/atilileri/atilileri.github.io/issues/74). Not production code; nothing here is
wired into the site, and no part of it is a real artifact of the journey.

**The question.** What does one Session actually look like? The map has locked the content form, the
bilingual model, the curriculum spine, the answer loop, the memory strategy, the Picture route and the
site surfaces — each against its own description. This builds one concrete Session pair so they can be
judged against something.

## What is invented

Everything. There is no `/docent` skill, and **`docs/dutch/PLAN.md` does not exist**, so the Plan slice,
the Objective's Angle log, the Item inventory, every Rung and every date in it were written by hand for
this page. The Dutch facts are real: they come from
[nos.nl, 9 February 2026](https://nos.nl/artikel/2601547-defensief-sterke-seahawks-winnen-super-bowl), a
Named target in `AUTOMATION.md`. The Dutch prose was written here, not copied (`adr/0010`).

## Run it

    npx astro dev
    # /prototype/90-superbowl-session/?variant=A   (A…E)

Unlike a normal UI prototype the five variants are **not five designs of one screen**. The question is
what a Session is made of, so each variant is a different artifact of the same Session pair:

| Variant | Artifact |
| --- | --- |
| `A` | The invocation and preflight, then **Session 1** as it renders — planned, unanswered, empty inventory |
| `B` | **Session 1's Lesson** — Turkish prose, Splits, Bridges, Hooks, Traps, Pictures |
| `C` | **Session 12** — the same Theme two months on, answered, with Verdicts and Rung moves |
| `D` | The **Tekst** Session 12 produced — Delft: one Dutch text plus its word list |
| `E` | The **Plan slice**, the ladder maths and the Item inventory behind both |

The pair is the point. The learner asked for both ends of the journey because *"is a unit the right size"*
has a different answer on day one than it does at Session twelve.

## Layout

- `src/pages/prototype/90-superbowl-session.astro` — the throwaway page.
- `src/pages/prototype/_90-superbowl-session.data.ts` — every hand-written artifact.
- `public/prototype/90-superbowl-session/` — the Pictures.
- `prototypes/90-superbowl-session/` — this file, `source.md` (the Oracle source),
  `pictures.json` (twenty image instructions), `run-pictures.sh`, and the logs.

## Measured while building it

- **`--language nl` is rejected.** The infographic generator's Dutch code is `nl_NL`, and an unknown code
  fails validation locally, so no quota is spent. The first twenty runs failed this way in 3 minutes.
- **With `--language tr` the model translates Dutch words into Turkish.** The first `lesson-header` drew
  the Dutch word `zondag` as the Turkish label `ZAMAN`, and buried the picture under two paragraphs of
  invented Turkish prose. #147's text rules were not enough on their own.
- **A standing "never translate a quoted string" rule fixes it.** Appended to every instruction, the
  redraw kept all five Dutch strings letter for letter.
- **Turkish capitalisation still breaks, in the other direction.** The redraw wrote `KIM` where Turkish
  needs `KİM`. #147 measured the same bug on Dutch words; it runs both ways, and #147's read-and-retry
  rule only checks the Dutch, so a Turkish caption can ship wrong.
- Each image takes about **100 seconds** end to end at `--detail concise --orientation square`.

## When this is done

Delete the page, the data file, `public/prototype/90-superbowl-session/` and this folder from `main`.
The branch is the primary source. Empty the Oracle's `scratch` notebook of this prototype's source and
every infographic it made.
