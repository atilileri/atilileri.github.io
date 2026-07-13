# Presentation Frameworks for a Static GitHub Pages User-Site

**Research ticket:** [issue #9](https://github.com/atilileri/atilileri.github.io/issues/9) (parent: #4, blocks #11)
**Date:** 2026-07-13
**Context:** Personal site built with **Astro 6.1.5 + Tailwind CSS 4** (ESM-only, Node >=22.12), deployed as a **static GitHub Pages user-site** at `https://atilileri.github.io` — **base path `/`**, no backend. Goal: a bold, feature-rich live *web presentation* (not a slide deck), presented live from the `.github.io` domain on another machine. Fully static, client-side only.

Candidates evaluated: **reveal.js, Slidev, Spectacle (React), MDX-deck, Astro-native custom build.**

---

## The base-path finding that changes everything

The single most important constraint fact: this is a **user/org site** (`<username>.github.io`), which GitHub serves at the **domain root `/`** — not the `/<repo>/` subpath that *project* sites use. Astro's own deploy guide is explicit:

> "**User/Organization Site** (`username.github.io`): Set `site` to `https://<username>.github.io`. **No `base` value needed** — skip this if your repository matches the special pattern."
> "**Project Site**: … **Configure `base`** as the repository name … so that Astro understands your website's root is `/my-repo`, rather than the default `/`."
> — [Astro › Deploy to GitHub Pages](https://docs.astro.build/en/guides/deploy/github/)

**Consequence:** the notorious GitHub-Pages asset/routing pain (rewriting every link and asset URL with a `/repo/` prefix) **does not apply at the site root.** Any framework that builds a static bundle assuming it lives at `/` will "just work" — *provided the presentation is served at the domain root or you tell that framework its own sub-base.* The gotcha migrates from "GitHub Pages base path" to "how the presentation coexists with the existing Astro site's routes" (see per-framework notes).

The current `astro.config.mjs` already reflects this correctly: `site: "https://atilileri.github.io"` with **no `base`**.

---

## Comparison table

| Criterion | reveal.js | Slidev | Spectacle (React) | MDX-deck | Astro-native |
|---|---|---|---|---|---|
| Static output for GH Pages | Yes — pure static HTML, or npm ES module | Yes — `slidev build` → static SPA in `dist/` | Yes — bundler (Vite/webpack) or single no-server HTML file | Yes (React SPA build) | Yes — it *is* the static site |
| Works at user-site root `/` | Yes, trivially | Yes (no `--base` at root) | Yes | Yes | Yes (native) |
| Sub-path if not at root | Relative asset paths / config | `slidev build --base /talks/x/` (must begin+end with `/`) | Bundler `base` config | Build config | Astro `base` option |
| Extra runtime added | **None** (vanilla JS/HTML) | **Vue** + Vite | **React** | **React** + Gatsby/Theme-UI/Emotion | **None** |
| Fits Astro 6 + Tailwind 4 ESM build | Best — import as ESM into an Astro page, shares Vite | Separate parallel Vue/Vite build & CLI | Own bundler; or React island | Own Gatsby/webpack stack | Native, zero new toolchain |
| Custom interactive widgets | Any HTML/JS/iframe; framework-agnostic | Vue components, iframes, WebGL, live API calls | Any React component/library | React/MDX components | Astro islands (React/Vue/Svelte via `client:*`) |
| Scroll-driven / arbitrary sections | Yes (plain HTML in slides / around deck) | Yes (web-app capabilities) | Within React app | Within React app | **Native** — full page control |
| Speaker notes / presenter view | Yes — speaker view w/ notes, timer, upcoming slide | Yes — presenter mode + notes + recording | Yes — presenter mode w/ notes | Yes — `Option+P`, notes, timer | Build-your-own |
| Keyboard nav | Yes | Yes | Yes | Yes | Build-your-own |
| Fragments / step animations | Yes (fragments) | Yes (`v-click` steps, motion) | Yes (appear/steps) | Yes | Build-your-own |
| Code demos / live coding | Highlight + embed | **Shiki + Monaco live editor, TwoSlash** | Live code panes | MDX code | Astro Shiki + islands |
| PDF export | Yes (Chrome print stylesheet) | Yes (PDF/PPTX/PNG/SPA) | Via print | Via print | N/A |
| Maintenance status | Actively maintained | Actively maintained | **Active** (v10.2.3, Oct 2025) | **Unmaintained** (v4.1.1, ~2020) | N/A (Astro core) |

---

## Per-framework notes

### reveal.js
- **Static hosting:** Three install paths. The **Basic Setup** is *entirely static HTML with no build step* — "Download the latest reveal.js version" and "Open index.html in a browser." The **npm/ES-module** path integrates into an existing bundler project. ([reveal.js › Installation](https://revealjs.com/installation/))
- **Base-path gotcha:** none at root. Being plain relative HTML/CSS/JS, a downloaded deck references its assets relatively, so it is portable under any path. As an npm ES module it rides the host bundler (Vite) — a natural fit for Astro.
- **Astro toolchain cost:** lowest of all. **No React/Vue runtime.** Import `reveal.js` as an ES module into a single `.astro` page (client-side script), or drop a static deck under `public/`. Shares Astro's existing Vite pipeline; no parallel build.
- **Interactive/scrollable content:** slides are arbitrary HTML, so any JS widget, `<iframe>`, canvas, or embedded island works. Scroll-driven sections can wrap or sit alongside the deck.
- **Presenter features:** speaker view (notes shown in overlay or on a separate page, with timer and upcoming slide), fragments for step reveal, full keyboard nav, PDF export via print stylesheet (Chrome/Chromium confirmed). ([reveal.js › PDF Export](https://revealjs.com/pdf-export/))
- **Exec-talk strength:** mature transitions/animations, auto-animate, embedded media; framework-agnostic so you can splice in any modern web widget.

### Slidev
- **Static hosting:** `slidev build` produces a static SPA in `dist/`. GitHub Pages, Netlify, Vercel, and Docker are documented targets. ([Slidev › Hosting](https://sli.dev/guide/hosting))
- **Base-path gotcha:** at the domain root, **no flag needed**. Under a sub-route use `slidev build --base /talks/my-cool-talk/` — the docs stress the "**`--base` path must begin and end with a slash `/`**." This matters here: Slidev builds its *own* SPA, so if it must coexist with the Astro site it lives at a subpath and needs `--base` set to match (or ship as a separate deploy).
- **Astro toolchain cost:** meaningful. Slidev is a **Vue + Vite** app with its own CLI and build; it does **not** plug into the Astro build. You would run a **second, parallel build pipeline** and add the **Vue runtime**. ([Slidev › Why](https://sli.dev/guide/why))
- **Interactive/scrollable content:** strong — "Everything that can be done in a normal web app can be applied to your slides": embed Vue components, iframes, WebGL, live API requests.
- **Presenter features:** presenter mode, speaker notes, built-in recording/camera, `v-click` step animations and motion, keyboard nav; export to PDF/PPTX/PNG/SPA.
- **Exec-talk strength:** best-in-class *developer* presentation UX — Shiki highlighting, **Monaco live editor**, TwoSlash, animations. Very polished for code-heavy talks; heavier to embed inside a non-Vue site.

### Spectacle (React)
- **Static hosting:** builds via **Vite or webpack** to a static bundle; there is also a **"One Page" template using `htm`** that "does not require a server" — a single static HTML file. ([Spectacle docs](https://nearform.com/open-source/spectacle/docs/), [FormidableLabs/spectacle](https://github.com/FormidableLabs/spectacle))
- **Base-path gotcha:** none at root; sub-path handled by the bundler's `base`/`publicPath`. Like Slidev, it is its own React app that would sit at a subpath of the Astro site or deploy separately.
- **Astro toolchain cost:** adds the **React runtime** and (in the template flow) its own bundler. Could instead be embedded as an **Astro React island** (`client:only="react"`), but that pulls React into an otherwise runtime-free Astro site.
- **Interactive/scrollable content:** any React component/library usable in slides; MDX supported historically.
- **Presenter features:** presenter mode ("view your slides and notes on one screen while your audience views … another"), keyboard nav, appear/step animations, code panes.
- **Maintenance:** healthy — badge states "actively working"; latest release **v10.2.3 (Oct 2025)**, 72 releases.
- **Exec-talk strength:** clean JSX-driven decks, live-demo code, good if the team is React-native.

### MDX-deck
- **Static hosting:** builds a **React MDX** SPA (integrates Gatsby, Theme-UI, Emotion). ([jxnblk/mdx-deck](https://github.com/jxnblk/mdx-deck))
- **Maintenance — disqualifying:** npm shows **latest v4.1.1, last published ~6 years ago (~2020)**, status **Inactive**; effectively unmaintained. ([mdx-deck on npm](https://www.npmjs.com/package/mdx-deck), [Snyk advisor](https://snyk.io/advisor/npm-package/mdx-deck)). The related `redeck` repo is explicitly **DEPRECATED**.
- **Astro toolchain cost:** high and risky — old React + Gatsby/webpack stack that conflicts with a modern Vite/ESM/Node-22 setup; known build breakage in recent issues.
- **Presenter features:** presenter mode (`Option+P`), `Notes` component, themes via Theme-UI/Emotion.
- **Verdict:** **do not adopt** — stale dependencies against Astro 6 + Tailwind 4 (ESM, Node >=22.12).

### Astro-native custom build
- **Static hosting:** it *is* the existing static site — one build, one deploy, already correct for the user-site root (`site` set, no `base`). No second pipeline, no coexistence problem.
- **Interactivity model:** Astro islands. Framework components (React/Preact/Svelte/Vue/Solid/Alpine) hydrate selectively via client directives — `client:load`, `client:idle`, `client:visible`, `client:media`, `client:only` — and multiple frameworks can coexist (each framework shipped once). This keeps the page static-first and ships JS only where a widget needs it. ([Astro › Framework Components](https://docs.astro.build/en/guides/framework-components/))
- **Scroll-driven sections:** native — you own the full page, so scroll-linked sections, arbitrary layouts, and Tailwind 4 styling are unconstrained (this is the one option that is genuinely a *web presentation* rather than a slide SPA).
- **Toolchain cost:** **zero new runtime**; Tailwind 4 and MDX already wired up.
- **Trade-off:** no built-in slide engine — keyboard nav, fragments, and speaker/presenter view are **build-your-own** (or delegate the slide portion to an embedded reveal.js deck).

---

## Bottom line (for the static GitHub-Pages user-site constraint)

Because the target is a **user site served at root `/`**, the classic GitHub-Pages base-path problem is off the table; the real differentiator is **how well each option coexists with the existing Astro 6 + Tailwind 4 (ESM) single build** and how much runtime it drags in.

**Recommended ranking:**

1. **Astro-native shell + embedded reveal.js** *(best fit)* — Keeps one build, one deploy, zero framework runtime, full Tailwind 4 control and native scroll-driven sections for the "bold web presentation," while reveal.js (imported as an ESM module into an Astro page, or dropped in `public/`) supplies proven slide mechanics: speaker view with notes/timer, fragments, keyboard nav, PDF export. reveal.js is the only slide engine that adds **no React/Vue runtime** and rides Astro's existing Vite pipeline.
2. **reveal.js alone** — If a straight deck is enough, this is the lowest-friction, framework-agnostic, static-by-default choice; interactive widgets and iframes embed freely inside slides.
3. **Slidev** — Outstanding for a code-forward developer/exec talk (Monaco live editor, Shiki, motion, recording), *but* it is a separate **Vue/Vite** app with its own build; best deployed as a **standalone sub-deploy** (own repo/site, or a subpath with `--base`) rather than merged into the Astro build.
4. **Spectacle** — Solid, actively maintained, good if the team is React-first; costs a React runtime + own bundler, same coexistence caveat as Slidev.
5. **MDX-deck** — **Not recommended.** Unmaintained since ~2020; its Gatsby/webpack stack clashes with the Astro 6 / Node 22 / ESM toolchain.

---

## Primary sources
- Astro — Deploy to GitHub Pages (user vs project `base`): https://docs.astro.build/en/guides/deploy/github/
- Astro — Framework Components / islands & client directives: https://docs.astro.build/en/guides/framework-components/
- reveal.js — Installation (static vs npm/ESM): https://revealjs.com/installation/
- reveal.js — PDF Export & speaker view: https://revealjs.com/pdf-export/
- Slidev — Hosting & `--base`: https://sli.dev/guide/hosting
- Slidev — Why Slidev (features/runtime): https://sli.dev/guide/why
- Spectacle — Docs (templates, presenter mode): https://nearform.com/open-source/spectacle/docs/
- Spectacle — Repository & release status: https://github.com/FormidableLabs/spectacle
- MDX-deck — Repository: https://github.com/jxnblk/mdx-deck
- MDX-deck — npm (version/maintenance): https://www.npmjs.com/package/mdx-deck
- MDX-deck — Snyk advisor (inactive status): https://snyk.io/advisor/npm-package/mdx-deck
