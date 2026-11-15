/**
 * Turkish Wordle, "Kelime avı" (/20261209/wordle/, #201; spec #192 "Turkish
 * Wordle", stories 77–80; rules decided on the prototype, #188).
 */

/** The 29 letters of the Turkish alphabet, as capitals. */
export const TURKISH_LETTERS = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ";

/** On her Turkish Q keyboard and typeable, but in no answer. */
const FOREIGN_LETTERS = "QWX";

/** Turkish capitals: i → İ, ı → I (plain `toUpperCase` turns both into I). */
export function upper(text: string): string {
  return text.toLocaleUpperCase("tr");
}

/**
 * The letter a key types, as a Turkish capital, or undefined when the key
 * types no letter (Space, digits, Enter, arrows, a foreign é…). Takes
 * `KeyboardEvent.key` as it comes.
 */
export function typedLetter(key: string): string | undefined {
  if ([...key].length !== 1) return undefined;
  const letter = upper(key);
  return TURKISH_LETTERS.includes(letter) || FOREIGN_LETTERS.includes(letter) ? letter : undefined;
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

/** Guesses in a Round. */
export const MAX_GUESSES = 6;

/** A sent row: her letters (no gaps) and what each one learned. */
export type Guess = { letters: readonly string[]; colours: readonly Colour[] };

/** What Enter did: refused a row with an empty cell, sent it and the Round
 *  goes on, found the answer, or used the sixth guess without it. */
export type SubmitOutcome = "missing" | "next" | "solved" | "over";

/** One Round of Wordle: one answer, up to six guesses. */
export type WordleRound = {
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
  /** Adds a letter to the row; false when the row is full or the Round over. */
  type(letter: string): boolean;
  /** Takes back the last letter; false when there is none. */
  erase(): boolean;
  /** Enter. Once the Round is over it changes nothing and says how it ended. */
  submit(): SubmitOutcome;
  /** The rows sent so far, oldest first. */
  readonly guesses: readonly Guess[];
  /** Solved, or six guesses used. */
  readonly done: boolean;
  readonly solved: boolean;
};

export function createRound(answer: string): WordleRound {
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
