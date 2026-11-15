/**
 * The Milyoner quiz with no DOM (/20261209/milyoner/, #198; spec #192
 * "Milyoner quiz", stories 41–49; rules grilled on #182 and #185): the
 * question pool read from its document, the 12-question Round drawn from it,
 * and the two jokers. The page (`src/pages/20261209/milyoner/index.astro`)
 * only paints what this module returns, and `milyoner.test.ts` pins every
 * rule under `node --test`.
 *
 * THE POOL IS THE DOCUMENT. The 60 questions live in
 * `docs/bday26/milyoner-questions.md`, the file Atıl reviewed and approved on
 * #185, and nowhere else. `parsePool` reads that Markdown as it stands — one
 * `## Topic` heading per topic, then a table whose rows are
 * `| Band | Soru | Doğru | Yanlış 1 | Yanlış 2 | Yanlış 3 | Kaynak |` — so an
 * edit to the document is an edit to the Game, with no generated copy to
 * drift. The page imports the file with Vite's `?raw` and parses it in the
 * browser; the test reads the same file from disk and checks its shape (60
 * questions, 12 per topic, 6/4/2 per band, four choices). In the document the
 * first choice is the right one; the `Kaynak` link is for Atıl, not for her,
 * and is dropped.
 *
 * THE ROUND (#185). Twelve questions, easy to hard:
 *   - Q1–6 easy (Kolay): each of the five topics once, plus one topic drawn
 *     at random a second time (a different question of it);
 *   - Q7–10 medium (Orta): four different topics;
 *   - Q11–12 hard (Zor): two different topics.
 * Random every Round, nothing tracked between Rounds (no repeat rule, no
 * storage key). The four choices are shuffled; `answer` says where the
 * right one landed.
 *
 * THE JOKERS (#182, with the audience split moved by #185). Each is once per
 * Round; counting that is the page's, the answers are here:
 *   - "Yarı yarıya" (`halve`) takes away two of the three wrong choices.
 *   - "Seyirciye sor" (`askAudience`) gives four bars that add up to 100.
 *     On Q1–10 the right answer always has the largest bar; on Q11–12 only
 *     about 70% of the time — otherwise a wrong choice leads — so the joker
 *     never solves the hardest questions on its own. After "Yarı yarıya" the
 *     choices it took away get 0.
 *
 * Randomness is injected everywhere (`rng` returns [0, 1) like
 * `Math.random`), so a test can pin a Round and the page passes
 * `Math.random`. The score is `milyonerScore` in `./scores.ts`.
 */

/** The five topics, in the document's order (#185: no "Biz" topic). */
export const TOPICS = ["Tiyatro", "Fotoğrafçılık", "Doğa yürüyüşü", "90'lar Türk popu", "Dünya hitleri"] as const;

/** The difficulty bands, by the document's own words. */
export type Band = "Kolay" | "Orta" | "Zor";

/** One question as the document has it: the first choice is right. */
export type PoolQuestion = {
  readonly topic: string;
  readonly band: Band;
  readonly text: string;
  /** Four choices; `choices[0]` is the right answer. */
  readonly choices: readonly string[];
};

/** Reads the pool document: every table row under a `## ` heading whose
 *  first cell is a band becomes one question of that heading's topic. */
export function parsePool(markdown: string): PoolQuestion[] {
  const pool: PoolQuestion[] = [];
  let topic = "";
  for (const line of markdown.split(/\r?\n/)) {
    if (line.startsWith("## ")) topic = line.slice(3).trim();
    const row = /^\|\s*(Kolay|Orta|Zor)\s*\|/.exec(line);
    if (!row) continue;
    const [band, text, right, w1, w2, w3] = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    pool.push({ topic, band: band as Band, text: text!, choices: [right!, w1!, w2!, w3!] });
  }
  return pool;
}

/** One question of a Round, as she sees it. */
export type Question = {
  /** 1..12, its rung on the ladder. */
  readonly number: number;
  readonly topic: string;
  readonly band: Band;
  readonly text: string;
  /** Four choices in display order, A to D. */
  readonly choices: readonly string[];
  /** The index in `choices` of the right answer. */
  readonly answer: number;
};

/** The twelve questions of one Round, drawn from `pool` with `rng`. */
export function buildRound(pool: readonly PoolQuestion[], rng: () => number): Question[] {
  const topics = [...new Set(pool.map((q) => q.topic))];
  const again = topics[Math.floor(rng() * topics.length)]!;
  const bands: [Band, string[]][] = [
    ["Kolay", shuffle([...topics, again], rng)],
    ["Orta", shuffle([...topics], rng).slice(0, 4)],
    ["Zor", shuffle([...topics], rng).slice(0, 2)],
  ];
  const picked: PoolQuestion[] = [];
  for (const [band, bandTopics] of bands) {
    for (const topic of bandTopics) {
      const fresh = pool.filter((q) => q.band === band && q.topic === topic && !picked.includes(q));
      picked.push(fresh[Math.floor(rng() * fresh.length)]!);
    }
  }
  return picked.map((q, i) => {
    const choices = shuffle([...q.choices], rng);
    return { number: i + 1, topic: q.topic, band: q.band, text: q.text, choices, answer: choices.indexOf(q.choices[0]!) };
  });
}

/** "Yarı yarıya": the indices of the two wrong choices it takes away. */
export function halve(question: Question, rng: () => number): number[] {
  const wrong = [0, 1, 2, 3].filter((i) => i !== question.answer);
  return shuffle(wrong, rng).slice(0, 2);
}

/** Fisher–Yates, in place, with the given random source. */
function shuffle<T>(items: T[], rng: () => number): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j]!, items[i]!];
  }
  return items;
}
