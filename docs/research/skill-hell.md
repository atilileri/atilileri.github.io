# Skill hell — the token mechanics behind "empower the user, not the agent"

**Question:** Matt Pocock's *skill hell* ([video](http://www.youtube.com/watch?v=32LyZyFQhCQ)) says developers stack GSD, spec-kit and a dozen skill packs into one context and cludge them together until nothing works, and prescribes a philosophical cure — *build skills that empower the **user**, not the agent*. What is the **mechanical** cost of stacking skills? Can the argument be re-grounded in the chapter's attention-degradation spine instead of left as opinion? And what does that constrain about chapter 5, which proposes an operating model built entirely out of skills?

**Date:** 2026-08-10

---

## TL;DR verdict

**Yes — skill hell is a mechanical claim, and the numbers exist.** Three findings carry it.

1. **The loading model is not "all upfront."** Claude Code preloads only each skill's `name` + `description` (capped at **1,536 characters** combined with `when_to_use`, explicitly "to reduce context usage"); the body loads only on invocation ([Claude Code — skills](https://code.claude.com/docs/en/skills)). So a skill you never call costs you *hundreds of tokens*, not thousands. **The upfront-token panic is the wrong worry.**
2. **The real cost is what happens after invocation.** An invoked skill's body "enters the conversation as a single message and **stays there for the rest of the session**" — a recurring cost on every subsequent turn, at full attention weight, competing with everything else ([Claude Code — skills](https://code.claude.com/docs/en/skills)). Stacking skills is therefore not a storage problem, it is an **instruction-density** problem, which is exactly the deck's attention-degradation spine.
3. **Instruction density has a measured cost, and skills have a measured optimum.** IFScale shows frontier models at 92–100% adherence with 10 simultaneous instructions but only **68% at 500**, with reasoning models holding near-perfect until **~150** and then collapsing ([Jaroslawicz et al., *How Many Instructions Can LLMs Follow at Once?*](https://arxiv.org/abs/2507.11538)). SkillsBench, evaluating skills specifically, finds curated skills lift pass rate **+16.6 pp (33.9% → 50.5%)** — *but* "**Focused Skills with at most three modules outperform larger or exhaustive bundles**" ([SkillsBench](https://arxiv.org/abs/2602.12670)).

**The one-line reframe:** skills are not free and they are not expensive — they are *loud*. Every loaded one competes for the same attention budget, and the evidence says the payoff peaks at about three.

**And "empower the user, not the agent" is already mechanical** — Pocock's own `writing-great-skills` encodes it as a two-currency trade: a model-invoked skill "contributes to **context load** — the description sits in the window every turn"; a user-invoked skill has "**zero context load**, but it spends **cognitive load**: *you* are the index that must remember it exists" (`/home/neo/projects/atilileri.github.io/.agents/skills/writing-great-skills/SKILL.md`). Empowering the user is not a value statement. It is **moving cost off the model's attention budget and onto the human's memory** — and the human's is the one that doesn't degrade at 150 instructions.

---

## 1. The real loading model (what a skill costs before you call it)

Anthropic's documented design is **progressive disclosure**, "the core design principle that makes Agent Skills flexible and scalable," in three levels ([Anthropic — Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)):

1. **Startup** — Claude "pre-loads the `name` and `description` of every installed skill into its system prompt."
2. **On demand** — "If Claude thinks the skill is relevant to the current task, it will load the skill by reading its full `SKILL.md` into context."
3. **Deeper** — sibling files (`reference.md`, `examples.md`, scripts) load only when referenced during execution.

Claude Code's docs put hard numbers on level 1 that the engineering post does not:

- The combined `description` + `when_to_use` text "is **truncated at 1,536 characters** in the skill listing **to reduce context usage**" ([Claude Code — skills](https://code.claude.com/docs/en/skills)). That is the enforced ceiling on what an uninvoked skill can cost you — roughly **380 tokens worst case**, typically far less.
- `disable-model-invocation: true` removes the description from context entirely: "Description **not** in context, full skill loads when you invoke."
- Level 2 is where the money is: "Unlike CLAUDE.md content, a skill's body loads only when it's used, so long reference material **costs almost nothing until you need it**."

**Measured on this very repository** (22 skills in `.agents/skills/`, the mattpocock/skills set):

| | chars | ≈ tokens |
|---|---|---|
| All 22 frontmatter blocks (the standing cost) | 4,703 | **~1,200** |
| All 22 skill bodies (if every one were invoked) | 96,845 | **~24,000** |

So the full mattpocock/skills library costs about **1.2k tokens standing** — about **1%** of the 100k soft ceiling, i.e. negligible. But *invoking* all of it would cost **~24k tokens, permanently resident for the rest of the session** — a quarter of the soft ceiling, before a single line of the user's actual code enters the window. **That 20× ratio is the whole argument.** Skill hell is not caused by *installing* skills. It is caused by *running* them all in one session.

Two further mechanics sharpen it:

- **Stacking is a supported gesture, and that is the trap.** Typing `/write-tests /fix-issue 123` loads both; "Claude Code expands the first skill plus **up to five more** stacked after it" ([Claude Code — skills](https://code.claude.com/docs/en/skills)). Six full skill bodies, resident, in one message. The tool makes skill hell one keystroke away.
- **Compaction forces a triage you didn't choose.** After auto-compaction, Claude Code "re-attaches the most recent invocation of each skill after the summary, keeping the **first 5,000 tokens** of each. Re-attached skills share a combined budget of **25,000 tokens** … so **older skills can be dropped entirely** after compaction if you have invoked many in one session." The system *already* concedes that many-skills-at-once does not survive a long session intact — and it drops them silently.
- **Subagents invert the model.** "Subagents with preloaded skills work differently: the **full skill content is injected at startup**." Fanning skills out to subagents converts progressive disclosure back into upfront loading — per agent, but in a fresh window.

There is a diagnostic note in the docs worth quoting almost verbatim on the presenter note, because it is precisely the skill-hell symptom described from the vendor side:

> "If a skill seems to stop influencing behavior after the first response, the content is usually still present and **the model is choosing other tools or approaches**. … If the skill is large or **you invoked several others after it**, re-invoke it after compaction to restore the full content."

That is the mechanism: not eviction, **dilution**.

## 2. Does instruction density measurably degrade adherence?

Yes, and this is the finding that converts skill hell from philosophy into the chapter's spine.

**IFScale** ([Jaroslawicz, Whiting, Shah, Maamari — *How Many Instructions Can LLMs Follow at Once?*, arXiv:2507.11538](https://arxiv.org/abs/2507.11538)) benchmarks 20 frontier models across 7 providers on 10 → 500 simultaneous instructions:

- At **10 instructions**, most models are near-perfect (**92–100%**).
- At **500**, "even the best frontier models only achieve **68% accuracy**."
- Three degradation shapes: **threshold decay** (reasoning models — o3, Gemini 2.5 Pro — near-perfect "through approximately 150 instructions before declining sharply"); **linear decay** (GPT-4.1, Claude 3.7 Sonnet); **exponential decay** (smaller/older models — Claude 3.5 Haiku, Llama-4-Scout — "rapid early degradation followed by performance stabilization at low accuracy floors").
- **Primacy bias**: "they start low at minimal instruction densities … **peak around 150–200 instructions**, then level off." The model preferentially obeys whatever it read first.
- **Error type shifts under load**: "Models overwhelmingly err toward **omission errors** as instruction density increases." It does not misapply your instruction; it silently drops it.

Two caveats to state honestly. IFScale's instructions are keyword-inclusion constraints, not procedural workflows — it measures *adherence density*, not skill quality. And "150 instructions" is **not** the same axis as the deck's 100k/150k token rules of thumb; the numeric echo is coincidence and **must not be presented as the same threshold**.

But the shape transfers, and the underlying mechanism is Anthropic's own stated one:

> "LLMs have an **attention budget** that they draw on when parsing large volumes of context." … "LLMs are based on the transformer architecture, which enables every token to attend to every other token … This results in **n² pairwise relationships** for n tokens." … "Context, therefore, must be treated as a **finite resource with diminishing marginal returns**." … "as the number of tokens in the context window increases, the model's ability to accurately recall information from that context decreases" (**context rot**).
> — [Anthropic — Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

And Anthropic names the same failure mode for the adjacent surface: "One of the most common failure modes we see is **bloated tool sets that cover too much functionality or lead to ambiguous decision points about which tool to use**." Substituting "skills" for "tools" needs no argument — skill selection is the same disambiguation problem, and the prescription is identical: "finding the **smallest possible set of high-signal tokens** that maximize the likelihood of some desired outcome."

**Skill-specific evidence** comes from SkillsBench ([arXiv:2602.12670](https://arxiv.org/abs/2602.12670), BenchFlow; 87 tasks, 8 domains, 18 model-harness configurations, paired with/without-skills evaluation). Its abstract carries both halves of the argument in two consecutive sentences:

> "Curated Skills raise the average pass rate from **33.9% to 50.5%** (+16.6 percentage points; 25.5% normalized gain), with configuration-level gains ranging from +4.1 to +25.7 pp. **Focused Skills with at most three modules outperform larger or exhaustive bundles**, and smaller models with Skills can match larger models without them."

Reported for the same paper via [alphaXiv's overview](https://www.alphaxiv.org/overview/2602.12670) (secondary — the bundle-size split is not in the abstract, so treat the exact figures as indicative):

- Tasks bundled with **1–3 skills: ≈ +19.0 pp**. Tasks with **4+ skills: ≈ +10.1 pp**. Roughly **half the benefit** for more than triple the context.
- **13 of 87 tasks (~15%) got *worse*** with skills, via three mechanisms: heavyweight prescribed workflows crowding out simpler native strategies; **over-reliance** (the agent stops reasoning and follows slightly-wrong guidance off a cliff); and brittle tool integration.
- **Agent-authored skills were actively harmful**: −8.1 to −11.5 pp versus no skills at all.

That last bullet is the empirical form of Pocock's thesis. *Skills written to encode a process for the agent, by the agent, made things worse than nothing.*

## 3. "Empower the user, not the agent," unpacked

Pocock's video states the cure philosophically: design skills that empower the user rather than "encode entire software development processes directly into the agent"; keep "hands on the steering wheel"; skill hell comes from "throwing numerous different skills into the same context window simultaneously without reviewing them" (`privates/best-prac/skill-hell.md`).

The mechanical translation is already in his own library, and it is a **two-currency trade**:

> "A **model-invoked** skill keeps a **description**, so the agent can fire it autonomously … It contributes to **context load** — the description sits in the window every turn."
> "A **user-invoked** skill strips the description from the agent's reach: only you, typing its name, can invoke it … **Zero context load**, but it spends **cognitive load**: *you* are the index that must remember it exists."
> "Pick model-invocation only when the agent must reach the skill on its own … If it only ever fires by hand, make it user-invoked and pay no context load."
> — `.agents/skills/writing-great-skills/SKILL.md` (mattpocock/skills)

So the philosophy has a switch behind it: `disable-model-invocation: true`. And the library is architected around it — user-invoked skills orchestrate; model-invoked skills hold reusable discipline; "user-invoked skills may call model-invoked skills, but never other user-invoked ones" ([mattpocock/skills README](https://github.com/mattpocock/skills)). Pocock's v1 announcement claims "a **63% reduction in token cost for skill descriptions**" alongside the model/user-invocable split ([Pocock, X](https://x.com/mattpocockuk/status/2067259590488510471) — via search index, not opened directly), which is the same optimisation stated as a number.

**The exec-legible distinction** — a skill that empowers the user versus one that locks them out:

| Empowers the user | Locks the user out |
|---|---|
| Fires only when a human types it (`disable-model-invocation`) | Fires itself whenever the agent guesses it's relevant |
| Encodes **one** step of the process | Encodes the **whole** process end to end |
| Returns to the human at a checkpoint | Runs to completion and reports |
| The human knows which stage they are in | The human learns what happened from the diff |
| Read before installed | Installed as a pack, unread |

The checkpoints are the operative part. Pocock's stated payoff for driving skills yourself: "you understand each stage of the workflow, retain the ability to guide the agent, and **can safely delegate** tasks when needed" — delegation is *earned* by having driven the stages, not skipped by installing a pack. And Anthropic's own harness now enforces the same principle on its most expensive skills: `/verify` and `/code-review` "run only when you invoke them, which **keeps you in control** of when these longer-running checks spend time and tokens" ([Claude Code — skills](https://code.claude.com/docs/en/skills)).

**The executive translation:** *don't buy a process-in-a-box; buy a set of steps your people trigger.* The value of a skill library is that the humans still know which stage they are in.

## 4. GitHub Copilot's equivalent surface — same failure mode, worse defaults

Copilot's customisation surface splits along the same always-on / on-demand line, and the always-on side is *more* exposed than Claude Code's:

| Surface | Loading | Skill-hell exposure |
|---|---|---|
| `.github/copilot-instructions.md` (repo-wide) | **Every request, automatically** — "Instructions are automatically added to requests that you submit to Copilot" | **High** — full text, unconditional |
| `AGENTS.md` / `CLAUDE.md` / `GEMINI.md` | Automatic for agents; "the nearest file in the directory tree takes precedence" | High, but path-scoped |
| `*.instructions.md` with `applyTo:` globs | Automatic **when the glob matches the edited file** | Medium — conditional |
| Prompt files (`/prompt-name`) | **On demand only** — "Unlike custom instructions that are applied automatically, you invoke prompt files manually in chat" | Low |
| Custom agents (`.github/agents/*.agent.md`) | Explicit selection; scopes persona + tool list | Low |

Sources: [GitHub Docs — Adding custom instructions](https://docs.github.com/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot), [GitHub Docs — Add repository instructions](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions), [VS Code — Prompt files](https://code.visualstudio.com/docs/copilot/customization/prompt-files).

**The key structural difference:** a Claude Code skill body is *withheld* until invoked; a Copilot instruction file is *injected in full on every single request*. There is no progressive disclosure on that surface. And they **stack rather than replace**: "Multiple types of custom instructions can apply to a request"; "If the path you specify matches a file that Copilot is working on, and a repository-wide custom instructions file also exists, then the instructions from **both** files are used"; "**all sets of relevant instructions are provided to Copilot**." Precedence is personal > repository > organization, but precedence only resolves *whose wins* — everyone's text is still in the window paying for attention.

Copilot's own mitigations are exactly the ones this research predicts:

- A hard brevity rule: "**Instructions must be no longer than 2 pages.**"
- An explicit conflict warning: "**Whenever possible, try to avoid providing conflicting sets of instructions.** If you are concerned about response quality, you can temporarily **disable** repository instructions."

That second line is the most useful thing in the Copilot docs for this deck: the vendor documents "turn your instructions off and see if quality improves" as a supported debugging step. **Skill hell has an official troubleshooting procedure.** For an ASML room on Copilot, this is the more relevant surface than SKILL.md — the same disease, without the progressive-disclosure vaccine.

## 5. Counter-evidence — where heavy scaffolding demonstrably helps

State this honestly; the chapter's credibility depends on not overclaiming.

- **Skills work.** +16.6 pp average pass rate, 33.9% → 50.5%, across 18 model-harness configurations; "smaller models with Skills can match larger models without them" ([SkillsBench](https://arxiv.org/abs/2602.12670)). This is a *large* effect — larger than most prompt-engineering interventions — and it is the reason chapter 5 exists at all.
- **Domain variance is huge** — gains ranging roughly from single-digit pp in software engineering to very large gains in specialised domains (per secondary reporting). Scaffolding helps most where the model's priors are weakest.
- **The uninvoked cost genuinely is near-zero.** A large *installed* library is cheap; the docs' own framing — "costs almost nothing until you need it" — is accurate, and measured at ~1.2k tokens for 22 skills here. **Do not tell the room to install fewer skills. Tell them to run fewer at once.**
- **Ambiguity, not count, is the enemy.** Retrieval work on same-capability skill libraries reports selection accuracy degrading as functionally-overlapping skills accumulate ([SkillResolve-Bench, arXiv:2606.10388](https://arxiv.org/pdf/2606.10388) — read via automated summary only; treat as directional). Two skills that clearly do different things cost less than two that overlap — matching Anthropic's "ambiguous decision points about which tool to use."

**Net:** the curve is not monotonic-bad. It rises steeply from 0 → 3 skills and falls off after. The prescription is "**curate to about three**," not "avoid."

---

## 6. How this constrains chapter 5

Chapter 5 proposes an operating model built entirely out of mattpocock/skills: **wayfinder → grill/prototype/research → to-spec → to-tickets → implement → review (sub-agents) → document back** (`privates/private-notes.md`). Chapter 4's hygiene slide has to inoculate against skill hell *without* undercutting the chapter that follows it. The research says it can — because **chapter 5's proposal is already the cure, not the disease**, and the deck should say so out loud.

**Six constraints, in priority order:**

1. **Present chapter 5 as a sequence, never as a stack.** SkillsBench: "Focused Skills with at most three modules outperform larger or exhaustive bundles" (+19.0 pp at 1–3 vs +10.1 pp at 4+). The eight-stage flow is fine *because each stage runs in its own session with one or two skills loaded*. If the deck ever lets the room read it as "install these eight and let it rip," chapter 4's own evidence indicts chapter 5. The visual must be **a track, with hand-offs**, not a toolbox.
2. **Make the hand-offs the point, not the plumbing.** The `/handoff` skill and the wayfinder map/ticket artefacts are what let each stage start in a fresh window — they are the mechanism that keeps a long process off one attention budget. This is the same move as the roll-back slide (slide 4) and the smart zone (slide 2): **the operating model is the smart zone applied at the scale of a project.** Chapter 5 is chapter 4's widget, made organisational. That is the strongest available hand-off line between the two chapters, and it fixes the "not yet specified" hand-off in map #42.
3. **The user-invoked stages are the checkpoints — name them as such.** In mattpocock/skills, user-invoked skills orchestrate and can never call each other. That is not a technical detail; it is the operating model's **governance surface**: every stage boundary is a place a human must type something. For an exec room, that is the answer to "where does oversight live in this?" — it lives at the seven slashes. Do not present the flow as autonomous.
4. **Do not claim the process is automated.** SkillsBench's sharpest negative — agent-authored procedural knowledge scoring **−8.1 to −11.5 pp versus no skills at all**, plus 15% of tasks degraded by over-reliance — is a direct warning against "the agent runs its own process." Chapter 5's claim must be *"a sequenced process a person drives,"* not *"a pipeline that runs itself."*
5. **Slide 6 (hygiene) must say "don't run them all at once," not "don't install many."** The measured 20× gap between standing cost (~1.2k tokens for 22 skills) and invoked cost (~24k) is the crisp version. An install-fewer message would be both wrong and self-defeating two chapters later.
6. **Reuse the degradation curve; do not mint a second threshold.** The hygiene slide should point back at slide 2's widget rather than introduce IFScale's ~150-instruction number. Same mechanism (attention budget, n² attention, primacy, silent omission), same picture, one threshold on screen. The instructions-vs-tokens axis confusion is a real risk given 150 appears on both — **keep 150 as tokens only.**

**Residual risk to flag at grilling:** chapter 5's proposal uses sub-agents for review, and preloaded-skill subagents inject **full skill content at startup** rather than progressively. That is a defensible design (each subagent gets a fresh window), but if anyone in the room knows the mechanic, the honest framing is "we pay upfront loading *per agent* in exchange for never paying it in the main thread" — which is, again, the smart-zone argument.

---

## Deliverables

**One-line version for the hygiene slide (slide 6):**

> **Don't stack skills.** Installed is nearly free; **running** them isn't — every skill you invoke stays in the window for the rest of the session. The measured sweet spot is **about three**.

*(Alternates, if the slide wants a number rather than a rule: "22 skills installed: ~1k tokens. 22 skills invoked: ~24k tokens — and they never leave." Or, for the sharpest contrast with the room's instinct: "A skill you never call costs a sentence. A skill you call costs the rest of your session.")*

**Presenter note (the sharper argument):**

> Skills are loaded progressively — the agent sees only a name and a one-line description until it actually needs one, so a big library is cheap. What isn't cheap is invocation: once a skill's body loads, it stays in the conversation for every subsequent turn. Stack six of them and you have not added six capabilities, you have added six competing sets of standing orders to the same attention budget — the same budget the smart-zone curve is about. The benchmark evidence is unambiguous in both directions: curated skills lift agent success from 34% to 50%, but focused bundles of at most three beat exhaustive ones by roughly two to one, and models asked to hold hundreds of simultaneous instructions drop from near-perfect to 68% — failing by *silently omitting* instructions, not by refusing them. Which is exactly how skill hell feels from the driver's seat: nothing errors, the agent just quietly stops doing half of what you told it. That is why Pocock's "empower the user, not the agent" is a mechanical prescription, not a philosophical one. In his own library the switch is literal: a skill the agent can invoke costs context on every turn; a skill only *you* can invoke costs nothing but your memory. Empowering the user just means moving the index out of the model's attention budget and into the human's head — and the human's doesn't degrade at scale. Keep your hands on the wheel because the wheel is the cheap part.

**The chapter 5 constraint (one paragraph, for the hand-off):**

> Chapter 5's operating model is not an exception to this slide — it is this slide applied at project scale. The eight stages are a **track, not a stack**: each runs in its own fresh session with one or two skills loaded, and the hand-off artefacts between them exist precisely so no single window ever carries the whole process. Every stage boundary is a slash command a human types, which is where oversight lives. Present it as a sequenced process a person drives, never as a pipeline that runs itself — the benchmark evidence says agents that author and run their own end-to-end procedures do *worse* than agents with no scaffolding at all.

---

## Sources

Primary sources opened directly:

- [Claude Code — Extend Claude with skills](https://code.claude.com/docs/en/skills) — 1,536-character description cap "to reduce context usage"; body "stays there for the rest of the session … every line is a recurring token cost"; skill content lifecycle; compaction 5,000/25,000-token budgets and silent dropping; stacking limit of first skill + five; subagents inject full skill content at startup; `/verify` and `/code-review` user-invoked-only "keeps you in control"; the dilution diagnostic.
- [Anthropic — Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) — three-level progressive disclosure; no stated token counts, no stated limit on skill count.
- [Anthropic — Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) — attention budget; n² pairwise relationships; context rot; "finite resource with diminishing marginal returns"; bloated tool sets / ambiguous decision points; "smallest possible set of high-signal tokens"; just-in-time loading.
- [Jaroslawicz, Whiting, Shah, Maamari — *How Many Instructions Can LLMs Follow at Once?* (IFScale), arXiv:2507.11538](https://arxiv.org/abs/2507.11538) — 92–100% at 10 instructions, 68% at 500; threshold/linear/exponential decay with named models; ~150-instruction threshold for reasoning models; primacy effects peaking at 150–200; shift to omission errors under density.
- [SkillsBench, arXiv:2602.12670](https://arxiv.org/abs/2602.12670) (BenchFlow) — abstract read verbatim: 33.9% → 50.5%, +16.6 pp, +4.1 to +25.7 pp range; "Focused Skills with at most three modules outperform larger or exhaustive bundles."
- [GitHub Docs — Adding custom instructions for GitHub Copilot](https://docs.github.com/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot) and [Add repository instructions](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions) — automatic injection into every request; instruction types combine, not replace; precedence personal > repository > organization; "no longer than 2 pages"; avoid conflicting instructions; temporarily disable to test.
- [VS Code — Prompt files](https://code.visualstudio.com/docs/copilot/customization/prompt-files) — "Unlike custom instructions that are applied automatically, you invoke prompt files manually in chat"; tool-scoping priority order.
- [mattpocock/skills — README](https://github.com/mattpocock/skills) — user-invoked orchestrate / model-invoked hold discipline; user-invoked skills never call other user-invoked skills; "pick the skills you want."
- Local, read directly: `/home/neo/projects/atilileri.github.io/.agents/skills/writing-great-skills/SKILL.md` — the context-load / cognitive-load trade, verbatim; progressive disclosure ladder; leading words. `/home/neo/projects/atilileri.github.io/privates/best-prac/skill-hell.md` — the brief. `/home/neo/projects/atilileri.github.io/privates/private-notes.md` — chapter 5's proposed flow.
- Measured locally: 22 skills in `.agents/skills/` — 4,703 chars of frontmatter (~1.2k tokens standing), 96,845 chars of bodies (~24k tokens if all invoked).

Secondary / read via automated summary — treat as directional, flagged in text:

- [alphaXiv overview of SkillsBench](https://www.alphaxiv.org/overview/2602.12670) — bundle-size split (1–3 skills ≈ +19.0 pp vs 4+ ≈ +10.1 pp); 13 of 87 tasks degraded and the three mechanisms; self-generated skills −8.1 to −11.5 pp. **Not in the abstract**; verify against the full paper before any figure reaches a slide.
- [SkillResolve-Bench, arXiv:2606.10388](https://arxiv.org/pdf/2606.10388) — same-capability ambiguity degrading skill retrieval as libraries grow. Summarised, not read in full.
- [Matt Pocock — mattpocock/skills v1 announcement](https://x.com/mattpocockuk/status/2067259590488510471) — "63% reduction in token cost for skill descriptions"; model-invocable / user-invocable split. Quoted via search index; X returns a paywall to the fetcher.
- [Matt Pocock — *Framework Hell, Tutorial Hell… now Skill Hell*](http://www.youtube.com/watch?v=32LyZyFQhCQ) — the source claim, consumed through Atil's written breakdown rather than the video itself.
