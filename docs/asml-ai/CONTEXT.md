# ASML AI deck

The presentation "Getting the Most from AI", built at [`/decks/asml-ai`](../../src/pages/decks/asml-ai/index.astro) and given live to ASML executives. The vocabulary below is this context's ubiquitous language: these words appear in the markup, in the modules under [`src/lib/asml-ai/`](../../src/lib/asml-ai/), in issue titles, and in every conversation about the deck.

Charted by five wayfinder maps: [#4](https://github.com/atilileri/atilileri.github.io/issues/4) (the capability showcase this deck was copied from), [#20](https://github.com/atilileri/atilileri.github.io/issues/20), [#29](https://github.com/atilileri/atilileri.github.io/issues/29), [#42](https://github.com/atilileri/atilileri.github.io/issues/42) and [#63](https://github.com/atilileri/atilileri.github.io/issues/63).

**This glossary is normative.** When the code or an issue disagrees with a term below, the code or the issue is wrong. Exceptions are listed at the end: third-party contracts, and the things this glossary does not govern.

## The deck's structure

**Deck**:
The whole presentation at `/decks/asml-ai`. One deck, deliberately not a reusable authoring system (map #4).
_Avoid_: Presentation, slideshow, talk

**Chapter**:
A numbered part of the Deck, opened by a Divider. Chapters 1 to 4 are built, chapter 5 is in progress, chapter 6 is the planned outro, and chapter 99 is the Attic.
_Avoid_: Section — that word belongs to the markup, not to us. Also part, act.

**Spine**:
A Chapter's locked, ordered list of Slides. The grilling that locks one is a "spine grilling" ([#54](https://github.com/atilileri/atilileri.github.io/issues/54), [#70](https://github.com/atilileri/atilileri.github.io/issues/70)).
_Avoid_: Never use Spine for the Roadmap, and never for a Step rail. Both meanings existed before this glossary and both are wrong.

**Movement**:
A run of consecutive Slides inside one Chapter that carries one half of its argument. Chapter 4 has two — "prepare it", then "defend it". A Movement is bigger than a Slide and smaller than a Chapter.

**Slide**:
One unit of the Deck. One `<section>` element, one thing on the wall.
_Avoid_: Screen — a screen is the glass in the room, and the deck's own text uses it that way. Also page, card.

**Divider**:
The title-card Slide that opens a Chapter. It exists to say "a new part starts now". There are exactly two kinds, and the kind is always named.

**Wash divider**:
A Divider whose arrival fires the Wash — the full-screen blue wipe. Reserved for chapters 1 and 6 only, so the effect keeps its force (map #29).
_Avoid_: Bare "divider" when this kind is meant.

**Roadmap divider**:
A Divider that shows all four Factors with the entered Chapter's Factor lit and the other three dim. Used for chapters 2 to 5. It carries no Wash and no glosses. Every Roadmap divider is a Callback to the Roadmap.
_Avoid_: Bare "divider" when this kind is meant.

**Roadmap**:
Chapter 1's Slide showing all four Factors at equal weight. It is the only Slide that prints each Factor's gloss. It is not a Divider — it opens nothing. [`RoadmapDivider.astro`](../../src/components/deck/RoadmapDivider.astro) draws both this and the Roadmap dividers, which is exactly why the two need separate names.
_Avoid_: Spine, route, agenda

**Factor**:
One of the four things the Deck is about: Under the hood, Tokenomics, Best practices, Operating model. Each Factor owns one Chapter, 2 to 5. The labels live in one place, [`roadmap.ts`](../../src/lib/asml-ai/roadmap.ts).
_Avoid_: Beat, pillar, theme

**Attic**:
Chapter 99. Slides parked out of the running order — showcase leftovers kept for reference. Never presented.

**Chrome**:
The persistent bar around the Deck: the chapter name, the slide counter, and the keyboard legend. It is not part of any Slide.

**Callback**:
A returning image or line from an earlier Chapter, used so the room recognises it rather than reads it again. A Callback is never a new image.

**Cold open**:
A Slide that puts a number or an image up before any explanation of it. Chapter 4 opens on one.

**Wash**:
The full-screen blue panel that wipes across the viewport in 780 ms. An animation, not a Slide. Only a Wash divider fires it.

## A slide's parts

**Eyebrow**:
The small label above the Headline. Its shape is locked as `<role> · <mechanic>` ([#23](https://github.com/atilileri/atilileri.github.io/issues/23)). Design jargon, kept deliberately: it has one meaning, it competes with no other word, and renaming it would cost forty-five edits for nothing.

**Headline**:
The Slide's largest line. What the room reads first.

**Opening line**:
The one line under the Headline that sets up a Widget or an image.
_Avoid_: Lede

**Text**:
The words printed on a Slide.
_Avoid_: Copy — an advertising word. Old issue titles keep it; history is not rewritten.

**Closing line**:
The last line on a Slide — the sentence the Slide exists to deliver.
_Avoid_: Beat — it meant three different things before this glossary: this one, a spoken pause, and a Factor.

**Presenter note**:
The `<aside class="notes">` on a Slide. It carries what the Slide must not print — sourcing, caveats, and the answer to a challenge from the room.
_Avoid_: Speaker note

**Fragment**:
One arrow press inside a Slide. A Slide with four Fragments takes five presses to leave. Reveal.js owns this word and its `class="fragment"`; we adopt it rather than compete with it. See Third-party contracts.
_Avoid_: Step, animation, reveal, click, build

## Widgets and their units

**Widget**:
An interactive thing on a Slide that the room can watch change. A Slide either has one or is static.
_Avoid_: Island — that is Astro's word for a build concern. See Third-party contracts.

**Step rail**:
The hidden row of Fragments that drives a Widget forward, so the clicker's arrow keys work with no custom key binding. Reveal's Fragment state is the single source of truth for where a Widget is.
_Avoid_: Spine

**Move**:
One row of the agent-loop ledger. The loop has twelve Moves and four billing events, and that asymmetry is the point of the Slide. Several Moves make one Turn.
_Avoid_: Step, turn

**Turn**:
One exchange in a session — what the user said and what the agent answered. The unit the smart-zone and roll-back Widgets count in. Bigger than a Move.
_Avoid_: Move, round, message

**Level**:
One notch of reasoning effort. The spend curve walks up Levels, one per arrow press.
_Avoid_: Step

## How we work on the deck

**Map**:
The wayfinder issue that charts a body of work on the Deck. Five of them exist.

**Prototype**:
A ticket that answers one design question by building candidates and picking one. The destination is a decision, not shipped code.

**Variant**:
One candidate inside a Prototype — one full-size Slide on a throwaway branch, built to be judged and then discarded. "Variant C wins" ([#26](https://github.com/atilileri/atilileri.github.io/issues/26)) is the standard form.
_Avoid_: Comp

## Third-party contracts

These words are not ours. A library or the platform owns each one, and its spelling is fixed by an API we do not control. Record them, use them for the mechanism, and never rename them.

- **`fragment`** — reveal.js. The class that makes an element appear on an arrow press, and the JS state our controllers read. Also our own term for the thing itself, above; the two agree on purpose.
- **`island`** — Astro. A component that ships client-side JavaScript. Describes the build, never what the room sees. Say Widget for that.
- **`section`** — HTML, and reveal.js's element for a slide. Say Slide when you mean the unit. The `data-section` attribute is misnamed for this reason and is flagged for review.
- **`notes`** — reveal.js's presenter-notes plugin, and the `<aside class="notes">` it reads.
- **`sub-slide`** and **vertical stack** — reveal.js. Slides stacked under one another, reached with the down arrow. The Attic holds the only one.
- **`data-*`** — HTML. Every hook the controller selects on.

## Not governed by this glossary

- **Words the Deck quotes from ASML's world.** The guardrails Slide says "Process steps, tool names, part numbers". That is ASML's word for ASML's work, not our metalanguage. Do not "fix" it.
- **Ordinary English in Presenter notes.** "Silence for a beat" is a stage direction, not the term Beat. Presenter notes are spoken, so they use spoken English.
- **On-screen Text locked by an earlier issue.** Where locked Text uses a word this glossary retired, the Text wins until its own issue is reopened. The room has no glossary. Two known cases: the agent-loop Slide prints "Twelve steps, four model calls", and the keyboard legend prints "move" as an ordinary verb for navigating.
- **Closed issue titles.** History stays as written.
