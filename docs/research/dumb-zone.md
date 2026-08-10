# The Dumb Zone: why context degradation is structural, not a bug

**Question:** Why does the smart zone / dumb zone exist, why is it *natural and unavoidable* rather than a defect, and what actually gets you out of it? Connect **lost in the middle**, **recency bias**, **noise accumulation**, **attention degradation** and **context rot** into one causal chain an exec can follow. Specifically: is the softmax *"attention sums to 1.0, so it is a fixed budget spread thinner"* mechanism — asserted in both `context-rot.md` and `matt-zones.md` — correct, an oversimplification, or wrong? How well does the ~100k/150k threshold hold? Which escapes are vendor-supported?

**Date:** 2026-08-10

---

## TL;DR verdict

**The phenomenon is real, robustly measured, and safe to put on stage. The mechanism story in the repo notes is half right and should be reworded before it is spoken.**

- **The effect is not in doubt.** Anthropic's own Claude Code documentation opens its best-practices page with it: *"Most best practices are based on one constraint: Claude's context window fills up fast, and performance degrades as it fills"* ([Claude Code best practices](https://code.claude.com/docs/en/best-practices)). Liu et al. measured a 22-point swing purely from *where* a fact sat in the prompt ([TACL 2023](https://arxiv.org/abs/2307.03172)). Chroma measured non-uniform degradation across 18 frontier models on tasks as trivial as copying repeated words ([Context Rot, July 2025](https://www.trychroma.com/research/context-rot)). Adobe's NoLiMa had 11 of 13 long-context models fall below half their short-context baseline by 32k ([ICML 2025](https://arxiv.org/pdf/2502.05167)).
- **The softmax framing is an oversimplification that is *directionally* defensible but *mechanistically* wrong as stated.** Softmax rows really do sum to 1, and Veličković et al. *prove* attention must disperse as token count grows ([softmax is not enough](https://arxiv.org/html/2410.01104)) — so "fixed budget" has a real theoretical anchor. But the budget is **per query, per head, per layer**, not one global pot; and empirically attention gets **sparser, not flatter** with length — at 128k, the top 4k columns still carry ~96.8% of the attention mass ([Token Sparse Attention, ICML 2026](https://arxiv.org/abs/2602.03216)). Meanwhile the two phenomena the notes *derive* from softmax — lost-in-the-middle and attention sinks — are attributed by the primary literature to **other** causes entirely (causal masking + residual geometry; a learned no-op valve). **See §4 for the exact rewording.**
- **The quadratic claim is the weakest link and should be dropped or restated.** O(n²) is a *compute* cost. From any single token's point of view the competition grows **linearly** in n, not quadratically. `deep-zones.md`'s "one in ten billion relationships" line, and its Table 1 (N=10 → 45.1%, N=100 → 6.9%), are arithmetic on a *uniform* distribution — not measurements of any model. **Do not put those numbers on screen.**
- **100k soft / 150k hard is a defensible rule of thumb and citable** to Pocock's Dictionary of AI Coding, which itself says *"around 125K-150K tokens — though this is debated"* ([Smart zone entry](https://github.com/mattpocock/dictionary-of-ai-coding/blob/main/dictionary/Smart%20zone.md)). The honest risk is the *opposite* of the one you'd expect: measured degradation usually starts **well before** 100k (Chroma sees it at a few thousand tokens; NoLiMa at 32k). 100k/150k is where *practitioners notice*, not where decay begins. Framed as "plan your budget here," it is safe. Framed as "it's fine until 100k," it is wrong. **Say the former.**
- **Every escape on the list is vendor-supported**, mostly by Anthropic in writing: compaction, fresh sessions, sub-agents, task decomposition and small scope all appear in Anthropic's context-engineering post and Claude Code docs; OpenAI ships a compaction endpoint for GPT-5.2. Vertical slicing is Pocock, not vendor. Sub-agents are the one with a live industry dispute (§7).

---

## 1. The causal chain, in the order it actually runs

The repo notes run the chain **softmax → dilution → lost in the middle → dumb zone**. The literature does not support that ordering: position bias is not downstream of dilution, it is a *parallel* cause with a different origin. The defensible chain is a **fan-in**, not a line:

```
  (a) Position bias        ─┐
      causal mask +         │
      residual geometry     │
                            ├──►  context rot  ──►  the "dumb zone"
  (b) Attention dispersion ─┤     (the measured,      (what the developer
      softmax sharpness     │      systemic result)    actually feels)
      degrades with n       │
                            │
  (c) Noise / distractors  ─┘
      more competitors,
      semantically similar
```

Three independent structural facts, one observable outcome. Each is defensible on its own; none of them needs the others to be true.

**(a) Position bias — "lost in the middle" and recency.** The model's sensitivity to a token depends on *where* it sits, independent of how much else is there. Origin: the causal mask (every token attends only backwards, so early tokens accumulate influence across depth) interacting with positional encodings' distance decay ([Wu et al., *On the Emergence of Position Bias in Transformers*, ICML 2025](https://proceedings.mlr.press/v267/wu25ad.html)). More strikingly, Chowdhury shows the U-shape is present **at initialization** — before any training, and identically with or without RoPE — as a geometric property of a causal decoder with residual connections ([*Lost in the Middle at Birth*, arXiv 2603.10123](https://arxiv.org/abs/2603.10123)). Primacy is a "logarithmic divergence of gradient influence at the start"; recency is an "O(1) anchor at the final token"; the middle is a "factorial dead zone" whose severity scales with depth.

  → **This is the single best "it is not a bug" line in the whole file.** The U-shape exists in a transformer that has never been trained. It is the shape of the architecture, not a flaw in the product.

**(b) Attention dispersion.** For a fixed set of logits and a non-zero temperature, softmax attention coefficients **must** disperse toward uniform as the number of tokens grows — proved, not observed ([Veličković et al., *softmax is not enough*](https://arxiv.org/html/2410.01104)). This is the honest version of "fixed budget spread thinner," and it is the part of the repo notes that survives. See §4 for what it does *not* license you to say.

**(c) Noise accumulation.** Not a metaphor — measured. Chroma found that adding even a **single** semantically-similar distractor reduces accuracy relative to a needle-only baseline, and that distractor damage compounds with input length ([Context Rot](https://www.trychroma.com/research/context-rot)). Liu et al. independently found reader accuracy **saturates long before retriever accuracy does**: going from 20 to 50 retrieved documents bought GPT-3.5-Turbo about **1.5 points** of accuracy for 2.5× the tokens. More context stopped being worth it long before it stopped being possible.

**The result — context rot.** The systemic, gradual, *unsignalled* decay of instruction-following and reasoning as the window fills. The absence of a signal is the operationally important part: there is no error, no threshold, no warning. Pocock: *"There's no error message and no visible boundary; the agent just starts performing slightly worse, then noticeably worse."*

## 2. "Lost in the Middle" — what it actually measured, and does it still hold?

**What it was** ([Liu, Lin, Hewitt, Paranjape, Bevilacqua, Petroni, Liang — TACL 2023, arXiv July 2023](https://arxiv.org/abs/2307.03172)): two synthetic tasks — multi-document QA (k documents, exactly one containing the answer, position swept) and key-value retrieval (a JSON dict, retrieve one value). Models tested were the 2023 generation: GPT-3.5-Turbo (+16K), Claude-1.3 (+100K), MPT-30B-Instruct, LongChat-13B, plus Flan-T5/Flan-UL2.

**Headline numbers, and the nuance the repo notes drop:**

| Finding | Number |
|---|---|
| GPT-3.5-Turbo, 20 docs, answer first | **75.8%** |
| GPT-3.5-Turbo, 20 docs, answer in the middle | **53.8%** |
| GPT-3.5-Turbo, **closed book** (no documents at all) | **56.1%** |
| GPT-3.5-Turbo, 30 docs, worst position | **50.5%** — *below closed book* |
| Claude-1.3, 20 docs, best vs worst | 59.9% → 55.9% (**4 points**) |

Two things worth saying out loud. First, the killer stat for an exec room is not the 22-point swing — it is that **at 30 documents, a badly-placed correct answer left the model performing worse than if you had given it no documents at all.** Handing the model the answer in the wrong place was worse than handing it nothing. Second, **Claude-1.3 barely showed the curve** (4 points), and Claude-1.3/100K was near-perfect on key-value retrieval at every position. Even in the founding paper, the U was model-dependent. Anyone who says "all LLMs have a U-shaped curve" is overclaiming.

Also from the paper, and directly useful to the deck: **extended-context variants were not better at using context.** GPT-3.5-Turbo and GPT-3.5-Turbo-16K performed "nearly identical" when the input fit in both. Buying a bigger window did not buy better use of the window — the 2023 original of Pocock's "a bigger window just ships more dumb zone."

The paper explicitly **declines to name a mechanism.** It notes the parallel to the psychological serial-position effect and says the cause is unclear. So the repo notes' move — deriving the U from softmax dilution — is *not* the paper's claim, and it is contradicted by the later theory work in §1(a).

**Does it replicate in 2026?** The *phenomenon* does; the specific U-shape has softened and fragmented into several distinct failure curves.

- **Chroma (2025)** — 18 models incl. GPT-4.1, Claude 4, Gemini 2.5, Qwen3 — found degradation is real but **"non-uniform"** rather than cleanly U-shaped, and that it shows up on tasks with *zero* reasoning content (replicating a list of repeated words). It also found the most counterintuitive result in the literature: **models score better on shuffled haystacks than on logically-ordered ones**, across all 18 models. No mechanistic explanation offered. That result is fatal to any simple "signal drowns in noise" story — the same tokens, merely reordered, changed the outcome.
- **NoLiMa (Adobe, ICML 2025)** — removes lexical overlap between question and needle, so retrieval requires latent association. **11 of 13** models claiming ≥128k support dropped below **50%** of their short-context baseline by **32k**. GPT-4o, one of the strongest, fell 99.3% → 69.7%.
- **MRCR v2 8-needle, 2026 frontier models** — degradation persists but has moved outward and varies enormously by vendor: Claude Opus 4.6 79.3% at 128–256k and still 76.0% at 1M; GPT-5.4 79.3% → 57.5% (256–512k) → 36.6% (512k–1M); Gemini 3 Pro 77.0% at 128k → 24.5% at 1M ([2026 long-context benchmark roundup](https://yage.ai/share/long-context-benchmark-en-20260315.html)). A rule of thumb from that survey: *effective* context is roughly **60–70% of nominal**.
- **Fiction.LiveBench** (deep comprehension over long serialized fiction) shows accuracy sliding well before the advertised maximum, often nearer **32k** than 192k.

**Net for the slide:** do not promise a tidy U on a 2026 model. Promise the thing all four sources agree on — **performance is a function of input length, it degrades, it degrades before the advertised limit, and nothing tells you when.**

## 3. Recency and primacy — why the bottom of the window is a smart zone

`context-rot.md` explains recency as *"LLMs process text sequentially and have a strong innate tendency to give the highest weight to the most recently processed tokens."* **This is wrong on the mechanism and should not be said on stage.** Transformers do not process the prompt sequentially — prefill is parallel across all positions. Nothing is "most recently processed."

The correct account, from §1(a): recency is an **O(1) anchor at the final token** — the position generating the next token is the query, so the last tokens are structurally closest to it under both the causal mask and positional-distance decay. Primacy is the mirror image: under a causal mask, early tokens are attended to by *every* later token and their influence compounds through depth, and they additionally serve as attention sinks (§4). Both are geometry, not "attention span."

An exec-safe phrasing that is actually true: **"The model reads everything at once. But the beginning is what everything else was written relative to, and the end is what it is about to speak from. The middle is neither."**

## 4. The softmax verdict — the part to get right before it is spoken

The claim under test, from `context-rot.md`: *"softmax forces all attention scores to sum to exactly 1.0, which creates a fixed budget of attention. As you add more tokens, that budget gets spread thinner and thinner."* And from `matt-zones.md`: *"every new token you add creates quadratic attention relationships. The model's finite attention budget gets spread thin."*

**Verdict: an oversimplification with a genuine theoretical core, wrapped in three claims that do not hold.**

### What is correct

- **Softmax rows do sum to 1.** Attention mass for a given query, in a given head, in a given layer, is genuinely conserved. That is not a metaphor.
- **Dispersion with length is a theorem, not folklore.** Veličković et al. prove that for a tokenised input from a fixed vocabulary at non-zero temperature, *any* softmax attention head in an MLP+attention architecture **must** have its coefficients disperse given sufficiently many tokens — even if they were sharp in-distribution. Their proposed fix (adaptive temperature at inference) exists precisely because sharpness decays with n. **This is the strongest single citation available for "attention gets less focused as context grows," and it is a proof.**
- **The vendor uses the same language.** Anthropic's context-engineering post: LLMs have *"an 'attention budget' that they draw on… Every new token introduced depletes this budget by some amount"*, and *"this results in n² pairwise relationships for n tokens… a model's ability to capture these pairwise relationships gets stretched thin"* ([Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)). If a frontier lab will say "attention budget" and "stretched thin" in its own engineering blog, the deck can say it too without embarrassment.

### What is oversimplified

- **There is no single budget.** The conserved quantity is *per query, per head, per layer*. A frontier model has dozens of layers × dozens of heads, each normalising independently, and different heads specialise (some are induction heads, some are sinks). "The model has a finite attention budget" compresses thousands of independent budgets into one — fine as a stage metaphor, not fine as a mechanism claim.
- **Attention gets sparser with length, not flatter.** This is the empirical fact that most embarrasses the naive picture. In a 128k × 128k attention matrix, keeping only the **top 4k columns recovers ~96.8% of total attention mass**; for the last token, a small handful of positions carry 75% of the mass, especially in deeper layers ([Token Sparse Attention](https://arxiv.org/abs/2602.03216); [MInference](https://arxiv.org/pdf/2407.02490)). Whole families of inference kernels are built on the fact that long-context attention is *concentrated*. Softmax is exponential in the logit gap: one token with a clearly higher score takes most of the mass regardless of how many competitors it has. Dispersion is an asymptotic, in-the-limit result about *out-of-distribution sharpness* — it does not license "the model's focus on your instruction is now 1/N."
- **Which is why `deep-zones.md`'s Table 1 must not go on screen.** "N=10 → 45.1%, N=100 → 6.9%" is what you get by assuming near-equal logits. It is the arithmetic of a *uniform* distribution presented as a measurement of a model. Real attention at N=100k is nothing like uniform. Same for the "one in a million relationships → one in ten billion" line.

### What is wrong

- **The quadratic argument is a category error.** O(n²) is the **cost of computing** attention (all query × key pairs), and it is a GPU/FLOPs/memory concern. It is not a per-token dilution factor. From the point of view of one query, competition grows **linearly** — n keys in one softmax. Doubling the context does not "quadruple the interference" for any given decision; it doubles it. Anthropic's n² phrasing is about *capacity to represent* pairwise relationships, not about a specific instruction being outcompeted. `matt-zones.md`'s "quadratic attention relationships" sentence should be cut.
- **Attention sinks are being cited backwards.** `deep-zones.md` presents sinks as evidence *for* dilution — sinks "absorb massive amounts of the attention budget, starving the middle tokens." The literature says close to the opposite. Xiao et al. ([StreamingLLM, ICLR 2024](https://github.com/mit-han-lab/streaming-llm)) identified sinks as the model's **workaround** for the sum-to-1 constraint: when a head wants to attend to nothing in particular, softmax will not let it output zeros, so it parks the excess on the first few tokens. Barbero et al. ([*Why do LLMs attend to the first token?*, COLM 2025](https://arxiv.org/abs/2504.02732)) go further: sinks are a learned **no-op channel** that *prevents* over-mixing and representational collapse in deep stacks — i.e. sinks are a mechanism that **protects** long-context performance, not one that degrades it. StreamingLLM exploits them to run 4M+ tokens stably, and the trick now ships in HuggingFace, TensorRT-LLM and OpenAI models. **If the sum-to-1 constraint really forced useful attention to be squandered, the model would not have evolved a valve for exactly that problem.** Do not use sinks as the villain.
- **Deriving lost-in-the-middle from softmax dilution is contradicted.** Chowdhury's result — the U-shape present at step 0, untrained, with or without RoPE — means position bias cannot be a learned softmax artefact. Wu et al. attribute it to causal masking + positional encoding. And Chroma's shuffled-haystack result (same tokens, better score when reordered) is unexplainable by a mass-competition story of any kind.

### The reworded mechanism — safe to say on stage

> Attention is a competition. For every word it writes, the model scores everything in the window and its scores have to add up to one — so more context means more competitors for the same fixed share. And where something sits matters as much as what it says: the architecture is structurally sharpest at the very start and the very end of the window, and softest in the middle. That shape is there in an untrained model. It is the shape of the machine, not a defect in it.

That version keeps the memorable "fixed share" image, keeps it *true* (per-decision softmax mass genuinely is conserved), adds the position leg as a co-equal cause rather than a consequence, and drops the three claims that don't survive contact with the sources. It also lands the "not a bug" beat harder than the original did.

## 5. Context rot — what Chroma actually measured

[Chroma, *Context Rot: How Increasing Input Tokens Impacts LLM Performance*](https://www.trychroma.com/research/context-rot), Kelly Hong, Anton Troynikov, Jeff Huber, 14 July 2025. **18 models**: Claude Opus 4 / Sonnet 4 / Sonnet 3.7 / Sonnet 3.5 / Haiku 3.5; o3, GPT-4.1 (+mini, +nano), GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo; Gemini 2.5 Pro / 2.5 Flash / 2.0 Flash; Qwen3-235B-A22B / 32B / 8B.

Four experiment families:

1. **Extended needle-in-a-haystack** — needles matched *semantically* rather than lexically, across 8 input lengths × 11 needle positions. Lower needle–question semantic similarity → steeper degradation with length.
2. **LongMemEval** — conversational QA, 306 prompts averaging ~113k tokens, compared against a "focused" ~300-token version of the same question. The gap between focused and full is the measurement. Claude Opus 4 and Sonnet 4 showed particularly large drops.
3. **Repeated words** — replicate a sequence of repeated words with one variant. Trivial. Models still degrade with length. Claude Sonnet 3.5 beat *newer* Claude variants up to 8,192 output tokens; Opus 4 outright refused 2.89% of attempts.
4. **Distractors, needle–haystack similarity, and haystack structure** — single distractors hurt; distractor damage grows with length; Claude models hallucinated least, GPT models most ("confident but incorrect"); and **shuffled haystacks beat logically-structured ones on all 18 models.**

The core claim, and the one that belongs on the slide: **models do not process context uniformly**, and this shows up *even on tasks with no reasoning content at all*. The report is careful to say the mechanistic explanation is unexplored. Its prescription is "context engineering" — the careful construction of what goes in the window.

**Why this study is the right one to cite to an exec audience:** it is not an academic toy. It tested the models the room is actually buying, on the failure they are actually experiencing, and its most damning result is on a task a pocket calculator could do.

## 6. The 100k / 150k threshold — how well does it hold?

**Where it is citable.** Matt Pocock's [Dictionary of AI Coding](https://github.com/mattpocock/dictionary-of-ai-coding) (open source, MIT-style repo, also published at aihero.dev) has entries for **Smart zone / Dumb zone**, **Attention degradation** and **Attention budget**. The relevant lines:

> *"Early in a session the agent is in a 'smart zone' — sharp, focused, recall is good. As the session grows it drifts into a 'dumb zone': sloppier, forgetful, more mistakes — and more faithfulness hallucinations. Same model, same harness — just more context… On frontier models, the dumb zone commonly begins around 125K-150K tokens — though this is debated."* ([Smart zone](https://github.com/mattpocock/dictionary-of-ai-coding/blob/main/dictionary/Smart%20zone.md))

> *"An instruction that was the loudest thing at 10k tokens of context is background hum at 150k. This is the mechanism behind attention degradation: the model doesn't forget; the signal gets lost in the noise."* ([Attention budget](https://github.com/mattpocock/dictionary-of-ai-coding/blob/main/dictionary/Attention%20budget.md))

> *"The zones don't track the context window limit. A session can be deep in the dumb zone with most of the window still free."* ([Smart zone](https://github.com/mattpocock/dictionary-of-ai-coding/blob/main/dictionary/Smart%20zone.md))

Worth noting for the deck's integrity: **Pocock's own dictionary never says "softmax."** It says the attention budget is *per token* and *doesn't grow when the context does*. The softmax derivation is an addition made by the repo's synthesised notes, not by the practitioner being cited. Attributing the softmax argument to Pocock would be wrong.

**How well the number holds — three honest caveats, none disqualifying:**

1. **The direction of error is toward "too generous," not "too strict."** Every controlled measurement puts the onset of degradation *earlier* than 100k: Chroma sees it in the low thousands, NoLiMa at 32k, Fiction.LiveBench near 32k. Nobody credible reports frontier models holding full quality to 100k and then falling off. So 100k/150k does not overstate model capability, which is the embarrassing direction. It understates the problem.
2. **It is a practitioner-noticing threshold, not a measurement.** ~100k–150k is roughly where degradation becomes *unmistakable in an agentic coding session* — which is a real and useful thing to know, but it is calibrated to a use case (long-horizon coding), not derived from a benchmark. The number is a *budget-setting heuristic*. Pocock hedges it himself ("though this is debated").
3. **It is model-dependent, and 2026 spread the models out.** On MRCR v2 8-needle, Claude Opus 4.6 loses ~3 points between 256k and 1M; Gemini 3 Pro loses 52 points between 128k and 1M. A single number across all vendors is a simplification. The survey heuristic *"effective context ≈ 60–70% of nominal"* is an alternative framing if a vendor-neutral number is ever wanted.

**Verdict: safe to put on screen as a rule of thumb, with one wording constraint.** Say **"budget for ~100k; past ~150k assume you are paying for it"** — a planning number. Do **not** say **"it's fine up to 100k"** — that is the one version the evidence contradicts. Degradation is continuous from early on; 100k is where it stops being deniable. The genuinely embarrassing failure mode is not the number being wrong, it is the implication that below it there is no decay.

Also worth keeping: Pocock's *"the zones don't track the context window limit"* — a session can be deep in the dumb zone with most of the window free. That is the line that pre-empts the room's obvious objection ("but we bought the 1M-token model").

## 7. The escapes — which are vendor-supported

Sorted by strength of vendor backing. **Four of the five are documented by Anthropic in writing; the fifth is Pocock's.**

| Escape | Vendor support | Verdict |
|---|---|---|
| **Compaction** | **Strong, both vendors.** Anthropic: *"Compaction distills the contents of a context window in a high-fidelity manner, enabling the agent to continue with minimal performance degradation"* (context-engineering post). Claude Code ships auto-compact, `/compact <instructions>`, microcompaction, and rewind-based partial summarisation. OpenAI ships a **`/responses/compact` endpoint** for GPT-5.2 — *"a loss-aware compression pass over prior conversation state"* — advising *"compact after major milestones… not every turn."* | Fully vendor-supported, by two labs, one of them with a shipped API primitive. |
| **Fresh sessions / handoffs** | **Strong.** Claude Code best practices: *"Use `/clear` frequently between tasks to reset the context window entirely"*; *"If you've corrected Claude more than twice on the same issue in one session, the context is cluttered with failed approaches. Run `/clear` and start fresh… A clean session with a better prompt almost always outperforms a long session with accumulated corrections."* Anthropic also documents **structured note-taking** (persist to a `NOTES.md`-style external file, re-read after reset) as the handoff mechanism. | Fully supported. The `/clear` line is the single most quotable vendor endorsement of the whole chapter. |
| **Task decomposition / small scope** | **Strong.** Claude Code's named failure patterns include *"the kitchen sink session"* (fix: `/clear` between unrelated tasks) and *"the infinite exploration"* — *"You ask Claude to 'investigate' something without scoping it. Claude reads hundreds of files, filling the context. Fix: Scope investigations narrowly or use subagents."* Anthropic's guiding principle: *"find the smallest possible set of high-signal tokens that maximize the likelihood of some desired outcome."* | Fully supported. |
| **Sub-agents** | **Supported, but contested.** Anthropic: sub-agents *"achieve a clear separation of concerns — the detailed search context remains isolated within sub-agents, while the lead agent focuses on synthesizing and analyzing the results."* Claude Code: *"Since context is your fundamental constraint, subagents are one of the most powerful tools available."* **Counterpoint:** Cognition's [*Don't Build Multi-Agents*](https://cognition.com/blog/dont-build-multi-agents) (June 2025) argues parallel writer agents are fragile precisely *because* context is fragmented — subagents make locally-correct decisions that don't compose. The 2026 settlement is narrow: **one orchestrator holding continuous context, spawning ephemeral read-only sub-agents that return compressed summaries.** | Supported *for read/investigate/verify*. Do not imply parallel sub-agents writing code is settled practice. |
| **Vertical slicing** | **Not vendor guidance — Pocock's.** Slice each ticket as a narrow end-to-end path (schema → API → UI → test) scoped to fit one fresh window, rather than horizontal layers. Vendor docs endorse the *principle* (small scoped tasks, plan-then-implement, spec written to a file then executed in a fresh session — *"Once the spec is complete, start a fresh session to execute it"*) but not the vertical/horizontal framing by name. | Attribute to Pocock, not to a vendor. |

Two things the escapes list should **not** claim:

- **Compaction is not free.** Anthropic's phrasing is "minimal performance degradation," not none — it is lossy summarisation by construction, and Claude Code's auto-compact buffer itself reserves a chunk of the window. Compaction buys runway; it does not restore the smart zone.
- **Re-pasting the ignored instruction is the anti-escape**, and this is the one place where every source agrees and the audience's instinct is wrong. Pocock: *"You recover by removing context, not adding more. Re-pasting the ignored instruction adds another competitor to the same crowded window and helps only briefly."* Anthropic's version is the "correcting over and over" failure pattern. This is the chapter's best behavioural payload: **the intuitive fix makes it worse**, and it ties directly to chapter 2's faithfulness-vs-factuality fork — the fact *is* in the window, so adding it again is treating a faithfulness failure as a factuality one.

## 8. Why it is inevitable rather than a bug — the three legs

For the slide's central assertion, three independent arguments, strongest first:

1. **It predates training.** The U-shaped position curve is present in a randomly-initialised causal decoder, with or without positional encoding (Chowdhury 2026). No amount of training data or vendor engineering removes the geometry of a causal stack with residual connections.
2. **It is a theorem about softmax.** Attention coefficients provably disperse as token count grows for any fixed logit scale (Veličković et al.). Sharpness is not free at scale.
3. **The training distribution does not contain it.** Anthropic's own explanation: models have *"less experience with, and fewer specialized parameters for, context-wide dependencies"* because training data is overwhelmingly short sequences. A 1M-token window is being used far outside the regime that shaped the weights.

And the strongest *empirical* framing of "not a bug": every vendor that sells a large window also ships tools to avoid filling it. Anthropic sells a 200k–1M window and its best-practices page opens by telling you the window filling is *the* constraint everything else follows from. **Nobody is hiding this. It is the documented operating envelope of the product.**

---

## How to present this

**The centrepiece slide.** Lead with the counterintuitive empirical fact, not the mechanism. The strongest opening beat available is the Liu et al. 30-document result: *the model did worse with the right answer in the wrong place than with no documents at all.* That earns the room's attention in one sentence and needs no maths.

Then the mechanism in two legs, not four. The four named phenomena in the ticket compress cleanly into **"how much"** and **"where"**:

- **How much** — attention is a competition with a fixed share per decision; more context means more competitors. (Covers attention degradation + noise accumulation.)
- **Where** — the architecture is sharpest at the start and the end, softest in the middle. It is that way before training. (Covers lost in the middle + recency.)
- **Context rot** is the name for the result; **the dumb zone** is the name for what you feel.

Then the payoff: **there is no error message.** That is the whole reason it needs a slide.

**Numbers on screen.** Use **100k soft / 150k hard**, phrased as a budget ("plan for 100k, past 150k assume you're paying"). Optionally the "effective context ≈ 60–70% of nominal" line as the vendor-neutral version. **Never** use `deep-zones.md`'s 45.1%/6.9% dilution table or the "one in ten billion relationships" line.

**The widget.** The degradation curve should probably **not** be drawn as a clean U. Two options, both truer than a U:

1. **Position-swept accuracy at fixed length** (the Liu et al. shape) — a shallow U with the closed-book line drawn across it, so the "worse than nothing" crossing is visible. This is the honest version of the U and it has real numbers behind it (75.8 / 53.8 / 56.1 / 50.5).
2. **Quality vs. session length** with a *gradual, unsignalled* slope and no cliff, the smart/dumb boundary marked as a soft band around 100k–150k, and the model's advertised limit marked far to the right — visually landing "the zones don't track the window limit."

Option 2 tells the chapter's story better (it is about session management, not prompt layout) and lets the presenter drag a slider to watch quality fall with no warning appearing — which *is* the point. If both fit, 1 as a small inset behind 2.

**One slide or two?** The map leaves this open. The research says **one slide for the diagnosis, and put the escapes on the roll-back / hygiene side of the chapter** — because the escapes list (compaction, `/clear`, decomposition, sub-agents) is behaviourally the same beat as roll-back ("remove context, don't add more"), and the anti-escape (re-pasting the instruction) is the same shape as the "argue with it" red path already locked for the roll-back slide. Merging them makes the chapter tighter, not longer.

**Chapter callbacks available.** Pocock's dictionary explicitly ties the dumb zone to **faithfulness** hallucinations — the fact is present but losing the competition for attention. That is chapter 2's fork, verbatim, arriving as the mechanism rather than the taxonomy. It is a free callback and it makes the chapter's closing payoff slide land harder.

**What to cut from the repo notes before anything reaches a presenter note.** The quadratic-attention sentence; the softmax-causes-lost-in-the-middle derivation; the attention-sinks-starve-the-middle claim; the "models process text sequentially" account of recency; Table 1's dilution percentages. Everything else in `matt-zones.md` and `deep-zones.md` survives.

---

## Sources

Primary sources opened directly:

- [Liu, Lin, Hewitt, Paranjape, Bevilacqua, Petroni, Liang — *Lost in the Middle: How Language Models Use Long Contexts*, TACL 2023 (arXiv 2307.03172)](https://arxiv.org/abs/2307.03172) — U-shaped position curve; GPT-3.5-Turbo 75.8% best / 53.8% middle / 56.1% closed-book / 50.5% worst at 30 docs; Claude-1.3 only 4-point gap; extended-context variants "nearly identical" to base; reader saturates long before retriever (20→50 docs = ~1.5 points); paper declines to name a mechanism, notes serial-position parallel.
- [Chroma — *Context Rot: How Increasing Input Tokens Impacts LLM Performance* (Hong, Troynikov, Huber, 14 Jul 2025)](https://www.trychroma.com/research/context-rot) — 18 models; extended NIAH (8 lengths × 11 positions), LongMemEval (306 prompts, ~113k tokens), repeated-words replication, distractors; shuffled haystacks beat structured ones on all 18; mechanism explicitly unexplored.
- [Anthropic — *Effective context engineering for AI agents*](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) — "attention budget"; n² pairwise relationships "stretched thin"; training-distribution argument; "smallest possible set of high-signal tokens"; compaction, structured note-taking, sub-agents, just-in-time retrieval.
- [Claude Code — Best practices](https://code.claude.com/docs/en/best-practices) — "Most best practices are based on one constraint: Claude's context window fills up fast, and performance degrades as it fills"; `/clear` between unrelated tasks; two-failed-corrections rule; kitchen-sink and infinite-exploration failure patterns; sub-agents for investigation; spec-then-fresh-session.
- [Claude Code — Explore the context window](https://code.claude.com/docs/en/context-window) — what loads at startup, sub-agents' separate windows, compaction controls.
- [Matt Pocock — Dictionary of AI Coding: Smart zone](https://github.com/mattpocock/dictionary-of-ai-coding/blob/main/dictionary/Smart%20zone.md), [Attention degradation](https://github.com/mattpocock/dictionary-of-ai-coding/blob/main/dictionary/Attention%20degradation.md), [Attention budget](https://github.com/mattpocock/dictionary-of-ai-coding/blob/main/dictionary/Attention%20budget.md) — the citable form of smart/dumb zone; "125K-150K… though this is debated"; "the zones don't track the context window limit"; per-token budget; "you recover by removing context, not adding more". Note: no softmax claim anywhere in the dictionary.
- [Veličković et al. — *softmax is not enough (for sharp out-of-distribution)*](https://arxiv.org/html/2410.01104) — proof that softmax attention coefficients must disperse given sufficiently many tokens; adaptive temperature as mitigation.
- [Chowdhury — *Lost in the Middle at Birth: An Exact Theory of Transformer Position Bias* (arXiv 2603.10123, Mar 2026)](https://arxiv.org/abs/2603.10123) — U-shape present at initialization, with or without RoPE; primacy tail / recency delta / factorial dead zone; explicitly rejects the "learned softmax artifact" attribution.
- [Wu et al. — *On the Emergence of Position Bias in Transformers*, ICML 2025](https://proceedings.mlr.press/v267/wu25ad.html) — causal mask biases toward early positions; interaction with RoPE/decay-mask distance decay.
- [Barbero et al. — *Why do LLMs attend to the first token?*, COLM 2025 (arXiv 2504.02732)](https://arxiv.org/abs/2504.02732) — attention sinks as a learned no-op channel preventing over-mixing / representational collapse.
- [Xiao et al. — *Efficient Streaming Language Models with Attention Sinks*, ICLR 2024](https://github.com/mit-han-lab/streaming-llm) — sinks as the dumping ground softmax's sum-to-1 forces; keeping 4 sink tokens enables stable 4M+ token streaming.
- [Modarressi et al. — *NoLiMa: Long-Context Evaluation Beyond Literal Matching*, ICML 2025 (arXiv 2502.05167)](https://arxiv.org/pdf/2502.05167) — 13 models claiming ≥128k; 11 below 50% of short-context baseline at 32k; GPT-4o 99.3% → 69.7%.
- [Cognition — *Don't Build Multi-Agents* (12 Jun 2025)](https://cognition.com/blog/dont-build-multi-agents) — the counterpoint on sub-agents; context fragmentation and non-composing local decisions.
- [OpenAI — GPT-5.2 prompting guide (cookbook)](https://developers.openai.com/cookbook/examples/gpt-5/gpt-5-2_prompting_guide) — `/responses/compact` endpoint; "loss-aware compression pass over prior conversation state"; compact after milestones, not every turn.

Secondary / aggregated (used for 2026 numbers; flagged as not first-party):

- [Long-context benchmark roundup, Mar 2026](https://yage.ai/share/long-context-benchmark-en-20260315.html) — MRCR v2 8-needle figures for Claude Opus 4.6, GPT-5.4, Gemini 3 Pro, Claude Sonnet 4.6; "effective context ≈ 60–70% of nominal". Aggregator, not a lab report — treat the exact percentages as indicative.
- [Token Sparse Attention (arXiv 2602.03216)](https://arxiv.org/abs/2602.03216) and [MInference 1.0 (arXiv 2407.02490)](https://arxiv.org/pdf/2407.02490) — long-context attention concentration ("top 4k columns of a 128k×128k matrix recall 96.8% of attention"); read via search summaries of the papers rather than a full read of each PDF.
- Fiction.LiveBench long-context comprehension results — degradation nearer 32k than the advertised maximum; read via secondary summaries, not the raw leaderboard.

Claims in the repo notes I could **not** verify and would not repeat:

- `deep-zones.md`'s assertion that Liu et al. found the middle degradation "persisted when researchers replaced distracting documents with minimally intrusive whitespace" and "when irrelevant tokens were masked out entirely." I did not find either experiment in the paper as read. Treat as unsourced.
- `deep-zones.md`'s Table 1 dilution percentages (N=10 → 45.1%, N=100 → 6.9%) — uniform-distribution arithmetic, not a measurement; contradicted by the attention-concentration literature above.
- `deep-zones.md`'s Ralph-plugin-vs-bash-loop iteration percentages (20% / 35% / 50%) — illustrative, no source found.
