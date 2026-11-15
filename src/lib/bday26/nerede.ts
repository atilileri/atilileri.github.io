/**
 * The "Bu nerede?" Round (/20261209/nerede/, #199; spec #192 "Bu nerede?",
 * stories 65–67): ten of our photos, four place names under each, one of
 * them right. This module builds the Round with no DOM, so the page
 * (`src/pages/20261209/nerede/index.astro`) only paints what it returns and
 * `nerede.test.ts` pins the rules under `node --test`.
 *
 * THE RULES. A Round draws 10 of the 21 photos in `photos.json` at random, in
 * a random order (story 66). Under each photo stand 4 places, labelled A–D:
 * the photo's own `place` and 3 wrong ones, shuffled. The wrong places are
 * other photos' places (#182: "the 3 wrong names come from the places of the
 * other photos"), each different, and never one that would make the question
 * unfair (story 67; the rule grilled on #189):
 *   - never the same place — Antalya is on two photos, Valencia and
 *     Veldhoven too, so "the other photo's place" can be the answer itself;
 *   - never a place that contains the answer — Antalya's photo may not offer
 *     Türkiye, because Antalya IS in Türkiye and both would be right;
 *   - never a place that sits inside the answer — Türkiye's photo may not
 *     offer Antalya, for the same reason the other way round.
 * "Contains" is read two ways, because `photos.json` does not spell every
 * nesting: by the `inside` field (Antalya → Türkiye, Brugge → Belçika), and
 * by the text itself (Eindhoven Kanalı and "Vrijstaat, Eindhoven" both
 * contain the word Eindhoven). The 21 places leave every photo at least 13
 * fair wrong places, so the draw never runs short; `nerede.test.ts` checks
 * that on the real `photos.json`.
 *
 * WHAT IS HERE AND WHAT IS NOT. `buildRound` draws and shuffles with an
 * injected random source, so a test can pin a Round and the page can pass
 * `Math.random`. Counting misses, the 1.5 s pause after an answer, the keys
 * and the painting are the page's; the score is `missScore` in `./scores.ts`.
 */
import type { Photo } from "./photos.ts";

/** One photo of the Round and the four places under it. */
export type Question = {
  readonly photo: Photo;
  /** Four different places in display order, A to D. */
  readonly choices: readonly string[];
  /** The index in `choices` of the photo's own place. */
  readonly answer: number;
};

/** The ten questions of one Round, drawn from `pool` with `rng`, which
 *  returns [0, 1) like `Math.random`. */
export function buildRound(pool: readonly Photo[], rng: () => number, count = 10): Question[] {
  const places = [...new Set(pool.map((p) => p.place))];
  const inside = insideOf(pool);
  const drawn = shuffle([...pool], rng).slice(0, count);
  return drawn.map((photo) => {
    const fair = places.filter((place) => !related(place, photo.place, inside));
    const wrong = shuffle(fair, rng).slice(0, 3);
    const choices = shuffle([photo.place, ...wrong], rng);
    return { photo, choices, answer: choices.indexOf(photo.place) };
  });
}

/** The wider places each place is said to sit inside, by the `inside` field.
 *  A place on two photos collects both photos' words. */
function insideOf(pool: readonly Photo[]): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const { place, inside } of pool) {
    if (!map.has(place)) map.set(place, new Set());
    if (inside) map.get(place)!.add(inside);
  }
  return map;
}

/** True when offering `a` under a photo of `b` would be unfair: the same
 *  place, or one holds the other. */
function related(a: string, b: string, inside: Map<string, Set<string>>): boolean {
  return a === b || holds(a, b, inside) || holds(b, a, inside);
}

/** True when `outer` holds `inner`: `inner` is said to be inside `outer`, or
 *  spells `outer` within its own name (Eindhoven Kanalı → Eindhoven). */
function holds(outer: string, inner: string, inside: Map<string, Set<string>>): boolean {
  return inside.get(inner)?.has(outer) === true || inner.includes(outer);
}

/** Fisher–Yates, in place, with the given random source. */
function shuffle<T>(items: T[], rng: () => number): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j]!, items[i]!];
  }
  return items;
}
