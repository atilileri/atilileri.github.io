/**
 * The slot machine's spin (/20261209/slot/, #200; spec #192 "Slot machine",
 * stories 50–55; rules decided on #182): the one draw a Round makes, with no
 * DOM and no clock, so the page (`src/pages/20261209/slot/index.astro`) only
 * animates what the spin says and `slot.test.ts` pins the odds under
 * `node --test`.
 *
 * THE RULES. Three reels, six symbols (camera, ski, note, wine, heart,
 * mountain — Atıl's six, #182). Three alike is the jackpot and wins the
 * slot's Small prize; two alike scores 50; none, 0 (`slotScore` in
 * `./scores.ts`). The slot is the luck Game: it gives no Points, so the
 * jackpot is the only outcome that matters, and Atıl fixed its chance at
 * EXACTLY 1 in 30 (story 53) so she wins it in an evening, not a lifetime.
 *
 * THE OUTCOME IS DRAWN FIRST. A real reel would make a triple as often as
 * the symbol count allows (1 in 36 for six symbols), and three honest reels
 * cannot be tuned to 1 in 30. So the spin draws the outcome from ONE random
 * number — jackpot when it falls in the first thirtieth of [0, 1) — and only
 * then dresses the reels to match: a jackpot shows one symbol three times;
 * anything else shows three reels that are NOT all alike, pair or no pair as
 * the draw falls. The reels are the story the machine tells; the odds live
 * in that first number.
 *
 * THE RANDOM SOURCE IS INJECTED. `spin(rng)` takes any `() => number` in
 * [0, 1); the page passes `Math.random`, the tests pass a fixed stream, so
 * "exactly 1 in 30" is a test, not a hope. The first call decides the
 * outcome; the following calls pick symbols.
 */

/** The six symbols, by name. Their glyphs are in `./icons.ts`. */
export const SLOT_SYMBOLS = ["camera", "ski", "note", "wine", "heart", "mountain"] as const;

export type SlotSymbol = (typeof SLOT_SYMBOLS)[number];

/** What one spin showed: three alike, two alike, or none. */
export type SpinOutcome = "jackpot" | "pair" | "none";

export type Spin = {
  outcome: SpinOutcome;
  /** The three reels, left to right, as they stop. */
  reels: readonly [SlotSymbol, SlotSymbol, SlotSymbol];
};

/** One in this many spins is a jackpot (story 53). */
export const JACKPOT_ODDS = 30;

/** One spin. `rng` returns [0, 1) like `Math.random`. */
export function spin(rng: () => number): Spin {
  if (rng() < 1 / JACKPOT_ODDS) {
    const s = pick(rng);
    return { outcome: "jackpot", reels: [s, s, s] };
  }
  // Not the jackpot: two free reels, and a third that may not complete a
  // triple. Two alike so far leaves the third five symbols; otherwise any.
  const a = pick(rng);
  const b = pick(rng);
  const c = a === b ? pick(rng, a) : pick(rng);
  const reels = [a, b, c] as const;
  return { outcome: outcomeOf(reels), reels };
}

/** One symbol at random, never `not`. */
function pick(rng: () => number, not?: SlotSymbol): SlotSymbol {
  const from = not ? SLOT_SYMBOLS.filter((s) => s !== not) : SLOT_SYMBOLS;
  return from[Math.floor(rng() * from.length)]!;
}

function outcomeOf([a, b, c]: readonly [SlotSymbol, SlotSymbol, SlotSymbol]): SpinOutcome {
  if (a === b && b === c) return "jackpot";
  if (a === b || b === c || a === c) return "pair";
  return "none";
}
