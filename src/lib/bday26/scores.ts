/**
 * The score functions of the birthday games (/20261209/, spec #192 "Modules",
 * 3): one pure function per Game, the raw facts of one Round in, a score
 * 0..100 out. ONE file for all 14 Games, on purpose: the "Games and score
 * formulas" table of the spec is one table, and a reader who asks "what does
 * 95% mean in this Game" finds every answer here, in the order of that table,
 * with the three Prize Games (#213) after it. The answer as she reads it,
 * one line per Game, is `./prize-hints.ts`, pinned to these functions by
 * its tests.
 *
 * THREE KINDS OF GAME (catalogue flags, glossary "Prize Game"):
 *   - the 10 skill Games: the Best score earns Points (⌊Best⌋) and wins the
 *     Small prize at 95;
 *   - the 3 Prize Games, Bavul hazırla, Renk karıştır and Barista: no
 *     Points, the Best score counts only for the Small prize, at 95 too;
 *   - the slot machine, the one luck Game: no Points, and its Small prize is
 *     won by the jackpot, not by a score.
 *
 * Each Game ticket adds its own function and its own test rows to
 * `scores.test.ts` (#198 Milyoner, #200 slot, #206 driving, #205 piano,
 * #199 "Bu nerede?", #194 memory match, #203 framing, #204 name-the-song,
 * #201 Wordle, #202 hiking, #207 ski, #219 bavul, #218 renk, #217 barista).
 * Keep each one a few lines of arithmetic with no DOM, no randomness and no
 * ledger: the Game page (or its rules module) calls it at the end of a Round
 * and hands the result to the Game shell (`./shell.ts`), which clamps
 * nothing itself but relies on the ledger to keep 0..100 — so clamp here,
 * where the formula is. A Game's rules module may import from here; this
 * file imports nothing, so no cycle can form.
 *
 * Every function floors at 0 (spec: "Scores clamp at 0") and never exceeds
 * 100. Scores may be fractional where the table says so (framing's mean,
 * the Prize Games' means); the hub and the shell write them as ⌊score⌋ with
 * a leading % (Turkish style: %95).
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
 * 0"). The spin's outcome, as `spin` in `./slot.ts` drew it: that module
 * alone says what counts as three alike or two (review L6), so the rule is
 * written once. The luck Game (`luck` in the catalogue): it earns no
 * Points, and only the jackpot wins its Small prize, so a 100 here wins
 * nothing more. The outcome is spelled here, not imported, so this file
 * still imports nothing.
 */
export function slotScore(outcome: "jackpot" | "pair" | "none"): number {
  if (outcome === "jackpot") return 100;
  if (outcome === "pair") return 50;
  return 0;
}

/**
 * Turkish Wordle, "Kelime avı" (#201; spec row "1–3 guesses = 100, 4 = 95,
 * 5 = 80, 6 = 65, unsolved = 0"), one word of the Round; the Round itself
 * is `wordleRoundScore`. `guesses` is how many rows she used,
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
 * One Round of "Kelime avı": all ten words, each scored by `wordleScore`.
 * The Round is the mean of the word scores, rounded down (Atıl's play test).
 * All ten in at most 4 guesses keeps the 95 edge; one word not found costs
 * a tenth. Worked on the whole-number sum, so no floating-point slip.
 */
export function wordleRoundScore(words: readonly number[]): number {
  if (words.length === 0) return 0;
  const sum = words.reduce((acc, s) => acc + s, 0);
  return Math.min(100, Math.max(0, Math.floor(sum / words.length)));
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
 * Round in `./piyano.ts`. Each stray press (a key with no note in its
 * window) cancels one hit: #180 let strays go free, and Atıl added the cost
 * on 2026-11-19 so pressing every key cannot win. `cap` is the song's
 * (`./piano-songs.ts`), so a flawless Kolay is 70 and a flawless Orta 85:
 * only Zor reaches the 95% bar, at exactly 95% accuracy. Rounded down; the
 * tiny lift keeps 0.85 × 100 from landing on 84.999… in floating point.
 */
export function pianoScore(hits: number, notes: number, cap: number, strays = 0): number {
  if (notes <= 0) return 0;
  const net = Math.max(0, hits - strays);
  const score = Math.floor((net * 100 * cap) / notes + 1e-9);
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

/** Bavul hazırla: points lost per empty cell of the 8×6 bag. */
export const BAVUL_EMPTY_PENALTY = 5;
/** Bavul hazırla: points lost per must-have (★) left out. */
export const BAVUL_MUST_PENALTY = 10;

/**
 * "Bavul hazırla" (#219, a Prize Game; verdict on #214): 100 − 5 × empty
 * cells − 10 × missing must-haves, floor 0. `empty` and `missing` are what
 * `./bavul.ts` counts when she closes the bag. So 95% means every must-have
 * packed and at most one empty cell.
 */
export function bavulScore({ empty, missing }: { empty: number; missing: number }): number {
  return Math.max(0, 100 - BAVUL_EMPTY_PENALTY * empty - BAVUL_MUST_PENALTY * missing);
}

/** Renk karıştır: up to this colour difference (ΔE) a target scores 100. */
export const RENK_PERFECT_DE = 1;
/** Renk karıştır: score lost per ΔE above `RENK_PERFECT_DE`. */
export const RENK_SLOPE = 6;

/**
 * "Renk karıştır" (#218, a Prize Game; verdict on #215, variant A), one
 * target of the Round: ΔE ≤ 1 is 100, then −6 for every ΔE above 1, rounded
 * to a whole score, floor 0 — so ΔE 2 is 94 and from ΔE 17.67 it is 0. `dE`
 * is CIEDE2000 between her mix and the target (`deltaE` in `./renk.ts`).
 */
export function renkTargetScore(dE: number): number {
  return Math.max(0, Math.min(100, Math.round(100 - RENK_SLOPE * Math.max(0, dE - RENK_PERFECT_DE))));
}

/**
 * One Round of "Renk karıştır": the mean of its five target scores, not
 * rounded. A match better than ΔE 1 earns nothing extra, so 95% means about
 * four exact matches and one small miss: four at 100 and the fifth at ΔE
 * 5.2 (75) is exactly 95.
 */
export function renkRoundScore(targets: readonly number[]): number {
  if (!targets.length) return 0;
  return Math.max(0, Math.min(100, targets.reduce((a, b) => a + b, 0) / targets.length));
}

/** Barista: a step's score at the green band's edge; 0 at twice the half-width. */
export const BARISTA_EDGE_SCORE = 85;

/**
 * Barista (#217, a Prize Game; verdict on #216, curve "flat-top"), one
 * step of a shot. `off` is how far from the target she let go and
 * `halfWidth` the green band's half-width, both in the step's unit (the
 * band itself is `halfWidth` in `./barista.ts`: it narrows shot by shot).
 * 100 across the inner half of the band, falling straight to 85 at its
 * edge, then straight to 0 at twice the half-width; rounded.
 */
export function baristaStepScore(off: number, halfWidth: number): number {
  const d = Math.abs(off) / halfWidth;
  let score: number;
  if (d <= 0.5) score = 100;
  else if (d <= 1) score = 100 - (100 - BARISTA_EDGE_SCORE) * (d - 0.5) * 2;
  else score = Math.max(0, BARISTA_EDGE_SCORE - BARISTA_EDGE_SCORE * (d - 1));
  return Math.round(score);
}

/**
 * One Round of Barista: the mean of its 9 step scores (3 shots × grind,
 * tamp, pull), not rounded. Eight perfect steps and one at 55 is exactly
 * 95; so are six perfect and three at the band edge (85).
 */
export function baristaRoundScore(steps: readonly number[]): number {
  if (!steps.length) return 0;
  return Math.max(0, Math.min(100, steps.reduce((a, b) => a + b, 0) / steps.length));
}
