# Token & embedding facts asserted on screen

**Question:** The two teaching slides (Tokens; live tokenizer + 3D embedding space) put factual claims on screen in front of executives. Which are defensible, what are the correct figures, and what is the shortest honest on-screen wording?

**Ticket:** [#22](https://github.com/atilileri/atilileri.github.io/issues/22) (child of map [#20](https://github.com/atilileri/atilileri.github.io/issues/20))

**Date:** 2026-07-29

---

## TL;DR verdict

Four of the five claims survive, one needs rewording, and one number is wrong.

| Claim on screen | Verdict |
| --- | --- |
| ~4 characters / ~¾ word per token | **Defensible only as an English-prose, OpenAI/Gemini-flavoured rule of thumb.** It is vendor-specific (Anthropic's own glossary says ~3.5 chars), and OpenAI's *current* developer docs explicitly call `characters / 4` inaccurate. Must be qualified on screen. |
| Token IDs are integers from a fixed vocabulary | **True and safe.** Primary-source confirmed. |
| "The model only ever sees numbers" | **True, and the best line on the slide** — but say *numbers*, not *integers*, because IDs become vectors immediately. |
| Embeddings are high-dimensional vectors, ~1024–3072 dims | **True.** 3072 (OpenAI `text-embedding-3-large`, Gemini) / 1024 (Voyage) are the right current figures. |
| "Similar meanings sit near each other" | **Fair for embeddings-API vectors. NOT fair for the raw token-embedding layer inside an LLM** — this is the one real trap on the slide. |

The single most important correction: **the deck must not imply the rotating 3D cloud shows what is inside the LLM.** The token-embedding layer inside an LLM and the vector from an embeddings endpoint are different objects with different semantics (§3). The honest framing is that the cloud illustrates *the idea of* meaning-as-geometry, which is what embedding *models* deliver.

The second most important correction, and the strongest argument for keeping the ratio vague: **Anthropic documents a ~30% token-count jump between its own model generations for identical text** ([Token counting](https://platform.claude.com/docs/en/build-with-claude/token-counting)). Any hard-coded chars-per-token figure on screen is a claim with a shelf life.

---

## 1. The ~4-characters / ~¾-word rule

### Where it comes from

It is **OpenAI marketing-docs folklore that happens to be roughly true for English**, later echoed by Google. The primary sources:

- **OpenAI Help Center, "What are tokens and how to count them?"** is the origin of the exact phrasing: *"1 token is approximately 4 characters or 0.75 words for English text."* It also gives the canonical worked example — `" tokenization"` splits into `" token"` + `"ization"`, while `" the"` is one token. (Sourcing caveat: `help.openai.com` and `platform.openai.com/tokenizer` both returned **HTTP 403** to my fetcher on 2026-07-29; this wording is from the search index's verbatim quotation of that page, not from my own read of it. Treat as high-confidence-but-unverified-by-me.)
- **tiktoken README** gives the mechanical basis, in bytes rather than characters: BPE *"compresses text (roughly 4 bytes per token on average)."* ([openai/tiktoken](https://github.com/openai/tiktoken)) This is the number the folklore is actually built on, and note the unit is **bytes**, not characters — the two coincide for ASCII and diverge sharply for everything else (see below).
- **Google, Gemini API "Tokens" docs**: *"For Gemini models, a token is equivalent to about 4 characters"* and *"100 tokens is equal to about 60-80 English words."* ([ai.google.dev/gemini-api/docs/tokens](https://ai.google.dev/gemini-api/docs/tokens)) Note Google's word ratio is **0.60–0.80 words/token**, i.e. a range, not the crisp 0.75.

### Where it does not hold

Four independent reasons the number moves, all primary-sourced:

1. **It is vendor-specific.** Anthropic's own glossary states: *"For Claude, a token approximately represents 3.5 English characters, though the exact number can vary depending on the language used."* ([Claude glossary](https://platform.claude.com/docs/en/about-claude/glossary)) That is a **~14% difference from OpenAI's 4** on the same English text.
2. **It is model-*version*-specific, and the swing is large.** Anthropic documents: *"Claude 4.7 and later models … use a newer tokenizer. The same input text produces approximately 30 percent more tokens than on earlier models."* ([Token counting](https://platform.claude.com/docs/en/build-with-claude/token-counting)) A 30% shift within one vendor's own lineup is bigger than the OpenAI-vs-Anthropic gap. Whatever ratio you print is true of *some* models.
3. **OpenAI itself now disowns the arithmetic.** The current developer docs on token counting state that *"estimates like `characters / 4` are inaccurate"* for real inputs, and that counts include *"formatting tokens used to represent request structure, such as message roles and boundaries"* which *"might not appear in the text … you tokenize locally."* ([Counting tokens](https://developers.openai.com/api/docs/guides/token-counting)) So even for English, the *billed* count exceeds the naive text estimate because of chat scaffolding.
4. **Non-English text is dramatically worse, and this is peer-reviewed.** Petrov et al., *"Language Model Tokenizers Introduce Unfairness Between Languages"* (NeurIPS 2023) finds *"the same text translated into different languages can have drastically different tokenization lengths, with differences up to 15 times in some cases"* — and that this persists in avowedly multilingual tokenizers; even character/byte-level models show *"over 4 times the difference."* ([arXiv:2305.15425](https://arxiv.org/abs/2305.15425)) Ahia et al., *"Do All Languages Cost the Same?"* (arXiv:2305.13707) makes the commercial consequence explicit across 22 languages: *"speakers of many supported languages are overcharged while receiving poorer results."*

**Code** is the case I could *not* pin to a clean primary figure. Directionally it is denser in tokens per character than prose — indentation, punctuation, `snake_case`/`camelCase` splits and rare identifiers all fragment — and o200k_base's splitting regex includes dedicated whitespace-run rules ([tiktoken_ext/openai_public.py](https://github.com/openai/tiktoken/blob/main/tiktoken_ext/openai_public.py)) precisely because code-shaped whitespace is worth compressing. But I found **no first-party published chars-per-token figure for code**, so the deck should not print one. Say "code and other languages run denser" and stop.

### Suggested on-screen wording

Primary (the qualifier line, replacing any bare "4 chars = 1 token"):

> **Rough rule: 1 token ≈ 4 characters ≈ ¾ of a word.**
> English prose only. Code and non-English text run denser — sometimes far denser.

Tighter, if space is short:

> ≈ 4 characters. ≈ ¾ of a word. **English prose — code and other languages cost more.**

If a single micro-caption is all that fits:

> ~¾ of a word, for English. Every model counts slightly differently.

Do **not** put a specific vendor ratio (3.5 vs 4) on screen — it invites a question you gain nothing by answering.

---

## 2. Token IDs and "the model only ever sees numbers"

### Are they integers from a fixed vocabulary?

**Yes, unambiguously.** tiktoken's README demonstrates it directly — `encode()` returns a sequence of integers, and the round-trip `enc.decode(enc.encode("hello world")) == "hello world"` holds, because BPE is *"reversible and lossless."* ([openai/tiktoken](https://github.com/openai/tiktoken)) The vocabulary is fixed at training time; the tokenizer is a lookup table of byte sequences to integer ranks.

### Vocabulary sizes (current, primary-sourced where possible)

| Tokenizer / vendor | Vocabulary | Confidence |
| --- | --- | --- |
| `cl100k_base` (GPT-4, GPT-3.5, `text-embedding-3-*`) | **100,257** (`explicit_n_vocab`), 5 special tokens | **Confirmed in source** — [openai_public.py](https://github.com/openai/tiktoken/blob/main/tiktoken_ext/openai_public.py) |
| `o200k_base` (GPT-4o, GPT-4.1, GPT-5, o1/o3/o4-mini) | **~200,000** | *Partly confirmed.* The source file defines special tokens `<\|endoftext\|>` = 199999 and `<\|endofprompt\|>` = 200018, but — unlike cl100k — **sets no `explicit_n_vocab`**. So "about 200k" is safe; a precise count is not officially published. Secondary sources cite 199,997 base tokens, and the `o200k_harmony` variant at 201,088. Do not print an exact figure. |
| Gemini | **Not published** | Google's token docs give no vocabulary size. |
| Anthropic / Claude | **Not published** | Anthropic ships no tokenizer library; the supported route is the free `POST /v1/messages/count_tokens` endpoint. A widely-cited 65K figure exists but is **reverse-engineered from generation streams, not official** — and is likely stale given the documented 4.7-generation tokenizer change. **Do not put a Claude vocabulary number on screen.** |

Model→encoding mappings above are from [tiktoken/model.py](https://github.com/openai/tiktoken/blob/main/tiktoken/model.py).

### Is "the model only ever sees numbers" accurate?

**Yes — this is the most defensible sentence on the whole slide,** and it is worth leaning on. The chain is: text → integer IDs (lossless, reversible) → vectors via an embedding lookup → floating-point arithmetic all the way to output logits → an integer ID sampled → decoded back to text. At no point does a character reach the network.

Two precision notes for the presenter, not the screen:

- Prefer **"numbers"** over **"integers."** The IDs are integers, but they survive as integers only for one lookup step; everything after is floats. "Numbers" is true throughout.
- The ID itself carries **no meaning** — it is an index, not a magnitude. Token 5000 is not "bigger than" or "between" tokens 4999 and 5001 in any semantic sense. If the slide displays IDs next to chips (it does), someone will ask. The meaning lives in the *vector the ID points at*, which is the natural hand-off into the embedding half of the slide.

### Suggested on-screen wording

> **Every token is just an index into a fixed vocabulary** — around 200,000 entries for a current frontier model.
> The model never sees your letters. It only ever sees numbers.

Micro-caption version, next to the ID chips:

> IDs are addresses, not values. Meaning lives in what they point at. →

That last line is a free segue into the embedding panel, so it earns its pixels twice.

---

## 3. Embeddings — and the distinction the slide must not blur

### What an embedding is, in one executive sentence

OpenAI's own definition is already executive-grade: an embedding is *"a vector (list) of floating point numbers,"* where *"the distance between two vectors measures their relatedness."* ([Embeddings guide](https://developers.openai.com/api/docs/guides/embeddings))

Rendered for a non-technical room:

> An embedding turns a piece of text into a long list of numbers — coordinates — chosen so that things that *mean* similar things land in similar places.

### Typical dimensionality (current, 2026)

| Model | Default dims | Range |
| --- | --- | --- |
| OpenAI `text-embedding-3-large` | **3072** | shortenable via `dimensions` param |
| OpenAI `text-embedding-3-small` | **1536** | shortenable |
| Google `gemini-embedding-2` / `-001` | **3072** | 128–3072; 768 / 1536 / 3072 recommended |
| Voyage `voyage-4`, `-4-large`, `voyage-code-3` (Anthropic-adjacent) | **1024** | 256 / 512 / 1024 / 2048 |

Sources: [OpenAI embeddings](https://developers.openai.com/api/docs/guides/embeddings), [Gemini embeddings](https://ai.google.dev/gemini-api/docs/embeddings), [Voyage embeddings](https://docs.voyageai.com/docs/embeddings).

**On-screen: say "hundreds to thousands of dimensions," or cite 1536/3072 as examples.** A single universal number does not exist — and all three vendors now ship *variable* dimensionality via Matryoshka Representation Learning, which Google names explicitly: models *"trained using the Matryoshka Representation Learning (MRL) technique"* learn embeddings whose *prefixes* remain useful. OpenAI describes the same capability behaviourally — you can *"shorten embeddings … without the embedding losing its concept-representing properties,"* with `text-embedding-3-large` truncated to **256 dims still outperforming full-size `ada-002`**. So dimensionality is a dial, not a property.

### The distinction: LLM-internal token embeddings vs the embeddings API

**This is the part the slide must get right.** They are both "embeddings" and both are learned vectors, but they are different objects. Four differences, in the order that matters:

| | Token-embedding layer *inside* an LLM | Vector from an **embeddings API** |
| --- | --- | --- |
| **Unit** | One vector **per token** (a subword fragment — `"ization"`) | One vector per **whole text** (sentence, paragraph, document) |
| **Context** | **Context-free.** A lookup table: token ID *n* always returns row *n*, regardless of surrounding words | **Contextual.** The whole input is encoded, then pooled into one vector |
| **Trained for** | Next-token prediction — a *starting point* for 100+ layers of computation | **Similarity directly**, via contrastive training |
| **Shape** | `[vocab_size × d_model]`, e.g. GPT-2 small = `[50257 × 768]` | `[1 × dims]`, e.g. `[1 × 3072]` |

The internal layer is genuinely just a lookup table — in reference implementations it is literally `nn.Embedding(config.vocab_size, config.n_embd)`, one row per vocabulary entry, and the forward pass is an index operation rather than a matrix multiply. (GPT-2 is the cleanest publicly-documented example: 50257 × 768. Frontier models do not publish `d_model`, but the architecture is the same.)

**Why conflating them is a factual error, not just imprecision.** Two peer-reviewed results:

1. **The internal space is not organised for similarity.** Ethayarajh, *"How Contextual are Contextualized Word Representations?"* (arXiv:1909.00512) finds *"the contextualized representations of all words are not isotropic in any layer"* — the space is **anisotropic**, so cosine similarity between arbitrary vectors is inflated by a shared dominant direction and does not cleanly mean "related." Nearness in a raw LM representation space is not nearness in meaning.
2. **You cannot get a good similarity vector by averaging internal ones.** Reimers & Gurevych, *Sentence-BERT* (arXiv:1908.10084) measured exactly that: naively averaging BERT's token vectors scores **54.81** on semantic-similarity benchmarks and the `CLS` token scores **29.19** — both **worse than averaging 2014-era GloVe vectors at 61.32**, while purpose-trained SBERT reaches **76.55**. The lesson: "meaning geometry" is a property that *dedicated embedding training* creates. It is not free inside an LLM.

So the slide's clustered 3D cloud is a picture of what an **embedding model** produces. It is *not* a picture of the lookup table inside the chat model — and if the deck implies otherwise, a technical audience member can correctly call it wrong.

**The good news for the deck:** the honest version is also the simpler story, and it needs no new slide real estate. Do not attempt to teach the distinction. Just avoid asserting the false half — never say "this is what's inside the model" or "this is how the LLM stores meaning." Say the neutral, true thing: *this is how meaning becomes math.*

### Suggested on-screen wording

Primary:

> **Embeddings: meaning as coordinates.**
> Each token becomes a point in a space of ~1,500–3,000 dimensions.
> Related things end up close together.

If the deck ever wants one line of credit for the distinction (optional, presenter-notes is fine):

> Search and retrieval use purpose-built embedding models. A chat model has its own internal version — related idea, different job.

Wording to **avoid** on screen:

- ~~"This is what the model stores"~~ / ~~"inside the model's brain"~~ — asserts the conflation.
- ~~"The model looks up meaning here"~~ — the lookup is real but is context-free and pre-semantic.
- ~~"3 dimensions"~~ as though real — see §4.

---

## 4. Semantic geometry, and the projection caveat

### Is "similar meanings sit near each other" fair?

**Yes, for embeddings-API vectors — it is the defining design property, not a metaphor.** OpenAI states it flatly: *"the distance between two vectors measures their relatedness,"* with **cosine similarity** the recommended measure (and because their vectors are normalised to length 1, cosine and Euclidean rankings coincide). Google frames embeddings as enabling *"semantic search, classification, and clustering, providing more accurate, context-aware results than keyword-based approaches"* — all of which are only possible if nearness tracks meaning.

Two honest qualifications:

- **"Similar" means "similar for the task the model was trained on."** Contrastive training targets *relatedness*, which is not identity — antonyms often sit close (`hot`/`cold` share a topic), and Voyage ships domain-specific variants (`voyage-code-3`, `voyage-law-2`, `voyage-finance-2`) precisely because "similar" is domain-relative. Fine for the slide; do not over-claim precision.
- **It is not true of raw LM internals** — see §3, anisotropy.

### The projection caveat

A 3D (or 2D) view of a 1536- or 3072-dimensional space is **lossy in specific, well-documented ways**. The canonical primary source is Wattenberg, Viégas & Johnson, *"How to Use t-SNE Effectively"* (Distill, 2016):

- *"you cannot see relative sizes of clusters in a t-SNE plot"* — the algorithm expands dense clusters and contracts sparse ones.
- *"distances between well-separated clusters in a t-SNE plot may mean nothing."*
- **Random noise can look like structure**: on genuinely random high-dimensional data, a plot *"seems to show dramatic clusters."*
- Different random runs *"can yield markedly different diagrams."*

That third point is the one with teeth for this deck, and it cuts in a *helpful* direction: **a projection of random high-dimensional data looks a lot like a projection of real embeddings.** Which means the deck's pseudo-cloud is not merely a permissible cheat — a 3D scatter is a *visually honest* rendering of what such projections actually look like. The dishonesty would be claiming the axes mean something. They don't in the real thing either.

### Suggested on-screen wording

Primary:

> **Similar meanings land near each other.**
> Real spaces have thousands of dimensions. This is a 3D shadow of one.

Alternative phrasings, same content:

> Thousands of dimensions, flattened to three. The clustering is the point; the axes aren't.

Or the shortest:

> A 3D shadow of a 1,536-dimensional space.

"Shadow" is doing real work here: it concedes lossiness without requiring the word "lossy," and an executive audience gets it instantly.

---

## 5. Honesty framing for a deliberately-pseudo demo

### The deck's existing precedent

The current tokenizer slide (`data-tokenizer`, `src/pages/decks/asml-ai/index.astro`) reads:

```html
<p class="tok-note">
  Client-side estimate (&asymp; chars &divide; 4). A shipping deck swaps
  in a real BPE tokenizer.
</p>
```

**What this gets right, and should be preserved:** two sentences; states the mechanism (`chars ÷ 4`); names what the real thing would be ("a real BPE tokenizer"); uses `≈` as a visual honesty marker; and — the key move — frames the gap as a **deliberate scope decision**, not a shortcoming. "A shipping deck swaps in…" signals *we know, we chose*. That is what keeps a demo credible.

**One thing worth changing:** "A shipping deck swaps in a real BPE tokenizer" is subtly self-deprecating — it concedes the current deck is *not* shipping. For an executive audience the confident register is better: state the trade, don't apologise for it.

### The principle

The shortest credible disclaimer does three things and nothing more: **(a) name the mechanism, (b) name what's real about it, (c) frame the simplification as chosen.** A disclaimer undercuts a demo only when it apologises. Naming a limit precisely reads as *command of the material* — the presenter who says "this is approximate, here's exactly how" is trusted more than the one who says nothing, not less. Length is the enemy: past roughly two short lines it stops reading as confidence and starts reading as a hedge.

### Suggested on-screen wording

**For the new live tokenizer + embedding slide** (consistent with `tok-note` — same two-sentence shape, same `≈`, same mechanism-then-frame order):

> Approximate tokenizer (≈ chars ÷ 4), illustrative embedding space. **The counting is real; the geometry is a sketch.**

That second sentence is the load-bearing one. It splits the demo into a part that genuinely works (the count scales with your typing, live, in the browser) and a part that is openly a drawing — so the audience knows exactly how much to trust, and the live half gains credibility from the concession.

Shorter variants:

> ≈ Real arithmetic, illustrative geometry. No model was called.

> Approximate tokenizer, illustrative space — the shape of the idea, not a live model.

**"No model was called" is worth considering as a standing footer for the whole deck.** In an ASML executive room it pre-empts the obvious question (*is this hitting an API? what happened to what I typed?*) and converts the fully-static constraint from an apology into a feature. The existing slide's presenter note already makes this point — *"Typing here never leaves the browser"* — which is a genuinely reassuring fact currently hidden in the notes. Consider promoting it.

**If the existing `tok-note` is ever revisited** (out of scope for map #20, which explicitly rules out edits to the existing slides — noted here only so the wording exists if Atil wants it during deduplication):

> Client-side estimate (≈ chars ÷ 4). Real tokenizers are per-model — Claude and GPT don't count the same text the same way.

That version replaces the self-deprecating clause with a *substantive fact* (§1), so the caveat teaches something instead of merely conceding.

---

## Cross-cutting: what NOT to put on screen

| Don't say | Because |
| --- | --- |
| A precise `o200k_base` vocabulary count | Not officially published; `explicit_n_vocab` is absent from the source. "~200,000" is safe. |
| Any Claude vocabulary size | Never published; the circulating 65K is reverse-engineered and likely stale. |
| "4 characters per token" unqualified | Vendor- and version-specific; Anthropic says 3.5, and documents a ~30% generation-over-generation shift. |
| "This is what's inside the model" (of the 3D cloud) | Conflates the internal lookup table with embedding-model output. Factually wrong (§3). |
| A single "embeddings are N-dimensional" figure | Dimensionality is now a runtime dial (MRL) — 128 to 3072 on the same model. |
| "Tokens are words" | The whole point of the shatter animation is that they aren't. |

---

## Sources

Primary, all fetched 2026-07-29 unless noted.

**Tokenization**
- [openai/tiktoken — README](https://github.com/openai/tiktoken) — BPE, integers, lossless, "roughly 4 bytes per token"
- [tiktoken_ext/openai_public.py](https://github.com/openai/tiktoken/blob/main/tiktoken_ext/openai_public.py) — `explicit_n_vocab`, special tokens, o200k splitting regex
- [tiktoken/model.py](https://github.com/openai/tiktoken/blob/main/tiktoken/model.py) — model→encoding map
- [OpenAI — Counting tokens](https://developers.openai.com/api/docs/guides/token-counting) — disowns `characters / 4`; formatting tokens
- [OpenAI Help Center — What are tokens and how to count them?](https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them) — the 4-chars/0.75-words origin (**HTTP 403 to my fetcher; quoted via search index, not verified directly**)
- [Gemini API — Tokens](https://ai.google.dev/gemini-api/docs/tokens) — ~4 chars/token; 100 tokens ≈ 60–80 words
- [Claude glossary](https://platform.claude.com/docs/en/about-claude/glossary) — ~3.5 English chars/token; tokens definition
- [Claude — Token counting](https://platform.claude.com/docs/en/build-with-claude/token-counting) — **~30% more tokens on Claude 4.7+ tokenizer**; `count_tokens` is the supported route
- Petrov et al., [Language Model Tokenizers Introduce Unfairness Between Languages](https://arxiv.org/abs/2305.15425), NeurIPS 2023 — up to **15×** cross-language disparity
- Ahia et al., [Do All Languages Cost the Same?](https://arxiv.org/abs/2305.13707) — 22 languages; commercial overcharging

**Embeddings**
- [OpenAI — Embeddings guide](https://developers.openai.com/api/docs/guides/embeddings) — definition; 1536/3072; cosine; truncation
- [Gemini API — Embeddings](https://ai.google.dev/gemini-api/docs/embeddings) — `gemini-embedding-2`, 128–3072, MRL
- [Voyage AI — Embeddings](https://docs.voyageai.com/docs/embeddings) — voyage-4 family, 1024 default
- Reimers & Gurevych, [Sentence-BERT](https://arxiv.org/abs/1908.10084) — pooling; **54.81 / 29.19 / 61.32 / 76.55**
- Ethayarajh, [How Contextual are Contextualized Word Representations?](https://arxiv.org/abs/1909.00512) — anisotropy in every layer
- Wattenberg, Viégas & Johnson, [How to Use t-SNE Effectively](https://distill.pub/2016/misread-tsne/), Distill 2016 — projection artefacts

**Deck**
- `src/pages/decks/asml-ai/index.astro` — existing `data-tokenizer` slide and `tok-note` caveat

### Confidence notes

- The OpenAI Help Center quote is the one claim I could not verify by direct fetch (403). It is corroborated by Gemini's independently-published ~4-chars figure and tiktoken's ~4-bytes-per-token, so the *substance* is safe even if the exact phrasing is off.
- The exact `o200k_base` vocabulary count is **genuinely not published**. Secondary sources say 199,997; I could not confirm it and the deck should not assert it.
- Claude's vocabulary size and `d_model` for any frontier model are **not public**. GPT-2's 50257 × 768 is used above only as the publicly-documented illustration of the layer's *shape*.
- No first-party chars-per-token figure for **code** was found. Direction (denser) is safe; a number is not.
