/**
 * A name-the-song Round, "Şarkıyı bil" (/20261209/sarki/, #204; spec #192
 * "Name the song", the simple Games' shared keys #182, the song pool #187):
 * the deal of one Round with no DOM, so the page only paints what the Round
 * says and `sarki.test.ts` pins the deal under `node --test`.
 *
 * THE RULES. A Round draws 10 of the 20 hooks in `./songs.ts` at random,
 * nothing tracked between Rounds. Each question offers 4 titles: the right
 * one and 3 other titles from the same pool, shuffled, labelled A–D. She
 * answers with 1–4, A–D or a click; green or red at once, the right title
 * marked on a miss; the next question after ~1.5 s or on any key. No timer on the
 * question, no reveal of the recording. The score is `missScore(misses)`
 * in `./scores.ts` (0 = 100, 1 = 95, −10 each after), handed to the Game
 * shell when the 10th question is answered.
 *
 * WHAT IS HERE AND WHAT IS NOT. `dealQuiz` draws and shuffles with an
 * injected random source, so a test pins a deal and the page passes
 * `Math.random`. The answer state of the Round (every pick kept for the
 * result screen's list of its 10 songs), the keys 1–4 / A–D and the 1.5 s
 * step are the three choice quizzes' shared `./choice-quiz.ts`. Playing the
 * hook, the painting and the key events are the page's.
 */
import { shuffle } from "./shuffle.ts";

/** One question: the song's title, the 4 choices as shown, and which one is right. */
export type SongQuestion = {
  readonly title: string;
  readonly choices: readonly string[];
  /** Index into `choices` of the right title. */
  readonly answer: number;
};

/** Draw `count` songs from the pool, each with `wrong` other titles. `rng` returns [0, 1) like `Math.random`. */
export function dealQuiz(pool: readonly string[], rng: () => number, count = 10, wrong = 3): SongQuestion[] {
  const drawn = shuffle(pool, rng).slice(0, count);
  return drawn.map((title) => {
    const others = shuffle(
      pool.filter((t) => t !== title),
      rng,
    ).slice(0, wrong);
    const choices = shuffle([title, ...others], rng);
    return { title, choices, answer: choices.indexOf(title) };
  });
}
