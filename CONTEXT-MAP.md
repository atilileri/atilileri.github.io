# Context Map

This repo holds more than one domain. Each context keeps its own `CONTEXT.md` glossary; this file is the index. Read only the context relevant to what you are working on.

## Contexts

- [ASML AI deck](./docs/asml-ai/CONTEXT.md) — the presentation "Getting the Most from AI", built at `/decks/asml-ai` and given live to ASML executives. Charted by wayfinder maps [#4](https://github.com/atilileri/atilileri.github.io/issues/4), [#20](https://github.com/atilileri/atilileri.github.io/issues/20), [#29](https://github.com/atilileri/atilileri.github.io/issues/29), [#42](https://github.com/atilileri/atilileri.github.io/issues/42) and [#63](https://github.com/atilileri/atilileri.github.io/issues/63). Its glossary is **normative** — code and issues that disagree with it are wrong. Context-scoped decisions go in `docs/asml-ai/adr/`.
- [Dutch learning journey](./docs/dutch/CONTEXT.md) — a repo-native, agent-run Dutch practice aimed at Staatsexamen NT2, published on the site. Charted by wayfinder maps [#74](https://github.com/atilileri/atilileri.github.io/issues/74) and [#154](https://github.com/atilileri/atilileri.github.io/issues/154). Its rules live in the `docent` skill at `.agents/skills/docent/`. Context-scoped decisions go in `docs/dutch/adr/`.
- [Site publishing](./docs/site/CONTEXT.md) — the site's own collections, routes and chrome. Deliberately **thin**: it resolves the three terms of the language mechanism and nothing else. Created by [#88](https://github.com/atilileri/atilileri.github.io/issues/88) when a real ambiguity appeared, per the rule below. It has no `adr/` of its own — a decision about the site as a whole goes in the root `docs/adr/`.

Each context owns its glossary and its ADRs. Decisions that bind more than one context, or the site as a whole, go in the root `docs/adr/` instead. ADR directories are created lazily. `docs/asml-ai/adr/`, `docs/dutch/adr/` and the root `docs/adr/` all exist.

## Not yet modelled

The site's publishing domain now has a glossary, but only where it was ambiguous. **Everything else about it is still unmodelled** — the `garden` statuses, the deck routes, tags, the feed. `src/content.config.ts` defines `blog` and `garden`, plus the Dutch journey's four; the "sports" and "projects" lists an earlier version of this file named are hardcoded arrays inside [now.astro](./src/pages/now.astro), not collections. Add a term only when a real ambiguity appears; do not write one upfront.

## Relationships

- **ASML AI deck → site publishing.** The deck is a first-class Astro route under [src/pages/decks/](./src/pages/decks/), not a content collection. It deliberately does not use `BaseLayout` and carries no site chrome. The digital garden links to it as a card ([#18](https://github.com/atilileri/atilileri.github.io/issues/18)).
- **Dutch learning journey → site publishing.** Settled by [#88](https://github.com/atilileri/atilileri.github.io/issues/88), cut down by [#155](https://github.com/atilileri/atilileri.github.io/issues/155), and written in the skill's [`SITE.md`](./.agents/skills/docent/SITE.md). The journey has its own home at `/nederlands/`: Lessons, Teksten and Sessions render, and the Plan and the Items are data the pages read straight from `docs/dutch/`. Its material borrows the site's `lang` convention and never its `translationId` pairing.
