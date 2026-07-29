# GitHub Copilot AI Credits (AIC) — rates, allowances, pool, caching, auto model selection

**Question:** What are the *current, verifiable* facts about GitHub Copilot's AI Credits billing that the ASML exec deck will assert on screen? (Research ticket [#21](https://github.com/atilileri/atilileri.github.io/issues/21), part of map [#20](https://github.com/atilileri/atilileri.github.io/issues/20).)

**Date:** 2026-07-29

**Sources used** — all GitHub first-party:

- [Models and pricing for GitHub Copilot](https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing) (and its [Enterprise Cloud twin](https://docs.github.com/en/enterprise-cloud@latest/copilot/reference/copilot-billing/models-and-pricing), fetched separately as a cross-check)
- [Usage-based billing for organizations and enterprises](https://docs.github.com/en/copilot/concepts/billing/usage-based-billing-for-organizations-and-enterprises) ([EC twin](https://docs.github.com/en/enterprise-cloud@latest/copilot/concepts/billing/usage-based-billing-for-organizations-and-enterprises))
- [GitHub Copilot billing](https://docs.github.com/en/billing/concepts/product-billing/github-copilot-billing)
- [About Copilot auto model selection](https://docs.github.com/en/copilot/concepts/models/auto-model-selection)
- [Optimizing your AI usage to maximize efficiency and reduce cost](https://docs.github.com/en/copilot/tutorials/optimize-ai-usage)
- [GitHub Copilot is moving to usage-based billing](https://github.blog/news-insights/company-news/github-copilot-is-moving-to-usage-based-billing/) (blog / announcement)
- [Auto model selection now routes based on your task in VS Code](https://github.blog/changelog/2026-05-20-auto-model-selection-now-routes-based-on-your-task-in-vs-code/) (changelog, 2026-05-20)

---

## TL;DR for the deck

**Everything on Atil's screenshot checks out.** All seven model rows match GitHub's published rates exactly, `1 AIC = $0.01` is current and stated in those words, the 1,900 / 3,900 allowances and enterprise pooling are correct, and completions really are excluded. Two things the deck should adjust, though, and one it can now safely claim:

1. **The allowances are temporarily higher than the deck's numbers.** A promotional boost — Business **3,000** and Enterprise **7,000** AIC/user — is in force for June, July and August 2026 and ends 2026-09-01. As of today the deck's 1,900/3,900 are the *post-September steady state*, not what a customer sees on this month's bill. Label them accordingly.
2. **"Cached input is ~10% of input" is true for the three vendors the deck shows, but not universal** — xAI and Moonshot rows break it, and Anthropic adds a *cache write* charge at 1.25× input that the screenshot omits entirely.
3. **The auto-model-selection discount is real and documented: 10% off model costs on paid plans.** This unblocks the credit-bar claim in map #20's "not yet specified" list. Details and the one wording trap in §6.

---

## 1. The conversion rate — CONFIRMED

`1 AI credit = $0.01 USD`, stated verbatim on both the [models and pricing](https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing) page and the [GitHub Copilot billing](https://docs.github.com/en/billing/concepts/product-billing/github-copilot-billing) page ("Copilot usage is measured in AI credits—a usage-based billing unit where 1 AI credit = $0.01 USD").

Context worth knowing, because it makes the number memorable rather than arbitrary: **plan price and included credits are the same number in dollars.** Pro is "$10/month, including $10 in monthly AI Credits"; Business's standard allowance is "$19 in monthly AI Credits" = 1,900 AIC ([blog](https://github.blog/news-insights/company-news/github-copilot-is-moving-to-usage-based-billing/)). So the allowance *is* the subscription fee, spent as tokens.

Also note the regime change the deck may want to acknowledge: **premium requests (PRUs) are retired.** Usage-based billing took effect **2026-06-01**, and "premium request units (PRUs) will be replaced by GitHub AI Credits." Premium-request fallbacks are gone — "usage is governed by available credits and admin budget controls" ([blog](https://github.blog/news-insights/company-news/github-copilot-is-moving-to-usage-based-billing/)). The older `copilot-requests` doc still exists but is scoped to *legacy* annual Pro/Pro+ plans; don't cite it.

## 2. Per-model rates — ALL SEVEN CONFIRMED

GitHub publishes these in **USD per 1M tokens**, not in credits. The AIC column below is my arithmetic at 100 AIC/$1 — the conversion is trivial and documented, but flag it as derived if anyone asks why the doc "doesn't say 250."

| Model (screenshot) | Screenshot AIC (in/cached/out) | GitHub published USD/1M | AIC equivalent | Verdict |
| --- | --- | --- | --- | --- |
| GPT-5 mini | 25 / 2.5 / 200 | $0.25 / $0.025 / $2.00 | 25 / 2.5 / 200 | **Confirmed** |
| GPT-5.4 | 250 / 25 / 1,500 | $2.50 / $0.25 / $15.00 | 250 / 25 / 1,500 | **Confirmed** (default variant — see caveat) |
| GPT-5.4 nano | 20 / 2 / 125 | $0.20 / $0.02 / $1.25 | 20 / 2 / 125 | **Confirmed** |
| Claude Sonnet 4.5 | 300 / 30 / 1,500 | $3.00 / $0.30 / $15.00 | 300 / 30 / 1,500 | **Confirmed** (+ cache write 375 AIC, omitted) |
| Claude Opus 4.6 | 500 / 50 / 2,500 | $5.00 / $0.50 / $25.00 | 500 / 50 / 2,500 | **Confirmed** (+ cache write 625 AIC, omitted) |
| Gemini 2.5 Pro | 125 / 12.5 / 1,000 | $1.25 / $0.125 / $10.00 | 125 / 12.5 / 1,000 | **Confirmed** |
| Gemini 3 Flash | 50 / 5 / 300 | $0.50 / $0.05 / $3.00 | 50 / 5 / 300 | **Confirmed** |

Both the dotcom and Enterprise Cloud versions of the pricing page were fetched independently and agree on all seven rows, digit for digit.

### Caveats on the seven rows

- **GPT-5.4 has a long-context variant** priced separately: `$5.00 / $0.50 / $22.50` = **500 / 50 / 2,250 AIC** — double input, 1.5× output. The screenshot's 250/25/1,500 is the *default* variant. If the cost-dial slide (#5) lets a viewer scrub context size, that's a real cliff and the deck currently hides it. Same pattern applies to GPT-5.5, GPT-5.6 Luna/Sol/Terra, Gemini 3.1 Pro and Grok 4.5.
- **The Anthropic rows are missing a column.** Anthropic models on Copilot bill four ways, not three — the pricing page notes "Anthropic models include a cache write cost in addition to cached input." Sonnet 4.5 writes at $3.75/1M (375 AIC), Opus 4.6 at $6.25/1M (625 AIC), i.e. **1.25× the standard input rate**. A three-dial cost widget (input / cached / output) will *understate* Anthropic spend, because populating the cache costs more than fresh input. Worth a footnote at minimum.
- **Nothing on the screenshot is stale or renamed** — all seven rows are still on the live page under those exact names. But the *lineup* is dated: the page now also lists Claude Opus 4.7, 4.8, **Opus 5**, **Sonnet 5** (promotional $2.00/$0.20/$2.50/$10.00 through 2026-08-31), Claude Fable 5, Haiku 4.5, GPT-5.3-Codex, GPT-5.5, the GPT-5.6 Luna/Sol/Terra family, Gemini 3.1 Pro, 3.5 Flash, 3.6 Flash, plus non-big-three entries (GitHub Raptor mini, Microsoft MAI-Code-1-Flash, xAI Grok 4.5, Moonshot Kimi K2.7 Code). Showing Sonnet 4.5 and Opus 4.6 as the Anthropic exemplars will read as a year out of date to anyone who uses the tool daily. Consider refreshing to Sonnet 5 / Opus 5 — but if you do, note Sonnet 5's rate is explicitly *promotional through August 31, 2026*, which is a bad thing to engrave on a slide.

## 3. Allowances and pooling — CONFIRMED, with a live promotion the deck misses

Steady-state, per assigned license per month ([usage-based billing for orgs and enterprises](https://docs.github.com/en/copilot/concepts/billing/usage-based-billing-for-organizations-and-enterprises)):

| Plan | Included AIC/user/month | USD equivalent |
| --- | --- | --- |
| Copilot Business | **1,900** | $19 |
| Copilot Enterprise | **3,900** | $39 |

**But right now, both are higher.** "Existing Copilot Business and Copilot Enterprise customers receive a higher amount of included AI credits for the first three months" — **3,000** for Business and **7,000** for Enterprise, covering June, July and August 2026 and running **through 2026-09-01**, after which included usage returns to the standard amounts. Today is 2026-07-29, so this promotion is *in force*. An exec who checks their current invoice against a slide saying 1,900 will find a discrepancy. Recommended slide treatment: show 1,900 / 3,900 as the rate that matters from September, with the boost as a dated aside.

**Pooling — confirmed, and the doc's own framing is better than the deck's.** "A user's included AI credits are pooled at the billing entity level... This means power users can draw more when they need it, while lighter users offset that consumption." That second sentence is the argument the deck wants for the shared-pool slide (#4) — it's GitHub saying out loud that uneven consumption is the *design*, not an abuse. The [billing page](https://docs.github.com/en/billing/concepts/product-billing/github-copilot-billing) corroborates: "each assigned Copilot license comes with a monthly amount of included AI credits, which can be pooled at the billing entity level."

**Overage — confirmed, exactly as the ticket describes.** If additional usage is permitted, "Usage continues at published per-credit rates. The additional spend is charged to your organization or enterprise" — i.e. **no premium, no penalty rate**; overage costs the same per credit as included usage. If it is not permitted, "Usage is blocked until the next billing cycle when monthly amounts are refreshed." Per-user budgets can also halt one individual regardless of remaining pool capacity.

**Not confirmed:** whether unused credits roll over month to month. No page I read states a rollover policy either way. "Refreshed" in the blocking sentence hints at reset-not-accumulate, but that is inference from one word — do not assert it on a slide. If the deck needs it, an admin can confirm from a real invoice in seconds.

## 4. What is NOT billed — CONFIRMED

Verbatim, and stated on both the pricing reference and the org billing concept page: **"Code completions and next edit suggestions are not billed in AI credits. They remain unlimited for all paid plans."** The launch blog says it a second way: "Code completions and Next Edit suggestions remain included in all plans and do not consume AI Credits."

This is the strongest single fact in the set — three independent first-party statements, unambiguous wording, "unlimited" is GitHub's own word. Assert it flatly.

## 5. Caching — mostly true, with a real asterisk

**Is cached input ~10% of standard input?** For the seven models on the deck's slide, **exactly 10%, every row** — no rounding, no approximation. GitHub states the general rule too: "cached tokens are typically billed at 10% of the normal input price" ([optimize-ai-usage](https://docs.github.com/en/copilot/tutorials/optimize-ai-usage)), and the weighting is described elsewhere as "0.1× weight because they are served from cache at a fraction of the cost of fresh input."

**Note the word "typically" — it is doing work.** Two published rows break the ratio:

- xAI **Grok 4.5**: input $2.00, cached **$0.50** → 25%, not 10%
- Moonshot **Kimi K2.7 Code**: input $0.95, cached **$0.19** → 20%, not 10%

So the honest slide claim is "**cached input is billed at 10% of fresh input on OpenAI, Anthropic and Google models**" — which is all the deck shows anyway. "Across all models" would be false. And per §2, on Anthropic the 10% read discount is partly financed by a 1.25× *write* charge.

**What does Copilot cache, and can a user influence it?** Yes — and this is the deck's best bridge into "spend is a skill", because GitHub documents caching as something the *user's habits* control.

Mechanically: "Caching lets an AI model store portions of a conversation's context so they don't need to be reprocessed on every request." It works on repeated **prompt prefixes** — the stable head of the request (system prompt, tool definitions, file contents) that is re-sent every turn of an agent loop. The cached portion from the previous response is reused instead of reprocessed. The user does not tag things as cacheable; caching follows automatically from *prefix stability*.

Which is precisely why the user influences it, by not disturbing the prefix. GitHub's three documented cache-killers:

1. **Switching models mid-session** — "A different model can't reuse another model's cache, so the next request rebuilds it from scratch."
2. **Coming back to an old session** — "Caches expire after a period of inactivity (24 hours for OpenAI models and 1 hour for most others)."
3. **Changing reasoning mid-session** — "Changing the reasoning effort level, context size, or the set of enabled tools and MCP servers during a session invalidates the cache."

And its two recommendations: "Pick a model (or use Copilot auto model selection) and stick with it for the session", and "Configure these settings before you start and leave them unchanged for the session."

The executive-legible version: **a cache miss re-bills your entire context at full input price.** Model-hopping mid-task is not a free curiosity — it is a 10×-on-the-input-leg decision. That is a genuine behaviour-to-money link, sourced, and it belongs on the agent-loop slide (#8).

## 6. Auto model selection — the cost benefit IS documented. Claim it, carefully.

Map #20 lists "how hard to push the auto-model-selection discount claim" as unresolved, pending this ticket. **Resolved: there is an explicit, quantified, first-party discount.**

**What it is.** Not merely a picker — "an intelligent system delivering high quality results, better reliability, and one less decision to make as the model landscape rapidly evolves" ([auto model selection](https://docs.github.com/en/copilot/concepts/models/auto-model-selection)).

**How it picks.** Two cooperating systems: "One system tracks real-time system health and availability, while the other evaluates task complexity." It routes on the task — reasoning demand, code-generation complexity, bug-diagnosis difficulty, tool-orchestration needs — and is language-agnostic: "Routing decisions depend on what you are trying to do, not what language you're asking in." It only chooses from models available to you, excluding models not in your plan, models barred by admin policy, models barred by data-residency/FedRAMP policy, and evaluation models where restricted.

Notably for the deck's caching story, the router is **cache-aware**: it considers "natural cache boundaries to avoid additional cache related costs." So auto-select and cache retention are not competing goals — the router is built not to thrash your cache. That's why the caching guidance offers "or use Copilot auto model selection" as an *alternative* to picking one model manually.

**The cost benefit — safe to assert:**

> "If you are on a paid Copilot plan, you qualify for a **10% discount on model costs** while using auto model selection in Copilot Chat, Copilot CLI, GitHub Copilot app, or Copilot cloud agent."

That is a flat 10% off the credit cost, conditional only on a paid plan and one of those four surfaces. Plus a second, unquantified benefit: "Improved cost efficiency due to intelligent task routing", by matching straightforward tasks to "faster, lower-cost models."

**What can be asserted honestly:**

- ✅ "Auto model selection earns a documented 10% discount on model costs for paid plans." Verbatim from GitHub Docs.
- ✅ "The router also tends to send easy work to cheaper models, and is designed not to break your cache." Documented, directionally.
- ⚠️ **Do not quantify the routing benefit.** GitHub gives no percentage, no benchmark, no worked example for "improved cost efficiency." The savings depend entirely on task mix. If the credit bar on slide #8 shows a routing saving as a *specific* number, that number is invented. Show the 10% as the labelled, sourced discount and let the routing benefit be qualitative.
- ⚠️ **Note the surface list.** The 10% is scoped to Chat, CLI, the GitHub Copilot app and the cloud agent. It is not stated as applying everywhere Copilot runs. Since completions aren't billed at all, this mostly doesn't bite — but don't render it as "10% off everything."
- ⚠️ **One wording trap.** The [2026-05-20 changelog](https://github.blog/changelog/2026-05-20-auto-model-selection-now-routes-based-on-your-task-in-vs-code/) expresses the same discount in the *retired* premium-request idiom: "Paid subscribers get a 10% discount on the model multiplier when using auto (e.g., when auto uses a model that has a 1x multiplier, you will draw down 0.9 premium requests instead of 1)", and mentions a restriction to 0x–1x multiplier models. That predates the 2026-06-01 move to credits. **Cite the docs page, not the changelog** — "0.9 premium requests" on a 2026 exec slide would be citing a unit that no longer exists.

---

## Explicitly NOT verified

Listed plainly rather than filled with plausible numbers:

1. **Credit rollover** — whether unused pooled credits carry into the next month. No first-party statement found in either direction. Do not assert.
2. **The pricing page's last-updated date** — not rendered on the page, so I cannot date-stamp the rate table beyond "fetched 2026-07-29." Both the dotcom and Enterprise Cloud copies agreed, which is the best corroboration available.
3. **Whether the 1,900 / 3,900 figures already reflect any 2026 repricing** — I confirmed them against the docs *and* the $19/$39 blog figures, and they agree, but I found no changelog history to prove they haven't moved since June.
4. **The magnitude of the auto-routing cost saving** — documented as existing, never quantified. See §6.
5. **How Copilot bills fractional credits** — token counts rarely land on whole credits; no page states rounding behaviour or precision. Immaterial at slide altitude, but the cost-dial widget (#5) is choosing a rounding rule GitHub hasn't published.
6. **Whether Business/Enterprise seat prices themselves changed** on 2026-06-01 — out of scope here; I verified included *credits*, not seat cost.
7. **Post-2026-09-01 promotional treatment for *new* customers** — the boost is documented for "existing" Business and Enterprise customers over the first three months; what a customer signing today receives is not something I could confirm.
