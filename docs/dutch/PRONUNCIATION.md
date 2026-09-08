# Word audio and IPA on an Item

Every Item may carry a **human recording of its Dutch word** and its **IPA transcription**. One script fills both
fields from two public sources. This file says what it stores, how to run it, and when.

The rule it obeys is [`adr/0008-speaking-is-out-of-scope.md`](./adr/0008-speaking-is-out-of-scope.md): *a single
Dutch word may link a human recording from Wikimedia Commons, by link and never by copy*. So the repo stores a
file title. It never stores an audio file. Generated speech stays banned.

The script is [`tools/dutch/pronounce.mjs`](../../tools/dutch/pronounce.mjs). It needs Node 22 and no dependency.

## The two sources answer different questions

| Source | What it answers | How |
| --- | --- | --- |
| Wikimedia Commons | Does a recording exist, by whom, under which licence | `File:Nl-<word>.ogg` exists or does not |
| nl.wiktionary | The IPA transcription | The `{{IPA-nl-standaard}}` template in the Dutch section |

**Commons names every file after the bare word.** This is a convention, not a guess. Measured on 2026-09-08
over 221 words — nouns, separable verbs, inflections, long compounds, dialect food and modern coinages — the
fixed name found **217 recordings, 98%**. It missed two phrases and two rare compounds.

IPA is thinner: **186 of the same 221, 84%**. A word therefore often has audio and no transcription. Nothing
downstream may require either field.

**A miss has no rescue, so the script tries only once.** Two fallbacks were measured and dropped. A Commons
full-text search returns only files the fixed name already found, and it ranks a phrase above the word: a search
for `huis` answers `Nl-huis aan huis.ogg`. The nl.wiktionary audio line is worse — it prints the template
`{{audio|nl-{{pn}}.ogg}}` on every page, where `{{pn}}` means *page name*. That is the same guess, dressed as
evidence. Neither source can confirm what Commons denied.

## The fields

| Field | Holds | Example |
| --- | --- | --- |
| `say` | The Commons file title, or `none` | `File:Nl-fiets.ogg` |
| `sayCredit` | The author and the licence | `GerardM, CC BY-SA 3.0` |
| `sayChecked` | The day a **miss** was confirmed | `2026-09-08` |
| `ipa` | The transcription, or `none` | `/fits/` |
| `ipaChecked` | The day a **miss** was confirmed | `2026-09-08` |

A date sits beside a miss only. Beside a hit it would say nothing that `sayCredit` does not already say.

**Build the playable link from the title.** Strip `File:` and append the rest:

```
https://commons.wikimedia.org/wiki/Special:FilePath/Nl-fiets.ogg
```

That URL redirects to the `.ogg` itself, so an `<audio>` element plays it directly.

**Every recording needs attribution.** The licences seen are CC BY 2.5 and CC BY-SA 3.0. Both oblige us to name
the author. Print `sayCredit` wherever the audio plays.

## How to run it

```bash
# Fill every gap in the inventory. This is the normal run.
node tools/dutch/pronounce.mjs

# Report the changes and write nothing.
node tools/dutch/pronounce.mjs --dry-run

# Also retry misses older than 90 days, because Commons keeps growing.
node tools/dutch/pronounce.mjs --recheck

# Look words up and print the answer. This touches no file.
node tools/dutch/pronounce.mjs --words "de kat" gezellig "uit elkaar gaan"

# A different inventory.
node tools/dutch/pronounce.mjs --file path/to/items.json
```

The default inventory is `docs/dutch/items.json`. The file is a JSON array of Items, or an object with an
`items` array. An Item needs an `nl` field; the script skips any Item without one.

## When it runs

**Docent runs it at the end of a Session, right after it appends the new Items.** That is the only trigger. No
schedule, no CI, no build step. CI is excluded by [`AUTOMATION.md`](./AUTOMATION.md) anyway.

One trigger is enough because **the script always scans the whole inventory, never only the new words**. So a
Session that skips the step, or that meets a network failure, heals at the next Session. The gap closes by
itself.

## The three rules that make one trigger safe

1. **It is idempotent.** A second run on an unchanged inventory writes nothing and costs one call per source.
2. **A miss is recorded, not retried.** A confirmed absence writes `none` plus the date, and normal runs skip
   it. Only `--recheck` returns to it, after 90 days.
3. **An outage writes nothing.** A failed call leaves the field **absent**, never `none`. The two states look
   alike from inside the script and mean opposite things — *no recording exists* against *we did not ask*. If a
   failure wrote `none`, one bad network moment would mute a word for three months.

A failure never stops a Session. The script logs the source it could not reach and continues, which is the
degrade-and-ship rule from [`AUTOMATION.md`](./AUTOMATION.md).

## Known limits

- **A multi-word Item usually misses.** `zich vervelen` has a recording; `uit elkaar gaan` has none. Commons
  holds words, and a phrase is not a word.
- **Some IPA entries are stubs.** nl.wiktionary prints `/xxxx/` where an editor left a placeholder. The script
  rejects that string and records a miss instead.
- **A leading article breaks the lookup, so the script strips it.** `de`, `het` and `een` only. `zich` stays,
  because Commons names the file with it.

## Tests

```bash
node --test tools/dutch/pronounce.test.mjs
```

Eight tests cover the lookup key, the IPA parser, the miss rule and both outage cases. They run offline, apart
from one live IPA fetch.
