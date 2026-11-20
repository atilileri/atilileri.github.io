/**
 * The memory match board (/20261209/hafiza/, #194; spec #192 "Memory match",
 * stories 68–70): the rules of one Round with no DOM, so the page
 * (`src/pages/20261209/hafiza/index.astro`) only paints what the board says
 * and `memory.test.ts` pins the rules under `node --test`.
 *
 * THE RULES. A 4×4 grid, 16 cards, all face down, no preview. Each Round
 * deals 8 of the 21 square crops in `photos.json` at random, each twice,
 * shuffled. She turns a card; then a second. Alike: both stay up, matched.
 * Different: both stay up until the page settles them (1 s later) or until
 * she turns the next card, whichever comes first — so a fast player never
 * waits. A move is one pair of cards turned, matched or not; the score is
 * `memoryScore(moves)` in `./scores.ts` (≤14 = 100, −5 each extra). The
 * Round is over when all 8 pairs are matched.
 *
 * WHAT IS HERE AND WHAT IS NOT. `dealBoard` draws and shuffles with an
 * injected random source, so a test can pin a deal and the page can pass
 * `Math.random`. `createBoard` owns the flip state. The 1 s timer, the
 * keyboard cursor and the painting are the page's: a board never sets a
 * timeout, it offers `settle()` for whoever does.
 */
import { shuffle } from "./shuffle.ts";

/** Picks `pairs` different photos from the pool and lays each one twice,
 *  shuffled. `rng` returns [0, 1) like `Math.random`. */
export function dealBoard(pool: readonly string[], rng: () => number, pairs = 8): string[] {
  const chosen = shuffle(pool, rng).slice(0, pairs);
  return shuffle([...chosen, ...chosen], rng);
}

export type Card = {
  /** The square crop's file name, e.g. `p07-sq.webp`. */
  readonly photo: string;
  readonly faceUp: boolean;
  readonly matched: boolean;
};

export type Board = {
  /** The 16 cards in grid order, row by row. */
  readonly cards: readonly Card[];
  /** Pairs of cards turned so far, matched or not. */
  readonly moves: number;
  /** True when all 8 pairs are matched: the Round is over. */
  readonly done: boolean;
  /** Turn card `i` face up. Ignored when it is already up or matched. A wrong
   *  pair still up from the last move goes back down first. */
  flip(i: number): void;
  /** Turn a wrong pair back down. The page calls it 1 s after a miss; a
   *  `flip` in the meantime does it itself. Harmless when nothing is up. */
  settle(): void;
};

/** A board over a deal (see `dealBoard`), every card face down. */
export function createBoard(deal: readonly string[]): Board {
  const cards = deal.map((photo) => ({ photo, faceUp: false, matched: false }));
  let moves = 0;
  /** The one card up and waiting for its pair, if any. */
  let first: (typeof cards)[number] | undefined;

  /** The cards up that are not matched: a lone first card, or a wrong pair. */
  const loose = () => cards.filter((c) => c.faceUp && !c.matched);

  return {
    cards,
    get moves() {
      return moves;
    },
    get done() {
      return cards.every((c) => c.matched);
    },
    flip(i) {
      const card = cards[i];
      if (!card || card.faceUp || card.matched) return;
      if (!first) this.settle();
      card.faceUp = true;
      if (!first) {
        first = card;
        return;
      }
      moves += 1;
      if (first.photo === card.photo) first.matched = card.matched = true;
      first = undefined;
    },
    settle() {
      if (first) return;
      for (const c of loose()) c.faceUp = false;
    },
  };
}
