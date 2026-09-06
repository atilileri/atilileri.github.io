# ADR 0008 — Speaking is out of scope; listening rests on human audio only

**Status**: Accepted
**Date**: 2026-09-06
**Scope**: `docs/dutch` — the Plan, every Lesson, every Session, and the skill that
writes them
**Spec**: [#95](https://github.com/atilileri/atilileri.github.io/issues/95), under map [#74](https://github.com/atilileri/atilileri.github.io/issues/74)

## Context

Staatsexamen NT2 tests four skills. Research
[#77](https://github.com/atilileri/atilileri.github.io/issues/77) confirmed that
*spreken* and *luisteren* are real components of Programma I, and research
[#78](https://github.com/atilileri/atilileri.github.io/issues/78) then surveyed every
teaching technique worth building and found that **not one of them reaches either
skill** — all of them are text. #77 recommended ruling speaking out rather than
faking coverage. The learner asked that we look for alternatives first, so this
ticket looked.

**The two skills are not the same problem.** Listening needs input the learner
consumes, and input is findable. Speaking needs output somebody judges, and the
judge is the missing piece.

What the search found, measured rather than assumed:

- [#96](https://github.com/atilileri/atilileri.github.io/issues/96) landed **74 hours
  of Dutch audio** from five sources, and the learner captured the **DUO practice
  exams for 2023, 2024 and 2025** by hand — all four skills, both programmes,
  including **six real spreken papers with prompts and marking schemes**.
- [#133](https://github.com/atilileri/atilileri.github.io/issues/133) installed local
  speech recognition that recovers **96.1% of words** against a human transcript, at
  about four times realtime, with no key and no network.
- [#129](https://github.com/atilileri/atilileri.github.io/issues/129) measured Dutch
  **speech synthesis** running locally for nothing — 21 times realtime, CC0 voice
  data — but the one voice it measured is *"finetuned from a U.S. English lessac
  voice"*, and nobody has listened to it.
- The browser's `SpeechRecognition` was started here against `nl-NL`. It produced
  **no result and no error**. Open-source Chromium carries the API without a
  backend, so the route can never be verified from this machine — only on the
  learner's own device, one vendor at a time.
- [#96](https://github.com/atilileri/atilileri.github.io/issues/96) also found
  **875,832 single-word Dutch recordings on Wikimedia Commons**, CC-licensed and
  reachable with no key. Those are recordings of people.

So a machine here can *hear* Dutch well and can *produce* Dutch sound cheaply.
Neither fact supplies a judge of the learner's own accent, and none ever will.

## Decision

**This system teaches three skills plus KNM: lezen, schrijven and luisteren.
Spreken is deliberately absent.**

**Listening is covered, on human recordings only.**

- The material is the landed corpus, the DUO listening clips, and public links.
- **Generated speech is not used anywhere in this journey.** The capability exists
  and stays unused. A synthetic voice with an English ancestor is not a thing to
  teach pronunciation with, and the cheaper honest option was already on the table.
- **A single Dutch word may link a human recording from Wikimedia Commons**, by link
  and never by copy.
- **No bare link.** Every listening item carries at least three comprehension
  questions in Turkish. #78 found retrieval beats exposure, so a link nobody answers
  anything about is not practice.
- **One public video is recommended after each Session**, with its three questions.
- **A video is admissible only when the agent can read text about it.** Level and fit
  are judged from that text. Frames never decide level.

**Speaking is out of scope.**

- Nothing here judges an accent, and nothing scores a spoken answer.
- The six DUO marking schemes are **not** used to let the learner mark themselves.
  A marking scheme with no marker is a criterion the learner applies to their own ear,
  which is the ear in question.
- **A Lesson still ends with a read-aloud passage and a two-role dialogue**, as
  [#85](https://github.com/atilileri/atilileri.github.io/issues/85) locked. That is
  text on a page. It claims no coverage, needs no audio, and needs no judge.
- The learner covers speaking through **their own NT2 course**, outside this system.
  They raise it when they want to; Docent does not prompt for it.

## Consequences

- **The Plan keeps its spreken Objectives, marked `unsupported`**, pointing here. The
  exam has four skills and the Plan shows the route to the exam, so deleting them
  would make the Plan look complete when it is not. The hole stays visible on
  purpose.
- **The risk this ADR buys off is false confidence.** #77 named it: partial coverage
  before an exam can persuade a candidate they are ready for a component nobody has
  ever assessed them on. Absence is legible; a fake score is not.
- **The verdict does not depend on anything unbuilt.** Listening is covered by audio
  that already exists on disk. No driver, no voice model and no listening test stands
  between this decision and its truth.
- **[#137](https://github.com/atilileri/atilileri.github.io/issues/137) loses its
  purpose.** It asked a human to judge locally generated Dutch speech. With synthesis
  ruled out, there is nothing to judge.
- **The map's open *"Pronunciation correctness"* item closes without synthesis.** The
  answer turned out to be *use a human recording*, not *verify a machine*.
- **Reopening this needs a judge, not a better voice.** Better synthesis changes
  nothing here. What would change it is something that can hear the learner and say
  whether a Dutch speaker would understand them.
