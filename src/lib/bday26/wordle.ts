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
