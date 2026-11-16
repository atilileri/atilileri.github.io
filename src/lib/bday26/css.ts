/**
 * One token of `src/styles/bday26.css`, read in the browser, for the pages
 * that paint on a canvas (kayak, surus, piyano) and so cannot write
 * `var(--bd-accent)` themselves. The stylesheet is the one place a colour
 * is written down: no hex fallback here, since `BdayLayout.astro` always
 * loads it before a page's script runs.
 */
export function cssVar(name: `--${string}`): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
