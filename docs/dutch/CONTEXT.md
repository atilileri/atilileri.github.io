# Dutch learning journey

A repo-native, agent-run Dutch practice aimed at Staatsexamen NT2, published on the site. The vocabulary below is this context's ubiquitous language: these words appear in the skill, in Astro schemas, in URLs, and in every conversation about the work. Taxonomy locked by [#82](https://github.com/atilileri/atilileri.github.io/issues/82); the language rule by [#84](https://github.com/atilileri/atilileri.github.io/issues/84); provenance by [#94](https://github.com/atilileri/atilileri.github.io/issues/94); the map is [#74](https://github.com/atilileri/atilileri.github.io/issues/74).

## Language

**Lesson**:
A durable teaching artifact — exposition on one thing, sized to about ten minutes of reading. It contains no prompts and bears no answers. One file, written in Turkish prose, quoting Dutch and English words.
_Avoid_: Explainer, chapter, module

**Session**:
A dated record of one invocation — what was taught, what was asked, and what the learner answered. It is the only form that bears answers. It links to zero or more Lessons, many-to-many.
_Avoid_: Iteration, lesson (when the event is meant), practice log

**Item**:
One lexical or grammatical thing held as sibling fields (`nl` / `tr` / `en`, plus the optional `bridge` and `trap`), in a single central inventory. The unit the scheduler acts on. Never embedded in a Lesson — a Lesson references Items by id.
_Avoid_: Note, card, word, entry

**Direction**:
One of exactly two ways an Item is asked: `recognition` (Dutch → known language) or `production` (known language → Dutch). Each Direction carries its own scheduling state on the Item.
_Avoid_: Card — the word is banned, because it invites storing the derived thing as a record of its own.

**Rung**:
The position of one Direction on the interval ladder — an integer from 1 to 5. It is the only scheduling state stored, beside the date of the last answer. The gap to the next ask is *derived* from the Rung and the Horizon, never stored, so changing the Horizon reschedules the whole inventory without rewriting a row.
_Avoid_: Level (means Tier here), stage, interval, ease

**Horizon**:
The date the learner is studying toward, held as one line in the Plan. It sets every gap below the Mastered Rung, because the best gap is a fraction of the delay you are studying for. It is a declared stand-in when no exam is booked, and it is always a real date — never "none".
_Avoid_: Deadline, target date, exam date

**Mastered**:
The final Rung, 5. A Mastered Direction is never deleted and **never leaves circulation** — it returns on a flat 180-day gap, to confirm the word is still held. An Item counts as Mastered only when both its Directions are. Mastery is losable: a wrong answer costs a Rung.
_Avoid_: Learnt, graduated, retired, done

**Exam task**:
An authored, kept, re-takeable artifact that mimics a real exam task — for example a *Schrijven* writing brief. Distinct from prompt sets, which are generated per Session and stored nowhere but that Session.
_Avoid_: Drill, exercise, quiz, opdracht, task

**Learning Record**:
A rare, decision-grade insight that changes what to teach next. Append-only and supersedable. Format lifted from the `teach` skill.
_Avoid_: Journal entry, note

**Mission**:
The standing one-screen statement of why this journey exists and what counts as arriving.

**Plan**:
The standing, ordered list of Objectives that decides what is taught next, held in one English file. It carries the route and the position on it — nothing else. The locked invocation shape teaches whatever is next in the Plan, dressed in a user-supplied Theme.
_Avoid_: Curriculum, syllabus, track

**Objective**:
One can-do descriptor, taken whole from Taalprofielen — for example *"can read a short, simple factual text about a familiar subject"*. It is never pre-cut into smaller units. It stays `active` across five or more Sessions and carries its own status, Tier, Angles covered, and the list of Sessions that worked it. KNM Objectives come from the eight syllabus themes instead, and carry no CEFR level.
_Avoid_: Goal, can-do, sub-objective, milestone

**Angle**:
The slice of an active Objective that one Session teaches — one grammar point, one register, one text type. An Angle is chosen live, never authored in advance, and is appended to the Objective once spent. Angles run in a stated order: lexicon first, then the same lexicon across Themes, then rising difficulty toward the Tier.
_Avoid_: Sub-objective, step, unit, slice

**Tier**:
How far above the exam an Objective sits. Exactly three values: `exam` (B1, Staatsexamen NT2 Programma I), `stretch` (B2, Programma II), and `knm` (no CEFR level). It is the operational form of the map lock *"a little above exam level"*.
_Avoid_: Level, difficulty, grade

**Glossary**:
The standing record of *metalanguage* the learner has mastered — the terms of the subject (*de/het*, *scheidbaar werkwoord*, *inburgering*), not the lexicon. Admits a term only once it is understood. It lives at `docs/dutch/METATAAL.md` and is written in **Turkish**, because it tells Docent which grammar terms it may use bare in Turkish prose.
_Avoid_: Dictionary, lexicon, vocabulary list — the lexicon belongs to Items.

**Reference**:
A compressed, topic-shaped cheat sheet — a conjugation table, a word-order rule — revised in place rather than written once per Session.

**Profile**:
The standing description of who the learner is — work, life, sport, taste, people, and Dutch so far. Public, current-state, and revised in place. It shapes the colour of every Session; it never decides what is taught.
_Avoid_: Bio, persona, about-me, memory

**Scenario**:
A recurring situation in the learner's life that needs Dutch, held in one library. It links to Plan objectives and carries a register; it never states an objective of its own. A Scenario is never consumed.
_Avoid_: Use-case, situation card, role-play

**Theme**:
The subject a Session is dressed in. It is chosen by a fixed priority — the theme the learner types, then an open intake issue, then a Scenario. A Theme decorates the next Plan objective and never replaces it.
_Avoid_: Topic, context, subject

**Bridge**:
A resemblance that helps — a Dutch word an English or Turkish word already explains. It is an optional field on an Item, written in Turkish prose that quotes the foreign word: *"Hollandaca `vriend` ve İngilizce `friend` kelimeleri aynı kökten gelir."* A Bridge that claims a shared origin cites a source; one that claims only a resemblance needs none.
_Avoid_: Cognate note, hint, mnemonic

**Trap**:
A resemblance that misleads — an intuition from English or Turkish that produces wrong Dutch the learner would not notice. It is an optional field on an Item and names its direction, `en` or `tr`. An Item carries at most one Trap, and a Lesson shows at most three. A difference the learner knows they are guessing at is taught, not a Trap.
_Avoid_: False friend, gotcha, warning, flag

**Docent**:
The single skill that runs this practice, invoked as `/docent`. It teaches, reviews, publishes and assesses; it is the only thing the learner types. Named for the Dutch and English word for a teacher, because it names the role rather than the subject.
_Avoid_: The Dutch skill, the agent, the tutor

**Mode**:
One distinct way Docent runs, chosen from the learner's argument. Exactly four: *Session*, *Review*, *Publish*, *Assess*. Sitting an Exam task is a Session, not a Mode of its own. A Mode is never a git branch.
_Avoid_: Branch (means git here), command, subskill, route

**Provenance**:
Where a Lesson's material came from, held as one optional citation string on the Lesson — a book and chapter, or the Oracle and a date. It is a citation, never a copy. Items carry no Provenance: a word comes from everywhere, and the field would be noise. The string names one of the four homes in [`MATERIAL.md`](./MATERIAL.md), which also holds the form to write for each.
_Avoid_: Source, attribution, reference (the cheat sheet), credit
