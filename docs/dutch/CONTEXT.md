# Dutch learning journey

A repo-native, agent-run Dutch practice aimed at Staatsexamen NT2, published on the site. The vocabulary below is this context's ubiquitous language: these words appear in the skill, in Astro schemas, in URLs, and in every conversation about the work. Taxonomy locked by [#82](https://github.com/atilileri/atilileri.github.io/issues/82); the language rule by [#84](https://github.com/atilileri/atilileri.github.io/issues/84); provenance by [#94](https://github.com/atilileri/atilileri.github.io/issues/94); the map is [#74](https://github.com/atilileri/atilileri.github.io/issues/74).

**Three skills, not four.** This journey teaches *lezen*, *schrijven* and *luisteren*, plus KNM. **Spreken** is a word the Plan uses and the system does not teach: nothing here judges an accent, so the speaking Objectives sit in the Plan marked `unsupported` and are never selected. Listening rests on human recordings only; generated speech is unused. Locked by [#95](https://github.com/atilileri/atilileri.github.io/issues/95) and recorded in [`adr/0008-speaking-is-out-of-scope.md`](./adr/0008-speaking-is-out-of-scope.md). **Which listening material is admitted, and what a Session makes from it, is [`LISTENING.md`](./LISTENING.md)**, locked by [#97](https://github.com/atilileri/atilileri.github.io/issues/97).

## Language

**Lesson**:
A durable teaching artifact — exposition on one thing, sized to about ten minutes of reading. It contains no prompts and bears no answers. One file, written in Turkish prose, quoting Dutch and English words.
_Avoid_: Explainer, chapter, module

**Tekst**:
A published practice post built on one short Dutch text — the form the learner reads *in* Dutch,
where a Lesson reads *about* Dutch. One file, never a set of translations. It holds, in this order,
a word list of the Items it uses, the Dutch text, a Turkish gist of two or three sentences, and
comprehension questions in Turkish. It introduces at most ten new words, which is one Session's
new-Item budget. Docent writes it as a by-product of a Session whose Objective is a *lezen* one, so
it inherits that Session's Theme and never picks a subject of its own. The Dutch is written by the
agent and carries no marker; see [`adr/0010`](./adr/0010-published-dutch-is-unmarked.md).
_Avoid_: Reading, article, parallel text, Delft post — the method here is Delft (a text plus its
word list), not parallel text (the same content written twice).

**Session**:
A dated record of one invocation — what was taught, what was asked, and what the learner answered. It is the only form that bears answers. It links to zero or more Lessons, many-to-many. It holds its own Prompts, and its state — planned, partial or complete — is read off them rather than declared.
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

**Prompt**:
One thing a Session asks. It is generated when the Session is planned, stored nowhere but that Session, and addressed by a positional id — `P1`, `P2` — so it can be answered from a phone keyboard. It has exactly two types: an `item` Prompt is bound to one Item Direction and moves a Rung, an `open` Prompt is bound to an Objective and moves nothing.
_Avoid_: Question, exercise, quiz item, card

**Verdict**:
The judgement on one answer to an `item` Prompt, from a closed set of three: `correct`, `close` and `incorrect`. A `close` answer is right in substance and wrong in form — a misspelling — and moves no Rung. An `open` Prompt bears no Verdict, only prose feedback, because a written paragraph has no right answer.
_Avoid_: Score, grade, mark, result, rating

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

**Intake**:
An issue the learner files from a phone and labels `docent:intake`. It holds anything about their Dutch life,
in any form and any language — a photo of a sign, a story from the day, a wish about what to study, a few typed
words. It has no format. Docent reads every open one in the preflight, media included, and offers them; it is
consumed over one or more Sessions and closes only on the learner's confirmation.
_Avoid_: Inbox, capture, submission, queue, backlog

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

**Body**:
One whole source folder of listening material — `eenbeetjenederlands/`, `DUO oefenexamens NT2/`. It is the unit an admission verdict judges, and the verdict is written once in [`LISTENING.md`](./LISTENING.md) and does not change. Level is never a Body's property, because one Body spans several levels.
_Avoid_: Source (means the citation), collection, corpus, feed

**Clip**:
One recording the learner listens to, with its transcript — a whole file, or a **stated time range** inside one, named off the transcript's `[mm:ss]` marks. It is the unit a Session points at, and its level is judged live and stored nowhere. Audio is never cut to make one.
_Avoid_: Listening item (the word Item is taken and means one lexical thing), track, episode, segment, excerpt

**Register**:
How formally a Scenario is conducted, held on the Scenario as one of exactly three values: `informal` (`je`; friends, teammates, a market stall), `neutral` (`je` or `u`; a shop, a class, a stranger) and `formal` (`u`; official letters, a doctor, a bank). A closed set, so Docent chooses a value rather than inventing one.
_Avoid_: Formality, tone, politeness level, style

**Named target**:
A third party's website a script is allowed to reach, listed as one row in [`AUTOMATION.md`](./AUTOMATION.md) with what the script takes from it. The list is closed and a human adds to it; the agent reaches nothing else and never crawls. Two exist: the Oracle and `nos.nl`.
_Avoid_: Allowed site, whitelist entry, scrape target, integration

**Machine credential**:
A secret that lives on this machine and never in this repo — the rclone token and the Oracle's login state. It is not an artifact, so the publicness lock does not reach it, but every capability it opens must degrade: with the credential missing the Session still runs and Docent names what it could not reach.
_Avoid_: Secret, key, token (each names one instance, not the class), config

**Oracle**:
The `OracleDutch` collection of Gemini Notebook notebooks, holding the course books, the practice exams and the listening corpus with its text — the shelf this repo may not hold. It is **a source, never a planner**: it answers and it proposes, and the Plan still holds the route. Docent resolves its membership through the collection, never through a name prefix. What it holds is [`ORACLE-INVENTORY.md`](./ORACLE-INVENTORY.md); what Docent may ask it is [`ORACLE.md`](./ORACLE.md).
_Avoid_: NotebookLM, Gemini Notebook (each names the product, not the role), knowledge base, RAG, the notebooks

**Scratch notebook**:
The one notebook in the Oracle a Session may write to, emptied when that Session ends. Everything else in the collection is curated by the learner alone. The split exists so an experiment can never damage material that was paid for.
_Avoid_: Sandbox, temp notebook, workspace, staging
