# Does terse, ungrammatical prompting actually pay?

**Question:** `privates/best-prac/concise.md` argues for *"sacrifice grammar for the sake of concision"* when prompting coding agents — telegraphic shorthand, no pleasantries, raw imperatives — on the grounds that it (a) maximizes context-window efficiency, (b) aligns with LLM training data, (c) eliminates conversational overhead, (d) reduces semantic noise. Does it hold up, and what share of a real session's tokens is the human's own prose?

**Date:** 2026-08-05 · **Ticket:** [#47](https://github.com/atilileri/atilileri.github.io/issues/47) · **Map:** [#42](https://github.com/atilileri/atilileri.github.io/issues/42)

---

## TL;DR verdict

**The practice is harmless. The reason given for it is wrong, and it is wrong by two orders of magnitude.**

I measured 72 real Claude Code sessions from this machine. **The human's own typed words are a median of 0.27% of the peak context window** — and 0.004% of all tokens the model actually processes across a session. Tool output and file contents are 90% of the transcript. Writing telegraphically to "preserve precious context space" saves, in the median session, **about 100 tokens out of 84,000**. One `Read` of one medium file costs more than every word the human types in an entire session, by roughly 69:1.

So reason (a) — the note's headline justification — is quantitatively false. Reasons (b) and (c) are unsupported by any vendor or paper I could find. Reason (d) is the only defensible one, and it is defensible in a *weaker* form than stated: **specific beats verbose, but specific does not mean ungrammatical.** Every major vendor's published guidance points the opposite way from "drop the grammar" — they uniformly tell you to be *explicit*, give context and motivation, and treat the model as a capable new colleague who does not know what you know.

The honest one-liner for the slide is therefore not "be terse" but something like: **"Cut the padding, not the specifics — the model has no idea what you left out."** The tokens were never the point; ambiguity is.

---

## 1. The measurement: how much of the window is actually your prose?

This is the part the note gets wrong, so it goes first, and it is measured rather than argued.

### Method

Claude Code writes every session to a JSONL transcript under `~/.claude/projects/<project>/<session>.jsonl`. Each assistant entry carries a `message.usage` object with `input_tokens`, `cache_read_input_tokens` and `cache_creation_input_tokens`. Those three summed are the **true size of the context window on that request** — vendor-reported, not estimated. (`cache_read` + `cache_creation` are the cached portion of the same window; see [Anthropic prompt caching docs](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching).)

Against that I counted the human's own typed prose: `role: "user"` entries that are genuine typed text, excluding `tool_result` blocks, `isMeta` entries, and synthetic wrappers Claude Code injects into the user turn (`<system-reminder>`, `<command-name>`, `<local-command-stdout>`, `<bash-input>`, hook output). Prose was converted to tokens at 4 chars/token, the standard English approximation — and this is a *generous* estimate for the practice under test, since it slightly over-counts prose.

Filter: sessions with a peak context above 20k tokens, at least 2 human messages and at least 5 assistant turns — i.e. real working sessions, not one-shot pokes. **72 sessions qualified.** The analysis script is not committed; it is reproducible from the description above.

### Results

| Measure | Median | Mean | Worst case for the practice |
|---|---|---|---|
| Human prose as share of **peak context window** | **0.27%** | 0.50% | 4.01% |
| Human prose as share of **cumulative tokens processed** | **0.01%** | 0.02% | 0.77% |
| Human prose per session | 209 tokens | — | — |
| Peak context per session | 84,098 tokens | — | — |
| Human messages per session | 5 | — | — |
| Average human message | ~167 chars (~42 tokens) | — | — |

Restricting to the **interactive-heavy** subset (≥10 human messages, n=16) — the sessions where a human is genuinely conversing, which is the practice's best case — the median share rises only to **0.38%**, with a maximum of 2.16%.

Pooled across all 72 sessions: **35,830 tokens of human prose** against **837 million tokens of cumulative model input** (0.004%).

### What the window is actually made of

Breaking down the transcript content itself (i.e. excluding the system prompt, tool definitions and `CLAUDE.md`, which are additional fixed overhead and would only shrink the human's share further):

| Component | Share of transcript |
|---|---|
| Tool results (file contents, command output, search hits) | **52.1%** |
| Tool calls (the agent's own arguments — file paths, patches, search queries) | **38.4%** |
| Assistant prose | 8.1% |
| **The human's typed words** | **1.4%** |

Median tool-result volume per session is **14,497 tokens** against **209 tokens** of human prose — a ratio of about **69:1**.

### The consequence

If you rewrote every prompt in a median session in perfect telegraphic shorthand and achieved an aggressive 50% compression, you would save **~100 tokens** in a window that peaks at **84,000**. That is 0.13% of the window — well inside the noise of a single extra file read. The context-efficiency argument is not merely weak; it is off by roughly two orders of magnitude.

Two honest caveats. First, this is one practitioner's corpus on one project — a documentation- and deck-heavy Astro repo, driven with heavy subagent and tool use. A workflow with long pasted specs would push the human share up, but pasted specs are not the thing grammar-dropping compresses. Second, the 4 chars/token conversion is approximate; even a 2x error leaves the conclusion untouched.

---

