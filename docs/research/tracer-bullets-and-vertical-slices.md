# Tracer Bullets and Vertical Slices

**Question:** What is the actual evidence for tracer bullets and vertical slicing, and
what is the honest way to show one to an ASML executive? Specifically: where does the
*"twenty agent runs per ticket"* claim come from; what did Hunt & Thomas actually
define; is there any measured vertical-vs-horizontal comparison for agents; is the
blocking-edge DAG documented with results; and what does vertical slicing buy in VP
language?

**Issue:** [#65](https://github.com/atilileri/atilileri.github.io/issues/65) · Part of
map [#63](https://github.com/atilileri/atilileri.github.io/issues/63) — Chapter 5, the
AI Operating Model.

**Date:** 2026-08-15

---

## TL;DR verdict

The **architecture** of the argument is solid and old; the **numbers** attached to it in
our secondary source are not. The twenty-runs claim is a single unattributed anecdote in
Pocock's own docs that our research doc then generalised into a rule — it is
**must-not-claim**, twice over. There is **no measured comparison of vertical against
horizontal slicing**, for agents or for humans; the case for vertical slicing is
architectural and definitional (a horizontal slice *cannot* be verified alone, by
construction), not empirical. What *is* measured, and what an exec room will accept, sits
one level up: **agent success decays with task length** (METR, Ord) and **working in small,
independently deployable batches is DORA's named countermeasure to the instability that
AI adoption measurably introduces**. Lead with DORA. It is the only source in this file
that is survey-scale, exec-legible, and about *their* problem rather than about slicing.

On the tracer-bullet/prototype distinction the deck must get right: **a tracer bullet is
kept and grown into the shipped system; a prototype never enters main.** But note a live
nuance — the current `/prototype` skill has *moved off* "throw it away." It now parks the
prototype on a `prototype/<name>` branch as evidence. Saying "the prototype is deleted" on
a wall would be wrong against our own installed skill.

---

## 1. Provenance of the "twenty agent runs per ticket" claim

**Verdict: unattributed anecdote, distorted in transmission. Must-not-claim.**

The chain has three links, and it degrades at every one.

**Link 1 — the primary source.** `mattpocock/skills`,
[`docs/engineering/to-tickets.md`](https://github.com/mattpocock/skills/blob/main/docs/engineering/to-tickets.md),
line 29, fetched raw and verified verbatim:

> This is the rule people break most often, and the consequences are well documented. One
> team ran a 26-ticket stack sliced by layer — corpus, producer, aggregator, selector —
> and got roughly twenty agent runs per closed ticket, about three quarters of them
> rework. Their own post-mortem traced every failure class back to the horizontal slicing
> rather than to the implementations.

Note what is and is not there. The team is **not named**. The post-mortem is **not
linked**. "Well documented" is asserted and then supported by exactly one story. No
baseline is given — twenty runs per ticket against *what*? There is no vertically sliced
control arm. Even taken at face value it is an uncontrolled n=1 observation with a
self-reported causal attribution ("their own post-mortem traced").

**Link 2 — the SKILL.md.** The installed skill,
`.claude/skills/to-tickets/SKILL.md`, is the file that actually runs. It contains the
vertical-slice rules, the demoable-alone constraint, the single-context-window sizing and
the wide-refactor exception — and **no number at all**. The map (#63) says prefer SKILL.md
over the research doc where they differ. Here the SKILL.md's silence is itself the
signal: the operative artifact does not rest on the figure.

**Link 3 — our research doc.** `privates/op-mdl/matt-deep-res.md` line 59 renders it as:

> …leading to hallucinated integration points and massive rework — often requiring up to
> twenty agent runs per ticket due to cascading failures.

Three distortions in one clause. "One team" became **"often."** "Roughly twenty per closed
ticket" (an average) became **"up to twenty"** (a ceiling). And a new causal mechanism,
**"cascading failures,"** was introduced that appears nowhere in the source. This is the
same failure mode chapter 4's research caught twice (#44's Table 1 trap, the invented
smart-zone figures): a hedged anecdote laundering into a general law across one hop of
summarisation.

**Ruling:** the figure must never reach a wall, a note, or a spoken line. If challenged,
the honest sentence is *"the only number in circulation is one team's uncontrolled
retrospective, and we don't repeat it."* That answer is stronger in an ASML room than the
number would have been.

## 2. Tracer bullet, the original

**Verdict: safe to claim, with the exact wording below.**

Hunt & Thomas, *The Pragmatic Programmer*. The publisher's own tips list
([pragprog.com/tips](https://pragprog.com/tips/)) carries the two adjacent tips that make
the distinction the deck needs:

- **Tip 20 — "Use Tracer Bullets to Find the Target."** *"Tracer bullets let you home in
  on your target by trying things and seeing how close they land."*
- **Tip 21 — "Prototype to Learn."** *"Prototyping is a learning experience. Its value lies
  not in the code you produce, but in the lessons you learn."*

The metaphor: tracer rounds are loaded at intervals among live ammunition and leave a
visible trail, so the gunner corrects aim under real conditions rather than by
calculation. In software, the tracer bullet is a thin end-to-end path fired through every
layer at once.

**The part everyone drops.** In Bill Venners' 2003 Artima interview with both authors
([Tracer Bullets and Prototypes](https://www.artima.com/articles/tracer-bullets-and-prototypes)),
the retention distinction is explicit: tracer code is *lean but complete* and **becomes the
skeleton of the final system**, accumulating feature by feature; prototypes are *"by their
nature not designed to be long lasting code."* Dave Thomas's image, worth having in the
presenter's pocket: *"A prototype is like a town in a western movie. It's all facade… You
cannot move in and raise a family in one of those houses."* Andy Hunt on why the tracer
works: *"as you grow your application, one feature at a time… you're off by a little bit.
Well, you still don't have that much code."*

So the one-line contrast for the wall is: **a tracer bullet is aimed and kept; a prototype
is asked and answered.**

**The nuance that protects us from being wrong on our own skill.** Our installed
`/prototype` skill and its
[public doc](https://github.com/mattpocock/skills/blob/main/docs/engineering/prototype.md)
have deliberately retired "throw it away":

> Throwaway is a constraint on how the code is *written*, not a promise to destroy it.

and

> Not any more. It used to be: build it, keep the answer, bin the code. … So the prototype
> is now treated as a **primary source**: it lands on a `prototype/<name>` branch out of
> main and the implementation issue points at it. What changed is where the code lives,
> not the discipline — it still never merges into main.

The local `SKILL.md` (rule 6) agrees: *"commit it to a throwaway branch, out of main, and
leave a context pointer to that branch on the implementation issue. … The main branch keeps
only the validated decision."*

**Therefore the on-screen distinction is about `main`, not about the bin:**

| | Tracer bullet (`/to-tickets`) | Prototype (`/prototype`) |
|---|---|---|
| What it is | a thin complete path through every layer | code that answers one question |
| What survives | **the code** — it is the skeleton you grow | **the answer** — folded into the real code |
| Where it lands | `main`, and stays | a `prototype/*` branch, never merged |
| It is done when | it runs end to end and can be demoed | you can state the verdict in one line |

Do **not** put "thrown away" against the prototype column without the qualifier. It
contradicts our own installed skill, and it is exactly the kind of detail an engineer in
the room will have read.

## 3. Vertical vs horizontal slicing with agents — is anything measured?

**Verdict: no. The case is architectural, and it should be presented as architectural.**

I found no controlled comparison — not in the agent literature, not in the agile
literature — that measures vertical against horizontal decomposition on success rate,
rework or run count. The nearest thing in the agile corpus, *The role of slicing in
test-driven development* ([arXiv:2407.13258](https://arxiv.org/abs/2407.13258)), builds a
theoretical framework linking TDD cycles to vertical slices and runs an industry
experiment, but it does not benchmark vertical against horizontal decomposition; treat it
as a conceptual reference, not a result.

That absence is not fatal, because the core claim is **definitional rather than empirical**.
From the primary doc:

> A **horizontal** slice ships one layer of the change. Nothing works until every layer has
> landed, and each ticket's acceptance criteria have to reach into work that another
> ticket owns. A **vertical** slice — the tracer bullet — ships one thin path through all
> the layers at once, so it is verifiable alone and owns everything it grades.

"Verifiable alone" and "owns everything it grades" are consequences of the geometry, not
findings. A horizontal slice *cannot* be checked end to end, because the rest of the path
does not exist yet. No study is needed for that, and claiming one would be the overreach.

**What *is* measured, and is the honest support:**

- **Agent success decays with task length.** METR's
  [*Measuring AI Ability to Complete Long Tasks*](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/)
  ([arXiv:2503.14499](https://arxiv.org/abs/2503.14499)) fits a logistic curve of success
  rate against the time a human professional needs, and reports a model's **50%-task-
  completion time horizon**. Success falls monotonically as tasks get longer. Toby Ord's
  follow-up, [*Is there a half-life for the success rates of AI agents?*](https://arxiv.org/abs/2505.05115)
  (May 2025), models this as a **constant per-minute failure hazard**, giving exponential
  decay in success with task length and a per-agent "half-life."
  **What this licenses:** *shorter, independently checkable units of work succeed more
  often.* **What it does not license:** any statement about slice *orientation*. METR
  measures duration, not geometry. Say "smaller," not "vertical," when citing it.
- **Benchmark design as corroboration.** SWE-bench
  ([Jimenez et al., ICLR 2024](https://arxiv.org/abs/2310.06770)) defines its unit of work
  as a real issue plus the tests that decide it; the
  [evaluation guide](https://www.swebench.com/SWE-bench/guides/evaluation/) resolves an
  instance when *"the patch made the required tests pass."* Every task in the field's
  reference benchmark is, structurally, a vertical slice with its own acceptance test. That
  is a strong *architectural* corroboration — the whole field only knows how to grade work
  shaped this way — and it is **not** a measurement of slicing. Frame it as an
  observation about the benchmark, never as evidence about rework.
- **The skill's own honest admission** is also usable and disarming: the doc concedes the
  skill *"still produces"* horizontal slices sometimes, and prescribes the human check —
  *"what can I demo when this is done? A ticket with no answer is a horizontal slice."*
  That single question is the most presentable artifact in this entire file.

## 4. The DAG of blocking edges

**Verdict: a design pattern, not a documented result. One adjacent measured paper exists;
use it carefully or not at all.**

What `/to-tickets` actually does is narrow, and the primary doc is unusually candid about
the limits:

> The edges live in the ticket either way. The medium only decides whether anything can act
> on them in parallel. `to-tickets` produces the artifact; running it — one session at a
> time, or a fleet — is your job, not the skill's.

and, under *"The tickets are published. How do I actually run them?"*:

> The skill stops at the artifact, and there is no auto-dispatch mode. Dispatch is manual:
> look at the board, count the tickets with no open blockers, and open that many agent
> sessions.

So: **the skill emits a dependency graph; a human reads the frontier and opens that many
sessions.** Our research doc's "orchestration script can fan out multiple autonomous
agents" and the "integrator role" belong to the Ralph / Parallel-XP material, which map
#63 decision 9 and the Out-of-scope section keep off the wall entirely. Nothing to build
there, and nothing to claim.

**The one adjacent measurement**, if the room pushes: *When Parallelism Pays Off:
Cohesion-Aware Task Partitioning for Multi-Agent Coding*
([arXiv:2606.00953](https://arxiv.org/html/2606.00953), Yang et al., UT Austin / Oxford,
May 2026) partitions coding work by its dependency structure and runs agents in parallel.
On DevEval it reports **68.1% pass rate vs 56.8% sequential**, 45% lower latency and 28%
lower cost; on CodeProjectEval **34.1% vs 20.1%**, 52% lower latency, 35% lower cost. Its
sharpest result for us: **file-based parallelism without structural guidance inflated cost
by 60% for a 3.2% quality gain** on dependency-dense projects. Gains correlate with edge
density (Pearson r = 0.65).
**Caveats that keep this off a wall:** it is an unrefereed preprint; the partitioning is
*machine-derived from a code dependency graph*, not human-authored vertical slices; and the
baseline is sequential single-agent, not horizontal slicing. It is presenter ammunition —
*"dependency-aware partitioning beats naive parallelism"* — not a slide number.

**The counterweight the presenter should hold, because it is the honest one.** Anthropic's
[multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)
reports its multi-agent configuration outperforming the single-agent baseline by **90.2%**
on an internal research eval, but states in the same post that multi-agent systems use
**about 15× more tokens than chats**, and — directly against a naive parallel-agents
pitch — that *"most coding tasks involve fewer truly parallelizable tasks than research,
and LLM agents are not yet great at coordinating and delegating to other agents in real
time,"* and that domains *"that require all agents to share the same context or involve
many dependencies between agents are not a good fit for multi-agent systems today."* If an
exec asks *"so can we just run fifty agents?"*, that quote is the answer, and it comes
from a model vendor arguing against its own interest.

**The irony, note-only (map #63 decision 6).** This chapter was itself planned on exactly
this structure: map #63 is the parent, its research and build tickets carry native GitHub
blocking edges, and parallel sessions in separate worktrees took only unblocked work — this
document is one such ticket. Decision 6 keeps the deck's own map off the wall (the visual
uses a generic invented example), so this lives in the presenter's mouth, not on screen.
It is a good answer to *"has anyone actually run this?"* — **"yes, this presentation."**

## 5. The exec translation

**Verdict: lead with DORA. It is the only exec-grade, survey-scale, first-party source
here, and it is about the room's actual anxiety.**

An ASML VP does not care about slice orientation. They care that AI-assisted delivery does
not become AI-assisted instability. DORA measured precisely that tension, and named
small-batch working as the countermeasure.

From [DORA — *Balancing AI tensions*](https://dora.dev/insights/balancing-ai-tensions/)
(first-party, opened directly):

> higher AI adoption is associated with an increase in both software delivery throughput

and, in the same analysis, an increase in **software delivery instability** — and:

> enforcing the discipline of working in small batches is a critical countermeasure to the
> risks of AI-assisted development

From [DORA — *Working in small batches*](https://dora.dev/capabilities/working-in-small-batches/)
(first-party, opened directly):

> Working in small batches is an essential principle in any discipline where feedback loops
> are important, or you want to learn quickly from your decisions.

> working in small batches amplifies the positive impact of AI adoption on product
> performance

The page describes small-batch working as a **"safety net for AI adoption,"** counteracting
the delivery instability that accompanies it. It prescribes the INVEST **Independent**
property in words that are vertical slicing without the jargon — batches should be shaped
so *"teams can work on them in any order, and deploy and validate them independent of other
batches of work"* — and gives a blunt sizing rule: features broken into units completable
*"in hours to a couple days,"* and *"any batch of code that takes longer than a week to
complete and check is too big."*

**The three exec payoffs, strongest first:**

1. **Failure arrives early and cheap.** The whole path is exercised on day one, so the
   integration surprise happens while there is almost no code to unwind. (Hunt: *"you're
   off by a little bit. Well, you still don't have that much code."*) This is the tracer
   metaphor's actual point and it needs no statistics.
2. **Every increment is independently shippable and independently checkable.** Nothing is
   "done except integration." DORA's INVEST-Independent wording carries this in language a
   VP already owns.
3. **No big-bang integration.** The horizontal alternative concentrates all risk into the
   final ticket, at the moment the schedule has least slack.

**Framings to refuse:**

- *"Vertical slicing cuts agent runs 20×"* — see §1. Fabricated by transmission.
- *"Vertical slicing makes AI reliable"* — nothing measures this. DORA's finding is that
  small batches *amplify* AI's product-performance benefit and act as a *safety net*; it is
  a moderator, not a fix.
- *"Agents can run the whole board in parallel"* — the skill has no dispatch mode
  (§4), and Anthropic says coding parallelises worse than research.
- *"This is proven practice"* — it is **established** practice (1999 book, DORA capability
  model) with **one** measured leg (batch size, delivery outcomes) and **no** measured leg
  on slice orientation for agents. Say established, not proven.

**Craft wisdom dressed as measurement — the flags for this chapter.** The twenty-runs
figure (§1); "three quarters of them rework" (same anecdote, same fate); "cascading
failures" as a named mechanism (invented at the summary step); and any implication that
"single fresh context window" is a measured sizing rule — it is a heuristic in the
SKILL.md, and the *measured* neighbour is METR/Ord on duration, which is a different
quantity.

---

## May-claim

Each of these is backed by a source opened directly and cited above.

- A **tracer bullet** is a thin path fired through every layer at once, kept and grown into
  the shipped system — Hunt & Thomas, Tip 20; Artima interview.
- A **prototype** answers a question; its **answer** is kept and its code never enters
  `main` — `/prototype` SKILL.md rule 6 and the public doc. (Say "never merges into main,"
  not "thrown away.")
- **A vertical slice can be verified on its own; a horizontal slice cannot** — definitional,
  and stated as such in `to-tickets` docs and the SKILL.md's `<vertical-slice-rules>`.
- **The test question:** *"What can I demo when this is done?"* A ticket with no answer is a
  horizontal slice — `to-tickets` doc, verbatim.
- **Each ticket declares its blocking edges; a ticket whose blockers are done is on the
  frontier and can be started immediately** — SKILL.md §3 and §5.
- **Dispatch is manual** — the skill produces the artifact, a human opens one session per
  unblocked ticket. (Only if the mechanism comes up; it protects against over-promising.)
- **Agent success rate falls as tasks get longer** — METR 50%-time-horizon; Ord's
  constant-hazard/half-life model. Cite for *smaller*, never for *vertical*.
- **DORA: AI adoption raises throughput and instability together; working in small batches
  is the named countermeasure and a "safety net for AI adoption"** — dora.dev, first-party.
- **DORA sizing:** work sized in hours to a couple of days; anything over a week to complete
  and check is too big.
- **Wide refactors are the exception** — expand → migrate in batches → contract, per
  SKILL.md. (Note-only unless a room member raises "our changes touch everything," which at
  ASML is likely; it is a good, specific answer.)

## Must-not-claim

- ❌ **"Up to twenty agent runs per ticket."** One team, unnamed, unlinked, uncontrolled,
  and re-quantified in transmission. Never on a wall, in a note, or spoken.
- ❌ **"About three quarters rework."** Same anecdote; same ruling.
- ❌ **"Cascading failures"** as the named mechanism for horizontal-slice cost. Introduced by
  our research doc; absent from every primary source.
- ❌ **Any figure for vertical-vs-horizontal improvement.** No such comparison exists.
- ❌ **"Well documented"** applied to horizontal-slicing consequences. The primary source
  says it, then supplies one story. We do not inherit the phrase.
- ❌ **The Co-Coder numbers (68.1% / 34.1% / 60% cost inflation) on screen.** Unrefereed
  preprint, machine-derived partitions, wrong baseline. Presenter ammunition only.
- ❌ **The 90.2% multi-agent figure as an argument for parallel coding agents.** It is a
  research eval, and the same post says coding parallelises worse.
- ❌ **"The prototype is thrown away / deleted."** Contradicts our own installed skill.
- ❌ **Anything about Ralph, AFK loops, Docker sandboxing or the integrator role** — map #63,
  decision 9 and Out of scope. Never graduates.

## Held answers

- **"Where's the number?"** — *"There is one in circulation: one team, twenty-six tickets
  cut by layer, about twenty agent runs per closed ticket. It is one team's own
  retrospective with no control group, so we don't put it on a wall. The argument doesn't
  need it: a slice that only builds one layer has nothing to test against until the other
  layers land. That is geometry, not statistics."*
- **"Isn't this just agile user stories re-branded?"** — *"Yes, and that's the point. The
  tracer bullet is from 1999. What changed is who consumes the ticket: a session with no
  memory of the meeting, whose success rate falls with the length of the job. The old
  discipline got a new reason to hold."*
- **"Does this touch our toolchain?"** — Polarion / SEG / PlantUML: named, not shown
  (map #63, decision 4). The blocking edges are whatever the tracker natively supports;
  GitHub has `--blocked-by`, and local markdown files work too.
- **"Can't we just run fifty agents on the board?"** — the frontier is only as wide as the
  DAG allows, dispatch is manual, and Anthropic's own engineering post says coding has
  fewer truly parallelisable tasks than research and that dependency-heavy domains are a
  poor fit today.
- **"Has anyone actually run this?"** — yes: this chapter. Parent map, research and build
  tickets with real blocking edges, parallel sessions in separate worktrees taking only
  unblocked work. Spoken, not shown (decision 6).
- **"Our changes touch thousands of call sites — vertical slicing can't work here."** —
  correct, and the skill says so: wide refactors are the documented exception, sequenced
  expand → migrate → contract, with green promised at the integrate ticket. Naming this
  unprompted buys enormous credibility in a room that builds one machine out of a hundred
  thousand parts.
- **"What if the AI slices it horizontally anyway?"** — it does, sometimes; the docs admit
  it. The quiz step is the guard, and the one question is *"what can I demo when this is
  done?"*

---

## Candidate image

**Two stacks, one gun.** Exec resolution means four layers and two colours — no more.

Draw the same four horizontal bands twice, labelled once down the left: **UI · API ·
Logic · Data**. This is a machine company; the bands can read as the layers of any
subsystem, not just software.

- **Left panel — horizontal.** Three wide bars, each filling one band completely, tinted
  ASML blue at three tints. Nothing spans the bands. A single dashed line at the bottom
  labelled **"first working thing: after ticket 3"** — placed at the very bottom edge so
  the eye reads *late*. All three bars carry a small grey "?" instead of a tick: nothing
  can be checked.
- **Right panel — vertical.** Three narrow columns, each cutting cleanly through all four
  bands, in ASML orange. Column 1 already carries a tick and the caption **"demoable."**
  Columns 2 and 3 are drawn but untinted — not yet built. The dashed line sits at the top,
  labelled **"first working thing: after ticket 1."**

The whole argument is in where the dashed line sits, and that is legible in about two
seconds without reading a word. Caption underneath, one line: **"Same work. Different cut.
One of them can be checked on Tuesday."**

Fragment order, if the slide is built as fragments: bands → left panel → the late dashed
line (let it land) → right panel → the early dashed line → caption. The tick on column 1
is the beat to speak over.

Deliberately **not** in the image: run counts, percentages, agent icons, arrows between
tickets. Everything in that list is either unsourced (§1) or turns a five-second picture
into a diagram someone has to decode.

**Second, smaller candidate** — for the prototype/tracer distinction if it earns a beat: a
`main` line running left to right, with a tracer bullet's column **merging into it and
staying**, and a prototype's column **branching off and stopping**, its branch labelled
`prototype/*`, with a single arrow labelled **"the answer"** returning to `main`. It
encodes the §2 table in one picture and gets the "never merged, not deleted" nuance right
by construction.

---

## Sources

Primary sources opened directly:

- [mattpocock/skills — `docs/engineering/to-tickets.md`](https://github.com/mattpocock/skills/blob/main/docs/engineering/to-tickets.md)
  — fetched raw and read in full: the tracer-bullet/horizontal definitions, the unattributed
  twenty-runs anecdote (line 29), "no auto-dispatch mode," the wide-refactor exception, the
  "what can I demo" test.
- [mattpocock/skills — `docs/engineering/prototype.md`](https://github.com/mattpocock/skills/blob/main/docs/engineering/prototype.md)
  — "throwaway is a constraint on how the code is written, not a promise to destroy it"; the
  `prototype/<name>` branch; the explicit change of doctrine.
- `.claude/skills/to-tickets/SKILL.md` (installed, this repo) — `<vertical-slice-rules>`,
  blocking edges, frontier, expand–contract. **Contains no numbers.**
- `.claude/skills/prototype/SKILL.md` (installed, this repo) — rule 6, capture on a
  throwaway branch out of main.
- [pragprog.com/tips](https://pragprog.com/tips/) — publisher's tip list: Tip 20 "Use Tracer
  Bullets to Find the Target" (p. 51), Tip 21 "Prototype to Learn" (p. 57).
- [Artima — Tracer Bullets and Prototypes](https://www.artima.com/articles/tracer-bullets-and-prototypes)
  — Bill Venners interviewing Andy Hunt and Dave Thomas, 21 Apr 2003; the kept-vs-facade
  distinction, the western-movie town, "you still don't have that much code."
- [DORA — Working in small batches](https://dora.dev/capabilities/working-in-small-batches/)
  — definition, "amplifies the positive impact of AI adoption on product performance,"
  "safety net for AI adoption," INVEST-Independent, the hours-to-days / one-week sizing rule.
- [DORA — Balancing AI tensions](https://dora.dev/insights/balancing-ai-tensions/)
  — AI adoption associated with higher throughput *and* higher delivery instability; small
  batches as "a critical countermeasure to the risks of AI-assisted development."
- [Anthropic — How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)
  — the 90.2% internal-eval figure, ~15× token usage, and the explicit caveat that coding
  has fewer truly parallelisable tasks and dependency-heavy domains fit poorly.
- [METR — Measuring AI Ability to Complete Long Tasks](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/)
  ([arXiv:2503.14499](https://arxiv.org/abs/2503.14499)) — the 50%-task-completion time
  horizon; success rate fitted against human task duration.
- [Toby Ord — Is there a half-life for the success rates of AI agents?](https://arxiv.org/abs/2505.05115)
  — constant per-minute failure hazard; exponential decay of success with task length.
- [Jimenez et al. — SWE-bench (ICLR 2024)](https://arxiv.org/abs/2310.06770) and the
  [evaluation guide](https://www.swebench.com/SWE-bench/guides/evaluation/) — task instances
  resolved when "the patch made the required tests pass."
- [Yang et al. — When Parallelism Pays Off: Cohesion-Aware Task Partitioning for Multi-Agent
  Coding](https://arxiv.org/html/2606.00953) (arXiv:2606.00953v1, 31 May 2026) — DevEval
  68.1% vs 56.8%, CodeProjectEval 34.1% vs 20.1%, file-based parallelism +60% cost for +3.2%
  quality, edge-density correlation r = 0.65. **Unrefereed preprint.**
- [The role of slicing in test-driven development](https://arxiv.org/abs/2407.13258)
  (arXiv:2407.13258) — TDD-cycle-as-vertical-slice framework with an industry experiment;
  abstract read, **no vertical-vs-horizontal comparison found**.

Secondary source under examination (not a citable authority):

- `privates/op-mdl/matt-deep-res.md`, line 59 — the "often requiring up to twenty agent runs
  per ticket due to cascading failures" formulation. Git-ignored; read from the working tree.

Searched for and **not found** (recorded so nobody re-runs it):

- Any controlled comparison of vertical vs horizontal slicing on agent success rate, rework
  or run count.
- Any published post-mortem matching the "26-ticket stack — corpus, producer, aggregator,
  selector" description.
- Any documented results for dependency-ordered parallel agent execution driven by
  *human-authored* tickets, as opposed to machine-derived dependency graphs.
