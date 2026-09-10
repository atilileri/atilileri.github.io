# Site publishing

The site's own domain — the collections in
[`src/content.config.ts`](../../src/content.config.ts), the routes under
[`src/pages/`](../../src/pages/), and the chrome around them.

[`CONTEXT-MAP.md`](../../CONTEXT-MAP.md) said to write this glossary **only when a real
ambiguity appears**. One appeared in
[#88](https://github.com/atilileri/atilileri.github.io/issues/88): `lang` reads like a
language label and is not one, and the pairing mechanism turned out to be a *set* rather
than a *pair* the moment a third language arrived. Three terms are resolved here. Nothing
else about the site is modelled, and nothing should be added until it, too, is ambiguous in
practice.

## Language

**Language group**:
The set of blog entries that carry the same `translationId` — the same piece written in
more than one language. An entry with no `translationId` is a group of one. It is the unit
the site filters on: **a reader sees exactly one entry per group**, never two, and never
zero. Sizes 1 to 3 are all legal, and any subset of the languages is legal — a group may be
Turkish and Dutch with no English.
_Avoid_: Translation pair (a group holds up to three), translation set, post family

**`lang`**:
A **reader-choice filter**, not a label describing the text. It says which reader a group's
entry is for, so the toggle can pick one. Three values: `en`, `tr`, `nl`. It is not the
same thing as the `lang` attribute in the markup, which describes the text and is set per
element — a Turkish page quoting Dutch carries `lang="tr"` on `<html>` and `lang="nl"` on
the Dutch block.
_Avoid_: Locale, language label, i18n key

**Fallback order**:
`en` → `tr` → `nl`. Which entry a group shows when it holds nothing in the reader's chosen
language. English reaches the widest part of this site's audience and the chrome is already
English; Dutch sits last because the fewest readers read it.
_Avoid_: Default language, primary version

## The rule these three exist for

Every surface that lists posts — the blog index, a tag archive, the RSS feed — shows **one
entry per language group**: the reader's language when the group holds it, otherwise the
first language present in the fallback order. A group can never vanish and can never
double.

Recorded in [`../adr/0001`](../adr/0001-a-language-group-shows-one-card.md), which also
lists what had to change to make it true.
