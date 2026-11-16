/**
 * The ledger: every progress rule of the birthday games site (/20261209/,
 * spec #192, built on #193), behind one small interface. The hub, the Games
 * and the Proof read and write her progress ONLY through this module.
 *
 * WHAT IS STORED, AND WHAT IS NOT. The state is facts only, as #175 decided:
 * her Best score per Game, whether the slot machine ever hit its jackpot, and
 * the log of Gift events (each buy with the price it was PAID, each Return).
 * Everything she sees as a number — Points earned, Balance, which Gifts she
 * holds, which Small prizes she won — is derived here on every read and never
 * written down. A rule can change and old progress stays right; a Gift's
 * price can change and an old buy still Returns half of what she paid.
 *
 * THE RULES (spec, "Progress state"; glossary `docs/bday26/GLOSSARY.md`):
 *   - A Round can only raise a Best score. A lower score leaves no trace.
 *   - Points earned = Σ over the 10 skill Games of ⌊Best score⌋. The slot
 *     machine gives none. No bonus for a Small prize. 1,000 is the most,
 *     which follows from clamping every score to 0..100 before it is kept.
 *   - Gifts held = Gifts whose last event is a buy.
 *   - Balance = Points earned − Σ paid of every buy + Σ ½ paid of every
 *     Return. Prices are multiples of 10, so a Return is always whole.
 *   - Buy needs: Gift not held, Balance ≥ catalogue price. The event stores
 *     paid = the catalogue price NOW.
 *   - Return needs: Gift held. It gives back half of THAT buy's paid.
 *   - Small prize won = Best score ≥ 95 for a skill Game; the jackpot flag for
 *     the slot machine.
 *
 * STORAGE IS INJECTED. `createLedger(store)` takes anything with
 * `getItem`/`setItem` — `localStorage` in the browser, a Map in the tests —
 * so the rules run under `node --test` with no DOM (spec, "Testing
 * Decisions", seam 1). The key is `bday26:v1`; the `v1` is the shape below,
 * and a shape change means a new key plus a migration, never a silent
 * re-read. The ledger writes after every Round, buy and Return, and reads
 * once when created: two ledgers on one store do not see each other's
 * writes, so a page makes one and keeps it. The browser side (the pages)
 * calls `navigator.storage.persist()` once; that is a browser concern and
 * lives in `./browser.ts`, not here.
 *
 * A BAD READ IS AN EMPTY START, never a throw: garbage in the key, an
 * unknown Game or Gift id, a score outside 0..100 — each is dropped on load,
 * because a hub that will not open is worse than a hub that shows less. The
 * welcome screen's "seen" flag is UI state and lives in its own key (#195),
 * outside this state and outside the Save code.
 *
 * THE SAVE CODE (#196) IS THIS STATE AS ONE LINE OF TEXT. `toSaveCode()`
 * seals `JSON.stringify` of the facts into the format of `./savecode.ts`
 * (base64url + a 6-character check code); `fromSaveCode(text)` opens a
 * pasted code and runs it through the same `parseProgress` that `load`
 * uses, without touching her progress, so the "Geri yükle" panel can show
 * both summaries first; `restore(text)` is `fromSaveCode` followed by
 * `replace`: every fact swapped, no merge. The pure `*Of(progress)` helpers
 * are exported so the panel can summarise a pasted code (Points, Balance,
 * Gifts held, Small prizes) the way the hub summarises hers. The format
 * module knows nothing of `Progress`; this module knows nothing of hashes.
 * The Proof (#197) calls `toSaveCode()` and prints `check` large and `code`
 * small.
 */
import {
  GAMES,
  PRIZE_BAR,
  gameById,
  giftById,
  isGameId,
  isGiftId,
  type GameId,
  type GiftId,
} from "./catalogue.ts";
import { decodeSaveCode, encodeSaveCode, type SaveCode, type SaveCodeProblem } from "./savecode.ts";

/** The `localStorage` key. See the header on `v1`. */
export const STORAGE_KEY = "bday26:v1";

/** What the ledger needs from storage: the two `localStorage` calls it uses. */
export type KeyValueStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

/** One Gift event. `paid` is the catalogue price at buy time; a Return
 *  repeats the `paid` of the buy it undoes, so the half it gives back can be
 *  read from the event alone. */
export type GiftEvent = { kind: "buy" | "return"; gift: GiftId; paid: number };

/** Her progress: facts only. Missing `best[id]` = never played. */
export type Progress = {
  best: Partial<Record<GameId, number>>;
  jackpot: boolean;
  log: GiftEvent[];
};

export function emptyProgress(): Progress {
  return { best: {}, jackpot: false, log: [] };
}

// ------------------------------------------------------- derived values

/** Points one Game earns from a Best score: ⌊score⌋, none for the slot. */
export function pointsOf(id: GameId, best: number | undefined): number {
  if (best == null || gameById(id).luck) return 0;
  return Math.floor(best);
}

/** Points earned: the sum over the skill Games. */
export function earnedOf(p: Progress): number {
  return GAMES.reduce((sum, g) => sum + pointsOf(g.id, p.best[g.id]), 0);
}

/** Gift id → price paid, for every Gift held now (last event is a buy). */
export function heldOf(p: Progress): Map<GiftId, number> {
  const held = new Map<GiftId, number>();
  for (const e of p.log) {
    if (e.kind === "buy") held.set(e.gift, e.paid);
    else held.delete(e.gift);
  }
  return held;
}

/** Points earned minus what the log cost: a buy's full price, less the half
 *  a Return gave back. */
export function balanceOf(p: Progress): number {
  const spent = p.log.reduce((sum, e) => sum + (e.kind === "buy" ? e.paid : -e.paid / 2), 0);
  return earnedOf(p) - spent;
}

/** Whether one Game's Small prize is won. */
export function prizeWonOf(p: Progress, id: GameId): boolean {
  if (gameById(id).luck) return p.jackpot;
  return (p.best[id] ?? 0) >= PRIZE_BAR;
}

/** The Games whose Small prize is won, in catalogue order. */
export function prizesWonOf(p: Progress): GameId[] {
  return GAMES.filter((g) => prizeWonOf(p, g.id)).map((g) => g.id);
}

// ------------------------------------------------------------ the ledger

export type RoundOutcome = {
  /** Her Best score in that Game after this Round. */
  best: number;
  /** True when this Round raised the Best score. */
  improved: boolean;
  /** True when this Round is the one that won the Small prize. */
  prizeWonNow: boolean;
};

export type BuyOutcome =
  | { ok: true; paid: number }
  | { ok: false; reason: "held" | "balance" };

export type ReturnOutcome =
  | { ok: true; returned: number }
  | { ok: false; reason: "not-held" };

/** What a pasted Save code holds, or why it was refused (see `./savecode.ts`
 *  for the three reasons; "payload" also covers text that is not a
 *  `Progress`, which no code made here can carry). */
export type SaveCodeOutcome =
  | { ok: true; progress: Progress }
  | { ok: false; reason: SaveCodeProblem };

export type Ledger = {
  /** A copy of the facts. For the Save code and the Proof, not for rules. */
  progress(): Progress;
  bestOf(id: GameId): number | undefined;
  pointsOf(id: GameId): number;
  earned(): number;
  balance(): number;
  /** Gift id → price paid, for every Gift held now. */
  held(): ReadonlyMap<GiftId, number>;
  holds(id: GiftId): boolean;
  prizeWon(id: GameId): boolean;
  prizesWon(): GameId[];
  /** One finished Round. Keeps the higher of the old Best score and this
   *  one. `jackpot: true` on the slot machine sets the jackpot flag. */
  recordRound(id: GameId, score: number, outcome?: { jackpot?: boolean }): RoundOutcome;
  /** Refused when held or when the Balance is below the price. */
  buy(id: GiftId): BuyOutcome;
  /** Refused when not held. Gives back half of the price paid. */
  returnGift(id: GiftId): ReturnOutcome;
  /** Replace every fact, no merge. The write behind `restore`. */
  replace(next: Progress): void;
  /** Her progress as one line of text to copy, with its check code on its
   *  own for the Proof. Same facts, same code. */
  toSaveCode(): Promise<SaveCode>;
  /** Open a pasted Save code without touching her progress: what "Geri
   *  yükle" shows beside hers before she confirms. */
  fromSaveCode(text: string): Promise<SaveCodeOutcome>;
  /** Replace her progress with a pasted Save code's. Refused, and nothing
   *  changes, for the same reasons `fromSaveCode` refuses. */
  restore(text: string): Promise<SaveCodeOutcome>;
};

export function createLedger(store: KeyValueStore): Ledger {
  let p = load(store);

  function commit(next: Progress) {
    p = next;
    store.setItem(STORAGE_KEY, JSON.stringify(p));
  }

  return {
    progress: () => clone(p),
    bestOf: (id) => p.best[id],
    pointsOf: (id) => pointsOf(id, p.best[id]),
    earned: () => earnedOf(p),
    balance: () => balanceOf(p),
    held: () => heldOf(p),
    holds: (id) => heldOf(p).has(id),
    prizeWon: (id) => prizeWonOf(p, id),
    prizesWon: () => prizesWonOf(p),

    recordRound(id, score, outcome) {
      const kept = clampScore(score);
      const before = p.best[id];
      const wonBefore = prizeWonOf(p, id);
      const improved = before == null || kept > before;
      const next = clone(p);
      if (improved) next.best[id] = kept;
      if (outcome?.jackpot && gameById(id).luck) next.jackpot = true;
      commit(next);
      return { best: p.best[id] ?? kept, improved, prizeWonNow: !wonBefore && prizeWonOf(p, id) };
    },

    buy(id) {
      const gift = giftById(id);
      if (heldOf(p).has(id)) return { ok: false, reason: "held" };
      if (balanceOf(p) < gift.price) return { ok: false, reason: "balance" };
      const next = clone(p);
      next.log.push({ kind: "buy", gift: id, paid: gift.price });
      commit(next);
      return { ok: true, paid: gift.price };
    },

    returnGift(id) {
      const paid = heldOf(p).get(id);
      if (paid == null) return { ok: false, reason: "not-held" };
      const next = clone(p);
      next.log.push({ kind: "return", gift: id, paid });
      commit(next);
      return { ok: true, returned: paid / 2 };
    },

    replace(next) {
      commit(clone(next));
    },

    toSaveCode: () => encodeSaveCode(JSON.stringify(p)),

    fromSaveCode: (text) => openSaveCode(text),

    async restore(text) {
      const outcome = await openSaveCode(text);
      if (outcome.ok) commit(clone(outcome.progress));
      return outcome;
    },
  };
}

/** A pasted Save code, opened and read as a `Progress`. */
async function openSaveCode(text: string): Promise<SaveCodeOutcome> {
  const opened = await decodeSaveCode(text);
  if (!opened.ok) return opened;
  const progress = parseProgress(opened.payload);
  return progress ? { ok: true, progress } : { ok: false, reason: "payload" };
}

// ------------------------------------------------------- load and parse

function load(store: KeyValueStore): Progress {
  let raw: string | null = null;
  try {
    raw = store.getItem(STORAGE_KEY);
  } catch {
    // A storage that throws (a blocked browser profile) is an empty start.
  }
  return (raw && parseProgress(raw)) || emptyProgress();
}

/**
 * The JSON text of a `Progress`, checked field by field. Returns null when
 * the text is not JSON or not an object; drops any Best score, Gift event or
 * field it does not understand. Shared by `load` and by #196's Save code.
 */
export function parseProgress(text: string): Progress | null {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  if (!isRecord(data)) return null;
  const out = emptyProgress();

  if (isRecord(data.best)) {
    for (const [id, score] of Object.entries(data.best)) {
      if (isGameId(id) && typeof score === "number" && Number.isFinite(score)) {
        out.best[id] = clampScore(score);
      }
    }
  }
  out.jackpot = data.jackpot === true;
  if (Array.isArray(data.log)) {
    for (const e of data.log) {
      if (!isRecord(e)) continue;
      if (e.kind !== "buy" && e.kind !== "return") continue;
      if (typeof e.gift !== "string" || !isGiftId(e.gift)) continue;
      if (typeof e.paid !== "number" || !Number.isFinite(e.paid) || e.paid < 0) continue;
      out.log.push({ kind: e.kind, gift: e.gift, paid: e.paid });
    }
  }
  return out;
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

/** A score is 0..100; anything else is a Game's bug, kept inside the range. */
function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.min(100, Math.max(0, score));
}

function clone(p: Progress): Progress {
  return { best: { ...p.best }, jackpot: p.jackpot, log: p.log.map((e) => ({ ...e })) };
}
