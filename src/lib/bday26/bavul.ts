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
 *     (`bavulScore` in `./scores.ts`, with every Game's score). One empty
 *     cell is 95: still the Small prize.
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

import { bavulScore } from "./scores.ts";

// ------------------------------------------------------------------ rules

export const BAG_W = 8;
export const BAG_H = 6;
export const KG_LIMIT = 23;
/** Floating-point room for sums like 3.5 + 1.5 + … against the 23 kg gate. */
const EPS = 1e-9;

// ------------------------------------------------------------------ items

export type ItemKey =
  | "laptop"
  | "kitap"
  | "semsiye"
  | "yagmur"
  | "bot"
  | "atki"
  | "pantolon"
  | "elbise"
  | "kazak"
  | "spor"
  | "tisort"
  | "kamera"
  | "matara"
  | "rehber"
  | "makyaj"
  | "sapka";

/** The 16 items in list order (the prototype's; its packs letter them A–P). */
export const ITEMS: readonly ItemKey[] = ["laptop", "kitap", "semsiye", "yagmur", "bot", "atki", "pantolon", "elbise", "kazak", "spor", "tisort", "kamera", "matara", "rehber", "makyaj", "sapka"];

/** A cell of a shape or of the bag: x across, y down, from the top left. */
export type Cell = { x: number; y: number };

/** Shapes: rows split by "/", "#" a cell. Rotations only, never mirrored.
 *  The weights make the dense items (laptop, books, boots, make-up bag)
 *  fill the bag fast but push it over 23 kg. */
const CATALOGUE: Record<ItemKey, { name: string; emoji: string; shape: string; kg: number; color: string }> = {
  laptop: { name: "Laptop", emoji: "💻", shape: "###/###", kg: 4, color: "#b8c4d6" },
  kitap: { name: "Kitaplar", emoji: "📚", shape: "##/##", kg: 3.5, color: "#e9b17a" },
  semsiye: { name: "Şemsiye", emoji: "☂️", shape: "#####", kg: 2, color: "#c9a6e4" },
  yagmur: { name: "Yağmurluk", emoji: "🧥", shape: "###/.#./.#.", kg: 2, color: "#f4d36b" },
  bot: { name: "Yürüyüş botu", emoji: "🥾", shape: "#./#./##", kg: 3, color: "#c99a74" },
  atki: { name: "Atkı", emoji: "🧣", shape: "##./.##", kg: 1, color: "#f19a9a" },
  pantolon: { name: "Pantolon", emoji: "👖", shape: "##../.###", kg: 2, color: "#8fb3e8" },
  elbise: { name: "Elbise", emoji: "👗", shape: ".##/.#./##.", kg: 1.5, color: "#7fd1c1" },
  kazak: { name: "Kazak", emoji: "🧶", shape: ".#./###/.#.", kg: 2, color: "#f2a6c8" },
  spor: { name: "Spor ayakkabı", emoji: "👟", shape: ".#/.#/##", kg: 2.5, color: "#9fd89a" },
  tisort: { name: "Tişörtler", emoji: "👕", shape: "###/.#.", kg: 1, color: "#a7c7f7" },
  kamera: { name: "Fotoğraf makinesi", emoji: "📷", shape: "#./##", kg: 2, color: "#b4b4bc" },
  matara: { name: "Matara", emoji: "🧴", shape: "###", kg: 2, color: "#9ee0d6" },
  rehber: { name: "Rehber kitap", emoji: "📕", shape: "###", kg: 2, color: "#f3a07e" },
  makyaj: { name: "Makyaj çantası", emoji: "👝", shape: "##/##/#.", kg: 3, color: "#e6a1d9" },
  sapka: { name: "Şapka", emoji: "👒", shape: ".##/##./.#.", kg: 1.5, color: "#f6c28b" },
};

const parse = (s: string): Cell[] => s.split("/").flatMap((row, y) => [...row].flatMap((ch, x) => (ch === "#" ? [{ x, y }] : [])));
const norm = (cells: Cell[]): Cell[] => {
  const mx = Math.min(...cells.map((c) => c.x));
  const my = Math.min(...cells.map((c) => c.y));
  return cells.map((c) => ({ x: c.x - mx, y: c.y - my })).sort((a, b) => a.y - b.y || a.x - b.x);
};
const turn = (cells: Cell[]): Cell[] => norm(cells.map((c) => ({ x: -c.y, y: c.x })));
/** The distinct quarter turns of a shape, the first one as written. */
function orientations(cells: Cell[]): Cell[][] {
  const out: Cell[][] = [];
  let k = norm(cells);
  for (let i = 0; i < 4; i++) {
    if (!out.some((o) => JSON.stringify(o) === JSON.stringify(k))) out.push(k);
    k = turn(k);
  }
  return out;
}

export type ItemInfo = {
  name: string;
  emoji: string;
  kg: number;
  /** The piece's colour in the bag and on the list's mini shape. */
  color: string;
  cells: number;
  /** Every distinct rotation; an item's `rot` indexes this. */
  shapes: Cell[][];
};

export const ITEM_INFO: Record<ItemKey, ItemInfo> = Object.fromEntries(
  ITEMS.map((k) => {
    const c = CATALOGUE[k];
    const shapes = orientations(parse(c.shape));
    return [k, { name: c.name, emoji: c.emoji, kg: c.kg, color: c.color, cells: shapes[0]!.length, shapes }];
  }),
) as Record<ItemKey, ItemInfo>;

/** Width and height of a shape. */
export function dims(shape: Cell[]): { w: number; h: number } {
  return { w: Math.max(...shape.map((c) => c.x)) + 1, h: Math.max(...shape.map((c) => c.y)) + 1 };
}

// ------------------------------------------------------------------ cards

export type TripCard = { name: string; musts: readonly ItemKey[] };

export const CARDS: readonly TripCard[] = [
  { name: "Lüksemburg'da yürüyüş", musts: ["bot", "yagmur", "matara", "atki"] },
  { name: "Brugge'de şehir turu", musts: ["kamera", "semsiye", "spor", "rehber"] },
  { name: "Kassel'de müze günü", musts: ["elbise", "makyaj", "kitap", "tisort"] },
  { name: "Kuzey Denizi'nde sahil", musts: ["sapka", "atki", "kamera", "matara"] },
];

/** The card for the next Round: random, never the one of the Round before. */
export function drawCard(last: number | undefined, rng: () => number): number {
  if (last == null) return Math.floor(rng() * CARDS.length) % CARDS.length;
  const i = Math.floor(rng() * (CARDS.length - 1)) % (CARDS.length - 1);
  return i >= last ? i + 1 : i;
}

// ------------------------------------------------------------------ the Round

export type Item = { i: number; key: ItemKey; rot: number; placed: Cell | null };

/** What she holds: the item, where it came from (the list, or its bag cell
 *  and rotation), and for a bag item the cell of it she grabbed. */
export type Hand = { i: number; origin: "list" | { x: number; y: number; rot: number }; grab: Cell | null };

export type Round = {
  /** Index into `CARDS`. */
  card: number;
  items: Item[];
  /** null: "Elin boş". */
  hand: Hand | null;
  /** Top left of the held item in the bag (its ghost). */
  pos: Cell;
  /** The bag cell under the keyboard cursor or the pointer. */
  cursor: Cell;
  /** Must-haves that have played their chime (each once, until taken out). */
  mustDone: ItemKey[];
  /** The close question is open. */
  closing: boolean;
};

/** A pointer over the bag, in cells, fractional (2.5 = the middle of column 2). */
export type Point = { fx: number; fy: number };

export type Action =
  | { t: "list"; i: number | null }
  | { t: "cycle"; dir: 1 | -1 }
  | { t: "cancel"; leave?: boolean }
  | { t: "act"; at?: Point }
  | { t: "move"; dx: number; dy: number }
  | { t: "point"; at: Point }
  | { t: "rotate" }
  | { t: "takeOut" }
  | { t: "close" };

export type BavulSound = "pick" | "rotate" | "place" | "out" | "refuse" | "gate" | "must";

export type BavulEvent =
  | { kind: "sound"; sound: BavulSound; delay?: number }
  | { kind: "toast"; text: string }
  /** Esc with an empty hand: the shell's leave question. */
  | { kind: "leave" }
  /** "Kapat" on the close question: the Round is over. */
  | { kind: "finish" };

export function newRound(card: number): Round {
  return {
    card,
    items: ITEMS.map((key, i) => ({ i, key, rot: 0, placed: null })),
    hand: null,
    pos: { x: 0, y: 0 },
    cursor: { x: 0, y: 0 },
    mustDone: [],
    closing: false,
  };
}

/** The item's cells in its current rotation, from its own top left. */
export function shapeOf(item: Item): Cell[] {
  const shapes = ITEM_INFO[item.key].shapes;
  return shapes[item.rot % shapes.length]!;
}

/** The item's cells with its top left at (x, y). */
export function cellsAt(item: Item, x: number, y: number): Cell[] {
  return shapeOf(item).map((c) => ({ x: x + c.x, y: y + c.y }));
}

/** The packed items covering any of these cells. */
export function itemsCovering(state: Round, cells: Cell[]): Item[] {
  const set = new Set(cells.map((c) => c.y * BAG_W + c.x));
  return state.items.filter((it) => it.placed && cellsAt(it, it.placed.x, it.placed.y).some((c) => set.has(c.y * BAG_W + c.x)));
}

/** Kilograms in the bag. */
export function kgOf(state: Round): number {
  return state.items.reduce((s, it) => s + (it.placed ? ITEM_INFO[it.key].kg : 0), 0);
}

export type Probe = { cells: Cell[]; ok: boolean; why?: string; warn?: string };

/** Where the held item would land, and whether it may. */
export function probe(state: Round): Probe | null {
  if (!state.hand) return null;
  const it = state.items[state.hand.i]!;
  const cells = cellsAt(it, state.pos.x, state.pos.y);
  if (itemsCovering(state, cells).length) return { cells, ok: false, why: "Burası dolu" };
  if (kgOf(state) + ITEM_INFO[it.key].kg > KG_LIMIT + EPS) return { cells, ok: true, warn: `${KG_LIMIT} kg'ı aşar: bavul kapanmaz` };
  return { cells, ok: true };
}

export type Breakdown = {
  filled: number;
  empty: number;
  missing: ItemKey[];
  kg: number;
  /** Over 23 kg: the bag will not close. */
  heavy: boolean;
  score: number;
};

/** The bag as it stands, and the score it would close with. */
export function breakdown(state: Round): Breakdown {
  const filled = state.items.reduce((s, it) => s + (it.placed ? shapeOf(it).length : 0), 0);
  const empty = BAG_W * BAG_H - filled;
  const missing = CARDS[state.card]!.musts.filter((k) => !state.items.find((it) => it.key === k)!.placed);
  const kg = kgOf(state);
  return { filled, empty, missing, kg, heavy: kg > KG_LIMIT + EPS, score: bavulScore({ empty, missing: missing.length }) };
}

// ------------------------------------------------------------------ the state machine

function clone(s: Round): Round {
  return {
    ...s,
    items: s.items.map((it) => ({ ...it, placed: it.placed && { ...it.placed } })),
    hand: s.hand && { ...s.hand, grab: s.hand.grab && { ...s.hand.grab }, origin: typeof s.hand.origin === "object" ? { ...s.hand.origin } : s.hand.origin },
    pos: { ...s.pos },
    cursor: { ...s.cursor },
    mustDone: [...s.mustDone],
  };
}

/** The cell of a shape nearest its middle: where a list item hangs. */
function middleCell(shape: Cell[]): Cell {
  const d = dims(shape);
  const cx = (d.w - 1) / 2;
  const cy = (d.h - 1) / 2;
  const dist = (c: Cell) => Math.hypot(c.x - cx, c.y - cy);
  return shape.slice().sort((p, q) => dist(p) - dist(q))[0]!;
}

function clampPos(s: Round) {
  const d = dims(shapeOf(s.items[s.hand!.i]!));
  s.pos.x = Math.max(0, Math.min(BAG_W - d.w, s.pos.x));
  s.pos.y = Math.max(0, Math.min(BAG_H - d.h, s.pos.y));
}

function clampCursor(s: Round) {
  s.cursor.x = Math.max(0, Math.min(BAG_W - 1, s.cursor.x));
  s.cursor.y = Math.max(0, Math.min(BAG_H - 1, s.cursor.y));
}

const grabOf = (s: Round) => s.hand!.grab ?? middleCell(shapeOf(s.items[s.hand!.i]!));

/** Puts the ghost under the pointer (a list item centred on it) or around the cursor. */
function aim(s: Round, at?: Point) {
  const d = dims(shapeOf(s.items[s.hand!.i]!));
  if (at && s.hand!.origin === "list") {
    s.pos.x = Math.round(at.fx - d.w / 2);
    s.pos.y = Math.round(at.fy - d.h / 2);
  } else {
    const g = grabOf(s);
    const c = at ? { x: Math.floor(at.fx), y: Math.floor(at.fy) } : s.cursor;
    s.pos.x = c.x - g.x;
    s.pos.y = c.y - g.y;
  }
  clampPos(s);
}

const fromBag = (s: Round) => !!(s.hand && typeof s.hand.origin === "object");

/** The held item goes back where it came from: the list, or its bag cell and rotation. */
function returnHand(s: Round, ev: BavulEvent[]) {
  if (!s.hand) return;
  const it = s.items[s.hand.i]!;
  if (typeof s.hand.origin === "object") {
    it.placed = { x: s.hand.origin.x, y: s.hand.origin.y };
    it.rot = s.hand.origin.rot;
  }
  s.hand = null;
  ev.push({ kind: "sound", sound: "out" });
}

function holdFromList(s: Round, i: number, ev: BavulEvent[]) {
  s.hand = { i, origin: "list", grab: null };
  aim(s);
  ev.push({ kind: "sound", sound: "pick" });
}

function pickUp(s: Round, it: Item, cell: Cell, ev: BavulEvent[]) {
  const placed = it.placed!;
  s.hand = { i: it.i, origin: { x: placed.x, y: placed.y, rot: it.rot }, grab: { x: cell.x - placed.x, y: cell.y - placed.y } };
  s.pos = { x: placed.x, y: placed.y };
  it.placed = null;
  ev.push({ kind: "sound", sound: "pick" });
}

/** The item leaves the bag for good: back on the list. */
function takeOut(s: Round, it: Item, ev: BavulEvent[]) {
  it.placed = null;
  s.mustDone = s.mustDone.filter((k) => k !== it.key);
  ev.push({ kind: "sound", sound: "out" });
}

function nextUnplaced(s: Round, from: number, dir: number): number {
  const n = s.items.length;
  for (let k = 1; k <= n; k++) {
    const j = (((from + dir * k) % n) + n) % n;
    if (!s.items[j]!.placed && s.hand?.i !== j) return j;
  }
  return -1;
}

export type Verb = "rotate" | "place" | "out" | "next" | "cancel" | "close";

/** What each button can do right now; one that cannot greys out. */
export function can(s: Round, verb: Verb): boolean {
  if (s.closing) return false;
  const under = !s.hand && itemsCovering(s, [s.cursor]).length > 0;
  switch (verb) {
    case "rotate":
    case "place":
    case "cancel":
      return !!s.hand;
    case "out":
      return fromBag(s) || under;
    case "next":
      return nextUnplaced(s, s.hand ? s.hand.i : -1, 1) >= 0 || fromBag(s);
    case "close":
      return !s.hand;
  }
}

/** THE INPUT STATE MACHINE: one action in, the next state and its events out. */
export function step(s0: Round, a: Action): { state: Round; events: BavulEvent[] } {
  const s = clone(s0);
  const ev: BavulEvent[] = [];
  if (s.closing) {
    // The close question: Enter / "Kapat" ends the Round, Esc / "Devam et" goes back.
    if (a.t === "act") ev.push({ kind: "finish" });
    else if (a.t === "cancel") s.closing = false;
    return { state: s, events: ev };
  }
  switch (a.t) {
    case "list": {
      if (fromBag(s)) {
        takeOut(s, s.items[s.hand!.i]!, ev);
        s.hand = null;
        break;
      }
      if (a.i == null) break;
      const it = s.items[a.i]!;
      if (s.hand?.i === a.i) {
        returnHand(s, ev); // the second click: unselect
        break;
      }
      returnHand(s, []);
      if (it.placed) {
        const g = middleCell(shapeOf(it));
        pickUp(s, it, { x: it.placed.x + g.x, y: it.placed.y + g.y }, ev);
      } else holdFromList(s, a.i, ev);
      break;
    }
    case "cycle": {
      const from = s.hand ? s.hand.i : a.dir > 0 ? -1 : 0;
      returnHand(s, []);
      const j = nextUnplaced(s, from, a.dir);
      if (j >= 0) holdFromList(s, j, ev);
      break;
    }
    case "cancel":
      if (s.hand) returnHand(s, ev);
      else if (a.leave) ev.push({ kind: "leave" });
      break;
    case "act": {
      if (a.at) {
        s.cursor = { x: Math.floor(a.at.fx), y: Math.floor(a.at.fy) };
        clampCursor(s);
      }
      if (s.hand) {
        if (a.at) aim(s, a.at);
        const p = probe(s)!;
        if (!p.ok) {
          ev.push({ kind: "toast", text: p.why! }, { kind: "sound", sound: "refuse" });
          break;
        }
        const it = s.items[s.hand.i]!;
        const g = grabOf(s);
        it.placed = { x: s.pos.x, y: s.pos.y };
        s.cursor = { x: s.pos.x + g.x, y: s.pos.y + g.y };
        clampCursor(s);
        s.hand = null;
        ev.push({ kind: "sound", sound: "place" });
        if (CARDS[s.card]!.musts.includes(it.key) && !s.mustDone.includes(it.key)) {
          s.mustDone.push(it.key);
          ev.push({ kind: "sound", sound: "must", delay: 140 });
        }
      } else {
        const under = itemsCovering(s, [s.cursor])[0];
        if (under) pickUp(s, under, s.cursor, ev);
      }
      break;
    }
    case "move":
      if (s.hand) {
        s.pos.x += a.dx;
        s.pos.y += a.dy;
        clampPos(s);
        const g = grabOf(s);
        s.cursor = { x: s.pos.x + g.x, y: s.pos.y + g.y };
      } else {
        s.cursor.x += a.dx;
        s.cursor.y += a.dy;
      }
      clampCursor(s);
      break;
    case "point":
      s.cursor = { x: Math.floor(a.at.fx), y: Math.floor(a.at.fy) };
      clampCursor(s);
      if (s.hand) aim(s, a.at);
      break;
    case "rotate": {
      if (!s.hand) break;
      const it = s.items[s.hand.i]!;
      const n = ITEM_INFO[it.key].shapes.length;
      ev.push({ kind: "sound", sound: "rotate" });
      if (n === 1) break;
      // Turn around the held cell, so the item does not jump.
      const g = grabOf(s);
      const ax = s.pos.x + g.x;
      const ay = s.pos.y + g.y;
      const raw = shapeOf(it).map((c) => ({ x: -c.y, y: c.x }));
      const mx = Math.min(...raw.map((c) => c.x));
      const my = Math.min(...raw.map((c) => c.y));
      it.rot = (it.rot + 1) % n;
      if (s.hand.grab) s.hand.grab = { x: -g.y - mx, y: g.x - my };
      const g2 = grabOf(s);
      s.pos.x = ax - g2.x;
      s.pos.y = ay - g2.y;
      clampPos(s);
      break;
    }
    case "takeOut": {
      if (fromBag(s)) {
        takeOut(s, s.items[s.hand!.i]!, ev);
        s.hand = null;
        break;
      }
      if (s.hand) break;
      const under = itemsCovering(s, [s.cursor])[0];
      if (under) takeOut(s, under, ev);
      break;
    }
    case "close":
      if (s.hand) break;
      if (kgOf(s) > KG_LIMIT + EPS) ev.push({ kind: "toast", text: `${KG_LIMIT} kg'ı aştın` }, { kind: "sound", sound: "gate" });
      else s.closing = true;
      break;
  }
  return { state: s, events: ev };
}
