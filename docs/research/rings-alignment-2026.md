# Rings alignment: where agent, tools and MCP actually sit

**Context:** wayfinder research ticket [#40](https://github.com/atilileri/atilileri.github.io/issues/40), part of map [#29](https://github.com/atilileri/atilileri.github.io/issues/29). Supersedes [#39](https://github.com/atilileri/atilileri.github.io/issues/39) (retracted premise). Feeds [#36](https://github.com/atilileri/atilileri.github.io/issues/36), the chapter-2 slide that must **explain** agent and MCP **in support of the rings**.

**Builds on, does not redo:** [`agent-vs-model-harness-skills.md`](./agent-vs-model-harness-skills.md) (map #4 — the rings), `agent-deflation-2026.md` (branch `research/agent-deflation`, #31), `mcp-deflation-2026.md` (branch `research/mcp-deflation`, #32).

**Date:** 2026-08-02 · **Branch:** `research/rings-alignment` · **Audience for the finding:** ASML executives.

---

## 0. The headline, and the one thing that changed everything

**A primary source that was unreadable when map #4 was written is now readable.** Map #4 had to reconstruct Matt Pocock's definitions from a search index because `x.com` returned HTTP 402. Pocock has since published the same definitions as a public repo — [`mattpocock/dictionary-of-ai-coding`](https://github.com/mattpocock/dictionary-of-ai-coding) — with individual entries for `Model`, `Harness`, `Environment`, `Agent`, **`Tool`**, `Skill` and **`MCP`**. Every quote below is from a file I read directly via the GitHub API.

That single source resolves four of the ticket's seven questions outright, because **the rings' own author has already written the definitions of the two nouns the rings were missing.** It also means the deck can stop describing its framing as "after Matt Pocock, adjusted" on trust, and start citing it.

Four findings in one line each:

| # | Finding |
|---|---|
| 1 | **`Agent` as a callout, not a ring, is confirmed — by the rings' author, explicitly.** Map #4's decision stands and is now better-sourced than when it was made. |
| 2 | **`Tools` cannot be placed on any one ring, and that is the correct answer, not a failure.** A tool is the **seam between Harness and Environment**: the harness supplies it, the environment is what it reaches. Both the deck's candidate readings are half-right; neither is complete. |
| 3 | **An MCP server attaches to the `Harness`** — and its *effect* is to **enlarge the `Environment`**. It is emphatically **not** a Skill, and Pocock's dictionary forbids that conflation in as many words. |
| 4 | **The `Environment` ring's copy is wrong as written** — narrower than the rings' own author's definition, and it will be falsified on stage the first time an MCP server reaches Sentry. This is a copy bug independent of everything else in this ticket. |

**And one structural discovery that decides the diagram question:** the deck's chapter-3 primitives slide **already has a `Tools` block** (`index.astro:81`) and a `Tool results` block (`index.astro:120`). The deck therefore already teaches `Tools` — at the context-window altitude — while chapter 2's rings never introduce the word. **The inconsistency the ticket is worried about already exists in the built deck, in the opposite direction from the one anticipated.** Naming `Tools` in chapter 2 does not add a third altitude; it *completes* a thread chapter 3 has been carrying alone. See §6.

---

## 1. What an agent is, positively stated

### The sources

**Pocock, [`Agent.md`](https://github.com/mattpocock/dictionary-of-ai-coding/blob/main/dictionary/Agent.md)** — and this is the passage that settles the callout question:

> "A model harnessed with tools, a system prompt, and a context window, that takes turns with a user. The model in motion."
>
> "**Unlike most terms in this dictionary, 'agent' doesn't name a mechanical part.** The model is a file of parameters; the harness is software you can point at. **The agent is neither** — it's the unit you're speaking to. […] the agent is the anthropomorphized unit: the thing you delegate to […] the 'it' in 'it broke the build again'."

**Anthropic, [Agent SDK overview](https://code.claude.com/docs/en/agent-sdk/overview)** (current) gives the plainest first-party affirmative sentence anywhere:

> "An agent is an application that completes a task by **planning its own steps and calling tools** that read files, run commands, or edit code."

**Anthropic, [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents):**

> "**Agents** […] are systems where LLMs dynamically direct their own processes and tool usage, maintaining control over how they accomplish tasks." — versus workflows, "systems where LLMs and tools are orchestrated through predefined code paths."
>
> "The basic building block of agentic systems is an LLM enhanced with augmentations such as retrieval, tools, and memory."

Carried from #31, not re-verified: OpenAI's agent is "an LLM configured with instructions, tools, and optional runtime behavior"; Google ADK's is "an AI model, task instructions, and optionally, a set of tools"; Microsoft's Agent Harness decomposes to context compaction, file memory, todo tracking, skills discovery, file access.

### What this does to the diagram

Pocock's "doesn't name a mechanical part" is the sentence map #4 needed and could not read. The rings are a diagram **of mechanical parts**. `Agent` is documented by their own author as the one term in the vocabulary that is *not* one. **Promoting `Agent` to a ring would be a category error committed against the explicit written intent of the framing's origin.**

> **Verdict on Q1: `Agent` stays a callout. Map #4's decision is upheld, not overturned.** The existing callout copy — *"not a layer. It's what these become when you run them in a loop, acting in the environment"* — is accurate and needs no change.

**Does the loop deserve a name on screen?** No. The loop is already named twice in the deck — in the rings callout ("run them in a loop") and as chapter 3's `agent-loop` widget. Adding a fifth proper noun for it buys nothing and costs an executive a term to remember. What *would* pay is one added clause of texture, sourced to Pocock: an agent is **"the model in motion"** — three words, memorable, and it is the anthropomorphised unit the room already has in its head from vendor pitches.

### The shortest correct sentence (survives being read aloud)

> **An agent is a model with a harness around it, running in a loop until the job is done — the model in motion, not a part you buy.**

Every clause maps to a ring the room saw two slides earlier, and the last clause is the deflation, delivered as a consequence rather than an accusation. **Safe on screen.**

---

## 2. The tools question — resolved, and the resolution is "not one ring"

This is the ticket's sharpest strain and it has a clean answer that the deck can use.

### 2a. What the sources actually say

**Pocock, [`Tool.md`](https://github.com/mattpocock/dictionary-of-ai-coding/blob/main/dictionary/Tool.md)** — read the first two sentences carefully, because they name *two different rings*:

> "A function **the harness exposes** for the agent to call — Read, Write, Bash, Search. Tools are **how an agent perceives and acts on the environment**: it can't see the environment except through tool results, and can't change it except through tool calls."

> "A tool is defined by three things: a name, a description of what it does, and a schema for its parameters. **The harness sends these definitions to the model with every request** […] **The model never executes anything itself; the harness reads the call, runs the function, and sends back the result.**"

> "Tool definitions occupy context on every request, so a large tool set has **a standing cost before any tool is called** — and many similarly-described tools make the model worse at picking the right one."

**Pocock, [`Environment.md`](https://github.com/mattpocock/dictionary-of-ai-coding/blob/main/dictionary/Environment.md)** — the environment is *defined in terms of tools*, and tools *resize* it:

> "The world the agent acts on — anything outside the harness that the agent **perceives through tool results and changes through tool calls**."
>
> "You decide how big the environment is. A sandbox shrinks it, limiting what the agent can reach; **adding a tool extends it**, bringing a database or an API into reach."

**Anthropic, [How tool use works](https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works)** — the same split, from the model provider:

> "Tool use is a contract between your application and the model. […] **The model never executes anything on its own.** It emits a structured request, your code (or Anthropic's servers) runs the operation, and the result flows back into the conversation."
>
> "**The primary axis along which tools differ is where the code executes.**" — user-defined and Anthropic-schema tools are **client-executed** (your application, i.e. the harness); `web_search`, `web_fetch`, `code_execution`, `tool_search` are **server-executed** (Anthropic's infrastructure).
>
> "**Tool use is the bridge between natural-language requests and the systems that fulfill them.**"

**Anthropic, [Tool use overview](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)** — the cost side, first-party:

> "The additional tokens from tool use come from: the `tools` parameter in API requests (tool names, descriptions, and schemas); `tool_use` content blocks […]; `tool_result` content blocks."
>
> Plus a fixed tool-use system prompt: **286 tokens** for Claude Opus 5 at `tool_choice: auto` (406 at `any`/`tool`). *(New number, not in #32. Presenter-notes grade — it is a per-model figure that will age.)*

**And the disambiguation that kills the "tools are a kind of skill" reading outright.** Pocock, [`Skill.md`](https://github.com/mattpocock/dictionary-of-ai-coding/blob/main/dictionary/Skill.md), under its explicit *Avoid* heading:

> "*Avoid:* '**tool**' — **a tool is what the agent *calls*; a skill is instructions it *reads*.**"

Confirmed independently by the Claude Code skills docs, where a skill **governs** tools rather than being one: `allowed-tools` grants "tools Claude can use without asking permission during the turn that invokes this skill", `disallowed-tools` names "tools removed from Claude's available pool while this skill is active" ([Claude Code — skills](https://code.claude.com/docs/en/skills)). A skill sits *above* tools and points at them. It is not one.

### 2b. The verdict, stated plainly

**No single-ring placement is consistent, and the reason is that a tool is not a layer at all — it is a boundary object that exists on two rings at once, in two different forms:**

| Aspect of a tool | Where it lives | Source |
|---|---|---|
| Its **definition** (name, description, schema) | Inside the **model's context window**, put there by the **Harness**, on **every request** | Pocock `Tool.md`; Anthropic tool-use overview |
| Its **execution** | In the **Harness's process** (client tools) or on the provider's servers (server tools) — never in the model | Anthropic "How tool use works" |
| Its **effect** | On the **Environment** — and it *defines the Environment's size* | Pocock `Environment.md` |

So, against the ticket's three candidate readings:

- **"Tools are part of the Harness"** — true of *supply and execution*, false of *effect*. The harness exposes and runs them; it is not what they act on.
- **"Tools are a kind of Skill"** — **false, and the only reading that is simply wrong.** Explicitly ruled out by the rings' own author (`Skill.md`, *Avoid*) and contradicted by the shipped `allowed-tools` surface, where skills are the thing that *governs* tools.
- **"Tools are the interface to the Environment"** — **the truest single sentence**, and the only one that also explains the Environment ring's existence. But it under-describes the cost, which is charged in the model's context, not in the environment.

> **Verdict on Q2: the honest account is that `Tools` is the *seam* between `Harness` and `Environment`, not a ring.** The best one-liner, and it is nearly a quote from Pocock: **"A tool is what the harness hands the model so it can touch the environment."** Everything else follows from that — including why tool definitions are a standing tax (they are in the model's context, whether called or not) and why adding an MCP server makes the environment bigger.

This is *the same shape of answer* as `Agent`. **The rings have exactly two non-ring concepts, and they are the two things that are not parts:** `Agent` is the assembled whole; `Tools` is the boundary. That symmetry is a gift to the slide, not a problem — see §5.

---

## 3. Which ring an MCP server attaches to

### 3a. The sources

**Pocock, [`MCP.md`](https://github.com/mattpocock/dictionary-of-ai-coding/blob/main/dictionary/MCP.md)** — this answers the question in its first clause:

> "A protocol for **plugging external tool servers into a harness** — how an agent gets **tools beyond what the harness ships with**. **The agent never 'calls MCP'; it calls a tool**, and the harness happens to have gotten that tool from an MCP server."
>
> "The cost is paid in context. Every tool a server advertises arrives as a definition […] install a few generous servers and a session starts with **thousands of tokens of tool schemas before you've typed anything**, spending attention budget on tools the task will never use."
>
> "Many harnesses now mitigate this with **tool search** […] If your harness doesn't do this, the up-front cost still applies, and it's worth **enabling only the servers a project actually needs**."

**The MCP specification, [revision `2026-07-28`](https://modelcontextprotocol.io/specification/2026-07-28)** puts the client *inside* the harness by definition:

> "**Hosts**: LLM applications that initiate connections · **Clients**: **Connectors within the host application** · **Servers**: Services that provide context and capabilities"
>
> Server features: "**Resources**: Context and data […] **Prompts**: Templated messages and workflows for users · **Tools**: Functions for the AI model to execute". Client features, in full: "**Elicitation**".

**[MCP architecture](https://modelcontextprotocol.io/specification/2026-07-28/architecture)** — the reference diagram literally draws the boundary the rings need. One `Application Host Process` box containing Host + Clients; a separate `Local machine` box with servers reaching local resources; a separate `Internet` box with `Server 3 — External APIs` reaching `Remote Resource C`. And:

> "The host process acts as the container and coordinator: Creates and manages multiple client instances · Controls client connection permissions and lifecycle · **Enforces security policies and consent requirements** · Coordinates AI/LLM integration · **Manages context aggregation across clients**"
>
> "Servers should not be able to read the whole conversation, nor 'see into' other servers […] **Full conversation history stays with the host.**"

**Anthropic's own harness lists MCP as a harness capability**, alongside built-in tools and skills, in the [Agent SDK capability table](https://code.claude.com/docs/en/agent-sdk/overview):

> | Built-in tools | Read, write, edit files, run commands, and search the web |
> | **MCP** | **Connect external tools and data sources via the Model Context Protocol** |
> | Skills, commands, and memory | Load automatically from your project's `.claude/` … |

**OpenAI's Agents SDK keeps them structurally separate too** — `mcp_servers` is its own constructor parameter, not an entry in `tools`; the agent "exposes the tools from those servers alongside any function-based tools", and "every agent run calls `list_tools()` on each MCP server" ([OpenAI Agents SDK — MCP](https://openai.github.io/openai-agents-python/mcp/)). Its framing: "MCP provides a standardized way to connect AI models to different data sources and tools" — the USB-C analogy.

### 3b. The verdict

> **Verdict on Q3: an MCP server attaches to the `Harness` ring, and what it changes is the `Environment` ring.** Both readings the ticket offered are right, in sequence: MCP plugs into the harness (that is where the client lives, per the spec) in order to extend how far the loop can reach (per Pocock's *"adding a tool extends [the environment]"*). It is the **Harness→Environment** connection, and it is defensible — which is the reading the ticket hoped for.

**It is not on the Skills ring.** Three independent primary sources say so: Pocock's `Skill.md` *Avoid* note; the MCP spec, which lists Skills as an *extension* to the protocol rather than a description of it; and Anthropic's own answer, *"Do skills replace MCP? No."* (carried from #32).

**⚠️ This contradicts #32's headline line, and #36 must be told.** #32 proposed *"An MCP server is a skill with a wire protocol and a security boundary."* That was written for a **deflation** slide and it works there — as rhetoric aimed at a vendor claim. On an **explanation** slide whose job is to reinforce the rings, the same sentence puts MCP on the wrong ring and teaches the room a mapping the next question will break. **Do not reuse #32's line verbatim on the reshaped slide.** Its *token* findings carry over completely; its *taxonomy* phrasing does not.

### The shortest correct sentence (survives being read aloud)

> **An MCP server is a standard plug for handing your harness tools it didn't ship with — that's how the agent reaches past your codebase, and every plug is on the bill before anyone types anything.**

Long for one sentence; it can split into a headline plus caveat in the deck's standing copy shape. **Safe on screen** — every clause is sourced, and the last clause carries #32's *"as deployed today"* guardrail implicitly by describing behaviour rather than the protocol. If it is shortened, keep "didn't ship with" and "on the bill".

---

## 4. The Environment ring is too narrow — and it is a bug independent of this ticket

The slide currently says (`index.astro:403`):

> "**Environment** — Your codebase — the source of truth. Skills are only as good as it is: accurate, well-structured, well-documented."

Pocock's own definition is materially wider:

> "anything outside the harness that the agent perceives through tool results and changes through tool calls […] **A filesystem is the most common kind of environment, but not the only one** (a database, a remote API, a browser session can all be environments)."

And it names a property the deck's version omits entirely, which is *more* useful to this deck than the one it has:

> "The environment is also **the layer that persists — the only one that is always stateful**. A session's context is gone when the session ends, but files written to the environment remain for the next session to read. […] **Anything an agent should still know tomorrow has to end up in the environment.**"

> **Verdict on Q4: yes, too narrow — and it fails on stage regardless of what #36 decides.** The moment the next slide says the words "Slack" or "Sentry", a room that just read "Environment = your codebase" has been handed a contradiction. This copy change should land **even if the diagram is otherwise untouched.**

**Proposed replacement, preserving the slide's existing emphasis:**

> "**Environment** — Everything the agent can reach: your codebase first, and whatever else you wire in. It's the only layer that remembers anything — and skills are only as good as it is."

Why this wording: it widens the *definition* without diluting the *argument*. The landing line — *"what you actually own is the skills you write and the environment they act in"* — gets **stronger**, because "the only layer that remembers anything" is a much better reason to invest in it than "the source of truth", and it pre-loads chapter 3's context-window argument (the model is stateless; the transcript is the memory; the environment is what outlives the session).

**Presenter-note addition, sourced:** *"You decide how big the environment is. A sandbox shrinks it; adding a tool extends it."* That one line lets the presenter answer the inevitable security question without a slide for it.

---

## 5. The concrete diagram recommendation

Three options, with costs. **The recommendation is C.**

### Option A — leave the diagram entirely unchanged

**What it costs:**
- The next slide has to explain MCP, which is *a way of getting tools*, to a room that has never been told what a tool is in this deck's vocabulary. The presenter must define `tool` on the fly, inside the slide that was supposed to be the payoff.
- Chapter 3's primitives slide already bills a `Tools` block as one of four Static costs — the second-largest teaching moment in the tokenomics chapter — with **no chapter-2 anchor**. The bridge #29 built between the rings and the primitives works for `Harness` and `Skills` and silently drops on `Tools`.
- The `Environment` copy is still falsified by the next slide (§4). *This cost is not avoidable by choosing A;* §4 has to land regardless.

**When A is right:** if #36 lands on two slides and decides to introduce `Tools` on the new slide instead of retrofitting the rings. That is a legitimate call — but then the rings slide is knowingly incomplete and the presenter should say so out loud.

### Option B — add a fifth `Tools` ring

**Recommend against, on the sources.** Concentric rings assert containment and order. Every possible position for a `Tools` ring asserts something false:

- `Harness → Tools → Skills` says skills wrap tools. But skills *invoke* tools (`allowed-tools`), and skills live in the environment (Pocock `Skill.md`: "kept in the environment until a context pointer pulls it in").
- `Skills → Tools → Environment` says the harness doesn't supply tools. It does — "a function the harness exposes".
- Any position says a tool is a *layer with an inside and an outside*. It isn't; it is a seam, and its cost lands in the innermost ring (the model's context) while its effect lands in the outermost.

It also costs the four-ring visual economy that makes the slide readable at the back of a room, and breaks the 4-rings↔4-factors rhyme with the roadmap divider.

### Option C — **recommended.** Two callouts, one copy fix, optionally one spoke

**C1 — add a second right-hand callout, mirroring the existing `Agent` one.** The rings slide already has the typographic slot (`.layers-agent`); this adds a sibling.

> **Agent** — not a layer. It's what these *become* when you run them in a loop, acting in the environment.
>
> **Tools** — not a layer either. It's how the harness lets the model touch the environment. Described on every request, whether you use them or not.

**C2 — replace the `Environment` definition** per §4. Lands regardless of C1.

**C3 — optional, if the SVG is being touched anyway:** one labelled radial spoke from the `HARNESS` ring outward through `SKILLS` to `ENVIRONMENT`, reading `TOOLS`. This *draws* the seam finding instead of asserting it, and it is the only visual that is actually true. Cost: an SVG edit, an `aria-label` rewrite, and the risk of clutter on a slide whose current strength is its silence. **Ship C1+C2 first; treat C3 as a prototype question for #38.**

**Why C is the right shape, beyond accuracy.** It gives the rings slide **two callouts — the two things that are not parts** — and those two callouts are precisely what the next slide expands:

- `Agent` (the callout) → **what an agent is**: the loop these rings run in.
- `Tools` (the callout) → **what an MCP server is**: where extra tools come from, and what they cost.

The rings slide stops being a diagram the next slide references and becomes a diagram the next slide *completes*. That is the structural payoff #36 has been looking for, and it arrives without a fifth ring.

**Cost of C, stated honestly:** one more thing on an already-dense slide, and the presenter now has two callouts to narrate instead of one — perhaps 15 seconds. If slide real estate is the binding constraint, **C2 alone is still mandatory** and C1 can move to the next slide's opening beat.

---

## 6. The altitudes thread — MCP does not break it, and `Tools` is already at two altitudes

The deck's protected thread, per `index.astro:51–54`: `Harness` and `Skills` each appear twice, once as a **composable ingredient** (rings) and once as a **consumer of the context window** (chapter 3 primitives). Two altitudes, both true, deliberate.

**Check the primitives slide's actual blocks** (`index.astro:68–142`):

| Static block | Rings altitude? |
|---|---|
| `Harness bundle` | ✅ ring |
| **`Tools`** — *"A written description of every tool the agent may call, with its parameters… Paid every turn — whether you use them or not."* | ❌ **no ring, no callout — the word appears nowhere in chapter 2** |
| `Skills` | ✅ ring |
| `Project prompt` | (never claimed to be a ring) |

> **Verdict on Q5: MCP introduces no third altitude — but `Tools` is already broken, in the direction the ticket did not expect.** The deck already teaches `Tools` at the context-window altitude and never at the ingredient altitude. Option C **repairs** the thread rather than complicating it: `Tools` joins `Harness` and `Skills` as a term appearing at both altitudes, both true.

**MCP itself sits cleanly and adds nothing new.** MCP is not a context primitive — it never appears in the window. It is a *source* of the `Tools` block that already does. The mapping is one sentence: **an MCP server is where some of that `Tools` block comes from.** That is a single altitude (harness configuration), and it hands directly to chapter 3's existing `Tools` cost line — *"Paid every turn — whether you use them or not"* — which is, word for word, already the MCP argument. Chapter 3 has been making chapter 2's point for it.

---

## 7. The four-factor rows

Labels provisional, owned by [#34](https://github.com/atilileri/atilileri.github.io/issues/34). **Empty means empty.** `[S]` = safe on screen · `[N]` = presenter notes only.

### Agent

| Factor | What primary sources support |
|---|---|
| **Under the hood** | `[S]` Model + harness + skills + tools, in a loop. Every major SDK's agent primitive is a *configured model* — OpenAI: "an LLM configured with instructions, tools…"; Google ADK: "an AI model, task instructions, and optionally, a set of tools"; Anthropic: "an LLM enhanced with augmentations such as retrieval, tools, and memory". `[S]` Even memory ships as a tool (`memory_20250818`, one `tools` entry, six file commands). `[S]` Microsoft's own 2026 "Agent Harness" decomposes to context compaction, file memory, todo tracking, skills discovery, file access. `[S]` Pocock: agent "doesn't name a mechanical part". |
| **Tokenomics** | **Partially empty — no per-agent price exists, and none should be invented.** What *is* sourced is the cost's **shape**, not its size: `[S]` every tool call is an extra full model request (Pocock `Tool.md`: "Each tool call costs an extra model provider request"), and `[S]` the model is stateless, so each request re-sends the whole transcript (Pocock `Model.md`; already the deck's chapter-3 argument). **The honest sentence is "an agent's cost is the loop, not the answer" — and there is no number to put beside it.** `[N]` Anthropic's fixed tool-use system prompt is 286 tokens for Opus 5 at `tool_choice: auto` — real, first-party, but per-model and will age. |
| **Best practices** | `[S]` Anthropic's own counsel: "find the simplest solution possible, and only increasing complexity when needed"; agentic systems "trade latency and cost for better task performance"; add "multi-step agentic systems only when simpler solutions fall short". `[S]` Agents must "gain 'ground truth' from the environment at each step (such as tool call results or code execution) to assess its progress" — i.e. the environment is the feedback signal, which is the rings slide's landing line restated as practice. `[N]` The agent-vs-workflow distinction is *who controls the path*; if a deterministic path exists, use it. |
| **AI operating model** | **Thinnest cell. No primary source describes how a team should organise around agents.** What exists is adjacent and mostly notes-grade: `[S]` Gartner (Jun 2025) — >40% of agentic projects predicted cancelled by end-2027, and "agent washing", ~130 of thousands of self-described agentic vendors judged real. This is a **procurement** fact, not an operating-model fact, and it is the single most useful citation in the pack for this room because the analyst house is one they already trust. `[S]` The deflation's own operational payoff — *if an agent is four parts, you can ask a vendor which of the four they supply* — is an **inference the deck is making**, not a sourced claim; present it as a recommendation, not a finding. `[N]` METR: ~5.3h 50% time-horizon, doubling ~89 days for post-2024 models — sets what is delegable, not how to organise. `[N]` Anthropic's own survey (57% use agents / 16% cross-functional / 86% coding agents in production) — **vendor-published, never on screen.** |

### MCP server

| Factor | What primary sources support |
|---|---|
| **Under the hood** | `[S]` A protocol, not a capability: JSON-RPC 2.0 between **Hosts** (LLM applications), **Clients** ("connectors within the host application") and **Servers**. `[S]` Servers offer Resources, Prompts, Tools; clients offer Elicitation and nothing else in `2026-07-28`. `[S]` Pocock: "The agent never 'calls MCP'; it calls a tool." `[S]` The spec's own analogy is LSP: it "standardizes how to integrate additional context and tools into the ecosystem of AI applications" — it did not give editors a capability, it stopped every editor writing every integration. `[N]` The protocol got *smaller* in 2026: Sampling, Roots and Logging deprecated; sessions and the `initialize` handshake removed. `[N]` The credential boundary: a remote server can hold third-party OAuth tokens that "MUST NOT transit through the MCP client" — the one thing a bundled script structurally cannot build. |
| **MCP server** → **Tokenomics** | **The fullest cell in the pack.** `[S]` ~55,000 tokens of tool definitions for a five-server setup (GitHub 35 tools/~26K, Slack 11/~21K, Sentry 5/~3K, Grafana 5/~3K, Splunk 2/~2K) — "58 tools consuming approximately 55K tokens before the conversation even starts". `[S]` Billed **every request**, called or not. `[S]` The deck's own on-screen 620 tokens for two schemas = 310/tool, against Anthropic's GitHub server at ~740/tool — **the deck's figure is conservative by better than 2×**, so the presenter can point at their own number and say "that's two; a real GitHub connector is thirty-five." ⚠️ `[S-with-guardrail]` **"As deployed today, by default" — never "inherently."** Anthropic's own phrasing is "*most* MCP clients"; `defer_loading` exists; Pocock: "Many harnesses now mitigate this with tool search." Say it the second way and a knowledgeable person corrects you in the room. |
| **Best practices** | `[S]` Enable only the servers a project actually needs (Pocock, verbatim). `[S]` Tool-selection accuracy "degrades once you exceed 30–50 available tools"; on-demand loading moved Opus 4 from **49% → 74%** (Opus 4.5: 79.5% → 88.1%). `[S]` Anthropic's own thresholds for switching to tool search: ≥10 tools, >10k tokens of definitions, or aggregating multiple servers (200+ tools). `[S]` Skills bill on use, connectors bill on connection — Claude Code caps the entire skill listing at **1% of the context window** (~2,000 tokens on a 200k window) against ~55,000 for five servers. |
| **AI operating model** | **Mostly empty — and this is the honest finding.** One sourced fact with an organisational consequence, and the consequence is ours, not the source's: `[S]` a remote MCP server can hold third-party credentials the client and the model's context never see. `[N]` **The inference** — that this makes MCP a *centrally-governable* integration point, where a skill's bundled script running as the harness's user is not — **is the deck's reasoning, not a citation.** Present it as an argument, flagged. Nothing in the spec, Anthropic's docs, OpenAI's, Google's or Microsoft's says anything about how a team should organise around MCP. **If #36 wants a fourth row here it will have to be an opinion, and it should be labelled as one.** |

---

## 8. What breaks if we are wrong — who objects, and what they say

| Placement | The objector in the room | What they say | The answer |
|---|---|---|---|
| **`Tools` as a callout, not a ring** | A platform engineer | "Tools are just harness configuration. Why does that get its own callout when permissions and hooks don't?" | Because tools are the only part whose *cost* lands in the model's context and whose *effect* lands outside the harness. Permissions and hooks never leave the harness. **This is the one objection with real force**, and the honest answer is that the callout is there because chapter 3 bills tools as a line item — if it weren't, it wouldn't earn the space. |
| **MCP on the `Harness` ring** | A security architect | "MCP is also a credential boundary. That isn't the harness — the whole point is that the harness is *outside* it." | Correct, and it strengthens the mapping rather than breaking it. The *client* is inside the harness (spec: "connectors within the host application"); the *boundary* is deliberately on the server side. Say both. |
| **MCP **not** on `Skills`** | Anyone who read #32's proposed line | "You told us an MCP server is a skill with a wire protocol." | That was the deflation framing. In ring vocabulary a skill is instructions the agent *reads*; a tool is what it *calls*. **This is why #32's line must not be reused verbatim** (§3b). |
| **`Environment` widened** | The ASML platform owner | "So Jira is our environment now? Where does it stop?" | It stops where you stop it — "you decide how big the environment is; a sandbox shrinks it, adding a tool extends it." That is a governance answer, and it is the source's own words. |
| **`Agent` still a callout** | An executive who was sold an agent last quarter | "Our vendor sells an agent. You're telling me it doesn't exist?" | No — it runs, it works, and its reach is measurably growing (METR). It just isn't a *part*. Then Gartner's agent-washing line does the rest, said by an analyst rather than by the presenter. |
| **The `Tools` seam claim itself** | Someone who has read Weng's 2023 taxonomy | "Planning and memory are separate components, not tools." | Anthropic's memory tool is one `tools` entry with six file commands; Microsoft ships todo tracking as a harness feature. Both collapsed into tools + harness once they shipped. (Carried from #31.) |

---

## 9. What is safe to assert on the slide

**Safe on screen:**
- An agent is a model with a harness around it, running in a loop until the job is done. *(Pocock, Anthropic, OpenAI, Google, Microsoft — five-way agreement.)*
- "Agent" is not a part. It is the name for the assembly in motion.
- A tool is what the harness hands the model so it can touch the environment. The model never executes anything itself.
- Tool definitions are described to the model on **every** request, whether they are used or not.
- An MCP server is a standard plug for giving your harness tools it did not ship with.
- The agent never "calls MCP" — it calls a tool that happened to arrive over MCP.
- ~55,000 tokens of tool definitions for a realistic five-server setup, before anyone types anything. *(Anthropic, cited.)*
- Tool-selection accuracy degrades past 30–50 tools.
- The environment is everything the agent can reach, and the only layer that persists between sessions.

**Presenter notes only:**
- The 286-token tool-use system prompt (per-model, will age).
- Anthropic's adoption survey figures (57% / 16% / 86% / 80%) — vendor-published research.
- The MCP protocol's 2026 shrinkage (Sampling/Roots/Logging deprecated, sessions removed) — true and interesting, but it is an argument with the 2025 literature, not with this room.
- The credential-boundary detail, unless a security question is asked — then it is the best answer in the pack.
- "You decide how big the environment is; a sandbox shrinks it, a tool extends it."

**Must not say:**
- ❌ "An MCP server is a skill." Wrong ring, and the deck just spent a slide teaching the rings.
- ❌ "MCP is inherently expensive." It is expensive **as deployed today, by default**. `defer_loading` and tool search exist.
- ❌ "Agents are in decline." No source. *(#31.)*
- ❌ Any number for what "an agent" costs. There isn't one.
- ❌ "Environment = your codebase," once MCP is on the same slide.

---

## 10. Summary of verdicts

| Q | Verdict |
|---|---|
| 1. What an agent is | "A model with a harness around it, running in a loop — the model in motion, not a part you buy." **Callout confirmed** by Pocock's own "doesn't name a mechanical part". The loop needs no new name. |
| 2. Where tools live | **Nowhere and two places: the seam between Harness and Environment.** Definition costs context (inner), execution is the harness's, effect is the environment's. **Not a Skill** — explicitly forbidden by the framing's author. |
| 3. Which ring MCP attaches to | **Harness** — the client lives inside the host. Its *effect* is on **Environment**. The Harness→Environment reading the ticket hoped for is **defensible and recommended**. Not Skills. ⚠️ Contradicts #32's proposed line. |
| 4. Is Environment too narrow | **Yes.** Copy fix required regardless of the diagram decision. Replacement drafted in §4, and it makes the landing line stronger. |
| 5. Altitudes | **Not broken by MCP.** Already broken by `Tools`, which chapter 3 bills and chapter 2 never names. Option C repairs it. |
| 6. Shortest sentences | §1 (agent) and §3b (MCP). Both drafted to survive being read aloud. |
| 7. What breaks | §8. The one objection with real force is "why does `Tools` get a callout when permissions don't". |
| **Diagram** | **Option C: keep four rings; add a `Tools` callout beside the `Agent` callout; rewrite the `Environment` definition.** No fifth ring (§5B explains why every position for one asserts something false). The optional `TOOLS` spoke in the SVG is a #38 prototype question, not a requirement. |

---

## Sources

**Matt Pocock — `dictionary-of-ai-coding` (named secondary source; the rings' origin). Read directly via the GitHub API, resolving map #4's HTTP 402 gap:**
- [`Agent.md`](https://github.com/mattpocock/dictionary-of-ai-coding/blob/main/dictionary/Agent.md) — "The model in motion"; "doesn't name a mechanical part"; the anthropomorphised unit.
- [`Harness.md`](https://github.com/mattpocock/dictionary-of-ai-coding/blob/main/dictionary/Harness.md) — "everything around the model that turns it into an agent: tools, system prompt, context-window management, permissions, hooks"; "the agent loop […] is run by the harness".
- [`Model.md`](https://github.com/mattpocock/dictionary-of-ai-coding/blob/main/dictionary/Model.md) — stateless; "on its own a model can't do anything agentic".
- [`Tool.md`](https://github.com/mattpocock/dictionary-of-ai-coding/blob/main/dictionary/Tool.md) — "a function the harness exposes"; "how an agent perceives and acts on the environment"; definitions sent "with every request"; "a standing cost before any tool is called"; "MCP is the standard for plugging in tools from outside the harness".
- [`Environment.md`](https://github.com/mattpocock/dictionary-of-ai-coding/blob/main/dictionary/Environment.md) — "a filesystem is the most common kind of environment, but not the only one"; "the layer that persists — the only one that is always stateful"; "you decide how big the environment is".
- [`Skill.md`](https://github.com/mattpocock/dictionary-of-ai-coding/blob/main/dictionary/Skill.md) — "kept in the environment until a context pointer pulls it in"; ***Avoid: 'tool' — a tool is what the agent calls; a skill is instructions it reads.***
- [`MCP.md`](https://github.com/mattpocock/dictionary-of-ai-coding/blob/main/dictionary/MCP.md) — "plugging external tool servers into a harness"; "the agent never 'calls MCP'"; the up-front context cost and the tool-search mitigation.
- [`Tool call.md`](https://github.com/mattpocock/dictionary-of-ai-coding/blob/main/dictionary/Tool%20call.md), [`Subagent.md`](https://github.com/mattpocock/dictionary-of-ai-coding/blob/main/dictionary/Subagent.md) — the five-step model/harness lifecycle; subagents as one-level-deep context isolation.

**Anthropic (primary):**
- [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) — agents vs workflows; "an LLM enhanced with augmentations such as retrieval, tools, and memory"; "gain 'ground truth' from the environment at each step"; start simple.
- [How tool use works](https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works) — "the model never executes anything on its own"; "the primary axis along which tools differ is where the code executes"; client vs Anthropic-schema vs server-executed; "tool use is the bridge between natural-language requests and the systems that fulfill them".
- [Tool use overview](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview) — where tool tokens come from; the per-model tool-use system prompt table (Opus 5: 286 / 406).
- [Agent SDK overview](https://code.claude.com/docs/en/agent-sdk/overview) — "An agent is an application that completes a task by planning its own steps and calling tools"; the capability table listing Built-in tools, MCP and Skills as harness capabilities.
- [Claude Code — Extend Claude with skills](https://code.claude.com/docs/en/skills) — `allowed-tools` / `disallowed-tools` frontmatter (skills govern tools); bundled scripts; the 1%-of-context-window skill-listing budget; the 25,000-token re-attachment budget after compaction.

**MCP specification (primary), revision `2026-07-28`:**
- [Specification overview](https://modelcontextprotocol.io/specification/2026-07-28) — Hosts / Clients ("connectors within the host application") / Servers; server features Resources, Prompts, Tools; client features Elicitation only; the LSP analogy; Skills over MCP as an *extension*.
- [Architecture](https://modelcontextprotocol.io/specification/2026-07-28/architecture) — the host-process / local-machine / internet diagram; "full conversation history stays with the host"; host "enforces security policies and consent requirements".

**Other vendors (primary):**
- [OpenAI Agents SDK — MCP](https://openai.github.io/openai-agents-python/mcp/) — the USB-C analogy; `mcp_servers` as a parameter separate from `tools`; "every agent run calls `list_tools()` on each MCP server"; `cache_tools_list`.
- [OpenAI Agents SDK — Agents](https://openai.github.io/openai-agents-python/agents/) *(carried from #31)*, [Google ADK — Agents](https://adk.dev/agents/) *(carried from #31; `adk.dev/tools/` and `/tools/overview/` both 404'd or redirected to an empty stub for my fetcher — **the ADK tools taxonomy is an unverified gap in this document**)*, [Microsoft — Agent Framework at Build 2026](https://devblogs.microsoft.com/agent-framework/microsoft-agent-framework-at-build-2026-announce/) *(carried from #31, not re-verified)*.

**Carried forward without re-verification (see the named doc for the direct reads):**
- `agent-deflation-2026.md` (#31, branch `research/agent-deflation`) — memory-as-a-tool; Microsoft Agent Harness; Gartner; METR; the Anthropic survey and its vendor-research caveat.
- `mcp-deflation-2026.md` (#32, branch `research/mcp-deflation`) — the ~55K five-server itemisation; 310 vs ~740 tokens/tool; 30–50 tool degradation; 49%→74%; `defer_loading`; the credential boundary; the 2026 protocol shrinkage.
- [`agent-vs-model-harness-skills.md`](./agent-vs-model-harness-skills.md) (map #4) — the rings' original basis.

**Local:**
- `src/pages/decks/asml-ai/index.astro:367–440` — the `.layers` rings slide.
- `src/pages/decks/asml-ai/index.astro:46–142` — the primitives-slide comment recording the two-altitudes decision, and the `Tools` / `Tool results` blocks that create the gap found in §6.
