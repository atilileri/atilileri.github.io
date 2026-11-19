/**
 * The Proof (*Belge*) of the birthday games site (/20261209/belge/, spec
 * #192 stories 91–95, built on #197; the shape was decided on #175): what
 * the printable page says, as data, given her ledger.
 *
 * WHAT THE PROOF IS FOR. She prints it, or saves it as a PDF, when she wants
 * to claim a present; Atıl hands over what it lists (glossary, "Proof"). It
 * is optional: a Small prize won in front of him needs no paper (story 95).
 * It carries five things and nothing else (story 91), plus a sixth when Atıl
 * gave her any:
 *   - the Gifts she holds, in the shop's order, each with its one line;
 *   - the Small prizes she won, in the hub's order, each with its Game;
 *   - the Gifted points (*Hediye puan*), each with its note, and their sum;
 *   - today's date, written the Turkish way ("9 Aralık 2026");
 *   - the check code, printed large, so Atıl can compare it with the one on
 *     her live screen — that comparison IS the check, there is no check
 *     page and no server (story 93, #175);
 *   - the full Save code, printed small, so the paper is her last backup
 *     (story 94): typed back into "Geri yükle" it restores this very state.
 *
 * WHY A FUNCTION OVER THE LEDGER. The page (`src/pages/20261209/belge/`)
 * only lays out what this returns; it computes no rule of its own. Which
 * Gifts are held and which Small prizes are won are the ledger's answers
 * (`./ledger.ts`), read through its interface, never from the stored
 * facts; the Save code is the ledger's `toSaveCode()`, so the code on the
 * Proof is character for character the code "Yedekle" shows and its
 * `check` is that code's last six characters by construction (`./savecode.ts`).
 * Nothing here is new progress logic — this module is the Proof's one seam,
 * so `proof.test.ts` can say "given these facts, the paper lists these
 * names" under `node --test` with no DOM.
 *
 * THE DATE IS AN ARGUMENT. The page passes `new Date()` when it renders, so
 * the paper says the day it was printed; the tests pass a fixed day. It is
 * written with `Intl` in `tr-TR` (full ICU in every browser and in Node),
 * day month year with the month spelt out, which is how a Turkish reader
 * expects a date on paper.
 *
 * It is async only because the Save code's hash is.
 */
import { GAMES, GIFTS, type GameId, type GiftId } from "./catalogue.ts";
import type { Ledger } from "./ledger.ts";

/** A Gift she holds, as the Proof prints it. */
export type ProofGift = { id: GiftId; name: string; desc: string };

/** A Small prize she won, as the Proof prints it, with the Game that gave it. */
export type ProofPrize = { id: GameId; game: string; name: string; desc: string };

export type Proof = {
  /** Gifts held, in the shop's order (price high to low). */
  gifts: ProofGift[];
  /** Small prizes won, in the hub's order (the slot machine last). */
  prizes: ProofPrize[];
  /** Gifted points, oldest first, and their sum; empty when none. */
  gifted: { total: number; items: ProofGifted[] };
  /** The day it is printed, the Turkish way: "9 Aralık 2026". */
  date: string;
  /** The check code, in large letters: the last 6 characters of `code`. */
  check: string;
  /** The full Save code, in small letters: the paper is the last backup. */
  code: string;
};

/** One gift of Points from Atıl, as the Proof prints it. */
export type ProofGifted = { points: number; note?: string };

/** What the ledger must answer for a Proof; the full `Ledger` does. */
export type ProofSource = Pick<Ledger, "held" | "prizesWon" | "toSaveCode" | "gifted" | "giftedTotal">;

/** Day, month spelt out, year — "9 Aralık 2026" — in the reader's own time zone. */
const TURKISH_DATE = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" });

/** The content of her Proof, printed on `today`. */
export async function proofOf(ledger: ProofSource, today: Date): Promise<Proof> {
  const held = ledger.held();
  const won = new Set(ledger.prizesWon());
  const { code, check } = await ledger.toSaveCode();
  return {
    gifts: GIFTS.filter((g) => held.has(g.id)).map((g) => ({ id: g.id, name: g.name, desc: g.desc })),
    prizes: GAMES.filter((g) => won.has(g.id)).map((g) => ({
      id: g.id,
      game: g.name,
      name: g.prize.name,
      desc: g.prize.desc,
    })),
    gifted: {
      total: ledger.giftedTotal(),
      items: ledger.gifted().map(({ points, note }) => (note ? { points, note } : { points })),
    },
    date: TURKISH_DATE.format(today),
    check,
    code,
  };
}
