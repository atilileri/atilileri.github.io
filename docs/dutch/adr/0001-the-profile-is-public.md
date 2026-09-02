# ADR 0001 — The learner Profile is public, and the agent never writes it silently

**Status**: Accepted
**Date**: 2026-09-02
**Scope**: `docs/dutch` — the Profile at `docs/dutch/PROFILE.md`, the Scenario
library at `docs/dutch/SCENARIOS.md`, and the skill that reads and grows them
**Spec**: [#83](https://github.com/atilileri/atilileri.github.io/issues/83), under map [#74](https://github.com/atilileri/atilileri.github.io/issues/74)

## Context

The Dutch journey personalises every Session from a **Profile** — a standing
description of who the learner is: work, life in the Netherlands, sport, taste in
film and television, the people they speak Dutch with, and what they already
manage in Dutch. The agent grows it as it learns things during a Session.

This is the most personal artifact in the system, and map #74 locks *everything
public*. So the Profile is a public document of what one named person does, likes,
and avoids — published on a personal site, in a repo with public history.

An obvious alternative existed and was rejected. Claude Code already keeps an
**auto-memory** directory for this project, outside the repo, private and
machine-local. It is loaded every session automatically. Putting the Profile there
would have made the whole question disappear.

Two facts weakened the privacy objection. The site **already publishes this
person** — `src/pages/cv.astro` runs to 751 lines, `src/pages/now.astro` states
the Dutch B1 goal outright, and the `sports` collection carries the rest. And the
journey's premise is learning in public: the Lessons and Sessions are published, so
a private Profile would be the one hidden input behind public output.

## Decision

**The Profile is public, committed, and the single source of truth. Auto-memory
holds a pointer to it and nothing else.**

Three rules make that safe, and they stand or fall together:

1. **An exclusion list lives in the file's own header** — no home address, no
   employer-confidential work detail, no health data, no named family members, no
   birth dates, and no detail of the immigration case beyond the exam goal the NOW
   page already states. It sits in the file, not in a skill, so a stranger reading
   the Profile sees the boundary and a future agent applies it without asking.
2. **The agent never writes silently.** It proposes candidate facts at the end of a
   Session, as a short list; the learner accepts or rejects each; the write lands in
   the same commit as the Session. A silent write to a public file is a publication.
3. **Facts are replaced in place, never appended.** The Profile is a current-state
   document. Git holds every past version, so an in-file supersession log would only
   grow the public surface for no gain.

## Consequences

- **Auto-memory is deliberately starved for this domain.** It cannot satisfy the
  publicness lock, cannot be reviewed by a reader, and does not survive a move to
  another machine. Anyone tempted to "just remember that" about Dutch should write
  to the Profile instead.
- **Publication is irreversible.** A fact removed from the Profile stays in the
  repo's history and in whatever a reader kept. The exclusion list is therefore a
  gate at write time, not a cleanup to run later.
- **The propose-then-confirm loop costs the learner attention every Session.** That
  cost is the point. It is what keeps rule 1 enforced by a person rather than by a
  prompt.
- **This binds the Scenario library too.** Scenarios describe real situations in the
  learner's life, so the same three rules apply to `docs/dutch/SCENARIOS.md`.
