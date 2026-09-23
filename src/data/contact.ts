/**
 * One home for the contact details.
 *
 * The footer and the CV both print the same addresses, and the CV page is
 * also the source of the printed PDF (see docs/adr/0002). Two copies of an
 * address drift apart, so every surface reads this file.
 */
export const contact = {
  name: "Atıl İlerialkan",
  /**
   * The CV headline is set in the site's uppercase display type. CSS
   * `text-transform: uppercase` runs under the page's `lang="en"`, which
   * turns the Turkish "i" into a dotless "I" and misspells the name. So the
   * uppercase form is written out here rather than derived.
   */
  nameUpper: "ATIL İLERİALKAN",
  role: "Software Engineer / Architect",
  city: "Eindhoven, Netherlands",
  email: "atil@live.it",
  /** Shown as plain text so that a reader on paper can type it. */
  links: [
    { label: "linkedin.com/in/atililerialkan", href: "https://www.linkedin.com/in/atililerialkan/" },
    { label: "github.com/atilileri", href: "https://github.com/atilileri" },
    { label: "atilileri.github.io", href: "https://atilileri.github.io" },
  ],
  languages: "Turkish (native) · English (professional, YDS 95 / TOEFL 114 equivalent) · Dutch (A2, working toward B1)",
} as const;
