# 0014 — The inventory is never read, only queried

**Status**: accepted, 2026-09-23
**Decided by**: [#152](https://github.com/atilileri/atilileri.github.io/issues/152)

## The problem

A Session reviews about **50 Items**. [#100](https://github.com/atilileri/atilileri.github.io/issues/100)
computed that holding B1 needs an inventory of **1,600–2,600 Items**, and
[#82](https://github.com/atilileri/atilileri.github.io/issues/82) locked that every Item lives in **one
central inventory**, referenced by id and never embedded.

An Item is not a token pair. It carries Turkish prose — a Bridge, a Hook, a Split with its parts, its literal
sum, its `Neden?` and `Yazım` lines. At a conservative 130 tokens per Item, **2,000 Items is about 260,000
tokens in one file**.

Docent cannot open that file. Neither can the agent that maintains it.

This was invisible for the whole map because the file does not exist yet. #100 split the inventory in two —
content and churn — which made the *schedule* stay small and said nothing about how the fifty Items' content
comes back. [#151](https://github.com/atilileri/atilileri.github.io/issues/151) found the hole.

## The decision

**Docent never opens the inventory. It runs a script and reads the output.**

One file, `docs/dutch/items.yml`. A committed program, `tools/dutch/items.mjs`, holds every read and every
write. `items.mjs due` prints the queue; `items.mjs get <id>` prints a whole Item. Fifty Items arrive as a few
thousand tokens instead of a quarter of a million.

The rule is absolute in both directions. Docent does not read the file, and **Docent does not edit it by
hand** — a blind edit to a file larger than the agent is the one operation that can silently destroy the
inventory, and nothing else prevents it.

## Why not the alternatives

- **Read it whole.** Works to about 300 Items, which is four months in, and fails without warning.
- **Shard the inventory** — by letter, by Tier, by thousand. Astro's `file()` loader throws
  `FileGlobNotSupported` on any path holding a `*` (`astro/dist/content/loaders/file.js`, Astro 6.1.5), so
  sharding breaks [#88](https://github.com/atilileri/atilileri.github.io/issues/88)'s route to the site. It
  also buys a smaller read that the script already gives.
- **One file per Item.** Turns a Session's single commit
  ([#99](https://github.com/atilileri/atilileri.github.io/issues/99)) into sixty file writes, and adds a home
  the publicness rule (`MATERIAL.md:36`) did not ask for.

## The cost, stated

**This is indirection, and a future reader will want to remove it.** The inventory will look like an ordinary
YAML file that anything could open, and the script will look like a layer between an agent and a file it can
plainly read. That reader will be right about every file they have ever seen and wrong about this one.

That is why this ADR exists rather than a line in a document. **Reopening it needs the file to be small
enough to read** — not a tidier design, not a better YAML library. Measure the file first.

## What follows

- The same shape fixed `DRIVE-INVENTORY.md`: the judgement stays in a document a human reads, and the 1,418
  lines of machine output became `drive-files.txt`, searched and never read whole.
- The rule generalises, and is worth stating once: **a file that outgrows the agent stops being read and
  starts being queried.** The signal is the file's size in tokens, not its role.

Details — the id rule, the YAML shape, the script's commands, the write rule — are
[`INVENTORY.md`](../INVENTORY.md).
