# The Oracle

The Oracle is the `OracleDutch` collection of the learner's NotebookLM notebooks, driven by the `notebooklm` CLI. It holds the course books, the practice exams and the listening material — the shelf this repo may not hold. **It is a source, never a planner**: the Plan decides what is taught.

## Call rules

- **Find the notebooks through the collection**, never by a title prefix: `notebooklm --quiet collection notebooks OracleDutch --json`. The account holds other notebooks.
- **Address a notebook with `-n <id>`.** Never run `notebooklm use`, which is stateful.
- **Put `--quiet` before the command name**, or a banner breaks the JSON: `notebooklm --quiet source search "…" -n <id> --json`.
- **Write only to the `scratch` notebook**, and delete what you added to it before the Session ends. Every other notebook is the learner's to curate.
- **`CSRF token not found` or *page structure has changed* means the client is out of date**, not the login. Put `uv tool upgrade notebooklm-py` in the ⚠ block.
- **A failed call degrades.** Name it in one line of the Session's `limits`, and go on without the Oracle. Never retry in a loop, and never repair a notebook.

## The three jobs

| Job | Command | Cost |
| --- | --- | --- |
| **Search the books** for the Lesson's topic | `source search "<query>" -n <id> --json` | ~4 s. Returns the raw passage, so it cannot invent. Search as often as a passage settles a question; an empty result does not prove absence. |
| **Ask for a grammar explanation** | `ask "<question>" -n <id> --json` | ~36 s. A model answers, so check the cited source id is the book you asked about. At most three `ask` calls a Session. |
| **Read the Episode** | [EPISODE.md](EPISODE.md) | — |

- **Ask in English**, which keeps Dutch quotations intact; ask in Turkish only when the book is one of the Turkish-mediated ones. Ask about a source; never paste long text — `ask` rejects a prompt past about 140 words.
- **Start each question fresh.** Keep a conversation id only for a follow-up inside one Session.
- **Teach in your own Turkish words.** Never publish a book's passage, and never name or quote a person from the course recordings. An answer with no citation may steer your choice and is never taught as fact.

## Drawing a Picture

A Picture is one image the Oracle draws, owned by one Hook, Trap, Lesson or Tekst. Draw one where you judge it helps, and whenever the learner asks. Draw it once; draw it again only when its owner changes or the learner asks. **Run every `ask` before the first Picture**: one daily quota pays for both, and each image costs about 3–4% of it.

1. Add the scene as a text source to `scratch`: `source add --type text --title "<owner>" "<scene>" -n <scratch> --json`.
2. Generate:
   ```
   notebooklm --quiet generate infographic "<instruction>" -n <scratch> -s <source-id> \
     --style <style> --language tr --orientation square --detail concise --wait --json
   ```
3. Download it with `download infographic -n <scratch> -a <task-id>`, then convert it to `public/images/nederlands/<owner>.webp` at 900 px wide, quality 75 (`ffmpeg -i in.png -vf scale=900:-1 -quality 75 out.webp`).

**Choose the style by what the Picture shows:**

| Shows | Style |
| --- | --- |
| An abstract word, or a scene from the learner's life | `sketch-note` |
| A grammar step, or a KNM procedure | `instructional` |
| The header of a Tekst | `editorial` |
| A Trap, or a labelled diagram | `scientific` |
| Pop culture, or Dutch on the street | `auto` |

**Every instruction carries these rules**, because the model breaks them otherwise:

- *Write every Dutch string exactly, letter for letter. Never translate a quoted string. Use no Turkish `İ` or `ı` inside a Dutch word.* With `--language tr` the model otherwise translates or Turkish-capitalises the Dutch.
- Few captions, and the object facts the model gets wrong (a padel racket has no strings).
- **No famous name.** The image filter refuses it silently; the name stays in the Hook text.
- Facts the public Profile already publishes may go in; the Profile file itself never does.

**Read every image you draw.** A Dutch word written wrong costs one retry; a second failure leaves the owner in text and adds one line to `limits`. The `<img>` rule is in [SITE.md](SITE.md).
