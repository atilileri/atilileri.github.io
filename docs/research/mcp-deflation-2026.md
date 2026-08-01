# Is an MCP server just a skill bundled with scripts and validators?

**Question (claim under test):** *"An MCP server is no different from a skill bundled with scripts and validators."*

**Context:** wayfinder research ticket [#32](https://github.com/atilileri/atilileri.github.io/issues/32), part of map [#29](https://github.com/atilileri/atilileri.github.io/issues/29) — the chapter-2 "deflation" slide of the ASML AI deck, paired with the agent claim already researched in [`agent-vs-model-harness-skills.md`](./agent-vs-model-harness-skills.md).

**Date:** 2026-08-01 · **Branch:** `research/mcp-deflation`

---

## TL;DR verdict: **WEAK** — and the interesting finding is not the taxonomy, it is the token bill

**The claim survives, but only in its weak form.** MCP adds **interoperability and a trust boundary**; it does not add a *capability* the model gets that a skill-with-scripts cannot deliver. One MCP server serves many harnesses over a wire protocol; a skill's script runs in whatever harness reads its folder. That is a real difference, and it is a difference about **distribution and security**, not about what the model can do.

Three things pushed this off STRONG and stopped it short of FALSE:

1. **The strongest "FALSE" arguments have just been deprecated by the spec itself.** In the current revision, `2026-07-28`, **Sampling** (server calls the model back), **Roots** (client exposes filesystem boundaries) and **Logging** are all marked **Deprecated**, and the protocol was made **stateless** — the `initialize` handshake and protocol-level sessions are gone. The very features people cite as "things a skill structurally cannot do" are the ones MCP is removing. ([deprecated registry](https://modelcontextprotocol.io/specification/2026-07-28/deprecated), [changelog](https://modelcontextprotocol.io/specification/2026-07-28/changelog))
2. **Anthropic ships both and draws the line explicitly** — and the line is *connectivity vs. procedure*, not *powerful vs. weak*: *"MCP connects Claude to data; Skills teach Claude what to do with that data."* ([claude.com/blog/skills-explained](https://claude.com/blog/skills-explained)). They explicitly answer *"Do skills replace MCP? No."* ([claude.com/blog/extending-claude-capabilities-with-skills-mcp-servers](https://claude.com/blog/extending-claude-capabilities-with-skills-mcp-servers))
3. **One residual capability has no skill equivalent: the credential/process boundary** (a remote server holding third-party OAuth tokens that must never transit the client or the model's context). That is genuinely structural — but it is a *security* capability, not a model capability. It is why the verdict is WEAK and not STRONG.

**The money finding (the sub-question worth more than the verdict):** MCP is **structurally more expensive in context tokens** than an on-demand skill, and Anthropic has published the numbers. A five-server MCP setup costs **~55,000 tokens of tool definitions before the conversation starts**; skills cost **a name and a description** until invoked. See §4 — this is the part that pre-loads Tokenomics.

---

## 1. What the MCP specification actually defines

MCP is an open protocol using **JSON-RPC 2.0** between **Hosts** (LLM applications), **Clients** (connectors inside the host) and **Servers** (services providing context and capabilities). The spec explicitly cites the **Language Server Protocol** as its model: *"MCP standardizes how to integrate additional context and tools into the ecosystem of AI applications."* ([spec overview, 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28))

That LSP analogy is the whole argument in one sentence. LSP did not give editors a capability they lacked; it stopped every editor from writing its own integration for every language. MCP is the same move for tools.

### Current revision: `2026-07-28`

The current protocol version is `2026-07-28` ([versioning](https://modelcontextprotocol.io/specification/versioning)). Anything written about MCP before mid-2026 describes a materially different protocol — this matters, because the older `2025-06-18` revision is the one most secondary write-ups (and most people in the room) have read.

| Primitive | Status in `2026-07-28` | Skill equivalent? |
|---|---|---|
| **Tools** — "Functions for the AI model to execute" | Active, core | **Yes.** A bundled script the model runs. Anthropic: skills bundle "scripts and executable code that Claude can run as tools" ([Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)) |
| **Resources** — "Context and data, for the user or the AI model to use", URI-addressed, **application-driven** | Active | **Mostly.** A skill's bundled reference files are level-3 progressive disclosure. Gap: *live* resources with `subscriptions/listen` push updates; a skill's files are static until re-read |
| **Prompts** — "Templated messages and workflows for users", **user-controlled** | Active | **Yes, and better.** This is precisely what `SKILL.md` + `/skill-name` invocation is |
| **Sampling** — server asks the client to run an LLM completion, "server-initiated agentic behaviors and recursive LLM interactions" | **DEPRECATED** (SEP-2577). Migration: *"Integrate directly with LLM provider APIs"* | N/A — being removed |
| **Roots** — client tells server which directories/files are in bounds | **DEPRECATED** (SEP-2577). Migration: *"Pass directories or files via tool parameters, resource URIs, or server configuration"*. The spec also notes roots "are informational guidance rather than an access-control mechanism" | N/A — being removed. And it was never a boundary anyway |
| **Elicitation** — server requests information from the user mid-call, in `form` or `url` mode | Active — **the only remaining client feature** | **Partially.** Form mode ≈ a script asking a question. **URL mode has no skill equivalent** (see §3) |
| **Logging** | **DEPRECATED** (SEP-2577). Migration: stderr / OpenTelemetry | N/A |

The `2026-07-28` overview lists client features as, in full: *"Elicitation: Server-initiated requests for additional information from users."* Compare the `2025-06-18` overview, which listed **Sampling, Roots and Elicitation**. ([2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28) vs [2025-06-18](https://modelcontextprotocol.io/specification/2025-06-18))

### The protocol also just got structurally smaller

From the `2026-07-28` [changelog](https://modelcontextprotocol.io/specification/2026-07-28/changelog):

- *"Remove protocol-level sessions and the `Mcp-Session-Id` header… Servers that need cross-call state use explicit, server-minted handles passed as ordinary tool arguments"* (SEP-2567).
- *"**Make MCP stateless**: remove the `initialize`/`notifications/initialized` handshake"* (SEP-2575).
- Server-initiated requests are gone as a shape: the **Multi Round-Trip Requests (MRTR)** pattern *"replaces the previous approach of sending server-initiated requests, such as `roots/list`, `sampling/createMessage`, or `elicitation/create`."* The server now returns an `InputRequiredResult` and the **client retries** (SEP-2322).
- `ping`, `logging/setLevel` and `notifications/roots/list_changed` removed.

**Read that as a trend line.** Statefulness — one of the ticket's candidate "FALSE" arguments — was in MCP and has been **taken out on purpose**. Server-initiated calls — another candidate — have been re-shaped into client-driven retries. The protocol is converging on *"a well-described way to call a function over a wire, with auth."*

### And MCP is now adopting skills, not competing with them

MCP's own [Skills over MCP Working Group](https://modelcontextprotocol.io/community/working-groups/skills-over-mcp) — co-led by an Anthropic Core Maintainer — exists to define *"how 'agent skills' — rich, structured instructions for agent workflows — are discovered, distributed, and consumed through MCP,"* with the current direction being a **Resources-based Skills Extension** (SEP-2640). Its stated cross-cutting work includes coordination with the external [Agent Skills](https://agentskills.io/) spec and with a **"Primitive Grouping WG"** on *progressive disclosure patterns*.

That is MCP importing the skill model — including skills' token-efficiency mechanism — into the protocol. It is very strong evidence that the two are not rival capabilities.

---

## 2. Where Anthropic itself draws the line

This is the load-bearing source, because Anthropic ships both.

- *"MCP connects Claude to data; Skills teach Claude what to do with that data."* — [Skills explained](https://claude.com/blog/skills-explained)
- *"If you're explaining **how** to use a tool or follow procedures… that's a Skill. If you need Claude to **access** the database or Excel files in the first place, that's MCP. Use both together: MCP for connectivity, Skills for procedural knowledge."* — ibid.
- *"MCP is like having access to the aisles. Skills, meanwhile, are like an employee's expertise."* — [Extending Claude's capabilities with skills and MCP](https://claude.com/blog/extending-claude-capabilities-with-skills-mcp-servers)
- Same page, asked directly: *"Do skills replace MCP? **No.**"* — and: *"skills make MCP servers scale beyond a handful of connections."*
- Anthropic's engineering post frames skills as *"complement[ing] Model Context Protocol (MCP) servers by teaching agents more complex workflows that involve external tools and software."* — [Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)

**What this does to the claim.** It rules out STRONG. Anthropic's own line is not "MCP is redundant packaging" — it is a division of labour: **MCP = reach, Skills = know-how.** But note carefully what the line is *not*: nowhere does Anthropic claim MCP gives the model an ability skills cannot express. Both of their framings are about *where the thing lives* (connectivity, the aisles) versus *what to do with it* (procedure, expertise). That is a **distribution** distinction. Which is exactly the WEAK verdict.

Note also the last quote: *skills make MCP servers scale*. Anthropic is telling you the two compose, with skills as the layer that keeps MCP affordable. That is §4.

---

## 3. Can a bundled script do everything an MCP tool call does? Three places it breaks

**From the model's point of view: yes, entirely.** Both arrive as a tool call. Both come back as text. The model cannot tell whether `create_issue` was fulfilled by a JSON-RPC round trip to a remote server or by `bash scripts/create_issue.sh`. There is no capability delta at the inference boundary.

**From the system's point of view, three real breaks:**

1. **The credential / process boundary — the one genuinely structural gap.** A remote MCP server can hold third-party OAuth tokens the client never sees. The spec is emphatic: *"The third-party credentials **MUST NOT** transit through the MCP client"*, and URL-mode elicitation exists so *"sensitive credentials never pass through the LLM context, MCP client or any intermediate MCP servers."* ([elicitation](https://modelcontextprotocol.io/specification/2026-07-28/client/elicitation)) A skill's bundled script runs *on the harness's machine as the harness's user*: whatever it can reach, the harness can reach, and its secrets are local. **A skill cannot construct a boundary the harness is outside of.** That is a security architecture MCP has and skills structurally lack.
2. **Harnesses with no code execution.** A skill's script needs something to run it. MCP tool calls work in a host that only speaks tool-calling — no shell, no filesystem, no sandbox. In practice this is why consumer and enterprise chat surfaces integrate via MCP rather than by shipping folders of shell scripts.
3. **Server-pushed change notification.** `subscriptions/listen` gives a long-lived stream for `toolsListChanged` / `resourcesListChanged` / resource updates ([changelog](https://modelcontextprotocol.io/specification/2026-07-28/changelog), [resources](https://modelcontextprotocol.io/specification/2026-07-28/server/resources)). A skill folder cannot push. In agent practice this is thin — the model re-reads when it needs to — but it is not nothing.

**And one break in the other direction:** a skill can carry things MCP has no primitive for at all — a *procedure*, a checklist, a house style, a "when to use this and when not to." MCP's answer to that need is the Skills Extension (§1). The traffic is running toward skills, not away.

---

## 4. The token cost — the finding that turns this into a money slide

**This is where the research pays.** Anthropic has published hard numbers, and they are on Anthropic's own engineering blog and product docs, not a third-party benchmark.

### MCP tool definitions are billed up front, every request

> *"Most MCP clients load all tool definitions upfront directly into context, exposing them to the model using a direct tool-calling syntax."*
> *"As MCP usage scales, there are two common patterns that can increase agent cost and latency: 1. Tool definitions overload the context window; 2. Intermediate tool results consume additional tokens."*
> *"In cases where agents are connected to thousands of tools, they'll need to process hundreds of thousands of tokens before reading a request."*
> — [Code execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp)

### The number for the slide: **~55,000 tokens, five servers, zero work done**

Anthropic's [Advanced tool use](https://www.anthropic.com/engineering/advanced-tool-use) post itemises a realistic enterprise setup:

| MCP server | Tools | Tokens of definitions |
|---|---:|---:|
| GitHub | 35 | ~26,000 |
| Slack | 11 | ~21,000 |
| Sentry | 5 | ~3,000 |
| Grafana | 5 | ~3,000 |
| Splunk | 2 | ~2,000 |
| **Total** | **58** | **~55,000** |

> *"58 tools consuming approximately 55K tokens before the conversation even starts."*

The same post's larger scenario: *"~77K tokens before any work begins"* with traditional loading, versus *"~8.7K tokens, preserving 95% of context window"* with on-demand tool search — an *"85% reduction in token usage"*, and *"191,300 tokens of context [preserved] compared to 122,800"*.

The product documentation restates it as an operating rule:

> *"A typical multiserver setup (GitHub, Slack, Sentry, Grafana, and Splunk) can consume ~55k tokens in definitions before Claude does any work. Tool search typically reduces this by over 85 percent, loading only the 3–5 tools Claude needs for a given request."*
> — [Tool search tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool)

And it is not only money — it is quality:

> *"Claude's ability to pick the right tool degrades once you exceed 30–50 available tools."* (ibid.) Internal testing: Opus 4 tool-selection accuracy *"from 49% to 74%"*, Opus 4.5 *"from 79.5% to 88.1%"* with tool search enabled ([Advanced tool use](https://www.anthropic.com/engineering/advanced-tool-use)).

The docs even name the threshold at which the default breaks: use tool search when *"You have 10 or more tools"*, *"Your tool definitions consume more than 10k tokens"*, or *"You aggregate multiple MCP servers (200+ tools)."*

### Skills are billed on demand

> *"Unlike CLAUDE.md content, a skill's body loads only when it's used, so long reference material costs almost nothing until you need it."* — [Claude Code skills](https://code.claude.com/docs/en/skills)

Three-level progressive disclosure ([Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)):
1. **Metadata (name + description)** loads always — *"just enough information for Claude to know when each skill should be used."*
2. **The `SKILL.md` body** loads only *"if Claude thinks the skill is relevant to the current task."*
3. **Bundled files** load only *"as needed."*

Claude Code caps level 1 explicitly: the skill listing's *"budget scales at 1% of the model's context window"* ([Claude Code skills](https://code.claude.com/docs/en/skills)). On a 200k-token window that is **~2,000 tokens for the entire skill library** — against ~55,000 for five MCP servers.

### The honest caveat, which must be stated

**This is a default, not a law of the protocol.** Nothing in the MCP specification requires a client to load all definitions up front — Anthropic's phrasing is *"most MCP clients"*, a statement about implementations. And the gap is being actively closed from both ends: the MCP connector supports `defer_loading` on an `mcp_toolset` ([Tool search tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool)), and the Skills-over-MCP WG is coordinating with a "Primitive Grouping WG" on progressive disclosure (§1).

So the defensible sentence is **"as deployed today, by default"** — not "MCP is inherently expensive." Say it the first way and a knowledgeable person in the room nods; say it the second way and they correct you.

### Tie-in to the deck's own agent-loop slide

The deck bills `Tool schemas ×2 = 620 tokens` (`src/lib/asml-ai/agent-loop.ts:59`) — **310 tokens per tool**. Anthropic's GitHub server is 35 tools for ~26,000 tokens: **~740 tokens per tool**. **The deck's illustrative number is conservative by better than 2×.** That is a gift: chapter 2 can point at the on-screen 620 and say *"that is two tools, and it is an under-estimate — a real GitHub connector is thirty-five,"* and the audience does the multiplication itself, before chapter 3 ever opens.

---

## 5. Verdict, and what the slide may claim

### **WEAK.**

> MCP adds **interoperability** — one server, many harnesses, over a wire protocol with auth — plus one genuinely structural extra, a **credential boundary the harness sits outside of**. It does not add a capability the *model* gets that a skill with scripts lacks. The protocol is mostly distribution, and the spec is actively shedding the features that made it more than that.

**Why not STRONG:** the credential/process boundary is real and a skill cannot build one (§3.1); harnesses without code execution can use MCP and cannot use skills (§3.2); and Anthropic explicitly declines to say skills replace MCP (§2).

**Why not FALSE:** every candidate "only MCP can do this" — statefulness, server-initiated calls, sampling back into the model, roots as an auth boundary — is either **deprecated**, **removed**, or **explicitly documented as not being a boundary** in the current revision (§1). The FALSE case was true of the 2025 protocol and is no longer true of the 2026 one.

### What the slide may claim

**Safe to say on screen:**
- **"MCP is a protocol, not a power."** It standardises how a tool is *reached* — Anthropic's own line: *"MCP connects Claude to data; Skills teach Claude what to do with that data."*
- **"One server, many harnesses."** That is the thing you actually buy. It is the LSP bargain, and the spec says so itself.
- **"Every connector you add is on the bill before anyone types anything."** With the ~55k / five-server number, cited to Anthropic.
- **"Skills are billed on use. Connectors are billed on connection."** Progressive disclosure vs. up-front definitions.
- **"The protocol is getting smaller, not bigger."** Sampling, roots and logging deprecated; sessions removed; MCP adding *skills* as an extension.

**Must NOT say:**
- ❌ *"MCP is just a skill with scripts."* The unqualified deflation is wrong. Someone in the room will name the credential boundary and they will be right.
- ❌ *"MCP is inherently more expensive."* It is expensive **as deployed by default**. The protocol does not mandate it, and `defer_loading` already exists.
- ❌ *"You don't need MCP."* Anthropic ships both and says use both. The deck loses credibility, not the audience.
- ❌ Any 2025-era claim about sampling or roots as MCP's differentiator. Both are deprecated as of `2026-07-28`.

**The line that does the work:**

> *"An MCP server is a skill with a wire protocol and a security boundary — and a standing token bill. You buy reach, and you pay rent on it."*

That is defensible in every clause, it deflates without lying, and its last clause is the hand-off to Tokenomics.

### If chapter 2 keeps the pair

The agent claim deflates **downward** (agent = model + harness + skills, no new ingredient). The MCP claim deflates **sideways** (MCP = the same capability, distributed differently, at a standing cost). Two different shapes. That is *better* for the slide than two identical moves, and it gives the pair a punchline the map was looking for: **the first new noun turns out to be nothing new; the second turns out to be a line item.**

---

## 6. What an executive loses by hearing "it's just a skill with scripts"

Worth flagging honestly, because the deflation has a cost:

1. **They may hear "our MCP integration work was wasted."** It was not — they bought reach across harnesses and a credential boundary their security team should want. If the slide deflates without naming what was actually bought, it argues against a decision the room may have already made, and the room will defend it instead of listening.
2. **They lose the security argument.** "Just a skill with scripts" implies "so run scripts instead" — which means credentials on developer machines. That is a worse posture, and it is the opposite of what the deck should be recommending.
3. **They lose the interoperability rationale** — the actual reason to standardise. The LSP framing is the executive-legible version and it should be *said*, not skipped.

**Mitigation, one sentence, and it strengthens the slide rather than hedging it:** *"You bought two real things — reach and a credential boundary. What you did not buy is a new capability, and what nobody quoted you was the standing token cost."* That respects the decision, keeps the deflation, and sets up chapter 3.

---

## Sources

All opened directly unless noted.

**MCP specification (primary):**
- [Specification, revision `2026-07-28`](https://modelcontextprotocol.io/specification/2026-07-28) — current revision; JSON-RPC basis; LSP analogy; *"Stateless, self-contained requests"*; server features (Resources/Prompts/Tools); client features (**Elicitation only**); extensions incl. Skills over MCP.
- [Specification, revision `2025-06-18`](https://modelcontextprotocol.io/specification/2025-06-18) — the prior revision, for contrast: *"Stateful connections"*; client features **Sampling, Roots, Elicitation**.
- [Versioning](https://modelcontextprotocol.io/specification/versioning) — *"The **current** protocol version is 2026-07-28."*
- [Key Changes (`2026-07-28` changelog)](https://modelcontextprotocol.io/specification/2026-07-28/changelog) — statelessness (SEP-2575); session removal (SEP-2567); MRTR replacing server-initiated requests (SEP-2322); `server/discover`; `subscriptions/listen`; deprecation of Roots/Sampling/Logging (SEP-2577).
- [Deprecated features registry](https://modelcontextprotocol.io/specification/2026-07-28/deprecated) — Roots, Sampling, Logging, Dynamic Client Registration, HTTP+SSE, with migration paths and earliest-removal dates.
- [Client / Roots](https://modelcontextprotocol.io/specification/2026-07-28/client/roots) — deprecation warning; *"informational guidance rather than an access-control mechanism."*
- [Client / Sampling](https://modelcontextprotocol.io/specification/2025-06-18/client/sampling) — *"server-initiated agentic behaviors and recursive LLM interactions"*; `sampling/createMessage`; model preferences.
- [Client / Elicitation](https://modelcontextprotocol.io/specification/2026-07-28/client/elicitation) — form and URL modes; third-party OAuth pattern; *"third-party credentials MUST NOT transit through the MCP client."*
- [Server / Resources](https://modelcontextprotocol.io/specification/2026-07-28/server/resources) — application-driven model; URI schemes; `subscriptions/listen`; caching (`ttlMs`, `cacheScope`).
- [Skills Over MCP Working Group charter](https://modelcontextprotocol.io/community/working-groups/skills-over-mcp) — mission; SEP-2640 Skills Extension (Resources-based); coordination with agentskills.io and the Primitive Grouping WG on progressive disclosure.

**Anthropic — Skills vs MCP (the load-bearing sources):**
- [Skills explained: How Skills compares to prompts, Projects, MCP, and subagents](https://claude.com/blog/skills-explained) — *"MCP connects Claude to data; Skills teach Claude what to do with that data."*
- [Extending Claude's capabilities with skills and MCP servers](https://claude.com/blog/extending-claude-capabilities-with-skills-mcp-servers) — aisles vs expertise; *"Do skills replace MCP? No."*; *"skills make MCP servers scale."*
- [Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) — skill definition; three-level progressive disclosure; skills bundle *"scripts and executable code that Claude can run as tools"*; skills complement MCP.
- [Claude Code — Extend Claude with skills](https://code.claude.com/docs/en/skills) — *"a skill's body loads only when it's used"*; skill-listing budget *"scales at 1% of the model's context window"*; skill content stays in context once loaded.

**Anthropic — token cost (the money numbers):**
- [Code execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp) — *"Most MCP clients load all tool definitions upfront directly into context"*; the two scaling problems; *"hundreds of thousands of tokens before reading a request"*; 150,000 → 2,000 tokens (98.7%) in the Drive→Salesforce example.
- [Advanced tool use](https://www.anthropic.com/engineering/advanced-tool-use) — the five-server itemisation (GitHub 35/~26K, Slack 11/~21K, Sentry 5/~3K, Grafana 5/~3K, Splunk 2/~2K); *"58 tools consuming approximately 55K tokens before the conversation even starts"*; 77K → 8.7K; 85% reduction; accuracy 49%→74% and 79.5%→88.1%.
- [Tool search tool (Claude platform docs)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool) — the ~55k restatement; *"reduces this by over 85 percent"*; *"degrades once you exceed 30–50 available tools"*; when-to-use thresholds; `defer_loading` on `mcp_toolset`.

**Local:**
- `src/lib/asml-ai/agent-loop.ts:59` — the deck's own `Tool schemas ×2 = 620 tokens`, the hook for §4's tie-in.
- [`docs/research/agent-vs-model-harness-skills.md`](./agent-vs-model-harness-skills.md) — the deck's existing position on the paired agent claim.
