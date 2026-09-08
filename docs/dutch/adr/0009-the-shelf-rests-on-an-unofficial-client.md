# The shelf rests on an unofficial client

The Oracle holds the books, the exam papers and the whole listening corpus, and nothing else in this
journey can reach them. [#134](https://github.com/atilileri/atilileri.github.io/issues/134) decided to
reach it through **`notebooklm-py`, a third-party client that drives Google's undocumented internal
endpoints and holds a full-account master token**. Google publishes no supported route a private person
can take, so the choice was this client or no Oracle.

That is the trade-off. It was made deliberately, and this file says why.

## What we are actually depending on

Three properties, each uncomfortable on its own.

- **The protocol is undocumented and unsupported.** The client's own warning is plain: *"This talks to
  Gemini Notebook's internal RPC endpoints, which can change without notice."* Google owes us no
  stability and no notice.
- **The credential is powerful.** It is not a scoped API key. It is a durable Google master token that
  mints session cookies on demand, and it opens the account, not just the notebooks. It lives at
  `~/.notebooklm/profiles/default/` and is never committed.
- **Using it may cost the account.** Automating a consumer product against its terms is the kind of thing
  Google suspends accounts for. The material sits in that same account's Drive.

## The alternatives we rejected

**The official API.** It exists, under Google Cloud, and its documented prerequisite is *"Get licenses for
Gemini Notebook Enterprise"*. No per-seat price is published; pricing is a sales conversation.
[#130](https://github.com/atilileri/atilileri.github.io/issues/130) forbids a paid service, and an
enterprise licence for one learner is absurd besides.

**The Podcast API**, the one documented route needing no enterprise licence, is marked *"Deprecated. Google
isn't allowlisting new customers."* It was closed before we arrived.

**Hand-rolled browser automation**, which [#129](https://github.com/atilileri/atilileri.github.io/issues/129)
assumed was the only door, is *more* fragile, not less. It depends on the same endpoints plus a rendered
interface, it needs a browser running for every call on a machine that has none, and it would be ours to
repair alone.

**A separate Google account** buys less than it looks. The material lives in the learner's own Drive, so a
second account would have to be granted access to all of it, which reproduces the exposure it was meant to
contain.

**No Oracle at all** was weighed and lost. A repo-local index cannot hold the books, because
[#94](https://github.com/atilileri/atilileri.github.io/issues/94) keeps purchased material out of the repo.
A long-context call over the same corpus could, but only by making the local copy #94 exists to avoid. And
neither can search 74 hours of audio, which this route does in under four seconds because Google has already
transcribed it.

## What makes it survivable

**The dependency is thin.** Docent decides which notebook to ask and what to do with the answer. The client
does the talking. Replacing it means replacing a caller of `search` and `ask`, not rewriting the skill.

**Nothing is stored only in the Oracle.** Drive is the master
([`MATERIAL.md`](../MATERIAL.md)). A dead client costs access, never material.

**Failure is already specified.** [`AUTOMATION.md`](../AUTOMATION.md) binds every Named target: the Session
still teaches, Docent names in one line what it could not reach, and nothing retries by itself. So the
system degrades on the day this breaks rather than stopping.

**We chose the maintained one.** The npm alternative was better designed for an agent to drive and had **1
star, 92 downloads a month, and no commit since July**. `notebooklm-py` had 19,179 stars and a push the same
day. Both would have held the same credential; only one had anyone watching it.

## Consequences

- **The version is pinned, and an upgrade is a deliberate act.** A client that mints Google credentials is
  not something to float on `latest`.
- **A `notebooklm-py` release may break a Session without warning**, and that is expected rather than
  exceptional. The degrade rule is what makes it tolerable.
- **The learner carries the account risk knowingly.** They own the material, the account and the
  compliance — the same division #94 set for licences.
- **Reopening this needs a supported route, not a better client.** If Google ever ships a consumer API,
  this decision should be revisited on that day. Nothing else changes it.
