/**
 * Chapter 4, slide 4 — roll back. The chapter's second and last widget.
 *
 * ⚠ REBUILT FROM SCRATCH (Atil, 2026-08-26, grilling session). The slide used
 * to be a PRESENTER-DRIVEN two-way fork: one transcript pane, `c` to correct,
 * `x` to restore, `r` to reset. That is gone. Do not restore it, and do not
 * restore the decisions that only made sense inside it (the turn counter, the
 * affordance chips drawn on the wrong turn, the vocabulary row, the two-button
 * choice). The reasons are recorded below, per element.
 *
 * WHAT IT IS NOW: one session tree. A single trunk, and under it two ALTERNATIVE
 * WORLDS that both hang off the same checkpoint —
 *
 *   world A — the model gets one turn wrong
 *       case 1  Correct it              the wrong move
 *       case 2  Edit / Restore          the right move for a wrong turn
 *   world B — the work splits into parallel paths
 *       case 3  Fork Conversation       the right move for parallel work
 *
 * Case 2 and case 3 are NOT ranked against each other. They answer different
 * questions: you edit or restore when you want to REWRITE THE STORY, you fork
 * when you want to WALK SEVERAL PATHS at once. Case 1 remains the wrong move,
 * and it is the only one the room does by instinct — which is why it is drawn
 * next to case 2, in the same half, at the same size.
 *
 * WHAT THIS SLIDE IS FOR, per the spine grilling (#54): the room's default move
 * when an agent goes wrong is to argue with it, and that is the expensive one.
 * The slide contradicts what everyone in the room actually does — which is why
 * it is a full slide and not a bullet in a cluster.
 *
 * IT IS NO LONGER PRESENTER-DRIVEN. Two right-arrow presses:
 *
 *   1  world A opens — both cases at once, side by side
 *   2  world B opens
 *
 * Case 1 and case 2 arrive TOGETHER (Atil, 2026-08-26). Revealing the repair
 * a press after the instinct made the room wait for a punchline it could
 * already guess; landing both at once turns the press into a comparison, and
 * the presenter walks it left to right by voice.
 *
 * No keys, no buttons, no reset handler. The whole tree is in the markup and
 * reveal's fragments do the rest, so nothing here holds state and entering the
 * slide from either direction cannot land it in a wrong one.
 *
 * ── SIX THINGS HERE ARE DECISIONS, NOT TEXT. Do not tune them away ──
 *
 * 1. NO MONEY ANYWHERE ON THIS SLIDE. Research #48 §6: the wrong turn re-read
 *    at the cached rate costs cents, so a euro figure is off by orders of
 *    magnitude AND duplicates the cache slide's job. The argument for going
 *    back is QUALITY. The old per-turn counter is CUT for the same reason it
 *    was never money — with three columns there is no single number to count,
 *    and the card count already reads at a glance.
 * 2. THE RED PATH NEVER GETS MONOTONICALLY WORSE. Laban et al.'s −39% decomposes
 *    into −16% aptitude and +112% unreliability: the loss is predictability, not
 *    brainpower. Some corrected runs land and you cannot tell which. So case 1
 *    accumulates turns and never draws a score, a percentage or a downhill line.
 *    "The odds get much worse" — never "it can't recover".
 * 3. CASE 2 IS A BETTER BRIEF, NOT THE SAME PROMPT. T4′ carries the two
 *    constraints the room can see were missing from T4, and it is badged as
 *    such. Both vendors and the paper agree the new brief has to be more
 *    COMPLETE, not just fresher — a widget that replays T4 verbatim teaches the
 *    wrong move (#48 §5.5).
 * 4. EACH CASE ENDS DIFFERENTLY, AND CASE 3 ENDS THE OTHER WAY. Case 1: nothing
 *    leaves. Case 2: T4 and everything after it is REMOVED from the session —
 *    the crux (#48 §3), documented in four first-party texts. Case 3: nothing is
 *    removed either, because a fork COPIES the trunk and keeps the old session
 *    alive. Drawing all three the same way would teach a wrong fact about forks.
 * 5. THE MISTAKE IN WORLD A IS A SINGLE REQUEST GONE WRONG, never an overloaded
 *    one. If the model failed because it was asked for three things at once,
 *    then case 2 and case 3 collapse into the same lesson and the slide says one
 *    thing twice. "make it shorter" is one request; the model cutting the risk
 *    section is its call, not the brief's fault.
 * 6. THE VENDORS' OWN WORDS ARRIVE AT THE SPLITS, not in a closing row. The
 *    room reads `Restore Checkpoint` and `Fork Conversation` at the moment the
 *    tree does that thing, so the name explains itself. All of them are verbatim
 *    first-party (#48 §2). `/prune` does not exist — the word is `/compact`
 *    (#45) — and no Cursor / Windsurf vocabulary appears here.
 */

export const EYEBROW = "Go back rather than argue";
export const HEADLINE = ["Don't correct", "restore / edit / fork"];

/** The one line of prose on the slide (Atil's words). It OPENS — it sits under
 *  the headline and above the trunk (Atil, 2026-08-26), so the room reads the
 *  instruction first and then watches three trees obey it. It is not a payoff
 *  and it must not be moved to the foot.
 *
 *  It replaces three cut elements: the published-threshold line, the
 *  terminal-side-effects line and the vocabulary row. It has to fit ALL THREE
 *  cases, and it must never read as "never correct it" — both vendors publish
 *  the opposite advice, and somebody in the room can quote it back. The
 *  threshold and the side effects live in the presenter note now. */
export const OPEN_LINE = "Don't pollute the context — keep the session clean.";

/** the rule that names T2 — the point both worlds hang off */
export const CHECKPOINT = "last known good";

export interface Turn {
  /** T1, T4, T4′ … — the label the vendors' own UI shows */
  id: string;
  who: "you" | "model";
  /** one line, read in a glance. NO code and no diffs: the room must read a
   *  card and then look back at the presenter (Atil, on the prototype). Nine
   *  words is the ceiling — the cards are half-width now. */
  text: string;
  mark?: "ok" | "bad";
  /** small tag under the card. Only case 2's rewritten prompt carries one. */
  badge?: string;
}

/* ══ THE SESSION ═══════════════════════════════════════════════════════════
 *
 * Deliberately NOT code (Atil, 2026-08-26). The old session was a retry loop on
 * an upload, and it made the room's engineers read a diff while everybody else
 * waited. A report summary is work every seat in the room has done, the mistake
 * is visible without any domain knowledge, and the three audiences make forking
 * obviously right rather than merely available.
 *
 * The mistake is PLAUSIBLY wrong, not stupidly wrong; a stupid mistake lets the
 * room off the hook, because nobody believes they would argue with it.
 */

/** The trunk. T2 is the checkpoint BOTH worlds hang off.
 *
 *  TWO TURNS, NOT THREE (Atil, 2026-08-26). A third turn — "good, keep this" —
 *  said nothing the checkpoint rule under it does not already say, and it cost
 *  a card in the one place the tree is narrowest. */
export const TRUNK: Turn[] = [
  { id: "T1", who: "you", text: "summarize this 40-page supplier report" },
  { id: "T2", who: "model", text: "draft summary", mark: "ok" },
];

export interface World {
  /** what just happened, in the room's own words */
  label: string;
  turns: Turn[];
}

/** WORLD A — one turn goes wrong. One request, one wrong answer (decision 5). */
export const WORLD_A: World = {
  label: "the model gets one turn wrong",
  turns: [
    { id: "T4", who: "you", text: "make it shorter" },
    { id: "T4", who: "model", text: "cut the risk section", mark: "bad" },
  ],
};

/** WORLD B — the same checkpoint, and the work ahead splits three ways. */
export const WORLD_B: World = {
  label: "the work splits into parallel paths",
  turns: [
    { id: "T4", who: "you", text: "three audiences need this" },
  ],
};

export interface Case {
  /** the vendors' own name for the move, or what the room calls it */
  move: string;
  /** where it lives in their editor */
  where: string;
  /** what it does to the turns — different for every case (decision 4) */
  effect: string;
  turns: Turn[];
  /** what the room should take away, one line */
  note: string;
}

/** CASE 1 — the wrong move, and the only one the room does by instinct. Two
 *  corrections, not one: one correction looks like bad luck, two looks like a
 *  pattern. A third would say "keep arguing", which Anthropic's published
 *  threshold forbids — the threshold itself is spoken, not shown. */
export const CASE_CORRECT: Case = {
  move: "Correct it",
  where: "you just type the next turn",
  effect: "Nothing leaves. Every turn stays in the window.",
  turns: [
    { id: "T5", who: "you", text: "no — keep the risk section" },
    { id: "T5", who: "model", text: "risks are back, now three pages", mark: "bad" },
    { id: "T6", who: "you", text: "one page" },
    { id: "T6", who: "model", text: "one page — the dates are gone", mark: "bad" },
  ],
  note: "Your corrections and its wrong answers are all in the window.",
};

/** CASE 2 — rewrite the story. The crux (decision 4) and a better brief
 *  (decision 3). Both vendor names sit here because they do the same thing to
 *  the session; only the gesture differs. */
export const CASE_BACK: Case = {
  move: "Edit a previous request · Restore Checkpoint",
  where: "click the bubble · hover a request",
  effect: "T4 and everything after it: removed from the session.",
  turns: [
    {
      id: "T4′",
      who: "you",
      text: "one page. keep the risks and the dates.",
      badge: "same goal, better brief",
    },
    { id: "T4′", who: "model", text: "one page, risks and dates kept", mark: "ok" },
  ],
  note: "Same checkpoint. A better brief. Nothing to argue with.",
};

/** CASE 3 — walk several paths. The one case where NOTHING is removed. Three
 *  thin stubs, not three transcripts: the lesson is isolation, not content. */
export const CASE_FORK: Case = {
  move: "Fork Conversation",
  where: "keeps the old session alive",
  effect: "T1–T2 copied into three sessions. Nothing is removed.",
  turns: [],
  note: "None of them sees the others' turns.",
};

/** the three forked sessions — a name and a tick, nothing else */
export const FORK_BRANCHES = ["exec", "engineering", "supplier"];
