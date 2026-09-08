# The Oracle

What the Oracle is, what Docent may ask it, and what Docent may never let it decide.
Locked by [#134](https://github.com/atilileri/atilileri.github.io/issues/134).

**This file records choice, not capability.** What is on the shelf is
[`ORACLE-INVENTORY.md`](./ORACLE-INVENTORY.md). What Docent is allowed to reach at all is
[`AUTOMATION.md`](./AUTOMATION.md), which lists the Oracle as a Named target.

## What it is

The Oracle is the `OracleDutch` collection of Gemini Notebook (NotebookLM) notebooks, holding the
course books, the practice exams and the listening corpus. **It is the shelf this repo may not hold.**
[#94](https://github.com/atilileri/atilileri.github.io/issues/94) rules that purchased material never enters
the repo; the Oracle is where it lives instead.

It is **a source, never a planner.** [#85](https://github.com/atilileri/atilileri.github.io/issues/85) fixes
the route: the Plan says *which* Objective, and the Oracle at most proposes *which* Angle. Docent and the
learner decide together. The Oracle decides nothing.

## The twelve jobs

Each job is a question Docent asks. None of them is a decision.

| # | Job | Example |
| --- | --- | --- |
| 1 | Single-source lookup | *What does Nederlands in gang say about `de` and `het`?* |
| 2 | Cross-source extraction | *List the A2 to B1 topics in Nederlands in actie.* |
| 3 | Self-inventory | *What sources exist, and what does each cover?* |
| 4 | Synthesis | *How do Dutch greetings differ, formal against informal?* |
| 5 | Grammar explanation | The explanation a Lesson needs, grounded in a book. |
| 6 | Next-topic advice | *I have covered a, b and c. What is a good next grammar topic?* |
| 7 | Angle proposal | Which Angle to spend on the Objective the Plan already chose. |
| 8 | Vocabulary proposal | Which words belong with this topic, at this Tier. |
| 9 | Material selection | *Which recording suits a Session about football, at B1?* |
| 10 | Exam-task supply | An NT2 or DUO task that matches this Objective. |
| 11 | Level judgement | *Does this text resemble a B1 exam task?* |
| 12 | Cross-notebook verification | Take a claim from one notebook and check it in another. |

**Job 3 is a structured call, never a question.** `collection notebooks` and `metadata` return the real shelf.
Asking the chat what sources exist invites an invented answer.

**Job 6 advises inside the Plan, never against it.** The Plan holds the route.

**Job 11 is a weak signal.** The Oracle may say a text resembles a B1 task. It never certifies a level.
[#95](https://github.com/atilileri/atilileri.github.io/issues/95) keeps the honest limit.

## Two primitives

Measured on 2026-09-06, on this machine:

| Primitive | Cost | Trust |
| --- | --- | --- |
| `source search` | **3.8 s** | Returns the raw indexed passage. No model in the loop, so it cannot invent. |
| `ask` | **36 s** | Passes through a model. Grounded and cited, but it can still be wrong. |

**Search first; ask only for judgement.** A retrieval job — find the recording, find the passage, find the
exam task — uses `source search`, because a passage is evidence and a summary is a claim. A synthesis or
advice job — 4, 6, 7 and 11 — uses `ask`.

**Budget: at most three `ask` calls in a Session**, about two minutes. Searches are unlimited.

## When Docent asks

**Session and Assess may ask. Review and Publish may not.** Review works over Items already taught, and
Publish only formats what exists, so neither needs the shelf.

Inside a Session the Oracle is consulted **at one point: after the Plan has chosen the Objective, and before
the Lesson is written.** One consultation, not a habit sprinkled through the hour. That keeps the cost
predictable and stops the Oracle steering a Lesson mid-flight.

`source search` is exempt. At two to four seconds it costs less than many file reads, so Docent searches
whenever a passage would settle a question.

## The language of a question

**Docent asks in English.** [#84](https://github.com/atilileri/atilileri.github.io/issues/84) decides it: an
artifact the agent reads is English. An English question also leaves the Dutch quotations intact, which is what
the check below needs. Turkish appears later, when Docent writes the Lesson.

**One exception:** when the named source is one of the three Turkish-mediated books, Docent asks in Turkish,
because the question then matches the book's own wording.

The notebook's own answer-language setting is left alone.

## How Docent addresses it

- **Resolve membership through the `OracleDutch` collection**, with `collection notebooks OracleDutch`. The
  account holds unrelated notebooks, and a collection is a real container the API expands — so membership is a
  fact the learner controls in the interface, never a guess made from a title. **A name prefix is not the
  mechanism**, and Docent must not rely on one.
- **Address with `-n <id>`. Never use `notebooklm use`,** which is stateful and would let two Sessions collide.
- **Pass `--quiet`,** or the CLI prints a `Matched: …` banner into stdout and breaks JSON parsing.
- **Resolve a family to a set of notebooks, never to one.** The 100-source cap splits a family.

## The chat context is fresh every Session

**Docent clears the conversation and starts fresh.** It keeps a `conversation_id` only for a genuine
multi-turn question, and only inside one Session. It never carries one across Sessions.

The Session's memory is the Plan and the Item inventory — both committed, both public, both reviewable. A
notebook chat would be a **second memory that is private, unversioned and invisible**, and it would drift out
of step with the first. A stale turn silently steers the next answer, and nobody could see why.

Fresh context also makes an answer **reproducible**: the same question over the same sources gives the same
answer, which is what makes the citation check below mean anything. History that matters belongs in the
Session record, which is public.

## What may reach the learner

**Docent checks a claim, then teaches it in its own words.** Every answer returns its source id and the
verbatim passage, so the check is mechanical rather than trusting: read the citation and confirm its source id
is the book Docent asked about. An uncited claim may steer Docent's own choice, but it never becomes taught
content.

**The passage is never published.** Docent uses what the advice *says* and writes the Lesson itself, in
Turkish. A Lesson quoting extracts from a copyright book stops being the learner's own work, and the citation
exists so **Docent** can check the claim, not so the learner can read the book.

**Provenance is a mark, not a paragraph.** The Session record carries the smallest possible reference — a
superscript number or star, whose hover text reads `Oracle: Nederlands in gang, ch. 7, 2026-09-08`, in the
form fixed by [`MATERIAL.md`](./MATERIAL.md). A reader who owns the book can follow it; everyone else sees a
mark and reads on.

## How advice is checked

Jobs 6, 7, 8 and 11 quote nothing, so the citation rule cannot reach them. They are checked against state
instead.

**An advisory answer must name the state it claims to act on** — the Objective it applies to, the Tier it
assumes, and the Angles it believes are already spent. Docent checks those three against `PLAN.md` before the
proposal reaches the learner.

**A wrong premise discards the proposal, with no retry.** Advice built on a wrong Objective is worthless, and
asking again spends 36 seconds to obtain a differently wrong answer. The Session record names the discard in
one line.

**When the Oracle and the Plan disagree, the Plan wins, silently.** The Session record names the disagreement
in one line. There is no arbitration and no retry.

**Ask the Oracle nothing that a committed file answers.** Taalprofielen, the KNM eindtermen, the frequency
ranking and the cognate list are in this repo. A file read is exact and free.

## Who writes to it

Two roles, one tool.

- **The learner curates.** Adding the books, the exams and the transcripts, renaming, deleting, and preparing
  the collection are the learner's acts. Preparing a notebook for the skill is curation, not a Session write,
  so it needs no gate here.
- **A Session writes only to the `scratch` notebook,** and it empties that notebook when it finishes. So an
  experiment can never damage the shelf, and scratch never quietly becomes a family of its own. The write
  leaves the machine, so [#130](https://github.com/atilileri/atilileri.github.io/issues/130)'s gate applies
  and the learner confirms it.

**Docent never repairs the shelf.** When it finds a gap it names the gap in the Session record and teaches
around it — the degrade rule of [`AUTOMATION.md`](./AUTOMATION.md), applied to missing material.

## Reading a video through the Oracle

A Session may add a YouTube URL to `scratch`, let Google transcribe it, search the passages, and
then delete it. That reads a video without this repo ever touching YouTube, and `AUTOMATION.md` already admits
the Oracle as a Named target. This is one of the routes
[#141](https://github.com/atilileri/atilileri.github.io/issues/141) measures.

## When it fails

The Oracle is a Named target with a Machine credential, so `AUTOMATION.md` binds it: **the Session still
teaches.** Docent names in one line what it could not reach. Nothing retries by itself. When the credential
dies, Docent asks the learner for one named action — a login — and moves on.
