# ADR 0003 — A Lesson is MDX in a content collection, not a standalone HTML file

**Status**: Accepted
**Date**: 2026-09-04
**Scope**: `docs/dutch` — every Lesson, and the `docent` skill that writes them
**Spec**: [#86](https://github.com/atilileri/atilileri.github.io/issues/86), under map [#74](https://github.com/atilileri/atilileri.github.io/issues/74)

## Context

The `teach` skill, which this journey borrows heavily from, produces **standalone
HTML lessons**: one self-contained file per lesson, styled to print well, built from
reusable components in an `./assets/` directory, and carrying interactive quiz
widgets inline. The learner likes those outputs and asked for them by name.

[#82](https://github.com/atilileri/atilileri.github.io/issues/82) had already locked
the storage: Lesson, Session, Item, Exam task and Reference go into **Astro content
collections** under `src/content/`. #82's own ticket body flagged the collision it
was creating — "`teach`'s existing model is standalone HTML lessons, which does not
surface on the site by itself."

The two claims then look incompatible, and the incompatibility is real. Measured in
this repo's `node_modules`, Astro registers content entry types by extension: `.md`,
`.mdx` (from `@astrojs/mdx`, already a dependency), `.json`, `.yaml`, `.yml` and
`.toml`. **`.html` is not registered.** An HTML file has no frontmatter to validate
against a schema and no render function, so it cannot be a collection entry at all.

Underneath the file-extension argument sat a conflation worth naming. A Lesson has a
**source format** and a **delivered format**. Astro renders every collection entry to
HTML, so the page the learner reads in a browser is HTML under every option. What was
genuinely at stake was not the extension but a capability: can a Lesson carry
interactive components, and must it be portable as a single file?

Four options were weighed: plain `.md` (no components), `.mdx`, standalone `.html`,
and `.mdx` plus a derived standalone `.html` export.

## Decision

**A Lesson's source is `.mdx`, held in an Astro content collection. The page it
renders to is styled after `teach`'s output. No second file is derived.**

MDX supplies the one capability plain Markdown lacks — it imports Astro components,
so a Lesson can carry the widgets `teach`'s HTML carries. It keeps everything #82
locked: the schema, the URL, the index page and RSS. And it stays Turkish prose that
a stranger can read directly on GitHub, which the publicness lock cares about.

Widgets are **self-check only** — reveal-the-answer, a hideable column in a
conjugation table. Nothing on the page stores a result. The site is a pure static
build and can never receive an answer
([#80](https://github.com/atilileri/atilileri.github.io/issues/80)); answers belong to
the Session, captured in the terminal or through a `docent:answer` issue.

The visual quality the learner asked for is bought with a stylesheet, not with a
different storage model.

## Consequences

A Lesson is not portable as a single file. Opening one outside the built site means
reading MDX source on GitHub, which is legible but plain. Anyone wanting a genuinely
offline, printable, single-file copy is asking for derived media, which belongs to
[#131](https://github.com/atilileri/atilileri.github.io/issues/131) — and would
reintroduce the regeneration-and-drift problem map #74 already lists as fog.

`teach`'s `./assets/` component library does not transfer as written. Its equivalent
here is ordinary Astro components plus a shared stylesheet, owned by
[#88](https://github.com/atilileri/atilileri.github.io/issues/88) and
[#136](https://github.com/atilileri/atilileri.github.io/issues/136).

The decision is expensive to reverse once Lessons accumulate: every file, the
collection schema, and every URL would move together. It is cheap to reverse today.

MDX is a dependency the Lesson pipeline now genuinely needs. `@astrojs/mdx` v5 is
already installed for the existing `blog` and `garden` collections, so this adds no
new dependency, but removing it later would break Lessons.
