# The Item inventory

**Docent never opens the inventory. It runs `tools/dutch/items.mjs` and reads the output.**

Holding B1 needs 1,600–2,600 Items ([#100](https://github.com/atilileri/atilileri.github.io/issues/100)),
and an Item carries Turkish prose — a Bridge, a Hook, a Split with its parts. At about 130 tokens an Item,
the file reaches **260,000 tokens**, which is larger than the agent that maintains it. A Session needs about
fifty of those Items. Why that makes the file a thing to query rather than read is
[`adr/0014`](./adr/0014-the-inventory-is-never-read-only-queried.md). This document is the contract.

Locked by [#152](https://github.com/atilileri/atilileri.github.io/issues/152).

## Two files, joined on the Item id

| File | Holds | Churn |
| --- | --- | --- |
| `docs/dutch/items.yml` | Item content — the words and the teaching fields | Up to 10 new Items a Session |
| `docs/dutch/schedule.yml` | Where each Direction sits on the ladder | Every Session, ~50 Directions |

The split is #100's. Content barely changes; the schedule changes every Session. Keeping them apart keeps the
Session's diff small and keeps the schedule readable for ever. `#82`'s lock — Items live in **one central
inventory**, referenced by id and never embedded — is about the model, and it survives a join on the id.

**Both are YAML** ([`SITE.md`](./SITE.md)), because the site reads `items.yml` directly through Astro's
`file()` loader and never gets a copy
([#88](https://github.com/atilileri/atilileri.github.io/issues/88)). The loader **throws
`FileGlobNotSupported` on any path holding a `*`** — read in `astro/dist/content/loaders/file.js`, Astro
6.1.5 — which is a second reason the inventory is one file and not a shard set. It parses `.yml` natively and
accepts either a list of objects carrying `id` or a map keyed by id.

**The site loads `items.yml` and `PLAN.md`, and not `schedule.yml`.** `SITE.md:104` shows progress as the
Horizon and Objectives per skill, which is Plan data. The Schedule is a working file: public in the repo,
rendered nowhere.

## The Item id is the Dutch word

```yaml
fiets:
  nl: fiets
  tr: bisiklet
  en: bicycle
  ipa: /fits/
huis:
  nl: huis
  tr: ev
  en: house
  bridge: Hollandaca `huis` ve İngilizce `house` aynı kökten gelir.
```

The top level is a **map keyed by id**, not a list, so the key is the word and no `id` field repeats it. The
loader accepts both shapes and uses the key as the entry id.

- **The id is `nl`, lowercased, with spaces as hyphens and punctuation dropped.** `de man met de hoed`,
  `s-morgens`. A diff, a Lesson reference and a Picture filename
  (`public/images/dutch/<owner-id>.webp`) then all read as the word they are about, where a counter like
  `i0417` makes every one of them opaque.
- **Diacritics survive.** Folding them would collide `één` with `een`, which are different words.
- **A collision takes a numeric suffix**: `bank` the furniture, then `bank-2` the money. The suffix means
  nothing on purpose — the `tr` and `en` fields one line below already say which word it is, and a meaningful
  suffix is a second naming decision per word made under time pressure.
- **Keys are sorted on every write**, so a new Item lands beside its neighbours and a diff shows one
  insertion rather than a growing tail.

Fields are written in reading order — `nl`, `tr`, `en`, then the teaching fields, then pronunciation — not
alphabetically. A stranger reads this file.

## The Schedule holds where a Direction sits

```yaml
fiets:
  recognition: {rung: 2, answered: "2026-09-05"}
  production: {rung: 1, answered: "2026-09-01"}
huis:
  recognition: {rung: 1, answered: "2026-09-05", wrong: true}
  production: {rung: 1, answered: "2026-09-01"}
```

One Direction per line, so a Session's fifty Rung moves are fifty changed lines.

| Field | Holds |
| --- | --- |
| `rung` | 1–5. Rung 5 is Mastered. |
| `answered` | The day the **learner answered**, never the due date. A late answer counts from when it was given. |
| `wrong` | Present only while the last answer was wrong. Deleted by the next right answer. |

**A due date is never stored.** It is `answered` plus the gap for the Rung, derived at read time from the
Horizon, so moving the Horizon reschedules the whole inventory with an empty git diff — the property #100
chose this shape for.

### `wrong` is a correction to #100, not an addition

#100 locked two rules that cannot both hold: *"two wrong in a row drop to rung 1"*, and *the Schedule holds
two fields per Direction*. With only a Rung and a date, nothing records that the last answer was wrong, and
from rung 5 two plain decrements land on rung 3 instead of 1.

`wrong` is that missing bit. #100's **intent** — a small file with a small diff — survives, because the field
is absent for every Direction not currently in a wrong streak, which is nearly all of them. Its **letter** was
written before anyone implemented the rule.

## The script is the only way in or out

```
node tools/dutch/items.mjs due [--limit N]      the queue, lean, most overdue first
node tools/dutch/items.mjs get <id> [<id>...]   whole Items, every field
node tools/dutch/items.mjs add    < items.yml   new Items as a YAML map on stdin
node tools/dutch/items.mjs answer < verdicts    "<id> <direction> <right|wrong>" per line
```

- **`due` prints lean; `get` prints whole.** A review Prompt needs `nl`, `tr` and `en`. The Bridge, Hook,
  Split, Trap and pronunciation fields are needed only when an answer is **wrong** and Docent has to explain,
  so Docent takes the queue cheaply and calls `get` for the handful it must teach. Never carry text nobody
  asked for.
- **The queue is most overdue first**, so a backlog drains oldest first; a tie goes to the lower Rung, because
  a struggling word is worth more than a held one; a remaining tie goes to the id, so a run is repeatable.
  `--limit` defaults to #100's budget of 50 Directions.
- **`production` waits for `recognition` to pass rung 1** (#100), so a word is never asked in the harder
  direction before it is recognised at all.
- **Prose arrives on stdin**, because a Bridge does not survive a command line, and ten new Items are one call
  rather than ten. The same path takes a Session's fifty verdicts in one call.
- **A new Item starts both Directions on rung 1, answered today** — it was just taught — so recognition
  returns in about three days.

### The Horizon

One declared date in `PLAN.md`. The gaps are Horizon/64, /32, /16, /8, floored at one day, and Mastered is
flat at 180 days. The reader is deliberately loose — the first ISO date on a line mentioning the Horizon —
because `PLAN.md` does not exist yet and authoring it is the first build task after `/to-spec`
([#90](https://github.com/atilileri/atilileri.github.io/issues/90)). `--horizon <date>` overrides it.

The tests pin the ladder against both numbers the record already contains: **3/7/13/26** as #100 wrote them,
and **3/6/12/24** as #90 measured them on 2026-09-19. No rounding rule fits both 7 and 13 except half-up on
208/32, so the pair fixes the formula more tightly than either alone.

## The rules that make a blind write safe

Docent cannot read what it writes, so the script is the only thing between a typo and a damaged file.

1. **Validate everything, then write once.** A failed call leaves both files exactly as they were. There is no
   partial write.
2. **Refuse, and say why.** An unknown id, malformed YAML, an `add` for an id that already exists, an id whose
   slug does not match its `nl` — each is an error naming the problem. A duplicate `add` names the word
   already there and suggests the `-2` form, because that is a collision Docent must resolve deliberately.
3. **Report drift, never repair it.** An id in one file and not the other is a bug the learner should see. A
   script that quietly patches a mismatch hides whatever caused it.
4. **Two scripts write these files, and Docent is not one of them.** `items.mjs` owns content and schedule;
   `pronounce.mjs` ([`PRONUNCIATION.md`](./PRONUNCIATION.md)) owns the five pronunciation fields. It stays
   separate because it is a network-facing, rate-limited job with its own tests and its own document.

## The preflight line

After reading the Plan, Docent runs `items.mjs due` and uses its output. **It never opens `items.yml`.**
`/to-spec` places that in the preflight's order; this document owns the instruction itself.

## The same rule fixed a second file

`DRIVE-INVENTORY.md` had the same shape of problem — 20,473 words, of which 91% was a hand-written listing of
every file in Drive, and `LISTENING.md` asks a Session to search it. The judgement stayed in the document; the
listing became [`drive-files.txt`](./drive-files.txt), generated by `tools/dutch/drive-files.mjs` and
**searched, never read whole**.

Generating it made it complete — the hand-written version collapsed every transcript into *"plus N machine
transcripts"*, so a grep for a transcript's name found nothing — and made it re-derivable, so nobody keeps it
true by hand.

**The rule generalises**: a file that outgrows the agent stops being read and starts being queried. The
signal is its size in tokens, not its role.
