# Plan format

`docs/dutch/plan.yml` is the route to the exam and the position on it. It decides *what* a Session teaches; the Theme, the Intakes and the Oracle only shape *how*. The site reads the same file for its progress panel, so keep it valid YAML.

```yaml
horizon: "2027-03-31"
objectives:
  - id: LEB1-1a
    skill: lezen
    tier: exam
    status: active
    text: Kan persoonlijke brieven, e-mails en vormen van sociale media voldoende begrijpen om met iemand te kunnen corresponderen.
    angles:
      - "lexicon: cancelling and swapping places"
    sessions:
      - 2026-10-21-padel-app
```

## Fields

| Field | Holds |
| --- | --- |
| `horizon` | The date the learner studies toward. It sets every review gap, so change it only on the learner's word. Always a real date. |
| `id` | The Taalprofielen descriptor id (`LEB1-1a`, `SCHB2-3b`), or `KNM-<theme>.<n>.<n>` for a KNM eindterm. |
| `skill` | `lezen`, `schrijven`, `knm`, `luisteren`, `spreken` or `gesprekken`. |
| `tier` | `exam` (B1), `stretch` (B2) or `knm`. |
| `status` | `todo`, `active`, `done` or `unsupported`. |
| `theme` | KNM only: the syllabus theme the eindterm belongs to. |
| `text` | The descriptor, whole and in Dutch. Never cut it into smaller Objectives. |
| `angles` | Each Angle a Session spent on it, in English, appended. Absent until the first. |
| `sessions` | The id of each Session that worked it, appended. Absent until the first. |

**The order of the list is the route.** The next Objective of a skill is the first `todo` one below it. Moving a line re-orders the route.

## What Docent changes

- **After a Session**, append its Angle to `angles` and its id to `sessions` on the Objective it worked.
- **`done` only on the learner's word.** An Objective stays `active` across five or more Sessions. When the learner says it is held, mark it `done` and make the next `todo` Objective of the same skill `active`.
- **One `active` Objective per skill**, at most. Only `lezen`, `schrijven` and `knm` are taught.
- **`unsupported` is never selected.** Listening, speaking and conversation sit in the Plan so the gap stays visible; the Episode gives listening practice but moves no `luisteren` Objective.
- **Choose an Angle in its order** — lexicon first, then the same lexicon across Themes, then rising difficulty toward the Tier — reading the `angles` already spent.
