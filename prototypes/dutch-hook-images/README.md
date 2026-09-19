# PROTOTYPE — images for Hooks (throwaway)

Primary source for two tickets on map #74. Not production code; nothing here is wired into the site.

- **#146 — Prototype: draw one Hook through nine routes.** One Hook (`gordijn` → chef GORDON behind the curtain,
  padel racket) drawn through nine image routes, each shown inside a mock Turkish Lesson.
  Verdict: only the Oracle infographic (`notebooklm generate infographic`) goes forward.
- **#147 — Prototype: which NotebookLM infographic styles draw a Hook, and why do some fail.**
  Every infographic style swept; a no-name control proved the failures are a silent public-figure filter
  (12/27 with GORDON, 5/5 without). Then the five liked styles drew ten realistic scenarios, 10/10 first try.

## Run it

    npx astro dev
    # /prototype/dutch-hook-images/?variant=r1   (routes r1…r12; r1 holds every style tried)
    # /prototype/dutch-scenario-images/?variant=sketch-note   (sketch-note, instructional, editorial, scientific, auto)

## Layout

- `src/pages/prototype/*.astro` — the two throwaway pages.
- `public/prototype/dutch-hook-images/` — every image, by route (`r1`…`r10`) and scenario (`sc/`).
- `prototypes/dutch-hook-images/` — `hook.md` (the shared Hook), `r1/` (style sweep scripts and logs),
  `sc/` (`scenarios.json`, the scenario runner, logs, and `retest.json` for the text-rules retest),
  `r8/` (Pollinations raw), `tools/` (Gemini-over-CDP driver, Mermaid renderer).

The Oracle's `scratch` notebook was emptied of every source and infographic this prototype made.
