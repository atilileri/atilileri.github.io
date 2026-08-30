# ASML AI deck

The presentation "Getting the Most from AI", built at [`/decks/asml-ai`](../../src/pages/decks/asml-ai/index.astro) and given live to ASML executives. The vocabulary below is this context's ubiquitous language: these words appear in the markup, in the modules under [`src/lib/asml-ai/`](../../src/lib/asml-ai/), in issue titles, and in every conversation about the deck.

Charted by five wayfinder maps: [#4](https://github.com/atilileri/atilileri.github.io/issues/4) (the capability showcase this deck was copied from), [#20](https://github.com/atilileri/atilileri.github.io/issues/20), [#29](https://github.com/atilileri/atilileri.github.io/issues/29), [#42](https://github.com/atilileri/atilileri.github.io/issues/42) and [#63](https://github.com/atilileri/atilileri.github.io/issues/63).

**This glossary is normative.** When the code or an issue disagrees with a term below, the code or the issue is wrong. Exceptions are listed at the end: third-party contracts, and the things this glossary does not govern.

## The deck's structure

**Deck**:
The whole presentation at `/decks/asml-ai`.
_Avoid_: Presentation, slideshow, talk
_Example_: The Deck runs at `/decks/asml-ai`. The Dutch journey is not part of it.

**Chapter**:
A numbered part of the Deck, opened by a Divider. Chapters 1 to 4 are built, chapter 5 has its skeleton and five Slides still to fill, and chapter 6 is the planned outro.
_Avoid_: Section — that word belongs to the markup, not to us. Also part, act.
_Example_: We rehearse chapter 4 tonight.

**Spine**:
A Chapter's locked, ordered list of Slides. The grilling that locks one is a "spine grilling" ([#54](https://github.com/atilileri/atilileri.github.io/issues/54), [#70](https://github.com/atilileri/atilileri.github.io/issues/70)).
_Avoid_: Never use Spine for chapter 1's overview Slide, and never for the hidden row of Fragments that drives a Widget. Both meanings existed before this glossary and both are wrong.
_Example_: Map #63 locks the Spine of chapter 5 at six Slides.

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
A Divider that shows the four parts the Deck is about — Terminology, Tokenomics, Best practices, Operating model — with the entered Chapter's own part lit and the other three dim. Used for chapters 2 to 5. It carries no Wash and no glosses. It returns to a Slide the room already saw in chapter 1, so the room recognises it rather than reads it again.
_Avoid_: Bare "divider" when this kind is meant.
_Example_: The Roadmap divider of chapter 3 lights Tokenomics and dims the other three parts.

**Chrome**:
The persistent bar around the Deck: the chapter name, the slide counter, and the keyboard legend. It is not part of any Slide.
_Example_: The Chrome shows "Best practices" and the slide counter.

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
_Avoid_: Beat — it meant three different things before this glossary: this one, a spoken pause, and one of the Deck's four parts.
_Example_: The Closing line is "You pay for the loop, not for the answer".

**Presenter note**:
The `<aside class="notes">` on a Slide. It carries what the Slide must not print — sourcing, caveats, and the answer to a challenge from the room. Presenter notes are governed by this glossary like everything else: they are written to be spoken, not written in a private vocabulary.
_Avoid_: Speaker note
_Example_: Put the source of the number in the Presenter note, not on the Slide.

**Fragment**:
One arrow press inside a Slide. A Slide with four Fragments takes five presses to leave. Reveal.js owns this word and its `class="fragment"`; we adopt it rather than compete with it. See Third-party contracts.
_Avoid_: Step, animation, reveal, click, build
_Example_: Put the caveat on a Fragment, so the room reads the number first.

## Widgets and their units

**Widget**:
An interactive thing on a Slide that the room can watch change. A Slide either has one or is static.
_Avoid_: Island — that is Astro's word for a build concern. See Third-party contracts.
_Example_: The spend-curve Widget shows one more notch of reasoning effort on each arrow press.

**Turn**:
One exchange in a session — what the user said and what the agent answered. The smallest unit the Deck counts in: one press of the session Slide, and the unit the smart-zone and roll-back Widgets count in. The noun **Move** was retired with the agent-loop ledger ([ADR 0001](adr/0001-session-slide-teaches-memory.md)); nothing sits below a Turn.
_Avoid_: Move, step, round, message
_Example_: The roll-back Widget goes back three Turns.

## How we work on the deck

**Map**:
The wayfinder issue that charts a body of work on the Deck. Five of them exist.
_Example_: Map #42 charts chapter 4.

**Prototype**:
A ticket that answers one design question by building candidates and picking one. The destination is a decision, not shipped code.
_Example_: Prototype #91 answered how chapter 5's pipeline component must look.

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
- **`sub-slide`** and **vertical stack** — reveal.js. Slides stacked under one another, reached with the down arrow.
- **`data-*`** — HTML. Every hook the controller selects on.

## Not governed by this glossary

- **Words the Deck quotes from ASML's world.** The guardrails Slide says "Process steps, tool names, part numbers". That is ASML's word for ASML's work, not our metalanguage. Do not "fix" it.
