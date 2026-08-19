# Dutch learning journey

A repo-native, agent-run Dutch practice aimed at Staatsexamen NT2, published on the site. The vocabulary below is this context's ubiquitous language: these words appear in the skill, in Astro schemas, in URLs, and in every conversation about the work. Taxonomy locked by [#82](https://github.com/atilileri/atilileri.github.io/issues/82); the map is [#74](https://github.com/atilileri/atilileri.github.io/issues/74).

## Language

**Lesson**:
A durable teaching artifact — exposition on one thing, sized to about ten minutes of reading. It contains no prompts and bears no answers. One file, mixed Turkish and English.
_Avoid_: Explainer, chapter, module

**Session**:
A dated record of one invocation — what was taught, what was asked, and what the learner answered. It is the only form that bears answers. It links to zero or more Lessons, many-to-many.
_Avoid_: Iteration, lesson (when the event is meant), practice log

**Item**:
One lexical or grammatical thing held as sibling fields (`nl` / `tr` / `en`), in a single central inventory. The unit the scheduler acts on. Never embedded in a Lesson — a Lesson references Items by id.
_Avoid_: Note, card, word, entry

**Direction**:
One of exactly two ways an Item is asked: `recognition` (Dutch → known language) or `production` (known language → Dutch). Each Direction carries its own scheduling state on the Item.
_Avoid_: Card — the word is banned, because it invites storing the derived thing as a record of its own.

**Mastered**:
A final state on an Item, reached when it graduates out of active learning. A Mastered Item is never deleted; it returns rarely, to confirm it is still held.

**Exam task**:
An authored, kept, re-takeable artifact that mimics a real exam task — for example a *Schrijven* writing brief. Distinct from prompt sets, which are generated per Session and stored nowhere but that Session.
_Avoid_: Drill, exercise, quiz, opdracht, task

**Learning Record**:
A rare, decision-grade insight that changes what to teach next. Append-only and supersedable. Format lifted from the `teach` skill.
_Avoid_: Journal entry, note

**Mission**:
The standing one-screen statement of why this journey exists and what counts as arriving.

**Plan**:
The standing list of can-do objectives that decides what is taught next. The locked invocation shape teaches whatever is next in the Plan, dressed in a user-supplied theme.
_Avoid_: Curriculum, syllabus, track

**Glossary**:
The standing record of *metalanguage* the learner has mastered — the terms of the subject (*de/het*, *scheidbaar werkwoord*, *inburgering*), not the lexicon. Admits a term only once it is understood.
_Avoid_: Dictionary, lexicon, vocabulary list — the lexicon belongs to Items.

**Reference**:
A compressed, topic-shaped cheat sheet — a conjugation table, a word-order rule — revised in place rather than written once per Session.
