/**
 * The score functions of the birthday games (/20261209/, spec #192 "Modules",
 * 3): one pure function per Game, the raw facts of one Round in, a score
 * 0..100 out. ONE file for all eleven Games, on purpose: the "Games and score
 * formulas" table of the spec is one table, and a reader who asks "what does
 * 95% mean in this Game" finds every answer here, in the order of that table.
 *
 * Each Game ticket adds its own function and its own test rows to
 * `scores.test.ts` (#198 Milyoner, #200 slot, #206 driving, #205 piano,
 * #199 "Bu nerede?", #194 memory match, #203 framing, #204 name-the-song,
 * #201 Wordle, #202 hiking, #207 ski). Keep each one a few lines of
 * arithmetic with no DOM, no randomness and no ledger: the Game page calls
 * it once at the end of a Round and hands the result to the Game shell
 * (`./shell.ts`), which clamps nothing itself but relies on the ledger to
 * keep 0..100 — so clamp here, where the formula is.
 *
 * Every function floors at 0 (spec: "Scores clamp at 0") and never exceeds
 * 100. Scores may be fractional where the table says so (framing's mean);
 * the hub and the shell write them as ⌊score⌋ with a leading % (Turkish
 * style: %95).
 */

/**
 * "Bu nerede?" (#199) and name the song (#204, spec row "as Bu nerede?"):
 * "0 misses = 100, 1 = 95, each further miss −10". A miss is one question of
 * the ten answered wrong. The first miss costs 5, so one slip still wins the
 * Small prize; the second costs 10 more (85), and from 11 misses the score
 * is 0 — a Round has only 10 questions, so that row is the clamp.
 */
export function missScore(misses: number): number {
  if (misses <= 0) return 100;
  return Math.max(0, 95 - 10 * (misses - 1));
}

/**
 * Memory match (#194; spec row "≤14 moves = 100, −5 per extra move"). A move
 * is one pair of cards turned. Eight pairs need at least 8 moves, so 8..14
 * is perfect; 15 is the Small prize edge at 95; 34 and more is 0.
 */
export function memoryScore(moves: number): number {
  return Math.max(0, 100 - 5 * Math.max(0, moves - 14));
}

/**
 * Slot machine (#200; spec row "triple = 100 (jackpot), pair = 50, none =
 * 0"). The three reels as they stopped, by symbol; three alike is the
 * jackpot. The only Game whose Points are never counted (`luck` in the
 * catalogue), so 100 here wins the Small prize and nothing else.
 */
export function slotScore(reels: readonly [string, string, string]): number {
  const [a, b, c] = reels;
  if (a === b && b === c) return 100;
  if (a === b || b === c || a === c) return 50;
  return 0;
}
