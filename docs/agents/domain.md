# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root, or
- **`CONTEXT-MAP.md`** at the repo root if it exists — it points at one `CONTEXT.md` per context. Read each one relevant to the topic.
- **`docs/adr/`** — read ADRs that touch the area you're about to work in. In multi-context repos, also check `docs/<context>/adr/` for context-scoped decisions.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

Single-context repo (most repos):

```
/
├── CONTEXT.md
├── docs/adr/
│   ├── 0001-event-sourced-orders.md
│   └── 0002-postgres-for-write-model.md
└── src/
```

Multi-context repo (presence of `CONTEXT-MAP.md` at the root) — **this repo**:

```
/
├── CONTEXT-MAP.md                     ← the index; read it first
├── docs/
│   ├── adr/                           ← system-wide decisions
│   ├── asml-ai/
│   │   ├── CONTEXT.md                 ← context-specific glossary
│   │   └── adr/                       ← context-specific decisions
│   └── dutch/
│       ├── CONTEXT.md
│       └── adr/
└── src/
```

Contexts here live under `docs/<context>/`. `src/` is the Astro app, and several
contexts (the Dutch learning journey among them) span the app, the skills, and the
docs rather than sitting inside one source directory. Follow `CONTEXT-MAP.md` rather
than guessing a path.

A decision is context-scoped when only that context's vocabulary is needed to
understand it; put those in `docs/<context>/adr/`. Anything that binds two contexts,
or the site as a whole, belongs in the root `docs/adr/`. Both directories are created
lazily — none exists until a decision actually earns one.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders) — but worth reopening because…_
