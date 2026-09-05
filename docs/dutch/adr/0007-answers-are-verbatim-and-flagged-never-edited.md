# An answer is published verbatim, and flagged rather than edited

[#99](https://github.com/atilileri/atilileri.github.io/issues/99) locked how a Session records what the
learner answered. Two rules from this map pull against each other at that exact point.

**Everything is public.** A Session is committed and pushed, so every answer the learner types is published,
including the wrong ones and the half-finished ones.

**[#83](https://github.com/atilileri/atilileri.github.io/issues/83) forbids naming a private individual**, and
bans health, employer-confidential and immigration detail. That rule was written for the Profile, a file the
learner and the agent compose together. An answer is different: it is written in one pass, on a phone, at a
bus stop, about whatever the Prompt asked.

A *Schrijven* Prompt says "write four sentences about your week". The honest answer names a partner, a doctor,
or a colleague. The publicness lock then publishes it.

**The rule: Docent stores the answer exactly as it was typed, and never rewrites it. When an answer trips the
exclusion list, Docent stops and asks the learner, who keeps it, rewords it, or drops the Prompt.**

## Why verbatim, and not cleaned

The answer is the only evidence of the learner's Dutch that this system holds. A misspelling is the finding —
it is what separates a `close` Verdict from a `correct` one, and it is what a later Session needs to see. An
agent that tidies spelling before storing destroys the measurement it was taking, and does so invisibly,
because the tidy version reads as if the learner wrote it.

## Why asking, and not redacting

Silent redaction has the same defect in the other direction. A file that reads as the learner's own words, and
is not, is worse than a gap. It also makes the agent the judge of what is private about a life it only reads
about in a Profile.

Asking costs one turn, and the learner already sits in that turn — Docent grades the answers in conversation.
It is the same shape as the propose-then-confirm rule [#83](https://github.com/atilileri/atilileri.github.io/issues/83)
set for the Profile, and the human gate that
[#130](https://github.com/atilileri/atilileri.github.io/issues/130) put in front of every write that leaves
the machine.

## What we accept

**A flagged answer interrupts the flow.** The learner wanted a grade and got a privacy question. We accept
that, because the alternative is publishing a name once and finding out later.

**The list is a heuristic and it will miss things.** Docent detects a named person or a health detail by
reading, not by matching a rule, so it will let some through and stop on some that are fine. The learner is
the final gate either way — nothing is pushed without them.

**Deleting later does not unpublish.** The repo is public and cloned, so an answer that goes out is out. That
is the reason the gate is before the commit rather than after it.

## How we would back out

If flagging proves too noisy, the cheap correction is to narrow it to `open` Prompts only. An `item` Prompt
answer is a word or a short phrase and can barely carry a private detail; the whole risk lives in free text.
Nothing stored changes — the record is verbatim either way.
