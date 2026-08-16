# Existing skills audit for the Dutch learning journey

**Question:** Which of this repo's existing skills (`.claude/skills/`) can be reused, wrapped, or adapted for the Dutch learning journey (map [#74](https://github.com/atilileri/atilileri.github.io/issues/74)), and where does each one fall short?

**Ticket:** [#75](https://github.com/atilileri/atilileri.github.io/issues/75)

**Date:** 2026-08-16

**Method:** every file under `.agents/skills/` was read in full from disk — 79 files, 26 skills. Nothing here is summarised from a skill description. Paths are relative to the repo root; line numbers are from the files as of commit `d3dcf3a`.

---

## TL;DR verdict

**Write fresh, and steal from `teach` deliberately.** Not "reuse as-is", not "fork the folder", not "wrap".

Three findings force this, in descending order of hardness:

1. **You cannot fork `teach` in place.** `.claude/skills/*` are all symlinks into `.agents/skills/*` (`.claude/skills/teach -> ../../.agents/skills/teach`), and every one of those 26 folders is vendored from `mattpocock/skills` and pinned by `computedHash` in `skills-lock.json` (`skills-lock.json:100-105` for `teach`). Commit `586f555` ("update mat skills v1.2.0") rewrote 30 vendored files and the lock in one go. Editing `.agents/skills/teach/` is editing vendor code that the next update overwrites. A new skill for this journey must be a **real directory at `.claude/skills/<name>/`**, beside the symlinks and absent from `skills-lock.json`.
2. **`teach`'s workspace contract collides with the Astro site at the root.** `teach` says "Treat the current directory as a teaching workspace" (`.agents/skills/teach/SKILL.md:12`) and then claims root-level `MISSION.md`, `RESOURCES.md`, `NOTES.md`, `./reference/`, `./learning-records/`, `./lessons/`, `./assets/` (`SKILL.md:14-20`). The repo root is an Astro site (`astro.config.mjs`, `src/content.config.ts`); `./assets/` and `./lessons/` mean nothing to Astro's build, which serves `public/` verbatim and processes `src/` (`README.md`, "Project Structure").
3. **`teach` contradicts the map's invocation lock outright.** Map #74 locks "topic is a *theme*, never a curriculum override". `teach` says the opposite in one sentence: "**The user may specify an exact thing they want to learn.** If they don't, figure out their zone of proximal development" (`SKILL.md:85`), reinforced by `argument-hint: "What would you like to learn about?"` (`SKILL.md:5`). That is a one-line inversion — but it is the *hinge* of the whole skill's next-topic logic, so it cannot be patched by an argument convention alone.

What survives and should be lifted wholesale: the philosophy section (fluency vs storage strength, retrieval practice, spacing, interleaving — `SKILL.md:34-45`), the knowledge-vs-skills split (`SKILL.md:91-110`), the reference-document idea (`SKILL.md:122-136`), the learning-record format (`LEARNING-RECORD-FORMAT.md` in full), and the equal-length-answers quiz rule (`SKILL.md:110`). That is roughly half of `teach` by weight and all of its actual insight.

---

## 1. `teach` in detail

### 1.1 The workspace contract

Declared at `.agents/skills/teach/SKILL.md:10-20`. Seven state locations, all relative to the current directory:

| Location | Purpose (per `SKILL.md`) | Format doc |
|---|---|---|
| `MISSION.md` | The *reason* the user is learning; grounds all teaching | `MISSION-FORMAT.md` |
| `RESOURCES.md` | Curated trusted sources, split Knowledge / Wisdom | `RESOURCES-FORMAT.md` |
| `./reference/*.html` | Compressed cheat sheets, "beautiful documents which print out well" | — (no format doc) |
| `./learning-records/*.md` | ADR-style records of what was learned; drives zone of proximal development; `0001-<dash-case-name>.md` | `LEARNING-RECORD-FORMAT.md` |
| `./lessons/*.html` | The primary unit of teaching; `0001-<dash-case-name>.html` | — (rules live in `SKILL.md:47-61`) |
| `./assets/*` | Reusable components shared across lessons | — (rules at `SKILL.md:63-69`) |
| `NOTES.md` | Scratchpad for user preferences | — (`SKILL.md:138-140`) |

**An eighth artifact exists, reached by a weaker wire.** `.agents/skills/teach/GLOSSARY-FORMAT.md` specifies a root `GLOSSARY.md` and is a genuinely good document — "add a term only when the user understands it", "be opinionated", aliases-to-avoid (`GLOSSARY-FORMAT.md:29-30`).

Note the convention this folder uses: **each `XYZ-FORMAT.md` is the generator spec for a workspace artifact `XYZ.md`**, and each opens with the identical shape — `# X.md Format`, then a line declaring what the artifact is and where it lives (`MISSION-FORMAT.md:1-3`, `RESOURCES-FORMAT.md:1-3`, `GLOSSARY-FORMAT.md:1-3`). `GLOSSARY-FORMAT.md:3` declares `GLOSSARY.md` "the canonical language for this teaching workspace. All explainers, exercises, and learning records should adhere to its terminology." So the glossary is a **first-class workspace artifact**, on the same footing as `MISSION.md` and `RESOURCES.md`.

It is reachable, and in a **stateful** skill that matters: `LEARNING-RECORD-FORMAT.md:41` cites `[[GLOSSARY.md]]` in its disqualifier list, and that format doc is read every time a learning record is written — a routine, recurring event across sessions. The wire is real.

What is true is narrower: `GLOSSARY.md` is **omitted from the workspace table** at `SKILL.md:14-20` that lists the other seven locations, so a session that never writes a learning record may not discover it. That is weaker discoverability, not death. **For a language journey it is the most important artifact in the folder** — vocabulary *is* the subject, not a side artifact — so the new skill should promote it to the top-level workspace list rather than leave it to be found sideways.

Frontmatter: `disable-model-invocation: true` (`SKILL.md:4`) — `teach` is user-invoked, and the interface file confirms it (`.agents/skills/teach/agents/openai.yaml:5`, `allow_implicit_invocation: false`). That part matches the map's `/<dutch-skill> …` invocation shape exactly.

### 1.2 The lesson format

`SKILL.md:47-61`. One lesson = one **self-contained HTML file** in `./lessons/`, numbered `0001-…`. Required properties, each one a design constraint you inherit if you keep the format:

- Beautiful, Tufte-ish typography, because the user returns to review (`:51`).
- Short, inside working memory, one tangible win, tied to the mission, inside the zone of proximal development (`:53`).
- Opened for the user by a CLI command "if possible" (`:55`).
- Linked by HTML anchors to other lessons and reference documents (`:57`).
- Recommends one high-trust primary source (`:59`).
- Contains a reminder to ask the agent follow-up questions (`:61`).

Lessons are built from reusable components in `./assets/` — "Reuse is the default, not the exception… never inline code a future lesson would duplicate", with a shared stylesheet as the first component every workspace earns (`SKILL.md:63-69`).

### 1.3 Where it conflicts with map #74's locks

Five conflicts, ordered by how expensive they are to fix.

**(a) Standalone HTML lessons vs Astro content collections — structural.**
`teach` writes `./lessons/0001-x.html` with its own stylesheet in `./assets/` (`SKILL.md:49`, `:65-69`). This repo renders content through Astro Content Collections with Zod schemas — `blog`, `garden`, `projects`, `sports`, each a `glob({ pattern: "**/*.{md,mdx}" })` loader over `src/content/<name>/` (`src/content.config.ts:1-60`). A raw HTML file in `./lessons/` is invisible to that pipeline: it is not in `public/` (so not served verbatim), not in `src/pages/` (so not routed), and not `.md`/`.mdx` (so not collectable).
Note the site *does* have precedent for hand-built, styled, non-collection pages: `src/pages/decks/asml-ai/index.astro` ships beside its own `theme-asml.css`, and `reveal.js` is a direct dependency (`package.json`). So "a rich interactive lesson page" is achievable here — but as an `.astro` page or an MDX entry in a collection, **not** as `teach`'s free-floating HTML. Either way the numbering scheme, the `./assets/` component library, and the "open it with a CLI command" step (`SKILL.md:55`) are all wrong for this repo.

**(b) Monolingual vs TR+EN — total absence, not a mismatch.**
Grepped the entire `teach` folder for `language|translat|bilingual`: the only hits are `GLOSSARY-FORMAT.md:3` and `:30` using "language" to mean *terminology*. There is no language field, no translation pairing, no notion that a lesson exists in two renderings. The repo already solved this once — the `blog` collection carries `lang: z.enum(['en','tr'])` and `translationId: z.string().optional()` (`src/content.config.ts:14-15`). Nothing in `teach` can consume that; a Dutch skill must carry the TR+EN contract itself.
Sharper still: `teach` assumes **two** languages exist (the content language and the subject). Dutch needs **three roles** — Turkish and English as content, Dutch as subject. No `teach` artifact has a slot for "the Dutch string" as distinct from "the explanation".

**(c) No topic-argument contract — a direct inversion.**
`SKILL.md:85`: "The user may specify an exact thing they want to learn. If they don't, figure out their zone of proximal development by: reading their `learning-records`, figuring out the right thing based on their mission…". The map locks the reverse: a user-supplied topic is a costume, and the plan decides the content. `teach` has no concept of "dress the next planned item in this theme" anywhere. Cheap to *write*, but it replaces `teach`'s central selection rule.

**(d) No curriculum spine — and `MISSION.md` is explicitly forbidden from being one.**
`teach` derives the next lesson from mission + learning records (`SKILL.md:81-89`). There is no ordered list of things to cover. And you cannot smuggle one in: `MISSION-FORMAT.md:31` says "If `MISSION.md` runs past a screen, it has stopped being a compass and started being a plan", and `:27` adds "One mission per workspace." A CEFR/inburgering syllabus is precisely a plan, and it needs its own file with its own format doc — a new artifact `teach` does not have.

**(e) No external exam, and no calendar.**
Grepped for `exam|curricul|syllab`: zero hits in the whole folder. `teach`'s success criterion is `MISSION.md`'s "Success looks like" bullet list, written by the user (`MISSION-FORMAT.md:13-16`) — self-defined, not externally set. There is no pass mark, no "a little above exam level" calibration hook, no mapping from lessons to exam components.
Related and worth flagging for the map's open "spaced repetition over calendar time" item: `teach` **names** spacing as a desirable difficulty (`SKILL.md:45`) but ships **no mechanism** for it. Learning records have no date field — the format is a title plus one to three sentences, and "Session-by-session activity logs" are explicitly disqualified (`LEARNING-RECORD-FORMAT.md:9-13`, `:42`). Numbering is `0001…`, sequence only. So there is nothing in `teach` from which "when does this item come back" can be computed. That ticket gets no free ride from `teach`.

**(f) Publicness — neutral, not conflicting.**
Grepped for `public|publish`: zero hits. `teach` is silent on audience. Its artifacts are private-by-default in tone (`NOTES.md` is a scratchpad of user preferences, `SKILL.md:138-140`) but nothing forbids committing them. Under the map's "a stranger will read it" lock, `NOTES.md` and the learner profile need rewriting for an audience — a content decision, not a structural blocker.

### 1.4 What to lift from `teach`

Read on its own merits, `teach`'s durable content is:

- **Fluency vs storage strength** (`SKILL.md:34-45`) — fluency gives an "illusory sense of mastery"; build storage strength by desirable difficulty: retrieval practice, spacing, interleaving (interleaving marked "for skills practice only").
- **Knowledge / Skills / Wisdom triad** (`SKILL.md:22-32`), with the load rule: for knowledge, "difficulty is the enemy… it eats working memory"; for skills, "difficulty is the tool" (`SKILL.md:97`, `:103`).
- **Feedback loop as tight as possible, ideally automatic** (`SKILL.md:108`).
- **Equal-length quiz answers**: "each answer should be exactly the same number of words (and characters, if possible). Don't give the user any clues about the answer through formatting" (`SKILL.md:110`). Directly reusable for exam-style drills.
- **Reference documents vs lessons**: "Lessons will rarely be revisited later — reference documents will be" (`SKILL.md:126`). For a language this maps cleanly onto vocabulary and grammar sheets.
- **Wisdom via community** (`SKILL.md:112-120`) — and this is the one place `teach` accidentally addresses the map's open *spreken/luisteren* gap: real-world practice is delegated to a community, with an opt-out to respect.
- **`LEARNING-RECORD-FORMAT.md` entire** — the four write triggers (`:31-36`), the "coverage is not learning" disqualifier (`:40`), and supersession over deletion (`:44-46`). Nearly free to adopt.
- **`GLOSSARY-FORMAT.md` entire** — see §1.1; adopt it *and* promote `GLOSSARY.md` into the top-level workspace list, where a language journey needs it.

---

## 2. Every other skill

25 skills, one line each. Verdicts are relative to the Dutch journey specifically.

**Plausibly useful inside or around a learning session:**

- **`grilling`** (`.agents/skills/grilling/SKILL.md`) — **reusable as-is, and load-bearing.** The rounds/frontier interview primitive; map #74 already mandates it per ticket. Its rule "Finding *facts* is your job, never the user's… The *decisions* are the user's" (`:20`) is exactly the posture a profile-building or mission-setting session needs.
- **`grill-with-docs`** (`grill-with-docs/SKILL.md`, 7 lines) — **reusable.** A two-line wrapper: `/grilling` + `/domain-modeling`. The right entry point for the *design* sessions of this map (leaves `CONTEXT.md` + ADRs behind), not for lesson sessions.
- **`grill-me`** (`grill-me/SKILL.md`, 7 lines) — **irrelevant here.** It is the stateless variant, for when there is no working directory (`ask-matt/SKILL.md:77`). This journey always has a repo, so `grill-with-docs` strictly dominates.
- **`domain-modeling`** (`domain-modeling/SKILL.md` + `CONTEXT-FORMAT.md` + `ADR-FORMAT.md`) — **reusable, and it overlaps `teach`'s glossary.** Note the collision to resolve: `CONTEXT.md` is the repo's ubiquitous-language store, while `GLOSSARY-FORMAT.md` proposes a learning glossary. Dutch vocabulary belongs in neither — it is content, not project vocabulary. Decide this explicitly or the two will fight.
- **`wait-what`** (`wait-what/SKILL.md`, 7 lines) — **adaptable, and the closest thing to an in-session tool.** It re-pitches a message "in ASD-STE100 Simplified Technical English, and use the ubiquitous language from `CONTEXT.md`". A learner hitting an unclear explanation mid-lesson wants precisely this; but its hard-coded target (`CONTEXT.md`, Simplified Technical English) is wrong for a bilingual lesson, so the Dutch skill wants its own equivalent rather than this one.
- **`research`** (`research/SKILL.md`, 12 lines) — **reusable as-is.** Background agent, primary sources, one cited Markdown file, "match the existing convention". This document was produced by it. It is the right tool for the sources/exam-syllabus tickets on this map, and could also serve *in-session* when `RESOURCES.md` has a gap.
- **`to-questionnaire`** (`to-questionnaire/SKILL.md`) — **adaptable, an unexpected fit.** Its mechanic is "grill the send, not the subject" (`:9`) — interview the user about the recipient and the gap, then produce a Markdown doc with answer stubs (`:21-53`). That answer-stub document format is a ready-made shape for an **async, mobile-answerable worksheet**, which is exactly the map's "mobile answering" nice-to-have. It is aimed at a third party, not the learner, so it is a template to borrow, not a skill to invoke.
- **`handoff`** (`handoff/SKILL.md`, 16 lines) — **irrelevant to sessions, useful to the build.** It writes to the OS temp dir, "not the current workspace" (`:8`), which is the opposite of a journey whose whole point is durable committed state. Fine for the phase boundaries of building the system.
- **`wizard`** (`wizard/SKILL.md` + `template.sh`) — **irrelevant unless the exam needs a human-only flow.** It exists for steps only a human can take (dashboards, credentials). Booking the exam is explicitly out of scope on map #74, so this stays out.
- **`writing-for-agents`**, **`writing-great-skills`** — see §3.

**Engineering-flow skills, relevant to *building* the system, not to running it:**

- **`wayfinder`** (`wayfinder/SKILL.md`) — currently in use; this is the skill that produced map #74 and ticket #75.
- **`to-spec`** (`to-spec/SKILL.md`) — the map's declared exit ("the map ends when `/to-spec` can be run against it"); its template demands Problem/Solution/User Stories/Implementation/Testing/Out of Scope (`:21-75`), and it notably requires deciding **test seams** with the user before writing (`:15-17`).
- **`to-tickets`**, **`implement`**, **`tdd`**, **`code-review`**, **`triage`**, **`diagnosing-bugs`**, **`resolving-merge-conflicts`**, **`codebase-design`**, **`improve-codebase-architecture`**, **`prototype`** — standard build-phase machinery, no learning-domain role. (`prototype` is named on map #74 for prototype tickets.)
- **`ask-matt`** (`ask-matt/SKILL.md` + `PHASE-BOUNDARIES.md`) — **the router, and a maintenance trap.** It enumerates every skill and flow, including a one-liner for `/teach` at `:85`. It is vendored (`skills-lock.json:4-9`), so a new local Dutch skill **will not appear in it**, and adding it there would be clobbered on the next update. Expect the new skill to be invisible to the router by design.
- **`setup-matt-pocock-skills`** (`setup-matt-pocock-skills/SKILL.md`) — already run against this repo; its output is `AGENTS.md`'s `## Agent skills` block and `docs/agents/*.md`. Relevant only as the precedent for **how repo-level agent config is recorded** — `AGENTS.md` is a hand-editable, non-vendored file, and the safe place to point at a new skill.

---

## 3. Constraints the skill-authoring skills impose

Both must be obeyed by whatever skill this map decides to write. They overlap heavily — `writing-for-agents` is the generalisation (any agent-consumed document), `writing-great-skills` the skill-specific one, and `writing-for-agents/SKILL-MECHANICS.md` holds the frontmatter branch.

**Invocation** (`writing-great-skills/SKILL.md:11-20`; `writing-for-agents/SKILL-MECHANICS.md:6-14`):
- Model-invoked = keeps a `description`, agent can fire it autonomously and other skills can reach it; costs **context load** every turn.
- User-invoked = `disable-model-invocation: true`; description becomes human-facing; zero context load, but spends **cognitive load** — the human is the index.
- Rule: "Pick model-invocation only when the agent must reach the skill on its own, or another skill must."
- **Consequence for this map:** the locked invocation shape is a human typing `/<dutch-skill> …`, so the top-level skill should be **user-invoked**. But note the trap at `SKILL-MECHANICS.md:14`: "Shared reference that two user-invoked skills both need can live in neither — with no descriptions, neither can fire the other." If the architecture ends up as several Dutch skills sharing rules, the shared rules must go in **plain files outside the skill system**, not in a skill.

**Description writing** (`writing-great-skills/SKILL.md:22-28`): front-load the leading word; one trigger per branch (synonyms are duplication); cut identity the body already carries.

**Information hierarchy** (`writing-great-skills/SKILL.md:30-44`; `writing-for-agents/SKILL.md:29-43`): three rungs — in-file step, in-file reference, disclosed/external reference behind a **context pointer**. "Push too little down and the top bloats; push too much and you hide material the agent actually needs." Branching is the disclosure test: inline what every branch needs, push behind a pointer what only some branches reach. **Co-location**: a concept's definition, rules and caveats under one heading, never scattered.
- **Consequence:** `teach`'s own layout (`SKILL.md` + four `*-FORMAT.md` siblings) is a textbook application of this — and its orphaned `GLOSSARY-FORMAT.md` (§1.1) is a textbook violation of the pointer rule from the same authors.

**Steps and completion criteria** (`writing-for-agents/SKILL.md:45-52`): every step ends on a criterion with two properties — **clarity** (can the agent tell done from not-done? a vague bound invites **premature completion**) and **demand** ("every modified model accounted for" beats "produce a change list"). "The strongest criteria are both checkable and exhaustive."
- **Consequence:** "teach a lesson" is exactly the kind of irreducibly fuzzy bound this warns about. A Dutch lesson skill needs a checkable end state — an artifact committed, a record written, a queue updated.

**When to split** (`writing-great-skills/SKILL.md:46-51`; `writing-for-agents/SKILL.md:54-59`): two cuts only — **by invocation** (a distinct leading word must trigger it independently, or another skill must reach it) and **by sequence** (later steps tempt the agent to rush the current one). Each cut spends one of the two loads. Hiding later steps "only works across a real context boundary (a hand-off or a subagent dispatch; an inline call leaves the later steps in context and clears nothing)" (`writing-for-agents/SKILL.md:49`).

**Leading words** (`writing-great-skills/SKILL.md:61-72`): a compact concept already in pretraining, repeated as a token, never as a sentence; prefer an existing word over a coinage, because "a made-up word recruits no priors". `teach`'s leading word is *lesson*. A Dutch skill should pick its own deliberately.

**Pruning** (`writing-great-skills/SKILL.md:53-59`; `writing-for-agents/SKILL.md:76-81`): single source of truth per meaning; the **environment** is a source of truth too, and a document restating it is a **cache** that only earns its load when the lookup is expensive; check every line for **relevance**; hunt **no-ops** sentence by sentence and delete the whole sentence when one fails.

**Failure modes to design against** (`writing-great-skills/SKILL.md:74-84`): premature completion, duplication, sediment, sprawl, no-op, and **negation** — "steering by prohibition backfires… Prompt the **positive**". Prohibitions only as hard guardrails, and even then paired with the positive target.

---

## 4. `.agents/skills` and `skills-lock.json` — the vendoring picture

**Yes, they are vendored, and yes, a naively-placed local skill gets clobbered.**

- `.claude/skills/` contains **26 symlinks and no real directories**, every one pointing at `../../.agents/skills/<name>` (e.g. `.claude/skills/teach -> ../../.agents/skills/teach`). Claude Code sees skills; git sees symlinks.
- `skills-lock.json` (`version: 1`) has an entry for each of the same 26 names. Every entry records `"source": "mattpocock/skills"`, `"sourceType": "github"`, a `skillPath` into the upstream repo's tree (e.g. `skills/productivity/teach/SKILL.md`, `skills-lock.json:103`), and a `computedHash`.
- The `computedHash` field is the tell: the installer records a hash of what it wrote so a later update can detect local modification. Whether it then refuses, warns, or overwrites is a property of the installer, **which is not in this repo** — grepped for `skills-lock`, `npx`, `skills add`, `agents install` across all Markdown, JSON, and YAML outside `node_modules`: zero hits. There is no npm script, no CI workflow, and no documentation of the update command. So the update mechanism is an out-of-repo CLI run by hand.
- What the history shows: commit `586f555` "update mat skills v1.2.0" changed **30 files under `.agents/skills/`** plus `skills-lock.json` plus four new `.claude/skills/` symlinks, in one commit — a wholesale re-vendor, including rewrites of `grilling/SKILL.md`, `prototype/LOGIC.md`, and `ask-matt/SKILL.md`. Anything hand-edited in those folders would have been in that diff's path.
- `.gitignore` does **not** exclude `.agents/` or `.claude/skills/` — it excludes only `.claude/worktrees/`. So both the vendored tree and any new local skill are committed and public, consistent with map #74's publicness lock.

**Practical rules this imposes on the skill-architecture decision:**

1. Put the new skill at **`.claude/skills/<name>/` as a real directory**. It is outside `.agents/skills/` and absent from `skills-lock.json`, so no update touches it. This is the only safe home.
2. **Do not edit any file under `.agents/skills/`** — not `teach`, not `ask-matt` to register the new skill. Copying `teach`'s useful prose into the new skill is fine and is what "steal from it" means; forking it in place is not.
3. **The new skill will be invisible to `/ask-matt`.** If discoverability matters, the non-vendored surface is `AGENTS.md` (already carrying an `## Agent skills` section, per `AGENTS.md`) plus `docs/agents/*.md`.
4. Divergence risk: an upstream `teach` improvement will not flow into a hand-written copy. Given how far the map's locks push away from `teach` (§1.3), that is a cost worth paying — but record the copied-from commit so a future reader can diff.

---

## 5. Answering the ticket's question directly

> Output a written verdict: reuse `teach` as-is, fork it, wrap it, or write fresh.

**Write fresh**, at `.claude/skills/<name>/`, structured the way `teach` is structured (a lean `SKILL.md` plus sibling `*-FORMAT.md` files reached by real pointers), carrying over `teach`'s philosophy, learning-record format, glossary format, and quiz rule verbatim where they fit.

Why not the other three:
- **As-is** — fails on all five conflicts in §1.3, three of which (HTML lessons, no curriculum spine, no exam) are structural.
- **Fork** — impossible in place (§4); "fork" outside `.agents/` is just "write fresh with a large copy-paste", which is what is recommended.
- **Wrap** — a wrapper cannot reach `teach`: `teach` is `disable-model-invocation: true` (`teach/SKILL.md:4`), and `SKILL-MECHANICS.md:10` states plainly that a user-invoked skill can be fired by nobody but the human. Even setting that aside, a wrapper would have to override `teach`'s topic-selection rule, its output format, and its workspace paths — that is not a wrap, it is a rewrite with an unreachable dependency.

**Four things this audit hands to downstream tickets:**
- The vocabulary store is undecided territory between three candidate homes (`CONTEXT.md`, a learning `GLOSSARY.md`, and an Astro content collection) — §2, `domain-modeling`. Note `GLOSSARY-FORMAT.md:29` scopes its glossary to *compressed knowledge the user already understands*, which is a **mastery record**, not the full vocabulary inventory a learner is still acquiring. The Dutch system likely needs both, and they are different artifacts.
- Spaced repetition gets nothing from `teach` beyond the word "spacing" — §1.3(e).
- `to-questionnaire`'s answer-stub document is a candidate shape for the mobile-answering nice-to-have — §2.
- `teach`'s community/wisdom section is the only existing handle on the *spreken/luisteren* gap — §1.4.

---

## Sources

All primary, all read in full from disk in this repo at commit `d3dcf3a`:

- `.agents/skills/teach/` — `SKILL.md`, `MISSION-FORMAT.md`, `RESOURCES-FORMAT.md`, `GLOSSARY-FORMAT.md`, `LEARNING-RECORD-FORMAT.md`, `agents/openai.yaml`
- `.agents/skills/writing-for-agents/` — `SKILL.md`, `SKILL-MECHANICS.md`
- `.agents/skills/writing-great-skills/` — `SKILL.md`, `GLOSSARY.md`
- `.agents/skills/ask-matt/SKILL.md`, `grilling/SKILL.md`, `grill-me/SKILL.md`, `grill-with-docs/SKILL.md`, `wait-what/SKILL.md`, `research/SKILL.md`, `to-questionnaire/SKILL.md`, `handoff/SKILL.md`, `to-spec/SKILL.md`, `setup-matt-pocock-skills/SKILL.md`
- Frontmatter of all 26 `.agents/skills/*/SKILL.md`
- `skills-lock.json`, `.claude/skills/` (symlink targets), `.gitignore`, `package.json`, `README.md`, `AGENTS.md`, `src/content.config.ts`, `src/pages/` layout
- `git log`/`git show --stat 586f555` — the "update mat skills v1.2.0" re-vendor
- GitHub issues #74 (map) and #75 (this ticket), read via `gh issue view`
