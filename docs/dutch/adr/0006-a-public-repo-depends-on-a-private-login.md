# A public repo depends on a login it can never hold

Everything in this journey is public. The lessons, the Profile, the progress — a stranger reads all of it.
[#130](https://github.com/atilileri/atilileri.github.io/issues/130) then made this system depend on **two
credentials that can never be committed**: an rclone token for Google Drive, and a browser login state for the
Oracle. So the repo is complete and public, and yet nobody else can run it end to end.

That is the trade-off. It was made deliberately, and this file says why.

## The alternative we rejected

[#129](https://github.com/atilileri/atilileri.github.io/issues/129) measured a keyless world and it is real.
Dutch speech synthesis, transcription at 96.1% word recovery, PDF text, OCR and Mermaid diagrams all run on
this machine with no key, no account and no network. A system built only on those is fully reproducible: clone
the repo, run `setup.sh`, and everything works.

We gave that up for two things a keyless system cannot have.

**The material.** 8.18 GiB of it sits in Drive, including the complete published *openbaar examen* set for
2023 to 2025 and the only surviving copy of 87 *Een Beetje Nederlands* transcripts. It cannot be committed —
[#89](https://github.com/atilileri/atilileri.github.io/issues/89) ruled there is no fifth home inside the repo
— and a phone can add to Drive, which is how the journey actually collects things.

**The Oracle.** The books live there, per [#94](https://github.com/atilileri/atilileri.github.io/issues/94),
and there is no other route to them. #129 found the consumer API gone and the podcast route deprecated, so a
logged-in browser is the only door. The user chose to open it.

> **Corrected by [#134](https://github.com/atilileri/atilileri.github.io/issues/134), 2026-09-06.** The door
> needs a browser exactly once. `notebooklm-py`'s master token mints its own cookies afterwards, so the
> running system needs no browser at all — this machine has none. The credential is still uncommittable, so
> this ADR's trade-off stands unchanged; only the mechanism is different, and it is milder than described.

## Why this does not break the publicness lock

The lock is about **artifacts**, not about access. A credential is not an artifact: it produces nothing that
is hidden. Everything this system writes for the learner is still committed and still public.

Two rules hold the line, and both are in [`AUTOMATION.md`](../AUTOMATION.md):

**Every capability that needs a credential must degrade.** With no credential the Session still runs, and
Docent names the missing capability in the Session record rather than failing. So the repo is not a broken
program for a stranger — it is a working program with fewer sources.

**Reading is free; every write that leaves the machine is gated.** The credentials buy reach, never silent
publication. A Drive write, a commit and a push each wait for the human, which is the general form of the rule
[#83](https://github.com/atilileri/atilileri.github.io/issues/83) set for the Profile.

## What we accept, and how we would back out

**Browser automation is fragile and it is somebody else's UI.** A page changes and the script breaks with no
warning. We accept that at exactly two named targets, listed in `AUTOMATION.md` and extended only by a human.
The fallback already exists and has been used: the human opens the browser and drops the result in Drive,
which is how 48 exam papers arrived.

**A login expires.** The script stops and asks for one action. It never handles a password, so the worst
outcome is a Session that teaches with one source fewer.

If the Oracle proves not worth its fragility, the exit is cheap: remove its row from the allowlist and delete
`~/.config/docent/`. The Drive dependency is the harder one to unwind, because it holds material that exists
nowhere else — which is the real reason this decision is recorded rather than assumed.
