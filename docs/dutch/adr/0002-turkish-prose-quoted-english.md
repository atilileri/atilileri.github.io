# ADR 0002 — Prose is Turkish; English appears only as a quoted word

**Status**: Accepted
**Date**: 2026-09-02
**Scope**: `docs/dutch` — every Lesson, every Session, the Item inventory, and the
skill that writes them
**Spec**: [#84](https://github.com/atilileri/atilileri.github.io/issues/84), under map [#74](https://github.com/atilileri/atilileri.github.io/issues/74)

## Context

Map #74 locks the study experience as **Turkish-first**, and locks the Germanic
**bridge** to English. Dutch and English are West Germanic siblings, so English
explains Dutch vocabulary far better than Turkish does. Research
[#78](https://github.com/atilileri/atilileri.github.io/issues/78) went further: four
L3-acquisition models plus Hopp (2019) found that a Turkish/English bilingual
recruits the *English* system for a Germanic L3, and it recommended English-only
mediation. The learner overrode the exclusivity of that recommendation, not the
finding.

That left one mechanical question, and it is the one a reader feels most. A cognate
note is inherently English-bearing. Does it sit inside Turkish prose, or as a marked
English block? The two answers produce very different documents. Marked blocks give
a clean seam and let English carry whole arguments. They also stop a Turkish page
dead, several times per Lesson.

A second question rode with it. `en: "brave"` says what a Dutch word means. "Looks
like English `brave`, but means *uslu*" is a different claim that merely happens to
involve English. Research [#79](https://github.com/atilileri/atilileri.github.io/issues/79)
proposed `nl` / `tr` / `en` sibling fields on an Item and did not distinguish them.

## Decision

**The reader decides the language. An artifact the learner studies is Turkish. An
artifact the agent reads to do its job is English. Prose is never mixed: English
appears only as a quoted word inside a Turkish sentence.**

So there are no English blocks, and no code-switched paragraphs. The bridge is
explained in Turkish and the bridging word is quoted:

> Hollandaca `vriend` ve İngilizce `friend` kelimeleri aynı kökten gelir.
>
> İngilizcedeki `brave` (cesur) kelimesi gibi görünür, ama *iyi, uslu* anlamına gelir.

Per element:

| Element | Language |
| --- | --- |
| Lesson exposition, grammar explanation, headings, prompt instructions | Turkish |
| Bridge and Trap prose | Turkish, quoting the English or Dutch word |
| Etymology story | Turkish, quoting Germanic forms verbatim |
| The prompt itself | Dutch, or Turkish when it asks for a translation |
| Error feedback | Turkish |
| Glossary entry | Turkish gloss plus the Dutch term |
| Session record | English, quoting the learner's answers verbatim |
| Profile, Plan, Mission, Learning Record, Scenario | English |

The agent converses the same way: it **teaches in Turkish**, and reports tooling
work — file writes, git, errors — in **English**.

**An Item gains two optional fields, `bridge` and `trap`**, beside `nl` / `tr` /
`en`. A Trap names its direction, `en` or `tr`.

**A Trap fires on silent wrongness, not on difference.** All three conditions must
hold: the learner holds an intuition from Turkish or English; following it produces
wrong Dutch; and the learner would not notice. The existence of `de` and `het` is
taught, because the learner knows they are guessing. A Turkish speaker dropping the
article entirely is a Trap, because nothing feels missing. Budget: one Trap per
Item, three per Lesson. Past that the agent teaches the pattern once.

**A Bridge that claims shared origin cites a source. A Bridge that claims only a
resemblance cites none, and a Trap cites none** — a Trap asserts current meaning,
which one dictionary look settles.

## Consequences

- **The Lesson is a single-language document for every purpose the site cares
  about.** `lang: "tr"` describes it correctly, and the `blog` collection's
  `translationId` pairing never applies, because no English twin exists and none
  will. This is what #84 hands to
  [#88](https://github.com/atilileri/atilileri.github.io/issues/88).
- **The rule scales to artifacts this map has not invented.** Anything new is
  classified by asking who reads it, not by adding a row to a table.
- **English loses the explanatory role #78 recommended for it.** English keeps the
  lexical work — which is where the evidence is strongest — and Turkish carries every
  argument. If Lessons later prove hard to follow, this ADR is the thing to revisit.
- **The source rule is asymmetric on purpose.** Invented etymology is the failure a
  model produces most readily here, and the cheap form — "İngilizce `friend` gibi
  görünür" — stays available when no source is at hand.
- **Trap content is out of scope here.** This ADR fixes that the slots exist and
  which language fills them.
  [#87](https://github.com/atilileri/atilileri.github.io/issues/87) decides what goes
  in them.
