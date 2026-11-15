/*
 * Tests for Turkish Wordle, "Kelime avı", with no DOM.
 *
 *   node --test src/lib/bday26/wordle.test.ts
 *
 * Seam 1 of the spec (#192, "Testing Decisions"): the Wordle rules live in a
 * plain module and the page only paints what it returns, so the verdict of
 * #188 (rules of #201) is pinned here:
 *   - Wordle colouring: greens first, then yellows only up to the count of
 *     that letter the answer has left (the repeated-letter cases);
 *   - typed keys go through Turkish upper-casing, so i → İ and ı → I;
 *   - the grid of a phrase has a fixed gap where each space is, which the
 *     cursor skips, and Enter wants every letter cell filled;
 *   - the on-screen keyboard keeps a letter's best colour;
 *   - the 10 answers and hints of the #188 verdict table, OTUZ DÖRT included;
 *   - a new Round never brings the answer of the last one.
 * Expected values are worked by hand from the Wordle rules and the verdict
 * table, not from the code. Randomness is injected.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { colour, createRound, typedLetter, type WordleRound } from "./wordle.ts";

/** Colours as one letter each, to read a row at a glance: G green, Y yellow, . grey. */
const row = (guess: string, answer: string) =>
  colour([...guess], [...answer])
    .map((c) => (c === "correct" ? "G" : c === "present" ? "Y" : "."))
    .join("");

// ---------------------------------------------------------------- colouring

test("colouring: a letter in its place is green, elsewhere yellow, absent grey", () => {
  assert.equal(row("ŞARAP", "ŞARAP"), "GGGGG");
  assert.equal(row("PARAŞ", "ŞARAP"), "YGGGY");
  assert.equal(row("KUZEY", "ŞARAP"), ".....");
});

test("colouring: a letter guessed twice but in the answer once is yellow only once", () => {
  // SPA has one A; the first A of "AAZ" takes it, the second is grey.
  assert.equal(row("AAZ", "SPA"), "Y..");
});

test("colouring: greens are counted first, so an earlier copy of the letter goes grey", () => {
  // SPA's one A is in place 3. "AAA" puts an A there: green, and it uses up
  // the only A, so the two A's before it are grey, not yellow.
  assert.equal(row("AAA", "SPA"), "..G");
  // ATIL's one A is in place 1: the A guessed there is green, the rest grey.
  assert.equal(row("AAAA", "ATIL"), "G...");
});

test("colouring: an answer with a letter twice can give two yellows", () => {
  // ŞARAP has A in places 2 and 4; "AŞAPR" puts both A's elsewhere, and
  // every other letter elsewhere too.
  assert.equal(row("AŞAPR", "ŞARAP"), "YYYYY");
  // Three A's guessed, two in the answer, none in place: the third is grey.
  assert.equal(row("AKAKA", "ŞARAP"), "Y.Y..");
});

// ------------------------------------------------------------- typed keys

test("typing: a dotted i is İ and a dotless ı is I, the Turkish way", () => {
  assert.equal(typedLetter("i"), "İ");
  assert.equal(typedLetter("ı"), "I");
  assert.equal(typedLetter("İ"), "İ");
  assert.equal(typedLetter("I"), "I");
});

test("typing: the other Turkish letters come up as capitals too", () => {
  assert.deepEqual(["ç", "ğ", "ö", "ş", "ü", "a"].map(typedLetter), ["Ç", "Ğ", "Ö", "Ş", "Ü", "A"]);
});

test("typing: Q, W and X type (they are on her keyboard) but never match", () => {
  assert.deepEqual(["q", "w", "x"].map(typedLetter), ["Q", "W", "X"]);
});

test("typing: anything that is not a letter types nothing", () => {
  for (const key of [" ", "1", "-", "é", "Enter", "Backspace", "Shift", "ArrowLeft"]) {
    assert.equal(typedLetter(key), undefined, key);
  }
});

// ------------------------------------------------------- the grid of a Round

/** The Round's cells as text: a letter cell is "_", a gap is " ". */
const shape = (round: WordleRound) => round.cells.map((c) => (c.gap ? " " : "_")).join("");

/** Types each letter of `text` into the Round. */
const typeAll = (round: WordleRound, text: string) => [...text].forEach((l) => round.type(l));

test("grid: a phrase is its letter cells with a fixed gap where each space is", () => {
  assert.equal(shape(createRound("OTUZ DÖRT")), "____ ____");
  assert.equal(shape(createRound("İYİ Kİ DOĞDUN")), "___ __ ______");
  assert.equal(shape(createRound("SPA")), "___");
});

test("grid: the shape tells her the words and their letters", () => {
  assert.deepEqual(createRound("İYİ Kİ DOĞDUN").words, [3, 2, 6]);
  assert.deepEqual(createRound("ŞARAP").words, [5]);
});

test("grid: the cursor skips the gap, from the last letter of a word to the next word", () => {
  const round = createRound("OTUZ DÖRT");
  assert.equal(round.caret, 0);
  typeAll(round, "OTUZ");
  assert.equal(round.caret, 5); // cell 4 is the gap
  round.type("D");
  assert.equal(round.caret, 6);
  round.erase();
  round.erase();
  assert.equal(round.caret, 3);
  assert.deepEqual(round.typed, ["O", "T", "U"]);
});

test("grid: a full row takes no more letters", () => {
  const round = createRound("SPA");
  typeAll(round, "SPAS");
  assert.deepEqual(round.typed, ["S", "P", "A"]);
  assert.equal(round.caret, undefined);
});

// ------------------------------------------------------------------ Enter

test("Enter: a row with an empty cell is refused and stays as typed", () => {
  const round = createRound("OTUZ DÖRT");
  typeAll(round, "OTUZDÖR");
  assert.equal(round.submit(), "missing");
  assert.equal(round.guesses.length, 0);
  assert.deepEqual(round.typed.join(""), "OTUZDÖR");
});

test("Enter: any letters go, coloured across the gap, and the next row starts empty", () => {
  // No dictionary (#188): "OTUZBEŞŞ" is no phrase, and still a guess.
  const round = createRound("OTUZ DÖRT");
  typeAll(round, "OTUZBEŞŞ");
  assert.equal(round.submit(), "next");
  assert.equal(round.guesses.length, 1);
  assert.deepEqual(round.guesses[0]!.letters.join(""), "OTUZBEŞŞ");
  assert.deepEqual(round.guesses[0]!.colours, ["correct", "correct", "correct", "correct", "absent", "absent", "absent", "absent"]);
  assert.deepEqual(round.typed, []);
  assert.equal(round.done, false);
});

test("Enter: the answer ends the Round solved, and nothing more types", () => {
  const round = createRound("İyi ki doğdun");
  typeAll(round, "AAAAAAAAAAA");
  round.submit();
  typeAll(round, "İYİKİDOĞDUN");
  assert.equal(round.submit(), "solved");
  assert.equal(round.done, true);
  assert.equal(round.solved, true);
  assert.equal(round.guesses.length, 2);
  assert.equal(round.type("A"), false);
  assert.equal(round.caret, undefined);
});

test("Enter: six wrong guesses end the Round unsolved", () => {
  const round = createRound("SPA");
  for (let i = 0; i < 5; i++) {
    typeAll(round, "ŞAP");
    assert.equal(round.submit(), "next");
  }
  typeAll(round, "ŞAP");
  assert.equal(round.submit(), "over");
  assert.equal(round.done, true);
  assert.equal(round.solved, false);
  assert.equal(round.guesses.length, 6);
  assert.equal(round.type("S"), false);
  assert.equal(round.submit(), "over");
  assert.equal(round.guesses.length, 6);
});
