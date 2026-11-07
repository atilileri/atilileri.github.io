# Dutch learning journey

A repo-native, agent-run Dutch practice aimed at Staatsexamen NT2, published on the site at `/nederlands/`. The vocabulary below is this context's ubiquitous language: these words appear in the skill, in Astro schemas, in URLs, and in every conversation about the work. **This file holds definitions only.** Every rule lives in the `docent` skill at [`.agents/skills/docent/`](../../.agents/skills/docent/SKILL.md), which never reads this file. The decisions are the maps [#74](https://github.com/atilileri/atilileri.github.io/issues/74) (what the system is) and [#154](https://github.com/atilileri/atilileri.github.io/issues/154) (how the skill is made).

**Two skills taught, plus KNM.** The journey teaches *lezen* and *schrijven*, plus KNM. *Luisteren*, *spreken* and *gesprekken voeren* are words the Plan uses and the system does not teach: nothing here judges speech, so those Objectives sit in the Plan as `unsupported`. A Session still listens to one Episode for its words and its meaning. PVT and MAP, the other *inburgering* obligations, are out of scope: neither is a body of knowledge an agent can teach.

## Language

**Docent**:
The single skill that runs this practice, invoked as `/docent`. It runs Sessions and nothing else, and the whole `/docent` line is free text. Named for the Dutch and English word for a teacher, because it names the role rather than the subject.
_Avoid_: The Dutch skill, the agent, the tutor; Mode, Flag

**Session**:
A dated record of one or more invocations — what was taught, what was asked, and what the learner answered. It is the only form that bears answers. It links to zero or more Lessons and holds its own Prompts, and its state — planned, partial or complete — is read off them rather than declared.
_Avoid_: Iteration, lesson (when the event is meant), practice log

**Lesson**:
A durable teaching artifact — exposition on one thing, sized to about ten minutes of reading. It contains no prompts and bears no answers. One file, written in Turkish prose, quoting Dutch and English words. A grammar rule lives in a Lesson.
_Avoid_: Explainer, chapter, module

**Tekst**:
A published practice post built on one short Dutch text — the form the learner reads *in* Dutch, where a Lesson reads *about* Dutch. One file, holding a word list of the Items it uses, the Dutch text, a Turkish gist, and comprehension questions. It is written for a Session whose Objective is a *lezen* one. The method is Delft (a text plus its word list), not parallel text (the same content written twice).
_Avoid_: Reading, article, parallel text, Delft post

**Episode**:
The latest *NOS Journaal in Makkelijke Taal* broadcast on YouTube — the only listening material a Session uses. It teaches words and understanding; it moves no *luisteren* Objective.
_Avoid_: Clip, Body, recording, listening item, video

**Item**:
One lexical or grammatical thing held as sibling fields (`nl` / `tr` / `en`, plus optional teaching fields), in a single central inventory, `docs/dutch/items.yml`. The unit the scheduler acts on. A Lesson references Items by id and never embeds one. Its id is its Dutch word, slugged.
_Avoid_: Note, card, word, entry

**Direction**:
One of exactly two ways an Item is asked: `recognition` (Dutch → known language) or `production` (known language → Dutch). Each Direction carries its own scheduling state.
_Avoid_: Card — the word invites storing the derived thing as a record of its own.

**Rung**:
The position of one Direction on the interval ladder — an integer from 1 to 5. The gap to the next ask is derived from the Rung and the Horizon, never stored.
_Avoid_: Level (means Tier here), stage, interval, ease

**Schedule**:
The churn half of the inventory, `docs/dutch/schedule.yml`, joined to the Items by id. It holds each Direction's Rung, the day it was answered, and whether the last answer was wrong.
_Avoid_: The schedule file, the review file, state, progress

**Mastered**:
The final Rung, 5. A Mastered Direction never leaves circulation — it returns on a long, flat gap. An Item counts as Mastered only when both its Directions are. Mastery is losable.
_Avoid_: Learnt, graduated, retired, done

**Horizon**:
The date the learner is studying toward, held in the Plan. It sets every gap below the Mastered Rung. It is a declared stand-in when no exam is booked, and always a real date.
_Avoid_: Deadline, target date, exam date

**Prompt**:
One thing a Session asks, stored nowhere but that Session and addressed by a positional id — `P1`, `P2`. An `item` Prompt is bound to one Item Direction and moves a Rung; an `open` Prompt is bound to an Objective and moves nothing.
_Avoid_: Question, exercise, quiz item, card

**Verdict**:
The judgement on one answer to an `item` Prompt: `correct`, `close` or `incorrect`. A `close` answer is right in substance and wrong in form, and moves no Rung. An `open` Prompt bears no Verdict, only feedback.
_Avoid_: Score, grade, mark, result, rating

**Plan**:
The standing, ordered list of Objectives that decides what is taught next, with the Horizon — `docs/dutch/plan.yml`. It carries the route and the position on it, nothing else.
_Avoid_: Curriculum, syllabus, track

**Objective**:
One can-do descriptor, taken whole from Taalprofielen — for example *"can read a short, simple factual text about a familiar subject"* — or one KNM eindterm. It carries its skill, Tier, status, the Angles spent and the Sessions that worked it.
_Avoid_: Goal, can-do, sub-objective, milestone

**Angle**:
The slice of an active Objective that one Session teaches — one grammar point, one register, one text type. Chosen live, never authored in advance, and appended to the Objective once spent.
_Avoid_: Sub-objective, step, unit, slice

**Tier**:
How far above the exam an Objective sits: `exam` (B1, Staatsexamen NT2 Programma I), `stretch` (B2, Programma II), or `knm` (no CEFR level). The operational form of *"a little above exam level"*.
_Avoid_: Level, difficulty, grade

**Profile**:
The standing description of who the learner is — work, life, sport, taste, people, and Dutch so far. Public, current-state, and revised in place. It colours every Session; it never decides what is taught.
_Avoid_: Bio, persona, about-me, memory

**Scenario**:
A recurring situation in the learner's life that needs Dutch, held in one library. It holds a Setting and a Register, and nothing else. A Scenario is never consumed.
_Avoid_: Use-case, situation card, role-play

**Register**:
How formally a Scenario is conducted: `informal`, `neutral` or `formal`. A closed set.
_Avoid_: Formality, tone, politeness level, style

**Theme**:
The subject a Session is dressed in, chosen from the `/docent` line and the open Intakes, or picked by Docent — often a Scenario. A Theme decorates the next Plan Objective and never replaces it.
_Avoid_: Topic, context, subject

**Intake**:
An issue the learner files from a phone and labels `docent:intake`. It holds anything about their Dutch life, in any form and any language, and has no format. Docent reads it as an instruction, the same as the text on the `/docent` line.
_Avoid_: Inbox, capture, submission, queue, backlog

**Mnemonic**:
Anything held on an Item that helps the learner recall it. Exactly two kinds: a **Bridge**, which is true, and a **Hook**, which is invented. A grouping word, not a field. A Trap and a Split are not Mnemonics.
_Avoid_: Memory aid, memory artifact, trick

**Bridge**:
A true fact that helps the learner remember a Dutch word — an English or Turkish word that already explains it, or the word's own history. An optional field on an Item, in Turkish prose that quotes the foreign word. The Mnemonic that can be wrong.
_Avoid_: Cognate note, hint, etymology note

**Hook**:
An invented Mnemonic — a Dutch word tied to a sound-alike keyword and one scene that joins them. An optional field on an Item. It claims nothing about either language, so it cannot be wrong, only unhelpful.
_Avoid_: Keyword, peg, association, story

**Trap**:
A resemblance that misleads — an intuition from English or Turkish that produces wrong Dutch the learner would not notice. An optional field on an Item, naming its direction, `en` or `tr`. A difference the learner knows they are guessing at is taught, not a Trap.
_Avoid_: False friend, gotcha, warning, flag

**Split**:
The parts of a word — each with its Turkish and English gloss, then the literal sum and the meaning. An optional field on an Item, for a word with two or more meaningful parts. Part of a word's explanation, never the whole of it, and not a Mnemonic.
_Avoid_: Breakdown, decomposition, word tree, parse, morphology

**Picture**:
One image the Oracle draws of one scene, owned by exactly one thing — a Hook, a Trap, a Lesson or a Tekst. It is the only artifact derived from a text, and never a Mnemonic of its own.
_Avoid_: Image, drawing, visual, infographic, card

**Oracle**:
The `OracleDutch` collection of NotebookLM notebooks, holding the course books, the practice exams and the listening corpus — the shelf this repo may not hold. A source, never a planner.
_Avoid_: NotebookLM, Gemini Notebook (each names the product, not the role), knowledge base, RAG, the notebooks

**Scratch notebook**:
The one notebook in the Oracle a Session may write to, emptied when that Session ends. Everything else in the collection is curated by the learner alone.
_Avoid_: Sandbox, temp notebook, workspace, staging

**Machine credential**:
A secret that lives on this machine and never in this repo — exactly two: the Oracle's login state and the `gh` login. Every capability it opens degrades when it is missing.
_Avoid_: Secret, key, token (each names one instance, not the class), config
