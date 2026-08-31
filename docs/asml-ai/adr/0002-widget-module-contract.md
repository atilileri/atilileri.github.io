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
- **`init`** — runs once at startup. It owns one-time setup: the six Widgets that
  attach listeners the room drives directly, and the two `resize` handlers.
- **`enter(slide)`** — the room arrived. The three replay Widgets restart here.
- **`sync(slide, shown)`** — the room pressed an arrow, or arrived. Draw the state
  for `shown` Fragments. It derives everything from `shown` and is idempotent.

`src/lib/asml-ai/deck-widgets.ts` holds the registry and exports one function,
`mountWidgets(deck)`, which calls every `init` once and binds `enter` and `sync`
to reveal's `ready`, `slidechanged`, `fragmentshown` and `fragmenthidden`. The
reveal event names sit in the same module as the contract that reads them.

Shared DOM helpers move to `src/lib/asml-ai/dom.ts`. `stochEl` and `halEl` were
the same function with a different default; they collapse into `el`.

`index.astro` keeps the Chrome, the Wash, the laser, the notes overlay,
`armHeadline`, and one call to `mountWidgets`. It drops from 3 565 lines to about
1 700.

The migration runs as sixteen commits, one Widget each, with both `if` chains
alive until the last one. `data-smartzone` goes first — one `sync`, one
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

- **There is no `leave`, and three Widgets run timers.** The count-up, the
  terminal replay and the cost dial's glow each hold a timer in a module-scope
  variable. This looks like a leak and is not one. All three stop themselves —
  after 900 ms, about 4 seconds, and 900 ms — and each is cancelled by the next
  entry to its own Slide. The behaviour is correct today. One real cost remains:
  the terminal writes into a hidden element for about four seconds during a Slide
  transition, and reveal.js keeps every Slide in the document. That is a
  performance nicety, not a defect, and it does not buy a fourth member. Add
  `leave` when a Widget needs teardown that entry cannot do.

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

- **Three Widgets declare no `fragSel`.** `data-stoch`, `data-lottery` and
  `data-token-live` read a `.visible` flag on one named element rather than
  counting a row. They read it in their own `sync`. A count of
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
