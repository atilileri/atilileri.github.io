/**
 * The answer step the three choice quizzes share: "Bu nerede?" (nerede),
 * "Şarkıyı bil" (sarki) and Milyoner. After her answer the choices show
 * right and wrong for a moment (#182: about 1.5 s), then the next question
 * comes by itself, or at once on her next key or click. The confirm-leave
 * card stops that wait and closing it starts it again.
 *
 * A page makes one step with its own `next` and its own "is an answer
 * showing?" check, calls `wait()` after marking, `cancel()` when a Round
 * starts or ends, and hands `pause` / `resume` to the shell (or calls them
 * from its own hooks, beside its own work). The page keeps its rules: what
 * `next` does, and when an answer counts as showing.
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
