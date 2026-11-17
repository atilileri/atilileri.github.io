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
 * Milyoner quiz (#198; spec row "correct answers before the first miss ÷
 * 12"). A wrong answer ends the Round, so `correct` is simply how far up the
 * 12-rung ladder she climbed. As a percent, rounded down: 12 is 100, 11 is
 * 91 — so the 95% bar means all twelve, as the spec says — 6 is 50, 0 is 0.
 */
export function milyonerScore(correct: number): number {
  return Math.min(100, Math.max(0, Math.floor((correct * 100) / 12)));
}

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

/**
 * Turkish Wordle, "Kelime avı" (#201; spec row "1–3 guesses = 100, 4 = 95,
 * 5 = 80, 6 = 65, unsolved = 0"). `guesses` is how many rows she used,
 * 1..6; `solved` is whether the last of them was the answer. Four guesses
 * is the Small prize edge. The Wordle page also calls this with the NEXT
 * guess number for its "Şimdi bilirsen %N" line, so the HUD and the result
 * can never disagree.
 */
export function wordleScore(guesses: number, solved: boolean): number {
  if (!solved) return 0;
  if (guesses <= 3) return 100;
  if (guesses === 4) return 95;
  if (guesses === 5) return 80;
  if (guesses === 6) return 65;
  return 0;
}

/**
 * Driving in the Netherlands, "Hollanda'da sürüş" (#206; spec row "100 −
 * 10 × heavy − 3 × light"). `heavy` and `light` are the mistakes of one
 * Round, as `./surus.ts` counts them: a heavy one (cyclist hit, canal, wrong
 * way in the roundabout, hard crash) costs 10, a light one (no yield, curb,
 * speeding, bike lane, each step over the soft time limit) costs 3. So the
 * 95% bar means no heavy mistake and at most one light one: one light is 97,
 * two are 94. The weights are the prototype's (#181), which Atıl played.
 */
export function drivingScore(heavy: number, light: number): number {
  return Math.min(100, Math.max(0, 100 - 10 * heavy - 3 * light));
}

/**
 * Piano (#205; spec row "hit accuracy × song cap (Kolay 0.70, Orta 0.85,
 * Zor 1.00)"). `hits` of the `notes` the song dropped, both counted by the
 * Round in `./piyano.ts`; stray presses are not an argument because they
 * cost nothing (#180). `cap` is the song's (`./piano-songs.ts`), so a
 * flawless Kolay is 70 and a flawless Orta 85: only Zor reaches the 95% bar,
 * at exactly 95% accuracy. Rounded down; the tiny lift keeps 0.85 × 100
 * from landing on 84.999… in floating point.
 */
export function pianoScore(hits: number, notes: number, cap: number): number {
  if (notes <= 0) return 0;
  const score = Math.floor((hits * 100 * cap) / notes + 1e-9);
  return Math.min(100, Math.max(0, score));
}

/** The hiking map's free margin: this many percent over the shortest is still 100. */
export const HIKING_MARGIN = 10;

/**
 * Hiking map, "Yürüyüş haritası" (#202; spec row "≤10% over the shortest =
 * 100, then −1 per 1% over, rounded down"). `route` is the length of the
 * route she confirmed and `shortest` the map's shortest route, both in
 * metres (`./yuruyus.ts`). The margin is Atıl's, after playing the
 * prototype (#183): an easy Game on purpose (spec story 40). 15% over is
 * the 95 edge, 110% over is 0. The tiny lifts keep 1.10 × shortest, which
 * floating point puts a hair past 10%, on the right side of each line.
 */
export function hikingScore(route: number, shortest: number): number {
  if (shortest <= 0) return 0;
  const past = ((route / shortest - 1) * 100) - HIKING_MARGIN;
  if (past <= 1e-9) return 100;
  return Math.max(0, Math.floor(100 - past + 1e-9));
}

/** The weight of each hiking level in the Round, in percent: Seviye 1, 2, 3. */
export const HIKING_LEVEL_WEIGHTS = [20, 30, 50] as const;

/**
 * Hiking map Round (after Atıl's play test): a Round is three maps in a row,
 * Seviye 1 (easy), 2 (medium), 3 (hard), each scored by `hikingScore`. The
 * Round is 0.20 × level 1 + 0.30 × level 2 + 0.50 × level 3, rounded down,
 * so the hard map is half the Round: 100/100/90 is 95, 0/0/100 is 50.
 * Worked in whole percents, (20a + 30b + 50c) ÷ 100, so 95/95/95 is 95
 * itself and never 94.999… in floating point.
 */
export function hikingRoundScore(levels: readonly [number, number, number]): number {
  const sum = levels.reduce((acc, s, i) => acc + HIKING_LEVEL_WEIGHTS[i]! * s, 0);
  return Math.min(100, Math.max(0, Math.floor(sum / 100 + 1e-9)));
}

/**
 * Photo framing, "Kadraj" (#203; spec row "0.95 × mean of best 4 photos +
 * 0.05 × worst"). `photos` are the five per-photo scores of one Round, each
 * 0..100 from `scoreCrop` in `./kadraj.ts` (100 when the Subject point sits
 * within 10% of the crop diagonal of a thirds point). The weak photo costs
 * little, so four perfect crops and one miss are exactly 95: the Small prize
 * wants four near-perfect crops, not five (#184). Worked as one division of
 * whole numbers, (95 × sum of best 4 + 20 × worst) ÷ 400, so that edge is 95
 * itself and never 94.999… in floating point. Fractional, not rounded.
 */
export function framingScore(photos: readonly number[]): number {
  if (photos.length === 0) return 0;
  const sorted = [...photos].sort((a, b) => b - a);
  const best4 = sorted.slice(0, 4).reduce((sum, s) => sum + s, 0);
  const worst = sorted[sorted.length - 1]!;
  return Math.min(100, Math.max(0, (95 * best4 + 20 * worst) / 400));
}

/** The ski course's flags (#179: the Dengeli course, seed 7). */
export const SKI_FLAGS = 72;

/**
 * Ski platformer, "Kayak macerası" (#207; spec row "flags ÷ 72; no finish =
 * no score"). `flags` is how many of the course's 72 she holds when she
 * crosses the finish (`./kayak.ts`; a fall gives back the ones since the last
 * checkpoint, so these are the ones she kept). As a percent, rounded down, as
 * the prototype's `pctOf` did: 69 flags is 95, the Small prize edge, and 68
 * is 94. `finished` false — she never crossed the finish — is no score at
 * all: undefined, and the page hands nothing to the shell. Time, speed and
 * falls earn nothing.
 */
export function skiScore(flags: number, finished: boolean): number | undefined {
  if (!finished) return undefined;
  return Math.min(100, Math.max(0, Math.floor((flags * 100) / SKI_FLAGS)));
}
