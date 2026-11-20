/**
 * Turkish Wordle, "Kelime avı" (/20261209/wordle/, #201; spec #192 "Turkish
 * Wordle", stories 77–80). The rules are the verdict of the prototype,
 * #188, which Atıl played: "defaults as built, plus a hint per answer".
 * This module is the whole Game without a screen; the page
 * (`src/pages/20261209/wordle/index.astro`) paints what it says, and
 * `./scores.ts` prices it: `wordleScore` one word, `wordleRoundScore` the
 * Round.
 *
 * WHAT IT HOLDS.
 *   - `ANSWERS`: the ten words and phrases with their one İpucu each, word
 *     for word the #188 table. She turns 34, so OTUZ DÖRT, not OTUZ BEŞ.
 *   - `shuffleAnswers`: one Round's order. A Round plays all ten answers,
 *     one after another, in a fresh order each Round, and never opens on
 *     the word the last Round ended on. The random number is an argument,
 *     so the tests can pin every outcome.
 *   - `typedLetter`: a key as she pressed it → a Turkish capital, through
 *     `toLocaleUpperCase("tr")`, so i → İ and ı → I (plain `toUpperCase`
 *     would make both I, and İYİ Kİ DOĞDUN could never be typed). Q, W and
 *     X are on her keyboard but in no Turkish word, so they are not in
 *     `TURKISH_LETTERS` and type nothing. No loose letters: C is not Ç, G is
 *     not Ğ (#188).
 *   - `colour`: Wordle colouring. Greens first; then yellows only up to the
 *     copies of that letter the answer has left; the rest grey.
 *   - `createWord`: one word of the Round. Its grid row is the answer's
 *     shape: a letter cell per letter and a fixed gap cell per space, which
 *     she never types and the caret skips. Any letters go (no dictionary,
 *     no vowel rule, #188), but Enter wants every letter cell filled. Six
 *     guesses; the keyboard keeps each letter's best colour (green over
 *     yellow over grey).
 *   - `createWordleRound`: the Round itself, all ten words one after
 *     another in a given order (`shuffleAnswers`). Each finished word is
 *     scored on its own (`wordleScore`); the Round's score is the mean of
 *     the words finished so far (`wordleRoundScore`), so the HUD and the
 *     result card read one number.
 *
 * WHAT IT LEAVES OUT. No DOM, no timers, no storage, no ledger: the turn-
 * over animation, the "Eksik harf var" toast, the HUD and the result card
 * are the page's, the score formulas are `./scores.ts`'s, recording the
 * Round is the Game shell's (`./shell.ts`). So `wordle.test.ts` pins every rule under
 * `node --test`.
 *
 * LETTERS, NOT CHARACTERS. A guess and the answer are compared as arrays of
 * letters with the spaces taken out; `Cell.at` maps a grid cell to its
 * place in that array. Every Turkish capital is one UTF-16 unit (İ is
 * U+0130), so a letter is one string element.
 */
import { wordleRoundScore, wordleScore } from "./scores.ts";
import { shuffle } from "./shuffle.ts";


/** One answer and its one İpucu. */
export type Answer = { answer: string; hint: string };

/**
 * The ten answers and their hints, word for word the verdict table of #188
 * (she turns 34: OTUZ DÖRT, not OTUZ BEŞ). Atıl edits them here and nowhere
 * else. Written in Turkish capitals with single spaces between words.
 */
export const ANSWERS: readonly Answer[] = [
  { answer: "ÇAĞLA", hint: "Bugünün yıldızı: doğum günü kızının adı" },
  { answer: "ATIL", hint: "Bu oyunu senin için yapan adamın adı" },
  { answer: "AŞKIM", hint: "Sana en çok seslendiğim tatlı söz, \"sevgilim\"in kardeşi" },
  { answer: "SEVDİCEK", hint: "Sevgiliye şirin, biraz da cilveli bir sesleniş" },
  { answer: "KENDİ DİLİMDE", hint: "Sahneye çıktığın tiyatro grubunun adı (iki kelime)" },
  { answer: "İYİ Kİ DOĞDUN", hint: "Bugün sana söylenecek en güzel üç kelime" },
  { answer: "SENİ SEVİYORUM", hint: "Her gün söylerim, iki kelime, kalpten" },
  { answer: "SPA", hint: "Sıcak su, buhar, masaj: rahatlamanın üç harfli adı" },
  { answer: "ŞARAP", hint: "Üzümden yapılır, akşam yemeğinde kadehe dökülür" },
  { answer: "OTUZ DÖRT", hint: "Bu yıl pastadaki mum sayısı, yazıyla" },
];

/**
 * One Round's order: the indexes of all ten `ANSWERS`, each exactly once,
 * shuffled (`./shuffle.ts`). `random` is `Math.random` in the page and a
 * fixed or seeded source in the tests, so every Round's order is new.
 *
 * `last` is the word she saw last, at the end of the Round before (#201:
 * "never the same answer twice in a row"). It never opens this one: when
 * the shuffle puts it first, it trades places with a word drawn from the
 * other nine. A `last` that is no answer (none yet, or a stale one) changes
 * nothing.
 */
export function shuffleAnswers(random: () => number, last?: string): number[] {
  const order = shuffle(
    ANSWERS.map((_, i) => i),
    random,
  );
  if (ANSWERS[order[0]!]!.answer === last && order.length > 1) {
    const k = 1 + Math.min(order.length - 2, Math.floor(random() * (order.length - 1)));
    [order[0], order[k]] = [order[k]!, order[0]!];
  }
  return order;
}

/** The 29 letters of the Turkish alphabet, as capitals. */
export const TURKISH_LETTERS = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ";

/** Turkish capitals: i → İ, ı → I (plain `toUpperCase` turns both into I). */
export function upper(text: string): string {
  return text.toLocaleUpperCase("tr");
}

/**
 * The letter a key types, as a Turkish capital, or undefined when the key
 * types no letter (Space, digits, Enter, arrows, Q W X, a foreign é…). Takes
 * `KeyboardEvent.key` as it comes.
 */
export function typedLetter(key: string): string | undefined {
  if ([...key].length !== 1) return undefined;
  const letter = upper(key);
  return TURKISH_LETTERS.includes(letter) ? letter : undefined;
}

/** What one guessed letter learns: in place, elsewhere in the answer, or absent. */
export type Colour = "correct" | "present" | "absent";

/**
 * Wordle colouring of one guess against the answer, letter by letter (both
 * as letters only, no gaps, same length). Greens first: a letter in its
 * place is green and uses up one copy of that letter. Then, left to right,
 * a letter the answer still has a copy of is yellow and uses that copy;
 * every other letter is grey.
 */
export function colour(guess: readonly string[], answer: readonly string[]): Colour[] {
  const result: Colour[] = guess.map(() => "absent");
  const left = new Map<string, number>();
  answer.forEach((letter, i) => {
    if (guess[i] === letter) result[i] = "correct";
    else left.set(letter, (left.get(letter) ?? 0) + 1);
  });
  guess.forEach((letter, i) => {
    if (result[i] === "correct") return;
    const n = left.get(letter) ?? 0;
    if (n > 0) {
      result[i] = "present";
      left.set(letter, n - 1);
    }
  });
  return result;
}

/** One cell of a grid row: a letter cell (`at` = its place among the
 *  answer's letters) or the fixed gap where the answer has a space. */
export type Cell = { gap: true } | { gap: false; at: number };

/** Guesses per word. */
export const MAX_GUESSES = 6;

/** A sent row: her letters (no gaps) and what each one learned. */
export type Guess = { letters: readonly string[]; colours: readonly Colour[] };

/** What Enter did: refused a row with an empty cell, sent it and the word
 *  goes on, found the answer, or used the sixth guess without it. */
export type SubmitOutcome = "missing" | "next" | "solved" | "over";

/** One word of a Wordle Round: one answer, up to six guesses. */
export type WordleWord = {
  /** The answer as she will see it on the result: Turkish capitals, spaces kept. */
  readonly answer: string;
  /** One grid row, the same for all six rows. */
  readonly cells: readonly Cell[];
  /** Letters per word, e.g. [3, 2, 6] for İYİ Kİ DOĞDUN. */
  readonly words: readonly number[];
  /** The letters of the row she is typing, no gaps. */
  readonly typed: readonly string[];
  /** Index in `cells` of the next letter cell; undefined when the row is full. */
  readonly caret: number | undefined;
  /** Adds a letter to the row; false when the row is full or the word over. */
  type(letter: string): boolean;
  /** Takes back the last letter; false when there is none. */
  erase(): boolean;
  /** Enter. Once the word is over it changes nothing and says how it ended. */
  submit(): SubmitOutcome;
  /** The rows sent so far, oldest first. */
  readonly guesses: readonly Guess[];
  /** Solved, or six guesses used. */
  readonly done: boolean;
  readonly solved: boolean;
  /** The on-screen keyboard: each tried letter's best colour so far. */
  keyboard(): ReadonlyMap<string, Colour>;
};

/** Which colour a key keeps when a letter learns two things. */
const RANK: Record<Colour, number> = { absent: 0, present: 1, correct: 2 };

export function createWord(answer: string): WordleWord {
  const shown = upper(answer);
  const cells: Cell[] = [];
  let letterCount = 0;
  for (const ch of shown) {
    if (ch === " ") cells.push({ gap: true });
    else cells.push({ gap: false, at: letterCount++ });
  }
  const words = shown.split(" ").map((w) => [...w].length);
  const letters = [...shown.replace(/ /g, "")];
  let typed: string[] = [];
  const guesses: Guess[] = [];
  let solved = false;
  const isDone = () => solved || guesses.length >= MAX_GUESSES;

  return {
    answer: shown,
    cells,
    words,
    guesses,
    get typed() {
      return typed;
    },
    get done() {
      return isDone();
    },
    get solved() {
      return solved;
    },
    get caret() {
      if (isDone()) return undefined;
      const i = cells.findIndex((c) => !c.gap && c.at === typed.length);
      return i < 0 ? undefined : i;
    },
    type(letter) {
      if (isDone() || typed.length >= letterCount) return false;
      typed = [...typed, letter];
      return true;
    },
    erase() {
      if (isDone() || typed.length === 0) return false;
      typed = typed.slice(0, -1);
      return true;
    },
    keyboard() {
      const keys = new Map<string, Colour>();
      for (const g of guesses) {
        g.letters.forEach((letter, i) => {
          const now = g.colours[i]!;
          const was = keys.get(letter);
          if (was === undefined || RANK[now] > RANK[was]) keys.set(letter, now);
        });
      }
      return keys;
    },
    submit() {
      if (isDone()) return solved ? "solved" : "over";
      if (typed.length < letterCount) return "missing";
      const colours = colour(typed, letters);
      guesses.push({ letters: typed, colours });
      typed = [];
      solved = colours.every((c) => c === "correct");
      if (solved) return "solved";
      return isDone() ? "over" : "next";
    },
  };
}

/** One finished word of a Round, as the result card lists it. */
export type WordResult = {
  /** Turkish capitals, spaces kept. */
  readonly answer: string;
  /** Rows she used, 1..6. */
  readonly guesses: number;
  readonly solved: boolean;
  /** `wordleScore` of the word. */
  readonly score: number;
};

/** One Round of "Kelime avı": every word of its order, one after another. */
export type WordleRound = {
  /** Words in the Round (all ten answers). */
  readonly length: number;
  /** The place of the word on screen in the Round, 0-based. */
  readonly index: number;
  /** The word on screen. */
  readonly word: WordleWord;
  /** Its İpucu. */
  readonly hint: string;
  /** The words finished so far, in the order played; the word on screen
   *  joins the moment it is solved or its sixth guess is spent. */
  readonly played: readonly WordResult[];
  /** The mean of the finished words' scores, rounded down
   *  (`wordleRoundScore`); undefined before the first word is finished. */
  readonly score: number | undefined;
  /** True on the Round's last word. */
  readonly last: boolean;
  /** The last word is finished: the Round is over. */
  readonly done: boolean;
  /** On to the next word. Only once the word on screen is finished and it
   *  is not the last; returns whether it moved. */
  next(): boolean;
};

/** A Round over `order` (indexes into `ANSWERS`, see `shuffleAnswers`), on
 *  its first word. */
export function createWordleRound(order: readonly number[]): WordleRound {
  let index = 0;
  let word = createWord(ANSWERS[order[0]!]!.answer);
  const finished: WordResult[] = [];
  const resultOf = (w: WordleWord): WordResult => ({
    answer: w.answer,
    guesses: w.guesses.length,
    solved: w.solved,
    score: wordleScore(w.guesses.length, w.solved),
  });
  const played = () => (word.done ? [...finished, resultOf(word)] : [...finished]);
  return {
    length: order.length,
    get index() {
      return index;
    },
    get word() {
      return word;
    },
    get hint() {
      return ANSWERS[order[index]!]!.hint;
    },
    get played() {
      return played();
    },
    get score() {
      const words = played();
      return words.length ? wordleRoundScore(words.map((w) => w.score)) : undefined;
    },
    get last() {
      return index === order.length - 1;
    },
    get done() {
      return index === order.length - 1 && word.done;
    },
    next() {
      if (!word.done || index >= order.length - 1) return false;
      finished.push(resultOf(word));
      index += 1;
      word = createWord(ANSWERS[order[index]!]!.answer);
      return true;
    },
  };
}
