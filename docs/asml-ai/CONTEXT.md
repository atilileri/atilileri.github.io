# ASML AI deck

The presentation "Getting the Most from AI", built at [`/decks/asml-ai`](../../src/pages/decks/asml-ai/index.astro) and given live to ASML executives. The vocabulary below is this context's ubiquitous language: these words appear in the markup, in the modules under [`src/lib/asml-ai/`](../../src/lib/asml-ai/), in issue titles, and in every conversation about the deck.

Charted by five wayfinder maps: [#4](https://github.com/atilileri/atilileri.github.io/issues/4) (the capability showcase this deck was copied from), [#20](https://github.com/atilileri/atilileri.github.io/issues/20), [#29](https://github.com/atilileri/atilileri.github.io/issues/29), [#42](https://github.com/atilileri/atilileri.github.io/issues/42) and [#63](https://github.com/atilileri/atilileri.github.io/issues/63).

**This glossary is normative.** When the code or an issue disagrees with a term below, the code or the issue is wrong. Exceptions are listed at the end: third-party contracts, and the things this glossary does not govern.

## The deck's structure

**Deck**:
The whole presentation at `/decks/asml-ai`. One deck, deliberately not a reusable authoring system (map #4).
_Avoid_: Presentation, slideshow, talk
_Example_: The Deck runs at `/decks/asml-ai`. The Dutch journey is not part of it.

**Chapter**:
A numbered part of the Deck, opened by a Divider. Chapters 1 to 4 are built, chapter 5 is in progress, chapter 6 is the planned outro, and chapter 99 is the Attic.
_Avoid_: Section — that word belongs to the markup, not to us. Also part, act.
_Example_: We rehearse chapter 4 tonight.

**Spine**:
A Chapter's locked, ordered list of Slides. The grilling that locks one is a "spine grilling" ([#54](https://github.com/atilileri/atilileri.github.io/issues/54), [#70](https://github.com/atilileri/atilileri.github.io/issues/70)).
_Avoid_: Never use Spine for the Roadmap, and never for a Fragment row. Both meanings existed before this glossary and both are wrong.
_Example_: Map #63 locks the Spine of chapter 5 at six Slides.

**Movement**:
A run of consecutive Slides inside one Chapter that carries one half of its argument. Chapter 4 has two — "prepare it", then "defend it". A Movement is bigger than a Slide and smaller than a Chapter.
_Example_: The second Movement of chapter 4, "defend it", starts at the review Slide.

**Slide**:
One unit of the Deck. One `<section>` element, one thing on the wall.
_Avoid_: Screen — a screen is the glass in the room, and the deck's own text uses it that way. Also page, card.
_Example_: Cut the third Slide. Its Closing line repeats the Slide before it.

**Divider**:
The title-card Slide that opens a Chapter. It exists to say "a new part starts now". There are exactly two kinds, and the kind is always named.
_Example_: Chapter 6 still needs its Divider.

**Wash divider**:
A Divider whose arrival fires the Wash — the full-screen blue wipe. Reserved for chapters 1 and 6 only, so the effect keeps its force (map #29).
_Avoid_: Bare "divider" when this kind is meant.
_Example_: Chapter 1 opens on a Wash divider. Chapter 2 does not.

**Roadmap divider**:
A Divider that shows all four Factors with the entered Chapter's Factor lit and the other three dim. Used for chapters 2 to 5. It carries no Wash and no glosses. Every Roadmap divider is a Callback to the Roadmap.
_Avoid_: Bare "divider" when this kind is meant.
_Example_: The Roadmap divider of chapter 3 lights Tokenomics and dims the other three Factors.

**Roadmap**:
Chapter 1's Slide showing all four Factors at equal weight. It is the only Slide that prints each Factor's gloss. It is not a Divider — it opens nothing. [`RoadmapDivider.astro`](../../src/components/deck/RoadmapDivider.astro) draws both this and the Roadmap dividers, which is exactly why the two need separate names.
_Avoid_: Spine, route, agenda
_Example_: Reword the Tokenomics gloss on the Roadmap.

**Factor**:
One of the four things the Deck is about: Under the hood, Tokenomics, Best practices, Operating model. Each Factor owns one Chapter, 2 to 5. The labels live in one place, [`roadmap.ts`](../../src/lib/asml-ai/roadmap.ts).
_Avoid_: Beat, pillar, theme
_Example_: Chapter 5 owns the Operating model Factor.

**Attic**:
Chapter 99. Slides parked out of the running order — showcase leftovers kept for reference. Never presented.
_Example_: Park the old cost Slide in the Attic.

**Chrome**:
The persistent bar around the Deck: the chapter name, the slide counter, and the keyboard legend. It is not part of any Slide.
_Example_: The Chrome shows "Best practices" and the slide counter.

**Callback**:
A returning image or line from an earlier Chapter, used so the room recognises it rather than reads it again. A Callback is never a new image.
_Example_: The fork image in chapter 5 is a Callback to chapter 3.

**Cold open**:
A Slide that puts a number or an image up before any explanation of it. Chapter 4 opens on one.
_Example_: Chapter 4 starts with a Cold open: one number, no explanation yet.

**Wash**:
The full-screen blue panel that wipes across the viewport in 780 ms. An animation, not a Slide. Only a Wash divider fires it.
_Example_: The Wash runs too slowly on the room's projector.

## A slide's parts

**Eyebrow**:
The small label above the Headline. Its shape is locked as `<role> · <mechanic>` ([#23](https://github.com/atilileri/atilileri.github.io/issues/23)). Design jargon, kept deliberately: it has one meaning, it competes with no other word, and renaming it would cost forty-five edits for nothing.
_Example_: The Eyebrow reads "Reviewer · fork".

**Headline**:
The Slide's largest line. What the room reads first.
_Example_: Shorten the Headline to five words.

**Opening line**:
The one line under the Headline that sets up a Widget or an image.
_Avoid_: Lede
_Example_: The Opening line tells the room what the Widget counts.

**Text**:
The words printed on a Slide.
_Avoid_: Copy — an advertising word. Old issue titles keep it; history is not rewritten.
_Example_: The Text on this Slide runs to three lines. Cut it to two.

**Closing line**:
The last line on a Slide — the sentence the Slide exists to deliver.
_Avoid_: Beat — it meant three different things before this glossary: this one, a spoken pause, and a Factor.
_Example_: The Closing line is "You pay for the loop, not for the answer".

**Presenter note**:
The `<aside class="notes">` on a Slide. It carries what the Slide must not print — sourcing, caveats, and the answer to a challenge from the room. Presenter notes are governed by this glossary like everything else: they are written to be spoken, not written in a private vocabulary.
_Avoid_: Speaker note
_Example_: Put the source of the number in the Presenter note, not on the Slide.

**Fragment**:
One arrow press inside a Slide. A Slide with four Fragments takes five presses to leave. Reveal.js owns this word and its `class="fragment"`; we adopt it rather than compete with it. See Third-party contracts.
_Avoid_: Step, animation, reveal, click, build
_Example_: Put the caveat on a Fragment, so the room reads the number first.

**Lit**:
The state of one member of a drawn set — a Factor on a Roadmap divider, a Stop on the Rail, a node on a fork — while the Slide is talking about it. Its peers are Dim. Lit says **where you are in the set**, never **which member matters most**. More than one member can be Lit at once; on the Rail that is a Span. The code already spells it this way (`.lit`, `.is-lit`).
_Avoid_: Active, selected, on. Also current and highlighted — reveal.js owns both, for `.current-fragment` and for the code plugin. See Third-party contracts.
_Example_: On the Rail, the review Stop is Lit and the six other Stops are Dim.

**Dim**:
The state of every member of a drawn set that is not Lit. A Dim member stays readable on purpose, because the room has to see the whole set and where it sits inside it. ⚠ Dim is not off and it is not *less important*: [#71](https://github.com/atilileri/atilileri.github.io/issues/71) found that with Text under every Stop, dimming a run of them can read as a ranking rather than as position. A thing that is not on the wall at all is not Dim — it is an unrevealed Fragment. Printing something **greyed** is a third thing again: it marks an absence the room should notice, like *Not built yet* ([#93](https://github.com/atilileri/atilileri.github.io/issues/93)), and it can happen to a Lit member.
_Avoid_: Greyed, disabled, inactive, off
_Example_: Keep the Dim Stops readable. The room must still see the whole pipeline.

## Widgets and their units

**Widget**:
An interactive thing on a Slide that the room can watch change. A Slide either has one or is static.
_Avoid_: Island — that is Astro's word for a build concern. See Third-party contracts.
_Example_: The spend-curve Widget shows one more Level on each arrow press.

**Fragment row**:
The hidden row of Fragments that drives a Widget forward, so the clicker's arrow keys work with no custom key binding. Reveal's Fragment state is the single source of truth for where a Widget is. It is invisible — the room never sees it.
_Avoid_: Spine, step rail, rail — a Rail is something the room sees, and this is not.
_Example_: The Fragment row drives the Widget, so the clicker needs no extra key.

**Rail**:
Chapter 5's on-screen pipeline component: the seven Stops, with the current Stop or Span lit. Reserved by [#103](https://github.com/atilileri/atilileri.github.io/issues/103), drawn from prototype [#91](https://github.com/atilileri/atilileri.github.io/issues/91). The room sees a Rail. It never sees a Fragment row.
_Example_: The Rail draws the seven Stops across the foot of the Slide.

**Stop**:
One of the seven parts of the operating model chapter 5 describes: wayfinder, grill/research/prototype, to-spec, to-tickets, implement, review, Reconcile. A Stop is the practice itself and the mark the Rail draws for it — one thing, seen twice. Six Slides carry the seven Stops, so one Slide lights a Span ([#101](https://github.com/atilileri/atilileri.github.io/issues/101)).
_Avoid_: Stage — the code already uses `-stage` class names for the box a Widget draws into (`.sz-stage`, `.al-stage`), which is a layout concern and not this word. Also step, phase, beat.
_Example_: The implement Stop gets its own Slide.

**Span**:
Two neighbouring Stops lit together, because one Slide carries both. The Rail lights a Span exactly as it lights a Stop, and prints every command inside it.
_Avoid_: Range, group
_Example_: One Slide carries grill and research, so the Rail lights that Span.

**Move**:
One row of the agent-loop ledger. The loop has twelve Moves and four billing events, and that asymmetry is the point of the Slide. Several Moves make one Turn.
_Avoid_: Step, turn
_Example_: Move 7 calls the search tool and bills nothing.

**Turn**:
One exchange in a session — what the user said and what the agent answered. The unit the smart-zone and roll-back Widgets count in. Bigger than a Move.
_Avoid_: Move, round, message
_Example_: The roll-back Widget goes back three Turns.

**Level**:
One notch of reasoning effort. The spend curve walks up Levels, one per arrow press.
_Avoid_: Step
_Example_: Each arrow press raises the Level, and the spend goes up with it.

## How we work on the deck

**Map**:
The wayfinder issue that charts a body of work on the Deck. Five of them exist.
_Example_: Map #42 charts chapter 4.

**Prototype**:
A ticket that answers one design question by building candidates and picking one. The destination is a decision, not shipped code.
_Example_: Prototype #91 answered how the Rail must look.

**Variant**:
One candidate inside a Prototype — one full-size Slide on a throwaway branch, built to be judged and then discarded. "Variant C wins" ([#26](https://github.com/atilileri/atilileri.github.io/issues/26)) is the standard form.
_Avoid_: Comp
_Example_: Variant C wins.

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
- **The word "screen" for the glass in the room.** A Presenter note that says "every number on screen is one we can source" is correct: it means the display, not a Slide. Say "on screen" for the glass and "on the Slide" for the unit of the Deck.
- **On-screen Text locked by an earlier issue.** Where locked Text uses a word this glossary retired, the Text wins until its own issue is reopened. The room has no glossary. One known case: the keyboard legend prints "move" as an ordinary verb for navigating, which is not the noun Move.
- **The Attic.** Chapter 99 keeps showcase leftovers as they were. Its Text and its class names are not maintained to this glossary.
- **Closed issue titles.** History stays as written.
