# Agent vs. Model + Harness + Skills

**Question:** For coding AI tools specifically, do we actually need "agents," or is an "agent" essentially just **model + harness + skills**? Is it defensible to present the mental model as **Model + Harness + Skills (+ Environment)** rather than centering the word "Agent"?

**Date:** 2026-07-28

---

## TL;DR verdict

Yes — **Model + Harness + Skills (+ Environment) is defensible and, for a coding audience, arguably clearer than the four-ring version.** Here is the key insight from the primary sources: in every canonical definition, "Agent" is *not a separate ingredient* — it is the **name for the assembled thing**. Matt Pocock says it outright: an agent is "a model, harnessed, in an environment" ([Pocock, X thread](https://x.com/mattpocockuk/status/2050456062520615131)). Anthropic and OpenAI define "agent" not as a component but as a *behavior*: an LLM that runs tools in a loop and directs its own process ([Anthropic, Building effective agents](https://www.anthropic.com/engineering/building-effective-agents); [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/agents/); [Willison](https://simonw.substack.com/p/i-think-agent-may-finally-have-a)). So putting "Agent" on the same ring as Model and Harness is a mild category error — you are listing the sum alongside two of its parts. **Skills, by contrast, *are* a real, separable ingredient** with a formal spec ([Anthropic Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)), which makes it a more honest peer to Model and Harness. Recommendation: **make the rings the composable ingredients (Model + Harness + Skills, acting in the Environment), and keep "Agent" as the label for the loop** — the explanatory note "agent = model + harness acting in a loop," not a headline layer.

Caveat on sourcing: the X/Twitter page for Pocock's thread returned an HTTP 402 to my fetcher, so his exact wording below is reconstructed from the search index's verbatim quote of that same tweet, not from my own read of the live page. Everything else is from pages I opened directly.

---

## 1. Definition: is "agent" a component, or a name for model + harness?

The primary sources are unusually consistent: **"agent" names an assembled system exhibiting a behavior (tools in a loop / self-directed process), not a distinct building block.**

- **Matt Pocock (the author of the slide's framing)** defines the terms as a stack, and agent is explicitly the *composite*:
  - **Model** — "a blob of parameters, written during training. Does next-token prediction and nothing else. Stateless."
  - **Harness** — "everything around the model that turns it into an agent: tools, system prompt, context window management, etc."
  - **Environment** — the world the agent acts on; anything outside the harness it perceives and acts on via tools.
  - **Agent** — "a model, harnessed, in an environment." He illustrates it with: Claude Code and Claude Web are *different agents* because their harnesses differ, even though the model is the same. ([Pocock, X thread](https://x.com/mattpocockuk/status/2050456062520615131), quoted via search index.)
  - Note how his own harness definition already folds "agent" in: the harness is *what turns the model into an agent*. That is the tell that Agent is the output, not an input.

- **Anthropic, "Building effective agents"** does not define agent as a component either — it defines it as a *runtime behavior*, and pointedly contrasts it with "workflows":
  - Agents: "systems where LLMs dynamically direct their own processes and tool usage, maintaining control over how they accomplish tasks."
  - Workflows: "systems where LLMs and tools are orchestrated through predefined code paths."
  - Both are subtypes of "agentic systems." The distinction is about *who controls the path* (the model, dynamically = agent; predefined code = workflow), not about a part you add. ([Anthropic, Building effective agents](https://www.anthropic.com/engineering/building-effective-agents).)

- **OpenAI (Agents SDK)** defines an agent as "a large language model (LLM) configured with instructions, tools, and optional runtime behavior such as handoffs, guardrails, and structured outputs." Again: agent = model + configuration (instructions/tools) + loop behavior. The ingredients are model, instructions, tools — "agent" is the configured whole. ([OpenAI Agents SDK](https://openai.github.io/openai-agents-python/agents/).)

- **Simon Willison** endorses the now-converging definition: **"An LLM agent runs tools in a loop to achieve a goal,"** and notes Anthropic's "tools in a loop" framing drove the consensus. He was, in his own words, "*very* hesitant to use the term 'agent'" for years because it was "buzzword bingo" with no shared meaning. ([Willison, "I think 'agent' may finally have a widely enough agreed upon definition"](https://simonw.substack.com/p/i-think-agent-may-finally-have-a).)

**Synthesis:** Across all four primary voices, "agent" denotes *the model + harness acting in a loop over an environment* — the assembled, tool-using, self-directing whole. It carries real conceptual content (autonomy, loop, tool-use), but that content is a *property of the assembly*, not a fifth ingredient sitting beside Model and Harness. So on a diagram of ingredients, Agent is the sum, not an addend.

## 2. Over-hype: is "agent" over-sold for the coding use case?

Both sides are real. Here are the strongest versions of each, from primary voices.

**The "agents are often more than you need" side** (this is Anthropic's *own* stated position):

- Anthropic explicitly tells builders to **start simple and only escalate to agents when justified**: "find the simplest solution possible, and only increasing complexity when needed"; "optimizing single LLM calls with retrieval and in-context examples is usually enough"; and add "multi-step agentic systems only when simpler solutions fall short." Agentic systems "trade latency and cost for better task performance" — a tradeoff you should not pay by default. ([Anthropic, Building effective agents](https://www.anthropic.com/engineering/building-effective-agents).)
- OpenAI's practical guide (page was 403 to my fetcher, so via its search summary) similarly advises *not* building an agent when a deterministic workflow suffices — agents are for open-ended, hard-to-encode-in-rules problems. (Reported second-hand; see Sources — treat as unverified.)
- Read across to coding: the implication is that a well-driven **model + harness with good context** (good prompts, the right files in the window, the right skills) already carries most tasks. The "agent loop" earns its keep on genuinely multi-step, foggy work — not on every edit.

**The "agents are the point for coding" side:**

- Simon Willison's whole "agentic engineering" framing argues the *defining* feature of tools like Claude Code and Codex is exactly the agentic loop: the model "can both generate and execute code," wired into tools, running in a loop, producing code a human reviews against a definition of done. For coding specifically, that loop (run tests, read errors, retry) is where the value is — it is not hype, it is the mechanism. ([Willison, agent-definitions tag](https://simonw.substack.com/tags/agent-definitions/); [Willison agent definition post](https://simonw.substack.com/p/i-think-agent-may-finally-have-a).)
- Pocock's own product bet points the same way: his framing exists to sell *harness + skills* improvement, and his "wayfinder" workflow is built for "an effort too big for one agent session" — i.e., real multi-step autonomy is the thing coding practitioners want to get better at. ([mattpocock/skills wayfinder](https://github.com/mattpocock/skills/blob/main/docs/engineering/wayfinder.md).)

**Synthesis for the slide:** The defensible, non-strawman position is *not* "agents are fake." It is: **for coding, the loop matters, but "Agent" as a word is over-loaded and under-specified** (Willison spent years refusing to use it). The leverage a practitioner actually controls is the harness and the skills; the model is given, and "the agent" is just what you get when those run in a loop. That is a reason to *de-headline* the word, not to deny the behavior.

## 3. Skills: what they are, and are they a true peer concept?

**Skills are a real, separable, spec'd ingredient — a genuinely different kind of thing from Model/Harness/Agent.**

- **Definition (Anthropic):** Agent Skills are "organized folders of instructions, scripts, and resources that agents can discover and load dynamically to perform better at specific tasks." ([Anthropic, Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills).)
- **Format (`SKILL.md`):** A skill is a directory containing a `SKILL.md` markdown file that begins with YAML frontmatter carrying two required fields, `name` and `description`. These are preloaded so the agent knows when a skill applies. ([Anthropic engineering post](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills); [Claude Code skills docs](https://code.claude.com/docs/en/skills).) A concrete example from this very repo:
  ```
  ---
  name: research
  description: Investigate a question against high-trust primary sources...
  ---
  ```
  (`/home/neo/projects/atilileri.github.io/.agents/skills/research/SKILL.md`). Skills in this repo also disclose extra files — e.g. `writing-great-skills/` ships a sibling `GLOSSARY.md` referenced from its `SKILL.md`, exactly the pattern below.
- **Progressive disclosure (three levels):** (1) name + description load at startup (~tens of tokens per skill); (2) the full `SKILL.md` body loads only when Claude judges it relevant; (3) additional bundled files load only when referenced during execution. This keeps the context window lean while allowing unbounded depth. ([Anthropic engineering post](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills).)
- **Composable / reusable / installable:** Skills are modular folders that "transform general-purpose agents into specialized ones," described as analogous to onboarding docs for a new employee. `SKILL.md` is an **open standard** (agentskills.io, published Dec 2025) adopted across Claude Code, Copilot, Cursor, Codex, Gemini CLI and others — so a skill is a portable artifact, not a harness-internal feature. ([Anthropic engineering post](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills); [Claude Code skills docs](https://code.claude.com/docs/en/skills), which states Claude Code skills "follow the Agent Skills open standard, which works across multiple AI tools.")
- **Do they compound?** Partly supported, partly synthesis. The docs frame the *mechanism* for compounding — capturing a repeated procedure once so it "costs almost nothing until you need it" and is reused thereafter: "Create a skill when you keep pasting the same instructions, checklist, or multi-step procedure into chat." ([Claude Code skills docs](https://code.claude.com/docs/en/skills).) **However**, Anthropic's engineering post does **not** claim skills auto-accumulate expertise or self-improve; agents creating/editing their own skills is described as *aspirational future work*, not current behavior ([Anthropic engineering post](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)). So "each captured skill makes later tasks cheaper/better" is defensible as a *usage claim* (you the developer accrue a reusable library), not as an autonomous-learning claim. State it carefully on the slide.

**Is "skills" a peer to model/harness/agent?** It is a peer to **model** and **harness** (all three are things you compose), and it is a *different kind of thing* from **agent** (which is the assembled behavior). Skills sit *on top of* model + harness: the harness discovers and loads them; the model executes them. That layering is precisely why they slot cleanly into a "what you add" diagram where "Agent" never did.

## 4. Defensibility verdict

**Reframing the coding mental model as Model + Harness + Skills (+ Environment), with "Agent" demoted to an explanatory note, is defensible and more internally consistent than the original four-ring version.**

**Evidence for:**
- Every primary definition treats "agent" as the *assembled whole*, not a component (§1). A diagram whose other rings are ingredients (Model, Harness, Skills) shouldn't also have a ring for the sum. Pocock's own harness definition — "everything around the model that turns it into an agent" — literally defines harness *in terms of* producing the agent, confirming agent is downstream output.
- Skills are a formally specified, separable, installable artifact (§3) — a better-behaved peer to Model and Harness than "Agent" is.
- Anthropic itself counsels de-emphasizing agent-complexity ("start simple," §2), and Willison documents years of the word being too vague to communicate with (§1) — both support not making the word the headline.

**Evidence against / risks to manage:**
- "Agent" carries load-bearing meaning you must not lose: the **loop**, **tool-use**, and **self-directed process** ([Anthropic](https://www.anthropic.com/engineering/building-effective-agents); [Willison](https://simonw.substack.com/p/i-think-agent-may-finally-have-a)). If you drop the word entirely, you drop the concept of the loop — which for *coding* is exactly where the value lives (§2). So keep it, just don't ring it.
- Skills and Harness can blur: a harness *hosts* skills, so an audience might ask "isn't a skill just part of the harness?" Pre-empt it: harness = the driver/runtime (context management, tool wiring); skills = portable, standardized instruction packages the harness loads. The open-standard point (skills run across many harnesses) is your cleanest proof they're separable.
- You are lightly departing from Pocock's exact four-term set. That is fine — you are *extending* it (he also promotes skills heavily), not contradicting it — but if the audience knows his framing, name the move explicitly.

**Net:** Present the composable ingredients as the rings; present "agent" as the word for the running loop. That is both accurate to primary sources and pedagogically sharper for a coding room.

---

## How to present this

Recommended slide treatment: **replace the Agent ring with a Skills ring, and relabel the diagram's center/whole as "Agent."**

Concretely, three good options in descending order of preference:

1. **Rings = Model + Harness + Skills; the whole assembly (acting in the Environment) *is* the Agent.** Make "Agent" the caption of the combined figure, not a peer ring. One-line note on the right: *"Agent = model + harness + skills running in a loop over an environment"* — cite it as the shared industry definition (Anthropic "tools in a loop"; Willison). This is the most accurate and the most memorable: the rings are the three levers you control, the loop is what they become.
   - Tradeoff: viewers anchored on Pocock's exact four terms may notice Skills replaced Agent. Address in one spoken sentence: "Pocock's fourth term, Agent, is actually the *sum* of the others — so I've put the thing you actually add, Skills, in its place, and kept Agent as the name of the whole."

2. **Keep four rings but re-order the hierarchy:** Model and Harness (and Skills) as inner composable rings, "Agent" as the outer ring that *encloses* them and sits *inside* the Environment. This visually encodes "agent = the assembled whole" instead of "agent = a sibling ingredient." Slightly busier; preserves all four of Pocock's words.
   - Tradeoff: more elements, and you still have to explain that Agent is a different *type* of thing than the rings it encloses.

3. **Keep Agent only in the right-hand explanation** (as the prompt proposed): rings = Model + Harness + Skills + Environment; a footnote defines Agent as the loop. Cleanest visually; safest if slide real estate is tight.
   - Tradeoff: an audience expecting "agents" as the headline may feel you dodged the buzzword — turn that into a *deliberate point* ("the word everyone argues about is just the loop these three produce").

For a coding conference specifically, lead with the payoff of the reframing: **the three things you can actually improve are the harness and the skills (the model is given), and "agent" is just what they do when you run them in a loop.** That is the line that lands, and it is fully backed by the sources (Anthropic's "start simple / harness matters," Pocock's "improve the harness and skills," Willison's "tools in a loop"). Be careful to phrase the compounding claim as *"you build a reusable skill library,"* not *"the agent teaches itself"* — the latter is aspirational per Anthropic's post (§3).

---

## Sources

Primary sources I opened directly:

- [Anthropic — Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) — the agents-vs-workflows definitions; "start simple, add agentic complexity only when needed"; agents "dynamically direct their own processes."
- [Anthropic — Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) — definition of Agent Skills, `SKILL.md` + YAML frontmatter, three-level progressive disclosure, composability, "agents editing their own skills" as aspirational.
- [Claude Code — Extend Claude with skills](https://code.claude.com/docs/en/skills) — SKILL.md mechanics in Claude Code, `/skill-name` invocation, "loads only when used," follows the Agent Skills open standard across tools, "create a skill when you keep pasting the same procedure."
- [OpenAI Agents SDK — Agents](https://openai.github.io/openai-agents-python/agents/) — agent = LLM configured with instructions + tools + optional runtime behavior; agent as configured whole.
- [Simon Willison — "I think 'agent' may finally have a widely enough agreed upon definition"](https://simonw.substack.com/p/i-think-agent-may-finally-have-a) — "An LLM agent runs tools in a loop to achieve a goal"; his years of skepticism about the term.
- [Simon Willison — agent-definitions tag](https://simonw.substack.com/tags/agent-definitions/) — index of his running commentary on the definition.
- [mattpocock/skills — wayfinder.md](https://github.com/mattpocock/skills/blob/main/docs/engineering/wayfinder.md) — Pocock's coding workflow; skills invoked within an agent session; "effort too big for one agent session."
- Local repo example of the SKILL.md format: `/home/neo/projects/atilileri.github.io/.agents/skills/research/SKILL.md` and `/home/neo/projects/atilileri.github.io/.agents/skills/writing-great-skills/` (SKILL.md + GLOSSARY.md progressive-disclosure pattern).

Primary source quoted via search index (page itself blocked to my fetcher — HTTP 402):

- [Matt Pocock — X thread "4 of the most confusing terms in AI, defined"](https://x.com/mattpocockuk/status/2050456062520615131) — Model / Harness / Environment / Agent definitions; "a model, harnessed, in an environment"; Claude Code vs Claude Web as different agents. Wording reconstructed from the search index's verbatim quote, not a direct read.

Reported second-hand (not directly verified — flagged in text):

- OpenAI — "A practical guide to building AI agents" (openai.com; returned HTTP 403 to my fetcher) — "don't build an agent when a deterministic workflow suffices." Treat as unverified until opened directly.
- The Dec 2025 agentskills.io open-standard publication date and cross-tool adoption list (Copilot, Cursor, Codex, Gemini CLI, etc.) came via search summaries and the Claude Code docs' link to agentskills.io; the adoption breadth beyond what Claude Code docs state is not individually verified here.
