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
 *   - a Round plays all ten answers once each, in an order the random
 *     source decides, one word after another; each word is scored on its
 *     own and the Round is the mean of the words finished.
 * Expected values are worked by hand from the Wordle rules and the verdict
 * table, not from the code. Randomness is injected.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ANSWERS,
  colour,
  createWord,
  createWordleRound,
  shuffleAnswers,
  typedLetter,
  type WordleRound,
  type WordleWord,
} from "./wordle.ts";

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

test("typing: Q, W and X type nothing (no Turkish word uses them)", () => {
  assert.deepEqual(["q", "w", "x"].map(typedLetter), [undefined, undefined, undefined]);
});

test("typing: anything that is not a letter types nothing", () => {
  for (const key of [" ", "1", "-", "é", "Enter", "Backspace", "Shift", "ArrowLeft"]) {
    assert.equal(typedLetter(key), undefined, key);
  }
});

// -------------------------------------------------------- the grid of a word

/** The word's cells as text: a letter cell is "_", a gap is " ". */
const shape = (word: WordleWord) => word.cells.map((c) => (c.gap ? " " : "_")).join("");

/** Types each letter of `text` into the word's row. */
const typeAll = (word: WordleWord, text: string) => [...text].forEach((l) => word.type(l));

test("grid: a phrase is its letter cells with a fixed gap where each space is", () => {
  assert.equal(shape(createWord("OTUZ DÖRT")), "____ ____");
  assert.equal(shape(createWord("İYİ Kİ DOĞDUN")), "___ __ ______");
  assert.equal(shape(createWord("SPA")), "___");
});

test("grid: the shape tells her the words and their letters", () => {
  assert.deepEqual(createWord("İYİ Kİ DOĞDUN").words, [3, 2, 6]);
  assert.deepEqual(createWord("ŞARAP").words, [5]);
});

test("grid: the cursor skips the gap, from the last letter of a word to the next word", () => {
  const word = createWord("OTUZ DÖRT");
  assert.equal(word.caret, 0);
  typeAll(word, "OTUZ");
  assert.equal(word.caret, 5); // cell 4 is the gap
  word.type("D");
  assert.equal(word.caret, 6);
  word.erase();
  word.erase();
  assert.equal(word.caret, 3);
  assert.deepEqual(word.typed, ["O", "T", "U"]);
});

test("grid: a full row takes no more letters", () => {
  const word = createWord("SPA");
  typeAll(word, "SPAS");
  assert.deepEqual(word.typed, ["S", "P", "A"]);
  assert.equal(word.caret, undefined);
});

// ------------------------------------------------------------------ Enter

test("Enter: a row with an empty cell is refused and stays as typed", () => {
  const word = createWord("OTUZ DÖRT");
  typeAll(word, "OTUZDÖR");
  assert.equal(word.submit(), "missing");
  assert.equal(word.guesses.length, 0);
  assert.deepEqual(word.typed.join(""), "OTUZDÖR");
});

test("Enter: any letters go, coloured across the gap, and the next row starts empty", () => {
  // No dictionary (#188): "OTUZBEŞŞ" is no phrase, and still a guess.
  const word = createWord("OTUZ DÖRT");
  typeAll(word, "OTUZBEŞŞ");
  assert.equal(word.submit(), "next");
  assert.equal(word.guesses.length, 1);
  assert.deepEqual(word.guesses[0]!.letters.join(""), "OTUZBEŞŞ");
  assert.deepEqual(word.guesses[0]!.colours, ["correct", "correct", "correct", "correct", "absent", "absent", "absent", "absent"]);
  assert.deepEqual(word.typed, []);
  assert.equal(word.done, false);
});

test("Enter: the answer ends the word solved, and nothing more types", () => {
  const word = createWord("İyi ki doğdun");
  typeAll(word, "AAAAAAAAAAA");
  word.submit();
  typeAll(word, "İYİKİDOĞDUN");
  assert.equal(word.submit(), "solved");
  assert.equal(word.done, true);
  assert.equal(word.solved, true);
  assert.equal(word.guesses.length, 2);
  assert.equal(word.type("A"), false);
  assert.equal(word.caret, undefined);
});

test("Enter: six wrong guesses end the word unsolved", () => {
  const word = createWord("SPA");
  for (let i = 0; i < 5; i++) {
    typeAll(word, "ŞAP");
    assert.equal(word.submit(), "next");
  }
  typeAll(word, "ŞAP");
  assert.equal(word.submit(), "over");
  assert.equal(word.done, true);
  assert.equal(word.solved, false);
  assert.equal(word.guesses.length, 6);
  assert.equal(word.type("S"), false);
  assert.equal(word.submit(), "over");
  assert.equal(word.guesses.length, 6);
});

// ------------------------------------------------------- keyboard colours

test("keyboard: an untried letter has no colour; a tried one shows what it learned", () => {
  const word = createWord("ŞARAP");
  assert.equal(word.keyboard().size, 0);
  typeAll(word, "KUZEY");
  word.submit();
  assert.equal(word.keyboard().get("K"), "absent");
  assert.equal(word.keyboard().get("A"), undefined);
});

test("keyboard: a letter keeps its best colour, green over yellow over grey", () => {
  const word = createWord("ŞARAP");
  typeAll(word, "PAŞKK"); // A green; P, Ş yellow; K grey
  word.submit();
  typeAll(word, "AKKPŞ"); // A yellow, P yellow, Ş yellow: none may lower a key
  word.submit();
  const keys = word.keyboard();
  assert.equal(keys.get("A"), "correct");
  assert.equal(keys.get("P"), "present");
  assert.equal(keys.get("Ş"), "present");
  assert.equal(keys.get("K"), "absent");
  typeAll(word, "ŞAKKP"); // Ş now in place: yellow → green
  word.submit();
  assert.equal(word.keyboard().get("Ş"), "correct");
});

test("keyboard: a grey copy of a letter that is yellow elsewhere keeps the key yellow", () => {
  // SPA has one A: "AAZ" makes the first A yellow and the second grey.
  const word = createWord("SPA");
  typeAll(word, "AAZ");
  word.submit();
  assert.equal(word.keyboard().get("A"), "present");
});

// ------------------------------------------------------ answers and hints

test("answers: the ten of the #188 verdict, each with its İpucu", () => {
  assert.deepEqual(
    ANSWERS.map((a) => createWord(a.answer).answer),
    ["ÇAĞLA", "ATIL", "AŞKIM", "SEVDİCEK", "KENDİ DİLİMDE", "İYİ Kİ DOĞDUN", "SENİ SEVİYORUM", "SPA", "ŞARAP", "OTUZ DÖRT"],
  );
  assert.equal(ANSWERS.find((a) => a.answer === "OTUZ DÖRT")?.hint, "Bu yıl pastadaki mum sayısı, yazıyla");
  assert.equal(ANSWERS.find((a) => a.answer === "ATIL")?.hint, "Bu oyunu senin için yapan adamın adı");
  for (const a of ANSWERS) assert.ok(a.hint.length > 0, a.answer);
});

test("answers: every answer can be typed on her keyboard", () => {
  for (const { answer } of ANSWERS) {
    for (const ch of answer.replace(/ /g, "")) assert.equal(typedLetter(ch), ch, `${answer}: ${ch}`);
  }
});

// ------------------------------------------------------- the Round order

/** A seeded stand-in for Math.random (a small LCG), so an order is repeatable. */
const seeded = (seed: number) => () => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
};

test("order: a Round plays every one of the ten answers exactly once", () => {
  for (const random of [() => 0, () => 0.999, seeded(1), seeded(42)]) {
    const order = shuffleAnswers(random);
    assert.equal(order.length, 10);
    assert.deepEqual([...order].sort((a, b) => a - b), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  }
});

test("order: the order follows the random source, so Rounds differ", () => {
  const orders = new Set([1, 2, 3, 4, 5].map((s) => shuffleAnswers(seeded(s)).join()));
  assert.ok(orders.size > 1);
  assert.notDeepEqual(shuffleAnswers(() => 0), shuffleAnswers(() => 0.999));
  // The same random source gives the same order.
  assert.deepEqual(shuffleAnswers(seeded(7)), shuffleAnswers(seeded(7)));
});

// ------------------------------------------------------- the ten-word Round

/** Three words, in this order: SPA, ATIL, ŞARAP (indexes into ANSWERS). */
const SPA = ANSWERS.findIndex((a) => a.answer === "SPA");
const ATIL = ANSWERS.findIndex((a) => a.answer === "ATIL");
const SARAP = ANSWERS.findIndex((a) => a.answer === "ŞARAP");

/** Finds the word on screen in `guesses` guesses: wrong rows of J first. */
function solveIn(round: WordleRound, guesses: number) {
  const letters = round.word.answer.replace(/ /g, "");
  for (let g = 1; g < guesses; g++) {
    typeAll(round.word, "J".repeat(letters.length));
    round.word.submit();
  }
  typeAll(round.word, letters);
  round.word.submit();
}

/** Spends all six guesses on the word on screen without finding it. */
function miss(round: WordleRound) {
  const n = round.word.answer.replace(/ /g, "").length;
  for (let g = 0; g < 6; g++) {
    typeAll(round.word, "J".repeat(n));
    round.word.submit();
  }
}

test("Round: it opens on the first word of its order with that word's hint, nothing finished", () => {
  const round = createWordleRound([SPA, ATIL, SARAP]);
  assert.equal(round.index, 0);
  assert.equal(round.length, 3);
  assert.equal(round.word.answer, "SPA");
  assert.equal(round.hint, "Sıcak su, buhar, masaj: rahatlamanın üç harfli adı");
  assert.deepEqual(round.played, []);
  assert.equal(round.score, undefined);
  assert.equal(round.done, false);
});

test("Round: a finished word counts at once, with its guesses and its score", () => {
  const round = createWordleRound([SPA, ATIL, SARAP]);
  solveIn(round, 4);
  assert.deepEqual(round.played, [{ answer: "SPA", guesses: 4, solved: true, score: 95 }]);
  assert.equal(round.score, 95);
});

test("Round: next waits for the word to finish, then brings the next word and its hint", () => {
  const round = createWordleRound([SPA, ATIL, SARAP]);
  assert.equal(round.next(), false);
  assert.equal(round.word.answer, "SPA");
  solveIn(round, 1);
  assert.equal(round.next(), true);
  assert.equal(round.index, 1);
  assert.equal(round.word.answer, "ATIL");
  assert.equal(round.word.guesses.length, 0);
  assert.equal(round.hint, "Bu oyunu senin için yapan adamın adı");
});

test("Round: it is done when the last word is finished; its score is the mean of the words, rounded down", () => {
  const round = createWordleRound([SPA, ATIL, SARAP]);
  solveIn(round, 1); // 100
  round.next();
  miss(round); // 0
  round.next();
  assert.equal(round.done, false);
  solveIn(round, 5); // 80
  assert.equal(round.done, true);
  assert.equal(round.next(), false);
  assert.deepEqual(
    round.played.map((p) => [p.answer, p.solved, p.score]),
    [
      ["SPA", true, 100],
      ["ATIL", false, 0],
      ["ŞARAP", true, 80],
    ],
  );
  // (100 + 0 + 80) / 3 = 60.
  assert.equal(round.score, 60);
});
