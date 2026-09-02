# ADR 0002 — Every Widget is a module with one interface

**Status**: Accepted
**Date**: 2026-08-31
**Scope**: `docs/asml-ai` — the Deck's client code, `src/pages/decks/asml-ai/index.astro`
and the modules under `src/lib/asml-ai/`
**Spec**: [#106](https://github.com/atilileri/atilileri.github.io/issues/106)

## Context

The Deck has sixteen Widgets. None of them is a module. All sixteen live in one
inline `<script>` of about two thousand lines, in one shared scope, and reveal.js
reaches them through two long chains of `if`:

```
function onShow(slide)      { … ten  hasAttribute branches … }
function onFragment(e, shown){ … seven hasAttribute branches … }
```

Adding a Widget means editing both chains and adding to the shared scope. The two
chains must agree about every Widget, and nothing makes them agree — the
agreement is a habit. Thirteen DOM handles are looked up at module scope, at load,
for Slides the room has not reached. Two Widgets draw themselves as a side effect
of the file loading.

The Deck is under active change: it took sixty-four of the last sixty file touches
in this repo, and every one of them landed in that island.

One rule holds across the Widgets and is written only in comments: entering a
Slide from the left and entering it from the right must land on the same picture.
Six Widgets promise it in prose. Nothing checks it. The Deck has no test.

## Decision

**A Widget is a module.** It lives at `src/lib/asml-ai/<name>.widget.ts`, beside
the data module it already reads, and it exports one object:

```
{ attr, fragSel?, init?, enter?, sync? }
```

- **`attr`** — the Slide attribute this Widget answers to, such as `data-smartzone`.
- **`fragSel`** — the selector for this Widget's Fragment row. The caller counts
  with it and passes the number.
- **`init(deck)`** — runs once at startup. It owns one-time setup: the six
  Widgets that attach listeners the room drives directly, and the two `resize`
  handlers. It is handed the reveal.js instance, and two Widgets read it: the
  primitives Widget navigates the Deck, and the wayfinder map keeps the
  instance to divide its measured pixels by `getScale()` inside `sync`. So a
  Widget may also use `init` to KEEP the instance, not only to bind with it.
  Every other `init` ignores the argument. This ADR first gave `init` no
  arguments, and the primitives Widget could not move under that signature; it
  then said every other `init` ignored it, and the wayfinder map disproved that
  (#113).
- **`enter(slide)`** — the room arrived. The two replay Widgets restart here.
- **`sync(slide, shown)`** — the room pressed an arrow, or arrived. Draw the state
  for `shown` Fragments. It derives everything from `shown` and is idempotent.

`src/lib/asml-ai/deck-widgets.ts` holds the registry and exports one function,
`mountWidgets(deck)`, which calls every `init` once and binds `enter` and `sync`
to reveal's `ready`, `slidechanged`, `fragmentshown` and `fragmenthidden`. The
reveal event names sit in the same module as the contract that reads them.

Shared DOM helpers move to `src/lib/asml-ai/dom.ts`. `stochEl` and `halEl` are
byte-identical apart from their names — this ADR first said they differed in a
default, which was wrong — and they collapse into `el`.

`index.astro` keeps the Chrome, the Wash, the laser, the notes overlay,
`armHeadline`, and one call to `mountWidgets`. It drops from 3 565 lines to about
1 700.

The migration runs as one commit per Widget — sixteen when this ADR was
written, thirteen once the terminal replay, the scrolly and the bar chart all
proved unreachable and were deleted
rather than moved — with both `if` chains alive until the last one. `data-smartzone` goes first — one `sync`, one
`fragSel`, no listeners, no timers — because it proves the contract on the
easiest case. One Playwright walk of every Slide and every Fragment, forward and
backward, is written before the first commit and run after each one.

Nothing the room can see changes.

## Considered options

**One member, `sync(slide, shown)`.** Rejected. Arrival and arrow press would call
the same function, so the terminal replay would restart its typing on every press.
That is a change to what the room sees.

**A fourth member, `leave(slide)`.** Rejected, and the reason is recorded below
because it will be suggested again.

**Markup, style and behaviour together in `src/components/deck/<Name>.astro`.**
Deferred, not rejected. It is the better end state and it is a different change:
it moves markup, and it puts Astro's scoped styles against reveal.js's global
cascade, which is untested in this repo. It gets its own decision once the module
lines exist.

**Making the benchmark chart lazy.** Rejected. See below.

## Consequences

- **There is no `leave`, and two Widgets run timers.** The count-up and the cost
  dial's glow each hold a timer in a module-scope variable. This looks like a
  leak and is not one. Both stop themselves, after about 900 ms, and each is
  cancelled by the next entry to its own Slide. The behaviour is correct today,
  and it does not buy a fourth member. Add `leave` when a Widget needs teardown
  that entry cannot do.

  This ADR first counted three timers and named the terminal replay's four-second
  write into a hidden Slide as the one real cost. That cost does not exist: no
  Slide in this Deck carries `data-terminal`, so the controller never runs.

- **The terminal replay is deleted, not migrated.** It came with the code this
  Deck was copied from and no Slide ever used it. Its branch in `onShow`, its
  replay table, its timer and its one line of a grouped CSS rule go; the other
  four selectors in that rule stay. The showcase Deck has its own copy on its
  own Slide and is untouched. The 67 goldens cannot move, because the code never
  ran. So the Deck has **fourteen** live Widgets, not sixteen, and the
  migration is fourteen commits — see the scrolly entry below, which took the
  count down again for the same reason.

- **A missing element throws, and that is a decision, not a tidy.** The shared
  lookup `q` throws when its selector matches nothing. Migrating the session
  Widget turned three silent guards — `if (!col) return;` and two more — into
  that throw, and the independent review of #112 was right to call it a
  behaviour change folded into a move. It is accepted rather than reverted, for
  the reason `dom.ts` already gives: a Widget's selectors name elements the
  Slide's markup ALWAYS carries, so a miss is a broken Slide rather than a state
  to paint around, and a throw reports it where it happened instead of failing
  later somewhere else. All three elements exist today, so nothing the room sees
  differs. The cost is real and is recorded here: with the mount loop
  deliberately unguarded, a missing element now stops the Widgets after this one
  on that Slide, where before it half-painted in silence. Later migrations may
  use `q` the same way; use `slide.querySelector` directly for an element that
  is genuinely optional.

- **The scrolly Widget is deleted, not migrated.** This is the terminal replay
  again, found the same way and answered the same way. `data-scrolly`,
  `data-scroll-frame` and `data-scroll-step` appear nowhere in this Deck's
  markup — only in an `onShow` branch that can never fire, a module-scope walk
  that creates zero `IntersectionObserver`s, and seven theme rules with nothing
  to match. The Deck it belongs to is `showcase-for-asml`, which renders the
  Slide, owns its own copy of the code and its own theme file, and is out of
  scope everywhere.

  Unlike the second tokenizer, which had no branch at all, this one DID sit in
  the entry chain, so it was one of the counted Widgets. Deleting it takes the
  Deck from fifteen to **fourteen**, exactly as deleting the terminal replay
  took it from sixteen to fifteen. #115's two scrolly acceptance criteria, and
  its premise that the Widget "resets its frame's scroll position on arrival"
  and "owns an observer that needs `init`", describe the showcase Deck and are
  retired rather than unmet.

  THE PATTERN IS NOW FOUR DEEP, and worth naming for whoever migrates next:
  this Deck was copied from the showcase and inherited behaviour for Slides it
  never built. A migration ticket is where that surfaces, because moving code
  forces someone to find the markup it drives. Check the markup exists before
  reasoning about how a Widget should move.

- **The bar chart is deleted, not migrated.** The fourth of them, and the last
  one the chains can hide: `data-viz`, `data-bars` and `.bar-fill` appear
  nowhere in this Deck's markup, so `resetBars` and `growBars` walked an empty
  node list and the `onShow` branch that called them never fired. Its `.bars`
  and `.bar-fill` theme rules, and its line in the reduced-motion block, went
  with it. The showcase Deck renders the four bars and is untouched.

  Like the scrolly it DID sit in the entry chain, so it was one of the counted
  Widgets: deleting it takes the Deck from fourteen to **thirteen**. #116 named
  it as one of two Widgets to migrate, which makes that ticket one Widget — the
  count-up — and retires the data-viz half rather than leaving it unmet.

  `.bar-fill` was on this spec's dead-CSS list and #108 kept it, correctly: the
  controller built that selector as a string, so the rule had a caller. A rule
  whose only caller is dead code is a second-order version of the same pattern,
  and it only came free once the controller went.

- **The benchmark chart keeps its eager draw.** `data-bench` draws at startup,
  before its Slide is ever seen, and it is the one Widget that appears in neither
  `if` chain. Under this ADR it draws from `init`, at the same moment as today.
  Drawing it on arrival instead would be tidier and riskier: the chart measures
  its own plot box, and measuring an element on a Slide that reveal.js has scaled
  but not shown is the kind of thing that works in a browser and fails on the
  room's projector. Change the timing on its own, with the projector in front of
  you.

- **`fragSel` puts the Fragment row in the interface.** Three Widgets already
  drive themselves from a hidden row and spell it three ways in the markup —
  `data-prim-frag-row`, `data-se-frag-row`, `data-sz-frag-row`. Naming the
  selector in the module makes the mechanism part of the contract instead of a
  per-Widget habit. **Fragment row** was returned to the glossary on the same day
  as this ADR for that reason: the concept became load-bearing in code.

- **Three Widgets declare no `fragSel`, and receive `shown === 0`.**
  `data-stoch`, `data-lottery` and `data-token-live` read a `.visible` flag on
  one named element rather than counting a row. They read it in their own
  `sync` and ignore `shown`. Zero, rather than no argument at all, so the
  declared `sync(slide, shown: number)` stays honest at runtime; zero rather
  than a whole-Slide count, which would be a wrong number dressed as a right
  one. A count of
  `.fragment.visible` across the whole Slide would be wrong for them, and wrong
  for the three row-driven Widgets as well, because a Slide holds Fragments that
  are not part of any Widget.

- **`sync` becomes idempotent, so a Widget may repaint where today it does
  nothing.** No Widget in the Deck paints anything the room can distinguish
  between one repaint and two. If one is found during the migration, stop and
  raise it rather than folding a behaviour change into a move commit.

- **The invariant becomes checkable, but this ADR does not check it.** Splitting
  each `sync` into a pure `stateAt(n)` and a `paint` would let a test assert that
  forward and backward entry agree. That is a separate change and it depends on
  this one for its shape.

- **The input-billing ladder is not a Widget, and it stays in the page file.**
  Naming it here because the migration's last ticket counts what is left in the
  inline `<script>`, and this is the one piece of Chapter 3 behaviour that is
  not Chrome and not a Widget. It is an IIFE that writes four figures into the
  vocabulary Slide's markup once, at load. It answers to no Slide attribute, it
  binds no listener, and it never had a branch in either chain, so the registry
  has nothing to offer it: `attr` would be a fiction and `init` would only move
  the same one-shot write to a later line of the same synchronous script. It
  belongs with the markup it fills, and it goes when that markup becomes a
  component — the deferred change at the top of this ADR, not this one.

- **Both `if` chains own nothing after #117, so #118 is a deletion.** The cost
  dial's `resetDial` was the entry chain's last Widget branch. What `onShow`
  still does — `armHeadline`, `updateChrome`, the Wash on `data-chapter`, and
  the notes overlay — is Chrome: it runs on every Slide unconditionally, so a
  registry buys it nothing, and this ADR always meant it to stay. The
  arrow-press chain has been empty since #114.

- **The benchmark chart's eager draw survived the move, and it was measured.**
  The chart drew at module scope before; it draws from `init`, at
  `mountWidgets`, now — later in the same synchronous script, and still before
  reveal fires anything. `fitPlot` measures the plot's real box at that moment:
  it writes a viewBox height of 528, not the 560 default it falls back to when
  the element has no layout yet. So the timing question this ADR refused to
  re-open stayed closed, and the answer is recorded rather than assumed.

- **The walk cannot press a chip or drag a knob, and the two eager Widgets are
  mostly pointer.** The 67-state walk proves the Deck paints the same picture,
  which is what a move has to prove; it reaches no chip click, no hover tip, no
  resize redraw, no knob drag and no bill-row click. Those were driven once by
  hand under Playwright while #117 was open, and the run is recorded on that
  issue. A committed spec for them is worth having and is not part of a move:
  it is a new assertion about behaviour, so it gets its own ticket.
