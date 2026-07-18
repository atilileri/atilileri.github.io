# Slidev capability showcase — reaction note

Throwaway prototype for [map #4](https://github.com/atilileri/atilileri.github.io/issues/4), ticket #6.
Feeds the framework comparison at "Choose the presentation approach" (#11).

## Run it

```bash
cd prototypes/slidev
npm install
npm run dev                                        # presenter view: press `p`
npm run build -- --base /proto/slidev/ --out ../../public/proto/slidev   # static build served at /proto/slidev/
```

## What's in the deck (every ticket-required capability)

| Slide | Capability | How Slidev does it |
|---|---|---|
| Hero | Bold static title + entry motion | `v-motion` directive + animated CSS aurora backdrop |
| Thesis | Cinematic beat | `layout: center`, `fade-out` transition |
| Fragments | Step build-up in one slide | `<v-clicks>` auto-wraps list items |
| **Token counter** | **Live interactive widget** | Vue SFC + `gpt-tokenizer`, **100% client-side** |
| **Token chart** | **Animated data-viz** | Vue SFC, CSS width transitions, naive/optimized toggle |
| Code demo | Syntax-highlighted step reveals | ` ```md magic-move ` — Shiki morphs code between clicks |
| **Terminal replay** | **Pre-recorded CLI session** | Vue SFC with scripted timers (typewriter) |
| **Scroll story** | **Tall scroll-driven narrative** | Vue SFC + IntersectionObserver reveals inside one slide |
| Finale | Cinematic close | `v-motion` scale-in, `view-transition` (View Transitions API) |
| (global) | Rich transitions | `slide-left/up`, `fade`, `view-transition` per slide |

Speaker notes are written on every slide (HTML comments) → **presenter view (`p`)** gives
notes + timer + next-slide preview out of the box.

## Verified

- ✅ `slidev build --base /proto/slidev/` succeeds; base path baked into `index.html`.
- ✅ Served under the base path → HTTP 200, fully static (no server process).
- ✅ Token counter tokenizes live in-browser via `gpt-tokenizer` — no API calls.

## What Slidev made *easy*

- **Fragments, transitions, code magic-move, presenter view** are first-class — near-zero code. The
  code-morph (`magic-move`) is genuinely impressive and hard to beat elsewhere.
- **Markdown-first authoring.** Content is a single `slides.md`; slides stay legible and diffable —
  a real fit for a git-hosted repo and for swapping real content in later.
- **Static build is one flag.** `--base` handled the GitHub Pages sub-path cleanly.
- **Vue components auto-import** from `components/` and drop straight into slides — the live widgets
  were quick.

## What Slidev made *hard* / caveats

- **Bold custom theming is against the grain.** Slidev is opinionated toward the default/seriph
  look; the dramatic dark theme needed hand-written CSS overriding `.slidev-layout`. Doable, not
  turnkey. A dedicated theme package would be the "proper" path for the original version.
- **Scroll-driven slides are DIY.** Slidev's model is one-slide-per-keypress; a tall scrollable
  narrative is a custom component fighting the deck's height constraints. It works but isn't native
  — the heterogeneous nav (keyboard slides vs. scroll pages) is exactly the map's open
  "Navigation / UX model" question.
- **Bundle weight.** `gpt-tokenizer` pulls a ~977 kB (gzip 445 kB) chunk. Fine for a one-off talk;
  worth lazy-loading if kept.
- **External font fetch.** The default setup pulls Inter/DM Mono from Google Fonts at runtime — fine
  on GitHub Pages, but not strictly self-contained. Slidev's local-fonts option would fix it.

## One-line verdict

Slidev is the strongest option for **built-in presentation mechanics** (transitions, fragments,
code magic-move, presenter view) with the least code, and its markdown-first authoring suits this
repo. Its weaknesses are **heavy custom theming** and **non-native scroll narratives** — both
surmountable, but they're where a from-scratch approach (see the Astro prototype, #8) would win.
