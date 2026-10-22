# Items

**Never open `docs/dutch/items.yml` or `docs/dutch/schedule.yml`.** At B1 size the inventory is larger than you are. Every read and write goes through the script, run from the repo root:

```
node .agents/skills/docent/scripts/items.mjs due [--limit N]      the review queue, lean, most overdue first
node .agents/skills/docent/scripts/items.mjs get <id> [<id>...]   whole Items, every field
node .agents/skills/docent/scripts/items.mjs add    < new.yml     new Items, a YAML map keyed by id
node .agents/skills/docent/scripts/items.mjs update < fields.yml  changed fields of existing Items; null removes a field
node .agents/skills/docent/scripts/items.mjs answer < verdicts    "<id> <recognition|production> <right|wrong>" per line
```

Prose goes on stdin, so pipe a heredoc. Every command validates first and writes once: a refused call changes nothing, and its error says why. `--dry-run` reports without writing.

## Budgets

- **`due` returns at most 50 Directions** — the review half of a Session. Ask every one.
- **At most ten new Items a Session.** When `due` reports more than three budgets overdue, add at most two.
- **A new Item starts both Directions on rung 1**, so it returns in a few days. `production` waits until `recognition` passes rung 1.

## The id

The id is the Dutch word, slugged: lowercase, spaces as hyphens, punctuation dropped, **diacritics kept** (`één` is not `een`). A second word with the same spelling takes `-2` (`bank`, `bank-2`). The script refuses an id that does not match its `nl`, and an `add` for an id that exists.

## The fields

```yaml
vriend:
  nl: vriend
  article: de
  tr: arkadaş
  en: friend
  bridge: Hollandaca `vriend` ve İngilizce `friend` aynı kökten gelir.
```

| Field | Holds | Language |
| --- | --- | --- |
| `nl`, `tr`, `en` | The word in its dictionary form, and its meaning | — |
| `article` | `de` or `het`, on a noun only | — |
| `bridge` | A **true** fact that helps recall: an English or Turkish relative, or the word's history | Turkish prose quoting the words |
| `hook` | An **invented** sound-alike and one scene that ties it to the word | Turkish prose quoting the words |
| `trap` | `{from: en\|tr, text}` — an intuition from English or Turkish that would give wrong Dutch the learner would not notice | Turkish prose |
| `split` | The word's parts — [SPLIT-FORMAT.md](SPLIT-FORMAT.md) | Turkish and English glosses |
| `pictures` | `{hook, trap}` — the `alt` of the Hook's or the Trap's Picture, set before it is drawn | Turkish |

- **A Bridge never invents.** A shared origin or a history comes from a source, and you link it; a Bridge that states only a resemblance needs none. Offer a history; do not write one for every Item. Look an origin up first on `etymologiebank.nl` (Dutch), `etymonline.com` or `en.wiktionary.org` (English).
- **A Hook is distinctive, not absurd.** It may use a scene from a show the Profile names, without quoting it. A famous name lives in the Hook text and never in a Picture instruction. Show a Hook where the word is taught and after the answer, never inside a Prompt. Its Picture's `alt` goes in `pictures` ([SITE.md](SITE.md#pictures)).
- **A Trap fires on silent wrongness, not on difference.** The learner must hold the intuition, it must give wrong Dutch, and they must not notice. One Trap per Item; a Lesson shows at most three.
- **A Split** goes on a word with two or more meaningful parts. Write it once, on the Item, and correct it in place.
