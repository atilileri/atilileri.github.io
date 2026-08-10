# Does constraining the search space actually work?

**Question:** `privates/best-prac/applications.md` claims that structured input turns a coding agent from a creative text generator into a precise engineering engine, via three mechanisms — **evaluative rubrics** (constraining quality), **ground-truth reference material** (mitigating hallucination), and **structural modality mapping** (cross-representation synthesis). Are those three defensible against primary sources, and which are strong enough for an executive slide? Which of the note's four "best practices" are corroborated by vendor guidance rather than practitioner folklore?

**Date:** 2026-08-10

---

## TL;DR verdict

**The thesis survives with two legs, not three — and the note's stated *mechanism* is wrong even where its *practice* is right.**

- **Leg 2 (ground truth) is the strongest and the only one with hard, code-specific numbers.** Baseline: 19.7% of package dependencies in 576,000 LLM code generations were hallucinated ([Spracklen et al., USENIX Security 2025](https://www.usenix.org/publications/loginonline/we-have-package-you-comprehensive-analysis-package-hallucinations-code)). Fix: injecting API documentation lifted valid low-frequency API invocations for GPT-4o from **38.58% → 47.94%** ([Jain et al., CloudAPIBench, arXiv:2407.09726](https://arxiv.org/abs/2407.09726)), and RAG over docs for rare libraries improved performance **83%–220%** ([Chen et al., arXiv:2503.15231](https://arxiv.org/abs/2503.15231)). **But** the same paper measured naive doc injection *degrading* common-API accuracy by up to **39 percentage points**. The slide must not say "it stops guessing." It reduces guessing on the long tail and can hurt on the head.
- **Leg 1 (rubrics) is defensible as a practice, not as the note's mechanism.** Checklist-structured evaluation measurably improves both judging (agreement with humans 46.4% → 52.2%) and generation (+7.8% absolute on LiveBench reasoning via self-refinement against a generated checklist) ([Cook et al., TICK, arXiv:2410.03608](https://arxiv.org/abs/2410.03608)). All three vendors independently tell you to do it. The evidence is general-purpose, not coding-specific.
- **Leg 3 (modality mapping) does not survive.** There is no primary source establishing that agents are *reliably* good at code → diagram / schema → code translation. The empirical studies that exist report middling, language-dependent F1 on small open models, and LLM-assisted diagrams scoring 61.1%–67.7% on completeness and correctness while "consistently underperform[ing]" human-created ones. **Cut it.** The map's fog call was right.
- **The single most exec-legible measured fact in this whole area** is the SWE-bench Verified construction: OpenAI's 93 annotators flagged **38.3% of original SWE-bench samples for underspecified problem statements**, and GPT-4o's score went from **16% to 33.2%** once the bad samples were removed. It is on point — but it is *confounded* (broken tests were removed at the same time), and a technical attendee can say so. See §4 for how to say it safely.

**One sentence you must not put on a slide:** *"you change its underlying objective function."* You do not. See §1.

---

## 1. The mechanism claim is wrong, and a technical attendee will catch it

`applications.md` says a rubric means the model "evaluates candidate tokens against specific, localized dimensions" instead of "optimizing purely for text plausibility," and that structured input "constrains the model's search space."

That is not what happens. Next-token sampling is unchanged by a rubric in the prompt: the model is still computing `P(token | context)` and the decoding objective is identical. What changes is the **conditioning** — the prompt moves probability mass, it does not install a new objective. Nothing evaluates candidate tokens against "atomicity" or "testability."

This matters because there *is* exactly one thing in the note's list that **literally** constrains the search space, and it is the one the note underplays: **constrained decoding** for structured outputs, where the schema is compiled to a grammar and invalid tokens are masked out at each step. OpenAI's Structured Outputs is that, and the docs state it "ensures the model will always generate responses that adhere to your supplied JSON Schema, so you don't need to worry about the model omitting a required key, or hallucinating an invalid enum value" ([OpenAI, Structured model outputs](https://developers.openai.com/api/docs/guides/structured-outputs)).

So the honest framing, which is also the *better* framing for a room of engineers:

> Prompting shifts the distribution. Only decoding constraints shrink the space. Both are worth doing — but for different reasons, and only one of them is a guarantee.

**Verdict:** keep the note's *conclusions*, replace its *physics*. "Constraining the search space" is fine as a title metaphor; "changes the objective function" and "evaluates candidate tokens against dimensions" are falsifiable and should not reach the screen or the presenter note.

---

## 2. Leg 1 — evaluative rubrics: does an explicit rubric measurably improve output?

**Measured findings (real experiments):**

- **TICK / STICK** ([arXiv:2410.03608](https://arxiv.org/abs/2410.03608)) is the closest thing to a direct test. It decomposes an instruction into instruction-specific YES/NO checklist questions.
  - *Evaluation:* exact agreement between LLM judgements and human preferences rose **46.4% → 52.2%** versus direct scoring.
  - *Generation:* self-refinement against the generated checklist (STICK) gained **+7.8% absolute** on LiveBench reasoning; Best-of-N selection using the checklist gained **+6.3% absolute** on WildBench.
  - *Humans too:* giving human annotators the generated checklist raised inter-annotator agreement **0.194 → 0.256**. That is a nice line for an exec room — the checklist makes *people* agree with each other more, not just models.
- **Rubrics as Rewards** ([arXiv:2507.17746](https://arxiv.org/abs/2507.17746)) reports up to **31% relative** improvement on HealthBench and **7%** on GPQA-Diamond over Likert-style LLM-as-judge baselines, and finds rubric guidance improves accuracy at *every* judge size, with the biggest gains for smaller judges.
  - **Caveat a technical attendee will raise:** RaR is primarily a *reinforcement-learning reward design* paper, not a prompting result. Its transferable claim is about judging, not about a developer pasting a rubric into a prompt. Do not cite it as "rubrics make coding agents better."
- **Counter-evidence you should know about:** LLMs "struggle to self-correct their responses without external feedback, and at times, their performance even degrades after self-correction" ([Huang et al., *Large Language Models Cannot Self-Correct Reasoning Yet*, ICLR 2024](https://arxiv.org/abs/2310.01798)). A rubric only helps when it supplies **information the model did not already have** — externally authored criteria, a fresh context, or a real test result. A second pass with no new information is not a mechanism.

**What is missing:** I found **no** primary source running the clean coding-specific experiment — *same task, same model, with vs without an explicit acceptance-criteria rubric, measured on code quality*. The rubric evidence is general-instruction-following evidence. That is the honest gap. It is a plausible-and-well-supported practice, not a measured code result.

**Vendor corroboration (unanimous, and all three name it):**

- **Anthropic (Claude Code best practices):** an entire section titled *"Give Claude a way to verify its work"* — "Claude stops when the work looks done. Without a check it can run, 'looks done' is the only signal available." Its before/after table is literally the note's practice: *"implement a function that validates email addresses"* → *"write a validateEmail function. example test cases: … run the tests after implementing"* ([Claude Code best practices](https://code.claude.com/docs/en/best-practices)).
- **GitHub Copilot:** "Be specific about your requirements"; "Use examples to help Copilot understand what you want. You can provide example input data, example outputs, and example implementations"; "break the task into multiple simple, small tasks" ([Prompt engineering for Copilot Chat](https://docs.github.com/en/copilot/concepts/prompting/prompt-engineering)).
- **Anthropic (Building effective agents):** the evaluator-optimizer workflow "is particularly effective when we have clear evaluation criteria" ([Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)).

**Verdict:** **Put it on the slide, phrased as "tell it what done means."** Cite the checklist result (+7.8% / +6.3%) if you want a number. Do not claim a measured code-quality delta — there isn't one.

---

## 3. Leg 2 — ground-truth reference material: what happens to hallucinated signatures?

This is the leg with real code-specific measurement, in both directions.

**The size of the problem (measured):**

- Spracklen et al., *We Have a Package for You!* (USENIX Security 2025): 16 models, **576,000 code generations**, **19.7% of package dependencies hallucinated** — 440,445 total, 205,474 unique non-existent package names. Open-source models ~21.7%, commercial ~5.2%. **43% of hallucinations repeated across queries**, which is what makes slopsquatting a real supply-chain attack rather than a curiosity ([USENIX ;login:](https://www.usenix.org/publications/loginonline/we-have-package-you-comprehensive-analysis-package-hallucinations-code); [dataset](https://github.com/Spracks/PackageHallucination)).

**The fix, measured:**

- **CloudAPIBench** ([Jain et al., arXiv:2407.09726](https://arxiv.org/html/2407.09726v1), Amazon; 622 Python tasks over AWS/Azure APIs) measures *valid API invocations* split by how often the API appears in training data.
  - GPT-4o on **low-frequency** APIs (≤10 occurrences): **38.58% → 47.94%** with Documentation Augmented Generation.
  - Selective retrieval (DAG++, trigger docs only when the API is unknown or model confidence is low): **+8.20% absolute** overall for GPT-4o.
- **Chen et al.** ([arXiv:2503.15231](https://arxiv.org/abs/2503.15231), 1,017 APIs from four less-common Python libraries): RAG over API documentation improved performance **83%–220%**. Ablation: **example code contributes the most**, more than descriptive text or parameter lists.
  - That ablation is a directly actionable slide-adjacent fact: *paste the usage example, not the prose.*

**The counter-finding you must not omit:**

- CloudAPIBench also found that **naive doc injection makes things worse on APIs the model already knows**: "DAG with suboptimal retrievers induces higher hallucination rates for high frequency APIs compared to the base model" — StarCoder2-3B fell 84.39% → 67.32%, and GPT-4o took a reported **39.02 percentage point** drop on high-frequency APIs. Base GPT-4o was already at **93.66%** valid there.
- Implication: "always inject version-locked references" (the note's phrasing) is **too strong**. The measured best practice is *conditional* retrieval — inject when the API is rare, internal, recently changed, or when the model is unconfident. Blanket injection is a net negative on the common path, and it also spends the context budget that chapter 4's own smart-zone slide tells you to protect.

**Verdict:** **The strongest leg. Put a number on the slide.** Recommended framing: *"It invents libraries roughly one time in five. Give it the real signatures and the invented ones mostly stop — for the APIs it doesn't already know."* Both halves of that sentence are needed to stay honest.

---

## 4. The SWE-bench Verified underspecification result — what it does and does not prove

This is the result the map's earlier run flagged as directly on point. It is genuinely useful, and genuinely easy to overclaim.

**What is true:**

- OpenAI had **93 experienced Python developers** annotate 1,699 random SWE-bench samples, three annotators each, to build the 500-sample SWE-bench Verified.
- **38.3% of samples were flagged for underspecified problem statements.** 61.1% were flagged for unit tests that could unfairly fail a valid solution. **68.3% of original samples were filtered out** in total.
- GPT-4o scored **16% on original SWE-bench and 33.2% on SWE-bench Verified** — roughly double.

**What it does not prove:** that supplying a better spec doubles agent performance. Two confounds:

1. **The change is to the benchmark, not to the prompt.** Nobody rewrote an underspecified issue and re-ran it. Bad *tests* were removed at the same time as bad *specs*, and the test problem was flagged more often (61.1%) than the spec problem (38.3%). The doubling is jointly attributable.
2. **The direction of the spec effect is contested.** Independent work finds SWE-bench performance is partly driven by issue statements that *give away the answer* — "solution leak" — with reported drops for SWE-agent + Claude 3.5 from **47% → 27.33%** (Lite) and **57.6% → 31.8%** (Verified) once leaks and weak tests are filtered ([SWE-Bench+, OpenReview](https://openreview.net/pdf?id=R40rS2afQ3)). Read charitably, that is *support* for the thesis — information in the prompt is what moves the score. Read cynically, it says the benchmark measures reading comprehension of a spec, not engineering.
3. A separate empirical study found **66.2% of examined patches have uncertain correctness due to under-specified requirements**, and that filtering behaviourally-divergent patches drops leaderboard scores by 14–19 points (CodeStory 62.2% → 44.0%; OpenHands 53.0% → 38.6%) ([Wang, Pradel & Liu, arXiv:2503.15223](https://arxiv.org/html/2503.15223v1)).

**Safe slide phrasing:** *"When engineers audited the standard agent benchmark, four in ten tasks were too vaguely specified to be gradeable at all."* That is defensible, memorable, and does not claim a causal delta. **Unsafe:** *"specifying the task doubles agent performance."*

Also worth knowing before you cite the benchmark at all: OpenAI has since published [Why SWE-bench Verified no longer measures frontier coding capabilities](https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/). Use the annotation *finding*, not the leaderboard.

---

## 5. Leg 3 — structural modality mapping: does it survive?

**No. There is no primary source supporting "high fidelity" structural translation by agents.** What exists:

- An empirical study extracting UML class diagrams from Java and Python programs evaluated **StarCoder2, LLaMA, CodeLlama, Mistral and DeepSeek** on accuracy, consistency and F1. Findings: all models did better on Python than Java; DeepSeek and Mistral best, LLaMA worst throughout ([Agile MDE / STAF 2025](https://conf.researchr.org/details/staf-2025/a-mde-2025-papers/6/Using-LLMs-to-Extract-UML-Class-Diagrams-from-Java-and-Python-Programs-An-Empirical-); [CEUR Vol-4122 paper 12](https://ceur-ws.org/Vol-4122/paper12.pdf)). These are small open models, not frontier coding agents — the study does not license a claim about Claude Code or Copilot.
- A GPT-4-turbo diagram-generation study reports LLM-assisted diagrams reaching **61.1%–67.7%** completeness and correctness while "consistently underperform[ing]" human-created diagrams ([EMSE 2024](https://dl.acm.org/doi/10.1145/3674805.3690741)).
- The *adjacent* claim that **is** solid is not about translation quality at all — it is about **format compliance**, and that is a decoding guarantee, not a synthesis capability (§1, §6).

**The gap is exactly where the note is most confident.** "Its internal attention mechanisms map relationships with high fidelity" is an unfalsifiable mechanism story attached to a capability claim the literature does not support. A modelling-literate attendee — and ASML has them — can name the counter-evidence.

**Verdict: drop the third leg.** If the slide's visual design wants three, the honest third leg is **executable verification** (a test, a build, a lint, a screenshot diff): it is vendor-endorsed by all three, it is the actual reason the other two legs pay off, and it hands directly to chapter 4's later slides and to chapter 5.

---

## 6. The four "best practices" — vendor-corroborated or folklore?

| Practice (from `applications.md`) | Status | Basis |
| --- | --- | --- |
| **Front-load acceptance criteria** | **Corroborated by all three vendors**, plus a general-purpose measured result | Anthropic: "Give Claude a way to verify its work" + "Provide specific context in your prompts" ([best practices](https://code.claude.com/docs/en/best-practices)). GitHub: "be specific"; "provide examples of… input data, outputs, and implementations" ([prompt engineering](https://docs.github.com/en/copilot/concepts/prompting/prompt-engineering)). Measured: TICK/STICK +7.8%/+6.3%. **No coding-specific measured delta exists.** |
| **Decouple generation from evaluation** | **Corroborated, and vendor-specified in unusual detail** | Anthropic's *evaluator-optimizer* workflow: "one LLM call generates a response while another provides evaluation and feedback in a loop… particularly effective when we have clear evaluation criteria" ([Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)). Claude Code documents a Writer/Reviewer pattern and an adversarial review subagent, with the key rationale: "a fresh model try to refute the result, so the agent doing the work isn't the one grading it"; "a fresh context improves code review since Claude won't be biased toward code it just wrote." GitHub: "always validate the code it suggests," "use automated tests and tooling to check Copilot's work" ([best practices](https://docs.github.com/en/copilot/get-started/best-practices)). **Load-bearing caveat:** the decoupling only works because the reviewer gets *new information* (fresh context + explicit criteria). Same model, same context, second pass, no new input can *degrade* results (Huang et al., ICLR 2024). Anthropic itself warns a reviewer "prompted to find gaps will usually report some, even when the work is sound." |
| **Provide version-locked reference context** | **Corroborated and measured — but the word "always" is wrong** | Measured: §3. Vendor: GitHub — "If you are using an uncommon library, describe what the library does… set the import statements at the top of the file or specify what library you want to use" (note: *uncommon*, matching the low-frequency finding). Anthropic: "Give URLs for documentation and API references," and CLAUDE.md should exclude "detailed API documentation (link to docs instead)." The vendors and the papers agree it should be **conditional**, not blanket. |
| **Enforce explicit output schemas** | **Corroborated — but for parseability, not quality. Contested for reasoning.** | OpenAI Structured Outputs guarantees schema adherence via constrained decoding, and the docs are explicit about its limits: "Structured Outputs can still contain mistakes" — i.e. structural compliance, not semantic correctness; refusals need not follow the schema; several JSON Schema features are unsupported ([docs](https://developers.openai.com/api/docs/guides/structured-outputs)). **Counter-evidence:** *Let Me Speak Freely?* observes "a significant decline in LLMs reasoning abilities under format restrictions," worsening with stricter constraints ([Tam et al., arXiv:2408.02442](https://arxiv.org/abs/2408.02442)). This is disputed in follow-up work, so present it as a live tension, not a settled cost. |

**Net:** three of four are solid vendor-corroborated practice. The fourth is real but is a *different kind* of claim than the note makes — it buys you a parsing guarantee, possibly at a reasoning cost, and it is the only item on the list that literally constrains the search space.

---

## 7. What a technical attendee could falsify

Ranked by how likely someone in an ASML room is to call it:

1. **"Changes the objective function" / "evaluates candidate tokens against dimensions"** (§1) — straightforwardly wrong about how decoding works. **Highest risk. Cut.**
2. **"It stops guessing method signatures"** (§3) — measured effect is 38.58% → 47.94% on rare APIs, and *negative* on common ones. "Stops" is indefensible.
3. **"Agents map structure with high fidelity"** (§5) — no supporting primary source; existing studies show 61–67% correctness and heavy model/language variance. **Cut the leg.**
4. **"Specifying the task doubles performance"** (§4) — the 16% → 33.2% number is real but confounded by simultaneous test-quality filtering.
5. **Any rubric number presented as a coding result** (§2) — TICK and RaR are general-instruction and reward-modelling results. If you show +7.8%, say what benchmark it is.
6. **"Always inject documentation"** (§3, §6) — contradicted by the vendors' own "uncommon library" phrasing and by the high-frequency degradation measurement, and it fights this chapter's own context-budget slide.
7. **"Structured output improves quality"** (§6) — it improves *parseability*; there is published evidence it can cost reasoning.

---

## How to present this

**Recommended: two legs, not three, plus verification as the payoff.**

The thesis slide becomes a two-by-one with a closing beat, which is also a better fit for the chapter's spine (the map already routes hallucination to the closing callback and verification to the guardrails and roll-back slides):

1. **Tell it what "done" means.** *Front-load the criteria; don't ask for "good code."* Backing if pressed: checklist-structured evaluation raises model-human agreement 46.4% → 52.2% and gains +7.8% via self-refinement (TICK/STICK); all three vendors say the same thing in their own docs.
2. **Give it the source of truth.** *It invents about one dependency in five; hand it the real signatures.* Backing: 19.7% hallucinated packages across 576k generations (USENIX 2025); doc injection 38.58% → 47.94% on APIs it doesn't know (CloudAPIBench). Second beat, if there is room: *only for what it doesn't already know* — blanket injection made common-API accuracy worse.
3. **(Replacing modality mapping) Then make it check.** A rubric it cannot run is a wish. A test, a build, or a screenshot diff closes the loop without you in it — "Claude stops when the work looks done; without a check it can run, 'looks done' is the only signal available."

**Where the SWE-bench line goes:** it is the best cold-open in this research. *"When engineers audited the standard benchmark for coding agents, four in ten tasks were too vaguely specified to be gradeable."* It sets up leg 1 without asserting a causal delta, and it reframes vagueness as an **engineering defect the audience already recognises from their own tickets** — which is the exec-legible version of this whole chapter.

**Wording to avoid on screen and in presenter notes:** "objective function," "search space" used literally, "stops hallucinating," "high fidelity," "always inject." **Wording that is safe:** "shifts what it is likely to produce," "reduces invented APIs on the long tail," "gives it something it can check itself against."

---

## Sources

**Primary sources I opened directly:**

- [Anthropic — Best practices for Claude Code](https://code.claude.com/docs/en/best-practices) — "Give Claude a way to verify its work"; verification-criteria before/after table; Writer/Reviewer pattern; adversarial review subagent ("the agent doing the work isn't the one grading it"); "Give URLs for documentation and API references"; the trust-then-verify failure pattern; the caution that a gap-hunting reviewer over-reports.
- [Anthropic — Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) — evaluator-optimizer definition and its "clear evaluation criteria" indicator; "tool definitions and specifications should be given just as much prompt engineering attention as your overall prompts."
- [GitHub Docs — Prompt engineering for GitHub Copilot Chat](https://docs.github.com/en/copilot/concepts/prompting/prompt-engineering) — be specific; provide examples; break tasks down; "if you are using an uncommon library, describe what the library does."
- [GitHub Docs — Best practices for using GitHub Copilot](https://docs.github.com/en/copilot/get-started/best-practices) — "always validate the code it suggests"; "use automated tests and tooling to check Copilot's work"; open relevant files / close irrelevant ones.
- [OpenAI — Structured model outputs (API guide)](https://developers.openai.com/api/docs/guides/structured-outputs) — the adherence guarantee, plus the explicit caveats: "Structured Outputs can still contain mistakes," refusals need not follow the schema, unsupported schema keywords.
- [Jain et al. — On Mitigating Code LLM Hallucinations with API Documentation (CloudAPIBench)](https://arxiv.org/html/2407.09726v1) — 622-task Python benchmark; GPT-4o low-frequency 38.58% → 47.94% with DAG; high-frequency degradation ("84.39%→67.32%" for StarCoder2-3B; 39.02pp drop reported for GPT-4o); DAG++ +8.20% absolute.
- [Chen et al. — When LLMs Meet API Documentation (arXiv:2503.15231)](https://arxiv.org/abs/2503.15231) — 1,017 APIs across four less-common Python libraries; RAG improvement 83%–220%; example code contributes more than descriptive text or parameter lists.
- [Wang, Pradel & Liu — Are "Solved Issues" in SWE-bench Really Solved Correctly?](https://arxiv.org/html/2503.15223v1) — 66.2% of examined patches uncertain due to under-specified requirements; 29.6% of plausible patches behave differently from ground truth; CodeStory 62.2% → 44.0%, LearnByInteract 60.2% → 40.8%, OpenHands 53.0% → 38.6% after filtering.
- [Huang et al. — Large Language Models Cannot Self-Correct Reasoning Yet (ICLR 2024)](https://arxiv.org/abs/2310.01798) — intrinsic self-correction without external feedback fails and can degrade performance (abstract read directly).
- [Tam et al. — Let Me Speak Freely? (arXiv:2408.02442)](https://arxiv.org/abs/2408.02442) — "a significant decline in LLMs reasoning abilities under format restrictions"; stricter constraints, greater degradation (abstract read directly).

**Primary findings taken from search-index summaries of the source (page not opened directly — flagged in text):**

- [Spracklen et al. — We Have a Package for You! (USENIX Security 2025)](https://www.usenix.org/publications/loginonline/we-have-package-you-comprehensive-analysis-package-hallucinations-code) — 16 models, 576,000 generations, 19.7% hallucinated dependencies (440,445), 205,474 unique names, 5.2% commercial vs 21.7% open-source, 43% repeatable. Dataset: [Spracks/PackageHallucination](https://github.com/Spracks/PackageHallucination). Numbers via the USENIX ;login: summary and search index; **verify the 19.7% and 43% against the paper PDF before putting either on a slide.**
- [OpenAI — Introducing SWE-bench Verified](https://openai.com/index/introducing-swe-bench-verified/) — 93 annotators, 1,699 samples, three annotators each; 38.3% underspecified; 61.1% unfair tests; 68.3% filtered; GPT-4o 16% → 33.2%. **The page returned HTTP 403 to my fetcher**; all figures are from the search index's summary of that page. Corroborated indirectly by [OpenAI — Why SWE-bench Verified no longer measures frontier coding capabilities](https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/).
- [Cook et al. — TICKing All the Boxes (arXiv:2410.03608)](https://arxiv.org/abs/2410.03608) — 46.4% → 52.2% human agreement; STICK +7.8% LiveBench reasoning, +6.3% WildBench Best-of-N; annotator agreement 0.194 → 0.256.
- [Rubrics as Rewards (arXiv:2507.17746)](https://arxiv.org/abs/2507.17746) — up to 31% relative on HealthBench, 7% on GPQA-Diamond over Likert LLM-as-judge baselines.
- [SWE-Bench+ (OpenReview)](https://openreview.net/pdf?id=R40rS2afQ3) — solution-leak filtering drops: SWE-agent + Claude 3.5 47% → 27.33% (Lite), 57.6% → 31.8% (Verified); OpenHands + CodeAct 42% → 22%, 52.4% → 26.8%. **The 60.83% solution-leak figure appears in the search summary and should be checked against the paper before use.**
- [Using LLMs to Extract UML Class Diagrams from Java and Python Programs (Agile MDE / STAF 2025)](https://conf.researchr.org/details/staf-2025/a-mde-2025-papers/6/Using-LLMs-to-Extract-UML-Class-Diagrams-from-Java-and-Python-Programs-An-Empirical-) — StarCoder2/LLaMA/CodeLlama/Mistral/DeepSeek; Python > Java throughout; DeepSeek and Mistral best, LLaMA worst. The [CEUR PDF](https://ceur-ws.org/Vol-4122/paper12.pdf) would not render to text for my fetcher, so per-model F1 values are **not** verified here.
- [Evaluating Large Language Models in Exercises of UML Class Diagram Modeling (ESEM 2024)](https://dl.acm.org/doi/10.1145/3674805.3690741) — LLM-assisted diagrams 61.1%–67.7% completeness/correctness, consistently below human-created diagrams. Via search summary.
- [OpenAI — Introducing Structured Outputs in the API](https://openai.com/index/introducing-structured-outputs-in-the-api/) — the widely-quoted "100% schema adherence vs ~86% function calling" comparison. **Page returned HTTP 403**; the API guide above is the version I actually read, and it makes the weaker, safer claim. Do not put the 100% figure on a slide from this research alone.

**Brief being tested (not a source):** `privates/best-prac/applications.md`.
