/**
 * What the Small prize asks of her, in each Game's own units (review D2):
 * the ONE place that says "%95" in hamle, hata, bayrak or boş kare. The Game
 * shell shows `prizeHintOf` on its start card and on its result card
 * (`src/components/bday26/GameShell.astro`, painted by `./shell.ts`), and
 * `prizeHowOf` in the Small prize line of both, so no Game page writes its
 * own copy.
 *
 * Text only, beside the catalogue rather than in it: `./catalogue.ts` is the
 * locked wording of #176/#177, and these lines follow the score rules, which
 * live in `./scores.ts`. Every number here was worked out from those rules,
 * and `prize-hints.test.ts` checks each one against the real score function
 * at its edge (the number allowed still scores 95, one past it does not), so
 * a rule changed there fails a test here before she reads a wrong hint.
 * The slot machine has none: its prize is the jackpot, which no skill
 * reaches.
 */
import { gameById, PRIZE_BAR, type GameId } from "./catalogue.ts";
import { MEMORY_PRIZE_MOVES } from "./memory.ts";

const HINTS: Record<GameId, string | undefined> = {
  milyoner: `%${PRIZE_BAR} için 12 sorunun 12'si`,
  nerede: `%${PRIZE_BAR} için en fazla 1 hata`,
  hafiza: `%${PRIZE_BAR} için en fazla ${MEMORY_PRIZE_MOVES} hamle`,
  // The Round is the mean of the ten word scores, rounded down; four guesses
  // is 95, so ten words in at most four keeps the bar.
  wordle: `%${PRIZE_BAR} için on kelimenin hepsini en fazla 4 tahminde bul`,
  sarki: `%${PRIZE_BAR} için en fazla 1 hata`,
  // Türk Marşı drops 210 notes on Zor (cap 1.00): 200 hits is 95, 199 is 94.
  // A missed note and a stray press each cost one hit.
  piyano: `Küçük ödül yalnız Zor'da · %${PRIZE_BAR} için en fazla 10 hata`,
  kadraj: `%${PRIZE_BAR} için dört fotoğrafın neredeyse kusursuz olmalı`,
  surus: `%${PRIZE_BAR} için ağır hata yok, en fazla 1 hafif hata`,
  // 15% over the shortest is 95 on each map, so on all three it is 95.
  yuruyus: `%${PRIZE_BAR} için her haritada rotan en kısadan en fazla %15 uzun olsun`,
  kayak: `%${PRIZE_BAR} için en çok 3 bayrak kaçır`,
  bavul: `%${PRIZE_BAR} için olmazsa olmazların hepsi bavulda, en çok 1 boş kare`,
  // Four at 100 and the fifth at ΔE 5 (76) is 95.2; at ΔE 5.5 it is 94.6.
  renk: `%${PRIZE_BAR} için dört renk tam (ΔE ≤ 1), beşincisi ΔE 5'e kadar`,
  // Six steps at the centre and three at the band edge is exactly 95.
  barista: `%${PRIZE_BAR} için dokuz adımın ortalaması ${PRIZE_BAR} olmalı · bandın ortası 100, kenarı 85`,
  slot: undefined,
};

/** What %95 means in this Game, one line; undefined for the slot machine. */
export function prizeHintOf(id: GameId): string | undefined {
  return HINTS[id];
}

/** How this Game's Small prize is won, after its name on the prize line:
 *  "%95 yapınca senin", or "Jackpot'ta senin" for the luck Game. */
export function prizeHowOf(id: GameId): string {
  return gameById(id).luck ? "Jackpot'ta senin" : `%${PRIZE_BAR} yapınca senin`;
}
