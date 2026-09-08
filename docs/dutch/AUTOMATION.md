# The automation boundary

What a script in this journey may reach, where its credentials live, and what it does when a route fails.
Locked by [#130](https://github.com/atilileri/atilileri.github.io/issues/130).

**This file records choice, not capability.** What the agent *can* read is
[`READING-MATERIAL.md`](./READING-MATERIAL.md). Where the material lives is [`MATERIAL.md`](./MATERIAL.md).
This file says what Docent is *allowed* to do, and it binds every Session.

## Where a script runs

**On the laptop, inside a Session.** GitHub Actions builds and deploys the site and holds no secret. Nothing
in this journey runs in CI, because CI would need a credential in a place a fork's pull request can probe.

**The agent has agency.** Docent runs the scripts itself, asks the Oracle itself, and reports the results. It
does not ask permission to read. The human steps in for a setup, a fix, or a login — and only when the agent
asks for one named action.

## Named targets

A script reaches a third party's website **only** if that site has a row here. The list is closed. **A human
adds a row; the agent never does.** Each target costs maintenance, because a page changes without warning, so
the list grows on evidence that a Session needs it.

| Target | What a script takes | Route | Added |
| --- | --- | --- | --- |
| The Oracle (the user's Gemini Notebook) | Answers to curriculum questions | Browser automation, logged in | 2026-09-05 |
| `nos.nl` | The text of one named article | `fetch` plus Readability | 2026-09-05 |
| `commons.wikimedia.org` | Whether a word has a human recording, and its licence | MediaWiki API, no key | 2026-09-08 |
| `nl.wiktionary.org` | The IPA transcription of a word | MediaWiki API, no key | 2026-09-08 |

**Fetch on demand, one page at a time. Never crawl.** The agent takes the article a Session points at and
nothing more. When the journey needs a whole corpus of a site, the human puts it in Drive by hand — the way
the DUO exam papers arrived.

Two targets were considered and left off, and the reason is recorded so they are not re-argued: YouTube
transcripts and the DPG news sites (`nu.nl`, Volkskrant) wait until
[#135](https://github.com/atilileri/atilileri.github.io/issues/135) shows a Session that needs them.

## Machine credentials

A credential lives on this machine and **never in this repo**. It is not an artifact, so the publicness lock
does not reach it — but the lock still binds what it unlocks: nothing a credential produces may be secret.

| Credential | Path | What it opens |
| --- | --- | --- |
| rclone token | `~/.config/rclone/rclone.conf` | Google Drive, read (`gdrive`) and write (`gdrive-rw`) |
| Oracle login state | `~/.config/docent/` | The Oracle's browser session |

**Every capability that needs a credential must degrade.** With no credential the Session still runs. Docent
names the missing capability in the Session record and teaches anyway.

**A password never enters this system.** When the Oracle's login state expires, the script stops and asks the
human to log in by hand and save the state again. It never prompts for a password and never stores one.

## No paid service

Nothing in this journey calls a paid API, and nothing calls a free tier whose terms let a human read the
input — that clause lands on the [Profile](./PROFILE.md). Everything runs local and keyless: transcription,
Dutch speech synthesis, PDF text, OCR, `ffmpeg`, Mermaid. A later ticket may reopen this with a named cost and
a named need.

## The write gate

**Reading is free. Every write that leaves the machine is gated.**

Free, with no confirmation:

- Reading any named target, Drive, or a local file.
- Converting media, transcribing audio, extracting PDF text.
- Writing to a scratch directory outside the repo.

Gated — the agent proposes, the human confirms, and only then does it run:

- **A Drive write.** Use `gdrive-rw`, named on the command so a write is always deliberate. Confirm each
  batch. Never `delete`, never `sync`. A converted copy and a transcript of third-party audio land beside the
  original, sharing its stem, per the naming rule in [`MATERIAL.md`](./MATERIAL.md).
- **A git commit.**
- **A git push.**

One thing is a write that leaves the machine and is **not** gated, because it publishes nothing about the
learner: **Docent's own comments on its own queues.** The `read` note it leaves on a `docent:intake` issue so a
later Session need not re-read the media, and the closing comment on an issue the learner has already agreed to
close, are bookkeeping on a queue the agent owns. Gating them would put a confirmation prompt in front of every
preflight. Everything that touches a learner artifact still passes the gate above — including the act of
closing an intake issue, which the learner confirms, per
[#121](https://github.com/atilileri/atilileri.github.io/issues/121).

The gate is publication, not the tool. This is the general form of the propose-then-confirm rule that
[#83](https://github.com/atilileri/atilileri.github.io/issues/83) set for the Profile and the Scenarios: a
silent write to a public place is a publication.

## Where the material lives

**Drive is the master. The laptop keeps no mirror.** The agent reads Drive read-only and copies a file into a
scratch directory for as long as it works on it. Third-party text — an extracted article, a transcript of
someone else's audio — goes to Drive, not to this repo. Only what this journey writes itself is committed.

## Where a script lives

- **A script that reads or converts material is a repo tool**, at [`tools/media/`](../../tools/media/). It
  serves anyone, it is committed and public, and `setup.sh` reproduces it.
- **A script that enriches the Item inventory is a repo tool too**, at [`tools/dutch/`](../../tools/dutch/).
  [`pronounce.mjs`](../../tools/dutch/pronounce.mjs) fills the word audio and IPA fields; Docent runs it at the
  end of a Session. Rules and usage: [`PRONUNCIATION.md`](./PRONUNCIATION.md).
- **A script that decides something about teaching belongs to `docent`.** Asking the Oracle a curriculum
  question is a teaching act, so the Oracle driver lives with the skill.

## When a route fails

Docent never refuses to teach. A route that fails **degrades to a stated limitation, and the Lesson still
ships.**

1. The Session record names, in one line, what it could not reach.
2. Nothing retries by itself, and nothing waits.
3. If a human action would fix it — a login, an install, a file to upload — Docent asks for that one action
   and moves on.

This extends the rule from [#100](https://github.com/atilileri/atilileri.github.io/issues/100), which already
forbade Docent to skip a Lesson when the review budget ran over.
