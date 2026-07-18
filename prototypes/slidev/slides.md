---
theme: default
title: Getting the Most from AI — Slidev Capability Showcase
info: |
  Throwaway prototype for atilileri.github.io wayfinder map #4.
  Demonstrates Slidev's full capability range for the exec presentation.
class: text-center
highlighter: shiki
lineNumbers: false
drawings:
  persist: false
mdc: true
transition: slide-left
css: unocss
fonts:
  sans: Inter
  mono: DM Mono
---

<div class="aurora" />

<div class="relative z-10" v-motion :initial="{ opacity: 0, y: 60 }" :enter="{ opacity: 1, y: 0, transition: { duration: 700 } }">

<div class="eyebrow mb-6">atilileri.github.io · live from the browser</div>

<h1 class="grad-title" style="font-size: 5.5rem">Getting the Most<br/>from AI</h1>

<p class="mt-8 text-xl opacity-70">Token optimization × Matt Pocock's skills — a Slidev capability demo</p>

</div>

<div class="abs-br m-8 text-sm opacity-50" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 0.5, transition: { delay: 1200 } }">
  press <kbd>space</kbd> to begin →
</div>

<!--
Speaker note: This is the cinematic cold-open. The aurora backdrop animates continuously;
the headline flies up on entry via v-motion. Slidev DOES have full presenter view (press `p`)
with these notes, a timer, and next-slide preview.
-->

---
transition: fade-out
layout: center
---

<div class="eyebrow mb-4">the through-line</div>

# Every token is a decision

<div class="mt-10 text-2xl opacity-80 max-w-3xl mx-auto">
Verbose prompts cost latency <span class="opacity-40">and</span> money <span class="opacity-40">and</span> accuracy.
This deck shows the payoff — <span class="grad-title">live, in your browser</span>.
</div>

<!--
Speaker note: Simple center layout, fade transition between hero and thesis.
Keeps a calm beat before the interactive density starts.
-->

---
layout: two-cols
layoutClass: gap-8
transition: slide-up
---

# Fragment build-up

Reveal one idea at a time within a single slide.

<v-clicks>

- **Strip politeness padding** — "please kindly" earns nothing
- **Deduplicate the system prompt** — say it once
- **Cut few-shot fat** — 2 sharp examples beat 6 mediocre
- **Let tools carry structure** — don't restate the schema
- **Repair, don't retry** — targeted fixes save whole calls

</v-clicks>

::right::

<div v-click class="mt-16 p-6 rounded-xl" style="background:#12121a;border:1px solid #26263a">
<div class="eyebrow mb-2">net effect</div>
<div class="text-6xl font-black grad-title">−71%</div>
<div class="opacity-60 mt-2">input tokens on a real system prompt</div>
</div>

<!--
Speaker note: `<v-clicks>` auto-wraps each list item as a fragment. The right-hand
payoff card appears last. This is the classic "build tension, then reveal" beat.
-->

---
transition: slide-left
---

# Live token counter

<div class="eyebrow mb-6">type anything — it tokenizes in the browser (no server)</div>

<TokenCounter />

<!--
Speaker note: This is a real interactive widget. gpt-tokenizer runs 100% client-side,
so it works on static GitHub Pages. Hit "Optimize this prompt" live to show the token
count drop in real time — the money moment of the talk.
-->

---
transition: slide-left
---

# Animated data-viz

<div class="eyebrow mb-6">where the tokens actually go — toggle naive vs. optimized</div>

<TokenChart />

<!--
Speaker note: Bars grow on mount (CSS transition), and re-animate when you toggle
Naive/Optimized. The −% badge lands the argument visually.
-->

---
transition: slide-up
---

# Code demo with step reveals

Slidev's magic-move morphs one code block into the next.

````md magic-move {lines: true}
```ts
// v1 — verbose, restates everything
const system = `You are a helpful, professional, and courteous
assistant. Please always be polite. Please review the code.
Please give detailed, thorough, comprehensive feedback.`
```

```ts
// v2 — deduplicated
const system = `Senior engineer. Review the code.
Give detailed feedback.`
```

```ts
// v3 — structure moved into tools, prompt stays lean
const system = `Senior engineer. Review the code.`
const tools = [reviewSchema] // structure lives here, not in prose
```
````

<!--
Speaker note: Each click morphs the code — Slidev diffs and animates token positions.
You can also do line highlighting with `{1|2-3|all}` on a normal fenced block.
-->

---
layout: center
transition: view-transition
class: text-center
---

<div class="eyebrow mb-4">pre-recorded — no shell, no server</div>

# Terminal / CLI replay

<div class="mt-6 max-w-2xl mx-auto">
<TerminalReplay />
</div>

<!--
Speaker note: A scripted replay of a Claude Code + wayfinder session. Click "replay"
to re-run it live. Purely client-side timers — safe for GitHub Pages.
`view-transition` is a genuinely cinematic transition (uses the View Transitions API).
-->

---
transition: fade
class: p-0
---

# Scroll-driven narrative

<div class="eyebrow px-14 -mt-4 mb-2">a "slide" that is really a tall, scrollable page</div>

<div style="height: 74%; padding: 0 3.5rem">
<ScrollStory />
</div>

<!--
Speaker note: This slide doesn't advance on space — you SCROLL inside it. Each beat
reveals via IntersectionObserver. Shows heterogeneous slide types coexisting: keyboard
slides + scroll pages in one deck. (Nav model is map ticket "Not yet specified".)
-->

---
layout: center
transition: view-transition
---

<div v-motion :initial="{ scale: 0.6, opacity: 0 }" :enter="{ scale: 1, opacity: 1, transition: { duration: 600 } }">

<h1 class="grad-title" style="font-size: 4.5rem">Slidev can do all of it.</h1>

</div>

<div class="mt-10 grid grid-cols-3 gap-4 text-sm opacity-80 max-w-3xl mx-auto" v-motion :initial="{opacity:0,y:20}" :enter="{opacity:0.8,y:0,transition:{delay:400}}">
  <div class="p-3 rounded-lg" style="background:#12121a">✓ Motion & transitions</div>
  <div class="p-3 rounded-lg" style="background:#12121a">✓ Live Vue widgets</div>
  <div class="p-3 rounded-lg" style="background:#12121a">✓ Scroll narratives</div>
  <div class="p-3 rounded-lg" style="background:#12121a">✓ Code magic-move</div>
  <div class="p-3 rounded-lg" style="background:#12121a">✓ Presenter view (p)</div>
  <div class="p-3 rounded-lg" style="background:#12121a">✓ Static build</div>
</div>

<div class="mt-10 eyebrow">built as a throwaway · wayfinder map #4 · ticket #6</div>

<!--
Speaker note: Closing cinematic beat — headline scales in, capability grid fades up.
Everything here builds to a fully static `dist/` deployable to GitHub Pages under a
base path. That's the last checkbox on the ticket.
-->
