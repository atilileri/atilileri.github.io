/**
 * "Bavul hazırla" (/20261209/bavul/, #219): the Prize Game where she packs
 * an 8×6 suitcase for a trip. The rules are the verdict on #214; the
 * prototype on `prototype/214-bavul` is the reference for the items, the
 * cards and the input. This file is the pure side, pinned under
 * `node --test` (`bavul.test.ts`); the page draws it and plays its sounds.
 *
 * THE RULES.
 *   - One layer, 8×6 = 48 cells. 16 items, 70 cells in all, so some stay out.
 *   - Each Round draws one trip card (never the same twice in a row) naming
 *     4 must-haves, marked ★.
 *   - Score = 100 − 5 × empty cells − 10 × missing must-haves, floor 0
 *     (`bavulScore`). One empty cell is 95: still the Small prize.
 *   - 23 kg is a GATE on closing: refused with "23 kg'ı aştın". Items may go
 *     in over the limit, with a warning on the held item.
 *   - No time limit; the page's clock only shows the time played.
 *
 * THE INPUT is one state machine, `step(state, action) → { state, events }`.
 * Mouse, keyboard and the buttons only translate their events into these
 * actions; nothing else changes a Round. The events (sounds, a toast, the
 * shell's leave question, the end of the Round) are the page's to play.
 *
 *   action      mouse                          keyboard     button
 *   list i      click a list row               —            —
 *   cycle ±1    —                              Tab / ⇧Tab   Sonraki eşya
 *   cancel      2nd click on the held row,     Esc          Bırak
 *               click the background           (empty hand: leave question)
 *   act         click a bag cell               Enter        Bavula koy
 *               (holding: place; empty hand: pick up the packed item there)
 *   move dx dy  —                              arrows       —
 *   point       pointer over the bag           —            —
 *   rotate      right click                    R            Döndür
 *   takeOut     click the list while holding   Backspace    Çıkar
 *               a bag item
 *   close       —                              K            Bavulu kapat
 *
 * After placing, the hand is empty. A list item hangs from its middle; a bag
 * item from the cell she grabbed, and cancel puts it back on its old cell in
 * its old rotation. `close` with an empty hand and ≤ 23 kg opens the close
 * question (`closing`): `act` (Enter, "Kapat") ends the Round, `cancel`
 * (Esc, "Devam et") goes back to packing.
 */

// ------------------------------------------------------------------ rules

export const BAG_W = 8;
export const BAG_H = 6;
export const KG_LIMIT = 23;
export const EMPTY_PENALTY = 5;
export const MUST_PENALTY = 10;
/** Floating-point room for sums like 3.5 + 1.5 + … against the 23 kg gate. */
const EPS = 1e-9;

/** The Round's score from what is left undone. Pure; 0..100. */
export function bavulScore({ empty, missing }: { empty: number; missing: number }): number {
  return Math.max(0, 100 - EMPTY_PENALTY * empty - MUST_PENALTY * missing);
}
