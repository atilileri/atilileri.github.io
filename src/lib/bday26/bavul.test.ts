/*
 * Tests for "Bavul hazırla" (#219): the score, the trip cards and the one
 * input state machine.
 *
 *   node --test src/lib/bday26/bavul.test.ts
 *
 * Expected values come from the verdict on #214, not from the code: score =
 * 100 − 5 × empty cells − 10 × missing must-haves, floor 0; 23 kg is a gate
 * on closing; the input table (select, cancel, place / pick up, move, rotate,
 * take out, close). The stored packs (`bavul-packs.ts`) are the prototype's
 * exact-cover search results (`prototype/214-bavul`, SOL): per card the
 * lightest perfect pack ("ok", ≤ 23 kg) and a heavy one ("heavy", a trap).
 * They are test data only: she never sees them.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BAG_H,
  BAG_W,
  CARDS,
  ITEMS,
  ITEM_INFO,
  bavulScore,
  breakdown,
  can,
  drawCard,
  newRound,
  probe,
  shapeOf,
  step,
  type Action,
  type BavulEvent,
  type Round,
} from "./bavul.ts";
import { PACKS } from "./bavul-packs.ts";

/** Run actions in order; the last state and every event on the way. */
function run(state: Round, ...actions: Action[]): { state: Round; events: BavulEvent[] } {
  const events: BavulEvent[] = [];
  for (const a of actions) {
    const r = step(state, a);
    state = r.state;
    events.push(...r.events);
  }
  return { state, events };
}

const shapeKey = (cells: { x: number; y: number }[]) =>
  JSON.stringify(cells.map(({ x, y }) => [x, y]).sort((a, b) => a[1]! - b[1]! || a[0]! - b[0]!));

/** Packs `grid` the way she would with the mouse: click the list row, turn
 *  it with right clicks until it has the shape, click the bag where it goes. */
function pack(state: Round, grid: string[]): Round {
  const cells: Record<string, { x: number; y: number }[]> = {};
  grid.forEach((row, y) => [...row].forEach((ch, x) => (cells[ch] ??= []).push({ x, y })));
  for (const [ch, at] of Object.entries(cells)) {
    const i = ch.charCodeAt(0) - 65;
    const left = Math.min(...at.map((c) => c.x));
    const top = Math.min(...at.map((c) => c.y));
    const want = shapeKey(at.map(({ x, y }) => ({ x: x - left, y: y - top })));
    state = step(state, { t: "list", i }).state;
    for (let turns = 0; shapeKey(shapeOf(state.items[i]!)) !== want; turns++) {
      assert.ok(turns < 4, `${ITEMS[i]} never takes the shape it has in the pack`);
      state = step(state, { t: "rotate" }).state;
    }
    const s = shapeOf(state.items[i]!);
    const w = Math.max(...s.map((c) => c.x)) + 1;
    const h = Math.max(...s.map((c) => c.y)) + 1;
    // A list item hangs from its middle: aim the middle at the pack's box.
    state = step(state, { t: "act", at: { fx: left + w / 2, fy: top + h / 2 } }).state;
    assert.equal(state.hand, null, `${ITEMS[i]} went in`);
  }
  return state;
}

// ---------------------------------------------------------------- the score

test("a full bag with every must-have scores 100", () => {
  assert.equal(bavulScore({ empty: 0, missing: 0 }), 100);
});

test("one empty cell is 95, still the Small prize; two are 90", () => {
  assert.equal(bavulScore({ empty: 1, missing: 0 }), 95);
  assert.equal(bavulScore({ empty: 2, missing: 0 }), 90);
});

test("a missing must-have costs 10", () => {
  assert.equal(bavulScore({ empty: 0, missing: 1 }), 90);
  assert.equal(bavulScore({ empty: 1, missing: 1 }), 85);
});

test("the score never goes under 0: an empty bag is 0", () => {
  assert.equal(bavulScore({ empty: 48, missing: 4 }), 0);
  assert.equal(bavulScore({ empty: 19, missing: 1 }), 0);
});

// ---------------------------------------------------------- the trip cards

test("there are 4 trip cards, each with 4 must-haves from the 16 items", () => {
  assert.deepEqual(
    CARDS.map((c) => c.name),
    ["Lüksemburg'da yürüyüş", "Brugge'de şehir turu", "Kassel'de müze günü", "Kuzey Denizi'nde sahil"],
  );
  assert.equal(ITEMS.length, 16);
  for (const c of CARDS) {
    assert.equal(c.musts.length, 4, c.name);
    for (const m of c.musts) assert.ok(ITEMS.includes(m), `${c.name}: ${m}`);
  }
});

test("the 16 items fill 70 cells, more than the 48 of the bag", () => {
  assert.equal(BAG_W * BAG_H, 48);
  assert.equal(ITEMS.reduce((n, k) => n + ITEM_INFO[k].cells, 0), 70);
});

test("a card is never the same twice in a row, and every card comes up", () => {
  let seed = 7;
  const rng = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  let last = drawCard(undefined, rng);
  const seen = new Set([last]);
  for (let n = 0; n < 400; n++) {
    const next = drawCard(last, rng);
    assert.notEqual(next, last);
    assert.ok(next >= 0 && next < CARDS.length);
    seen.add(next);
    last = next;
  }
  assert.equal(seen.size, CARDS.length);
  // The edges of the random range: never the last card, never out of range.
  assert.equal(drawCard(0, () => 0), 1);
  assert.equal(drawCard(3, () => 0.9999), 2);
});

// ------------------------------------------------------ the input machine

const LAPTOP = ITEMS.indexOf("laptop");
const KITAP = ITEMS.indexOf("kitap");
const BOT = ITEMS.indexOf("bot");

test("select, then cancel: the item goes back to the list and the hand is empty", () => {
  for (const cancel of [{ t: "cancel" }, { t: "cancel", leave: true }, { t: "list", i: BOT }] as Action[]) {
    const { state, events } = run(newRound(0), { t: "list", i: BOT }, { t: "move", dx: 2, dy: 1 }, cancel);
    assert.equal(state.hand, null);
    assert.equal(state.items[BOT]!.placed, null);
    assert.ok(!events.some((e) => e.kind === "leave"), "holding, Esc only lets go");
  }
});

test("Tab selects the next item on the list; with an empty hand Esc asks to leave", () => {
  const tab = run(newRound(0), { t: "cycle", dir: 1 });
  assert.equal(tab.state.hand?.i, 0);
  assert.equal(run(tab.state, { t: "cycle", dir: 1 }).state.hand?.i, 1);
  assert.equal(run(newRound(0), { t: "cycle", dir: -1 }).state.hand?.i, ITEMS.length - 1);
  assert.deepEqual(run(newRound(0), { t: "cancel", leave: true }).events, [{ kind: "leave" }]);
  assert.deepEqual(run(newRound(0), { t: "cancel" }).events, [], "Bırak or a background click never leaves");
});

test("after placing, the hand is empty and the item sits where the ghost was", () => {
  const { state, events } = run(newRound(0), { t: "list", i: LAPTOP }, { t: "move", dx: 1, dy: 2 }, { t: "act" });
  assert.equal(state.hand, null);
  assert.deepEqual(state.items[LAPTOP]!.placed, { x: 1, y: 2 });
  assert.ok(events.some((e) => e.kind === "sound" && e.sound === "place"));
});

test("pick up from the bag, move and turn it, then cancel: its cell and rotation come back", () => {
  // The boot packed at (5, 2), turned once.
  const packed = run(newRound(0), { t: "list", i: BOT }, { t: "rotate" }, { t: "act", at: { fx: 6.5, fy: 3 } }).state;
  const home = { ...packed.items[BOT]! };
  assert.ok(home.placed);
  assert.equal(home.rot, 1);
  const grabbed = run(packed, { t: "act", at: { fx: home.placed.x + 0.5, fy: home.placed.y + 0.5 } }).state;
  assert.equal(grabbed.items[BOT]!.placed, null, "in her hand, not in the bag");
  const moved = run(grabbed, { t: "rotate" }, { t: "move", dx: -3, dy: 0 }, { t: "rotate" }).state;
  assert.notEqual(moved.items[BOT]!.rot, 1);
  const back = run(moved, { t: "cancel", leave: true });
  assert.equal(back.state.hand, null);
  assert.deepEqual(back.state.items[BOT]!.placed, home.placed);
  assert.equal(back.state.items[BOT]!.rot, 1);
  assert.ok(!back.events.some((e) => e.kind === "leave"));
});

test("a place on a packed cell is refused: she keeps the item, the bag is unchanged", () => {
  const packed = run(newRound(0), { t: "list", i: LAPTOP }, { t: "act" }).state;
  const { state, events } = run(packed, { t: "list", i: KITAP }, { t: "act" });
  assert.equal(state.hand?.i, KITAP);
  assert.equal(state.items[KITAP]!.placed, null);
  assert.deepEqual(state.items[LAPTOP]!.placed, { x: 0, y: 0 });
  assert.ok(events.some((e) => e.kind === "toast" && e.text === "Burası dolu"));
  assert.ok(events.some((e) => e.kind === "sound" && e.sound === "refuse"));
});

test("an item may go in over 23 kg, with a warning while held", () => {
  /** Holds the item and points it at the first free spot; null if none. */
  const hold = (s: Round, k: (typeof ITEMS)[number]) => {
    s = run(s, { t: "list", i: ITEMS.indexOf(k) }).state;
    for (let y = 0; y < BAG_H; y++) {
      for (let x = 0; x < BAG_W; x++) {
        const there = run(s, { t: "point", at: { fx: x + 0.5, fy: y + 0.5 } }).state;
        if (probe(there)!.ok) return there;
      }
    }
    throw new Error(`no room for ${k}`);
  };
  let s = newRound(0);
  // Heavy things first: 4 + 3.5 + 3 + 3 + 2.5 + 2 + 2 = 20 kg, then 2 more.
  for (const k of ["laptop", "kitap", "bot", "makyaj", "spor", "semsiye", "pantolon", "kamera"] as const) {
    s = hold(s, k);
    assert.equal(probe(s)!.warn, undefined, `${k}: still under 23 kg`);
    s = run(s, { t: "act" }).state;
  }
  assert.equal(breakdown(s).kg, 22);
  s = hold(s, "matara"); // +2 = 24: over
  assert.equal(probe(s)!.warn, "23 kg'ı aşar: bavul kapanmaz");
  s = run(s, { t: "act" }).state;
  assert.equal(s.hand, null, "it went in");
  assert.equal(breakdown(s).kg, 24);
  assert.equal(breakdown(s).heavy, true);
});

// Over 23 kg: see each card's heavy pack below.
test("close is refused with a full hand", () => {
  const holding = run(newRound(0), { t: "list", i: LAPTOP }, { t: "close" });
  assert.equal(holding.state.closing, false);
  assert.deepEqual(holding.events.filter((e) => e.kind !== "sound"), []);
  assert.equal(can(holding.state, "close"), false);
});

test("the close question: Esc goes back to packing, Enter ends the Round once", () => {
  const asked = run(newRound(0), { t: "close" }).state;
  assert.equal(asked.closing, true);
  assert.equal(can(asked, "rotate") || can(asked, "close") || can(asked, "next"), false, "the buttons rest");
  const back = run(asked, { t: "cancel", leave: true });
  assert.equal(back.state.closing, false);
  assert.ok(!back.events.some((e) => e.kind === "leave"));
  assert.deepEqual(run(asked, { t: "rotate" }, { t: "cycle", dir: 1 }).state, asked, "nothing else moves under it");
  assert.deepEqual(run(asked, { t: "act" }).events, [{ kind: "finish" }]);
});

test("take out: Backspace on a packed item, or a list click while holding a bag item, puts it back on the list", () => {
  const packed = run(newRound(0), { t: "list", i: LAPTOP }, { t: "act" }).state;
  const out1 = run(packed, { t: "point", at: { fx: 1.5, fy: 1.5 } }, { t: "takeOut" }).state;
  assert.equal(out1.items[LAPTOP]!.placed, null);
  const held = run(packed, { t: "act", at: { fx: 0.5, fy: 0.5 } }).state;
  const out2 = run(held, { t: "list", i: null }).state;
  assert.equal(out2.hand, null);
  assert.equal(out2.items[LAPTOP]!.placed, null);
});

test("a must-have chimes once when it goes in, and again only after it was taken out", () => {
  const must = (events: BavulEvent[]) => events.filter((e) => e.kind === "sound" && e.sound === "must").length;
  const first = run(newRound(0), { t: "list", i: BOT }, { t: "act" });
  assert.equal(must(first.events), 1);
  const moved = run(first.state, { t: "act", at: { fx: 0.5, fy: 0.5 } }, { t: "move", dx: 3, dy: 0 }, { t: "act" });
  assert.equal(must(moved.events), 0);
  const again = run(moved.state, { t: "takeOut" }, { t: "list", i: BOT }, { t: "act" });
  assert.equal(must(again.events), 1);
  assert.equal(must(run(newRound(0), { t: "list", i: LAPTOP }, { t: "act" }).events), 0, "not a must-have on this card");
});

for (const [c, card] of CARDS.entries()) {
  test(`${card.name}: the stored perfect pack scores 100 and the bag closes`, () => {
    const packed = pack(newRound(c), PACKS[card.name]!.ok);
    const b = breakdown(packed);
    assert.deepEqual({ empty: b.empty, missing: b.missing.length, score: b.score }, { empty: 0, missing: 0, score: 100 });
    assert.ok(b.kg <= 23, `${b.kg} kg`);
    const closed = run(packed, { t: "close" });
    assert.equal(closed.state.closing, true);
    assert.equal(run(closed.state, { t: "act" }).events.filter((e) => e.kind === "finish").length, 1);
  });

  test(`${card.name}: the stored heavy pack is perfect but refused at 23 kg`, () => {
    const packed = pack(newRound(c), PACKS[card.name]!.heavy);
    const b = breakdown(packed);
    assert.equal(b.empty, 0);
    assert.ok(b.kg > 23, `${b.kg} kg`);
    const closed = run(packed, { t: "close" });
    assert.equal(closed.state.closing, false);
    assert.ok(closed.events.some((e) => e.kind === "toast" && e.text === "23 kg'ı aştın"));
    assert.ok(closed.events.some((e) => e.kind === "sound" && e.sound === "gate"));
  });
}
