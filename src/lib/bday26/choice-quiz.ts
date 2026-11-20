/**
 * What the three choice quizzes share: "Bu nerede?" (nerede), "Şarkıyı
 * bil" (sarki) and Milyoner (review L3). Each deals its own questions
 * (`./nerede.ts`, `./sarki.ts`, `./milyoner.ts`); from there on a Round is
 * the same thing in all three, and it lives here, pinned by
 * `choice-quiz.test.ts`:
 *
 *   - `createChoiceQuiz`: the answer state of one Round. Her pick on each
 *     question, kept for a result list; the misses; `next`; `done` when the
 *     last question is answered, or, for Milyoner (`endOnMiss`), at the
 *     first miss. Milyoner's mark-then-confirm step and its jokers stay in
 *     its page: a pick here is her locked answer.
 *   - `choiceOfKey`: 1–4 or A–D picks choice A–D (#182).
 *   - `missDetail`: the result card's line under the score for the two
 *     miss-counted quizzes ("Hatasız tur!" or "2 hata").
 *
 * THE ANSWER STEP. After her answer the choices show right and wrong for a
 * moment (#182: about 1.5 s), then the next question comes by itself, or at
 * once on her next key or click. The confirm-leave card stops that wait and
 * closing it starts it again. A page makes one step with its own `next` and
 * its own "is an answer showing?" check, calls `wait()` after marking,
 * `cancel()` when a Round starts or ends, and hands `pause` / `resume` to
 * the shell (or calls them from its own hooks, beside its own work).
 *
 * The marks themselves: `markChoices` puts `right` on the right choice and,
 * on a miss, `wrong` on hers (nerede, sarki; Milyoner paints them from its
 * own state). Their look is shared too, in `src/styles/bday26.css`.
 */

/** How long a marked answer stays before the next question, ms (#182). */
export const ANSWER_PAUSE_MS = 1500;

export type AnswerStep = {
  /** Her answer is marked: the next question after the pause. */
  wait(): void;
  /** No next question by itself: a new Round, a Round she leaves, or `next` ran. */
  cancel(): void;
  /** The confirm-leave card opened: the answer waits for her. */
  pause(): void;
  /** The card closed: if an answer is showing, the pause starts again. */
  resume(): void;
};

export function createAnswerStep(next: () => void, answered: () => boolean): AnswerStep {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const cancel = () => clearTimeout(timer);
  const wait = () => {
    cancel();
    timer = setTimeout(next, ANSWER_PAUSE_MS);
  };
  return {
    wait,
    cancel,
    pause: cancel,
    resume: () => {
      if (answered()) wait();
    },
  };
}

/** The right choice green either way; on a miss her pick red beside it. */
export function markChoices(buttons: readonly Element[], right: number, picked: number): void {
  buttons[right]?.classList.add("right");
  if (picked !== right) buttons[picked]?.classList.add("wrong");
}

/** A new question: no marks. */
export function clearMarks(buttons: readonly Element[]): void {
  for (const b of buttons) b.classList.remove("right", "wrong");
}

/** What a quiz question must have: its choices in display order, A to D,
 *  and which one is right. Each Game's own question type adds the rest. */
export type ChoiceQuestion = {
  readonly choices: readonly string[];
  /** Index into `choices` of the right one. */
  readonly answer: number;
};

export type ChoiceQuiz<Q extends ChoiceQuestion> = {
  /** The questions in order. */
  readonly questions: readonly Q[];
  /** Index of the question on screen. */
  readonly index: number;
  readonly question: Q;
  /** What she picked on the current question, or undefined while it is open. */
  readonly picked: number | undefined;
  /** Her pick on every question, in order; undefined where not yet answered. */
  readonly picks: readonly (number | undefined)[];
  /** Questions answered wrong so far. */
  readonly misses: number;
  /** Questions answered right so far (Milyoner: the rungs climbed). */
  readonly hits: number;
  /** True when the Round is over: the last question answered, or with
   *  `endOnMiss` a miss. */
  readonly done: boolean;
  /** Answer the current question with choice `i`. Returns true on a hit. A
   *  second pick on the same question, or one outside the choices, is
   *  ignored and returns false. */
  pick(i: number): boolean;
  /** Move on to the next question. Ignored while the current one is open or
   *  when the Round is over. */
  next(): void;
};

/** A Round over dealt questions, on its first question, nothing answered.
 *  `endOnMiss`: a wrong answer ends the Round (Milyoner, story 48). */
export function createChoiceQuiz<Q extends ChoiceQuestion>(
  questions: readonly Q[],
  { endOnMiss = false }: { endOnMiss?: boolean } = {},
): ChoiceQuiz<Q> {
  let index = 0;
  const picks: (number | undefined)[] = questions.map(() => undefined);
  let misses = 0;
  let hits = 0;
  const isDone = () => {
    const picked = picks[index];
    if (picked === undefined) return false;
    return index === questions.length - 1 || (endOnMiss && picked !== questions[index]!.answer);
  };
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
    get hits() {
      return hits;
    },
    get done() {
      return isDone();
    },
    pick(i) {
      const q = questions[index]!;
      if (picks[index] !== undefined || !Number.isInteger(i) || i < 0 || i >= q.choices.length) return false;
      picks[index] = i;
      const hit = i === q.answer;
      if (hit) hits += 1;
      else misses += 1;
      return hit;
    },
    next() {
      if (picks[index] === undefined || isDone()) return;
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

/** The result card's line under the score in "Bu nerede?" and "Şarkıyı bil". */
export function missDetail(misses: number): string {
  return misses === 0 ? "Hatasız tur!" : `${misses} hata`;
}
