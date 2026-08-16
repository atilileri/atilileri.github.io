# What forms can a unit of Dutch learning content take?

**Question:** The Dutch-learning system in this repo generates content on demand from a topic argument (`/<dutch-skill> i want to do a lesson about last superbowl`). What are the possible **forms a unit of learning content can take**? Produce the option space that the content-form grilling ([#82](https://github.com/atilileri/atilileri.github.io/issues/82)) will choose from — a menu, not a recommendation.

**Ticket:** [#79](https://github.com/atilileri/atilileri.github.io/issues/79), part of map [#74](https://github.com/atilileri/atilileri.github.io/issues/74)

**Date:** 2026-08-16

---

## TL;DR — the menu

The user's list — *"lessons, exercises, iterations, sessions, learning content, vocabulary study"* — is not six candidate forms. It is **three artifact-shaped things, two activity names, and one category name**, tangled together. Untangling it is most of this ticket's value.

The strongest finding comes from Anki's manual, and it is not about flashcards. It is that **the thing you author and the thing you study are different objects**: you author a *note* (a bundle of fields), and Anki *generates* cards from it, one per question direction, each with its own independent review state ([Anki — Getting Started](https://docs.ankiweb.net/getting-started.html); [Anki — Editing](https://docs.ankiweb.net/editing.html)). Apply that lens to the whole system and the option space stops being a flat list of nouns and becomes a grid with two axes:

- **Lifecycle**: is this artifact *accumulated* (a new file each time — a library or a log), *revised in place* (one file, edited forever), or *derived* (never stored at all, computed from something else)?
- **Response-bearing**: does the artifact hold what the learner answered? Per [#80](https://github.com/atilileri/atilileri.github.io/issues/80), answers can arrive asynchronously and **detached** from the artifact that asked the question, via a prefilled GitHub issue tapped on a phone. So "holds responses" always means "has a slot that gets reconciled later", never "captures them live".

Proposed taxonomy — **five content units, one derived form, four standing documents**. Full argument in §6.

| Form | Lifecycle | Holds responses | Astro fit |
|---|---|---|---|
| **Lesson** | accumulates (library) | no | native `glob` collection |
| **Drill** | accumulates (log) or derived | by reference | `glob`, or none if derived |
| **Item** | accumulates (inventory), mutated | no (carries review state) | `file` loader, one YAML file |
| **Card** | **derived — never stored** | no | none; computed at render |
| **Session** | accumulates (log) | yes, reconciled | `glob`, unbounded growth |
| *Plan* | revised in place | no | single-entry / not a collection |
| *Glossary* | revised in place | no | single-entry / not a collection |
| *Reference* | revised in place | no | `glob`, small and stable |
| *Mission* | revised in place | no | not a collection |

---

## 1. Untangling the six words

The ticket names the confusion explicitly, so resolve it before surveying anything.

- **"Learning content"** — a *category*, not a form. It is the union of everything below. It cannot be a collection name because it has no boundary: every candidate here is learning content. Reject as a name.
- **"Vocabulary study"** — an *activity*, not an artifact. The activity has two artifacts under it (the thing studied, and the record that it was studied), and naming the activity hides both. Reject as a name; keep as a description of what a Session is doing.
- **"Iterations"** — a *synonym for sessions* with worse connotations. It implies each pass is the same work repeated, which is exactly false here: each invocation is dressed in a different topic argument. It is also borrowed from agile, and a learner never says "I did an iteration". Reject.
- **"Sessions"** — a real form, and the only one that matches the map's locked invocation shape one-to-one: one `/<dutch-skill> <topic>` call = one session ([#74](https://github.com/atilileri/atilileri.github.io/issues/74)). But "session" names an *event*, and the ambiguity is whether the file is *the teaching* or *the record of the teaching*.
- **"Lessons"** — a real form, and `teach`'s primary one: *"A **lesson** is a single, self-contained HTML output that teaches one tightly-scoped thing tied to the mission. This is the primary unit of teaching in this workspace."* (`.agents/skills/teach/SKILL.md`). Names an *artifact*.
- **"Exercises"** — a real form, but singular-shaped: one exercise is one question. The unit that gets produced, filed and linked is a *set* of them.

**The load-bearing collision: Lesson vs Session.** These are one thing if and only if every invocation produces exactly one durable artifact. They are two things the moment an invocation can produce zero lessons (pure review), or two (a grammar point plus a vocabulary batch), or a lesson that is reused across several later invocations. Anki's filtered decks show the same split from the other side: a study bout is *built from a search over existing material* and thrown away afterwards — *"Anki finds cards that match the settings you specified, and **temporarily** moves them from their existing decks"*, and cards *"automatically return to their home deck after they are studied"* ([Anki — Filtered Decks](https://docs.ankiweb.net/filtered-decks.html)). The bout is not an authored artifact at all. That is the sharpest question for [#82](https://github.com/atilileri/atilileri.github.io/issues/82): **does this repo accumulate a library, a log, or both?**

---

## 2. The Anki data model — note vs card (the instructive part)

This is the single most transferable idea in the space, and it is routinely modelled wrong. The manual's own hierarchy:

- **Note** — *"a collection of related pieces of information"*; the manual's example is a French vocabulary note with three pieces: French word, English translation, page number ([Getting Started](https://docs.ankiweb.net/getting-started.html)).
- **Field** — the individual pieces inside a note (`French`, `English`, `Page`).
- **Note type** — *"Each type of note has its own set of fields and card types."* A note type is a schema.
- **Card type / template** — *"A blueprint that says which fields should be displayed on the front or back of each card"*, written with field replacements like `{{French}}`.
- **Card** — *"A question and answer pair is called a card."*
- **Deck** — *"A deck is a group of cards."* Decks nest as subdecks.
- **Collection** — *"all the material stored in Anki: your cards, notes, decks, note types, deck options, and so on."*

Four consequences that bind this map:

1. **You author notes; the system generates cards.** *"Recall from the basics that in Anki we add notes rather than cards, and Anki creates cards for us."* One note with two card types yields two cards — recognition and production — *"allowing Anki to track performance separately"* ([Editing](https://docs.ankiweb.net/editing.html)). A Dutch item is not one flashcard; it is a bundle that yields NL→TR, TR→NL, NL→EN, cloze-in-a-sentence, and so on.
2. **Review state lives on the card, not the note.** The manual is explicit that card-level operations do not touch siblings: *"flags work at card level, so flagging a card that has siblings won't have any effect on the card's siblings"* ([Editing](https://docs.ankiweb.net/editing.html)). You can be fluent recognising *vergunning* and helpless producing it. **This is a landmine for a git-backed system**: if cards are derived and never stored, there is no file to hang per-card scheduling on. Either materialise cards as data, or knowingly accept coarser note-level scheduling. Naming this now saves [#82](https://github.com/atilileri/atilileri.github.io/issues/82) and the spacing work downstream.
3. **Split information into fields aggressively.** *"As soon as you find yourself wanting to include more than one piece of information on the front or back, it's better to split that information up into more fields"*, because *"by keeping content in separate fields, you make it much easier to adjust the layout of your cards in the future"* ([Editing](https://docs.ankiweb.net/editing.html)). This maps directly onto the map's bilingual lock (content in Turkish **and** English, Dutch as subject): an item wants `nl`, `tr`, `en` as sibling fields on one record.
4. **Prefer tags to many small decks.** *"You can add several tags to a single note, but a single card can only belong to one deck, which makes tags a more powerful and flexible categorization system"* ([Editing](https://docs.ankiweb.net/editing.html)). An argument against inventing a `decks` collection at all — topics and exam skills should be tags on items.

Supporting the item-size question, SuperMemo's **minimum information principle**: knowledge should be *"expressed in the simplest possible form"* because simple material is easier to retain and *"repetitions can be scheduled individually for each sub-item"*; the target is *"answer to be as short as imaginably possible"*, and even two-part items should usually be split ([SuperMemo — Effective learning: 20 rules of formulating knowledge](https://super-memory.com/articles/20rules.htm)). The same page endorses **cloze deletion** as the fast path from prose to reviewable items — relevant because it turns a Lesson's text into Items mechanically, which is exactly the operation a per-session agent can perform cheaply. It also warns *"do not learn if you do not understand"* — an argument that Items must be *produced by* a Lesson, not shipped ahead of one.

---

## 3. What the `teach` skill already models

Read from disk at `.agents/skills/teach/`. `teach` is a workspace of files with distinct lifecycles, and its convention (per [#75](https://github.com/atilileri/atilileri.github.io/issues/75)) is that each `XYZ-FORMAT.md` is the generator spec for a stateful artifact `XYZ.md`.

| `teach` artifact | Lifecycle | Note |
|---|---|---|
| `MISSION.md` | revised in place, **one per workspace** | *"One mission per workspace."* … *"If `MISSION.md` runs past a screen, it has stopped being a compass and started being a plan."* (`MISSION-FORMAT.md`) |
| `./lessons/*.html` | accumulates, `0001-<dash-case-name>.html` | *"the primary unit of teaching"*; *"short, and completable very quickly"*; *"Lessons will rarely be revisited later"* (`SKILL.md`) |
| `./reference/*.html` | revised in place, topic-shaped | *"the compressed learnings from the lessons — cheat sheets, reference algorithms, syntax… They are the raw units of learning"*; *"reference documents will be [revisited]. They should be the compressed essence of the lesson"* (`SKILL.md`) |
| `./learning-records/*.md` | accumulates, ADR-shaped, supersedable | *"loosely equivalent to architectural decision records"*; *"they are decision-grade insights"*, explicitly **not** *"session-by-session activity logs"* (`LEARNING-RECORD-FORMAT.md`) |
| `GLOSSARY.md` | revised in place | mastery record — see below |
| `RESOURCES.md` | revised in place, pruned | *"Prune ruthlessly. …Better five sharp sources than thirty mediocre ones."* (`RESOURCES-FORMAT.md`) |
| `./assets/*` | revised in place, shared | *"Reuse is the default, not the exception."* (`SKILL.md`) |
| `NOTES.md` | scratchpad | preferences, working notes |

Three things `teach` gets right that the menu should inherit:

- **Lesson and Reference are deliberately different objects with opposite read patterns.** Lessons are consumed once; references are consumed forever. `teach` states this outright (`SKILL.md`). This is a second, independent argument for splitting the accumulating artifact from the revised-in-place one.
- **`GLOSSARY.md` is a mastery record, not a study list.** *"Add a term only when the user understands it. The glossary is a record of compressed knowledge, not a dictionary the user reads to learn. If the user has just been introduced to a concept, wait until they can use it correctly before promoting it here."* (`GLOSSARY-FORMAT.md`). Per [#75](https://github.com/atilileri/atilileri.github.io/issues/75), this leaves a hole: a language learner needs an inventory of vocabulary **in flight** — words being acquired, precisely the ones the glossary excludes by rule. **The taxonomy must carry both**, and they are different forms with opposite admission rules: *Item* admits on first encounter and carries struggle; *Glossary* admits on demonstrated mastery and carries none.
- **Learning records are not a session log.** `teach` bans the journal reading explicitly. If this map wants a per-invocation record (and "learning in public" suggests it does), that is a *different form* from a learning record, and it needs its own name.

Two things `teach` does **not** model, both of which the menu must expose:

- **No item-shaped unit at all.** Everything in `teach` is document-shaped. There is no per-word, per-phrase object, and therefore nowhere for spaced repetition to attach. `SKILL.md` names spacing as a principle (*"Spacing (distributing practice over time)"*) but ships no mechanism — consistent with [#75](https://github.com/atilileri/atilileri.github.io/issues/75)'s finding that there is nothing to inherit here.
- **No slot for learner responses.** `teach` puts quizzes *inside* the lesson HTML, where the answers evaporate when the tab closes. Given [#80](https://github.com/atilileri/atilileri.github.io/issues/80), this repo can do better, but only asynchronously.

---

## 4. What established course structures do

**Open edX** — a strict four-level containment hierarchy: *Section* (top level, *"typically represent[s] a time period"*) → *Subsection* (*"usually represent[s] a topic or other organizing principle"*) → *Unit* (*"lessons in a subsection that learners view as single pages"*) → *Component* (*"objects within units that contain your actual course content"* — html, video, problem, discussion) ([Open edX — Developing Your Course Outline](https://edx.readthedocs.io/projects/open-edx-building-and-running-a-course/en/open-release-eucalyptus.master/developing_course/course_outline.html); [Developing Course Units](https://edx.readthedocs.io/projects/open-edx-building-and-running-a-course/en/open-release-sumac.master/developing_course/course_units.html)). Internally these are `chapter` / `sequential` / `vertical` / component ([edX Research Guide — Course Content Data](https://edx.readthedocs.io/projects/devdata/en/latest/internal_data_formats/course_structure.html)). The transferable point: **the page the learner sees ("unit") is not the smallest content object ("component")** — exposition and problems are separate objects inside one page. That is the Lesson/Drill split, arrived at independently of Anki.

**Delftse methode** (a Dutch NT2 method, directly on-target for the inburgering goal) — the unit is **a text plus its word list**. 42 lessons take a learner A0→A2 with ~2200 new words, ~50 high-frequency new words per lesson; *"The texts on which the method is based provide the topics for the conversations in the conversation classes"*, all new vocabulary is translated into 26 languages, and grammar is explained from the texts *"without using grammatical terminology"* ([TU Delft — About the Delftse methode](https://www.tudelft.nl/en/tpm/itav/education/dutch-courses/about-us/about-the-delftse-methode); [nt2.nl — Delftse methode](https://www.nt2.nl/en/delftse-methode)). Two things this contributes: (a) a **Lesson and its Items are minted together from one text** — the vocabulary batch is a by-product of the exposition, not a separate authoring act, which is exactly what a per-session agent can do; (b) **assessment is per-lesson and repeatable** — *"Individual evaluation occurs in every lesson through listening tests, gap-filling exercises, or dictations"*, and a failing score means restudy the text and retake. That is a Drill with a pass/fail outcome attached to a Lesson.

**CEFR** — the level system is defined as *"a structured set of illustrative 'can-do' descriptors"*, organised into scales grouped by communicative language activity: **reception, production, interaction, mediation** ([Council of Europe — CEFR Descriptors](https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors)). *Sourcing caveat: coe.int and rm.coe.int both returned HTTP 403 to my fetcher; this wording comes from the search index's summary of those pages, not a direct read.* The contribution is a candidate shape for the **Plan**: the spine is a list of *can-do objectives*, not a list of lesson titles. That matters for this map because the invocation lock says the agent teaches *"whatever is next in the plan"* — so the plan's unit must be stable under an arbitrary topic dressing, and a can-do statement is (a superbowl text can serve "can understand a short factual report"; a lesson titled "Superbowl" cannot serve anything else).

**Inburgering / DUO** — the exam is five separately-assessed components: Lezen, Luisteren, Schrijven, Spreken, and KNM, each with its own format and duration (A2 Lezen 65 min, Luisteren 45 min, Spreken 35 min on computer, Schrijven 40 min pen-and-paper with 4 tasks such as a short letter or filling in a form) ([DUO/Inburgeren — Language exams](https://www.inburgeren.nl/en/taking-the-integration-exam/content-language-exams-a2-b1-b2.jsp); [Inhoud examens](https://www.inburgeren.nl/examen-doen/inhoud-examens.jsp)). Consequence for the menu: whatever the forms are, **they need a `skill` facet** (lezen/luisteren/schrijven/spreken/knm) or progress cannot be reported against the actual goal. Note also that Schrijven is *"filling in a form"* and *"writing a brief letter"* — response-bearing, free-text, and unmarkable by a static site; those responses have to reach the agent, which is precisely what [#80](https://github.com/atilileri/atilileri.github.io/issues/80) solved.

---

## 5. The forms, one by one

Each entry answers the five questions the ticket asks: contents and size; strengths and failures; produced-once vs regenerated; responses; Astro fit.

Relevant Astro facts used throughout: a collection is *"a set of related, structurally identical data"*, defined with `defineCollection()` in `src/content.config.ts`; the **glob loader** reads a directory of Markdown/MDX/JSON/YAML/TOML files and derives IDs from filenames; the **file loader** reads *many entries from a single local file* (a JSON/YAML array) with a unique `id` per entry; data-only entries with no Markdown body are fully supported; and build-time collections are *"updated at build time, and data is saved to a storage layer"* — read-only, with no mutation path ([Astro — Content Collections](https://docs.astro.build/en/guides/content-collections/); [Astro — Content Loader Reference](https://docs.astro.build/en/reference/content-loader-reference/), which states loaders run at build time and that `store.set()` supports a `digest` for incremental updates). Live collections exist but *"fetch their data at runtime"* and this site has no adapter ([#80](https://github.com/atilileri/atilileri.github.io/issues/80)) — so **every form below is build-time and read-only at runtime; the agent, via git, is the only write path.**

### 5.1 Lesson — the durable taught artifact

**Contents / size.** One tightly-scoped teaching thing: a short exposition, a worked example, a primary-source link, dressed in the session's topic. `teach`'s size rule is the right one — *"short, and completable very quickly… Learners' working memory is very small"* (`SKILL.md`). Call it one screen to a few screens.

**Good at.** Being read by a stranger (the map's "learning in public" lock), being linked from elsewhere, carrying the topic dressing that makes the system feel personal, and being the natural parent of the Items minted from it (the Delftse methode pattern).

**Fails at.** Being reviewed. `teach` says it outright: *"Lessons will rarely be revisited later"* (`SKILL.md`). It also fails as a mastery signal — coverage is not learning, which `LEARNING-RECORD-FORMAT.md` states directly (*"Material that was merely covered. Coverage is not learning."*).

**Once or per-session.** **Produced once, accumulates a library.** This is the form that makes the repo grow a corpus. Risk to name for [#82](https://github.com/atilileri/atilileri.github.io/issues/82): because every lesson is dressed in an arbitrary topic, the library is a pile of bespoke one-offs, not a course. A stranger browsing 80 lessons titled by topic gets no learnable sequence — the sequence lives in the Plan, not in the library.

**Responses.** **No.** Keep it read-only exposition; put the asking in a Drill.

**Astro.** Native `glob` collection over `src/content/dutch-lessons/`. Frontmatter mirrors the existing `blog` conventions in `src/content.config.ts` — including `lang: z.enum(['en','tr'])` + `translationId` for the bilingual lock, which is already a proven pattern in this repo (two files, paired by id). Renders at `/dutch/lessons/<id>`.

### 5.2 Drill — the practice set

**Contents / size.** A set of prompts of one or more types: multiple choice, cloze (SuperMemo's recommended conversion route), translate-this, write-a-short-reply (matching DUO's Schrijven tasks). Say 5–15 prompts.

**Good at.** Retrieval practice, which `teach` names as the mechanism for storage strength: *"Using retrieval practice (recall from memory)"*, *"For skill acquisition, difficulty is the tool"* (`SKILL.md`). Also the only form that produces evidence — and `LEARNING-RECORD-FORMAT.md` treats evidence as the trigger for recording learning.

**Fails at.** Grading itself. A static page cannot mark free text, and per [#80](https://github.com/atilileri/atilileri.github.io/issues/80) it cannot even receive the answer. Also inherits `teach`'s known bug from [#76](https://github.com/atilileri/atilileri.github.io/issues/76) — quiz answers always land in slot A, needing a shuffling component rather than a prompt fix. Also fails at spacing on its own: a drill is a one-time set unless something re-selects its prompts later.

**Once or per-session.** **Both are defensible, and this is a real fork.** (a) *Authored once alongside its Lesson* → durable, linkable, re-takeable (the Delftse methode's per-lesson assessment). (b) *Regenerated per session from the Item inventory* → this is Anki's filtered deck, *"temporarily"* assembled from a search and returning cards to their home deck afterwards ([Filtered Decks](https://docs.ankiweb.net/filtered-decks.html)); nothing is committed, and the repo accumulates no drill files at all.

**Responses.** **By reference.** The drill page carries prompt IDs; the answers arrive later in a Session (§5.5) via a prefilled issue.

**Astro.** If authored: `glob` collection, or simply a `drill:` array in the Lesson's frontmatter (data-only entries are supported, so a structured prompt list validates fine under Zod). If regenerated: **it is not content at all**, it is a query over the Items collection executed by the agent in-session — no collection, no URL, no file.

### 5.3 Item — the note-shaped vocabulary/phrase unit

**Contents / size.** One lexical thing and everything known about it, as **fields**, following Anki's split-into-fields rule: `nl`, `tr`, `en`, part of speech, gender/article, plural, an example sentence in Dutch with its translations, register, exam skill tag, source lesson, and (if scheduling lands here) review state. Small — a dozen short fields.

**Good at.** Being scheduled, counted, filtered, and progressed against. It is the only form on this menu with a natural notion of *strength*. It is also the form that handles trilinguality *correctly*: three sibling fields on one record, versus `blog`'s two-files-paired-by-`translationId`. A word is one thing with three names; a blog post is two documents.

**Fails at.** Teaching. SuperMemo: *"do not learn if you do not understand"* — an item list handed over cold is the failure mode. It also fails at nuance: the minimum information principle forces items so small they lose context, which is why they must point back at a Lesson.

**Once or per-session.** **Produced once, accumulates an inventory — but mutated forever after.** This is a third lifecycle, distinct from both library and log, and it is the one that fits git worst: every review session rewrites fields in existing files, producing a churny diff history and a full site rebuild.

**Responses.** Not responses as such, but **review outcomes** — which is the same reconciliation problem wearing a different hat.

**Astro.** Best served by the **`file` loader**: one `src/content/dutch/items.yaml` holding an array of entries with unique `id`s, rather than two thousand tiny Markdown files ([Astro — Content Collections](https://docs.astro.build/en/guides/content-collections/)). Cheaper diffs, one file to rewrite, trivially queryable. Cost: no per-item Markdown body and no per-item file history. `reference()` can link an Item to its source Lesson.

**Naming warning.** Do **not** call this a "card". See §5.4.

### 5.4 Card — the derived question direction

**Contents / size.** A single question/answer pair: *"A question and answer pair is called a card"* ([Anki — Getting Started](https://docs.ankiweb.net/getting-started.html)). NL→TR recognition, TR→NL production, cloze-in-sentence, article-of-the-noun.

**Good at.** Being the correct unit of *scheduling* — Anki tracks each direction's performance separately, and the manual's card-level operations do not touch siblings ([Editing](https://docs.ankiweb.net/editing.html)).

**Fails at.** Existing as a file without duplicating its Item. Every field of a card is either an Item field or a template.

**Once or per-session.** **Neither — derived.** Anki's central move: *"in Anki we add notes rather than cards, and Anki creates cards for us."* Cards are generated from the note by card templates.

**Responses.** No — but review state belongs here, which is the tension.

**Astro.** **Resists collections entirely, and should.** Cards are computed at render or in-session from Items × templates. Storing them is denormalisation.

**The one hard consequence to hand [#82](https://github.com/atilileri/atilileri.github.io/issues/82):** if cards are derived and only Items are stored, then **scheduling can only be per-Item, not per-card**, unless the Item carries a small map of per-direction state (e.g. `srs: { nl_tr: {...}, tr_nl: {...} }`). Anki's model says per-direction is correct; a file-backed repo says per-Item is cheap. That trade is a decision, not a detail, and it is invisible unless the note/card distinction is made explicit first.

### 5.5 Session — the per-invocation record

**Contents / size.** What one `/<dutch-skill> <topic>` invocation did: the topic argument, the plan objective served, the lesson(s) produced, the items minted, the drill given, the answers received, what was got wrong, and the date. Half a screen to a screen.

**Good at.** Being the honest spine of "learning in public" — a public, dated, append-only account of the practice. It is also the natural **landing place for the detached answers** from [#80](https://github.com/atilileri/atilileri.github.io/issues/80): the issue body carries a session id, the agent reads it back with `gh`, and writes the answers into the session file at the next invocation. And it is the only form that can carry the date field the map notes is missing from `teach`'s learning records.

**Fails at.** Being read. Nobody rereads session 47. It also fails as an insight store — `teach` bans exactly this reading of a learning record: *"Learning records are not a journal — they are decision-grade insights"* (`LEARNING-RECORD-FORMAT.md`). So Session and Learning Record are **two forms**, not one, and the second is the rarer, more valuable one.

**Once or per-session.** **Per session, by definition. Accumulates a log, not a library.** This is the form that decides the repo grows a chronicle.

**Responses.** **Yes — this is the response-bearing form**, and its responses always arrive *late and detached*. Model the arrival explicitly: a session is created `open` with prompts and no answers, and a later reconciliation pass fills `answers` and flips it to `closed`. A form that assumes answers exist at write time is wrong under [#80](https://github.com/atilileri/atilileri.github.io/issues/80).

**Astro.** A `glob` collection works, but note the growth: one file per invocation, forever, each a buildable page. Options are to render an index only, to render each session, or to keep sessions out of `src/content/` entirely and treat them as agent state under `docs/` or a workspace dir. Astro is happy either way; the question is whether a stranger should see them, and the publicness lock says probably yes.

### 5.6 Plan — the ordered spine

**Contents / size.** The ordered list of what to teach, in units stable under arbitrary topic dressing. The map's invocation lock already names this artifact: the agent teaches *"whatever is next in the plan"* ([#74](https://github.com/atilileri/atilileri.github.io/issues/74)). CEFR-style **can-do objectives** are the strongest candidate unit ([Council of Europe — CEFR Descriptors](https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors)), tagged by DUO exam skill (lezen/luisteren/schrijven/spreken/knm) ([DUO — Language exams](https://www.inburgeren.nl/en/taking-the-integration-exam/content-language-exams-a2-b1-b2.jsp)). A screen or two, or a YAML list of a few dozen objectives.

**Good at.** Making the lesson library legible. Without it, the library is a pile of topic one-offs.

**Fails at.** Nothing much, except that it must be authored — this is the form most likely to need the sources/curriculum ticket to land first.

**Once or per-session.** **Revised in place**, one file. Amended as the learner moves; never regenerated.

**Responses.** No. Progress against it is derived from Sessions and Items.

**Astro.** A single data file (`file` loader or a plain import), or one Markdown page. Not really a collection — there is one of it.

### 5.7 Glossary and Item are two things, deliberately

Per [#75](https://github.com/atilileri/atilileri.github.io/issues/75) and `GLOSSARY-FORMAT.md`, the **Glossary** admits a term *"only when the user understands it"* and is *"a record of compressed knowledge, not a dictionary the user reads to learn."* The **Item** inventory admits on first encounter and exists precisely to hold what is *not yet* known. Same subject matter, opposite admission rules, opposite read patterns (glossary is read by a stranger for orientation; the item inventory is read by the scheduler). Keeping one and dropping the other loses a real capability; merging them breaks the glossary's rule. **An Item graduating into the Glossary is the system's mastery event** — and that gives the map its missing "exit criteria" hook for vocabulary at least.

Note one asymmetry worth flagging to [#82](https://github.com/atilileri/atilileri.github.io/issues/82): `teach`'s glossary is a *topic nomenclature* glossary (terms of the subject), not a *lexicon*. For Dutch, the terms of the subject are grammar words — *de/het*, *scheidbaar werkwoord*, *inburgering* — while the lexicon is thousands of ordinary words. If the glossary tries to be the lexicon, it stops being a screen-sized compass. Either keep the glossary for metalanguage and let Items own the lexicon, or define a separate "mastered" state on Items.

### 5.8 Reference — the compressed cheat sheet

**Contents / size.** A conjugation table, a word-order rule, a set of KNM facts. `teach`: *"cheat sheets, reference algorithms, syntax, yoga poses, glossaries… the compressed essence of the lesson, in a format designed for quick reference"* (`SKILL.md`).

**Once or per-session.** **Revised in place, topic-shaped.** Roughly one per grammar point, updated as understanding deepens — not one per session. This is the form with the best public value per byte, and the one most likely to be linked from outside.

**Responses.** No. **Astro.** A small `glob` collection that stays stable in size. Text-first, so it satisfies [#81](https://github.com/atilileri/atilileri.github.io/issues/81) trivially.

### 5.9 Forms considered and rejected

- **Deck.** Anki's own advice argues against it: tags beat many small decks because *"a single card can only belong to one deck"* ([Editing](https://docs.ankiweb.net/editing.html)). Use tags/facets on Items (topic, exam skill, CEFR level) and let a "deck" be a saved query, not a stored object.
- **Course / Module / Chapter.** The Open edX four-level hierarchy is right for a fixed syllabus authored in advance. It is wrong here: the invocation lock means content arrives in arbitrary topical order, so a containment tree would be filled out of sequence and mostly empty. Use the flat Plan plus tags.
- **Component.** Open edX's smallest object, and `teach`'s `./assets/*` (*"Reuse is the default, not the exception"*, `SKILL.md`). This is real and useful, but it is **infrastructure, not learning content** — a quiz widget or stylesheet. It belongs in the skill's asset directory, not in a content collection. Worth naming only so [#82](https://github.com/atilileri/atilileri.github.io/issues/82) does not confuse "shuffling quiz component" (needed per [#76](https://github.com/atilileri/atilileri.github.io/issues/76)) with a content form.
- **Illustrated card.** Ruled out upstream by [#81](https://github.com/atilileri/atilileri.github.io/issues/81) — every form above is text-first and none *requires* a generated image.

---

## 6. Proposed taxonomy

**Five content units, one derived form, four standing documents.** The boundaries are drawn on the two axes from the TL;DR — lifecycle, and whether the form bears responses.

### The content units (they accumulate)

1. **Lesson** — exposition. Produced once per taught thing, dressed in the session's topic. Library. No responses.
2. **Drill** — prompts. Either authored with its Lesson (library) or regenerated from Items (nothing stored). Responses by reference only.
3. **Item** — one lexical or grammatical thing, as fields. Inventory. Mutated by review, never rewritten by hand.
4. **Session** — what one invocation did, and what the learner answered. Log. **The only response-bearing form.**
5. **Learning Record** — a decision-grade insight that changes what to teach next. Rare, append-only, supersedable. Lifted wholesale from `teach` per [#75](https://github.com/atilileri/atilileri.github.io/issues/75).

### The derived form (it is never stored)

6. **Card** — one question direction over an Item. Generated, not authored. Named in the taxonomy *precisely so the schema does not accidentally store it*.

### The standing documents (one each, revised in place)

7. **Mission** — why. 8. **Plan** — what next, as can-do objectives. 9. **Glossary** — mastered terms. 10. **Reference** — compressed cheat sheets.

### Honest arguments on each name

- **Lesson** — *for*: universal, `teach` already uses it, clean URL (`/dutch/lessons/0007-…`), and the user reached for it first. *Against*: it implies a fixed position in a curriculum, which topic-dressed content does not have; it collides head-on with **Session**; and "lesson 47" implies a sequence the library does not actually carry. *Alternative*: **Explainer** — sheds the curriculum implication and cleanly forbids questions inside it, at the cost of being nobody's natural word.
- **Drill** — *for*: unmistakably practice, short, no collision with anything, works as both singular and collective. *Against*: connotes rote and mechanical, which sits badly against a communicative method — the Delftse methode is conversation-led and grammar-implicit ([TU Delft](https://www.tudelft.nl/en/tpm/itav/education/dutch-courses/about-us/about-the-delftse-methode)). *Alternatives*: **Exercise** (the user's own word, but singular-shaped — you end up saying "exercise set"), **Quiz** (`teach`'s word, but narrower than the Schrijven tasks DUO actually sets), **Practice** (uncountable, awkward as a filename).
- **Item** — *for*: SRS-native, neutral, does not presume the thing is a single word (phrases, chunks, grammar patterns all fit). *Against*: vague on its own; "item" tells a reader nothing. *Alternatives*: **Note** — Anki's actual word, and adopting it imports the correct note/card mental model for free, which is the strongest argument available; but it collides with `teach`'s `NOTES.md` scratchpad and with the everyday sense of "notes". **Entry** — accurate but collides with Astro's own vocabulary (`getEntry`, collection entries), which will read badly in code. **Word** — warm and honest, but too narrow the first time a fixed expression or a word-order pattern needs a home. *If the note/card lesson is to be taught by the schema itself, use `Note`; if collision-avoidance wins, use `Item`.*
- **Card** — *for*: it is the correct name for the derived thing, and naming it protects the model. *Against*: it is the word everyone will instinctively reach for to mean the **Item**, so it is the single most likely modelling mistake in the whole system. If it is too dangerous to keep, drop the word entirely and speak of "directions" or "prompts" — but then say so explicitly in the skill, or the mistake creeps back.
- **Session** — *for*: exactly matches the locked invocation shape, carries a date, and is where detached answers land. *Against*: names an event, not a thing; and unless the Lesson/Session boundary is stated loudly it will be read as a synonym for Lesson. *Alternatives*: **Log entry** (clear but ugly in a URL), **Practice log** (clearer that it is a record, not the teaching).
- **Plan** — *for*: **the user's own locked word** — the map says the agent teaches "whatever is next in the plan". That is a decisive argument; do not invent a synonym for a word already in the lock. *Against*: "plan" is overloaded in an agentic repo. *Alternatives*: **Curriculum** (accurate, formal, heavy), **Syllabus** (same), **Track** (short, but jargon).
- **Mission**, **Glossary**, **Reference**, **Learning Record** — keep `teach`'s names unchanged. [#75](https://github.com/atilileri/atilileri.github.io/issues/75) already resolved that these formats are lifted wholesale, and renaming a lifted format only breaks the correspondence to its `XYZ-FORMAT.md` generator spec.

### Where two names are really one thing

- **Iteration = Session.** Identical referent, worse word. Delete "iteration".
- **Vocabulary study = an activity over Items, recorded as a Session.** Not a form. Delete as a name; it decomposes into two forms that already exist.
- **Learning content = the category.** Not a form. Delete as a name.
- **Drill and Session collapse into one** if drills are regenerated and never authored: then the only trace of a drill is the prompts-and-answers block inside the Session file, and "Drill" is a section heading, not a collection. **This is the single largest structural choice on the menu** and the one [#82](https://github.com/atilileri/atilileri.github.io/issues/82) should settle first, because it decides whether the repo carries a re-takeable practice library or only a chronicle.
- **Lesson and Session collapse into one** if every invocation always yields exactly one durable teaching artifact and nothing else is worth keeping. Cheapest possible model — one file per invocation, holding exposition, prompts and (later) answers. Costs the ability to reuse a lesson, to run a review-only session, and to mint two lessons at once.
- **Glossary and Item do *not* collapse**, per §5.7 — opposite admission rules. Any proposal that merges them is silently deleting the in-flight inventory that [#75](https://github.com/atilileri/atilileri.github.io/issues/75) flagged as missing.
- **Card and Item do *not* collapse** — but they will be merged by accident unless the schema names both. That is the whole reason Card is on this list.

### Constraint check across the menu

- **[#81](https://github.com/atilileri/atilileri.github.io/issues/81) (no required images):** satisfied by every form. All are text-first; images would be optional enrichment on Lesson, Reference and Item only.
- **[#80](https://github.com/atilileri/atilileri.github.io/issues/80) (detached async answers):** only **Session** bears responses, and it must be modelled as *created open, reconciled later*. Nothing else needs a response slot, which keeps the reconciliation problem confined to one form.
- **[#74](https://github.com/atilileri/atilileri.github.io/issues/74) bilingual lock (TR + EN):** **Lesson** and **Reference** follow the existing `blog` pattern in `src/content.config.ts` (`lang` + `translationId`, two paired files). **Item** must not — it needs `nl`/`tr`/`en` as sibling fields on one record, per Anki's split-into-fields rule.
- **[#74](https://github.com/atilileri/atilileri.github.io/issues/74) publicness lock:** every form is committed and rendered. The one to think twice about is **Session** — a public, dated record of every wrong answer.
- **Static-site constraint:** all collections are build-time and read-only ([Astro](https://docs.astro.build/en/guides/content-collections/); [Content Loader Reference](https://docs.astro.build/en/reference/content-loader-reference/)); the agent writing files through git is the only write path. Any design that assumes the page mutates content is out.

### Questions this menu deliberately leaves open for [#82](https://github.com/atilileri/atilileri.github.io/issues/82)

1. Library, log, or both — does the repo accumulate re-readable Lessons, or only a chronicle of Sessions?
2. Is a Drill authored (durable, re-takeable) or regenerated (Anki filtered deck, nothing stored)?
3. Does scheduling attach per-Item (cheap, coarse) or per-direction (Anki-correct, needs a state map inside the Item)?
4. Does the Glossary hold metalanguage only, or does "mastered" become a state on Items?
5. Are Sessions rendered as public pages, or kept as agent state outside `src/content/`?
6. `Note` (imports the right mental model, collides with `NOTES.md`) or `Item` (safe, vague)?

---

## Sources

Primary sources opened directly:

- [Anki Manual — Getting Started](https://docs.ankiweb.net/getting-started.html) — definitions of collection, deck, subdeck, note, field, note type, card type/template, card; the French-vocabulary note producing two cards.
- [Anki Manual — Editing](https://docs.ankiweb.net/editing.html) — *"in Anki we add notes rather than cards, and Anki creates cards for us"*; split information into fields; tags vs decks; card-level operations do not affect siblings.
- [Anki Manual — Filtered Decks](https://docs.ankiweb.net/filtered-decks.html) — filtered decks built from a search, temporary, home deck, Rebuild/Empty, no cards deleted.
- [SuperMemo — Effective learning: 20 rules of formulating knowledge](https://super-memory.com/articles/20rules.htm) — minimum information principle, cloze deletion, "do not learn if you do not understand", item sizing.
- [Astro — Content Collections](https://docs.astro.build/en/guides/content-collections/) — collection definition, glob vs file loaders, Zod schemas, `reference()`, data-only entries, build-time storage layer, live collections fetch at runtime.
- [Astro — Content Loader Reference](https://docs.astro.build/en/reference/content-loader-reference/) — object vs inline loaders, `LoaderContext` (`store`, `meta`, `parseData`, `renderMarkdown`, `generateDigest`), loaders run at build time, digest-based incremental updates.
- [TU Delft — About the Delftse methode](https://www.tudelft.nl/en/tpm/itav/education/dutch-courses/about-us/about-the-delftse-methode) — text as the unit, conversation lessons, grammar without grammatical terminology, per-lesson individual assessment with restudy-and-retake.
- Local files read directly in this repo:
  - `.agents/skills/teach/SKILL.md` — workspace artifacts, lesson definition and size, reference vs lesson read patterns, assets/components, fluency vs storage strength, retrieval/spacing/interleaving.
  - `.agents/skills/teach/GLOSSARY-FORMAT.md` — *"a record of compressed knowledge, not a dictionary the user reads to learn"*; add only when understood.
  - `.agents/skills/teach/LEARNING-RECORD-FORMAT.md` — ADR analogy, when to write one, *"Coverage is not learning"*, not a journal, supersession.
  - `.agents/skills/teach/MISSION-FORMAT.md` — one mission per workspace, concrete over abstract, keep it to a screen.
  - `.agents/skills/teach/RESOURCES-FORMAT.md` — knowledge vs wisdom grouping, annotate every entry, prune ruthlessly, surface gaps.
  - `src/content.config.ts` — existing `blog` / `garden` / `projects` / `sports` collections; `blog`'s `lang` + `translationId` bilingual pairing.

Primary sources reached via search index (page itself blocked to my fetcher — flagged in text):

- [Council of Europe — CEFR Descriptors](https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors) (HTTP 403) and the [CEFR Companion Volume](https://rm.coe.int/common-european-framework-of-reference-for-languages-learning-teaching/16809ea0d4) (HTTP 403) — "can-do" illustrative descriptors; scales grouped by reception, production, interaction, mediation. Wording from the search index's summary, not a direct read.
- [Open edX — Developing Your Course Outline](https://edx.readthedocs.io/projects/open-edx-building-and-running-a-course/en/open-release-eucalyptus.master/developing_course/course_outline.html), [Developing Course Units](https://edx.readthedocs.io/projects/open-edx-building-and-running-a-course/en/open-release-sumac.master/developing_course/course_units.html), [edX Research Guide — Course Content Data](https://edx.readthedocs.io/projects/devdata/en/latest/internal_data_formats/course_structure.html) — section/subsection/unit/component hierarchy and the internal `chapter`/`sequential`/`vertical` categories. Via search index.
- [DUO / Inburgeren — Language exams](https://www.inburgeren.nl/en/taking-the-integration-exam/content-language-exams-a2-b1-b2.jsp) and [Inhoud examens](https://www.inburgeren.nl/examen-doen/inhoud-examens.jsp) — the five components (Lezen, Luisteren, Schrijven, Spreken, KNM), A2 formats and durations. Via search index; durations not individually re-verified.
- [nt2.nl — Delftse methode](https://www.nt2.nl/en/delftse-methode) — 42 lessons A0→A2, ~2200 words, ~50 new high-frequency words per lesson, vocabulary translated into 26 languages. Via search index.

Sibling tickets taken as given:

- [#75 — audit this repo's existing skills](https://github.com/atilileri/atilileri.github.io/issues/75) — `XYZ-FORMAT.md` → `XYZ.md` convention; glossary is a mastery record; an in-flight inventory is missing.
- [#80 — can github.io capture answers from a phone?](https://github.com/atilileri/atilileri.github.io/issues/80) — prefilled GitHub issue, read back with `gh`; answers arrive detached and asynchronous.
- [#81 — feasibility of generated flashcard visuals](https://github.com/atilileri/atilileri.github.io/issues/81) — no form may require a generated image.
- [#76 — what does aihero.dev offer this journey?](https://github.com/atilileri/atilileri.github.io/issues/76) — `teach`'s quiz answers always land in slot A; needs a shuffling component.
