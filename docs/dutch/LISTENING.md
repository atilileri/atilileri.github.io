# Listening: which material we use, and what a Session makes from it

The policy for *luisteren*. What material is admitted, how a level is judged, what Docent
generates from a recording, and how a Session points at it.

Locked by [#97](https://github.com/atilileri/atilileri.github.io/issues/97) under map [#74](https://github.com/atilileri/atilileri.github.io/issues/74).
The facts behind it — what exists, what landed, how long each thing runs — are in
[`LISTENING-INVENTORY.md`](./LISTENING-INVENTORY.md), which records facts and no choices.
What the machine can read, and at what cost, is [`READING-MATERIAL.md`](./READING-MATERIAL.md).
This file holds the choices.

## Two gates, and the cheap one first

A **Body** is one whole source folder. A **Clip** is one recording, or a stated time range
inside one, with its transcript. Both words are in [`CONTEXT.md`](./CONTEXT.md).

1. A **Body** is admitted once, and the verdict is written here. It does not change.
2. A **Clip** is judged at the moment a Session wants it, for level and fit. That verdict
   is never stored.

A body admission is stable. A clip verdict is not, so storing it would only let it drift.

## What a Body must pass

Four criteria, all measurable today:

1. **The agent can read text about it** — a transcript, or the source's own page.
2. **The voice is a human recording.** Generated speech is banned from this journey
   ([#95](https://github.com/atilileri/atilileri.github.io/issues/95),
   [`adr/0008`](./adr/0008-speaking-is-out-of-scope.md)).
3. **The transcript is reliable.** A body whose transcripts carry an `UNRELIABLE` header
   fails here.
4. **No identifiable private person is recorded.**

**Level is not a body criterion.** One body spans several levels, so level belongs to the
Clip.

### The admitted bodies

| Body | Drive folder | Verdict | Quoted Dutch? |
| --- | --- | --- | --- |
| Een Beetje Nederlands | `dutch-listening/eenbeetjenederlands/` | **In** | **Yes** — 87 human transcripts |
| Zeg het in het Nederlands | `dutch-listening/zeg-het-in-het-nederlands/` | **In** | No — machine transcripts only |
| NOS Jeugdjournaal | `dutch-listening/nos-jeugdjournaal/` | **In** | No |
| Echt Gebeurd | `dutch-listening/echt-gebeurd/` | **In** | No |
| LibriVox Dutch | `dutch-listening/librivox-nl/` | **In, limited** — see below | **Yes** — the Project Gutenberg e-text |
| DUO practice exams | `DUO oefenexamens NT2/` | **In** — and they are Exam tasks, see below | **Yes** — the exam paper |

**LibriVox carries a limit.** Its language is literary and pre-1930, and the exam is about
everyday life. So it serves *lezen* Items and listening **exposure**, and never stands as
the material behind a *luisteren* Objective aimed at the exam. Its worth is the exact text,
not the register.

### The excluded bodies

| Body | Why it fails |
| --- | --- |
| Goethe `book2` TR-NL | Criterion 3 — the transcripts carry `# UNRELIABLE for Dutch` |
| `30 Günde Hollandaca` | Criterion 3 — word drills with no sentence context; both passes read poorly |
| NT2 Taaldiensten class recordings | Criterion 4 — identifiable people, and never transcribed |

### Admitting a new Body

Docent applies the four criteria and **proposes** the verdict. The learner confirms before
a row enters the table above. Docent never extends this list on its own — the same rule
[#130](https://github.com/atilileri/atilileri.github.io/issues/130) set for a Named target
and [#121](https://github.com/atilileri/atilileri.github.io/issues/121) set for a label.

## Judging a Clip's level

The Oracle places a Dutch text on the CEFR ladder. It scored **30 of 36** on certified DUO
exam transcripts, and **five of its six errors called a B1 text B2** — too hard, the cheap
mistake. Measured on [#141](https://github.com/atilileri/atilileri.github.io/issues/141),
which holds the full evidence.

The rules Docent follows, in order:

1. **Check the language before the level.** Below about **0.6 coverage of the top 2,000
   Dutch words**, the transcript is not Dutch. One video titled *NEDERLANDS leren B1
   Luisteren* returned English prose, and nothing else revealed it.
2. **Rename the source neutrally, then ask.** A title or header that declares a level pulls
   the answer toward it. A calibration run scored 36 of 36 and was worthless, because every
   machine transcript header names `Luisteren I` or `Luisteren II`.
3. **Ask about the source; never paste the transcript.** `ask` rejects a prompt past roughly
   140 words.
4. **Ask once.** A repeat never rescued a wrong answer.
5. **Ignore the `CONFIDENCE` field.** It read `high` on all 36 runs, including the six wrong
   ones.
6. **Read the answer as a band** — at or below B1, against above B1.
7. **Try up to five candidates before recommending nothing**, stopping at the first that
   passes every check. The usual case costs under a minute.

**The blind judgement wins, and a declared level never reaches the Oracle.** Where a source
declares one, the Session records it as a **claim** beside the verdict. One exception: a
**DUO exam clip carries a certified level** set by the exam board — trust it, and make no
Oracle call.

**Admissible bands are A2, B1 and B2.** Reject A1 and anything above B2. Prefer the
Objective's own Tier — B1 for `exam`, B2 for `stretch`.

Judge live and store nothing. A judgement costs about 14 seconds, which is cheaper than a
state file that can go stale.

## Finding a candidate

Three routes, in order, stopping at the first that answers:

1. **Ask the Oracle.** It indexes the same Drive files and searches their content
   ([#134](https://github.com/atilileri/atilileri.github.io/issues/134)).
2. **Read the filenames and [`DRIVE-INVENTORY.md`](./DRIVE-INVENTORY.md).** Both are in this
   repo, so this route needs no network. Filenames describe themselves
   ([#138](https://github.com/atilileri/atilileri.github.io/issues/138)).
3. **Download one transcript, once a candidate is named**, and read it whole — the questions
   and the time range come out of it.

**The transcripts are never mirrored into this repo.** Third-party text stays in Drive
([#94](https://github.com/atilileri/atilileri.github.io/issues/94)).

An Oracle proposal must carry three verifiable fields: a **source Docent can confirm
exists**, a **stated reason it fits the active Objective and Theme**, and the **Body** it
belongs to. Docent then runs the checks above itself and never takes the Oracle's level on
trust. A proposal that fails a check is dropped. When nothing passes after five candidates,
the Session states that as a limitation.

## What a Session makes from a Clip

Three outputs, and no new form:

1. **Prompts** — at least three comprehension questions in Turkish, per #95 rule 3. They
   bind to the active *luisteren* Objective as `open` Prompts.
2. **Items** — the new words the Clip carries, inside the Session's ten-word budget.
3. **Nothing durable.**

**There is no listening counterpart of Tekst.** A public page carrying the audio's own text
turns a listening task into a reading task.

### Pitch the task, never the material

We cannot re-record audio, so adaptation can only mean adapting the **task**. A Clip above
the Tier gets a **gist** task. A Clip below it gets a **detail** or **production** task. The
source is never altered.

### The dose, and the time range

A machine transcript carries `[mm:ss]` segment marks, so a Clip may be a **stated time
range** — *"listen from 04:20 to 07:10"*. **Audio is never cut, and nothing is written to
Drive.**

- **In-Session listening: about three to five minutes**, when *luisteren* is the primary or
  the secondary Objective. Most podcast episodes run 12 to 21 minutes, so a range is the
  normal case, not the exception.
- **One after-Session Clip on every Session**, with its three questions, answered through
  the `docent:answer` loop ([#99](https://github.com/atilileri/atilileri.github.io/issues/99)).
  It may come from the web or from Drive. The one hard requirement is that the learner can
  open it on the phone they answer from; prefer a public source, so a stranger reading the
  Session can follow it.

**Two Clips per Session at most.**

### Exposure is not depth

The after-Session Clip's Prompts bind to the active *luisteren* Objective, and the Session
**appends no Angle** to it and **does not enter its Session list**. So
[#85](https://github.com/atilileri/atilileri.github.io/issues/85)'s rule — one primary
Objective plus at most one secondary — still describes what a Session **teaches**.

### When no Clip fits the Theme

**Objective and level win; the Theme yields.** A Theme decorates the next Plan Objective and
never replaces it. Docent picks on Objective and band, then **states in the Session that the
Clip is off-theme**. It never stretches a bad Clip to fit a Theme.

## What a machine transcript may and may not do

The full reasoning is [`adr/0011`](./adr/0011-a-machine-transcript-selects-never-teaches.md).
In short: Whisper recovered **96.1%** of words, so about one word in twenty-five is wrong,
and nothing here can hear the difference.

- A machine transcript **selects** material, judges its level, fixes the time range, and
  carries the **gist** a question asks about.
- A new **Item** may come from a machine transcript **when the word appears in
  [`sources/frequency-nl-50k.txt`](./sources/frequency-nl-50k.txt)**. A word that fails the
  check is dropped, never guessed at.
- A machine transcript **never** supplies a Dutch **sentence** the learner reads as correct
  Dutch.
- A question **never hinges on one number, name, or word said once**. Ask about the gist, the
  speakers, the sequence, or a fact stated more than once. Where a **human** transcript
  exists, this restriction lifts.

Quoted Dutch comes from a **human transcript**, the **source's own page**, or an **exam
paper**.

## How much Dutch a public Session may quote

**One or two sentences per question, and never the whole transcript.** The licence gate is
gone — [#94](https://github.com/atilileri/atilileri.github.io/issues/94) put third-party
compliance with the learner — so this cap stands on two other reasons: the full text defeats
the listening task, and a page reproducing a podcast episode is a copy whatever the licence
position.

## The link format

A Clip in a Session reuses the **Provenance** convention in
[`MATERIAL.md`](./MATERIAL.md). No second convention is invented. Four things:

1. **The title and the duration**, or the time range.
2. **The public original as a link**, where one exists.
3. **The working copy** as a `Drive: <folder>/<file>` string, and optionally as a Drive link.
   Whether a given reader is authorised is the learner's business, not this system's.
4. **The judged band, beside the declared claim.**

Where a source has no public original — the captured exam clips — the `Drive:` string stands
alone and the Clip says the material is not public.

### Staleness

**Nothing repairs a dead link.** A Session is a dated record and is never rewritten, the same
rule that keeps a Verdict honest
([`adr/0007`](./adr/0007-answers-are-verbatim-and-flagged-never-edited.md)). The questions
stand, because they came from the transcript, and the Provenance string states what the
material was and where it lived on that date. An Item carries no Provenance, so nothing
downstream breaks.

## The DUO papers are Exam tasks, not Session material

Each `Luisteren` folder holds short certified clips — one runs 36 seconds — beside an
`opgavenboekje.pdf` with the **official questions** and a `beoordelingsmodel.pdf` with the
**official answers**. That is a different thing from a podcast episode.

**A DUO Luisteren set with its official questions is an Exam task** — authored, kept,
re-takeable, and markable against the `beoordelingsmodel`. Sitting one is a Session, not a
Mode ([#86](https://github.com/atilileri/atilileri.github.io/issues/86)).

The pool is **six papers**: 2023, 2024 and 2025 × Programma I and II, over 291 deduplicated
clips. Programma I is B1 (`exam`); Programma II is B2 (`stretch`).

Two rules for them:

- **Docent never invents questions for a DUO clip that has official ones.** For the podcast
  bodies it writes its own three Turkish questions.
- **The official Dutch questions are kept verbatim.** The exam is in Dutch and the point is
  to rehearse the real thing, so rewriting them in Turkish would make a different task. This
  is a narrow, stated deviation from
  [`adr/0002`](./adr/0002-turkish-prose-quoted-english.md), limited to authored Exam tasks.
  Docent's own questions stay Turkish.

**This does not break #95 rule 8.** That rule stops self-marking of **speech**, where no
judge exists. A listening answer has one right answer, so the official model may mark it.
