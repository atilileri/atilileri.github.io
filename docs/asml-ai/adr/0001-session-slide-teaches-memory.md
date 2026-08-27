# ADR 0001 — The session Slide teaches memory, not billing

**Status**: Accepted
**Date**: 2026-08-27
**Scope**: `docs/asml-ai` — chapter 3, the Slide formerly called "the loop"

## Context

Wayfinder prototype #26 (variant C, "the ledger") built this Slide as a billing
demonstration. An agent solved `(3 + 5) × 2 − 4` with two tools across twelve
Moves. Four of those Moves fired a model call, and the asymmetry — the bars sit
still while the agent reasons, then jump when a request goes out — was declared
the point of the Slide. A credit odometer and three billed-token bars sat on
the right, driven by `frameAt()` in `src/lib/asml-ai/agent-loop.ts`.

Two problems surfaced in the grilling session of 2026-08-27.

1. **The Slide taught the wrong lesson for its position.** The belief a delegate
   actually holds is that a chat sends only their last sentence. That is a chat
   belief, and the Slide answered it with an agent tool loop — half of whose
   Moves a delegate never types.
2. **Cost had already been taught twice, and was about to be taught again.** The
   credits ladder comes before this Slide and the bill table comes after it. The
   odometer here priced a session with no rate table beside it, so the room read
   a number it could not check.

Thirteen presses also made the Slide the longest in the chapter.

## Decision

The Slide teaches one thing: **a chat has no memory, so the whole history goes
up the wire on every turn.**

- Four presses, one per Turn, of a plain chat with a model. No tools in the
  text.
- The bar starts **pre-filled** with the harness baseline, and grows downward.
- A bracket beside the bar spans from the top to the fill line on every Turn,
  labelled "sent this turn" — the same words each time.
- **No cost on the Slide.** The odometer, the three billed-token bars, the
  running token readout and the whole billing model are removed.
- No closing line. The Slide ends on Turn 4, and the Presenter hands over to
  the bill Slide by voice.
- The pasted document is three quarters of everything on screen. Turn 3 is the
  beat: six words typed, forty pages re-sent.

`agent-loop.ts` is deleted and replaced by `src/lib/asml-ai/session.ts`, which
holds turns and blocks and no prices. The noun **Move** leaves the glossary.

## Amendment, 2026-08-27 — position in the chapter

The Slide first sat between the vocabulary Slide and the bill table. It broke a
connection: the vocabulary Slide closes on "three kinds, at three prices", and
the bill table's three column pairs carry those three names.

The Slide now follows the bill table, and the anatomy Slide became its vertical
child. Chapter 3 reads: vocabulary → bill → session ↓ anatomy.

- The three token kinds pass from the vocabulary Slide to the bill with nothing
  between them.
- The bill leaves one question open — cached is the biggest pile of tokens on
  the table, and nobody typed it. The session answers it in four Turns.
- The anatomy then opens that pile and names the blocks inside it.
- The rule of this ADR is unchanged and easier to hold: the money is spent one
  Slide earlier, so the session Slide still prints no cost.
- The bill and the anatomy were a vertical pair before this change. The pair is
  now session ↓ anatomy, so the → route keeps the four Turns and drops the
  block-by-block anatomy.

## Consequences

- **#26's twelve Moves and four billing events are retired.** This ADR is now
  the only record of that decision, which is why it names it.
- **The frame is not a capacity.** Its bottom edge fades out. A real window
  holds many times what the frame draws, and a delegate who reads "we are
  nearly full" has been misled. The Presenter note carries the correction. This
  was chosen with the risk stated and accepted (grilling round 3, option b).
- **One documented error left with the file.** `agent-loop.ts` claimed "OpenAI
  carries no write surcharge". That is true of GPT-5.4 and false of OpenAI in
  general — GPT-5.6 and later bill cache writes at 1.25× input
  (`docs/research/token-billing-per-turn.md`). The claim may survive in the
  Presenter notes of the credits Slide or the cost dial. Fixing those is a
  separate change.
