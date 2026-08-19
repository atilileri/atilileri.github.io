# Context Map

This repo holds more than one domain. Each context keeps its own `CONTEXT.md` glossary; this file is the index. Read only the context relevant to what you are working on.

## Contexts

- [Dutch learning journey](./docs/dutch/CONTEXT.md) — a repo-native, agent-run Dutch practice aimed at Staatsexamen NT2, published on the site. Charted by wayfinder map [#74](https://github.com/atilileri/atilileri.github.io/issues/74). Context-scoped decisions go in `docs/dutch/adr/`.

Each context owns its glossary and its ADRs. Decisions that bind more than one context, or the site as a whole, go in the root `docs/adr/` instead. Both ADR directories are created lazily — neither exists yet.

## Not yet modelled

The site's own publishing domain — the `blog`, `garden`, `projects`, and `sports` collections in [src/content.config.ts](./src/content.config.ts) — has no glossary. Its vocabulary has never needed resolving. Add one here only if a real ambiguity appears; do not write it upfront.

## Relationships

- **Dutch learning journey → site publishing.** The journey's Lesson, Session, Item, Exam task, and Reference forms are intended to land in Astro content collections alongside the existing ones. Which collection, and what gets a URL, is still open — owned by [#88](https://github.com/atilileri/atilileri.github.io/issues/88). The journey borrows the site's `lang` convention but deliberately **not** its `translationId` pairing.
