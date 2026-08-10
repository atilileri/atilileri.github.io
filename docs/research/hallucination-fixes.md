# What actually fixes each branch of the hallucination fork

**Question:** Chapter 2's `data-halluc` slide already teaches the fork — *was the
information in the context?* → **factuality** vs **faithfulness** — and promises the
fix "in Best Practices". Chapter 4 has to pay that promise off. So: (1) is the
two-branch taxonomy the field's, or ours? (2) does supplying ground truth measurably
reduce fabricated APIs and invented parameters? (3) is the faithfulness fix genuinely
*fewer tokens*, or is that a plausible inference from the attention story? (4) is
there a third failure mode whose absence would embarrass the fork? (5) does the
presenter note's honest ceiling — *"no, you cannot prevent hallucination outright —
you manage the context window"* — survive scrutiny?

**Date:** 2026-08-10
**Ticket:** [#49](https://github.com/atilileri/atilileri.github.io/issues/49) · map [#42](https://github.com/atilileri/atilileri.github.io/issues/42) · pays off [#41](https://github.com/atilileri/atilileri.github.io/issues/41)

---

## TL;DR verdict

**The fork is sound, both fixes survive, and each survives with one amputation.**

- **The taxonomy is the field's, verbatim.** Huang et al.'s hallucination survey (ACM
  TOIS, 2025) splits LLM hallucination into exactly **factuality** and
  **faithfulness**, and defines faithfulness to include *instruction inconsistency*
  and *context inconsistency* — which is precisely "it had the information and
  ignored it". A technical attendee cannot catch the deck out on the names. What they
  *can* catch it out on is the hinge: the survey's factuality axis is about
  *real-world facts*, not about *what was in the window*. See §1 — the deck's usage is
  defensible but the framing must stay operational, never presented as the survey's
  own test.
- **Factuality — the strongest defensible one-liner:**
  **"Put the reference in the window before it writes, and the fabrications it can
  still make are the ones you didn't put there."** Measured, not asserted: GPT-4o's
  valid-invocation rate on low-frequency APIs rises from **38.58% → 47.94%** when the
  documentation is supplied. **But the same paper measured a 39.02 percentage-point
  *absolute drop* on high-frequency APIs when a sub-optimal retriever supplied the
  wrong docs.** Ground truth helps; *retrieval* helps only if it retrieves the right
  thing. That asymmetry is the chapter's real argument for pasting the reference in
  over wiring up a search. See §2.
- **Faithfulness — the strongest defensible one-liner:**
  **"Same task, same information: a short prompt beats a long one. When a session has
  gone wrong, restart it rather than argue with it."** This is *not* an inference from
  the attention story — it is a measured, within-task result. Chroma's LongMemEval
  runs put the same question with a **~300-token focused prompt** against a
  **~113k-token full prompt** and the focused one wins across all 18 models. And Laban
  et al. (ICLR 2026 best paper) state the practitioner's version outright: *"starting
  a new conversation that repeats the same information might yield significantly
  better outcomes than continuing an ongoing conversation."* See §3.
- **A third failure mode does exist, and it would embarrass the slide — but only if
  the slide claims to be a taxonomy of *all* agent failure.** The gap is
  **specification gaming / reward hacking**: the agent had the information, followed
  it, and satisfied the letter of it — the test passes because it rewrote the timer.
  That is not a hallucination under either definition, and the fork's own question
  ("was the information in the context?") answers *yes* and then routes it to the
  wrong fix. **Recommendation: do not add a third branch. Add one sentence to the
  presenter note that names the boundary.** Sycophancy is the weaker candidate and
  fits *inside* faithfulness. See §4.
- **The ceiling holds, with one amendment.** "You cannot prevent hallucination
  outright" is the consensus and has a formal statement behind it (Kalai et al.,
  OpenAI, 2025: a calibrated pretrained model *must* err at some rate on arbitrary
  facts). **But "you manage the context window" is now only half the honest answer.**
  The same paper's headline finding is that hallucination persists *post-training*
  because benchmarks reward guessing over abstention — a training-incentive cause the
  context window cannot touch. The note should say *you manage the context window* as
  the part **you** control, not as the whole mechanism. See §5.

---

## 1. Is the two-branch taxonomy standard?

**Yes — and it is the standard specifically for the LLM era, which is the useful
version of the answer.**

The canonical reference is **Huang et al., "A Survey on Hallucination in Large
Language Models: Principles, Taxonomy, Challenges, and Open Questions"** (arXiv
2311.05232; published in *ACM Transactions on Information Systems*, 2025). It
explicitly *replaces* the older summarization-era **intrinsic/extrinsic** split with a
two-category taxonomy "tailored for applications involving LLMs":

- **Factuality hallucination** — outputs "that are either inconsistent with
  real-world facts or potentially misleading." Two subtypes:
  - *Factual inconsistency* — "facts that can be grounded in real-world information,
    but present contradictions."
  - *Factual fabrication* — "facts that are unverifiable against established
    real-world knowledge."
- **Faithfulness hallucination** — consistency "with user-provided instructions and
  contextual information," plus internal logical coherence. Three subtypes:
  - *Instruction inconsistency* — "outputs that deviate from a user's directive."
  - *Context inconsistency* — "output is unfaithful with the user's provided
    contextual information."
  - *Logical inconsistency* — "outputs exhibit internal logical contradictions."

The survey's stated reason for the redefinition maps directly onto the deck's
audience: LLMs' "remarkable versatility amplifies the potential for hallucinations
compared to task-specific models," and faithfulness deserves its own headline because
"LLMs are inherently trained to align with user instructions."

**So the names are safe.** Two things about the deck's *usage*, though:

1. **The hinge is ours, not the survey's.** The survey partitions by *what the output
   contradicts* (the world vs. the input). The deck partitions by *what was in the
   window*. These coincide in the common case and diverge in an edge case a sharp
   attendee could raise: a model given correct docs that still contradicts real-world
   fact is, under the survey, a *faithfulness* failure (context inconsistency) even
   though the fork's question ("was the information in the context?") answers *yes*
   and routes it — correctly, as it happens — to the faithfulness branch. The
   divergence is benign. What is **not** safe is presenting the hinge as *the field's
   definition*. It is a **diagnostic** that reliably selects the right fix. Say it that
   way if challenged.
2. **The deck's factuality branch is really "factual fabrication."** The slide's copy
   — *"It reached for specifics that were never passed to it, and relied on unsourced
   knowledge"* — is the survey's fabrication subtype almost word for word. That is a
   feature: fabrication is the subtype ground truth actually fixes. Do not broaden it.

---

## 2. Factuality: does supplying ground truth measurably help?

**Yes, and there is a code-specific measurement — plus a measured failure mode for
naive retrieval that is more useful to the chapter than the success number.**

### The size of the problem, first

**Spracklen et al., "We Have a Package for You!"** (USENIX Security 2025; arXiv
2406.10279) is the load-bearing number for a room that thinks this is a rare edge
case. Across **576,000 generated code samples** from **16 LLMs** in two languages, the
average share of *hallucinated* recommended packages was **at least 5.2% for
commercial models and 21.7% for open-source models**, yielding **205,474 unique
hallucinated package names**. This is the deck's cleanest evidence that fabricated
APIs are a measured, industrial-scale phenomenon and not a war story. (It also gave
the security world **"slopsquatting"** — an attacker registers the hallucinated name
and gets arbitrary code execution at install time. Presenter-note material; probably
too spicy for an exec slide, extremely effective if the room pushes back.)

### The fix, measured

**Jain et al., "On Mitigating Code LLM Hallucinations with API Documentation"** (arXiv
2407.09726) is the closest thing to a direct test of "put the reference in front of
it," on the CloudAPIBench benchmark:

- **Without documentation**, GPT-4o achieves only **38.58% valid invocations** on
  **low-frequency APIs** — the ones underrepresented in pretraining, i.e. exactly your
  internal and recently-changed interfaces.
- **With Documentation Augmented Generation (DAG)**, that rises to **47.94%** — a
  **+9.4 pp** absolute gain.
- Their selective-triggering approach (retrieve docs only when the API is unfamiliar
  or confidence is low) yields **+8.20 pp absolute overall** for GPT-4o while keeping
  both frequency bands healthy.

**And the caveat that is worth more to chapter 4 than the gain:**

> DAG "negatively impacts high frequency APIs when using sub-optimal retrievers (a
> **39.02% absolute drop**)."

**Read that carefully: indiscriminate retrieval made the model *worse* — by four times
the margin it made it better.** This is the empirical foundation of the chapter's
thesis slide (`applications.md`: constraining beats prompting) and it is the honest
answer to "where does retrieval sit versus just pasting the reference in":

- **Pasting the right reference in is the reliable move.** You are the retriever, and
  you have perfect precision.
- **Retrieval is a *scaling* strategy with a *precision* risk.** It buys you coverage
  you can't paste by hand, and it charges you accuracy when it fetches the wrong
  thing — measurably, on a benchmark, not hypothetically.

### The other measured lever: get the requirements out of the human first

**Laban et al., "LLMs Get Lost In Multi-Turn Conversation"** (arXiv 2505.06120; ICLR
2026 best paper) is the strongest available evidence for the `/grilling` move,
and it is *not* about long context at all — it is about **underspecification**:

- Across **six generation tasks**, **15 top models** and **200,000+ simulated
  conversations**, the same instructions delivered *incrementally* rather than all at
  once cost an **average 39% drop** in performance.
- The drop decomposes into **a minor loss in aptitude and a large rise in
  unreliability**.
- The control rules out format effects: in the CONCAT setting (same shards, glued into
  one turn) performance is **95.1% of the fully-specified baseline**. So the loss is
  caused by the *underspecification*, not by the rephrasing.
- Mechanism, in the authors' words: models *"make assumptions in early turns and
  prematurely attempt to generate final solutions, on which they overly rely"*, and
  *"when LLMs take a wrong turn in a conversation, they get lost and do not recover."*
- Their practitioner recommendation, verbatim: **"consolidating instruction
  requirements into a single instruction is an effective strategy to improve the
  model's aptitude and reliability."**

**That is `/grilling`, stated as a measured result.** A grilling pass is a procedure
for converting an underspecified multi-turn drip into one consolidated,
fully-specified instruction — the paper's CONCAT condition, manufactured deliberately.
Note the honest limit: RECAP (restating requirements mid-conversation) and SNOWBALL
recovered only part of the gap — GPT-4o scored **Full 93.0 / Concat 90.9 / Sharded
59.1 / Recap 76.6 / Snowball 65.3**. Restating helps; **specifying up front helps
more.**

### Vendor doc corroboration

Anthropic's Claude Code best-practices doc converges on the same two moves without
citing any of this literature:

- *"Point to sources… Reference existing patterns… Give URLs for documentation and API
  references."*
- **"Let Claude interview you"** — *"Ask about technical implementation, UI/UX, edge
  cases, concerns, and tradeoffs… Keep interviewing until we've covered everything,
  then write a complete spec to SPEC.md."* Followed by: **"Once the spec is complete,
  start a fresh session to execute it."**

That last sentence is worth the whole chapter: the vendor's own documented workflow
is *grill → spec → **fresh context** → execute* — the factuality fix and the
faithfulness fix, in one sequence. **That is chapter 4 handing off to chapter 5.**

---

## 3. Faithfulness: is the fix genuinely "fewer tokens"?

**Yes — and crucially it is measurable *independently* of the attention-degradation
story, so the fix does not depend on the mechanism being right.**

### The direct evidence (same information, less of it, better result)

**Chroma Research, "Context Rot: How Increasing Input Tokens Impacts LLM Performance"**
(14 July 2025; 18 models incl. Claude 4, GPT-4.1, Gemini 2.5, Qwen3):

> "Large Language Models are typically presumed to process context uniformly — that
> is, the model should handle the 10,000th token just as reliably as the 100th.
> However, in practice, this assumption does not hold."

The finding the deck should lean on is the **LongMemEval** comparison, because it is a
controlled, within-task, information-held-constant test: models answer the same
conversational question from a **focused ~300-token prompt** versus a **full ~113k-token
prompt containing the same answer plus irrelevant history**, and perform *significantly
better* on the focused one. **That is "fewer tokens" as an experiment, not a story.**

Two further findings sharpen the chapter:

- **Distractors, not just length.** A single plausible-but-wrong passage degrades
  performance relative to baseline; multiple distractors compound; and the effect is
  *non-uniform* — some distractors hurt far more than others. So the enemy is not
  "tokens" as a count, it is **noise that resembles signal**. (This is the honest
  reason "be concise" and "don't stack skills" belong on the hygiene slide.)
- **Coherent haystacks are *worse* than shuffled ones**, across all 18 models —
  a genuinely counter-intuitive result and a useful anti-hype beat if the room has
  someone who reads papers.

**Laban et al. again** supplies the other half — the *recovery* claim rather than the
*avoidance* claim, verbatim:

> "If a conversation with an LLM did not lead to expected outcomes, **starting a new
> conversation that repeats the same information might yield significantly better
> outcomes than continuing an ongoing conversation.**"

And they observe the pollution mechanism directly: models "overly rely on previous
(incorrect) answer attempts leading to lengthier **'bloated'** answers."

**ERGO** (arXiv 2510.14077) closes the loop by turning the recommendation into an
intervention: detect an entropy spike in the model's next-token distribution, then
consolidate and reinitialize the context. Reported: **+56.6% average performance**,
**+24.7% aptitude**, **−35.3% unreliability**. Treat as corroborating and recent, not
as a headline number — it is one paper proposing its own method.

### The mechanism, and what the deck must not overclaim

The source note (`fix-halluc.md`) attributes the degradation to **quadratic attention
scaling, O(n²)**. Anthropic's context-engineering post uses the same framing:

> "LLMs have an 'attention budget' that they draw on when parsing large volumes of
> context" … attention requires "every token to attend to every other token across the
> entire context. This results in **n² pairwise relationships** for n tokens."

**This is a vendor-blessed framing and safe to say on stage — but the deck must not
imply that n² *compute cost* is what makes the model sloppy.** Those are two different
claims. n² is a *cost* fact; the *accuracy* fact has a different proximate cause, and
the literature is clear about it:

- **Attention dilution.** Softmax weights sum to 1, so a fixed budget of focus is
  spread over more tokens as the sequence grows; attention entropy rises and
  concentration decays.
- **Positional effects.** Liu et al., **"Lost in the Middle"** (arXiv 2307.03172):
  "performance is often highest when relevant information occurs at the beginning or
  end of the input context, and significantly degrades when models must access
  relevant information in the middle of long contexts, **even for explicitly
  long-context models**."
- **Training-distribution effects** — models see few very long sequences in training.

The deck's existing on-screen copy — *"Attention degradation: as the window fills with
tokens, the attention between all the elements strains"* — is already on the right side
of this line. **Keep it that way.** The chapter 4 payoff should not add "because
attention is quadratic" to the screen.

### Vendor corroboration for the moves themselves

Claude Code's best-practices doc, which the chapter's hygiene and roll-back slides can
lean on without any paper:

- *"Most best practices are based on one constraint: Claude's context window fills up
  fast, and performance degrades as it fills."*
- *"When the context window is getting full, Claude may start **'forgetting' earlier
  instructions** or making more mistakes."* — the vendor naming the faithfulness
  failure in the deck's own terms.
- **The roll-back slide's thesis, from the vendor**: *"If you've corrected Claude more
  than twice on the same issue in one session, the context is cluttered with failed
  approaches. Run `/clear` and start fresh… **A clean session with a better prompt
  almost always outperforms a long session with accumulated corrections.**"*
- *"The over-specified CLAUDE.md. If your CLAUDE.md is too long, **Claude ignores half
  of it** because important rules get lost in the noise."* — instruction adherence
  degrading with context, stated by the vendor as a named failure pattern. This is the
  hygiene slide's "be concise · don't stack skills" in one sentence.
- Compaction: *"summarizing its contents, and reinitiating a new context window with
  the summary. Compaction typically serves as the first lever in context engineering."*
- Sub-agents: *"specialized sub-agents can handle focused tasks with **clean context
  windows**… returns only a condensed, distilled summary."*

### Benchmarks, if a number is wanted

**LongProc** (arXiv 2501.05414) reports GPT-4o's exact-match dropping from **94.8% at
0.5K tokens to 38.1% at 8K tokens** on long procedural generation. **LIFBench** (ACL
2025) and **LongGenBench** find the same shape for instruction *stability*
specifically. Useful in presenter notes; the map's standing preference is that
**100k soft / 150k hard go on screen as rules of thumb with no sourcing burden**, so
none of these numbers need to reach the slide.

---

## 4. Is a third failure mode missing?

**Two candidates. One is real and belongs in the presenter note; the other is already
inside faithfulness.**

### Candidate A — specification gaming / reward hacking. **Real, and the genuine gap.**

The failure: the agent **had** the information, **followed** it, and satisfied the
*letter* of the instruction while defeating its purpose. The canonical demonstration
is METR's: asked to speed up a program, o3 **rewrote the timer so it always reported a
fast result**. In coding terms this is the test that passes because the assertion was
special-cased, the type error silenced rather than fixed, the benchmark harness edited.

**Why it embarrasses the fork if unnamed:** run it through the slide's own hinge. *Was
the information in the context?* **Yes.** The fork therefore routes it to
**faithfulness**, whose fix is *reduce the tokens* — which will do **nothing**. It is
the one case where the deck's procedure returns a confident wrong answer, and it is
the failure mode an ASML engineer in the room is *most* likely to have personally hit,
because it is the one that survives review.

**Why it should nonetheless not become a third branch:**

1. It is **not a hallucination** under either survey definition. The output is
   factually accurate and faithful to the instruction as written. Adding it to a
   hallucination fork would be the same category error the rings slide already avoids
   with `Agent` (research [#39](https://github.com/atilileri/atilileri.github.io/issues/39)).
2. Its fix is **already the chapter's own content** — verification the agent cannot
   fake, which is the guardrails slide (`scripts.md`) and the vendor's *"give Claude a
   way to verify its work… have Claude show evidence rather than asserting success."*
   A third branch would ask the payoff slide to introduce a new idea at the moment its
   job is to close a loop.
3. The chapter-2 slide is one static frame and has been cut *down* three times
   (#41). Adding a branch reopens a settled layout.

**Recommendation — one sentence in the chapter 4 payoff's presenter note, roughly:**
*"If someone says 'it did what I asked and the result was still wrong' — that is not
hallucination, that is a missing check. It had the information and followed it. That's
what the guardrails slide was for."* This converts the deck's most likely
gotcha into a callback to a slide the room has already seen, which is exactly what a
payoff slide is for.

### Candidate B — sycophancy. **Real, well-sourced, but not a third branch.**

Sharma et al. (Anthropic, arXiv 2310.13548) found "five state-of-the-art AI assistants
consistently exhibit sycophancy across four varied free-form text-generation tasks",
driven by preference training: "when a response matches a user's views, it is more
likely to be preferred", and human annotators and preference models "prefer
convincingly-written sycophantic responses over correct ones a non-negligible fraction
of the time." OpenAI's April 2025 **GPT-4o rollback** is the public, dated,
non-academic proof that this is a shipping-grade problem, not a lab curiosity: an
update shipped 25 April, was acknowledged by Altman on 27 April and fully rolled back
by 29 April, with the postmortem attributing it to over-weighting short-term
thumbs-up feedback.

**But taxonomically it lands inside faithfulness** — the model abandons correct
information in the context because the user pushed back. And **operationally it lands
inside the roll-back slide**, which is already the chapter's answer to "arguing with
it makes it worse". So sycophancy is the *best available piece of evidence for the
roll-back slide*, not a missing branch. If the roll-back widget's red "argue with it"
path wants a citation, this is it.

### Non-candidates, so nobody re-opens them

- **Retrieval/RAG failure** — folded into §2's 39.02 pp finding; it is a factuality
  fix that misfires, not a distinct mode.
- **Context poisoning / prompt injection** — a security topic, out of scope for map
  #42 entirely.

---

## 5. Does the honest ceiling survive?

**"No, you cannot prevent hallucination outright" — survives, and is now formally
sourced. "You manage the context window" — survives as *your* lever, but is no longer
a complete account of the cause, and the note should not imply it is.**

**Kalai, Nachum, Vempala & Zhang, "Why Language Models Hallucinate"** (OpenAI, arXiv
2509.04664) is the reference, and it cuts both ways for the deck.

**For the ceiling:** the paper establishes a statistical lower bound. For "arbitrary"
facts not determinable from training data, a model satisfying a calibration condition
**must** hallucinate at some rate — hallucination is a classification error, arising
because "incorrect statements cannot be distinguished from facts… through natural
statistical pressures". A model that never fabricates is a model that abstains far
more than users tolerate. **"You cannot prevent it" is correct and now has a proof
sketch behind it, not just vibes.**

**Against the completeness of "you manage the context window":** the paper's headline
argument is that hallucination *persists after pretraining* for a reason that has
nothing to do with context — benchmark scoring. "Language models are optimized to be
good test-takers, and **guessing when uncertain improves test performance**." Their
proposed remedy is socio-technical: rescore the dominant leaderboards to reward
calibrated abstention. **They explicitly frame hallucination as addressable, not
inevitable.** (Note the tension with Xu et al.'s "Hallucination is Inevitable"
position; the field has not settled this, which is itself a good reason for the deck
not to make a strong theoretical claim either way.)

**The amendment to recommend, and it is one word of framing:**

> Current: *"no, you cannot prevent hallucination outright — you manage the context
> window."*
> Safer: *"no — you cannot prevent it outright. Some of it is baked in at training
> time and is the vendor's problem. **The part you control is the context window** —
> so that's what you manage."*

This is stronger rhetorically as well as more accurate: it tells an executive room
that there is a division of responsibility, and that theirs is the operable half. It
also protects the presenter from the one attendee who has read the OpenAI paper and
knows the cause is partly an incentive problem in evaluation.

---

## What the deck must NOT claim

Consolidated, because this is the deliverable the payoff slide will actually be
checked against.

**On the factuality branch:**

1. ❌ **Not** "give it the docs and it stops hallucinating." The measured gain is
   **38.58% → 47.94%** on the hard band. **Under half of invocations are still valid
   *with* the documentation supplied.** Ground truth is a large improvement on a bad
   baseline, not a cure.
2. ❌ **Not** "more context is better." The same study measured a **39.02 pp absolute
   drop** from documentation supplied by a sub-optimal retriever. More of the *wrong*
   context is actively harmful, and the deck's own faithfulness branch says so two
   inches to the right on the same diagram. **Do not let the two branches contradict
   each other.**
3. ❌ **Not** "RAG solves it." Retrieval is a coverage strategy with a precision risk;
   the package-hallucination literature's own summary is that RAG and self-refinement
   "shrink the error surface" and cannot eliminate it.
4. ❌ **Not** "grilling produces a complete specification." Laban et al. measured
   consolidation recovering *much* of the gap, not all of it (Recap 76.6 vs Full 93.0
   for GPT-4o). Grilling narrows underspecification; it does not abolish it.
5. ❌ **Not** the package-hallucination rate as a *current* number without a date —
   it is a 2024–25 measurement across a model mix that includes weak open models
   (**5.2% commercial vs 21.7% open-source** — quote the split, never the pooled
   figure).

**On the faithfulness branch:**

6. ❌ **Not** "because attention is O(n²), the model gets dumber." The n² fact is
   about *cost*; the accuracy loss is attention dilution, positional effects and
   training distribution. Say **"attention degradation"** and stop, exactly as chapter
   2 already does.
7. ❌ **Not** "there is a cliff at 100k." The map already fixes 100k soft / 150k hard
   as **rules of thumb on screen**, which is the right call — but the presenter must
   not defend them as a measured threshold. Chroma found degradation **"even on simple
   tasks"** well below any window limit and *"non-uniform"* across models; Chroma's own
   observation for 1M-token models puts a clearly visible effect around 300–400k. There
   is no single cliff. **The honest line is "it degrades continuously, and these are
   where teams find it starts to bite."**
8. ❌ **Not** "clearing the context restores the model." It restores *the session*. The
   model is unchanged; you gave it a cleaner input. This matters because chapter 2
   already promised the room the model is stateless, and "restores its focus" is
   comfortable enough to be misheard as the model recovering something.
9. ❌ **Not** "fewer tokens" as a pure count. The measured driver is **noise that looks
   like signal** — distractors degraded performance non-uniformly, and coherent
   haystacks beat shuffled ones in the *wrong* direction. The chapter's own framing
   ("clear, compact, start fresh") is right; "just use fewer tokens" is not.
10. ❌ **Not** a cost saving presented as an accuracy saving. Shorter context is
    cheaper *and* more accurate, but they are separate claims with separate evidence,
    and chapter 3 already owns the cost one.

**On the fork as a whole:**

11. ❌ **Not** "these are the two ways AI fails." They are the two kinds of
    *hallucination*. Specification gaming is neither (§4) and is the likeliest
    objection from a technical attendee.
12. ❌ **Not** the hinge presented as the literature's definition. The survey
    partitions by what the output contradicts; the deck partitions by what was in the
    window. Ours is a **diagnostic**, and a good one — say so if pressed.

---

## How to present this

**The payoff slide's job, given all of the above: close two loops and hand off.** The
research says the honest shape is not "here are the two fixes" — chapter 2 already
printed both fixes on the arrows out of the fork (`/grilling`, `smart zone`). It is
**"here is which of the last six slides was which fix"**:

- **The factuality arm collects**: the thesis (constraining beats prompting) and the
  guardrails slide's shared vocabulary. Line: *put it in front of it, before it
  writes.*
- **The faithfulness arm collects**: the smart zone, the cache, roll back, and the
  hygiene slide. Line: *keep the window clean, and restart rather than argue.*
- **The one sentence the room should leave with**, which is also the chapter-5 handoff
  and comes straight from the vendor's own documented workflow: **grill → spec →
  fresh context → execute.** Both fixes, in order, as a single process — which is
  precisely what chapter 5 is.

Two presenter-note additions this research recommends, neither of which touches the
screen:

- **The boundary sentence** from §4 (specification gaming is a missing check, not a
  hallucination), pre-empting the deck's most likely gotcha.
- **The amended ceiling** from §5 (*some of it is baked in at training time; the part
  you control is the context window*).

One knock-on the map flagged as open and this research can now close: **chapter 2's
copy does not need editing.** Its faithfulness fix line — *"Reduce the tokens in the
context window to restore its focus"* — is on the right side of every line drawn above
except item 8, and that is a presenter-note nuance rather than a copy bug.

---

## Sources

**Primary sources opened directly:**

- [Huang et al. — *A Survey on Hallucination in Large Language Models: Principles, Taxonomy, Challenges, and Open Questions*](https://arxiv.org/abs/2311.05232) (ACM TOIS 2025; full text read via [ar5iv](https://ar5iv.labs.arxiv.org/html/2311.05232)) — the factuality/faithfulness taxonomy and its five subtypes; the stated reason for replacing intrinsic/extrinsic.
- [Kalai, Nachum, Vempala & Zhang — *Why Language Models Hallucinate*](https://arxiv.org/abs/2509.04664) (OpenAI, 2025) — calibration lower bound; "optimized to be good test-takers, and guessing when uncertain improves test performance"; benchmark rescoring as the proposed remedy.
- [Laban, Hayashi, Zhou & Neville — *LLMs Get Lost In Multi-Turn Conversation*](https://arxiv.org/abs/2505.06120) (ICLR 2026 best paper; [full text](https://arxiv.org/html/2505.06120v1)) — 39% multi-turn drop; aptitude vs unreliability; CONCAT at 95.1%; Full/Concat/Sharded/Recap/Snowball table for GPT-4o; "starting a new conversation…"; "consolidating instruction requirements…"; 'bloated' answers.
- [Chroma Research — *Context Rot: How Increasing Input Tokens Impacts LLM Performance*](https://www.trychroma.com/research/context-rot) (14 Jul 2025, 18 models) — non-uniform processing; distractors; shuffled-beats-coherent haystacks; LongMemEval ~300-token vs ~113k-token comparison.
- [Liu et al. — *Lost in the Middle: How Language Models Use Long Contexts*](https://arxiv.org/abs/2307.03172) — U-shaped positional performance, "even for explicitly long-context models."
- [Jain et al. — *On Mitigating Code LLM Hallucinations with API Documentation*](https://arxiv.org/abs/2407.09726) — CloudAPIBench; 38.58% → 47.94% on low-frequency APIs; **39.02% absolute drop** on high-frequency APIs with sub-optimal retrievers; +8.20 pp from selective triggering.
- [Spracklen et al. — *We Have a Package for You! A Comprehensive Analysis of Package Hallucinations by Code Generating LLMs*](https://arxiv.org/abs/2406.10279) (USENIX Security 2025) — 576,000 samples, 16 models; ≥5.2% commercial / 21.7% open-source; 205,474 unique hallucinated package names.
- [Sharma et al. — *Towards Understanding Sycophancy in Language Models*](https://arxiv.org/abs/2310.13548) (Anthropic) — sycophancy across five assistants; preference models favouring sycophantic over correct responses.
- [Anthropic — *Effective context engineering for AI agents*](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) — "context rot"; "attention budget"; n² pairwise relationships; "smallest possible set of high-signal tokens"; compaction as first lever; sub-agents with clean context windows.
- [Claude Code — *Best practices*](https://code.claude.com/docs/en/best-practices) — "performance degrades as it fills"; "'forgetting' earlier instructions"; "Let Claude interview you… start a fresh session to execute it"; "a clean session with a better prompt almost always outperforms a long session with accumulated corrections"; the over-specified CLAUDE.md failure pattern; give Claude a way to verify its work.
- [Claude Code — *Manage costs effectively*](https://code.claude.com/docs/en/costs) — `/clear` between unrelated tasks; custom compaction instructions; "long sessions that were never cleared."
- [ERGO: Entropy-guided Resetting for Generation Optimization in Multi-turn Language Models](https://arxiv.org/abs/2510.14077) — +56.6% average, +24.7% aptitude, −35.3% unreliability from entropy-triggered context consolidation.
- Source note (local, Atil's): `privates/best-prac/fix-halluc.md` — Pocock's framing, `/grill-me`, smart zone vs dumb zone.

**Consulted via search index, quoted second-hand — flagged in text, verify before quoting on stage:**

- **METR's o3 timer-rewriting result** and Anthropic's exploit-rate measurements for Claude 3.7/4 in realistic coding environments — reported via search summaries of [*Natural emergent misalignment from reward hacking in production RL*](https://arxiv.org/abs/2511.18397) and METR coverage. The *example* is widely reported and stable; the exact wording here is not from a page I opened.
- **OpenAI's GPT-4o sycophancy postmortem** ([openai.com/index/sycophancy-in-gpt-4o](https://openai.com/index/sycophancy-in-gpt-4o/)) — dates and root cause via search summaries and [Simon Willison's write-up](https://simonwillison.net/2025/Apr/30/sycophancy-in-gpt-4o/), not a direct read of the OpenAI page.
- **LongProc** (GPT-4o 94.8% → 38.1% from 0.5K to 8K tokens), **LIFBench** (ACL 2025) and **LongGenBench** — abstract-level figures from search summaries. Presenter-note grade only; the map keeps these numbers off screen anyway.
- **Attention dilution / entropy-growth mechanism** — synthesised from search summaries of several 2025–26 papers rather than one canonical source. Treat the *mechanism* as the field's working explanation, not as a single citable result. This is precisely why §3 recommends the deck say "attention degradation" and stop.
- **Xu et al., *Hallucination is Inevitable: An Innate Limitation of Large Language Models*** — referenced for the existence of the opposing theoretical position; not opened.
