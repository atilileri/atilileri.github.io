# AGENTS.md

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues (via the `gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Default canonical labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context. `CONTEXT-MAP.md` at the repo root is the index — read it first; it points at one `CONTEXT.md` per context, each under `docs/<context>/`. ADRs are scoped the same way: `docs/adr/` for decisions that bind the whole site, `docs/<context>/adr/` for ones only that context's vocabulary explains. All of these are created lazily. See `docs/agents/domain.md`.
