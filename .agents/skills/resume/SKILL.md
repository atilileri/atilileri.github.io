---
name: resume
description: The connection dropped mid-work — pick it back up with zero gaps.
disable-model-invocation: true
---

The connection dropped (ssh disconnect, or the hourly quota ran out) and your last message was cut short. Continue exactly where you left off.

Backtrack slightly first. Repeat the last fully completed thought, step, or code block from your previous message, then resume generating seamlessly from there.

If your last action was a tool call, check whether it landed before you repeat it: read the file, run `git diff`, or re-run the query. A half-applied edit is the usual damage from a drop.

Prioritise absolute completeness over token efficiency. Carry every intermediate step in full, and keep going until the whole task is done — not only the interrupted message.
