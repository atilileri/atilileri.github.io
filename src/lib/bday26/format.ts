/**
 * The birthday games' number formatting (review L4): how Points, scores and
 * decimals read on every page, written once. Turkish forms: a dot between
 * thousands ("1.000"), a comma before decimals ("8,8"). Pure, so the hub,
 * the shell, admin and the Game pages share it and `format.test.ts` pins it.
 */

/** Whole Points, written the Turkish way: 1.000. */
export function formatPoints(n: number): string {
  return Math.round(n).toLocaleString("tr-TR");
}

/** A score as she reads it: %88. Rounded down, like the Points it earns. */
export function formatScore(score: number): string {
  return `%${Math.floor(score)}`;
}

/** A decimal with `digits` places and a Turkish comma: "8,8", "23,0". */
export function formatDecimal(x: number, digits = 1): string {
  return x.toFixed(digits).replace(".", ",");
}

/** A number rounded to tenths, a trailing zero dropped: "23", "2,5". */
export function formatTenths(x: number): string {
  return String(Math.round(x * 10) / 10).replace(".", ",");
}
