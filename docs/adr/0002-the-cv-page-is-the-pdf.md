# The CV page is the PDF, and it prints for a parser

[`src/pages/cv.astro`](../../src/pages/cv.astro) is the only source of the CV. A visitor
who wants a file presses **Download PDF**, the browser prints the page, and the print
stylesheet at the foot of that file decides what the PDF looks like. There is no second
document, no exported file in `public/`, and no build step that renders one.

Two decisions follow from that, and both are invisible in the code that implements them.

## The printed sheet serves an ATS, not a designer

The PDF's first reader is usually an Applicant Tracking System — the software that parses a
CV into database fields before a person sees it. So the print stylesheet is not a smaller
copy of the screen page. It **collapses every section to one column**, because some parsers
read a two-column PDF in the wrong order and interleave a section heading with another
section's content. It **hides the thesis infographic**, because a parser reads no picture
and that one cost most of a page. It **prints the two oldest roles as a single line each**,
keeping the employer and the dates so no gap appears in the record, and it prints the
awards as one line rather than a column. It leaves the **Technical Stack** section out
altogether: those keywords already appear inside the job entries and their tag rows, so on
paper the section only repeats itself. The document is held at **three A4 pages**.

A block that the paper does not want carries `data-screen-only`. The rule that hides those
blocks is written **after** the one-column rule, because the two selectors carry equal
specificity and the later one wins — a hide placed before it is silently overridden. A
check in the guard script caught exactly that mistake.

The screen page is the opposite artifact: a portfolio for someone who already found the
site. It keeps the grid, the picture and every paragraph. Nothing is deleted from the
screen to make the paper shorter — the print sheet hides, and hiding is reversible.

**So: widening the print sheet means asking what a parser does with the change.** A visual
improvement that costs the parser a field is a regression, however good it looks.

Because nobody prints a page by accident, a broken print stylesheet would ship unnoticed.
[`tools/cv/check-print.mjs`](../../tools/cv/check-print.mjs) renders the built page in
print mode and asserts the name, the email, the hidden chrome and the page count. Run it
after any change to the CV page.

## Contact details have one home

[`src/data/contact.ts`](../../src/data/contact.ts) holds the name, the role, the city, the
email and the profile addresses. The footer and the CV both read it.

Before this, the footer held its own copies, and its LinkedIn link pointed at `#` — a
broken link nobody noticed, which is what two copies of an address do to each other. The
CV was about to become a third copy, in a document that leaves the site and cannot be
corrected after it is sent.

The file also carries `nameUpper`. The site sets headlines in uppercase display type, and
CSS `text-transform: uppercase` runs under the page's `lang="en"`, which turns the Turkish
"i" into a dotless "I" and misspells the name. The uppercase form is therefore written out
rather than derived.

## Considered and rejected

**Building the PDF at deploy time with Playwright**, and linking it as a static file. It
buys a controlled file name and an exact layout. It costs a browser install in the deploy
workflow, and it adds a way for the PDF to fall behind the page — the failure mode of a
generated artifact is that nobody regenerates it. The file name was the only real gain, and
a title swap around the print dialog buys that for four lines of script.

**A separate, print-only CV document.** Same objection, one step worse: two documents that
disagree about where you worked.
