/*
 * Tests for the memory match board: the rules of one Round, with no DOM.
 *
 *   node --test src/lib/bday26/memory.test.ts
 *
 * Seam 1 of the spec (#192, "Testing Decisions"): the board is a plain module
 * and the page only paints it, so the rules of #194 are pinned here: 8 pairs
 * drawn from the 21 squares, every card face down at the start, a wrong pair
 * stays up until it is settled or the next card is turned, a move is one pair
 * of cards turned. Each test turns cards through the board's interface and
 * reads what she would see: which cards are up, which are matched, the move
 * counter, whether the Round is over. Randomness is injected (the one thing
 * mocked here), so a deal can be pinned.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createBoard, dealBoard } from "./memory.ts";

/** The 21 square crops, named like the real ones. */
const SQUARES = Array.from({ length: 21 }, (_, i) => `p${String(i + 1).padStart(2, "0")}-sq.webp`);

test("a deal is 16 cards: 8 different squares from the pool, each exactly twice", () => {
  const deal = dealBoard(SQUARES, Math.random);
  assert.equal(deal.length, 16);
  const counts = new Map<string, number>();
  for (const photo of deal) counts.set(photo, (counts.get(photo) ?? 0) + 1);
  assert.equal(counts.size, 8);
  for (const [photo, n] of counts) {
    assert.ok(SQUARES.includes(photo), `${photo} is not one of the squares`);
    assert.equal(n, 2, `${photo} appears ${n} times`);
  }
});

// A fixed deal, so each test knows where the pairs lie: the pair of card 0 is
// card 5, of card 1 is card 10, and so on.
const DEAL = ["a", "b", "c", "d", "e", "a", "f", "g", "h", "b", "c", "d", "e", "f", "g", "h"];

test("every card starts face down; turning one shows it and is not yet a move", () => {
  const board = createBoard(DEAL);
  assert.ok(board.cards.every((c) => !c.faceUp && !c.matched));
  board.flip(0);
  assert.equal(board.cards[0]?.faceUp, true);
  assert.equal(board.cards.filter((c) => c.faceUp).length, 1);
  assert.equal(board.moves, 0);
  assert.equal(board.done, false);
});

test("two alike stay up as a matched pair, and that is one move", () => {
  const board = createBoard(DEAL);
  board.flip(0);
  board.flip(5);
  assert.equal(board.cards[0]?.matched, true);
  assert.equal(board.cards[5]?.matched, true);
  assert.equal(board.moves, 1);
  board.settle();
  assert.equal(board.cards[0]?.faceUp, true, "a matched pair never turns back down");
});

test("two different cards stay up until they are settled, and that is one move too", () => {
  const board = createBoard(DEAL);
  board.flip(0);
  board.flip(1);
  assert.equal(board.moves, 1);
  assert.deepEqual(
    board.cards.map((c) => c.faceUp),
    [true, true, ...Array(14).fill(false)],
    "the wrong pair is still up",
  );
  assert.ok(board.cards.every((c) => !c.matched));
  board.settle();
  assert.ok(board.cards.every((c) => !c.faceUp), "settled: all face down again");
});

test("turning the next card settles a wrong pair at once: she never waits", () => {
  const board = createBoard(DEAL);
  board.flip(0);
  board.flip(1);
  board.flip(2);
  assert.deepEqual(
    board.cards.map((c) => c.faceUp),
    [false, false, true, ...Array(13).fill(false)],
  );
  assert.equal(board.moves, 1, "the new card is the first of the next move");
});

test("a card already up, or matched, cannot be turned again and costs no move", () => {
  const board = createBoard(DEAL);
  board.flip(0);
  board.flip(0);
  assert.equal(board.cards.filter((c) => c.faceUp).length, 1);
  assert.equal(board.moves, 0);
  board.flip(5); // matched now
  board.flip(5);
  board.flip(0);
  assert.equal(board.moves, 1);
  board.flip(1); // the next move starts cleanly on a new card
  assert.equal(board.cards[1]?.faceUp, true);
  assert.equal(board.moves, 1);
});

test("the Round is over when all 8 pairs are matched; a perfect game is 8 moves", () => {
  const board = createBoard(DEAL);
  for (let i = 0; i < 16; i++) {
    if (board.cards[i]?.matched) continue;
    const pair = DEAL.findIndex((p, j) => j > i && p === DEAL[i]);
    board.flip(i);
    assert.equal(board.done, false);
    board.flip(pair);
  }
  assert.equal(board.done, true);
  assert.equal(board.moves, 8);
});
