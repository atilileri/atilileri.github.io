# Grilling in batches — the frontier rule, and what it actually prevents

**Question:** Chapter 5's planning slide absorbs the grill-in-batches short (map [#63](https://github.com/atilileri/atilileri.github.io/issues/63), decision 3) and grounds the chapter's flagship image. So: (1) what exactly *is* the frontier rule, and is it craft or science? (2) is *"twenty questions into three rounds"* sourced? (3) does front-loading questions reduce **factuality** hallucination, as Atil's brief says — or a different failure entirely? (4) is there evidence that structured elicitation closes the underspecification gap chapter 4 opens on? (5) what is the wayfinder's exact four-quadrant vocabulary and fog-vs-ticket test?

**Date:** 2026-08-15
**Ticket:** [#68](https://github.com/atilileri/atilileri.github.io/issues/68) · map [#63](https://github.com/atilileri/atilileri.github.io/issues/63) · blocks [#70](https://github.com/atilileri/atilileri.github.io/issues/70), [#71](https://github.com/atilileri/atilileri.github.io/issues/71)

---

## TL;DR verdict

**Five answers, and two of them are traps caught before they reached a wall.**

1. **The frontier rule is exactly specified, and it is craft — a textbook graph algorithm
   applied to an interview.** The rule (`grilling/SKILL.md`, verbatim): *"A question whose
   answer depends on another question still open in this round belongs to a later round,
   not this one."* Structurally this is **level-synchronous topological ordering** of a DAG
   (Kahn's algorithm: all zero-indegree nodes form one level, processed together). The
   *algorithm* is textbook; the *application to human elicitation* is Pocock's, and no
   citation exists in any of his material. Nearest published cousins — Design Structure
   Matrix partitioning and the decision-analysis **decision hierarchy** — are real
   analogues but are not his sources. **Say "a way of working," never "research shows."**
2. **"Twenty questions into three rounds" is wrong, and the correct figure is still not a
   measurement.** Pocock's own docs say **thirteen**, not twenty: *"Thirteen questions
   typically land in about three rounds rather than thirteen."* `matt-deep-res.md`
   inflated 13 → 20. And the installed `SKILL.md` — the primary source — contains **no
   number at all**. Both figures are **must-not-claim**. See §2.
3. **No. Front-loading questions does not reduce factuality hallucination.** It reduces
   **underspecification** — building the wrong thing — which is not hallucination under
   either branch of chapter 2's fork. This is a genuine copy trap: the room has already
   been taught what "factuality" means. The stage that *does* buy factuality is
   **`/research`**, and `to-spec`'s seam agreement buys a second, narrower slice. See §3
   — this is the headline finding.
4. **Yes, there is a bridge, and it is measured.** ClarifyGPT (ACM FSE 2024): a
   clarification round before generation lifts GPT-4's average Pass@1 from **68.02% →
   75.75%** across four code benchmarks. Plus Laban et al.'s CONCAT control: consolidating
   a drip-fed brief into one instruction restores performance to **95.1%** of the
   fully-specified baseline, against **39%** average loss when it stays drip-fed. The
   bridge back to *four in ten* is **no longer rhetorical** — but it is a bridge, not a
   causal chain, and §4 says exactly how far it carries.
5. **Quadrant vocabulary established verbatim, with one structural correction:** the map
   body has **five** sections, not four. `Notes` is the fifth and `matt-deep-res.md` drops
   it. Also, **"quadrant" is not Pocock's word** — it appears nowhere in `wayfinder/SKILL.md`
   or on aihero.dev. It is the research doc's coinage, inherited by our brief. Fine to use
   as a *visual* device; do not attribute it. See §5.

---

## 1. The design tree and the frontier rule

### The mechanism, exactly as specified

From the installed `.claude/skills/grilling/SKILL.md` (pinned in `skills-lock.json` to
`mattpocock/skills`, hash `4ebdd12f…`) — quoted in full because the slide will be checked
against it:

> Interview the user relentlessly until you reach a shared understanding. Map this as a
> **design tree**: every decision branches into the decisions that hang off it.
>
> Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are
> already settled — the questions you can ask _now_ without guessing at answers you haven't
> heard yet. Ask the whole frontier in one round: number each question and give your
> recommended answer. Then wait for the user's answers before the next round.
>
> Each round the user answers reshapes the tree — settled decisions push the frontier
> outward and unblock questions that depended on them. Recompute the frontier and ask the
> next round. **A question whose answer depends on another question still open in this
> round belongs to a _later_ round, not this one.**

Three further rules the skill states that the slide should not lose:

- **The question format is fixed** — `❓ **Q1** - **<title>**: <body>` then `➡️ <recommended
  answer>`. Pocock's prose docs give the reason: *"That is what makes a round answerable by
  number — '1 yes, 2 the second option, 3 no, here's why' — instead of by quoting questions
  back."* This is the visual detail worth putting on a wall: **every question ships with the
  agent's own recommendation**, so the human's job collapses to *confirm or overrule*.
- **Facts are the agent's job, decisions are the human's.** *"Finding facts is your job,
  never the user's… dispatch a sub-agent… The decisions are the user's."* And: *"a grilling
  agent that answers its own questions has broken this"* (`wayfinder/SKILL.md`, HITL
  definition). A running sub-agent is *itself an unsettled prerequisite* — only questions
  downstream of it wait.
- **The stop condition is human, not structural.** *"The session is done when the frontier
  is empty… Do not act on it until the user confirms you have reached a shared
  understanding."* Pocock's prose sharpens it: *"The skill is not finished when the frontier
  empties, it is finished when you say the understanding is shared."*

### Is it grounded in literature, or is it Pocock's own?

**Pocock's own, and he cites nobody.** Neither `SKILL.md`, the repo's `docs/` page, nor the
aihero.dev write-up references any elicitation, requirements-engineering or decision-analysis
work. Treat the rule as **craft with a clean structural justification**, not as a result.

The clean structural justification, which is safe to say and is the honest version of "why
it works":

- **It is level-synchronous topological ordering.** Model the decisions as a DAG. Kahn's
  algorithm repeatedly takes every node with in-degree zero — every decision whose
  prerequisites are settled — and processes that whole set as one level before releasing its
  successors. The frontier *is* the zero-in-degree set; a round *is* one level. This is
  textbook CS, not a claim, and it explains the guarantee the skill asserts: **no answer in a
  round can invalidate another question in that round**, so no round is ever wasted.
- **The nearest published cousin is Design Structure Matrix partitioning.** DSM partitioning
  reorders a dependency matrix into blocks so that independent activities run in parallel and
  dependent ones sequence, minimising feedback and rework. That is the same operation on the
  same object — and it is *engineering-process* literature an ASML room may well know. **Use
  it as an analogy if challenged; do not present it as Pocock's source.**
- **The nearest decision-analysis cousin is the decision hierarchy** (Howard-lineage
  decision analysis): policy decisions taken as given, strategic decisions in focus, tactical
  decisions deferred until the strategic ones are settled. That is the *same instinct* —
  don't decide downstream things before upstream things — and it maps better onto the
  wayfinder's quadrants (§5) than onto the frontier rule.
- **The cognitive-load claim is the weak link.** `matt-deep-res.md` asserts the batching keeps
  *"cognitive load on the human manageable."* Requirements-engineering research does establish
  that elicitation interviews impose heavy cognitive load and that load degrades interviewer
  performance — but that literature is about the **interviewer's** load, not the
  interviewee's, and nothing in it tests batched-vs-sequential questioning. **Do not put a
  cognitive-load mechanism on screen.** The defensible version is about *turns*, not
  cognition: batching converts N sequential exchanges into ~3, and each round arrives
  pre-answered.

**Slide-safe framing:** *"Every question that can be asked yet, asked at once — with the
answer it recommends. Two questions never share a round if one depends on the other."* That
is the whole mechanism, in the skill's own terms, claiming nothing it cannot back.

---

## 2. The compression claim — sourced or synthesised?

**Synthesised, and mis-transcribed on the way.** Chase completed; here is the chain.

| Source | Status | What it says |
|---|---|---|
| `.claude/skills/grilling/SKILL.md` (installed, pinned) | **PRIMARY** | **No number.** Rounds continue until the frontier is empty. Condition-based, not numeric. |
| `mattpocock/skills` → `docs/productivity/grilling.md` | Pocock's prose | *"typically compresses roughly a dozen questions into three rounds"* |
| aihero.dev, *The /grilling Skill* | Pocock's prose | *"Thirteen questions typically land in about three rounds rather than thirteen."* |
| `privates/op-mdl/matt-deep-res.md`, line 43 | **Secondary, ours** | *"typically compressing what would be **twenty** questions into three highly focused rounds"* |

Two separate defects:

1. **The number was inflated.** Pocock says **thirteen** (or "roughly a dozen").
   `matt-deep-res.md` says **twenty**. Nothing upstream supports twenty. The deep-research
   doc appears to have carried the *other* "twenty" on its own page — line 59's *"up to
   twenty agent runs per ticket"* about horizontal slicing — across into this sentence.
2. **Even the correct number is illustrative, not measured.** *"Thirteen… typically… about
   three"* is a worked example in an author's marketing prose. There is no study, no N, no
   distribution. It is a plausible arithmetic consequence of a tree of depth three — which
   is to say, it is a description of the shape, dressed as a statistic.

**Verdict: must-not-claim, both figures.** If the room wants a sense of scale, the honest
substitute costs nothing and is *this deck's own evidence*: map #63 was charted in **three
batched grilling rounds**, and map #42's chapter-4 spine likewise. That is a first-party,
verifiable, on-the-record fact about work the presenter did — infinitely stronger in front of
executives than a borrowed number.

---

## 3. "Minimizes factuality hallucinations" — the copy trap ⚠️

**This is the headline finding, and Atil's brief and the skills disagree.**

Atil's brief attaches *"minimizes factuality hallucinations"* to the whole planning stage —
research, prototype and grilling together. Chapter 2's fork and
[`docs/research/hallucination-fixes.md`](https://github.com/atilileri/atilileri.github.io/issues/49)
have already taught this room a precise meaning for that word. Run the brief through it and
it fails for two of the three stages.

### What the taxonomy the deck already owns actually says

Huang et al.'s survey (ACM TOIS 2025), as established in `hallucination-fixes.md`:

- **Factuality hallucination** — output inconsistent with **real-world facts**, or
  unverifiable against established knowledge (*factual fabrication* — the invented API, the
  package that does not exist).
- **Faithfulness hallucination** — output inconsistent with **the user's provided
  instructions and context**, or internally incoherent.

Chapter 2's operational hinge: *was the information in the context?*

### Now run grilling through the hinge

The failure grilling prevents is: **the user never said what they wanted, so the agent
assumed, and built the wrong thing.** Ask the hinge — *was the information in the context?* —
and the answer is **neither**. The information did not exist anywhere yet. There is no
real-world fact being contradicted (so not factuality) and no supplied instruction being
ignored (so not faithfulness). **It is not hallucination at all.** It is a **requirements
defect**, and the artefact is downstream of a human who did not say enough.

This is structurally the *same* category error `hallucination-fixes.md` §4 already caught
with specification gaming, and the same one research
[#39](https://github.com/atilileri/atilileri.github.io/issues/39) caught with `Agent` on the
rings slide. **Chapter 5 must not commit it a third time on its flagship image.**

### The failure grilling *does* prevent, measured

Laban et al., *LLMs Get Lost In Multi-Turn Conversation* (arXiv 2505.06120, ICLR 2026 best
paper) — 6 tasks, 15 models, 200,000+ simulated conversations:

- The same instructions delivered **incrementally** rather than all at once cost an
  **average 39% drop** in performance.
- The drop is *"a minor loss in aptitude and a large rise in unreliability."*
- The mechanism, verbatim: models *"make assumptions in early turns and prematurely attempt
  to generate final solutions, on which they overly rely,"* and *"when LLMs take a wrong turn
  in a conversation, they get lost and do not recover."*

That is the failure, named by measurement: **premature commitment under underspecification.**
Not fabrication. And note the pleasing symmetry — the paper's mechanism is the *model* doing
exactly what the frontier rule forbids the *agent* from doing: answering downstream questions
before the upstream ones are settled.

### Which planning stage buys which fix

The brief's error is bundling. Unbundled, each stage earns a *different* and *defensible*
claim — and this is better slide material than the bundle was:

| Stage | What it actually reduces | Evidence |
|---|---|---|
| **`/research`** | **Factuality.** Puts primary sources in the window instead of parametric memory. | Jain et al. (CloudAPIBench): docs supplied lifts GPT-4o low-frequency API valid-invocation **38.58% → 47.94%**. `matt-deep-res.md` line 118 makes exactly this attribution — *"entirely avoiding the hallucination risks associated with querying an LLM's parametric memory"* — and attaches it to `/research`, **not** to grilling. |
| **`/grilling`** | **Underspecification** — building the wrong thing. Not hallucination. | Laban et al.: 39% average drop from drip-fed instructions; CONCAT control at 95.1% of baseline. |
| **`/prototype`** | **Design uncertainty** — "how should it look/behave," where prose cannot settle it. | `wayfinder/SKILL.md`: *"Raise the fidelity of the discussion by making a cheap, rough, concrete artifact to react to."* Epistemic, not accuracy. |
| **`/to-spec`** | A narrow slice of **faithfulness**, twice over. | (a) Seams agreed up front *"prevents the downstream implementation agent from hallucinating arbitrary interfaces"* (`matt-deep-res.md` line 54 — and the skill itself mandates seam agreement with the user). (b) The consolidated spec is then executed in a **fresh context**, which is the faithfulness fix chapter 4 already taught. |

### The line to put on the wall

> **Research stops it inventing facts. Grilling stops you finding out, three days later,
> that you asked for the wrong thing.**

Two different failures, two different fixes, and both are already in the room's vocabulary
from chapter 2 and chapter 4. **This is the correction, and it strengthens the slide** — the
bundled version claimed one thing weakly, the unbundled version claims two things each with a
source.

**Presenter note to hold:** *"Isn't that just hallucination?" — No. Hallucination is when it
invents something. This is when nobody ever said. The agent did what it was told; it just
wasn't told enough. That is the one failure mode you cannot fix with better context, because
the context didn't exist yet.*

---

## 4. Does structured elicitation close the four-in-ten gap?

**Partly, and it is now more than rhetorical — but the chain has three links and only two of
them are measured.**

The chapter-4 opener's number, restated from
[`docs/research/constraining-search-space.md`](https://github.com/atilileri/atilileri.github.io/issues/43):
OpenAI had **93 experienced Python developers** annotate 1,699 SWE-bench samples; **38.3%
were flagged for underspecified problem statements**; 68.3% filtered in total. Chapter 4's
locked presenter note already forbids the strong causal reading (*"DO NOT SAY: specifying the
task doubles performance"*) because bad **tests** were removed at the same time as bad specs.
**That prohibition still binds. Nothing found here lifts it.**

What *is* available is separate evidence — different experiments, not a rescue of the
SWE-bench Verified delta:

### Link 1 — clarification before generation improves correctness. **Measured.**

**Mu et al., ClarifyGPT** (arXiv 2310.10996; *Proc. ACM Software Engineering* / FSE 2024,
DOI 10.1145/3660810). The framework detects ambiguous requirements, asks targeted clarifying
questions, then generates:

- **GPT-4, average across four benchmarks: 68.02% → 75.75% Pass@1.**
- **ChatGPT, average: 58.55% → 67.22% Pass@1.**
- Best single result: **GPT-4 on MBPP-sanitized, 70.96% → 80.80%.**
- Benchmarks: HumanEval, HumanEval-ET, MBPP-sanitized, MBPP-ET.
- **Human evaluation** with ten participants answering the questions: relative Pass@1
  improvement **up to 16.83%**.

**Caveat that must travel with the number:** the headline per-benchmark gains are from
**simulated feedback** — an LLM answering as the user *with access to the ground truth*,
which is an upper bound, not a human. The **human-evaluation** figure (up to 16.83% relative)
is the honest one to quote if a number is quoted at all. And the tasks are function-level
benchmark problems, not features.

**Corroboration that the behaviour is not free:** *ClarifyCoder* (arXiv 2504.16331) had to
**fine-tune** models to ask before generating, lifting the communication rate to 63% (+40 pp)
— i.e. an untuned model's default is to guess. And *ClarifyCodeBench* finds current LLMs
*"still struggle to identify missing information and ask effective clarification questions."*
**That is the argument for a skill.** The asking is not emergent; you install it.

### Link 2 — consolidating a drip-fed brief restores performance. **Measured.**

Laban et al.'s CONCAT control is the cleanest available evidence and it is a *control*, which
is what makes it strong: the same requirement shards, glued into one turn, score **95.1%** of
the fully-specified baseline, against sharded delivery's 39% average loss. Per-model, GPT-4o:
**Full 93.0 / Concat 90.9 / Sharded 59.1 / Recap 76.6 / Snowball 65.3.**

**That is the grill→spec pipeline, measured.** A grilling pass is a procedure for manufacturing
the CONCAT condition deliberately. And note **Recap 76.6** — restating requirements mid-flight
recovers only part of it. **Specifying up front beats correcting later**, by 14 points on this
model. That is a chapter-5 sentence.

### Link 3 — the gap the evidence does not close

None of this measures **a human grilling session** producing **a better ticket** producing **a
better agent outcome** on **real repository work**. ClarifyGPT is the model asking, on
function-level benchmarks. Laban et al. is simulated conversation. The SWE-bench Verified
audit measured how many specs were bad, not what fixing them buys. **The three links are
sound individually and the composition is inference.**

**Verdict for the chapter:** the bridge back to *four in ten* is **strong enough to walk on,
stated as two facts and one inference, and not strong enough to state as a causal chain.**
The safe construction:

> *Four in ten of those tasks were too vague to grade. When someone asks the missing
> questions first, correctness measurably improves — and consolidating a drip-fed brief into
> one instruction recovers almost all of what drip-feeding costs. That is what this stage is.*

Each clause has its own source. No clause claims the others.

---

## 5. The wayfinder's four quadrants — exact vocabulary

Raw material for the flagship image, from `.claude/skills/wayfinder/SKILL.md`. **Where the
skill and the aihero.dev prose differ in wording, the SKILL.md governs; both are given
because the prose is often the tighter line for a wall.**

### The four names, verbatim

**Destination**
> *SKILL.md (map template):* "what reaching the end of this map looks like — the spec,
> decision, or change this effort is finding its way to. One or two lines; every session
> orients to it before choosing a ticket."
>
> *SKILL.md (body):* "The destination varies per effort, and **naming it is the first act of
> charting** — it shapes every ticket."
>
> *aihero.dev:* "Naming it is the first act of charting, before any ticket exists, because
> **the destination fixes the scope every ticket is measured against**."

**Decisions so far**
> *SKILL.md:* "the index — one line per closed ticket: enough to judge relevance, then zoom
> the link for the detail the ticket holds."
>
> *SKILL.md (body):* "The map is an **index, not a store**… a decision lives in exactly one
> place — its ticket — so the map never restates it, only gists it and links."
>
> *SKILL.md:* "records the route actually walked."

**Not yet specified**
> *SKILL.md:* "in-scope fog you can't ticket yet; graduates as the frontier advances."
>
> *SKILL.md (body):* "the **fog of war** — the dim view of decisions and investigations you
> can tell are coming but can't yet pin down, because they hang on questions still open…
> It's the undiscovered frontier *toward* the destination — **everything here is in scope,
> just not sharp enough to ticket**."
>
> Excludes: what's already decided, what's already a live ticket, what's out of scope.

**Out of scope**
> *SKILL.md:* "work ruled beyond the destination; closed, never graduates."
>
> *SKILL.md (body):* "Fog only ever gathers *toward* the destination. The destination fixes
> the scope, so work beyond it is out of scope… **Scope, not sharpness, lands it here**…
> Out-of-scope work never graduates — the frontier stops at the destination."

### The fog-vs-ticket test, verbatim

> **"Fog or ticket? The test is whether you can state the question precisely now — _not_
> whether you can answer it now."**
>
> - **"Ticket when** the question is already sharp — even if it's blocked and you can't act
>   on it yet."
> - **"Not yet specified when** you can't yet phrase it that sharply. Don't pre-slice the fog
>   into ticket-sized pieces: it's coarser than a ticket, and one patch may graduate into
>   several tickets, or none, once the frontier reaches it."

**This is the single best sentence in the whole skill for an executive room**, because it is
the one that transfers straight to how they already run their own programmes. Recommended
on-screen form — short, and it survives being read at the back of a hall:

> **Can you state the question precisely? Ticket it.
> Can't phrase it yet? It's fog — leave it fog.**
> *(You do not need the answer. You need the question.)*

### Three corrections for the image ⚠️

1. **The map has five sections, not four.** `Destination · Notes · Decisions so far · Not yet
   specified · Out of scope`. `matt-deep-res.md` (line 100) says *"four distinct quadrants"*
   and silently drops **Notes** — which is where the domain, the skills to consult, and the
   standing preferences live, and is precisely what map #63 uses most heavily. A four-panel
   visual is a legitimate *design* choice; **the claim "the map has four quadrants" is not
   accurate** and should not be spoken.
2. **"Quadrant" is our word, not Pocock's.** It appears nowhere in `wayfinder/SKILL.md` nor on
   aihero.dev; both call them **sections** of the map body. Use "quadrant" freely as a visual
   device, never as a quotation.
3. **These are sections of *one issue*, not four buckets of tickets.** The map body is a
   single low-res issue loaded once per session; the tickets are its **child issues**, and
   **open tickets are deliberately not listed on the map** — *"Open tickets are **not** listed —
   they are open child issues, found by query."* If the image implies the map contains its
   tickets, it teaches the room the wrong artefact.

### The rest of the vocabulary the visual will want

- **Ticket** — a child issue whose body is *"## Question"*, *"sized to one 100K token agent
  session"*, carrying a `wayfinder:<type>` label: `research` · `prototype` · `grilling` ·
  `task`.
- **Decision tickets, not build slices** — *"questions whose resolution is a decision, not
  slices of a build to execute."*
- **Claim** — *"A session claims a ticket by assigning it to the dev driving the map, first,
  before any work… an open, unassigned ticket is unclaimed."*
- **Frontier (wayfinder's)** — *"the open, unblocked, unclaimed children — the edge of the
  known."* **Note the deliberate echo:** the same word means the same thing one zoom level up.
  Grilling's frontier is the askable questions inside a session; wayfinder's is the takeable
  tickets across sessions. **This is the meta-device the chapter's flagship image is built on,
  and it is real, not a rhetorical flourish** — the skills use the identical rule at both
  scales. `/to-tickets` makes it three: *"a directed acyclic graph (DAG) of blocking edges…
  so that parallel agents only pick up unblocked tasks on the frontier."*
- **HITL vs AFK** — *"worked with a human who speaks for themselves"* vs *"driven by the agent
  alone."* Grilling and prototype are HITL; research is AFK. *"A grilling agent that answers
  its own questions has broken this."*
- **Plan, don't do** — *"The pull to just do the work is usually the signal you've reached the
  edge of the map and it's time to hand off."*
- **Refer by name** — *"A wall of `#42, #43, #44` is illegible; names read at a glance."* A
  free, concrete design constraint for the image: **label the tickets with titles, not
  numbers.**

**On locked decision #6 (generic example):** the vocabulary above is entirely domain-neutral —
Destination / Decisions / fog / out of scope / ticket / frontier. A clean invented example
(the skill's own: *"What is the optimal caching strategy for the aggregator layer?"*) carries
it without any deck jargon.

---

## may-claim

Each of these has a source above and survives a challenge.

1. **"Two questions never share a round if one depends on the other."** Verbatim mechanism
   from `grilling/SKILL.md`. Attribute as *how the skill works*.
2. **"Ask the whole frontier in one round — every question whose prerequisites are already
   settled, and nothing else."** Verbatim.
3. **"Every question arrives with the answer the agent recommends."** Verbatim (`➡️` line).
   The strongest single detail for the visual.
4. **"Finding facts is the agent's job. The decisions are yours."** Verbatim, and it is the
   chapter's *human moves up a level* argument in one line.
5. **"The session ends when you say the understanding is shared, not when the questions run
   out."** Verbatim (SKILL.md + prose).
6. **"Structurally this is a dependency graph walked one level at a time."** Textbook
   (Kahn / topological levelling). Safe as *explanation*, not as evidence.
7. **"Our own chapter-4 and chapter-5 maps were each charted in three batched rounds."**
   First-party, on the record in issues #42 and #63. **Use this instead of any borrowed
   number.**
8. **"Grilling reduces underspecification — building the wrong thing."** Laban et al.: 39%
   average drop from drip-fed instructions across 15 models and 200k+ conversations.
9. **"Consolidating a drip-fed brief into a single instruction recovers almost all of what
   drip-feeding costs — 95.1% of the fully-specified baseline."** Laban et al., CONCAT
   control.
10. **"Specifying up front beats correcting later."** Laban et al., GPT-4o: Concat 90.9 vs
    Recap 76.6.
11. **"Asking the missing questions before generating measurably improves correctness."**
    ClarifyGPT, GPT-4 68.02% → 75.75% Pass@1 across four benchmarks (FSE 2024). Quote the
    **human-evaluation** framing if a number goes on screen.
12. **"Models do not ask by default — you have to install the asking."** ClarifyCoder
    (fine-tuning needed, +40 pp communication rate) and ClarifyCodeBench.
13. **"Research is what stops it inventing facts."** Jain et al., 38.58% → 47.94% — already
    owned by `hallucination-fixes.md` and chapter 4.
14. **All quadrant definitions and the fog-vs-ticket test**, as quoted in §5.
15. **"Four in ten SWE-bench tasks were too vague to grade fairly."** 93 annotators, 38.3%
    (unchanged from #43; the existing caveat still binds).

## must-not-claim

1. ❌ **"Twenty questions into three rounds."** Not in any source. `matt-deep-res.md` line 43
   is wrong; the upstream figure is thirteen. **Correct the source note.**
2. ❌ **"Thirteen questions into three rounds"** *as a measurement*. It is an author's worked
   example in marketing prose, absent from the installed skill. Illustration only, and better
   replaced by may-claim #7.
3. ❌ **"Grilling minimises factuality hallucinations."** The chapter's most likely
   self-inflicted wound. It reduces underspecification, which is not hallucination under the
   taxonomy chapter 2 already taught. See §3.
4. ❌ **"The planning stage minimises hallucination"** as one undifferentiated claim. Unbundle:
   research → factuality; grilling → underspecification; prototype → design uncertainty;
   to-spec → a slice of faithfulness.
5. ❌ **"Research shows batched questioning reduces cognitive load."** No study tests batched-
   vs-sequential elicitation. The RE cognitive-load literature is about the *interviewer's*
   load. Say *fewer turns*, not *less load*.
6. ❌ **Attributing the frontier rule to DSM, decision analysis, or any published method.**
   Structural analogues only; Pocock cites nobody.
7. ❌ **"Specifying the task doubles agent performance"** (SWE-bench 16% → 33.2%). Still
   confounded — bad tests were removed alongside bad specs, and were flagged *more* often
   (61.1% vs 38.3%). Chapter 4's locked prohibition stands.
8. ❌ **"Grilling produces a complete specification."** Laban et al.: consolidation recovers
   *much* of the gap, not all (Concat 90.9 vs Full 93.0). Grilling narrows
   underspecification; it does not abolish it.
9. ❌ **"The wayfinder map has four quadrants."** Five sections; `Notes` is real and load-
   bearing. "Quadrant" is our visual device, not Pocock's word.
10. ❌ **Presenting ClarifyGPT's per-benchmark gains as human-in-the-loop results.** They are
    largely **simulated feedback** with ground-truth access. The human-evaluation figure is
    up to **16.83% relative**.
11. ❌ **"Every grilling produces ADRs and a glossary."** `domain-modeling/SKILL.md`: create
    files **lazily**, and offer an ADR only when *all three* of hard-to-reverse, surprising-
    without-context, and a real trade-off hold. `matt-deep-res.md` overstates this as "two
    vital artifacts" produced as a matter of course.
12. ❌ **Any claim that a grilling session measurably improves real repository outcomes.** No
    such study found. The three links in §4 compose by inference.

## Held answers — for challenges from the room

**"Is any of this actually research, or is it just one person's blog?"**
> The batching rule is a way of working, not a finding — and it doesn't need to be more than
> that, because structurally it's just a dependency graph walked one level at a time. What
> *is* research is the failure it addresses: fifteen models, two hundred thousand
> conversations, and instructions delivered a bit at a time cost thirty-nine percent of
> performance. The rule is craft. The problem is measured.

**"Doesn't asking twenty questions before starting slow everything down?"**
> It's about three rounds, and every question comes with the answer it recommends — so you're
> confirming or overruling, not composing. And the alternative was measured: restating
> requirements mid-flight recovered a GPT-4o score to 76.6 where getting it right up front
> reached 90.9. You pay either way. Up front is cheaper.

**"Isn't 'it built the wrong thing' just hallucination?"**
> No, and the distinction is the one chapter two drew. Hallucination is when it invents
> something. This is when nobody ever said. It did what it was told; it just wasn't told
> enough. That is the one failure you can't fix with better context, because the context
> didn't exist yet. *(If they push: the model's actual behaviour has a name — it makes
> assumptions early and then over-relies on them.)*

**"So the AI decides what to build?"**
> The opposite, and the skill is explicit: finding facts is the agent's job, the decisions are
> yours. An agent that answers its own questions has broken the skill. What changed is that
> you stopped being asked things the agent could have looked up.

**"We already do requirements gathering. What's new?"**
> Two things. The ordering is enforced rather than remembered — no question is asked before
> the thing it depends on is settled. And the output is a machine-readable artefact the next
> session actually reads, instead of a document someone files. If you want the nearest thing
> you already know: it's DSM partitioning applied to an interview.

**"Where's the evidence better specs make agents better?"**
> Closest is a 2024 ACM paper: have the model ask clarifying questions before it generates,
> and GPT-4's pass rate goes from sixty-eight to seventy-six percent across four benchmarks.
> Two honesties: much of that used a simulated user with the right answer in hand, and those
> are function-level problems, not features. It points the right way; I wouldn't build a
> business case on it.

**"Do the models not just ask when they're unsure?"**
> Measurably not. One team had to fine-tune a model specifically to ask instead of guess and
> lifted its asking rate by forty points; the benchmark built for this finds current models
> still struggle to notice what's missing. Left alone, they guess. That's why this is a skill
> you install, not a habit you hope for.

**"Does the four-in-ten number prove better specs fix it?"**
> No, and I'd rather say so. That audit found four in ten task descriptions too vague to
> grade — it measured how bad the specs were, not what fixing them buys. The auditors removed
> unfair tests at the same time, so the score jump is jointly attributable. The number is the
> problem statement, not the proof.

**"Can't the AI just run the whole loop itself?"**
> Held per map #63 decision 9 — Ralph / AFK stays in the notes and off the wall.

---

## Sources

**Primary — read directly:**

- `.claude/skills/grilling/SKILL.md` (installed; `skills-lock.json` → `mattpocock/skills`,
  `skills/productivity/grilling/SKILL.md`, hash `4ebdd12f…`) — design tree, frontier, rounds,
  question format, facts-vs-decisions, stop condition. **Contains no number.**
- `.claude/skills/grill-with-docs/SKILL.md` — seven lines: *"Run a `/grilling` session, using
  the `/domain-modeling` skill."*
- `.claude/skills/wayfinder/SKILL.md` — map body template, all section definitions, fog-vs-
  ticket test, ticket types, HITL/AFK, claiming, frontier, plan-don't-do, refer-by-name.
- `.claude/skills/to-spec/SKILL.md` — no interview; seams agreed with the user before
  implementation; spec template.
- `.claude/skills/domain-modeling/SKILL.md` — CONTEXT.md as glossary only; **lazy** file
  creation; the three-part ADR test.
- [mattpocock/skills — `docs/productivity/grilling.md`](https://github.com/mattpocock/skills/blob/main/docs/productivity/grilling.md)
  — *"roughly a dozen questions into three rounds."*
- [aihero.dev — *The /grilling Skill*](https://www.aihero.dev/skills-grilling) — *"Thirteen
  questions typically land in about three rounds rather than thirteen"*; *"no answer in a
  round can invalidate another question in that round"*; the answer-by-number rationale; the
  confirmation gate.
- [aihero.dev — *The /wayfinder Skill*](https://www.aihero.dev/skills-wayfinder) — section
  definitions in prose form; **confirmed the word "quadrant" does not appear**.
- [Mu et al. — *ClarifyGPT: A Framework for Enhancing LLM-Based Code Generation via
  Requirements Clarification*](https://arxiv.org/abs/2310.10996) (Proc. ACM SE / FSE 2024,
  [10.1145/3660810](https://dl.acm.org/doi/10.1145/3660810)) — GPT-4 68.02% → 75.75% avg
  Pass@1; ChatGPT 58.55% → 67.22%; GPT-4 MBPP-sanitized 70.96% → 80.80%; four benchmarks; ten
  human participants.
- [*ClarifyCoder / Can Code Language Models Learn Clarification-Seeking Behaviors?*](https://arxiv.org/abs/2504.16331)
  — communication rate 63% (+40 pp), good-question rate 52% (+30 pp) after instruction-tuning.

**Secondary / local, and flagged as such in the text:**

- `privates/op-mdl/matt-deep-res.md` (git-ignored, read from the working tree) — lines 40–61
  (grill-with-docs, to-spec, to-tickets), 100–118 (wayfinder quadrants, prototype, research).
  **Two defects found: line 43's "twenty questions" (upstream says thirteen) and line 100's
  "four distinct quadrants" (five sections; `Notes` dropped).**
- [`docs/research/hallucination-fixes.md`](https://github.com/atilileri/atilileri.github.io/issues/49)
  (branch `research/hallucination-fixes`) — the factuality/faithfulness taxonomy, Huang et al.,
  Laban et al. figures, Jain et al. figures, the specification-gaming boundary. **Reused, not
  re-derived.**
- [`docs/research/constraining-search-space.md`](https://github.com/atilileri/atilileri.github.io/issues/43)
  (branch `research/constraining-search-space`) — SWE-bench Verified: 93 annotators, 38.3%
  underspecified, 61.1% unfair tests, 68.3% filtered, GPT-4o 16% → 33.2%, and the confounding
  argument. **Its prohibition is carried forward unchanged.**
- `src/pages/decks/asml-ai/index.astro` §4b — the locked chapter-4 cold-open copy and its
  presenter note (*"DO NOT SAY: specifying the task doubles performance"*).

**Consulted via search index only — analogy material, never to be cited as provenance:**

- **Design Structure Matrix partitioning** — reordering a dependency matrix so independent
  activities run in parallel; feed-forward vs feedback separation. Product-development
  literature; summaries only, no paper opened.
- **Decision hierarchy / strategy table** (Howard-lineage decision analysis) — policy taken as
  given, strategic in focus, tactical deferred. [SmartOrg summary](https://smartorg.zendesk.com/hc/en-us/articles/115002151148-Decision-Hierarchy-and-Strategy-Table);
  no primary text opened.
- **Kahn's algorithm / level-synchronous topological ordering** — textbook; asserted as
  structure, not cited as evidence.
- **Requirements-elicitation cognitive load** — [arXiv 2507.02858](https://arxiv.org/abs/2507.02858)
  and related; establishes *interviewer* load in elicitation interviews, **not** any
  batched-vs-sequential result. Cited here only to rule the cognitive-load claim out.
- **ClarifyCodeBench** — abstract-level only; used for the qualitative "models still struggle
  to ask" point, no number quoted.
