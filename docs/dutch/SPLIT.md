# The Split: a word's parts in a Lesson

A **Split** shows what a Dutch word is made of, at the point a Lesson introduces it. Each part gets its Turkish and
English gloss, then the literal sum, then the meaning. The learner reads the word from its parts instead of
memorising it whole. This file is the format Docent follows every time it writes one.

Locked by [#148](https://github.com/atilileri/atilileri.github.io/issues/148). The learner compared five ways to
draw a word's parts and chose the inline split: text and colour, no diagram. The prototype is kept on the branch
[`prototype/148-dutch-word-parts`](https://github.com/atilileri/atilileri.github.io/tree/prototype/148-dutch-word-parts);
the chosen form is its variant A.

## When to write one

**Write a Split whenever a Lesson introduces a word that splits into two or more meaningful parts.** That covers a
compound (`troon` + `rede`), a derivation (`be-` + `groot` + `-ing`), and a compound held together by a linking
sound (`miljoen` + `-en-` + `nota`).

- **A word with one part gets no Split.** `gordijn` is shown as itself.
- **An inflection alone does not make a Split.** `boeken` is `boek` plus a plural; nothing is learned by drawing
  that. An inflection is shown only on a word that already splits: `telwoorden` shows its `-en`.
- **Write it where the word is introduced, once per Lesson.** A later Lesson that introduces the word again writes
  its own Split.

**A Split is part of the word's explanation, never the whole of it.** The Lesson's prose around the word stays.
So do the Item's Bridge, Trap and Hook. The Split sits beside them and replaces none of them.

## What it shows, in this order

| # | Line | Shown | Example (`rijksbegroting`) |
| --- | --- | --- | --- |
| 1 | **The word** | Always | the article in small grey, then the word with every part underlined in its role colour, no separators |
| 2 | **Group row** | Only when a part has parts of its own | a bracket over `rijk` `-s-` labelled `rijks`, a bracket over `be-` `grot` `-ing` labelled `begroting` |
| 3 | **Hollandaca** | Always | one box per part, as written in the word |
| 4 | **Türkçe** | Always | `devlet` · `bağlayıcı ses` · `fiil yapan ön ek` · `büyük` · `-me (isim yapar)` |
| 5 | **English** | Always | `state` · `linking sound` · `verb prefix` · `great` · `-ing` |
| 6 | **Sözcüğü sözcüğüne** | Always | *devletin büyüklüğünü biçmesi* |
| 7 | **Neden?** | Only when the literal sum is not the meaning | *`begroten` ‘büyüklüğünü biçmek’, yani tahmin etmek. Tahmin edilen harcama → bütçe.* |
| 8 | **Yazım** | Only when a part is spelt differently inside the word | *`groot` burada `grot` yazılır …* |
| 9 | **Köken** | Optional, per part | one line per part, each with its source mark |
| 10 | **Anlamı** | Always | *devlet bütçesi* |

Lines 3 to 5 form one grid, one column per part. On a phone the grid scrolls sideways inside its own box; the page
never does.

## Roles and colours

Every part has exactly one role. The colour follows the role, never the position in the word.

| Role | Turkish label | What it is | Examples | Fill · border · text |
| --- | --- | --- | --- | --- |
| `stem` | ilk parça | The first part that is a word | `tel`, `troon`, `rijk` | `#dbeafe` · `#1d4ed8` · `#0b2a66` |
| `stem2` | ikinci parça | Any later part that is a word | `woord`, `nota`, `grot` | `#dcfce7` · `#15803d` · `#0f3d22` |
| `link` | bağlayıcı ses | A sound that only joins two parts, drawn with a dashed border | `-s-`, `-en-` | `#f3f4f6` · `#6b7280` · `#374151` |
| `affix` | ek | A prefix or a suffix | `be-`, `-ing`, `-en` | `#ffedd5` · `#c2410c` · `#6b2308` |

The **Sözcüğü sözcüğüne** label is purple (`#6d28d9`). The **Anlamı** label sits on yellow (`#fef9c3`).

## A part spelt differently: say so

**Joining the parts does not always spell the word.** In `begroting` the part `groot` is written `grot`, because
Dutch writes a long vowel with one letter in an open syllable. Docent shows the part **as written in the word**,
with its dictionary form under it — `grot` above `← groot` — and adds the **Yazım** line that names the rule. A
changed spelling is always stated, never left for the learner to notice.

## Origins and sources

**An origin line is kept whatever its source.** Nothing is removed because a source is missing. The source is
chosen in this order:

1. **nl.wiktionary** — preferred. Link the word's page: `kaynak: nl.wiktionary ↗`.
2. **Another source** — acceptable. Link it by name: `kaynak: etymologiebank.nl ↗`.
3. **Docent's own reasoning** — acceptable, not preferred. Mark it `Docent'in çıkarımı`, so a reader knows no page
   stands behind it.

This is looser than the rule for a **Bridge**, which must cite a source when it claims a shared origin. A Bridge is
a Mnemonic on the Item and follows the rule in [`CONTEXT.md`](./CONTEXT.md). A Split's origin line belongs to the
Lesson and follows this file.

## Language

The labels and the prose are **Turkish**. The parts are **Dutch**. The English row quotes English words only and
holds no English sentence, which keeps the rule from [#84](https://github.com/atilileri/atilileri.github.io/issues/84):
English appears as a quoted word.

## The fields

A Split is held in the Lesson, at the word it explains. The build decides the component that renders it.

| Field | Holds | Required |
| --- | --- | --- |
| `word` | The word as it appears in the Lesson | yes |
| `article` | `de` or `het`, for a noun | for a noun |
| `parts` | The parts in order; each has `nl`, `role`, `tr`, `en` | yes, two or more meaningful parts |
| `parts[].base` | The dictionary form, when the part is spelt differently in the word | when it differs |
| `parts[].parts` | The part's own parts, which produces the group row | when it has them |
| `literal` | The literal sum, in Turkish | yes |
| `why` | Why the literal sum became the meaning, in Turkish | when they differ |
| `spelling` | The spelling rule that changed a part, in Turkish | when `base` is set |
| `origins` | Lines of `part`, Turkish text, and `source` — a URL, or `docent` | no |
| `meaning` | The meaning, in Turkish | yes |

```yaml
word: rijksbegroting
article: de
parts:
  - { nl: rijk, role: stem, tr: devlet, en: state }
  - { nl: "-s-", role: link, tr: bağlayıcı ses, en: linking sound }
  - nl: begroting
    role: stem2
    tr: bütçe
    en: budget
    parts:
      - { nl: be-, role: affix, tr: fiil yapan ön ek, en: verb prefix }
      - { nl: grot, base: groot, role: stem2, tr: büyük, en: great }
      - { nl: "-ing", role: affix, tr: "-me (isim yapar)", en: "-ing" }
literal: devletin büyüklüğünü biçmesi
why: "`begroten` ‘büyüklüğünü biçmek’, yani tahmin etmek. Tahmin edilen harcama → bütçe."
spelling: "`groot` burada `grot` yazılır: açık hecede uzun ünlü tek harfle yazılır."
origins:
  - { part: rijk, tr: "‘devlet’ anlamıyla Keltçeden ödünç, ilk kez 901'de.", source: "https://nl.wiktionary.org/wiki/rijk" }
  - { part: groot, tr: "Orta Felemenkçe `groot`, Ön-Cermence `*grautaz`.", source: "https://nl.wiktionary.org/wiki/groot" }
meaning: devlet bütçesi
```

## Why not a diagram

The four rejected variants are recorded so they are not re-argued. Each is still on the prototype branch.

- **Split tree** (Mermaid flowchart): tall, and its text size jumps with word length on a phone.
- **Bricks** (Mermaid block): a long word like `rijksbegroting` becomes unreadable at 390 px.
- **Word family and topic** (mindmap, sankey): shows relations between words, never the inside of one.
- **Origin and bridges** (chains, Venn): the most text, and a left-to-right chain is small on a phone. Its origin
  lines survive here as the optional **Köken** line.

Only the inline split keeps the same text size for every word, because it is HTML and not a scaled image.
