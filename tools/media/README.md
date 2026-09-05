# tools/media

Scripts that let an agent read what it cannot read natively: speech, video and PDFs without a text layer.

Everything here runs **locally and offline** — no API key, no account, no per-use cost. It is written in Node
because this machine has no `pip` and no password-free `sudo`, so Node and static binaries are the only things
that install.

**When to use which is [`docs/dutch/READING-MATERIAL.md`](../../docs/dutch/READING-MATERIAL.md).** That file
carries the measured accuracy and speed, the limits, and the rules about publishing what you read. Read it first;
this file only says how to run the scripts.

These scripts are meant to be **lifted into the `docent` skill** when it is built
([#86](https://github.com/atilileri/atilileri.github.io/issues/86)). They live here so the skill can copy a
working, tested version rather than a described one.

## Install

```sh
bash tools/media/setup.sh
```

Installs `~/bin/ffmpeg` and `~/bin/ffprobe` (static builds), the speech models in `~/tools/models` (about
1.6 GB), and this directory's npm dependencies. Every step skips itself if already done, so it is safe to re-run.

## Use

```sh
node tools/media/transcribe.js recording.mp3 out.txt   # speech -> timestamped Dutch text
node tools/media/pdftext.js book.pdf out.txt           # PDF text layer + publisher metadata
node tools/media/frames.js lesson.mp4 frames/ 8        # 8 stills across a video
node tools/media/ocr.js page.png out.txt               # scanned page -> text
```

Environment variables, all optional:

| Variable | Default | What it does |
| --- | --- | --- |
| `ASR_LANG` | `nl` | Recognition language. Empty string means detect per segment. |
| `ASR_THREADS` | `8` | CPU threads for recognition. |
| `ASR_MODELS` | `~/tools/models` | Where the models live. |
| `FFMPEG`, `FFPROBE` | `~/bin/…` | Binary paths. |
| `OCR_LANG` | `nld+tur+eng` | Tesseract languages. |

## What is inside

- **`transcribe.js`** — ffmpeg to 16 kHz mono, silero VAD to cut the recording into utterances, then
  sherpa-onnx with Whisper turbo (int8) on each one. The VAD step is not optional: Whisper decodes only 30
  seconds at a time, so without it everything past the first half minute is silently discarded.
- **`pdftext.js`** — `pdf-parse`. Prints the metadata line to stderr, which is often where the publisher and the
  copyright holder are named.
- **`frames.js`** — ffmpeg stills spread evenly across a video, at 1024 px wide.
- **`ocr.js`** — `tesseract.js`. Downloads its language data on first run, then works offline.

`node_modules/` and the models are not committed. `setup.sh` fetches both.
