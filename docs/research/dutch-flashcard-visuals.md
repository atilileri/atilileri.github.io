# Generated Flashcard Visuals for the Dutch Journey

**Question:** What is actually available for generating flashcard visuals that resemble the user's own daily life — a recurring, recognisable cast in personal scenes (the user's example: *a card for a fruit word showing me asking for that fruit in a grocery store*)? What does it cost, what holds a character stable across hundreds of cards, what does publishing them in a public repo commit us to, and is a text-only card a better answer?

**Date:** 2026-08-16

**Ticket:** [#81](https://github.com/atilileri/atilileri.github.io/issues/81), part of map [#74](https://github.com/atilileri/atilileri.github.io/issues/74)

---

## TL;DR verdict

**Nothing on this machine can generate an image today.** Not the Claude Code harness, not the Anthropic API, not an MCP server, not a local model — verified by direct inspection, not assumed (§1). Every image path starts with the user creating an account and a billing relationship with Google or OpenAI. That is a "could sign up for it", not a "can do it today".

**If he does sign up, the money is not the obstacle.** A hundred cards is **$3.90 to $21.10** in raw API calls depending on model, and roughly **$12–$60** once you allow for the retries that consistency work actually needs (§2, §7). That is cheap.

**The obstacle is consistency, and it is real.** A recurring cast in recognisable scenes is the single hardest thing to ask of these APIs. The vendors ship reference-image mechanisms for exactly this — Gemini 3 Pro Image accepts up to **5 character reference images** per request — but a reference-image mechanism is a *bias*, not a *guarantee*. There is no seed-lock, no character checkpoint, no "same person" primitive. Every card is an independent sample that must be looked at by a human and re-rolled when the face drifts. At a hundred cards that is a hundred human judgements; at "hundreds" it is a part-time job (§3).

**Republishing is legally fine but not free of strings.** Google explicitly does not claim ownership of generated content, and OpenAI assigns its interest in Output to the user — so publishing to a public repo is permitted by both (§4). Two strings: every Gemini image carries a **SynthID watermark** by design, and per the US Copyright Office the outputs are likely **not copyrightable** by the user, because "the mere provision of prompts" does not confer authorship. For a repo that is already published in public with no commercial claim, both are footnotes rather than blockers.

**Repo size is a manageable cost that is permanent.** ~10 MB per hundred cards at this repo's own observed WebP sizes; git keeps every regenerated version forever (§5). Survivable, but it is the one decision on this ticket that cannot be undone.

**The recommendation is text-first, and this is not a consolation prize.** The user's own example gives it away: *"me asking for that fruit in a grocery store"* is **a scene, i.e. a sentence**. The picture is one rendering of it; the sentence is the thing. A written micro-scene is free, instant, perfectly consistent across hundreds of cards by construction, editable, diffable, searchable, translatable into both TR and EN as the map locks require, weighs ~200 bytes, and — decisively — is *in the target language*, which an image can never be. `teach`'s glossary philosophy points the same way: it is "a record of compressed knowledge, not a dictionary the user reads to learn". Compressed knowledge is text (§6).

**Proposed decision for the map: text-first cards now; images stay open as a later, opt-in enrichment on a small subset of cards.** Not "no images ever" — "images are not on the critical path, and nothing should be built that requires them."

---

## 1. What is actually reachable on this machine

Everything in this section was checked directly on the machine, not inferred.

| Path | Status | Evidence |
|---|---|---|
| Claude Code harness | **No image generation tool exists.** The tool surface is file/search/web/agent tools plus `Artifact` (which publishes HTML/Markdown pages, not raster images). | This session's own tool list |
| Anthropic API | **Cannot generate images at all.** | Anthropic's own docs, quoted below |
| API keys in the environment | **None.** `env` filtered for `api_key|token|openai|anthropic|google|gemini|replicate|stability|fal|azure|aws|bedrock|vertex` returns only Claude Code's own internal `CLAUDE_CODE_*` handles and a VS Code CLI token. No provider credential. | `env` grep |
| `~/.claude/settings.json` | Five keys — `model`, `effortLevel`, `theme`, `switchModelsOnFlag`, `remoteControlAtStartup`. No env block, no credentials. | `/home/neo/.claude/settings.json` |
| Repo `.claude/settings*.json` | Only `settings.local.json`, and it is **permissions-only** — an `allow` list of Bash/WebFetch patterns. No env, no keys, no MCP. | `/home/neo/projects/atilileri.github.io/.claude/settings.local.json` |
| MCP servers | **None configured.** | `claude mcp list` → `No MCP servers configured.` |
| Image CLIs | **None installed** — no `openai`, `gemini`, `ollama`, `magick`, `convert`. Not even ImageMagick. | `command -v` for each |
| Python image/gen libraries | **None** — `openai`, `anthropic`, `google.generativeai`, `replicate`, `diffusers`, `torch`, `PIL` all absent. Only `requests` is present. | `importlib.util.find_spec` per module |
| Local model on GPU | **Not possible.** No `nvidia-smi`, no `torch`. | `command -v nvidia-smi` |

On the Anthropic API specifically, the documentation is unambiguous. Its vision page answers the question in its own FAQ:

> **Can Claude generate or edit images?** No, Claude is an image understanding model only. It can interpret and analyze images, but it cannot generate, produce, edit, manipulate, or create images.
>
> — [Anthropic, Vision](https://platform.claude.com/docs/en/build-with-claude/vision)

Claude accepts images as *input* (base64, URL, or Files API `file_id`) and reasons about them. There is no generation endpoint anywhere in the API surface — not in Messages, not in the server-tool set, not in Managed Agents.

**One generation path *is* reachable today, and it is worth naming.** The repo has `sharp` and `playwright` installed (`/home/neo/projects/atilileri.github.io/package.json` lists both; both are present under `node_modules/`). An agent can *write* SVG or HTML and rasterise it locally at zero cost and with perfect determinism. That covers diagrams, typographic cards, icon-ish schematics, and layout — it does **not** cover "a photorealistic-ish scene of me in a grocery store". If the visual need turns out to be structural rather than illustrative, this path needs no account, no key, and no money.

**Conclusion for the ticket:** today the answer is *no images*. The rest of this document is about what changes if the user opens an account.

---

## 2. What generation would cost, from the vendors' own pricing pages

Both vendors publish per-image pricing. Neither offers a free tier for image generation.

### Google (Gemini API)

From [Google's Gemini API pricing page](https://ai.google.dev/gemini-api/docs/pricing):

| Model | Output price | Free tier |
|---|---|---|
| **Gemini 2.5 Flash Image** ("Nano Banana") | **$0.039 per image** | Not available |
| **Gemini 3 Pro Image** ("Nano Banana Pro") | **$0.134 per 1K/2K image**, **$0.24 per 4K image** | Not available |

Input is billed separately ($0.30/M for Flash Image; $2.00/M text+image for 3 Pro, which the page annotates as "$0.0011 per image" of reference input). The **Batch API halves every one of these figures** in exchange for up to 24-hour turnaround — $0.0195/image on Flash Image, $0.067 on 3 Pro at 1K/2K. For a flashcard deck that nobody is waiting on, batch is the obviously correct mode and it is a genuine 50% cut.

### OpenAI

[OpenAI's pricing page](https://developers.openai.com/api/docs/pricing) lists `gpt-image-2`, `gpt-image-1.5`, `gpt-image-1-mini`, `gpt-image-1`, and `chatgpt-image-latest`, and prices them **per million tokens** rather than per image (e.g. `gpt-image-2` at $8.00 image input / $30.00 output per 1M), directing readers to the calculator in the image guide for per-image figures. The [image generation guide](https://developers.openai.com/api/docs/guides/image-generation) does carry the per-image table; the figure that matters here is **`gpt-image-2` at high quality, 1024×1024: $0.211 per image** (portrait/landscape come in cheaper at $0.165). Note also that `gpt-image-1` — the model most third-party writing still names — **is being retired on 2026-10-23**, so it is not a model to build on.

### Cost per hundred cards, raw API spend

| Model | 100 cards, one shot each | With batch (Google only) |
|---|---|---|
| Gemini 2.5 Flash Image | **$3.90** | **$1.95** |
| Gemini 3 Pro Image (1K/2K) | **$13.40** | **$6.70** |
| OpenAI `gpt-image-2` (high, 1024²) | **$21.10** | n/a |

**These one-shot figures are not the real cost, and it would be dishonest to present them as such.** Consistency work means generating, looking, rejecting, and re-rolling. A 2–4× multiplier is the realistic band for a deck that has to keep one recognisable cast — which puts a hundred cards at roughly **$8–$55** in API spend. That is an estimate from the mechanics in §3, not a vendor-published number, and should be treated as such. Either way the conclusion is the same: **money is not the constraint on this ticket. Attention is.**

---

## 3. Consistency across hundreds of cards — the whole premise, and the honest limits

This is the part that decides the ticket. A one-off illustration is trivially easy; *the same person, recognisable, in a hundred different scenes* is the hard problem in this field.

### What the vendors actually ship for it

Google's image-generation documentation treats character consistency as a first-class feature with **explicit, model-dependent budgets** for reference images ([Gemini API, Image generation](https://ai.google.dev/gemini-api/docs/image-generation)):

| Model | Reference-image budget |
|---|---|
| Gemini 3 Pro Image | up to 6 object images **+ 5 character images** for consistency |
| Gemini 3.1 Flash Image | up to 10 object images **+ 4 character images** for consistency |
| Gemini 3.1 Flash Lite Image | up to 14 images, **objects only — no character-consistency feature**, and "not optimized for multiple reference inputs or multi-turn sequential editing" |

That last row is the useful one: the vendor itself distinguishes models that *have* a character-consistency mechanism from one that does not. It is a real capability, not marketing.

OpenAI's equivalent is less structured. Its guide says "You can use one or more images as a reference to generate a new image", and the edits endpoint accepts multiple input images in one request; the Responses API additionally supports multi-turn editing where you "iteratively make high fidelity edits to images with prompting". Notably, **the guide does not explicitly frame reference images as a subject-consistency mechanism** the way Google's does.

### The techniques that actually exist, and what each is worth

1. **Reference images (the strongest lever).** Pin 3–5 canonical shots of the cast member and pass them on every request. This is what the budgets above are for, and it is the only mechanism that is a genuine vendor feature rather than a prompting trick.
2. **A frozen character sheet in the prompt.** A fixed paragraph of invariant description — same wording, every card, never edited mid-deck. Cheap, and it does real work, but words underdetermine a face.
3. **A frozen style block.** Same trick applied to medium, palette, lighting, framing. **Style is markedly easier to hold stable than identity** — a consistent illustration style across a deck is close to a solved problem; a consistent *face* is not.
4. **Iterative editing from a parent image.** Generate scene *n+1* by editing scene *n* rather than generating fresh. Preserves identity best; accumulates artefacts and drifts slowly across a long chain, so it needs periodic re-anchoring to the originals.
5. **Batching and human review.** The only mechanism that actually catches drift.

### The honest limits

- **There is no seed lock and no identity guarantee.** Neither vendor exposes a "same character" primitive that is deterministic. Reference images *bias* the sample; they do not constrain it. Two calls with byte-identical inputs can produce visibly different people.
- **Drift is silent.** Nothing in the API tells you the face slipped. Only a human looking at the card can tell, which is why the review burden — not the API bill — is the real cost at scale.
- **Reference budgets are small.** Five character images is enough to fix a look approximately, not exactly, and it does not scale to a cast of several recurring people plus a recurring setting.
- **Long decks compound the problem.** Errors do not average out. Card #300 has no memory of card #1 unless you keep re-anchoring to the same canonical references — which is the mitigation, and it caps how far the scene can travel from those references.
- **"Resembles the user"** is the hardest variant of all, and it carries its own decisions: it requires the user's likeness in the pipeline, and — see §4 — the result is published in a public repo forever.

**Verdict on consistency:** technically achievable at "good enough to be recognisable", with reference images plus frozen prompt blocks plus human review, on Gemini 3 Pro Image or 3.1 Flash Image. **Not achievable unattended.** Any design that assumes an agent can mint a card with a picture as part of a lesson, with no human in the loop, is assuming something the APIs do not offer.

---

## 4. Publishing generated images in a public repo

The repo is public and everything in it is published — that is locked by map #74. So the licensing question is not academic: every generated image gets republished.

### May the output be republished? Yes, from both vendors.

**Google.** The [Gemini API Additional Terms of Service](https://ai.google.dev/gemini-api/terms) state that **"Google won't claim ownership over that content"** — the content the user generates. The terms attach responsibility rather than restriction: the user must "comply with applicable law in using generated content, which may require the provision of attribution to your users", is responsible for their use and for others' use of content they share, and is advised to "exercise caution before publishing or relying on generated material". There is no prohibition on commercial use or on public republication. Google's terms also draw a **paid/unpaid line that matters for a public learning journal**: on *unpaid* services Google uses prompts and responses to improve its products and human reviewers may read them; on *paid* API quota it does not. Users in the EU/Switzerland/UK get the paid-service protections either way. The user is in the Netherlands, so this distinction is largely moot for him — but if the pipeline ever runs elsewhere, use paid quota.

**OpenAI.** OpenAI's Terms of Use assign output to the customer: *"As between you and OpenAI, and to the extent permitted by applicable law, you (a) retain your ownership rights in Input and (b) own the Output. We hereby assign to you all our right, title, and interest, if any, in and to Output."*

> ⚠️ **Sourcing caveat.** `openai.com/policies/*` returned **HTTP 403** to every fetch attempt in this session — both the tooling fetcher and a browser-UA `curl`. The OpenAI quotation above is therefore reproduced from the search index's verbatim quotation of that page, **not** from a page I opened myself. Treat it as high-confidence but unverified-by-me, and re-read the live terms before relying on it. Everything else in this document is from pages I fetched directly.

### Two strings attached

**1. Every Gemini image is watermarked, by design.** The image-generation docs state flatly: **"All generated images include a SynthID watermark."** SynthID is an invisible signal embedded in pixel frequency values, engineered to survive cropping, resizing, recolouring, format conversion and JPEG compression. There is no API switch to turn it off. A published card is therefore permanently, machine-detectably marked as AI-generated. **For a public learning journal, this is arguably a feature rather than a cost** — the map's whole posture is learning in public and being honest about the process. It is only a problem for someone trying to pass the images off as hand-made, which is not this project. (Third-party watermark-removal tools exist; using them on a public "learning in public" repo would be actively against the project's stated ethos, and this document does not recommend it.)

**2. The user probably does not own copyright in the results.** The US Copyright Office's *Copyright and Artificial Intelligence, Part 2: Copyrightability* (published 2025-01-29) concluded that **"the mere provision of prompts"** does not make an output copyrightable; human creativity must determine the expressive elements. Using AI as an assistive tool does not bar protection, but the creative decisions have to be human. Practically: the cards can be published freely, and third parties may well be free to reuse them. For this repo — which publishes everything anyway and asserts no commercial claim over its illustrations — that is a footnote, not a blocker. It *would* matter if the deck were ever to be sold or licensed.

---

## 5. Repo size, and what Astro offers

### The measured baseline

| Measure | Value |
|---|---|
| `.git` directory today | **27 MB** |
| Working tree (excluding `.git` and `node_modules`) | **7.8 MB** |
| GitHub per-file warning / hard block | **50 MiB warning, 100 MiB blocked** ([GitHub docs](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)) |
| GitHub repo size guidance | "We recommend repositories remain small, ideally **less than 1 GB**, and **less than 5 GB** is strongly recommended" (same page) |
| GitHub Pages published site | "may be **no larger than 1 GB**"; source repo has a "recommended limit of 1 GB"; 100 GB/month soft bandwidth ([GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)) |

### What a deck would actually add

The repo's own existing images are the right yardstick, since they are real web illustrations at real quality (`/home/neo/projects/atilileri.github.io/public/images/blog/`):

- `beyond-the-blink-...webp` — **32 KB**
- `deconstructing-rag-...webp` — **103 KB**
- `radical-reality.png` — **730 KB** (PNG, unoptimised — the cautionary example)
- `prof.png` — **419 KB**

At WebP, call it **~100 KB per card** as a working figure:

| Deck size | Added bytes |
|---|---|
| 100 cards | ~10 MB |
| 500 cards | ~50 MB |
| 2,000 cards | ~200 MB |

Even the pessimistic row stays inside GitHub's guidance. **Nothing here breaks the repo.**

**The real hazard is not the total; it is that git history is append-only.** Compressed image formats do not delta-compress, so every version of every card is stored in full, forever. A card regenerated four times to fix character drift is four permanent copies, not one — and §3 says regeneration is the *normal* case, not the exception. So the honest figure is not "10 MB per hundred cards" but "10 MB per hundred cards **times the average number of accepted versions over the project's life**". This is the one decision on this ticket that is genuinely irreversible: text can be rewritten in place at near-zero cost forever; committed binaries cannot be un-committed without rewriting history.

Two mitigations if images ever go ahead: **commit only accepted finals** (do the reject-and-reroll loop outside the repo), and **never commit unoptimised PNGs** — the 730 KB `radical-reality.png` above is 7× a comparable WebP.

### Astro's image handling

From [Astro's images guide](https://docs.astro.build/en/guides/images/), the decision that matters is *where the file lives*:

> "We recommend that local images are kept in `src/` when possible so that Astro can transform, optimize, and bundle them. Files in the `public/` directory are always served or copied into the build folder as-is, **with no processing**."

- Images in `src/` used through the `<Image />` component are optimised and format-converted (WebP, AVIF) at build time, with `width`/`height` set automatically to prevent layout shift. `getImage()` does the same programmatically for non-HTML destinations.
- Build artefacts are cached in `./node_modules/.astro`, so rebuilds reuse work.
- Remote images can be optimised too, but only from hosts authorised via `image.domains` / `image.remotePatterns`.

**This repo is currently on the wrong side of that line for a card deck.** Every existing image sits in `public/` (`/home/neo/projects/atilileri.github.io/public/images/...`), which means none of them is being optimised by Astro at all — consistent with the unoptimised 730 KB PNG. `astro.config.mjs` configures `mdx`, `sitemap`, and Tailwind, and sets no `image` options. `sharp` is already a dependency, so the optimisation path is available; it is simply unused. **If cards ever carry images, they belong in `src/assets/` behind `<Image />`, not in `public/`.**

A further constraint worth recording for downstream tickets: the site is **static and deployed to GitHub Pages** (`.github/workflows/deploy.yml`, `site: "https://atilileri.github.io"`). There is no server, so there is no such thing as generating a card image on demand at request time. Every image must exist at build time, which means every image must be committed. That is what makes the append-only history point load-bearing rather than theoretical.

---

## 6. The text-only alternative, given a fair hearing

The ticket invites a strong text-first case as a legitimate finding. Here it is, and it is stronger than the image case.

**The user's own example argues for text.** *"A card for a fruit word showing me asking for that fruit in a grocery store"* is a **scene** — an actor, a place, an action, an intent. That is a sentence. The image is one possible rendering of the sentence; the sentence is the artefact. Ask what the card is *for* and the picture starts to look like decoration around the real content:

> **appel** — Je staat bij de groenteafdeling van de Albert Heijn. Je wilt drie appels. Je vraagt: *"Mag ik drie appels, alstublieft?"*
> _(TR: Albert Heijn'ın manav reyonundasın. Üç elma istiyorsun.)_

**Text wins on nearly every axis this project cares about:**

| Axis | Text | Generated image |
|---|---|---|
| Cost per hundred cards | **$0** | $4–$55 |
| Available on this machine today | **Yes** | No (§1) |
| Consistency across hundreds of cards | **Perfect by construction** | The central unsolved problem (§3) |
| Human review needed per card | Read it | Look at it *and* judge whether the face drifted |
| Editable after the fact | **In place, forever, free** | Regenerate + permanent new blob in history (§5) |
| Diffable in git / reviewable in a PR | **Yes** | No |
| Searchable, greppable | **Yes** | No |
| Bilingual TR + EN (map lock) | **Native** | Impossible — images are language-less |
| **In the target language** | **Yes — the card teaches Dutch while framing the scene** | **No** |
| Bytes per card | ~200 B | ~100 KB (500×) |
| Mobile-answerable (#74's nice-to-have) | **Trivially** | Adds weight and layout cost |
| Watermarking, copyright, likeness questions | **None** | All of §4 |

**The decisive row is the target-language one.** A picture of a grocery store teaches nothing about Dutch. A *sentence* set in a grocery store is simultaneously the context, the mnemonic, and the practice material — it carries the word in a real utterance, in the register the inburgering exam actually tests. The image communicates only in the learner's L1 imagination; the text communicates in L2.

**And the repo's own inherited philosophy says the same thing.** `teach`'s glossary spec — which #75 established is a first-class artefact to be lifted wholesale — says:

> "Add a term only when the user understands it. **The glossary is a record of compressed knowledge, not a dictionary the user reads to learn.**"
>
> — `/home/neo/projects/atilileri.github.io/.agents/skills/teach/GLOSSARY-FORMAT.md:29`

Compressed knowledge is text. The compression *is* the learning. A picture is the opposite move — it decompresses a scene into pixels the learner did not have to construct. There is a real cognitive argument on the other side (dual coding, picture superiority), but note that those effects are usually demonstrated on *isolated concrete nouns*, which is the narrowest and least interesting slice of an inburgering vocabulary. They say little about abstract words, verbs, particles, register, or politeness formulae — which is most of what this exam demands.

**Where images would genuinely earn their place** (worth keeping open, and worth a later ticket rather than this one):

- Concrete, picturable nouns where the L1 gloss is the enemy — the classic case for *not* routing through Turkish or English.
- A single recurring illustrated "world" as **site-level identity**: a handful of hand-picked, human-reviewed scene illustrations for the journey's landing pages, not one per card. A handful is a completely different problem from hundreds — the consistency burden collapses and the cost rounds to zero.
- Diagrams for grammar (word order, `de`/`het`, separable verbs) — and these are the SVG/`sharp`/Playwright path from §1, needing **no account and no money at all**.

---

## 7. Verdict

**Feasibility: possible, not currently reachable, and not worth putting on the critical path.**

1. **Today: no.** No key, no MCP, no CLI, no local model, and the Anthropic API cannot generate images at all. Any image plan starts with the user opening a Google or OpenAI account.
2. **Cost per hundred cards:** $3.90 (Gemini Flash Image) to $21.10 (OpenAI `gpt-image-2` high) one-shot; realistically **$8–$55** with retries; halved again on Google's Batch API. Money is not the constraint.
3. **Consistency is the constraint.** Reference images (5 character refs on Gemini 3 Pro Image) plus frozen character/style prompt blocks plus iterative editing gets to "recognisable". Nothing gets to "guaranteed", and **nothing gets there unattended** — so an agent cannot mint an illustrated card inside a lesson without a human looking at it.
4. **Publishing is permitted** by both vendors' terms, with a SynthID watermark on every Gemini image and probable non-copyrightability of the outputs. Neither blocks this project.
5. **Repo cost is ~10 MB per hundred cards** — fine against GitHub's 1 GB guidance — but permanent, multiplied by every regeneration, and only manageable if images live in `src/assets/` behind Astro's `<Image />` rather than in `public/` as every current image does.
6. **Text-first is the recommendation.** The story *is* the card. It is free, instant, perfectly consistent, bilingual, editable, diffable, mobile-friendly, and — uniquely — written in the language being learned.

**Proposed lock for map #74:** cards are **text-first**; the visual, when there is one, is the *scene sentence*. Generated imagery is **out of scope for the card form** and stays open as a later, opt-in enrichment on a hand-picked subset (and for site identity), contingent on the user opening a provider account. **Nothing downstream should be designed to require an image**, and the content form should be defined so that adding a picture later is additive rather than a migration.

---

## Sources

**Fetched directly and quoted from:**

- [Anthropic — Vision](https://platform.claude.com/docs/en/build-with-claude/vision) — Claude cannot generate, edit or create images
- [Google — Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing) — per-image prices, batch prices, no free tier
- [Google — Gemini API image generation](https://ai.google.dev/gemini-api/docs/image-generation) — SynthID on all images; per-model character/object reference budgets
- [Google — Gemini API Additional Terms of Service](https://ai.google.dev/gemini-api/terms) — ownership of generated content; paid vs unpaid data use
- [OpenAI — API pricing](https://developers.openai.com/api/docs/pricing) — image model line-up and per-1M-token rates
- [OpenAI — Image generation guide](https://developers.openai.com/api/docs/guides/image-generation) — reference images, multi-turn editing, per-image cost table
- [GitHub — About large files on GitHub](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github) — 50 MiB warning / 100 MiB block; <1 GB recommended
- [GitHub — GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) — 1 GB published site, 1 GB source repo, 100 GB/mo bandwidth
- [Astro — Images](https://docs.astro.build/en/guides/images/) — `src/` vs `public/`, `<Image />`, build-time optimisation and caching
- [US Copyright Office — NewsNet on *Copyright and AI, Part 2*](https://copyright.gov/newsnet/2025/1060.html) — "the mere provision of prompts" does not confer copyrightability ([full report](https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf))

**Reproduced from a search index, not fetched (page returned HTTP 403 to both the fetcher and a browser-UA `curl`):**

- [OpenAI — Terms of Use](https://openai.com/policies/row-terms-of-use/) — the "Ownership of content" assignment of Output to the customer. **Re-verify before relying on it.**

**Verified on this machine:**

- `/home/neo/.claude/settings.json` — no credentials, no env block
- `/home/neo/projects/atilileri.github.io/.claude/settings.local.json` — permissions only
- `claude mcp list` — "No MCP servers configured."
- `env` credential grep; `command -v` for image CLIs; `importlib.util.find_spec` for Python libraries; `command -v nvidia-smi`
- `/home/neo/projects/atilileri.github.io/package.json` — `sharp`, `playwright`, `astro ^6.1.5`
- `/home/neo/projects/atilileri.github.io/astro.config.mjs` — no `image` configuration
- `/home/neo/projects/atilileri.github.io/public/images/blog/` — observed WebP/PNG file sizes
- `.git` at 27 MB; working tree at 7.8 MB
- `/home/neo/projects/atilileri.github.io/.agents/skills/teach/GLOSSARY-FORMAT.md:29` — the compressed-knowledge rule
