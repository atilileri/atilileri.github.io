# aihero.dev — what it offers the Dutch learning journey

**Question:** Survey [aihero.dev](https://www.aihero.dev/) and report which of its skills, patterns, or published material help build an agent-run learning practice in this repo. Specifically: skills published there that are **not** already vendored here; anything on **stateful, multi-session agent workflows**; anything on **skill composition** (one skill invoking another, or a skill routing on a free-text argument); and writing guidance beyond what the repo already carries.

**Date:** 2026-08-16

**Ticket:** [#76](https://github.com/atilileri/atilileri.github.io/issues/76), part of map [#74](https://github.com/atilileri/atilileri.github.io/issues/74)

---

## TL;DR verdict

**The skills are a near-clean negative; the *documentation* is a real positive.**

On skills: aihero.dev publishes nothing this repo does not already have. Every promoted skill on the site is one of the 26 in `skills-lock.json`. The only genuinely new material is upstream's `in-progress` and `misc` buckets — [`loop-me`](https://github.com/mattpocock/skills/blob/main/skills/in-progress/loop-me/SKILL.md), `claude-handoff`, three writing skills, and `scaffold-exercises` — none of which is promoted on the site, and only `loop-me` is worth a second look (§4).

On documentation, the answer changes. **aihero.dev hosts a per-skill editorial guide layer that this repo does not vendor at all.** Upstream keeps 25 long-form guide pages in `docs/`, published at `aihero.dev/skills-<name>`; the `skills.sh` install copies only `skills/`, and this repo's `.agents/` directory confirms it — it contains `skills/` and nothing else. Those pages carry known bugs, open issue numbers, community-reported failure modes, and "it's working if" checklists that appear nowhere in the `SKILL.md` files. For this map, [the `/teach` guide](https://www.aihero.dev/skills-teach) alone settles or sharpens five open questions on #74 — including a **confirmed, unfixed quiz bug** and an upstream recommendation that **contradicts this map's public-repo lock** (§2).

On composition: fully answered, and the answer is already on disk. `writing-for-agents/SKILL-MECHANICS.md` — vendored, at upstream HEAD — states the invocation rules, and they confirm [#75](https://github.com/atilileri/atilileri.github.io/issues/75)'s conclusion that `/teach` cannot be wrapped (§3).

One correction to carry back: **`writing-great-skills` no longer exists upstream.** It was renamed to `writing-for-agents` on 2026-07-31. This repo vendors both, so it holds one live skill and one dead one (§5). Map #74 instructs sessions to consult `/writing-great-skills` on skill-shape tickets; the live successor is `/writing-for-agents` plus its `SKILL-MECHANICS.md`.

---

## 1. What is on aihero.dev, and what is not

The site publishes a machine-readable index at [`/sitemap.md`](https://www.aihero.dev/sitemap.md), which lists every public route. Read against `skills-lock.json`, it breaks down as:

- **A skill catalogue and changelog** — [`/skills`](https://www.aihero.dev/skills), whose markdown twin [`/skills.md`](https://www.aihero.dev/skills.md) lists five changelog entries ending at **v1.2 (Aug 5, 2026)**: "`/wait-what`, `/writing-for-agents`, Claude Code Plugin, and more". Both of those skills are already vendored here. There is no v1.3.
- **25 per-skill guide pages** at `/skills-<name>` — the documentation layer discussed in §2.
- **An AI Coding Dictionary** of ~70 entries, e.g. [Memory system](https://www.aihero.dev/ai-coding-dictionary/memory-system), [Stateful](https://www.aihero.dev/ai-coding-dictionary/stateful), [Session](https://www.aihero.dev/ai-coding-dictionary/session), [Context pointer](https://www.aihero.dev/ai-coding-dictionary/context-pointer).
- **Everything else is AI *engineering* content, not learning-system content** — Vercel AI SDK tutorials, evals, MCP, Ralph, guardrails, prompt engineering. Scanning the full sitemap, there is **no post, workshop, tutorial, cohort or dictionary entry about language learning, curricula, spaced repetition, or exam preparation.** The single piece of learning-practice material on the whole site is the `/teach` pair: the guide page and the how-to.

So the honest shape of the answer: aihero.dev is a site about building AI applications that happens to host one teaching skill. It is not a source of learning-system design.

### The one dictionary entry worth stealing

[Memory system](https://www.aihero.dev/ai-coding-dictionary/memory-system) is defined as: *"A system that attempts to make an agent stateful across sessions by persisting to the environment and reloading at session start."* Note the hedge — **"attempts to"**. That is the whole multi-session problem stated in one line, and it is a usable term for #74's domain model: the Dutch practice needs a memory system, and the definition already concedes such systems are best-effort. Related terms sit alongside it: [Stateful](https://www.aihero.dev/ai-coding-dictionary/stateful) — *"Carries information forward. Sessions are stateful across turns; agents can be made stateful across sessions via a memory system."*

## 2. The finding that matters: the guide-page layer is not vendored

Upstream `mattpocock/skills` keeps two directories of long-form documentation — [`docs/engineering/`](https://github.com/mattpocock/skills/tree/main/docs/engineering) (18 files) and [`docs/productivity/`](https://github.com/mattpocock/skills/tree/main/docs/productivity) (7 files). These are published verbatim as the site's guide pages: `docs/productivity/teach.md` and [`aihero.dev/skills-teach`](https://www.aihero.dev/skills-teach) open with the same paragraph, word for word.

**None of it is installed.** The `skills.sh` installer copies skill folders only, and `.agents/` in this repo contains a single entry, `skills/`. So every agent session here works from `SKILL.md` and has never seen the guide. That gap is worth closing by hand for the two or three skills this map depends on.

Here is what [the `/teach` guide](https://www.aihero.dev/skills-teach) says that `teach/SKILL.md` does not. Each line is load-bearing for a decision on #74.

**a. The quiz-answer bug is real, confirmed, and unfixed.**
> "The correct quiz answer is always the first option. Confirmed by several people, on Sonnet, on Opus and on GLM, and still unfixed. `SKILL.md` now requires every answer to be the same number of words, which kills a different tell … but says nothing about position. One contributor tested an instruction-level fix for position and reported the correct answer still landing in slot A 33 times out of 33 across nine lessons ([#335](https://github.com/mattpocock/skills/issues/335)), which points at a shuffling quiz component in `assets/` as the real fix rather than better wording."

Why it matters: any Dutch lesson form with multiple-choice drills inherits this. The guide names the fix — **a shuffling quiz component in `assets/`, not a prompt instruction.** If the content-form ticket lands on quizzes, that component is a required build item, not a nice-to-have.

**b. `/teach` recommends a separate repo — which collides with this map's publicness lock.**
> "Keep it out of the project you are working in: a separate repo is the recommended home, rather than a global `~/.learnings/` folder or the working project itself. A dedicated repo also makes the lessons committable, which is how teams have shared them."

Why it matters: #74 locks the Dutch system into *this* repo and site. The upstream recommendation is one-topic-per-repo. This is not a blocker — the reason given is "one mission per workspace", which a dedicated subdirectory satisfies — but the new skill must state its workspace root **explicitly**, because of the next point.

**c. There is an open bug where the workspace lands inside the skill folder.**
> "A real, open bug ([#377](https://github.com/mattpocock/skills/issues/377)). `SKILL.md` uses `./` for two different roots at once … An agent that resolves the first kind against the skill's install directory goes on to resolve the second kind there too, and writes your course into the skill folder … name the directory explicitly when you start rather than relying on 'the current directory' being understood."

Why it matters: this repo's skills are **symlinks into a hash-pinned `.agents/skills/`** (per #75). A skill that writes lessons relative to `./` would write them into vendored, pinned territory. **The new Dutch skill must hardcode an absolute-from-repo-root workspace path and must not inherit `teach`'s `./` convention.** This is the sharpest single carry-over from the survey.

**d. Spaced repetition: confirmed absent upstream, not merely unimplemented here.**
> "Does it do spaced repetition, and does it know when to stop teaching? No to the first, and not reliably to the second. Spacing and interleaving are principles the lessons are designed against, but nothing schedules a review, and there is no Anki or calendar integration — both are recurring requests. The related gap is exit criteria: as one user put it, `teach` 'is good at making the next lesson, but not as good at knowing when to stop and switch to review or real practice.'"

Why it matters: #74 lists spaced repetition under "Not yet specified" and #75 found nothing to inherit. This is the upstream author confirming the same, publicly, and adding a second gap #74 has not yet named: **exit criteria** — when to stop teaching new material and switch to review. Worth adding to the fog.

**e. There is no level-assessment step, and session one is the weakest session.**
> "There is no assessment step: `teach` infers your level from the mission and the learning records, and in session one there are no learning records … An explicit knowledge-assessment step is a standing feature request ([#725](https://github.com/mattpocock/skills/issues/725)), not shipped behaviour."

Why it matters: #74 already plans a learner profile. This is the primary-source justification for it — the profile is exactly the missing assessment step, and it is the documented commonest complaint about `teach`.

**f. Statefulness is per-folder, not per-conversation.**
> "All three approaches work — staying in the same session, re-invoking `/teach` in a new session, or opening a new session in the same folder. Each lesson is its own invocation. **The folder is the continuity, not the conversation.** Common practice is to open a fresh session in the workspace and say `/teach next lesson for <topic>`."

Why it matters: this is the multi-session answer the ticket asked for, and it is refreshingly plain — there is no mechanism beyond *files in a directory, read at session start*. No memory API, no compaction trick, no session index. Session N knows about 1..N-1 because it reads `learning-records/` off disk. The Dutch skill should assume the same and not look for something cleverer.

**g. Two more honest caveats.** `GLOSSARY-FORMAT.md` ships but `SKILL.md` no longer links to it, so no glossary is produced unless asked ([#559](https://github.com/mattpocock/skills/issues/559)) — relevant, since #75 planned to lift the glossary format. And quality varies sharply by model and reasoning effort: *"Higher reasoning effort has been reported to produce noticeably better lessons than the medium setting."*

**h. Language learning is the majority use, and it is not code.**
> "No, and the non-coding use is the larger part of the record: Korean, Japanese formal register, piano, guitar, board game design … Nothing in the skill is programming-specific — mission, resources, zone of proximal development and drill work the same way in any domain."

The companion how-to, [Learn Anything With My /teach Skill](https://www.aihero.dev/learn-anything-with-my-teach-skill), uses **French** as its worked example (`mkdir learning-french`), and describes the resulting lessons as *"interactive HTML lessons with audio and quizzes"*, illustrated with a screenshot captioned *"Interactive French lesson in browser with tap-to-hear audio buttons and quiz questions"*.

Why it matters, and the caveat: **audio is not in the skill.** Reading `teach/SKILL.md` end to end, the Assets section names *"stylesheets, quiz widgets, simulators, diagram helpers"* and the Skills section names *"quizzes and light in-browser tasks"* — audio is never mentioned. So tap-to-hear buttons are emergent output from one workspace, not a documented capability. That is still a useful signal for #74's open **listening** question: a self-contained HTML lesson can carry in-browser audio, but the mechanism is unspecified upstream and this map would be deciding it from scratch.

## 3. Skill composition — answered, and the answer is already vendored

The ticket asked about one skill invoking another and about routing on a free-text argument. Both are documented, and the documentation is already on disk.

**The invocation rule**, stated in the upstream [README](https://github.com/mattpocock/skills):
> "**User-invoked** skills are reachable only when you type them (e.g. `/grill-me`); their job is to orchestrate. **Model-invoked** skills can be invoked by you *or* reached for automatically by the agent when the task fits; they hold the reusable discipline. **A user-invoked skill may invoke model-invoked skills, but never another user-invoked one.**"

The same rule, with the mechanism, in [`writing-for-agents/SKILL-MECHANICS.md`](https://github.com/mattpocock/skills/blob/main/skills/productivity/writing-for-agents/SKILL-MECHANICS.md) — **already vendored at `.agents/skills/writing-for-agents/SKILL-MECHANICS.md`, byte-identical to upstream HEAD**:
> "A **user-invoked** skill strips the description from the agent's reach: only the human typing its name can invoke it, and no other skill can … Shared reference that two user-invoked skills both need can live in neither — with no descriptions, neither can fire the other. Push it to a plain file outside the skill system: external reference any skill can point at."

**This independently confirms #75's conclusion.** `teach` is `disable-model-invocation: true`, so a new user-invoked Dutch skill provably cannot call it, and the documented remedy — push shared material to a plain file outside the skill system — is exactly the "lift the formats wholesale" decision #75 already locked.

**The free-text argument** is a frontmatter field, not a prompt convention. `teach`'s own frontmatter:
```yaml
---
name: teach
description: Teach the user a new skill or concept, within this workspace.
disable-model-invocation: true
argument-hint: "What would you like to learn about?"
---
```
`argument-hint` is the mechanism behind `/<dutch-skill> i want to do a lesson about last superbowl`. Note what it is: **a hint string only.** Nothing in the skill system parses or routes the argument — the body of the `SKILL.md` has to state what to do with it. Since #74 locks the topic as a *theme, never a curriculum override*, that rule has to be written explicitly into the skill body; the frontmatter will not enforce it. `teach`'s body does the opposite (it selects by zone of proximal development), which is the inversion #75 flagged.

**Router skills**, if this map ever grows more than one Dutch skill, from the same file:
> "When user-invoked skills multiply past what you can remember, that piled-up cognitive load is cured by a **router skill**: one user-invoked skill that names the others and when to reach for each … It can only hint, never fire them."

## 4. Skills upstream that are not vendored here

Upstream has five buckets. `skills/engineering/` (18) and `skills/productivity/` (7) are fully vendored. The rest are not, and are excluded from the plugin and the site:

**`skills/in-progress/`** — [described upstream](https://github.com/mattpocock/skills/tree/main/skills/in-progress) as *"Beta … excluded from the plugin and the top-level README until they graduate to a stable bucket, they get no docs pages, and they can change or disappear without warning."*

| Skill | Worth it here? |
| --- | --- |
| [`loop-me`](https://github.com/mattpocock/skills/blob/main/skills/in-progress/loop-me/SKILL.md) | **Yes, as a pattern to read — not to install.** See below. |
| `claude-handoff` | No. Hands a conversation to a fresh background agent via `claude --bg`; a build-flow tool, unrelated to learning. |
| `writing-beats`, `writing-fragments`, `writing-shape` | No. Prose-drafting workflows for articles. Marginally relevant only if #74's site-presentation ticket lands on hand-written blog posts. |
| `setup-ts-deep-modules` | No. TypeScript dependency-cruiser wiring. |

**`skills/misc/`** — *"Tools I keep around but rarely use — not promoted in the plugin."* The only one that looks relevant by name, [`scaffold-exercises`](https://github.com/mattpocock/skills/blob/main/skills/misc/scaffold-exercises/SKILL.md), **is not**: reading it, it is hard-wired to Matt's own course repo, creating `exercises/XX-section/XX.YY-name/{problem,solution,explainer}/` directories that pass `pnpm ai-hero-cli internal lint`. The *numbering convention* (`01.03-retrieval-with-bm25`) is a mildly interesting precedent for ordering Dutch units; nothing else transfers.

**`skills/deprecated/`** is empty — *"a retired skill is deleted, and the changeset that removes it names whatever replaced it."*

### `loop-me` — the one new thing worth reading

`loop-me` is the second stateful multi-session workspace skill in the repo, and it is not vendored here. Same shape as `teach`: `disable-model-invocation: true`, an `argument-hint`, a directory as the store (`workflows/*.md` and `NOTES.md`), and grilling as the engine. What it adds is a **vocabulary for recurring practice**, which is exactly what a daily Dutch session is:

> "A **loop** is a recurring pattern in the user's life: their career, their week, their morning, a single repeated activity … A **workflow** is the spec of one loop, made real. You run a workflow on a loop — the loop is its running instantiation."

> "**Trigger** — what fires each run: an **event** … or a **schedule** … **Checkpoint** — a human-in-the-loop point where the user is asked to verify or decide … **Push right** — defer the checkpoint as far as it will go … **Brief** — what a checkpoint presents: a tight, decision-ready summary … The user reads a brief, not a draft."

And a definition-of-done test worth copying verbatim into #74's skill-shape tickets:
> "A workflow spec is done when an implementer agent could build it without asking a single question."

**Recommendation: do not install it.** It is beta by upstream's own label, it can disappear without warning, and installing it would add a 27th pinned entry for a skill whose job (specifying workflows) this map is doing by hand on the wayfinder map anyway. Read it as a source of vocabulary — **trigger / checkpoint / push right / brief** — for the domain-modelling ticket. `Trigger` in particular is the missing word for #74's unspecified scheduling question: the Dutch practice is currently event-triggered (the user types the command); spaced repetition would make it partly schedule-triggered.

## 5. Correction: `writing-great-skills` is a dead skill in this repo

`skills-lock.json` pins 26 skills. Upstream's promoted buckets currently hold **25**. The difference is `writing-great-skills`, and it is not a new addition here — it is a deletion upstream that the pin predates.

- `https://raw.githubusercontent.com/mattpocock/skills/main/skills/productivity/writing-great-skills/SKILL.md` returns **HTTP 404**.
- The commit that removed it, dated **2026-07-31**, reads: *"feat!: rename writing-great-skills to writing-for-agents and restructure — The reference now covers any document an agent consumes — skills, AGENTS.md/CLAUDE.md, docs reached by a pointer. GLOSSARY.md merged into SKILL.md as a dedup … skill-only mechanics disclosed to SKILL-MECHANICS.md; the skill is now model-invoked. Clean rename, no alias."* ([commit history for that path](https://github.com/mattpocock/skills/commits/main/skills/productivity/writing-great-skills))
- The site agrees: `/sitemap.md` lists [The /writing-for-agents Skill](https://www.aihero.dev/skills-writing-for-agents) and has no page for `writing-great-skills`.

So this repo holds `.agents/skills/writing-great-skills/` (`SKILL.md` + `GLOSSARY.md`) as a fork-point orphan, **and** `.agents/skills/writing-for-agents/` (`SKILL.md` + `SKILL-MECHANICS.md`) at upstream HEAD. The successor supersedes it in full: the glossary is merged into the body, and the skill-specific mechanics — the invocation rules quoted in §3 — are in `SKILL-MECHANICS.md`.

**Consequence for #74:** the map's standing instruction to consult `/writing-great-skills` on skill-shape tickets should be read as `/writing-for-agents` + `SKILL-MECHANICS.md`. Whether to delete the orphan is a housekeeping matter outside this map.

### Drift, for the record

Comparing each vendored `SKILL.md` against upstream `main` by content hash on 2026-08-16, **13 of 25 have drifted**: `code-review`, `diagnosing-bugs`, `domain-modeling`, `grill-with-docs`, `improve-codebase-architecture`, `tdd`, `to-spec`, `to-tickets`, `triage`, `wayfinder`, `grill-me`, `grilling`, `handoff`. The two that matter to this map have **not**: **`teach` and `writing-for-agents` are byte-identical to upstream HEAD.** So everything quoted from those two here is current, and nothing on this map is blocked on an update.

## 6. What was looked for and not found

Stated plainly, because absence is a result:

- **No spaced-repetition material anywhere on aihero.dev.** No post, no dictionary entry, no skill. The `/teach` guide states outright that nothing schedules a review.
- **No progress-tracking or streak material.** Learning records are ADR-style prose; the guide describes them as *"ADR-style notes on what you have demonstrably learned, used to decide what to teach next"*, with no time dimension.
- **No mobile-answering material.** #74 lists mobile as a nice-to-have; aihero.dev says nothing about it. The nearest adjacent note is that `teach` *"runs unmodified in Claude Cowork"* — a different harness, not a mobile answer.
- **No curriculum, exam-preparation, or source-vetting guidance** beyond `RESOURCES.md`'s Knowledge/Wisdom split.
- **No skill newer than v1.2 (Aug 5, 2026)**, so nothing has shipped upstream since this repo's pin that this map needs.

## Recommendations

1. **Carry into the skill-shape ticket:** the new Dutch skill states its workspace root explicitly and never uses `teach`'s `./` convention — issue [#377](https://github.com/mattpocock/skills/issues/377) is live and this repo's skills are symlinks into pinned territory.
2. **Carry into the content-form ticket:** if lessons carry multiple-choice drills, a **shuffling quiz component in `assets/`** is a required build item. Instruction-level fixes are documented as failing 33/33 ([#335](https://github.com/mattpocock/skills/issues/335)).
3. **Carry into the invocation-contract ticket:** `argument-hint` is a hint only. The "theme, never a curriculum override" lock must be written into the skill body, because nothing enforces it.
4. **Add to the map's fog:** **exit criteria** — when the practice stops teaching new material and switches to review or real practice. Named upstream as a real gap, not yet on #74.
5. **Read, do not install, `loop-me`.** Take its vocabulary — trigger, checkpoint, push right, brief — into the domain-modelling ticket.
6. **Read the guide pages for `teach`, `wayfinder` and `writing-for-agents` before their tickets.** They are not on disk and no session here has seen them.
7. **Treat `/writing-great-skills` as `/writing-for-agents` + `SKILL-MECHANICS.md`** wherever #74 names it.

---

## Sources

Primary sources opened directly:

- [aihero.dev](https://www.aihero.dev/) and [`/sitemap.md`](https://www.aihero.dev/sitemap.md) — the site's own machine-readable index of every public route; basis for the §1 and §6 absence claims.
- [aihero.dev — The /teach Skill](https://www.aihero.dev/skills-teach) (markdown twin at `/skills-teach.md`) — the guide layer; source of every quote in §2 and the issue numbers [#335](https://github.com/mattpocock/skills/issues/335), [#377](https://github.com/mattpocock/skills/issues/377), [#559](https://github.com/mattpocock/skills/issues/559), [#725](https://github.com/mattpocock/skills/issues/725).
- [aihero.dev — Learn Anything With My /teach Skill](https://www.aihero.dev/learn-anything-with-my-teach-skill) — the French worked example; audio-and-quizzes screenshot caption.
- [aihero.dev — The /wayfinder Skill](https://www.aihero.dev/skills-wayfinder) — map/fog/frontier vocabulary; "single-session planning vs multi-session planning".
- [aihero.dev — AI Skills for Real Engineers](https://www.aihero.dev/skills) / [`/skills.md`](https://www.aihero.dev/skills.md) — catalogue and full changelog, latest entry v1.2 (Aug 5, 2026).
- [aihero.dev — 5 Agent Skills I Use Every Day](https://www.aihero.dev/5-agent-skills-i-use-every-day) — checked for new material; contains none beyond the vendored skills.
- [aihero.dev — Memory system](https://www.aihero.dev/ai-coding-dictionary/memory-system) and [Stateful](https://www.aihero.dev/ai-coding-dictionary/stateful) — dictionary definitions quoted in §1.
- [github.com/mattpocock/skills — README](https://github.com/mattpocock/skills) — installation, the user-invoked/model-invoked rule, the full promoted skill list.
- [mattpocock/skills — `skills/in-progress/`](https://github.com/mattpocock/skills/tree/main/skills/in-progress) and [`skills/misc/`](https://github.com/mattpocock/skills/tree/main/skills/misc) bucket READMEs — the unvendored skills and their status.
- [mattpocock/skills — `loop-me/SKILL.md`](https://github.com/mattpocock/skills/blob/main/skills/in-progress/loop-me/SKILL.md) — loop/workflow/trigger/checkpoint/push-right/brief vocabulary.
- [mattpocock/skills — `scaffold-exercises/SKILL.md`](https://github.com/mattpocock/skills/blob/main/skills/misc/scaffold-exercises/SKILL.md) — exercise directory convention; assessed as repo-specific.
- [mattpocock/skills — `writing-for-agents/SKILL-MECHANICS.md`](https://github.com/mattpocock/skills/blob/main/skills/productivity/writing-for-agents/SKILL-MECHANICS.md) — invocation rules and router skills quoted in §3.
- [mattpocock/skills — commit history for `skills/productivity/writing-great-skills`](https://github.com/mattpocock/skills/commits/main/skills/productivity/writing-great-skills) — the 2026-07-31 rename commit quoted in §5.
- GitHub contents API listings of `skills/{engineering,productivity,misc,in-progress,deprecated}` and `docs/{engineering,productivity}` — basis for the counts in §2 and §4.

Local repo files read directly:

- `skills-lock.json` — the 26 pinned skills.
- `.agents/` — confirmed to contain only `skills/`, no `docs/` (§2).
- `.agents/skills/teach/SKILL.md` — frontmatter, Assets and Skills sections; confirms audio is not specified (§2h).
- `.agents/skills/writing-for-agents/SKILL.md` and `SKILL-MECHANICS.md`, `.agents/skills/writing-great-skills/SKILL.md` and `GLOSSARY.md` (§5).

Method note on §5's drift table: each vendored `SKILL.md` was hashed and compared against the same path on upstream `main` on 2026-08-16. This detects *any* difference, and does not distinguish upstream moving forward from a local edit — it was not verified which. The comparison covers `SKILL.md` only, not sibling files. Drift is reported only so the map knows which quotes are current; it is not itself a finding this ticket acted on.
