# ADR 0010 — Published Dutch is written by the agent and carries no marker

**Status**: Accepted
**Date**: 2026-09-09
**Scope**: the Tekst — every Dutch text this journey publishes on the site
**Spec**: [#132](https://github.com/atilileri/atilileri.github.io/issues/132), under map [#74](https://github.com/atilileri/atilileri.github.io/issues/74)

## Context

Map #74 locks that everything is public. #132 adds a form that publishes **Dutch
prose**, which no earlier form did. A Lesson is Turkish and quotes Dutch words; a
Tekst is a Dutch text the learner reads whole.

That creates a problem the map had not met. The learner sits at A0–A2 by
[`PROFILE.md`](../PROFILE.md), so they cannot judge B1 Dutch. No Dutch-capable
human reads the post before it goes online. The Oracle can check the text, but
[#130](https://github.com/atilileri/atilileri.github.io/issues/130) rules that an
unavailable route degrades to a stated limitation — so a check that can block
publication would sometimes stop the journey.

Four options existed: publish with a machine-written caveat on the page; gate
publication on an Oracle check; adapt a native Dutch source text for every post
and never write Dutch; or publish unmarked.

## Decision

**Docent writes the Dutch. The page says nothing about who wrote it. The post
reads as the learner's own writing.**

The learner chose this against a recommendation to adapt native source text. Their
words: *"no need to state caveat on the page. Publish it as I have written it."*

**When the Dutch turns out to be wrong, Docent fixes it in place and adds no
correction note.** Git holds the history, which is the rule
[#83](https://github.com/atilileri/atilileri.github.io/issues/83) already set for
the Profile.

## Consequences

- **Wrong Dutch reaches a stranger as correct Dutch.** This is the cost, and it is
  accepted rather than mitigated. The learner owns the site and owns the risk.
- **The corpus is not a source of truth.** Nothing downstream may cite a Tekst as
  evidence of correct Dutch — not a later Tekst, not an Item, not the Oracle.
- **Publication never blocks.** No route, no service and no human sits between a
  written Tekst and the live page. That is what makes the form usable inside one
  Session, and it is the same property #130 wanted from every capability.
- **A native source text is still the better text.** Nothing here forbids adapting
  one from the landed corpus or from `nos.nl`. The decision removes the
  *requirement*, not the option.
- **Revisit this if a Dutch reader ever enters the loop.** A human who can check the
  text turns the unmarked page from a risk into a correct one, and this ADR is then
  about the fallback only.
