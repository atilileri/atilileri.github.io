# The site: where the journey surfaces, and for whom

Everything this journey produces is public. Public means committed, not rendered — a page
must be read by a person to earn its build. This file says which artifacts get a URL, what
shape those pages take, and who wins when two readers want different things.

Locked by [#88](https://github.com/atilileri/atilileri.github.io/issues/88) under map
[#74](https://github.com/atilileri/atilileri.github.io/issues/74). The forms themselves are
[`CONTEXT.md`](./CONTEXT.md); the language rule is
[`adr/0002`](./adr/0002-turkish-prose-quoted-english.md). The site-wide language mechanism
this depends on is [`../site/CONTEXT.md`](../site/CONTEXT.md) and
[`../adr/0001`](../adr/0001-a-language-group-shows-one-card.md), because it binds every page
on this site and not only these.

## Two readers, and who wins where

A **stranger** arrives cold and wants to know what this is. The **learner** arrives to
practise. They want different pages, so each gets one.

- **The index is the stranger's.** It is written in English and it explains.
- **Every leaf page is the learner's.** It is written in Turkish and it gets to the work.

Nothing else needs deciding case by case. Where a page serves both, this rule settles it.

## The home

`/nederlands/` — a top-level home with its own collections. Neither existing collection
fits: `garden`'s schema is a card with no date, and `blog`'s pairing field never applies to
this journey's material ([#132](https://github.com/atilileri/atilileri.github.io/issues/132)).
The Dutch root word follows the same rule that named **Docent** — name the thing in the
language of the subject.

**It is not in the top navigation.** Two doors reach it:

1. the `garden` card [`dutch-learning-system.md`](../../src/content/garden/dutch-learning-system.md),
   whose `link` points at `/nederlands/`;
2. the *Building a tutor* thread on [`now.astro`](../../src/pages/now.astro).

The NOW page stays hand-written, and its Dutch threads **drop every fact the Plan owns** —
the level, the exam booking, the count of anything — and link out for current state. One
fact, one home.

## Collections and routes

A collection needs no route. These four render; the other three are data the pages read.

| Form | Collection | Route |
|---|---|---|
| Lesson | `dutch-lessons` | `/nederlands/lesson/<slug>/` |
| Tekst | `dutch-teksten` | `/nederlands/tekst/<slug>/` |
| Session | `dutch-sessions` | `/nederlands/session/<id>/` |
| Reference | `dutch-references` | `/nederlands/reference/<slug>/` |
| Item | `dutch-items` — one YAML file | none |
| Exam task | `dutch-exam-tasks` | none |
| Plan | `dutch-plan` — one YAML file | none |

The URL segment is the **domain word**, singular, exactly as
[`CONTEXT.md`](./CONTEXT.md) writes it — so a URL never needs translating back to talk
about it. *Tekst* is the domain word and is Dutch; *Lesson* and *Session* are the domain
words and are English. That mixture is the vocabulary, not an accident.

A **Reference** earns a route because a conjugation table is what the learner wants on a
phone at a bus stop, and it is revised in place, so it never goes stale. An **Exam task**
does not: it is a brief with no answers, and prompt sets live only in the Session
([#82](https://github.com/atilileri/atilileri.github.io/issues/82)), so the Session that
sits one renders the brief inline.

**No `draft` field on any of them.** Docent commits only what the learner confirmed, so a
draft would be a page nobody asked for — and a **planned Session is deliberately public
while it is still unanswered**
([#86](https://github.com/atilileri/atilileri.github.io/issues/86)), which is the one case
a draft flag would have wrongly hidden.

**A prototype page never lands on `main` under `src/pages/`.** It lives on its branch and
dies with it. The site is public and a route has no draft mechanism, so location is the
only control there is.

## The site reads the working files; it never gets a copy

A Tekst renders its word list from the Item inventory, and the index renders progress from
the Plan. Both files sit in `docs/dutch/`, outside `src/content/`.

**The site reads those two files directly**, through Astro's `file()` loader with a base
outside `src/`. **The Plan and the Item inventory are therefore YAML**, not prose — the
same one file serves Docent and the page.

Docent never writes a generated copy into `src/data/`. A second copy of state goes stale
with an empty diff, which is the failure
[#100](https://github.com/atilileri/atilileri.github.io/issues/100) avoided by deriving the
due date at read time rather than storing it. This **refines**
[#85](https://github.com/atilileri/atilileri.github.io/issues/85) and #100 rather than
overturning them: both fixed the fields, neither fixed a file format.

The prose standing docs — Mission, Profile, Scenarios, Glossary, References-as-text — stay
Markdown, because nothing renders them. **The Profile gets no page**; the NOW page is its
public face already
([#123](https://github.com/atilileri/atilileri.github.io/issues/123)).

## The index

`/nederlands/`, in English, one page, in this order:

1. one paragraph saying what this is;
2. **progress read from the Plan** — the Horizon date, Objectives per skill by status and
   Tier, Item counts by Rung;
3. the **newest ten Sessions** with their status;
4. the Lesson library and the Teksten;
5. links to the working files on GitHub, and to the map issue;
6. the journey posts, by tag.

Three list routes catch the overflow: `/nederlands/session/`, `/nederlands/lesson/` and
`/nederlands/tekst/`. At about five Sessions a week the index would otherwise grow without
bound inside a year.

**The new collections stay out of the RSS feed.** The feed is the blog's. Journey posts are
blog entries and are already in it.

## A Session page is answered from a phone

The prefilled issue link is the only path an answer has back to Docent
([#80](https://github.com/atilileri/atilileri.github.io/issues/80),
[#99](https://github.com/atilileri/atilileri.github.io/issues/99)). So the learner's order
wins:

1. one line saying what the page is;
2. the **Prompts**;
3. the material;
4. links to the Session's Lesson and Tekst.

**The prefilled link appears twice** — under the intro and after the last Prompt — because
the learner answers as they read and taps at the end.

A stranger meets a wall of Prompts. That is the audience rule working, not failing.

**A published Session shows its Verdicts.** The learner's verbatim Dutch, the Verdict on
each answer and the correction all render. The publicness lock says nothing is hidden, and
a page showing three `incorrect` Verdicts is the most honest thing on this site. Hiding the
marking would leave a page of unanswered questions that teaches nobody.

## The blog, and the journey post

**Publish Mode still writes a `blog` entry**, as #86 locked. `/nederlands/` holds the
learner's material; the blog holds writing for a reader.

**What decides which?** The reader — [`adr/0002`](./adr/0002-turkish-prose-quoted-english.md)'s
own test. A word history the learner studies is a **Lesson**: Turkish, holds Items, lives
under `/nederlands/`. A word history written to be read is a **journey post**: a blog entry
with no Items. Docent proposes a post while writing a Session or a Lesson, and the learner
confirms it; a silent write to a public file is a publication.

**Language set, chosen per post from any subset of EN, TR and NL:**

| The post is built on | Default set |
|---|---|
| a **Tekst** | `nl` + `en` + `tr` |
| a **Lesson**, or a Session's story | `en` + `tr` |
| nothing with a Turkish reader in mind | `en` |

A **Tekst-derived post publishes the Dutch** because that text already exists, is short,
and is the point of the post. A Lesson-derived post does not: writing a grammar explanation
in Dutch would put the learner's name over unchecked B2 prose nobody asked for
([`adr/0010`](./adr/0010-published-dutch-is-unmarked.md)).

**One untranslated tag, `Nederlands`.** This site translates its tags — `Sports`/`Spor`,
`Engineering`/`Mühendislik` — so one tag per language would scatter the archive. *Nederlands*
is a proper noun that reads correctly in all three, and `/blog/tag/Nederlands/` is then one
archive.

### The same Dutch text lives on two pages

A Tekst at `/nederlands/tekst/x/` carries the Dutch text with its word list and questions.
The post's `nl` entry carries the same text for a reader. **Both pages stay**, and each
names the other in one line.

The alternatives lost on mechanism and on cost. Making the group's Dutch member *be* the
Tekst needs a `translationId` group spanning two collections, which the field cannot
express. Dropping the Dutch entry would leave the NL toggle button with almost nothing to
show. The shared body is about 150 words.

## Page language

Every page declares its own language, which the `lang` prop on `BaseLayout` now makes
possible.

| Page | `<html lang>` |
|---|---|
| `/nederlands/` and its three list routes | `en` |
| Lesson, Tekst, Session, Reference | `tr` |
| a journey post | its own `lang` |

The Dutch block inside a Tekst keeps `lang="nl"` on the element, per #132, so a screen
reader pronounces Dutch as Dutch and the browser stops offering to translate the text the
learner came to read.

## What this ticket does not decide

- **Interactivity** — widgets, self-marking, client-side speech, `localStorage`. That is
  [#136](https://github.com/atilileri/atilileri.github.io/issues/136), which this unblocks.
  This file fixes page structure only.
- **Enrichment** — audio and images on these pages, owned by
  [#131](https://github.com/atilileri/atilileri.github.io/issues/131).

## A limitation to state once

GitHub Pages builds on push, so a Session is live a minute or two after Docent commits it.
The learner cannot open a Session the moment it is written. Nothing here retries or waits;
the page simply appears.
