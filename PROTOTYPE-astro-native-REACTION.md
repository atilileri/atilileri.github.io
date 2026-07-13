# Astro-native prototype — reaction note

**Ticket:** #8 · **Branch:** `prototype/astro-native-showcase` · **Route:** `/prototypes/astro-native/`
Throwaway. No presentation framework — plain Astro 6 + Tailwind-adjacent CSS + a few vanilla-TS `<script>`s.

## How to look at it

```bash
npm run build && npx astro preview
# open http://localhost:4399/prototypes/astro-native/
```

Keys on stage: `↑/↓` (or space) move · `→` also advances in-slide fragments · `1–9` jump · `n` presenter notes · `f` fullscreen · click the "Chapter II" card for the cinematic route morph.

## Capability checklist (all required items built)

| Required capability | Built as | Verdict |
|---|---|---|
| Dramatic hero / static title, motion on entry | `hero` slide, word-by-word CSS reveal + drifting gradient | ✅ easy |
| Tall scroll-driven narrative w/ scroll reveals | `slide--tall` + sticky header + `IntersectionObserver` reveals | ✅ easy |
| Live interactive widget (tokenizer/counter) | `TokenizerWidget.astro`, heuristic tokenizer + live cost, 100% client-side | ✅ easy |
| Animated data-viz | `TokenCostChart.astro`, hand-rolled SVG, bars grow + count-up on view | 🟡 medium (no chart lib) |
| Code demo w/ step reveals | Astro built-in `<Code>` (Shiki) + fragment callouts | ✅ easy (highlighting free) |
| Pre-recorded terminal/CLI replay | `TerminalReplay.astro`, self-typing timed script, `↻ replay` | ✅ easy |
| Rich transitions + one cinematic moment | scroll-snap between slides + Astro **View Transitions** cross-route morph (`transition:name`) + a chapter wipe | ✅ easy |
| Fragment build-up within a slide | `[data-frag]` + per-slide pointer in the deck controller | 🟡 medium (hand-written) |
| Speaker notes / presenter view | Notes overlay (`n`) reading `data-note` per slide | ⚠️ partial — see below |
| Builds & serves under static GH Pages base | `astro build` → 82 static pages incl. both routes; `curl` 200 | ✅ confirmed |

## What Astro made **easy**

- **View Transitions are the standout.** `<ClientRouter />` + `transition:name="cinematic-cover"` gave a genuine shared-element morph between two routes with ~2 lines and zero JS of my own. This is the one thing a generic slides framework can't do as cleanly, and it's native here.
- **Shiki for free.** `<Code lang="ts" theme="night-owl" />` highlights at build time — zero client JS, no plugin. Perfect for a code-demo slide.
- **Scoped `<script>` + component scripts.** Each interactive widget is a self-contained `.astro` file; Astro bundles + minifies the inline modules automatically and inlines them. Co-location made the deck very readable.
- **Scroll-snap *is* the deck.** A "web presentation, not a slide deck" (the destination's phrasing) falls out of CSS `scroll-snap-type: y mandatory` — slides and tall scrollable narrative coexist under one scroller with no framework fighting me.
- **Static by default.** No adapter, no config; `astro build` emitted both routes as plain HTML. The fully-static GH-Pages constraint was a non-issue.
- **Base path:** trivial — `atilileri.github.io` is a user page served at `/`, so no `base` juggling. (A project page would need `base` + care with absolute `href`s like the ones I used.)

## What Astro made **hard** (or left to me)

- **Everything deck-shaped is hand-built.** Keyboard nav, the fragment/step-build state machine, the progress rail, autoplay-on-scroll — all vanilla TS I wrote. A dedicated deck framework (reveal.js/Slidev/Spectacle) ships these. ~250 lines of controller here that those give for free.
- **No real presenter view.** I built a notes *overlay*, but a true **dual-screen presenter view** (next-slide preview + timer on a second display) is **not native** and would need real work (`BroadcastChannel`/`window.open` syncing two tabs). If exec-talk presenter tooling matters, this is the biggest gap vs. reveal.js/Spectacle.
- **Charts are DIY.** No built-in dataviz; the animated bar chart is hand-rolled SVG. Fine for one chart, tedious if the real deck needs many.
- **View Transitions have sharp edges.** The morph only fires on same-origin, client-router navigations and needs `transition:name` on *both* endpoints; `prefers-reduced-motion` and browser support (Safari/FF) need testing before an exec stage. Not hard, but not free.
- **Interaction verification is on the human.** Build + route-200 are automated; the *feel* (timing of reveals, morph smoothness, fragment pacing) needs a human in a browser — this is a HITL prototype for exactly that reason.

## One-line take for the framework decision

> Astro-native wins hard on **integration** (it's already the repo), **View Transitions**, and **static hosting** — and loses on **deck ergonomics**: every slide behavior is code I own. It's the right base if we want the presentation to *be part of the site* and are willing to hand-maintain a small deck controller; it's the wrong base if presenter tooling and turnkey slide mechanics matter more than site integration.
