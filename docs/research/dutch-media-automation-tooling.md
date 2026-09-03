# Media Generation and External-Tool Automation: What Exists Today

**Question:** What tooling exists **today**, on this machine and in this repo's CI, to (a) drive external tools like NotebookLM, (b) generate audio / images / video from text, and (c) extract text out of news pages and YouTube videos? What does each route cost, what can run unattended, and where would secrets live?

**Date:** 2026-09-03

**Ticket:** [#129](https://github.com/atilileri/atilileri.github.io/issues/129), part of map [#74](https://github.com/atilileri/atilileri.github.io/issues/74). Feeds the runtime grilling [#130](https://github.com/atilileri/atilileri.github.io/issues/130).

**Builds on:** [#81](https://github.com/atilileri/atilileri.github.io/issues/81) (image generation), [#120](https://github.com/atilileri/atilileri.github.io/issues/120) (direct REST APIs work from here), [#80](https://github.com/atilileri/atilileri.github.io/issues/80) (the site is a pure static build).

**This ticket decides nothing.** Every finding below is a fact with its measurement or its source. Trade-offs are flagged; choices are left open for #130.

---

## TL;DR

Six findings, in order of how much they change the picture.

1. **Dutch speech needs no cloud account, no key, and no money.** Not a plan — measured end to end on this machine. `sherpa-onnx-node` (npm) plus a Piper `nl_NL` voice from the sherpa-onnx release assets synthesised *"Mag ik alstublieft een kilo appels? Ik woon in Eindhoven en ik leer Nederlands."* in **239 ms for 5.22 s of audio (RTF 0.046, ~21× realtime)** on this 8-core CPU with no GPU. Pure-JS MP3 encoding then took the 230 KB WAV to **21 KB at 32 kbps**. §3.
2. **NotebookLM has no route for this user.** There is no consumer API. The one API path that did not need an enterprise licence — the standalone **Podcast API** — is marked **"Deprecated: The Podcast API is deprecated. Google isn't allowlisting new customers."** Everything else requires a Gemini Notebook Enterprise licence. That leaves browser automation, which Google's own Terms name as abuse when it violates `robots.txt`. §1.
3. **YouTube transcripts work today, without a key — and every working route is disallowed by YouTube's `robots.txt`.** `youtube-transcript@1.3.1` pulled real Dutch ASR transcripts from NOS and Jeugdjournaal videos on the first try. The official, licence-clean `captions.download` API **only works on videos you own**. There is no sanctioned third-party route. §5.
4. **#81's finding still holds, re-measured.** No API key in the environment, **no MCP servers configured**, no image CLI, no Python generation library, no GPU. Nothing on this machine generates an image from a prompt. But **Mermaid → SVG → PNG works entirely locally** — measured: a 13.6 KB SVG and a 2.4 KB PNG, zero cost, no account. §4.
5. **The Web Speech API is a *reader's* feature, not a build-time one.** Headless Chromium here exposes `speechSynthesis` and returns **zero voices**. And the spec offers no way to capture synthesised audio to a file. It can speak Dutch on the learner's phone; it can never pre-render an MP3 into the repo. §3.
6. **CI is free and empty.** Public repo → GitHub-hosted standard runners are free with no minute cap. There are **zero repository secrets and zero variables today**, and `deploy.yml` holds `permissions: contents: read`, so it cannot commit anything back. Every unattended route starts by adding a second workflow. §7.

---

## 1. NotebookLM

### 1.1 There is no public, self-serve API

Measured: `notebooklm.google.com` is not an API host and there is no discovery document.

```
$ curl -s -o /dev/null -w "%{http_code}\n" "https://notebooklm.googleapis.com/\$discovery/rest?version=v1"
404
$ curl -s "https://notebooklm.googleapis.com/v1/notebooks" -w "%{http_code}\n"
404   (Google's generic 404 HTML)
```

Google's own API directory confirms it. The discovery service lists **313 preferred APIs**, and filtering them turns up `notebooks`, `speech`, `texttospeech`, `discoveryengine`, `aiplatform` — but `notebooks` is *"Notebooks API is used to manage notebook resources in Google Cloud"* (Vertex AI Workbench), not NotebookLM. No entry mentions NotebookLM at all.

```
$ curl -s "https://discovery.googleapis.com/discovery/v1/apis?preferred=true"   # HTTP 200, 313 items
notebooks | Notebooks API | Notebooks API is used to manage notebook resources in Google Cloud.
```
— [Google API Discovery Service](https://discovery.googleapis.com/discovery/v1/apis?preferred=true)

The consumer help centre says nothing about programmatic access either ([NotebookLM Help](https://support.google.com/notebooklm/answer/16070070)).

**Also measured, and worth knowing:** NotebookLM has been renamed. `https://notebooklm.google.com/` redirects (HTTP 200 after following) to a sign-in whose `continue` parameter is **`https://notebook.google.com/`** — the product is now *Gemini Notebook*. Any doc or tool referring to "NotebookLM" is describing a renamed product.

### 1.2 The enterprise API exists, and it is gated

There *is* a documented API, under Google Cloud:

> **Endpoint:** `{ENDPOINT_LOCATION}-discoveryengine.googleapis.com` (`us`, `eu`, or `global`)
> **Auth:** Bearer token via `gcloud auth print-access-token`
> **Status:** *"This feature is subject to the 'Pre-GA Offerings Terms' … Pre-GA features are available 'as is' and might have limited support."*
> **Prerequisite:** *"Get licenses for Gemini Notebook Enterprise"*
>
> — [Create and manage notebooks (API)](https://docs.cloud.google.com/gemini/enterprise/notebooklm-enterprise/docs/api-notebooks)

The product overview confirms the commercial shape: *"You can purchase Gemini Notebook Enterprise as a standalone product or as part of Gemini Enterprise"* ([overview](https://docs.cloud.google.com/gemini/enterprise/notebooklm-enterprise/docs/overview)). **No per-seat price is published on either page**, and `cloud.google.com/gemini-enterprise/pricing` returns 404 — pricing is a sales conversation.

### 1.3 The one unlicensed API route is deprecated

This is the finding that closes the question. Google documents a **standalone Podcast API** that explicitly does *not* need a notebook or a Gemini Enterprise licence — only a Cloud project and an IAM role:

> **Requires:** *"A Google Cloud project with the Discovery Engine API enabled"* and *"The Identity and Access Management (IAM) role of Podcast API User (`roles/discoveryengine.podcastApiUser`)"*
> **Endpoint:** `POST https://discoveryengine.googleapis.com/v1/projects/PROJECT_ID/locations/global/podcasts`
> **Language:** `languageCode` per BCP-47; *"If unspecified, the podcast is generated in English."*
> **Duration:** *"`SHORT` (typically 4-5 minutes)"*, *"`STANDARD` (typically around 10 minutes…)"*
> **Limit:** *"The total content of the context array must be less than 100,000 tokens."*
> **Status:** *"**Deprecated:** The Podcast API is deprecated. Google isn't allowlisting new customers."*
>
> — [Generate podcasts (API method)](https://docs.cloud.google.com/gemini/enterprise/notebooklm-enterprise/docs/podcast-api)

So the shape of the answer is: an Audio Overview *was* reachable by API without an enterprise licence, and **as of today it is not, for a new customer.**

### 1.4 What browser automation would actually require

Measured on this machine, headless Chromium (Playwright 1.61.1, `chromium-1228` already installed under `~/.cache/ms-playwright`):

```
headless=true  url=https://accounts.google.com/v3/signin/identifier?continue=https://notebook.google.com/logi…
  text: Sign in  Use your Google Account  Email or phone  Forgot email? …
  browser-not-secure banner: false
```

The Google sign-in page **renders fine in headless Chromium** — it is not blocked at page load. What that does *not* prove is that a full credential submission succeeds; that is untestable without the user's account, and Google's automation heuristics are the well-known risk at exactly that step. Treat "headless login works" as **unverified**.

Session persistence is the mechanism that avoids logging in on every run, and Playwright documents both how and why not to commit it:

> *"Reusing authenticated state covers [cookies]… [local storage]… [IndexedDB]… and passkey ([WebAuthn])."*
>
> ⚠ *"The browser state file may contain sensitive cookies and headers that could be used to impersonate you or your test account. **We strongly discourage checking them into private or public repositories.**"* — recommends `playwright/.auth` in `.gitignore`.
>
> — [Playwright, Authentication](https://playwright.dev/docs/auth)

**This collides head-on with map #74's publicness lock.** Everything on this map is committed and published. A Google `storageState` is the one artifact in this whole ticket that can never be. 2FA is the same problem in a different shape: a persisted state file survives it once, until Google expires it, and then a human must be present.

### 1.5 What Google's terms permit

Google's Terms of Service, under *"Don't abuse our services"*:

> *"You must not abuse, harm, interfere with, or disrupt our services or systems — for example, by: … **using automated means to access content from any of our services in violation of the machine-readable instructions on our web pages** (for example, robots.txt files that disallow crawling, training, or other activities)"*
>
> — [Google Terms of Service](https://policies.google.com/terms)

Measured: `notebooklm.google.com/robots.txt` → **301**, `notebook.google.com/robots.txt` → **302** (both redirect, neither serves a policy). So there is no *robots* instruction being violated by driving the NotebookLM UI — the clause above is not triggered by that specific act. The clause **is** squarely triggered by the YouTube transcript route in §5, where `robots.txt` says exactly the opposite.

A third-party unofficial SDK exists (`notebooklm-py`, ~5.6k GitHub stars, surfaced by web search — **not verified by me and not a primary source**). It is a wrapper over the same unofficial surface: same login problem, same terms question, plus a dependency that breaks whenever Google changes the UI. Named here for completeness, not endorsed.

---

## 2. The Gemini API

### 2.1 Does the user hold a key? No.

```
$ env | grep -iE 'api_key|token|openai|anthropic|google|gemini|replicate|stability|fal_|azure|aws|bedrock|vertex|eleven|deepgram|hugging|hf_'
VSCODE_CLI_REQUIRE_TOKEN=…    CLAUDE_CODE_EXECPATH=…    CLAUDE_CODE_MESSAGING_TOKEN=…
```

Three hits, all Claude Code / VS Code internals. **No provider credential.** `~/.claude/settings.json` holds six keys (`model`, `effortLevel`, `theme`, `switchModelsOnFlag`, `remoteControlAtStartup`, `agentPushNotifEnabled`) and no env block. `.claude/settings.local.json` holds only `permissions` and `outputStyle`. `claude mcp list` → *"No MCP servers configured."* `~/.claude.json` has an empty `mcpServers` both globally and for this project. Identical to #81's finding, five months on.

The API is reachable, and it refuses cleanly — which is the useful measurement, because it means only a key is missing, not network access:

```
$ curl -s -w "%{http_code}" https://generativelanguage.googleapis.com/v1beta/models
403  "Method doesn't allow unregistered callers … Please use API Key…"
$ curl -s -w "%{http_code}" "…/v1beta/models?key=DUMMY"
400  "API key not valid. Please pass a valid API key."  reason: API_KEY_INVALID
```

### 2.2 Modalities and prices

All from [ai.google.dev/gemini-api/docs/pricing](https://ai.google.dev/gemini-api/docs/pricing), read 2026-09-03. Prices per 1M tokens unless stated.

| Modality | Model | Paid price | Free tier |
|---|---|---|---|
| Text | Gemini 3.8 Flash | in $0.75 / out $3.75 *(through 2026-12-31; $1.50 / $7.50 from 2027-01-01)* | Yes, limited |
| Text | Gemini 3.5 Flash-Lite | in $0.30 / out $2.50 | Yes, limited |
| Text | Gemini 3.1 Pro Preview | in $2.00 (≤200k) / out $12.00 | **No** |
| **Speech** | Gemini 2.5 Flash Preview TTS | in $0.50 (text) / **out $10.00 (audio)** | **Yes, limited** |
| **Speech** | Gemini 3.1 Flash TTS Preview | in $1.00 / **out $20.00 (audio)** | **Yes, limited** |
| Speech | Gemini 2.5 Pro Preview TTS | in $1.00 / out $20.00 | **No** |
| **Image** | Gemini 2.5 Flash Image (Nano Banana) | **$0.039 per image** | **No** |
| **Image** | Gemini 3.1 Flash Image (Nano Banana 2) | out $60/1M tokens ≈ **$0.045 per 0.5K image** | **No** |
| Image | Imagen | out $30/1M tokens; *"Output images at 1K (1024x1024px) consume 1120 tokens and are equivalent to **$0.0336 per image**"* | **No** |
| **Video** | Veo 3.1 Lite | **$0.05/s (720p)**, $0.08/s (1080p) | Not available |
| Video | Veo 3.1 Fast | $0.10/s (720p), $0.12/s (1080p), $0.30/s (4k) | Not available |
| Video | Veo 3.1 Standard | $0.40/s (720p & 1080p), $0.60/s (4k) | Not available |

**Speech is the one generative modality with a free tier.** Image and video are paid-only. That is a materially different picture from #81's, which only looked at images.

Dutch is supported: *"The TTS models detect the input language automatically"*, with 80+ languages including `nl`; **30 voice options**; output is 24 kHz PCM wave; *"A TTS session has a context window limit of 32k tokens"* ([speech generation docs](https://ai.google.dev/gemini-api/docs/speech-generation)).

⚠ **Cost caveat, flagged not resolved.** TTS is billed in *audio output tokens*, and Google's [token docs](https://ai.google.dev/gemini-api/docs/tokens) publish only *"Audio: 32 tokens per second"* — for **input**. No output-audio token rate is documented. The §8 cost table applies 32 tok/s to output as the best available assumption; **verify against a real invoice before betting on it.**

⚠ The [rate-limits page](https://ai.google.dev/gemini-api/docs/rate-limits) **no longer publishes free-tier RPM/TPM/RPD numbers**; it says limits *"can be viewed in Google AI Studio"*. So "free tier: yes" is a documented fact; *how much* free is only knowable from inside an account.

### 2.3 Auth, and the terms attached to free

Auth is an API key on the query string or `x-goog-api-key` header — no OAuth, no service account. That is the cheap part. The expensive part is what the free tier costs in a different currency:

> **Unpaid Services:** *"Google uses the content you submit to the Services and any generated responses to provide, improve, and develop Google products and services"*; *"human reviewers may read, annotate, and process your API input and output"*; *"**Do not submit sensitive, confidential, or personal information to the Unpaid Services.**"*
>
> **Paid Services:** *"Google doesn't use your prompts … or responses to improve our products"*, with logging *"solely for detecting and preventing violations of the Prohibited Use Policy"*.
>
> **Output:** *"Google won't claim ownership over that content. You acknowledge that Google may generate the same or similar content for others and that we reserve all rights to do so."*
>
> — [Gemini API Additional Terms of Service](https://ai.google.dev/gemini-api/terms)

**Trade-off for #130 to weigh, not for me to settle.** Everything this map produces is public by lock, so "human reviewers may read it" is arguably a non-issue — *except* that the Profile (#83) is personal data about a real person, and the free tier's own terms say not to submit personal information. The publicness lock and the free tier's data clause are not the same question, and they come apart exactly at the Profile. Veo's pricing table makes the same split explicit with a *"Used to improve our products: Free = Yes / Paid = No"* row.

### 2.4 For the record: the Claude API generates none of this

The Claude API's endpoint list is Messages, Message Batches, Token Counting, Models, Files, Skills, plus beta Agents / Sessions / Environments ([API overview](https://platform.claude.com/docs/en/api/overview)). **There is no speech, image, or video generation endpoint anywhere in the surface** — consistent with #81's quote from the vision FAQ (*"it cannot generate, produce, edit, manipulate, or create images"*). Whatever media route this map takes, it is a second vendor.

---

## 3. Speech without a cloud account

### 3.1 Local neural TTS: works, measured end to end

This is the headline. `sherpa-onnx-node` installs from npm on this machine and loads:

```
$ npm install sherpa-onnx-node    # exit 0
$ node -e "console.log(Object.keys(require('sherpa-onnx-node')))"
[ 'OnlineRecognizer', 'OfflineRecognizer', 'OfflineTts', … ]
```

The sherpa-onnx `tts-models` release carries **642 assets, of which 20+ are Dutch** — `vits-piper-nl_NL-ronnie-medium`, `nl_NL-pim-medium`, `nl_NL-miro-high`, `nl_NL-dii-high`, `nl_BE-nathalie-*`, `nl_BE-rdh-*`, `vits-coqui-nl-css10`, each in fp32 / int8 / fp16 ([release assets](https://github.com/k2-fsa/sherpa-onnx/releases/tag/tts-models)).

```
$ curl -sL -o m.tar.bz2 …/vits-piper-nl_NL-ronnie-medium.tar.bz2
dl 200  67,194,164 bytes in 4.38s
$ tar xjf m.tar.bz2 && du -sh vits-piper-nl_NL-ronnie-medium
79M    (nl_NL-ronnie-medium.onnx = 62,950,199 B, plus tokens.txt and espeak-ng-data)
```

Then synthesis of *"Mag ik alstublieft een kilo appels? Ik woon in Eindhoven en ik leer Nederlands."*:

```
sampleRate 22050  samples 115137  audio_sec 5.22  gen_ms 239  RTF 0.046
```

**239 ms of CPU for 5.22 s of Dutch speech — about 21× realtime, on 8 cores, no GPU, no network, no account, no key.** A hundred sentences is roughly 24 seconds of compute.

Licence and provenance, from the bundle's own `MODEL_CARD`:

```
# Model card for ronnie (medium)
* Language: nl_NL (Dutch, Netherlands)   * Speakers: 1   * Samplerate: 22,050Hz
## Dataset  URL: https://github.com/OHF-Voice/voice-datasets   License: CC0
## Training  Finetuned from U.S. English lessac voice (medium quality)
```

The Hugging Face `rhasspy/piper-voices` repo carries `license:mit` and tags for both `nl` and `tr` ([HF model API](https://huggingface.co/api/models/rhasspy/piper-voices)). **CC0 data, MIT distribution — licence-clean for a public repo.**

⚠ **On pronunciation quality, which #129 says matters more than availability, I am flagging rather than asserting.** Two things I measured that bear on it: the `ronnie` voice was *"Finetuned from U.S. English lessac voice"* — a Dutch voice with an English ancestor is exactly the provenance you would want checked before it teaches pronunciation; and higher-quality Dutch options exist unmeasured (`nl_NL-miro-high`, `nl_NL-dii-high`). **I did not listen to the output.** No `ffmpeg`, no `sox`, no audio device on this box, and an agent cannot judge a Dutch accent regardless. This is a listening test for the user, and it is the single most load-bearing unmeasured thing in this document. Map #74 already carries *"Pronunciation correctness"* as an open item; this route does not close it, it just makes the audio free to produce while it stays open.

### 3.2 Committing the audio: measured sizes

No `ffmpeg` on this machine, but MP3 encoding works in pure JS (`@breezystack/lamejs`), so the whole chain is Node-only:

| Format | Bytes for 5.22 s | Per second |
|---|---|---|
| WAV 22.05 kHz mono 16-bit (raw output) | 230,318 | ~44 KB/s |
| MP3 32 kbps | **21,107** | ~4.0 KB/s |
| MP3 48 kbps | 31,660 | ~6.1 KB/s |
| MP3 64 kbps | 42,213 | ~8.1 KB/s |

At 32 kbps, **1,000 four-second Item clips ≈ 16 MB.** Context: the published repo is currently **17,979 KB** (`gh api repos/… --jq .size`), `.git` is 42 MB locally, there is **no `git-lfs`** installed and no `.gitattributes`, and the repo today contains **zero** `.mp3`/`.wav`/`.m4a`/`.mp4`/`.ogg` files. #81's warning transfers intact: compressed audio does not delta-compress, so **every regeneration is a permanent extra copy in history**. Also unchanged from #81: `astro.config.mjs` sets no `image` options and everything media-ish lives in `public/`, copied as-is.

### 3.3 The Web Speech API: a reader's feature only

Two hard limits, both measured or quoted.

Measured — headless Chromium on this machine has the API and no voices:

```
$ node -e "…page.evaluate(() => speechSynthesis.getVoices())"
{"has":true,"count":0,"voices":[],"nl":[]}
```

Linux Chromium delegates to a system speech engine; there is none here (no `speech-dispatcher`, no `espeak`, no `festival`, and `sudo` requires a password so none can be installed). **Zero voices means zero Dutch voices.**

Quoted — even with voices, the API cannot write a file:

> *"The API does NOT provide native functionality to capture synthesized audio to a file or MediaStream."* The `SpeechSynthesis` interface controls playback (speak / pause / resume / cancel) and does not expose audio output streams.
>
> — [MDN, SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) — *"Widely available"* / Baseline since September 2018.

So the Web Speech API is **strictly a runtime feature in the learner's own browser**, where the voices come from iOS/Android/macOS/Windows and are typically good Dutch. It is free, needs no repo bytes, and works offline on the phone — and it can never be part of a build step. Note the interaction with #80: the site is static, so a "speak this word" button is pure client-side JS and costs nothing to ship; but what it sounds like is the *device's* choice, not the repo's, and it therefore cannot be reviewed, versioned, or made identical for a stranger reading the public site.

### 3.4 Cloud speech, for completeness

Google Cloud Text-to-Speech is a separate product from Gemini TTS, priced per character ([pricing](https://cloud.google.com/text-to-speech/pricing)):

| Voice tier | Price |
|---|---|
| Standard | US$0.000004/char (**$4 per 1M chars**) |
| WaveNet | US$0.000004/char ($4 per 1M) |
| Neural2 | US$0.000016/char ($16 per 1M) |
| Polyglot (Preview) | US$0.000016/char ($16 per 1M) |
| Chirp 3: HD | US$0.00003/char (**$30 per 1M**) |
| Studio | US$0.00016/char ($160 per 1M) |
| Gemini-TTS | $0.50/1M text tokens in, $10.00/1M audio tokens out |

⚠ **Free tier is ambiguous on the vendor's own page** and I am not resolving it. The prose says *"You must enable billing to use Text-to-Speech, and will be automatically charged if your usage exceeds the number of free characters allowed per month"* — asserting free characters exist — while every table row prices from character zero (*"0 to 4 million characters | US$0.000004 per character"*). Both quotes are from the same page. Check the console, not the docs. Note also that billing must be enabled either way, i.e. **a card on file**, which is a bigger step than a Gemini API key.

---

## 4. Images and diagrams

### 4.1 #81 re-measured: the finding holds

| Path | Status (2026-09-03) | Evidence |
|---|---|---|
| Provider API key in env | **None** | `env` grep, §2.1 |
| MCP servers | **None** | `claude mcp list`; `~/.claude.json` `mcpServers: []` global and project |
| Image CLIs | **None** — no `openai`, `gemini`, `ollama`, `llm`, `magick`, `convert` | `command -v` each |
| Python gen libraries | **None** — `openai`, `anthropic`, `google.generativeai`, `google.genai`, `replicate`, `diffusers`, `torch`, `PIL` all absent; only `requests` present | `importlib.util.find_spec` |
| GPU | **None** — no `nvidia-smi` | `command -v` |
| Claude API | **No image endpoint exists** | [API overview](https://platform.claude.com/docs/en/api/overview) |

**New and load-bearing:** *no Python package manager exists either.* `pip`, `pip3`, `pipx`, `uv` are all missing, `python3 -m pip` → *"No module named pip"*, `python3 -m ensurepip` → *"No module named ensurepip"*, and `sudo` demands a password. **On this machine, Python is read-only** — `requests` and the stdlib and nothing more, ever, without the user typing a password.

Node is the opposite: `npm install` works freely (measured repeatedly — `jsdom`, `@mozilla/readability`, `youtube-transcript`, `youtubei.js`, `sherpa-onnx-node`, `mermaid`, `@breezystack/lamejs` all installed cleanly). **Any tool this map builds should be Node, not Python**, purely on what can be installed here. That is a fact, not a recommendation — but it is a sharp one.

### 4.2 Mermaid and SVG: the licence-clean route, measured

`mermaid@11.17.2` installs from npm; the repo already has `playwright@1.61.1` and `sharp@0.33` as real dependencies with Chromium downloaded. Rendering a Dutch word-order flowchart, headless, offline:

```
svg bytes 13622 | png bytes 2413 | meta {"w":621,"h":141,"f":"png"}
```

**Zero cost, zero account, deterministic, diffable.** An SVG committed as text even delta-compresses in git, which raster images do not (§3.2). Mermaid is MIT-licensed. This is the whole answer for grammar diagrams — `de`/`het`, separable verbs, V2 word order, the inversion in `vierentachtig` that #120 flagged — and it is no answer at all for "a picture of a grocery store", exactly as #81 said.

### 4.3 If a key were added

Cheapest per image is **Imagen at $0.0336** (1024², 1120 tokens at $30/1M), then **Gemini 2.5 Flash Image at $0.039**, then **Gemini 3.1 Flash Image at ~$0.045**. **None has a free tier.** #81's actual blocker was never price — it was that character consistency cannot be guaranteed, so illustrated cards cannot be minted unattended. Nothing measured today changes that.

---

## 5. Text extraction

### 5.1 YouTube transcripts: they work, without a key

The naive route is **dead** — measured, so nobody re-tries it. The `captionTracks` array is still in the watch page HTML, and its `baseUrl` returns **HTTP 200 with a zero-byte body**:

```
watch page: HTTP 200, 1,296,746 bytes, captionTracks found: True
timedtext baseUrl        → HTTP 200, 0 bytes
timedtext baseUrl&fmt=json3 → HTTP 200, 0 bytes
youtubei/v1/player WEB     → playabilityStatus UNPLAYABLE, no captions
youtubei/v1/player ANDROID → HTTP 400
youtubei/v1/player IOS     → HTTP 400
```

`youtubei.js@18.0.0` also failed: `get_transcript` → HTTP 400.

**`youtube-transcript@1.3.1` works.** Twelve real video IDs, harvested from the `@nos` and `@jeugdjournaal` channel pages, no API key, no login:

```
0Tq645AReEc  OK 20 segs  lang=nl  "Nou, hartstikke mooi hè. Nou, zijn we / niet voor niks gekomen."
6y07WS17_SA  OK 62 segs  lang=nl  "De partijen zijn het uiteindelijk eens / over hoe ze hun geld volgend jaar willen"
aZSDQHXxxZE  OK 682 segs lang=nl  "Mijn lievelingspodcast is denk ik die / over liefde ging."
B8TSKcbw7Pg  OK 60 segs  lang=nl  "Op de ochtend van de ramp krijgt de / schooldirecteur van deze middelbare"
7RurZ0P-KEI  OK 62 segs  lang=nl  "De politie was vandaag de hele dag in / Overrasseld om onderzoek te doen naar"
AwrREUz51vU  ERR "Transcript is disabled on this video"
3wDF9KAPVOk  OK 10 segs  lang=en  (Dutch channel, English video)
```

Two things fall out. **A `{lang:'nl'}` filter is honoured and errors informatively** when the video has no Dutch track, listing what it does have — so an intake script can fail loudly rather than silently ingest English. And **ASR quality is visibly imperfect**: `"Overrasseld"` in the last line is a mangled place name. For a B1/B2 learner, an auto-caption is a *lead*, not a source of truth — every extracted sentence needs a human or a model pass before it becomes an Item.

### 5.2 …and there is no sanctioned way to do it

This is the trade-off #130 has to look at squarely.

YouTube's own `robots.txt`, under `User-agent: *`:

```
Disallow: /api/          ← this is the timedtext host path
Disallow: /youtubei/     ← this is the innertube host path
Disallow: /timedtext_video
```

Every working transcript route hits one of those two paths. And Google's ToS names automated access *"in violation of the machine-readable instructions on our web pages (for example, robots.txt files…)"* as abuse ([Google ToS](https://policies.google.com/terms)).

The official route does not substitute. `captions.download` requires scope `youtube.force-ssl` or `youtubepartner` and:

> *"This method is requires the user to have permission to edit the video."*
> 403 `forbidden`: *"The permissions associated with the request are not sufficient to download the caption track."*
>
> — [YouTube Data API, captions.download](https://developers.google.com/youtube/v3/docs/captions/download)

**So: you may download captions for videos you own, and there is no supported third-party route.** The choice is between a working-but-disallowed scrape and no YouTube ingestion at all. A middle path worth naming (not recommending): the user pastes a transcript by hand, or ingests only videos they own, or ingests only URLs and lets a human do the reading.

### 5.3 News articles: it depends entirely on the publisher

Measured with `@mozilla/readability` + `jsdom` over plain `fetch`:

| URL | Result |
|---|---|
| `nos.nl/l/2629576` | **HTTP 200, readerable=true, `lang=nl`, 5,211 chars.** Title *"Stikstofplannen halen land niet van het slot, wel grote stap vooruit"*. Clean. |
| `nu.nl/stikstof/6408526/…` | **Redirected to `myprivacy.dpgmedia.nl/consent?…`**, 7,960 bytes, Readability → `null` |
| `volkskrant.nl` | **Same DPG consent redirect**, Readability → `null` |
| `nltimes.nl` | 200 but `readerable=false`; Readability returned only footer text (462 chars) |

A headless browser gets past the consent wall where `fetch` cannot. Playwright with `waitUntil:'networkidle'` and `locale:'nl-NL'` **loaded the nu.nl article directly, no consent click needed**, and Readability then extracted it cleanly:

```
title: Stikstofpakket krijgt ruime voldoende: krimp veestapel is onvermijdelijk
lang: nl | chars: 4826
"De stikstofplannen van het kabinet betekenen een forse stap richting een oplossing…"
```

Both publishers also ship RSS that returns HTTP 200 (`feeds.nos.nl/nosnieuwsalgemeen`, `nu.nl/rss/Algemeen`) — a cheap, unambiguous discovery layer even where the article body is contested.

⚠ **The licence picture differs sharply between the two, and it is the opposite of what the technical picture suggests.**

- **NOS** allows `User-agent: *` on article paths (only `/hybrid/`, `/widget-embed/`, `/special/`, `/api`, `/zoeken`, `/regio` are disallowed) — but blocks **28 named AI crawlers** outright with `Disallow: /`, including `GPTBot`, `ChatGPT-User`, `CCBot`, `Google-Extended`, `PerplexityBot`, **`anthropic-ai`** and **`ClaudeBot`**. A generic script is permitted by the letter of the file; a script that identifies as an AI agent is not. The intent is unmistakable.
- **DPG Media** (nu.nl, Volkskrant, AD, Trouw, Parool) states it in prose, in the `robots.txt` itself, in two languages: *"…het is niet toegestaan om gegevens van de website of uit de apps door middel van **screen scraping (of een andere geautomatiseerde werkwijze)** te vergaren"* / *"it is not allowed to collect data from the website or from the apps by means of screen scraping (or any other automated method)."* **The route that technically works is the one explicitly forbidden.**

This connects to #120's licensing finding on Dutch `citaatrecht` (Art. 15a Aw): quoting under four cumulative conditions is a narrower right than US fair use, and *"allude, don't reproduce"* was already the safe default. The same default answers this section: **extract to inform a generated Lesson; do not commit the article body.**

### 5.4 And the tooling that worked, for the record

Installed and verified this session, all npm, all in a scratch dir (nothing added to the repo): `youtube-transcript@1.3.1` (✅), `youtubei.js@18.0.0` (❌ transcript 400), `@mozilla/readability` + `jsdom` (✅), `mermaid@11.17.2` (✅), `sherpa-onnx-node` (✅), `@breezystack/lamejs@1.2.7` (✅). Already in the repo: `playwright@1.61.1` + `@playwright/test` (dev deps, `playwright.config.ts` present for the Deck walk), `sharp@0.33`. Reachable and useful with no key at all: Europe PMC (per #120), Google's API Discovery service, `feeds.nos.nl`, `nu.nl/rss/*`, GitHub Releases, Hugging Face, npm.

---

## 6. What the runtime split looks like

Not a decision — just sorting the routes by what they need.

**Runs unattended, no human, no account:**
- Local Piper TTS via `sherpa-onnx-node` (§3.1) — needs the 79 MB model fetched or cached
- Mermaid → SVG → PNG via `mermaid` + `playwright` + `sharp` (§4.2)
- MP3 encoding via `lamejs` (§3.2)
- RSS discovery from `feeds.nos.nl` / `nu.nl` (§5.3)
- NOS article extraction via `fetch` + Readability (§5.3)
- Europe PMC and any keyless REST API (#120)

**Runs unattended, needs a key in a secret:**
- Gemini API for text, TTS, images, Veo (§2)
- Google Cloud TTS (also needs billing enabled)

**Needs a headless browser (heavier, still unattended):**
- DPG-family article extraction (§5.3) — and explicitly forbidden by DPG's own terms
- YouTube transcripts sit here too in spirit: technically keyless HTTP, but `robots.txt`-disallowed (§5.2)

**Needs the user's laptop with a logged-in browser, and cannot be automated cleanly:**
- **NotebookLM / Gemini Notebook, in every form** (§1) — the `storageState` cannot be committed to a public repo, 2FA needs a human eventually, and the whole act sits under a terms question
- Listening to and approving generated Dutch audio (§3.1)
- Approving a generated image for character consistency (#81)

---

## 7. CI: what GitHub Actions can and cannot do here

Measured:

```
$ gh secret list      → (empty, exit 0)
$ gh variable list    → (empty, exit 0)
$ gh api repos/atilileri/atilileri.github.io --jq '{private,visibility,size}'
{"private":false,"visibility":"public","size":17979}
```

**Zero secrets, zero variables, today.** Adding one is the first concrete step of any keyed route, and `gh secret set` does it — but note that a secret in a *public* repo is readable by any workflow the repo runs, including from a fork's `pull_request_target`-style path; the standing advice is a dedicated, spend-capped key, never a personal one.

`.github/workflows/` holds exactly one file, `deploy.yml`: `on: push [main, master]` + `workflow_dispatch`, `permissions: contents: read | pages: write | id-token: write`, using `withastro/action@v3` on `ubuntu-latest` with Node 24. **`contents: read` means it cannot commit anything back** — #80 found the same thing and drew the same conclusion: any ingestion or generation workflow must be a *separate* workflow with `contents: write`. #80's other warning still binds: every commit to `main` retriggers the build against the ~10 builds/hour Pages soft limit, so batch to one commit per session.

Cost of running it:

> *"GitHub Actions usage is **free** for self-hosted runners and for **public repositories** that use standard GitHub-hosted runners."* … *"Larger runners are always charged for, even when used by public repositories."*
>
> — [About billing for GitHub Actions](https://docs.github.com/en/billing/managing-billing-for-your-products/about-billing-for-github-actions)

So compute is free at standard-runner size. Practical notes for whatever gets built: the 79 MB Piper model must be fetched per run (4.4 s from GitHub Releases, measured) or cached with `actions/cache` — **not committed**, since there is no `git-lfs` here; and Playwright needs `npx playwright install --with-deps chromium` in CI, because the runner has no `~/.cache/ms-playwright`.

---

## 8. Cost per artifact

One "artifact" = one ~5-second Dutch sentence (the 78-character probe sentence from §3.1), one image, or one ~8-second video clip. Marked **⚠** where the unit conversion is assumed rather than published (see §2.2).

| Artifact | Route | Per artifact | Per 1,000 | Account needed |
|---|---|---|---|---|
| Dutch speech | **Local Piper / sherpa-onnx** | **$0** (239 ms CPU) | **$0** | **None** |
| Dutch speech | Web Speech API in the learner's browser | $0 | $0 | None — but no file, ever (§3.3) |
| Dutch speech | Gemini 2.5 Flash Preview TTS | ⚠ ~$0.0017 | ⚠ ~$1.70 | Gemini key (**free tier exists**) |
| Dutch speech | Gemini 3.1 Flash TTS Preview | ⚠ ~$0.0033 | ⚠ ~$3.34 | Gemini key (free tier exists) |
| Dutch speech | Cloud TTS Standard / WaveNet | $0.00031 | $0.31 | GCP + billing |
| Dutch speech | Cloud TTS Neural2 | $0.00125 | $1.25 | GCP + billing |
| Dutch speech | Cloud TTS Chirp 3: HD | $0.00234 | $2.34 | GCP + billing |
| Dutch speech | Cloud TTS Studio | $0.0125 | $12.48 | GCP + billing |
| Diagram | **Mermaid → SVG → PNG locally** | **$0** | **$0** | **None** |
| Image | Imagen 1024² | $0.0336 | $33.60 | Gemini key, **no free tier** |
| Image | Gemini 2.5 Flash Image | $0.039 | $39.00 | Gemini key, no free tier |
| Image | Gemini 3.1 Flash Image | ~$0.045 | ~$45.00 | Gemini key, no free tier |
| Video (8 s) | Veo 3.1 Lite 720p | $0.40 | $400 | Gemini key, no free tier |
| Video (8 s) | Veo 3.1 Fast 720p | $0.80 | $800 | Gemini key, no free tier |
| Video (8 s) | Veo 3.1 Standard 720p | $3.20 | $3,200 | Gemini key, no free tier |
| YouTube transcript | `youtube-transcript` | $0 | $0 | None — ⚠ `robots.txt`-disallowed (§5.2) |
| YouTube transcript | YouTube Data API `captions.download` | $0 (quota) | — | OAuth **+ you must own the video** |
| Article text | `fetch` + Readability (NOS) | $0 | $0 | None |
| Article text | Playwright + Readability (DPG) | $0 (CI free) | $0 | None — ⚠ forbidden by DPG terms (§5.3) |
| Audio Overview | NotebookLM consumer UI, by hand | Included in plan | — | Google login; **no API** |
| Audio Overview | Podcast API | — | — | **Deprecated, closed to new customers** |
| Audio Overview | Gemini Notebook Enterprise API | **Not published** | — | Enterprise licence, sales contact |
| Repo storage | MP3 32 kbps | 21 KB per 5 s | **~16 MB per 1,000 4-s clips** | Permanent in git history |

The whole media budget for this journey can plausibly be **$0**. That is the finding; what to do with it is #130's.

---

## 9. What I could not measure, and what I would not

Stated plainly, following #78's and #120's convention.

- **Whether a headless Google login actually succeeds.** The sign-in page renders (§1.4); submitting real credentials was neither possible nor appropriate. Google's automation detection at that step is the known risk and remains **unverified**.
- **Whether the Dutch audio sounds right.** §3.1 is the most important gap in this document. No audio playback exists on this box and an agent cannot judge an accent. `nl_NL-ronnie-medium` was finetuned from a US English voice; `nl_NL-miro-high` and `nl_NL-dii-high` exist and were not tried.
- **Gemini free-tier quantities.** Google stopped publishing free-tier RPM/TPM/RPD in the docs (§2.2). "Free tier: yes" is documented; the size of it is not.
- **The output-audio token rate for Gemini TTS.** Only the input rate (32 tok/s) is published. Every ⚠ row in §8 rests on assuming they are the same.
- **Cloud TTS's free monthly characters.** The vendor's own page contradicts itself (§3.4).
- **Gemini Notebook Enterprise pricing.** Not published anywhere I could reach; the pricing URL 404s.
- **`notebooklm-py`.** Surfaced by web search, never opened, not run. Third-party, and named in §1.5 only so #130 knows it exists.
