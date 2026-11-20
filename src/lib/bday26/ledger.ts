/**
 * The ledger: every progress rule of the birthday games site (/20261209/,
 * spec #192, built on #193), behind one small interface. The hub, the Games
 * and the Proof read and write her progress ONLY through this module.
 *
 * WHAT IS STORED, AND WHAT IS NOT. The state is facts only, as #175 decided:
 * her Best score per Game, whether the slot machine ever hit its jackpot, and
 * the log of Gift events (each buy with the price it was PAID, each Return),
 * and the Gifted points Atıl gave her from the hub's admin panel.
 * Everything she sees as a number — Points earned, Balance, which Gifts she
 * holds, which Small prizes she won — is derived here on every read and never
 * written down. A rule can change and old progress stays right; a Gift's
 * price can change and an old buy still Returns half of what she paid.
 *
 * THE RULES (spec, "Progress state"; glossary `docs/bday26/GLOSSARY.md`):
 *   - A Round can only raise a Best score. A lower score leaves no trace.
 *   - Points earned = Σ over the 10 skill Games of ⌊Best score⌋. The slot
 *     machine and the 3 Prize Games give none (#213). No bonus for a Small
 *     prize. 1,000 is the most, which follows from clamping every score to
 *     0..100 before it is kept.
 *   - Gifts held = Gifts whose last event is a buy.
 *   - Balance = Points earned + Gifted points − Σ paid of every buy + Σ ½
 *     paid of every Return. Prices are multiples of 10, so a Return is
 *     always whole.
 *   - Gifted points are whole numbers above 0. They are NOT Points earned,
 *     so the 1,000 cap is for Game Points only. Only the newest gift can be
 *     undone (a typo), and not when its Points are already spent.
 *   - Buy needs: Gift not held, Balance ≥ catalogue price. The event stores
 *     paid = the catalogue price NOW.
 *   - Return needs: Gift held. It gives back half of THAT buy's paid.
 *   - Small prize won = Best score ≥ 95 for a skill Game or a Prize Game;
 *     the jackpot flag for the slot machine.
 *
 * STORAGE IS INJECTED. `createLedger(store)` takes anything with
 * `getItem`/`setItem` — `localStorage` in the browser, a Map in the tests —
 * so the rules run under `node --test` with no DOM (spec, "Testing
 * Decisions", seam 1). The key is `bday26:v1`; the `v1` is the shape below,
 * and a shape change means a new key plus a migration, never a silent
 * re-read. `gifted` came later as an optional field: a state or Save code
 * without it reads as no gifts, so the shape stays `v1`. The ledger writes
 * after every Round, buy, Return and gift, and looks at storage again before
 * every read and every change, applying a change to what is stored NOW: a
 * page restored by Back with old facts in memory, or a second tab, must
 * never write those old facts over a newer Best score or buy. Two ledgers
 * on one store therefore see each other's writes. The browser side (the pages)
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
  givesPoints,
  isLuckGame,
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
 *  repeats the `paid` of the buy it undoes, for a reader of the log. The
 *  half it gives back is still read from that buy (`balanceOf`). */
export type GiftEvent = { kind: "buy" | "return"; gift: GiftId; paid: number };

/** Her progress: facts only. Missing `best[id]` = never played. */
export type Progress = {
  best: Partial<Record<GameId, number>>;
  jackpot: boolean;
  log: GiftEvent[];
  /** Gifted points Atıl gave, oldest first. Missing = none (a state or Save
   *  code from before gifts existed). */
  gifted?: GiftedPoints[];
};

/** One gift of Points from Atıl (*Hediye puan*): a whole number above 0,
 *  an optional note, and when (ISO 8601). */
export type GiftedPoints = { points: number; note?: string; at: string };

export function emptyProgress(): Progress {
  return { best: {}, jackpot: false, log: [], gifted: [] };
}

// ------------------------------------------------------- derived values

/** Points one Game earns from a Best score: ⌊score⌋, none for the slot
 *  machine or a Prize Game. */
export function pointsOf(id: GameId, best: number | undefined): number {
  if (best == null || !givesPoints(gameById(id))) return 0;
  return Math.floor(best);
}

/** Points earned: the sum over the skill Games. */
export function earnedOf(p: Progress): number {
  return GAMES.reduce((sum, g) => sum + pointsOf(g.id, p.best[g.id]), 0);
}

/** Gifted points: the sum of every gift from Atıl. Not Points earned. */
export function giftedOf(p: Progress): number {
  return (p.gifted ?? []).reduce((sum, g) => sum + g.points, 0);
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

/** Points earned plus Gifted points, minus what the log cost: a buy's full price, less the half
 *  a Return gave back. That half is read from the buy the Return undoes, not
 *  from the Return line, so a pasted log cannot add Points with it. */
export function balanceOf(p: Progress): number {
  const held = new Map<GiftId, number>();
  let spent = 0;
  for (const e of p.log) {
    if (e.kind === "buy") {
      held.set(e.gift, e.paid);
      spent += e.paid;
    } else {
      spent -= (held.get(e.gift) ?? 0) / 2;
      held.delete(e.gift);
    }
  }
  return earnedOf(p) + giftedOf(p) - spent;
}

/** Whether one Game's Small prize is won. */
export function prizeWonOf(p: Progress, id: GameId): boolean {
  if (isLuckGame(gameById(id))) return p.jackpot;
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

export type GiftPointsOutcome =
  | { ok: true; points: number }
  | { ok: false; reason: "points" };

export type UndoGiftOutcome =
  | { ok: true; points: number }
  | { ok: false; reason: "none" | "spent" };

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
  /** Whether `buy(id)` would go through now: not held, and the Balance
   *  covers the catalogue price. The shop's "Al" asks this. */
  canBuy(id: GiftId): boolean;
  /** Points the Balance is short of the catalogue price; 0 when it covers
   *  it. The shop's "N eksik". */
  shortOf(id: GiftId): number;
  /** What a Return would give back now (half of what that buy paid), or
   *  null when the Gift is not held. */
  refundOf(id: GiftId): number | null;
  prizeWon(id: GameId): boolean;
  prizesWon(): GameId[];
  /** Every gift of Points from Atıl, oldest first. */
  gifted(): GiftedPoints[];
  /** The sum of `gifted()`: part of the Balance, never of Points earned. */
  giftedTotal(): number;
  /** Atıl gives Points. Refused unless a whole number above 0. */
  giftPoints(points: number, note?: string, at?: string): GiftPointsOutcome;
  /** Take back the newest gift (a typo). Refused when there is none, or
   *  when its Points are already spent: the Balance never goes below 0. */
  undoLastGift(): UndoGiftOutcome;
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
  // `seen` is the text storage held when this ledger last looked. Before any
  // read or change the ledger looks again: text that moved was written by
  // another page (a second tab, or a Game while this page sat in the back/
  // forward cache), so its facts replace these. Text that did not move keeps
  // these, which also keeps a change whose write the browser refused (quota
  // full) for the rest of the visit.
  let seen = read(store);
  let p = parsed(seen);

  function fresh(): Progress {
    const now = read(store);
    if (now !== seen) {
      seen = now;
      p = parsed(now);
    }
    return p;
  }

  function commit(next: Progress) {
    p = next;
    store.setItem(STORAGE_KEY, JSON.stringify(p));
    seen = read(store);
  }

  return {
    progress: () => clone(fresh()),
    bestOf: (id) => fresh().best[id],
    pointsOf: (id) => pointsOf(id, fresh().best[id]),
    earned: () => earnedOf(fresh()),
    balance: () => balanceOf(fresh()),
    held: () => heldOf(fresh()),
    holds: (id) => heldOf(fresh()).has(id),
    canBuy: (id) => !heldOf(fresh()).has(id) && balanceOf(p) >= giftById(id).price,
    shortOf: (id) => Math.max(0, giftById(id).price - balanceOf(fresh())),
    refundOf: (id) => {
      const paid = heldOf(fresh()).get(id);
      return paid == null ? null : paid / 2;
    },
    prizeWon: (id) => prizeWonOf(fresh(), id),
    prizesWon: () => prizesWonOf(fresh()),
    gifted: () => clone(fresh()).gifted ?? [],
    giftedTotal: () => giftedOf(fresh()),

    giftPoints(points, note, at = new Date().toISOString()) {
      if (!Number.isInteger(points) || points <= 0) return { ok: false, reason: "points" };
      const next = clone(fresh());
      const trimmed = note?.trim();
      next.gifted = [...(next.gifted ?? []), { points, ...(trimmed ? { note: trimmed } : {}), at }];
      commit(next);
      return { ok: true, points };
    },

    undoLastGift() {
      fresh();
      const last = p.gifted?.at(-1);
      if (!last) return { ok: false, reason: "none" };
      if (balanceOf(p) < last.points) return { ok: false, reason: "spent" };
      const next = clone(p);
      next.gifted = next.gifted!.slice(0, -1);
      commit(next);
      return { ok: true, points: last.points };
    },

    recordRound(id, score, outcome) {
      const kept = clampScore(score);
      fresh();
      const before = p.best[id];
      const wonBefore = prizeWonOf(p, id);
      const improved = before == null || kept > before;
      const next = clone(p);
      if (improved) next.best[id] = kept;
      if (outcome?.jackpot && isLuckGame(gameById(id))) next.jackpot = true;
      commit(next);
      return { best: p.best[id] ?? kept, improved, prizeWonNow: !wonBefore && prizeWonOf(p, id) };
    },

    buy(id) {
      const gift = giftById(id);
      fresh();
      if (heldOf(p).has(id)) return { ok: false, reason: "held" };
      if (balanceOf(p) < gift.price) return { ok: false, reason: "balance" };
      const next = clone(p);
      next.log.push({ kind: "buy", gift: id, paid: gift.price });
      commit(next);
      return { ok: true, paid: gift.price };
    },

    returnGift(id) {
      const paid = heldOf(fresh()).get(id);
      if (paid == null) return { ok: false, reason: "not-held" };
      const next = clone(p);
      next.log.push({ kind: "return", gift: id, paid });
      commit(next);
      return { ok: true, returned: paid / 2 };
    },

    replace(next) {
      commit(clone(next));
    },

    toSaveCode: () => encodeSaveCode(JSON.stringify(fresh())),

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

/** The stored text, or null when there is none or storage throws (a
 *  blocked browser profile: an empty start). */
function read(store: KeyValueStore): string | null {
  try {
    return store.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function parsed(raw: string | null): Progress {
  return (raw && parseProgress(raw)) || emptyProgress();
}

/**
 * The JSON text of a `Progress`, checked field by field. Returns null when
 * the text is not JSON or not an object; drops any Best score, Gift event or
 * field it does not understand, and a Return of a Gift that no buy before it
 * left held (no code made here carries one, and that one line must not cost
 * her the rest, review A2). A buy of a Gift no longer in the catalogue (#213
 * took the weekend trip and the paint set out of the shop) is dropped the
 * same way, so a Save code from before that change still restores. Shared by
 * the ledger's reads and by #196's Save code.
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
    const held = new Set<GiftId>();
    for (const e of data.log) {
      if (!isRecord(e)) continue;
      if (e.kind !== "buy" && e.kind !== "return") continue;
      if (typeof e.gift !== "string" || !isGiftId(e.gift)) continue;
      if (typeof e.paid !== "number" || !Number.isFinite(e.paid) || e.paid < 0) continue;
      if (e.kind === "buy") held.add(e.gift);
      else if (!held.delete(e.gift)) continue;
      out.log.push({ kind: e.kind, gift: e.gift, paid: e.paid });
    }
  }
  if (Array.isArray(data.gifted)) {
    for (const g of data.gifted) {
      if (!isRecord(g) || typeof g.at !== "string") continue;
      if (typeof g.points !== "number" || !Number.isInteger(g.points) || g.points <= 0) continue;
      const note = typeof g.note === "string" && g.note.trim() ? { note: g.note.trim() } : {};
      out.gifted!.push({ points: g.points, ...note, at: g.at });
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
  return {
    best: { ...p.best },
    jackpot: p.jackpot,
    log: p.log.map((e) => ({ ...e })),
    gifted: (p.gifted ?? []).map((g) => ({ ...g })),
  };
}
