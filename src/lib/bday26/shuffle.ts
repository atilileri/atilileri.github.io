/**
 * The one shuffle of the birthday games (review L3): the memory deal, the
 * "Bu nerede?", Milyoner and "Şarkıyı bil" Rounds, and Kelime avı's word
 * order all draw through it.
 *
 * Fisher–Yates on a copy, with the random source handed in: the pages pass
 * `Math.random`, the tests a fixed stream, so a deal can be pinned. The
 * source returns [0, 1) like `Math.random`; a stray 1 is held inside the
 * list rather than reading past its end.
 */
export function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.floor(rng() * (i + 1)));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}
