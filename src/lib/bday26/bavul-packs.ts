/**
 * TEST DATA for "Bavul hazırla" (#219), never imported by a page: she never
 * sees a solution. The prototype's exact-cover search (`prototype/214-bavul`,
 * SOL) found, per trip card, the lightest perfect pack ("ok": every cell
 * filled, all 4 must-haves in, ≤ 23 kg) and a heavy perfect pack ("heavy": a
 * trap the 23 kg gate must refuse). One letter per cell, one row per bag
 * row: A = ITEMS[0] (laptop), B = ITEMS[1], … P = ITEMS[15].
 *
 * `bavul.test.ts` packs each one through `step` and checks the score and the
 * gate; the Playwright smoke packs one with the mouse to play a %100 Round.
 */
export const PACKS: Record<string, { ok: string[]; heavy: string[] }> = {
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

import { ITEMS, ITEM_INFO, dims } from "./bavul.ts";

/** One item's place in a pack: its index in ITEMS, how many quarter turns
 *  (R presses from the list) give it its shape there, the top left of its
 *  box in the bag, and the box's size. */
export type PackPlacement = { i: number; turns: number; left: number; top: number; w: number; h: number };

const shapeKey = (cells: { x: number; y: number }[]) => JSON.stringify(cells.map(({ x, y }) => [x, y]).sort((a, b) => a[1]! - b[1]! || a[0]! - b[0]!));

/** The pack's items in letter order, each where and how it goes. */
export function placements(grid: string[]): PackPlacement[] {
  const cells: Record<string, { x: number; y: number }[]> = {};
  grid.forEach((row, y) => [...row].forEach((ch, x) => (cells[ch] ??= []).push({ x, y })));
  return Object.entries(cells)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ch, at]) => {
      const i = ch.charCodeAt(0) - 65;
      const left = Math.min(...at.map((c) => c.x));
      const top = Math.min(...at.map((c) => c.y));
      const want = shapeKey(at.map(({ x, y }) => ({ x: x - left, y: y - top })));
      const turns = ITEM_INFO[ITEMS[i]!].shapes.findIndex((s) => shapeKey(s) === want);
      if (turns < 0) throw new Error(`pack: ${ITEMS[i]} does not have this shape`);
      return { i, turns, left, top, ...dims(ITEM_INFO[ITEMS[i]!].shapes[turns]!) };
    });
}
