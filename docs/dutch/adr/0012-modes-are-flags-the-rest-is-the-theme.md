# ADR 0012 — A Flag chooses the Mode; the rest of the line is the Theme

**Status**: Accepted
**Date**: 2026-09-19
**Scope**: `docs/dutch` — the `docent` skill's invocation contract, and every
document that quotes it
**Spec**: [#140](https://github.com/atilileri/atilileri.github.io/issues/140), under map [#74](https://github.com/atilileri/atilileri.github.io/issues/74)

## Context

[#86](https://github.com/atilileri/atilileri.github.io/issues/86) locked one skill,
`/docent`, with four Modes — *Session*, *Review*, *Publish*, *Assess* — and one rule
for the argument: **a Theme by default, and the fallback for anything unrecognised**.
That rule serves the map's north star, `/docent i want to do a lesson about last
superbowl`, where the learner types a situation and never a command.

The rule has one hole, and #140 walked straight into it. The learner asked for a help
mode. A learner who types `/docent help` wants the help text. #86's rule says Docent
must teach a lesson themed on the English word *help*. The same hole swallows every
future command word: `review`, `status`, `stop`.

Three repairs were on the table:

- **A reserved word.** Carve `help` and `yardım` out of the Theme space. This works
  once and then rots: every new command steals another word from the learner's
  vocabulary, and the learner cannot see which words are stolen.
- **A bare `/docent` that prints help.** This is the common CLI shape, and it
  overturns #86's lock that a bare `/docent` starts a Session.
- **A prefix that no Theme can carry.** A leading `--` is not a word, so it collides
  with nothing, now or ever.

## Decision

**A token that starts with `--` is a Flag. Everything else on the line is the Theme.**

- **The four Modes become Flags**: `--session`, `--review`, `--publish`, `--assess`.
  Session stays the default, so a line with no Flag still starts a Session and #86's
  north star runs unchanged.
- **A Flag and a Theme share one line.** `/docent --review superbowl` names both.
  At most one Mode Flag per line; a second Mode Flag is an error, never a merge.
- **Each Flag carries three spellings** — English, Turkish and Dutch — matched
  case-insensitively with diacritics folded, so `--yardim` reaches `--yardım`.
- **An unrecognised `--flag` refuses and prints the Flag list.** It is never read as
  a Theme. A `--` token means the learner meant a command, so a silent Theme
  fallback would teach the wrong lesson and hide the typo.
- **`--help` is a Flag that is not a Mode.** A Mode teaches, reviews, publishes or
  assesses, and all four write. Help only reads. So the Modes stay four, and
  **Flag** becomes the wider category.

## Consequences

**The learner types a prefix they did not type before.** Reaching Review, Publish or
Assess now costs `--`. That is the price paid, and it buys a Theme space that no
command will ever shrink again. Session — the Mode used almost every time — costs
nothing, because it is the default.

**#86's argument rule is narrowed, not replaced.** *A Theme by default* still holds
for every word a learner would plausibly write. What changed is that the fallback for
*anything unrecognised* no longer covers a `--` token.

**The error path is the discovery path.** Because an unknown Flag prints the Flag
list, a learner finds the commands by mistyping one. No learner has to know that
help exists in order to find help.

**One table is the single source of truth.** The Flag table in `SKILL.md` holds every
Flag, its three spellings, whether it is a Mode, and one Turkish line. The router
dispatches from that table and `--help` prints it. A Flag missing from the table
cannot run, and a Flag that runs is printed, so the reference cannot drift from the
router.

**The taxonomy gains one word.** `Flag` joins [`CONTEXT.md`](../CONTEXT.md), and the
`Mode` entry now says a Mode is chosen by a Flag.
