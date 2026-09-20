# ADR 0013 — The deliverable is text; the Picture is the only exception

**Status**: Accepted
**Date**: 2026-09-20
**Scope**: `docs/dutch` — every Lesson, Session, Scenario, Tekst and Clip, and the
skill that writes them
**Spec**: [#131](https://github.com/atilileri/atilileri.github.io/issues/131), under map [#74](https://github.com/atilileri/atilileri.github.io/issues/74)

## Context

This journey kept meeting the same offer from a different direction: *text exists, so
derive media from it.* A podcast of a Session, an infographic of a Lesson, a video
summary of a Scenario, a diagram of a word, an Anki deck, a browser reading a page
aloud. Each arrived as its own proposal, and each was measured rather than argued.

Nine tickets tested the offer. What they found:

- **Generated speech recovers almost no Dutch.**
  [#129](https://github.com/atilileri/atilileri.github.io/issues/129) measured local
  Dutch synthesis at 21 times realtime for nothing, and
  [#95](https://github.com/atilileri/atilileri.github.io/issues/95) then ruled it out
  because the one voice descends from a U.S. English voice.
  [`adr/0008`](./0008-speaking-is-out-of-scope.md) holds that line.
- **The Oracle's Studio can generate eight kinds of output, and none is good
  enough.** [#149](https://github.com/atilileri/atilileri.github.io/issues/149) made
  **fourteen** — audio and video overviews, quiz, flashcards, report, data table,
  mind map, slide deck — from a real B1 exam text and from a Session's own text. The
  learner rejected every one. Two mechanical findings explain why, and both are
  properties of the tool, not of the prompt:
  - **A Turkish-voiced overview mispronounces every Dutch word it says.** Whisper
    recovered **0 and 2 of 23** Dutch terms — *"on bepaltı tayt"* for
    `onbepaalde tijd`.
  - **Length and speech speed cannot be steered.** Three prompt wordings and three
    formats changed neither. Only the size of the source moved them: a six-sentence
    script gives 21–27 seconds in every format, the whole Lesson gives three
    minutes. Under a minute buys a caption reel; teacher-like pacing costs three
    minutes. The prompt cannot buy both.
- **A drawn diagram loses to typography.**
  [#148](https://github.com/atilileri/atilileri.github.io/issues/148) drew the same
  six words five ways — four of them Mermaid. The learner chose the inline HTML
  split. The reason generalises: **a scaled image shrinks its own text with word
  length**, so `rijksbegroting` as bricks is unreadable at 390 px. Only HTML keeps
  one text size for every word.
- **A second scheduler splits the record.**
  [#136](https://github.com/atilileri/atilileri.github.io/issues/136) cut the Anki
  export, because a word would climb both Anki's ladder and the Rung ladder, and an
  answer given in Anki never reaches Docent.
- **One form survived.** The Oracle infographic —the **Picture** — drew 10 of 10
  realistic scenarios on the first try once no famous name reached the image
  instruction ([#146](https://github.com/atilileri/atilileri.github.io/issues/146),
  [#147](https://github.com/atilileri/atilileri.github.io/issues/147)), and
  [#122](https://github.com/atilileri/atilileri.github.io/issues/122) locked what it
  is and who owns it.

So the capability is real and mostly idle. A future reader will see free local speech
synthesis, a video-capable client and a working Mermaid renderer all installed, all
unused, and will reasonably ask whether anybody tried. Somebody did.

## Decision

**A Lesson, a Session and a Scenario are text. The Picture is the only artifact
derived from that text.**

- **Docent generates no Oracle Studio output** — no audio overview, video overview,
  quiz, flashcards, report, data table, mind map or slide deck. The Oracle stays a
  source Docent asks, with `source search` and `ask`
  ([`ORACLE.md`](../ORACLE.md)).
- **Generated speech stays banned**, per `adr/0008`. A single word may **link** a
  human recording on Wikimedia Commons, by link and never by copy
  ([`PRONUNCIATION.md`](../PRONUNCIATION.md)).
- **No image-diagram anywhere.** A Split is HTML and CSS written in place
  ([`SPLIT.md`](../SPLIT.md)), which makes it Lesson content, not derived media.
- **The grouping word "enrichment" is retired.** With one survivor it names nothing
  the glossary does not already name. The term is **Picture**.
- **Nothing downstream may require a Picture or a word recording.** Every page
  teaches completely in text, and a missing image costs no teaching.

**A Picture, where it lives and what it may cost:**

- **`public/images/dutch/<owner-id>.webp`**, converted from the Oracle's 900×900 JPG
  at quality 75 — 60–200 KB against 160–340 KB. The owner's id is already what
  triggers a redraw, so the path answers *which Picture is stale* by itself.
- **`public/`, not Drive and not the Oracle.** Everything on this map is public
  (map #74), so a stranger reading the repo must see the image the learner sees.
- **Its `alt` text describes the drawn scene, in Turkish**, written with the image
  instruction. A Picture carries meaning; it is never marked decorative.
- **Ten per Session that Docent decides alone**, and **no limit on what the learner
  asks for**. The three counts are separate on purpose:
  - **Five unprompted**, on the #122 triggers — an Item answered wrong, an Item with
    no Bridge, then a header.
  - **Five more Docent offers on its own judgement**, when a Picture helps the
    Session.
  - **A learner request is uncapped.** Learning is the point, and a learner asking
    for a picture is the strongest signal that one will help.
  - None of the ten needs a separate confirmation. A Picture rides on its owner's
    approval and never asks for its own.
- **On a request, the daily window is the only stop**, and it stops honestly: a spent
  window falls to the #147 failure rule — one retry, then no image, and the Lesson
  teaches the Hook as text. Docent states what is missing rather than refusing to
  teach, which is the degradation rule `AUTOMATION.md` already binds every Session
  to.
- **One disclosure line on `/nederlands/`** says the Pictures are AI-drawn. Not a
  caption under each one.

## Consequences

- **The public pages need no new component.** `SITE.md` allows four, and an image is
  a plain `<img>`. Whatever a page shows still reads with JavaScript off.
- **Storage grows with use, and stays cheap.** Ten WebP images per Session at
  60–200 KB is roughly 100 MB a year for Docent's own; a heavy requesting habit
  costs about 2 MB a Session on top. `public/` holds 5.4 MB today, so this is the
  repo's largest content by some way, and still small.
- **The daily window has one consumer worth counting.** A Picture costs about 3–4%
  of the shared Gemini Notebook window (~25–30 images a day), which `ask` also draws
  from. Ten per Session is 30–40% of a day, so **two or three Sessions fill it** —
  and an uncapped request stream can fill it inside one. That is the intended
  trade: the window is spent on what the learner asked to see.
- **The idle capabilities stay installed.** Local synthesis, the video-capable
  client and Mermaid all remain in `tools/` and reachable. They are unused by
  decision, not by lack.
- **[#130](https://github.com/atilileri/atilileri.github.io/issues/130)'s capability
  line *"generated video: not available"* is factually wrong** — the client
  generates video. Its **boundary** is untouched, and this ADR makes the error
  decision-neutral: Docent generates none either way.
- **Reopening this needs a teaching failure, not a better tool.** A sharper model, a
  faster renderer or a new Studio format changes nothing here. What would change it
  is a Lesson that demonstrably fails to teach in text.
- **A grammar diagram is not settled, only unadmitted.**
  `docs/research/dutch-media-automation-tooling.md` argues Mermaid is the right
  answer for `de`/`het`, separable verbs and V2 word order, and #148 never tested
  that case — it tested word parts. Admitting one needs a fresh prototype ticket,
  not an appeal to this ADR.
