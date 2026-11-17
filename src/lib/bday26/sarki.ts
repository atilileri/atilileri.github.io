/**
 * A name-the-song Round, "Şarkıyı bil" (/20261209/sarki/, #204; spec #192
 * "Name the song", the simple Games' shared keys #182, the song pool #187):
 * the deal and the rules of one Round with no DOM, so the page only paints
 * what the Round says and `sarki.test.ts` pins the rules under `node --test`.
 *
 * THE RULES. A Round draws 10 of the 20 hooks in `./songs.ts` at random,
 * nothing tracked between Rounds. Each question offers 4 titles: the right
 * one and 3 other titles from the same pool, shuffled, labelled A–D. She
 * answers with 1–4, A–D or a click; green or red at once, the right title
 * marked on a miss; the next question after ~1.5 s or on any key — the
 * timer and the key are the page's, `next()` is here. No timer on the
 * question, no reveal of the recording. The score is `missScore(misses)`
 * in `./scores.ts` (0 = 100, 1 = 95, −10 each after), handed to the Game
 * shell when the 10th question is answered.
 *
 * WHAT IS HERE AND WHAT IS NOT. `dealQuiz` draws and shuffles with an
 * injected random source, so a test pins a deal and the page passes
 * `Math.random`. `createQuiz` owns the answer state, every pick kept for
 * the result screen's list of the Round's 10 songs. Playing the hook, the
 * 1.5 s wait, the painting and the key events are the page's; `choiceOfKey`
 * only says which choice a key means.
 */

/** One question: the song's title, the 4 choices as shown, and which one is right. */
export type Question = {
  readonly title: string;
  readonly choices: readonly string[];
  /** Index into `choices` of the right title. */
  readonly answer: number;
};

/** Draw `count` songs from the pool, each with `wrong` other titles. `rng` returns [0, 1) like `Math.random`. */
export function dealQuiz(pool: readonly string[], rng: () => number, count = 10, wrong = 3): Question[] {
  const drawn = shuffle([...pool], rng).slice(0, count);
  return drawn.map((title) => {
    const others = shuffle(
      pool.filter((t) => t !== title),
      rng,
    ).slice(0, wrong);
    const choices = shuffle([title, ...others], rng);
    return { title, choices, answer: choices.indexOf(title) };
  });
}

/** Fisher–Yates, in place, with the given random source. */
function shuffle<T>(items: T[], rng: () => number): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j]!, items[i]!];
  }
  return items;
}

export type Quiz = {
  /** The questions in order. */
  readonly questions: readonly Question[];
  /** Index of the question on screen. */
  readonly index: number;
  readonly question: Question;
  /** What she picked on the current question, or undefined while it is open. */
  readonly picked: number | undefined;
  /** Her pick on every question, in order; undefined where not yet answered.
   *  The result screen lists the Round from it. */
  readonly picks: readonly (number | undefined)[];
  /** Misses so far in this Round. */
  readonly misses: number;
  /** True when the last question is answered: the Round is over. */
  readonly done: boolean;
  /** Answer the current question with choice `i` (0..3). Returns true on a
   *  hit. A second pick on the same question is ignored and returns false. */
  pick(i: number): boolean;
  /** Move on to the next question. Ignored while the current one is open or
   *  when the Round is over. */
  next(): void;
};

/** A Round over a deal (see `dealQuiz`), on its first question, nothing answered. */
export function createQuiz(questions: readonly Question[]): Quiz {
  let index = 0;
  const picks: (number | undefined)[] = questions.map(() => undefined);
  let misses = 0;
  return {
    questions,
    get index() {
      return index;
    },
    get question() {
      return questions[index]!;
    },
    get picked() {
      return picks[index];
    },
    get picks() {
      return [...picks];
    },
    get misses() {
      return misses;
    },
    get done() {
      return index === questions.length - 1 && picks[index] !== undefined;
    },
    pick(i) {
      if (picks[index] !== undefined || i < 0 || i >= this.question.choices.length) return false;
      picks[index] = i;
      const hit = i === this.question.answer;
      if (!hit) misses += 1;
      return hit;
    },
    next() {
      if (picks[index] === undefined || this.done) return;
      index += 1;
    },
  };
}

/** The choice a key picks: 1–4 or A–D (either case), else undefined (#182). */
export function choiceOfKey(key: string): number | undefined {
  if (key.length !== 1) return undefined;
  const i = "1234".indexOf(key);
  if (i >= 0) return i;
  const j = "abcd".indexOf(key.toLowerCase());
  return j >= 0 ? j : undefined;
}
