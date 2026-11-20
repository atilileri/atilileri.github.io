/*
 * Tests for "Bavul hazırla" (#219): the score, the trip cards and the one
 * input state machine.
 *
 *   node --test src/lib/bday26/bavul.test.ts
 *
 * Expected values come from the verdict on #214, not from the code: score =
 * 100 − 5 × empty cells − 10 × missing must-haves, floor 0; 23 kg is a gate
 * on closing; the input table (select, cancel, place / pick up, move, rotate,
 * take out, close). The stored packs below are the prototype's exact-cover
 * search results (`prototype/214-bavul`, SOL): per card the lightest perfect
 * pack ("ok", ≤ 23 kg) and a heavy one ("heavy", a trap). They are test data
 * only: she never sees them.
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
  newRound,
  shapeOf,
  step,
  type Action,
  type BavulEvent,
  type Round,
} from "./bavul.ts";

/** Per card: the lightest perfect pack (≤ 23 kg) and a heavy perfect pack
 *  (a trap). One letter per cell: A = ITEMS[0] (laptop), B = ITEMS[1], … */
const PACKS: Record<string, { ok: string[]; heavy: string[] }> = {
  "Lüksemburg'da yürüyüş": {
    ok: ["EEEMMMDC", "EIFFDDDC", "IIIFFPDC", "KIHHPPPC", "KKHLGGPC", "KHHLLGGG"], // 20 kg
    heavy: ["EMMMDDDF", "ELLBBDFF", "EELBBDFJ", "AACCCCCJ", "AAOOGGJJ", "AAOOOGGG"], // 27 kg
  },
  "Brugge'de şehir turu": {
    ok: ["LGGGJJJC", "LLIGGKJC", "NIIIKKKC", "NPIHHFDC", "NPPHFFDC", "PPHHFDDD"], // 19.5 kg
    heavy: ["LCCCCCJJ", "LLNNNDJG", "AAADDDJG", "AAAFFDGG", "BBOOFFGE", "BBOOOEEE"], // 27 kg
  },
  "Kassel'de müze günü": {
    ok: ["HCCCCCFG", "HHHAAFFG", "BBHAAFGG", "BBPAADGK", "OOPPPDKK", "OOOPDDDK"], // 21.5 kg
    heavy: ["HCCCCCOO", "HHHBBJOO", "MDHBBJOK", "MDDDJJKK", "MDEAAALK", "EEEAAALL"], // 26.5 kg
  },
  "Kuzey Denizi'nde sahil": {
    ok: ["PCCCCCLL", "PPPFHHIL", "MPFFHIII", "MDFHHKIJ", "MDGGKKKJ", "DDDGGGJJ"], // 19.5 kg
    heavy: ["PMMMFAAA", "PPPFFAAA", "LPJFDDDO", "LLJJJDOO", "BBEEEDOO", "BBECCCCC"], // 26.5 kg
  },
};

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
