# Token billing per turn in a multi-turn chat session

**Question:** For a multi-turn LLM chat session, exactly which tokens bill as fresh input, which as cached input, and which as output — and how does that change turn by turn? Per provider (OpenAI, Anthropic, Google), where do they disagree, and which one should the deck model?

**Date:** 2026-08-27

---

## TL;DR verdict

Three rules carry the whole slide, and all three are documented by all three providers:

1. **Every call bills the whole context.** The APIs are stateless request-by-request: the entire rendered prompt is priced on every turn. OpenAI says it outright even for its *stateful* chaining mode — "Even when using `previous_response_id`, all previous input tokens for responses in the chain are billed as input tokens in the API" ([OpenAI, Conversation state](https://developers.openai.com/api/docs/guides/conversation-state)).
2. **Last turn's OUTPUT becomes this turn's INPUT — and it is cacheable.** Assistant text is not free after it is generated; it is billed once as output, then re-billed on every later call as input (cached input once it is inside a cached prefix). Anthropic's multi-turn table shows `Asst(2)` being *written to cache* on the request after it was generated ([Anthropic, Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)).
3. **The cache is a strict PREFIX match, so an edit at position 0 kills everything downstream.** OpenAI: "Cache reuse requires the entire rendered prefix to match. If content or a relevant setting changes before a breakpoint, the prefix after that change cannot match the existing cache entry" ([OpenAI, Prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching)). Anthropic: "Changes at each level invalidate that level and all subsequent levels" ([Anthropic, Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)).

**Model the deck on GPT-5.4.** It is a documented, currently-priced model ($2.50 / $0.25 / $15.00 per MTok, [OpenAI pricing](https://developers.openai.com/api/docs/pricing)) whose numbers already match `src/lib/asml-ai/rates.ts`, its caching is fully automatic (no breakpoints to explain), and — critically for a three-colour slide — **it has no cache-write SKU**, so every token is exactly one of three prices. Anthropic and OpenAI's *newer* models both add a fourth price (the 1.25× cache write), which would make the "fresh" colour on the invalidation turn cost 1.25×, not 1×.

**One correction to the deck's own comment.** `src/lib/asml-ai/agent-loop.ts` says "OpenAI carries no write surcharge." That is true of GPT-5.4 and false of OpenAI in general: "For GPT-5.6 and later, cache writes cost 1.25× the standard, uncached input-token rate" ([OpenAI, Prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching)). The comment should be scoped to GPT-5.4, not to the vendor.

---

## 1. The scenario, with concrete token counts

Blocks, in the order they sit in the context window (top of the stack first):

| # | Block | Tokens | Enters at |
|---|---|---:|---|
| A | Project / system prompt file | 3,000 | session open |
| B | Harness bundle | 1,840 | session open |
| C | Tool schemas ×2 | 620 | session open |
| U1 | User question 1 | 30 | turn 1 |
| A1 | Assistant answer 1 | 300 | turn 1 (as output) |
| D | Pasted document | 12,000 | turn 2 |
| U2 | User question 2 | 25 | turn 2 |
| A2 | Assistant answer 2 | 400 | turn 2 (as output) |
| U3 | Follow-up about the document | 20 | turn 3 |
| A3 | Assistant answer 3 | 350 | turn 3 (as output) |
| A′ | **Edited** project prompt file (replaces A) | 3,100 | turn 4 |
| U4 | User question 4 | 25 | turn 4 |
| A4 | Assistant answer 4 | 300 | turn 4 (as output) |
| U5 | User question 5 | 20 | turn 5 |
| A5 | Assistant answer 5 | 250 | turn 5 (as output) |

Five API calls, one per user question.

---

## 2. The per-turn colouring table (GPT-5.4 — the deck's model)

Colour key: **F** = fresh input (full price), **C** = cached input (0.1×), **O** = output, **—** = not in context yet.

| Block | Turn 1 | Turn 2 | Turn 3 | **Turn 4 (edit)** | Turn 5 |
|---|:--:|:--:|:--:|:--:|:--:|
| A → A′ project prompt | **F** | C | C | **F** *(edited)* | C |
| B harness bundle | **F** | C | C | **F** *(downstream of edit)* | C |
| C tool schemas | **F** | C | C | **F** *(downstream of edit)* | C |
| U1 | **F** | C | C | **F** | C |
| A1 | **O** | C | C | **F** | C |
| D document (12,000) | — | **F** | C | **F** | C |
| U2 | — | **F** | C | **F** | C |
| A2 | — | **O** | C | **F** | C |
| U3 | — | — | **F** | **F** | C |
| A3 | — | — | **O** | **F** | C |
| U4 | — | — | — | **F** | C |
| A4 | — | — | — | **O** | C |
| U5 | — | — | — | — | **F** |
| A5 | — | — | — | — | **O** |

Totals per turn:

| Turn | Fresh input | Cached input | Output | Cache read as % of context |
|---|---:|---:|---:|---:|
| 1 | 5,490 | 0 | 300 | 0% |
| 2 | 12,025 | 5,790 | 400 | 33% |
| 3 | 20 | 18,215 | 350 | **99.9%** |
| 4 (edit) | **18,710** | **0** | 300 | **0%** |
| 5 | 20 | 19,010 | 250 | **99.9%** |

The shape the slide is teaching: **the stack is almost entirely "cached" colour on a normal turn, snaps entirely to "fresh" colour on the edit turn, and snaps back to almost entirely cached on the very next turn.** Turn 3 → 4 → 5 is the whole story.

### The same table, one row per *animation state*

For a designer: only four distinct stack pictures exist.

- **Cold open (turn 1):** everything fresh, nothing cached.
- **Growth turn (turn 2):** old blocks cached, newly-added blocks fresh.
- **Cheap turn (turns 3, 5):** everything cached except the one new user line.
- **Invalidation turn (turn 4):** everything fresh again — including blocks the user never touched.

---

## 3. Answers to the six questions, per provider

### (a) On turn N, which parts bill fresh vs cached?

**All three agree on the mechanism:** the longest matching *prefix* of the rendered context bills at the cached rate; everything from the first byte of divergence onward bills as fresh input.

- **OpenAI.** Caching covers "the model's full rendered context including OpenAI-provided instructions, developer messages, tool definitions, and conversation history." "Prompt caching is enabled by default for supported OpenAI models" — nothing to opt into ([OpenAI, Prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching)).
- **Anthropic.** "Prompt caching references the entire prompt — `tools`, `system`, and `messages` (in that order) up to and including the block designated with `cache_control`." The reported split is exact: `cache_read_input_tokens` (served from cache), `cache_creation_input_tokens` (written this request), and `input_tokens` = "Number of input tokens which were not read from or used to create a cache (that is, tokens after the last cache breakpoint)"; `total_input_tokens = cache_read + cache_creation + input_tokens` ([Anthropic, Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)).
- **Google.** "Implicit caching is enabled by default for all Gemini 2.5 and newer models"; hits are reported in `usage.total_cached_tokens`. Guidance is prefix-shaped — "Try putting large and common contents at the beginning of your prompt" and "Try to send requests with similar prefix in a short amount of time" ([Google, Context caching](https://ai.google.dev/gemini-api/docs/caching)).

**Difference that matters:** Anthropic splits "fresh" into two prices — plain uncached input (after the last breakpoint) and *cache write* (before it, at 1.25×). OpenAI's GPT-5.4 and Google's implicit cache have one fresh price. On a three-colour slide, Anthropic needs a fourth colour or a footnote.

### (b) Does last turn's OUTPUT re-bill as input?

**Yes, on every provider — it is billed once as output, then re-billed on every subsequent call as input, at the cached rate once it falls inside a cached prefix. It is never free thereafter.**

- **OpenAI** states it for the stateful path too: "Even when using `previous_response_id`, all previous input tokens for responses in the chain are billed as input tokens in the API" ([OpenAI, Conversation state](https://developers.openai.com/api/docs/guides/conversation-state)).
- **Anthropic**'s multi-turn table is explicit: on Request 2, "System through User(2) read from cache; Asst(2) + User(3) written to cache" — the assistant turn that was output on request 1 is a cache *write* on request 2 and a cache *read* from request 3 onward ([Anthropic, Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)). Assistant turns are explicitly cacheable: "Text messages: Content blocks in the `messages.content` array, for both user and assistant turns."
- **Google** does not spell out assistant-turn billing separately, but conversation history is part of the request in both stateless and `previous_interaction_id` modes ([Google, Context caching](https://ai.google.dev/gemini-api/docs/caching)). *Flagged: Google has no sentence as blunt as OpenAI's; treat "output re-bills as input on Gemini" as inference from the stateless-request model, not a quoted rule.*

**Slide implication:** an assistant block should be drawn in the "output" colour for exactly one turn, then in the "cached input" colour forever after. Never in "free".

**OpenAI-specific wrinkle:** reasoning tokens "are billed as output tokens" and occupy the context window even though they are not visible ([OpenAI, Reasoning](https://developers.openai.com/api/docs/guides/reasoning)). If the deck shows a reasoning block, it is output-coloured on its own turn like any other assistant block.

### (c) The exact prefix rule — does an edit at the start kill the whole rest?

**OpenAI: yes, unambiguously.** "Cache reuse requires the entire rendered prefix to match. If content or a relevant setting changes before a breakpoint, the prefix after that change cannot match the existing cache entry." Beyond content, the following settings also invalidate: model, `tools`, `parallel_tool_calls`, `text.format`, `reasoning.effort`, `text.verbosity`, `context_management` ([OpenAI, Prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching)).

**Anthropic: yes, but tiered — and the tiering is a genuine escape hatch.** Render order is "`tools`, `system`, then `messages`", and "Changes at each level invalidate that level and all subsequent levels." The documented matrix (✓ = cache survives, ✘ = invalidated):

| What changes | Tools cache | System cache | Messages cache |
|---|:--:|:--:|:--:|
| Tool definitions | ✘ | ✘ | ✘ |
| Web search toggle / citations toggle | ✓ | ✘ | ✘ |
| Speed setting (fast vs standard) | ✓ | ✘ | ✘ |
| Tool choice parameter | ✓ | ✓ | ✘ |
| Images added/removed | ✓ | ✓ | ✘ |
| Thinking / effort settings | model-specific | model-specific | ✘ |

([Anthropic, Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).) So editing a *system* prompt keeps the tool-schema cache and destroys everything from `system` down. Editing a *tool schema* destroys everything. **Note the ordering consequence for the slide's stack: on Anthropic, tool schemas sit ABOVE the system prompt, not below it** — the deck's current stack order (harness, then tools) is an OpenAI-shaped picture, not an Anthropic-shaped one.

**Google: prefix-shaped but under-specified.** The docs give prefix *guidance* ("large and common contents at the beginning", "similar prefix") rather than a stated exact-match rule. **Flagged: I could not find a Google primary-source sentence asserting byte-exact prefix matching or enumerating invalidating settings.** The Vertex AI context-cache overview pages returned navigation-only content to my fetcher on two attempts, so the Vertex-side rules are unverified here.

### (d) Minimums, write charges, TTLs, automatic vs explicit — what materially changes the picture?

| | OpenAI | Anthropic | Google |
|---|---|---|---|
| **Automatic?** | Yes, "enabled by default for supported OpenAI models" | Automatic caching via one top-level `cache_control`, or explicit per-block breakpoints (max 4) | Implicit "enabled by default for all Gemini 2.5 and newer models"; explicit caching is a separate managed object |
| **Minimum cacheable prefix** | "1,024 tokens for GPT-5.6 and later and 2,048 tokens for models older than GPT-5.6" → **GPT-5.4 needs 2,048** | 512 (Opus 5, Fable 5, Mythos 5); 1,024 (Opus 4.8, Sonnet 5, Sonnet 4.6, **Sonnet 4.5**, Opus 4.1/4, Sonnet 4); 2,048 (Opus 4.7, Mythos Preview, Haiku 3.5); **4,096 (Opus 4.6, Opus 4.5, Haiku 4.5)** | 2,048 (Gemini 2.5 Flash / 2.5 Pro); **4,096 (Gemini 3.1 Pro Preview, 3.5 / 3.6 / 3.7 Flash)** |
| **Below the minimum** | rounded/ineligible | "Shorter prompts cannot be cached, even if marked with `cache_control`… processed without caching, and no error is returned" | not cached |
| **Cache-write charge** | **GPT-5.4: none** (pricing page lists no cache-write rate). GPT-5.6+: 1.25× | **1.25× base input (5-minute TTL); 2× (1-hour TTL)** | Implicit: no documented write surcharge. Explicit: creation billed at standard input price plus a **storage charge per 1M tokens per hour** |
| **Cache read** | 0.1× | 0.1× ("Cache read tokens are 0.1 times the base input tokens price") | 0.1× — derived from the pricing table (e.g. Gemini 3.7 Flash input $0.75, context caching $0.075) |
| **TTL** | GPT-5.6+: "A cached prefix remains eligible for reuse for 30 minutes after its most recent write or reuse." Earlier models (**incl. GPT-5.4**): `prompt_cache_retention` — `in_memory` "around 5 to 10 minutes of inactivity, up to one hour", or `24h` | 5 minutes default, "refreshed for no additional cost each time the cached content is used"; 1-hour opt-in. Lifetime measured "from the start of the request that writes or reads the cache entry, not from the end of its response" | Explicit: "If not set, the TTL defaults to 1 hour." Implicit TTL not documented |

**Which of these materially change the deck's picture:**

- **The 2,048-token minimum on GPT-5.4 is the one that bites.** In the scenario above, the session opens with 5,490 tokens, so it clears the bar comfortably — but a session that opened with only a short system prompt would show *zero* cached tokens on turn 2 and the slide would be lying. Keep the opening blocks ≥ 2,048 tokens in the deck's numbers. (They are: 3,000 + 1,840 + 620.)
- **The 1.25× write charge is what forces a fourth colour on Anthropic.** On Anthropic, the "fresh" blocks on turn 4 are not 1× — most of them are 1.25× cache writes. This is exactly the reason `agent-loop.ts` chose a non-Anthropic model, and that reasoning still holds.
- **TTL is a presenter note, not a colour.** All the TTLs (5 min → 30 min → 1 h) are longer than the gap between turns in a live chat, so within the scenario nothing expires. Worth one spoken sentence — "walk away for lunch and the blue turns orange again" — but not a state in the animation.
- **Anthropic's 20-block lookback is a real agentic-loop trap** ("The lookback window is 20 blocks… The system checks at most 20 positions per breakpoint"), but the six-turn chat scenario never adds 20 blocks in one turn. Off-screen.

### (e) After an invalidation, is the cached portion genuinely ZERO? Does it recover next turn?

**Yes and yes — for the invalidated tiers.**

- **Zero:** Anthropic's usage arithmetic leaves no room for a partial credit — the invalidated span moves out of `cache_read_input_tokens` entirely. On OpenAI, the prefix "cannot match the existing cache entry", so `cached_tokens` for that span is 0. On the deck's GPT-5.4 model, **turn 4 shows a hard 0 cached / 18,710 fresh.**
- **Recovers next turn:** the invalidation turn is itself a cache write of the *new* prefix. Anthropic documents the walking cache point directly — "With automatic caching, the cache point moves forward automatically as conversations grow. Each new request caches everything up to the last cacheable block, and previous content is read from cache." So turn 5 is back to 19,010 cached / 20 fresh — 99.9%.
- **One caveat worth a presenter note, not a colour:** Anthropic notes "A cache entry becomes readable only after the first response begins streaming," so the recovery is not instantaneous for *parallel* requests. In a serial chat it is.

**The honest framing for the slide:** the cost of the edit is *one* expensive turn, not a permanently expensive session. That is the interesting, counter-intuitive half — most audiences assume either "editing is free" or "editing ruins the session", and both are wrong.

### (f) Do tool results and tool schemas behave differently?

**Tool schemas: yes, and importantly so.** They are the *most* invalidation-sensitive thing in the context on every provider.

- Anthropic ranks them at the top of the hierarchy: render order is `tools` → `system` → `messages`, and "Modifying tool definitions invalidates entire cache." Adding, removing, or reordering a tool mid-session is the one change with no cheaper tier below it.
- OpenAI lists `tools` (and `parallel_tool_calls`) among the settings whose change breaks prefix reuse, and confirms tool definitions are part of the cached rendered context.
- Anthropic additionally charges a documented, model-specific **tool-use system prompt** on top of your schemas — e.g. 286 tokens on Opus 5 with `tool_choice: auto`, 497 on Sonnet 4.6 ([Anthropic, Pricing § Tool use pricing](https://platform.claude.com/docs/en/about-claude/pricing)). Invisible tokens the user never typed. Good presenter material; probably too fiddly for the stack picture.

**Tool RESULTS: no, they are ordinary message content.** Anthropic lists them among cacheable blocks explicitly: "Tool use and tool results: Content blocks in the `messages.content` array, in both user and assistant turns." Anthropic's own tool-use pricing section confirms `tool_use` blocks and `tool_result` blocks are simply counted as input tokens.

**This vindicates the existing agent-loop slide's asymmetry.** `agent-loop.ts` says: "Tool results are produced locally and cost nothing until the next call re-sends them." That is correct and primary-source-backed — a tool result is not billed at the moment it is produced, only when it is re-sent as part of the next request's context. Anthropic's web-search note phrases the same idea from the other side: results "are counted as input tokens, in search iterations executed during a single turn and in subsequent conversation turns."

**One thing that is NOT ordinary:** Anthropic's thinking blocks — "Thinking blocks cannot be cached directly with `cache_control`. However, thinking blocks CAN be cached alongside other content when they appear in previous assistant turns."

---

## 4. Where the providers actually disagree

| Question | OpenAI (GPT-5.4) | Anthropic | Google |
|---|---|---|---|
| Number of distinct token prices | **3** (input / cached / output) | **5** (input / 5m write 1.25× / 1h write 2× / read 0.1× / output) | **3** implicit; 4 explicit (adds storage-per-hour) |
| Does the user place cache breakpoints? | No, fully automatic | Optional — automatic or up to 4 explicit breakpoints | No for implicit; explicit caching is a separate object you create and manage |
| Where do tool schemas sit in the stack? | Part of the rendered prefix | **Above** the system prompt (`tools` → `system` → `messages`) | not documented in the pages I opened |
| Editing the system prompt kills… | everything after it | `system` + `messages`, **but tool schemas survive** | presumably everything after it — *not verified* |
| Cache lifetime | GPT-5.4: ~5–10 min idle (`in_memory`), or 24h opt-in | 5 min (refreshed free on each hit), 1 h opt-in at 2× write | explicit: 1 h default; implicit undocumented |

**Recommendation for the deck: keep GPT-5.4.** Three prices map cleanly to three colours; caching is automatic so the slide never has to explain a breakpoint; and the whole per-turn story survives without a footnote. Mention Anthropic's 1.25× write and Anthropic's tools-above-system ordering only in presenter notes — putting either on screen costs a colour and buys nothing.

---

## 5. Verified against the deck's existing rate table

`src/lib/asml-ai/rates.ts` uses AIC per 1M tokens where 1 AIC = 1 US cent, i.e. 250 AIC = $2.50/MTok.

| Deck row | Deck implies (USD/MTok, in / cached / out) | Primary source says | Verdict |
|---|---|---|---|
| GPT-5.4 | 2.50 / 0.25 / 15.00 | GPT-5.4: input $2.50, cached input $0.25, output $15.00 — [OpenAI pricing](https://developers.openai.com/api/docs/pricing) | ✅ exact match |
| Sonnet 4.5 | 3.00 / 0.30 / 15.00 | Claude Sonnet 4.5: $3 base input, $0.30 cache hits, $15 output — [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing) | ✅ exact match |
| Opus 4.6 | 5.00 / 0.50 / 25.00 | Claude Opus 4.6: $5 / $0.50 / $25 — [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing) | ✅ exact match |
| **Gemini 3 Flash** | 0.50 / 0.05 / 3.00 | **No model named "Gemini 3 Flash" appears on [Google's pricing page](https://ai.google.dev/gemini-api/docs/pricing).** The nearest documented rows are Gemini 3.7 Flash and 3.6 Flash at $0.75 / $0.075 / $3.75, and Gemini 3.5 Flash at $1.50 / $0.15 / $9.00 | ⚠️ **UNVERIFIED** |

**Action on the Gemini row.** The deck's own sourcing comment says the lineup comes from the company's GitHub Copilot model availability and its published AIC multipliers, not from Google's price list — so this row may well be correct *as a GitHub AIC figure* and simply not exist as a Google list price. Two defensible fixes: (a) leave it and add a code comment that the figure is GitHub's AIC rate for a GitHub model name, not Google's list price; or (b) relabel to a documented Google model and use Google's numbers. **Do not silently "correct" it to $0.75 — that would mix two price systems in one table.**

Also worth re-checking: `rates.ts` claims `1 AIC = 1 US cent` is "first-party and current". That is a GitHub figure and outside the scope of these three providers' docs — **not verified here.**

---

## 6. What I could NOT verify

Flagged honestly, rather than guessed:

1. **Google's exact prefix-match rule and invalidation list.** Google's public caching docs give prefix *guidance* ("common contents at the beginning", "similar prefix"), never a byte-exact matching rule or an enumerated list of invalidating settings. Both Vertex AI context-cache overview URLs I tried returned navigation chrome only. **Do not put a hard Google invalidation claim on a slide.**
2. **Google implicit-cache TTL.** Not documented on the pages I opened. The 1-hour default TTL is documented for *explicit* caches only.
3. **The "90% discount on Gemini 2.5 or later" wording** appeared only in a search-result summary, not on a page I opened. The **0.1× ratio is independently verifiable from the pricing table's own numbers** ($0.75 input vs $0.075 context caching), so I cite the arithmetic rather than the sentence.
4. **Whether Google implicit cache writes carry a surcharge.** No write-surcharge line exists on the pricing page for implicit caching; absence of evidence, not a quoted "no".
5. **Post-cutoff model names in the deck.** GPT-5.4 turned out to be **documented and currently priced** — it appears in both OpenAI's prompt-caching supported-model list and the pricing table, so the deck's central model is on solid ground. "Sonnet 4.5" and "Opus 4.6" are likewise documented. Only "Gemini 3 Flash" has no documented row.
6. **Whether Google re-bills prior assistant output as input.** Inferred from the stateless request model and from OpenAI/Anthropic's identical behaviour; Google has no equivalent explicit sentence.
7. **Anthropic's `cache_read_input_tokens` being exactly 0 (not merely small) on an invalidation turn.** The usage-field definitions make this follow arithmetically, but no doc sentence says "on invalidation the read count is zero." Confidence high, quotation absent.

---

## How to present this

The slide should animate **turn 3 → turn 4 → turn 5**, not turns 1 → 5. Turns 1 and 2 are just setup; the payload is the snap to all-fresh and the immediate snap back.

Three lines that land, all defensible:

1. *"You are not paying for what you typed. You are paying for the whole window, every single turn."* — backed by OpenAI's `previous_response_id` sentence, which is the most surprising form of the claim (even the "stateful" mode re-bills everything).
2. *"The model's own last answer is next turn's input. Nothing in this window is ever free again."* — backed by Anthropic's `Asst(2) written to cache` row.
3. *"Change one line at the top and the whole stack goes cold — for exactly one turn."* — the invalidation-and-recovery pair. The recovery half is what stops this becoming a scare story, and it is the half most people get wrong.

Keep off-screen, in presenter notes: the 1.25× cache-write premium, the 2,048-token cacheability floor, TTLs, the 20-block lookback, and Anthropic's tools-render-before-system ordering. Each is true, none of them survives contact with a slide.

---

## Sources

Primary sources I opened directly:

- [OpenAI — Prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching) — automatic by default; 1,024-token minimum for GPT-5.6+ / 2,048 for earlier models; 128-token rounding on earlier models; full rendered context incl. tool definitions and conversation history is cached; "Cache reuse requires the entire rendered prefix to match"; invalidating settings (model, tools, `parallel_tool_calls`, `text.format`, `reasoning.effort`, `text.verbosity`, `context_management`); 1.25× writes / 0.1× reads on GPT-5.6+; 30-minute retention on GPT-5.6+, `prompt_cache_retention` `in_memory` (~5–10 min idle, up to 1 h) or `24h` on earlier models; model list including `gpt-5.4`.
- [OpenAI — Pricing](https://developers.openai.com/api/docs/pricing) — GPT-5.4 at $2.50 input / $0.25 cached input / $15.00 output per 1M, no cache-write line item; GPT-5.6 variants with explicit cache-write rates.
- [OpenAI — Conversation state](https://developers.openai.com/api/docs/guides/conversation-state) — "Even when using `previous_response_id`, all previous input tokens for responses in the chain are billed as input tokens in the API."
- [OpenAI — Reasoning](https://developers.openai.com/api/docs/guides/reasoning) — reasoning tokens "are billed as output tokens"; encrypted reasoning items / `previous_response_id` for carrying reasoning across turns.
- [Anthropic — Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) — render order `tools` → `system` → `messages`; tiered invalidation matrix; per-model minimums (512 / 1,024 / 2,048 / 4,096); 1.25× / 2× / 0.1× multipliers; 5-minute default TTL refreshed free on hit, lifetime measured from request start; the multi-turn walking-cache-point table; cacheable block types incl. tool use and tool results, and the thinking-block exception; `cache_creation_input_tokens` / `cache_read_input_tokens` / `input_tokens` definitions and the total-input identity; 20-block lookback window.
- [Anthropic — Pricing](https://platform.claude.com/docs/en/about-claude/pricing) — full per-model base / 5m write / 1h write / cache hit / output table; the prompt-caching multiplier table and break-even note; tool-use pricing incl. per-model tool-use system prompt token counts; "Cache write tokens are charged when content is first stored."
- [Google — Context caching (Gemini API)](https://ai.google.dev/gemini-api/docs/caching) — "Implicit caching is enabled by default for all Gemini 2.5 and newer models"; per-model minimums (2,048 for 2.5 Flash/Pro; 4,096 for 3.1 Pro Preview and 3.5/3.6/3.7 Flash); "We automatically pass on cost savings if your request hits caches"; prefix guidance; `usage.total_cached_tokens`.
- [Google — Context caching (legacy Generate Content API)](https://ai.google.dev/gemini-api/docs/generate-content/caching) — implicit vs explicit; explicit caching's "cost saving guarantee"; "If not set, the TTL defaults to 1 hour"; billing factors (cache token count, storage duration).
- [Google — Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing) — per-model input / output / context-caching prices and the per-1M-tokens-per-hour storage charge; the 0.1× cached-token ratio is read off these figures.

Sources I attempted and could NOT read (flagged in §6):

- `https://cloud.google.com/vertex-ai/generative-ai/docs/context-cache/context-cache-overview` → redirected to `docs.cloud.google.com`, which returned navigation-only content.
- `https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/context-cache/context-cache-overview` → navigation-only content.

Repo files this research is for:

- `/home/neo/projects/atilileri.github.io/src/pages/decks/asml-ai/index.astro` — the slide being fed.
- `/home/neo/projects/atilileri.github.io/src/lib/asml-ai/rates.ts` — the deck's single rate table (three of four rows verified above).
- `/home/neo/projects/atilileri.github.io/src/lib/asml-ai/agent-loop.ts` — the existing billing model; its "OpenAI carries no write surcharge" comment needs scoping to GPT-5.4.
