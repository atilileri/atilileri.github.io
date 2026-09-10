# A language group shows exactly one card

The site paired posts in two languages and filtered them with a rule that worked only
because there were two. [#88](https://github.com/atilileri/atilileri.github.io/issues/88)
added Dutch, so the rule is replaced with one that holds for any subset of `en`, `tr` and
`nl`: **a language group shows exactly one entry — the reader's language when the group
holds it, otherwise the first present in the order `en` → `tr` → `nl`.** The vocabulary is
[`../site/CONTEXT.md`](../site/CONTEXT.md).

This ADR sits in the root `docs/adr/` rather than under a context, because it binds every
listing surface on the site and not only the Dutch journey.

## Why the old rule had to go

[`src/pages/blog/index.astro`](../../src/pages/blog/index.astro) showed a card when its
language matched the reader's choice, **or when its group held exactly one card**. With two
languages a two-member group always holds the chosen one, so the rule never failed. With
three languages a group can hold neither `en` nor `tr`, and such a group **disappears from
the index entirely**. That is a latent bug today, not only a Dutch one: any future
two-member group in languages the toggle does not offer would vanish the same way.

[`src/pages/blog/[...slug].astro`](../../src/pages/blog/%5B...slug%5D.astro) resolved the
alternative with `.find()`, which returns one sibling, under a label chosen by a two-way
ternary. With three siblings it links to an arbitrary one and names it wrongly.

## What this requires

1. `lang` becomes `z.enum(['en','tr','nl'])`.
2. The index toggle gains an **NL** button, and its hide rule becomes the one above.
3. The slug page uses `.filter()` and renders **one link per sibling**, each labelled in its
   own language.
4. The tag archive renders the same card markup and runs the same script, rather than
   listing every sibling as it does today.
5. The RSS feed emits **one item per group** in the fallback order.
6. `BaseLayout` takes a `lang` prop, defaulting to `'en'`, and every content page passes its
   own.

## Considered and rejected

**One page holding three language blocks, with tabs.** It cannot express a missing
language — a Turkish-only piece would still render a tab shell — and a search engine would
show a reader the wrong language. Separate entries also keep the existing route, card grid,
tag archive and feed with no new page type.

**Leaving the toggle at two buttons and reaching a Dutch entry only from its sibling.** It
would make Dutch a second-class page on a site whose newest audience is people learning
Dutch.

## Consequences

- **A site-wide bug is fixed on the way.** `BaseLayout` hardcoded `<html lang="en">`, so
  every Turkish post on this site already declared itself English. Change 6 ends that.
- **Found while measuring, and fixed with change 5:**
  [`src/pages/rss.xml.js`](../../src/pages/rss.xml.js) builds links from `post.slug`. Astro
  6's glob loader gives entries an `id` and no `slug`, so every link in the feed is
  currently `/blog/undefined/`.
- **Tags stay translated.** The site's habit of writing `Sports`/`Spor` per language is
  untouched. The Dutch journey opts out with a single proper-noun tag, `Nederlands`, which
  is a choice about that journey and not about this rule.
