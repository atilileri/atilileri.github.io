# Dutch learning journey

A repo-native, agent-run Dutch practice aimed at Staatsexamen NT2, published on the site. The vocabulary below is this context's ubiquitous language: these words appear in the skill, in Astro schemas, in URLs, and in every conversation about the work. Taxonomy locked by [#82](https://github.com/atilileri/atilileri.github.io/issues/82); the language rule by [#84](https://github.com/atilileri/atilileri.github.io/issues/84); provenance by [#94](https://github.com/atilileri/atilileri.github.io/issues/94); the map is [#74](https://github.com/atilileri/atilileri.github.io/issues/74).

**Three skills, not four.** This journey teaches *lezen*, *schrijven* and *luisteren*, plus KNM. **Spreken** is a word the Plan uses and the system does not teach: nothing here judges an accent, so the speaking Objectives sit in the Plan marked `unsupported` and are never selected. Listening rests on human recordings only; generated speech is unused. Locked by [#95](https://github.com/atilileri/atilileri.github.io/issues/95) and recorded in [`adr/0008-speaking-is-out-of-scope.md`](./adr/0008-speaking-is-out-of-scope.md). **Which listening material is admitted, and what a Session makes from it, is [`LISTENING.md`](./LISTENING.md)**, locked by [#97](https://github.com/atilileri/atilileri.github.io/issues/97).

**Where all of it surfaces on the site — which form gets a URL, and for which reader — is [`SITE.md`](./SITE.md)**, locked by [#88](https://github.com/atilileri/atilileri.github.io/issues/88). The site-wide language mechanism it rests on has its own context, [`../site/CONTEXT.md`](../site/CONTEXT.md).

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

**Journey post**:
A blog entry written for a reader rather than for the learner — the one thing Publish Mode
writes. It carries no Items and no Prompts, and it lives in `blog` beside the site's other
posts, tagged `Nederlands`. A post built on a Tekst publishes that Tekst's Dutch alongside
an English and a Turkish version; one built on a Lesson or on a Session's story has no
Dutch to publish. Docent proposes one and the learner confirms it.
_Avoid_: Post (means any blog entry), article, write-up, publication

**Session**:
A dated record of one invocation — what was taught, what was asked, and what the learner answered. It is the only form that bears answers. It links to zero or more Lessons, many-to-many. It holds its own Prompts, and its state — planned, partial or complete — is read off them rather than declared.
_Avoid_: Iteration, lesson (when the event is meant), practice log

**Item**:
One lexical or grammatical thing held as sibling fields (`nl` / `tr` / `en`, plus the optional `bridge`, `hook`, `trap` and `split`), in a single central inventory. It may also carry the pronunciation fields `say` — a link to a human recording on Wikimedia Commons — and `ipa`; they help the learner say the word, not recall it, so they are not Mnemonics. Their format is [`PRONUNCIATION.md`](./PRONUNCIATION.md). The unit the scheduler acts on. Never embedded in a Lesson — a Lesson references Items by id.
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

**Mnemonic**:
Anything held on an Item that helps the learner recall it. Exactly two kinds: a **Bridge**, which tells something true about the word, and a **Hook**, which is invented. It is a grouping word, not a field — each kind is its own field. A Trap is not a Mnemonic: it stops a wrong answer rather than recalling a right one. Study advice a Lesson gives in prose, such as picturing a familiar building, is not a Mnemonic either, because nothing is held on an Item. Nor is a Split, though it is held on an Item: it explains what the word is made of, where a Mnemonic gives recall something to hold on to.
_Avoid_: Memory aid, memory artifact, trick

**Bridge**:
A true fact that helps the learner remember a Dutch word — an English or Turkish word that already explains it, or, for a word with no such relative, the word's own history. It is an optional field on an Item, written in Turkish prose that quotes the foreign word: *"Hollandaca `vriend` ve İngilizce `friend` kelimeleri aynı kökten gelir."* The learner uses a Bridge to remember, not to verify it. Docent takes a shared origin or a history from a source and never makes one up, and it links that source so a learner the story interests can read more; a Bridge that states only a resemblance needs none. A history is offered rather than written for every Item. A Bridge is the Mnemonic that can be wrong.
_Avoid_: Cognate note, hint, etymology note

**Hook**:
An invented Mnemonic — a Dutch word tied to a sound-alike keyword and one scene that joins them. It is an optional field on an Item, written in Turkish prose that quotes the Dutch and the keyword. It claims nothing about either language, so it needs no source and cannot be wrong, only unhelpful. A Hook is distinctive rather than absurd, may use a scene from a show the Profile names but never quotes one, and is offered rather than written for every Item. A true resemblance or a true history is never a Hook; it is a Bridge.
_Avoid_: Keyword, peg, association, story

**Picture**:
One image the Oracle draws of one scene, owned by exactly one thing — a Hook, a Trap, a Lesson, a Tekst or a Clip. It is drawn once and kept with its owner, and drawn again only when the owner changes. The owner's confirmation approves it; it never asks for its own. A Session draws at most three: the learner's request first, then an Item answered wrong, then an Item with no Bridge, then a header. A Picture is never a Mnemonic of its own — the Picture of a Hook is part of that Hook, shows where the Hook shows, and never in a Prompt. A failed Picture leaves its owner complete in text.
_Avoid_: Image, drawing, visual, infographic, card

**Split**:
The parts of a word — each part with its Turkish and English gloss, then the literal sum and the meaning. An optional field on an Item, written once for a word that splits into two or more meaningful parts; a word with one part gets none. Docent reads it whenever the word needs explaining, and a Lesson shows it the first time it introduces the word. It is part of that explanation, never the whole of it, and it is not a Mnemonic. A part spelt differently inside the word is shown as written and the change is stated. Its format is [`SPLIT.md`](./SPLIT.md).
_Avoid_: Breakdown, decomposition, word tree, parse, morphology

**Trap**:
A resemblance that misleads — an intuition from English or Turkish that produces wrong Dutch the learner would not notice. It is an optional field on an Item and names its direction, `en` or `tr`. An Item carries at most one Trap, and a Lesson shows at most three. A difference the learner knows they are guessing at is taught, not a Trap.
_Avoid_: False friend, gotcha, warning, flag

**Docent**:
The single skill that runs this practice, invoked as `/docent`. It teaches, reviews, publishes and assesses; it is the only thing the learner types. Named for the Dutch and English word for a teacher, because it names the role rather than the subject.
_Avoid_: The Dutch skill, the agent, the tutor

**Mode**:
One distinct way Docent runs, chosen by a Flag. Exactly four: *Session*, *Review*, *Publish*, *Assess*, and every one of them writes. Session is the default, so a line with no Flag is a Session. Sitting an Exam task is a Session, not a Mode of its own. A Mode is never a git branch.
_Avoid_: Branch (means git here), command, subskill, route

**Flag**:
A token on the `/docent` line that starts with `--` and chooses what Docent does. Every other token is the Theme, so a Flag can never collide with a Theme. Exactly five: `--session`, `--review`, `--publish`, `--assess` and `--help`; the first four name a Mode and `--help` names none, because it only reads. Each Flag has three spellings — English, Turkish and Dutch — matched case-insensitively with diacritics folded, so `--yardim` reaches `--yardım`. An unrecognised `--flag` refuses and prints the Flag list. Locked by [#140](https://github.com/atilileri/atilileri.github.io/issues/140) and recorded in [`adr/0012-modes-are-flags-the-rest-is-the-theme.md`](./adr/0012-modes-are-flags-the-rest-is-the-theme.md).
_Avoid_: Option, switch, argument (that is the whole line), command, mode (four of five are Modes)

**Help**:
What Docent reports about itself, printed by the `--help` Flag. Two halves in one output: a **Status** half, which is live state read off the Plan, the Items and the inbox, and a **Reference** half, which is the Flag table with generated examples. Help is strictly read-only — it runs no preflight, writes no file and leaves no trace — and it reports a broken journey without repairing it. Help is not a Mode.
_Avoid_: Help mode, status mode, `--help` mode, usage, manual

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
A third party's website Docent checks first when it looks something up **on its own initiative** — without the learner handing it a link — listed as one row in [`AUTOMATION.md`](./AUTOMATION.md) with what the script takes from it. When no listed site answers, another site is fine, by fetch or by a browser script. Docent may offer a new row, and a human confirms it. A link the learner sends, in an Intake or as a Theme, needs no row: it is its own permission, for that one page and what it embeds. Either way the agent never crawls.
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

**NT2 course recording**:
One live class of the NT2 course the learner attends — the teacher's video and everything derived from it, the mp3 and its two transcripts. Named by the date it was taught. It is private material: it shows identifiable people and is never published, and a Lesson never quotes a classmate.
_Avoid_: Lesson (means the durable artifact), les, class video, lecture

**NT2 course supplement**:
Any material the NT2 course teacher hands out beside the recordings — a slide deck for a numbered course unit, or a one-page sheet on one topic. It carries no date, it may arrive before or after the recordings it belongs to, and nothing records which recordings those are: the Oracle finds the match by content. It is the school's material and the paid books', so it is never published; a Lesson may cite it as Provenance and never quotes it.
_Avoid_: Chapter, slides, deck, handout, presentation, attachment
