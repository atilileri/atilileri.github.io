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
import { ANSWERS, colour, createRound, pickAnswer, typedLetter, type WordleRound } from "./wordle.ts";

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

// ------------------------------------------------------- keyboard colours

test("keyboard: an untried letter has no colour; a tried one shows what it learned", () => {
  const round = createRound("ŞARAP");
  assert.equal(round.keyboard().size, 0);
  typeAll(round, "KUZEY");
  round.submit();
  assert.equal(round.keyboard().get("K"), "absent");
  assert.equal(round.keyboard().get("A"), undefined);
});

test("keyboard: a letter keeps its best colour, green over yellow over grey", () => {
  const round = createRound("ŞARAP");
  typeAll(round, "PAŞKK"); // A green; P, Ş yellow; K grey
  round.submit();
  typeAll(round, "AKKPŞ"); // A yellow, P yellow, Ş yellow: none may lower a key
  round.submit();
  const keys = round.keyboard();
  assert.equal(keys.get("A"), "correct");
  assert.equal(keys.get("P"), "present");
  assert.equal(keys.get("Ş"), "present");
  assert.equal(keys.get("K"), "absent");
  typeAll(round, "ŞAKKP"); // Ş now in place: yellow → green
  round.submit();
  assert.equal(round.keyboard().get("Ş"), "correct");
});

test("keyboard: a grey copy of a letter that is yellow elsewhere keeps the key yellow", () => {
  // SPA has one A: "AAZ" makes the first A yellow and the second grey.
  const round = createRound("SPA");
  typeAll(round, "AAZ");
  round.submit();
  assert.equal(round.keyboard().get("A"), "present");
});

// ------------------------------------------------------ answers and hints

test("answers: the ten of the #188 verdict, each with its İpucu", () => {
  assert.deepEqual(
    ANSWERS.map((a) => createRound(a.answer).answer),
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

// ------------------------------------------------------------- the picker

test("picker: any answer can come first", () => {
  assert.equal(pickAnswer(undefined, () => 0), 0);
  assert.equal(pickAnswer(undefined, () => 0.999), ANSWERS.length - 1);
});

test("picker: never the answer of the last Round, whatever the random number", () => {
  for (let last = 0; last < ANSWERS.length; last++) {
    for (let r = 0; r < 1; r += 0.01) {
      const next = pickAnswer(last, () => r);
      assert.notEqual(next, last);
      assert.ok(next >= 0 && next < ANSWERS.length);
    }
  }
});

test("picker: every other answer can still follow", () => {
  const seen = new Set<number>();
  for (let r = 0; r < 1; r += 0.01) seen.add(pickAnswer(3, () => r));
  assert.deepEqual([...seen].sort((a, b) => a - b), [0, 1, 2, 4, 5, 6, 7, 8, 9]);
});
