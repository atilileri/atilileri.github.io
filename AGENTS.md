# AGENTS.md

## Answering

Write all chat answers in ASD-STE100 Simplified Technical English. Code, commit messages, and file content keep their own conventions. When you refer to tickets, give context a bit, explain what you refer to. I might not be aware of their content, especially research results.

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues (via the `gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Default canonical labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context (`CONTEXT.md` + `docs/adr/` at repo root). See `docs/agents/domain.md`.
