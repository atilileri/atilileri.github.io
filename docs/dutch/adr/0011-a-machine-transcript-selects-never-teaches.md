# ADR 0011 — A machine transcript selects material; it never supplies quoted Dutch

**Status**: Accepted
**Date**: 2026-09-09
**Scope**: `docs/dutch` — every Session that uses listening material, every Item minted
from audio, and the skill that writes them
**Spec**: [#97](https://github.com/atilileri/atilileri.github.io/issues/97), under map [#74](https://github.com/atilileri/atilileri.github.io/issues/74)

## Context

Drive holds **700 machine transcripts** and **87 human ones**. The machine transcripts
were written locally and offline by Whisper turbo, measured at **96.1% of words
recovered** against a human transcript on Een Beetje Nederlands episode 1
([#133](https://github.com/atilileri/atilileri.github.io/issues/133),
[#95](https://github.com/atilileri/atilileri.github.io/issues/95)).

That number reads as a success, and for the job it was built for it is one. It also
means **about one word in twenty-five is wrong**, and nothing in this system can hear
the difference. The agent cannot listen. The learner does not yet know enough Dutch to
catch it. So a transcript error becomes a teaching error with no detector in between.

**The two risks are not equal, and that is the whole decision.** A misheard *sentence*
teaches wrong word order, wrong agreement, wrong idiom — the learner memorises Dutch
nobody said. A misheard *word* is either a nonword, which a frequency list catches, or
a different real Dutch word, which is still real Dutch and still worth knowing.

## Decision

Split the trust by what the text is used **for**, not by which body it came from.

A machine transcript **may**:

- decide whether a Clip is admissible, and at which level;
- fix the time range a Session points at, off its `[mm:ss]` segment marks;
- carry the gist a comprehension question asks about;
- supply a single **word** for a new Item, when that word appears in
  [`sources/frequency-nl-50k.txt`](../sources/frequency-nl-50k.txt).

A machine transcript **may never**:

- supply a Dutch **sentence** the learner reads as correct Dutch — in a Lesson, in a
  Tekst, in a Prompt, or as a quotation on any published page;
- carry a comprehension question that hinges on one number, name, or word said once.

Quoted Dutch comes from exactly three places: a **human transcript**, the **source's own
page**, or an **exam paper**.

## Consequences

- **Een Beetje Nederlands is our only podcast body that can supply quoted Dutch** — its
  87 human transcripts. LibriVox can too, through the Project Gutenberg e-text.
- **Vocabulary still flows from every body.** The frequency check is a repo-local file
  read, so it costs nothing and needs no network.
- **A question about a detail is barred on a machine transcript and allowed on a human
  one.** The restriction follows the text, so the same Clip changes what it can be asked
  about the day a published transcript appears.
- **A word that fails the frequency check is dropped, never guessed at.** Guessing would
  reintroduce exactly the error this ADR exists to stop.

## Considered and rejected

- **Trust the machine transcript fully.** Rejected: 96.1% is a good recogniser and a bad
  textbook, and no part of this system can catch the remaining 3.9%.
- **Bar it entirely.** Rejected: it would exclude five of six bodies from ever teaching a
  word, which throws away the 69 hours of audio the corpus was landed for.
- **Verify by listening.** There is no listener. The agent reads text; the learner is the
  student. Verification has no home.
