# Prototype — how well does the Oracle judge a video's level?

Throwaway code for [#141](https://github.com/atilileri/atilileri.github.io/issues/141). It is kept on this
branch as a primary source and is **not merged to `main`**. The validated decisions live on the issue, and
from there in `docs/dutch/`.

**No transcript is committed here.** `AUTOMATION.md` and #94 keep third-party text off this repo, so this
directory holds only the scripts, the manifests of what was measured, and the verdicts. Re-running the scripts
re-fetches everything they need.

## What each file is

| File | What it does |
| --- | --- |
| `PROTOTYPE-141-level-probe.sh` | The first pilot — one text, N runs. |
| `PROTOTYPE-141-run.sh` | The exam calibration. `blind` reads header-stripped text, `labelled` reads it raw. |
| `PROTOTYPE-141-video.sh` | Judging by pasting the transcript. **This route fails** — see below. |
| `PROTOTYPE-141-video2.sh` | Judging by asking about the source, renaming it neutrally for the blind arm. The working route. |
| `PROTOTYPE-141-freq.mjs` | The frequency measure over the exam texts. |
| `PROTOTYPE-141-freqvid.mjs` | The same over the video transcripts. |
| `manifest.tsv` | The twelve certified exam texts, with their Drive-relative paths. |
| `videos.tsv` / `vids.tsv` | The five videos and their source ids. |
| `results-*.tsv` | Verdicts: tag, certified level, arm, answer, confidence, seconds. |
| `results-labelled-accidental.tsv` | The discarded 36-of-36 run, kept because it is the label control. |

## How to re-run

Both the exam texts and the videos come from outside this repo. `PROTOTYPE-141-run.sh` expects the exam
transcripts copied down from Drive into `cal/`, per the paths in `manifest.tsv`. The video scripts expect the
five sources present in the `scratch` notebook — **and a Session must empty `scratch` afterwards**, per
`docs/dutch/ORACLE.md`.

## What it found

- The Oracle scored **30 of 36** on certified exam transcripts, blind.
- Its **confidence field is noise** — `high` on every answer, including all six wrong ones.
- **`ask` rejects a long prompt**, so a transcript cannot be pasted. Ask about the source instead.
- **A YouTube transcript may come back in another language.** The frequency list catches that; it cannot rank
  difficulty.
- **A title that declares a level pulls the answer toward it.**
