# Intervals ramp, then hold — against the research this map cites

[#78](https://github.com/atilileri/atilileri.github.io/issues/78) read
[Karpicke & Roediger (2007)](https://learninglab.psych.purdue.edu/downloads/2007/2007_Karpicke_Roediger_JEPLMC.pdf)
and gave this map a flat instruction: **do not port expanding intervals.** Expanding retrieval won at ten
minutes and lost at two days, because what does the work is making the *first* retrieval hard, which an
expanding schedule specifically avoids. #78 asked for equal intervals parameterised by a horizon, and graded
"expanding intervals (SM-2 style)" as **D — do not port**.

**We grow the gaps anyway, for four rungs, and then hold them flat.** The user made this call in
[#100](https://github.com/atilileri/atilileri.github.io/issues/100) after reading the finding.

## Why this is not the thing the paper rejected

Karpicke & Roediger compared a schedule that expands for ever against a schedule that never expands. Ours is
neither. The gaps rise for four rungs and then stop, so every later ask sits at a fixed interval — the equal
condition the paper favours, entered from below rather than from the first day.

The paper's mechanism survives, which is the part that matters. Its finding is that an easy first retrieval
teaches nothing. Anki starts a new word at **one day**. We start it at **H/64** — three days at today's
horizon — and the learner has already answered it inside the Session that taught it. The first ask is work.

## What we give up

Rungs 1 to 3 are, strictly, expanding intervals, and the evidence does not support them. If the learner's
retention proves worse than expected, the cheapest correction is to flatten the ramp: set rungs 1 to 4 all to
`H/8` and the ladder becomes exactly what #78 asked for, with no change to the stored state. That is the
reason [#100](https://github.com/atilileri/atilileri.github.io/issues/100) stores the **rung**, not the due
date — the ladder is a function, and replacing the function reschedules the whole inventory without touching
a row.

## The horizon is a real input, not a decoration

Cepeda et al. (2008) found the best gap is a fraction of the delay you are studying for — about 20% for a few
weeks, falling to about 5% at a year. So a schedule with no horizon is a schedule tuned for nothing. There is
no exam date, so `PLAN.md` carries a declared one — `2027-03-31` as of 2026-09-05, explicitly temporary. Every
gap below rung 5 is derived from it, so booking a real exam retunes the whole inventory with one edit.

Rung 5 is deliberately **not** derived. It is a confirmation that a word is still held, not an attempt to
learn it, so it has no reason to chase an exam date.
