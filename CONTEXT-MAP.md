# Context Map

This repo holds more than one domain. Each context keeps its own `CONTEXT.md` glossary; this file is the index. Read only the context relevant to what you are working on.

## Contexts

- [ASML AI deck](./docs/asml-ai/CONTEXT.md) — the presentation "Getting the Most from AI", built at `/decks/asml-ai` and given live to ASML executives. Charted by wayfinder maps [#4](https://github.com/atilileri/atilileri.github.io/issues/4), [#20](https://github.com/atilileri/atilileri.github.io/issues/20), [#29](https://github.com/atilileri/atilileri.github.io/issues/29), [#42](https://github.com/atilileri/atilileri.github.io/issues/42) and [#63](https://github.com/atilileri/atilileri.github.io/issues/63). Its glossary is **normative** — code and issues that disagree with it are wrong. Context-scoped decisions go in `docs/asml-ai/adr/`.
- [Dutch learning journey](./docs/dutch/CONTEXT.md) — a repo-native, agent-run Dutch practice aimed at Staatsexamen NT2, published on the site. Charted by wayfinder map [#74](https://github.com/atilileri/atilileri.github.io/issues/74). Context-scoped decisions go in `docs/dutch/adr/`.

Each context owns its glossary and its ADRs. Decisions that bind more than one context, or the site as a whole, go in the root `docs/adr/` instead. ADR directories are created lazily — none of them exists yet.

## Not yet modelled

The site's own publishing domain — the `blog`, `garden`, `projects`, and `sports` collections in [src/content.config.ts](./src/content.config.ts) — has no glossary. Its vocabulary has never needed resolving. Add one here only if a real ambiguity appears; do not write it upfront.

## Relationships

- **ASML AI deck → site publishing.** The deck is a first-class Astro route under [src/pages/decks/](./src/pages/decks/), not a content collection. It deliberately does not use `BaseLayout` and carries no site chrome. The digital garden links to it as a card ([#18](https://github.com/atilileri/atilileri.github.io/issues/18)).
- **Dutch learning journey → site publishing.** The journey's Lesson, Session, Item, Exam task, and Reference forms are intended to land in Astro content collections alongside the existing ones. Which collection, and what gets a URL, is still open — owned by [#88](https://github.com/atilileri/atilileri.github.io/issues/88). The journey borrows the site's `lang` convention but deliberately **not** its `translationId` pairing.
