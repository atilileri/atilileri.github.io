/**
 * Chapter 4, slide 4 — roll back. The chapter's second and last widget.
 *
 * Settled by the prototype ticket (#53): three mechanics were built and walked
 * — a two-column fork, a twelve-run variance field, and this, the transcript.
 * The full set is on branch `prototype/roll-back`; read it before relitigating
 * a choice here. Atil's verdict, in one line: **the pane is the button.**
 *
 * WHAT THIS SLIDE IS FOR, per the spine grilling (#54): the room's default move
 * when an agent goes wrong is to argue with it, and that is the expensive one.
 * The slide contradicts what everyone in the room actually does — which is why
 * it is a full screen and not a bullet in a cluster.
 *
 * THE ARGUMENT IT MAKES: the wrong turn does not leave when you correct it. It
 * stays in the window, and now your correction is in there arguing with it. The
 * cheap move is to drop the turn and prepare a better one.
 *
 * IT IS PRESENTER-DRIVEN, and that is the one structural difference from every
 * other widget in this deck. The fork is two real buttons and the presenter
 * picks, so the room watches the choice being made rather than a film of it:
 *
 *   c  Correct it        — press it twice; the second press surfaces the rule
 *   x  Restore Checkpoint
 *   r  reset to the fork — so both paths can be walked, in either order
 *
 * NOT `g` — reveal 5 binds that to jump-to-slide and it opened its jump box
 * over the headline the first time this was walked. Also taken: b / . pause,
 * f fullscreen, s notes, o overview.
 *
 * ── FIVE THINGS HERE ARE DECISIONS, NOT COPY. Do not tune them away ──
 *
 * 1. NO MONEY ANYWHERE ON THIS SLIDE. Research #48 §6: the wrong turn re-read
 *    at the cached rate costs cents, so a euro figure is off by orders of
 *    magnitude AND duplicates the cache slide's job one screen earlier. The
 *    argument for rolling back is QUALITY. The counter above the pane is a
 *    count of TURNS, never credits. The one economic fact that belongs here is
 *    the reverse — rolling back keeps the cached prefix, `/clear` throws it away
 *    — and it is spoken over the pane, not shown.
 * 2. THE RED PATH NEVER GETS MONOTONICALLY WORSE. Laban et al.'s −39% decomposes
 *    into −16% aptitude and +112% unreliability: the loss is predictability, not
 *    brainpower. Some corrected runs land and you cannot tell which. So the red
 *    path accumulates turns and never draws a score, a percentage or a downhill
 *    line. "The odds get much worse" — never "it can't recover".
 * 3. THE GREEN PATH IS A BETTER PROMPT, NOT THE SAME PROMPT. T4′ carries the two
 *    constraints the room can see were missing from T4. Both vendors and the
 *    paper agree the new brief has to be more COMPLETE, not just fresher — a
 *    widget that replays T4 verbatim teaches the wrong move (#48 §5.5).
 * 4. THE WRONG TURNS PHYSICALLY LEAVE THE PANE. They do not grey out. That is
 *    the crux (#48 §3) and it is documented in four first-party texts: editing
 *    or restoring REMOVES the later turns from the session. Greying them out
 *    would teach the folk claim the research kills.
 * 5. T3 IS NAMED AS THE LAST KNOWN GOOD TURN, above the fork. Without the rule,
 *    "Restore Checkpoint" has nothing on screen to point at (Atil, on the
 *    prototype). It survives the restore, so the green state reads as the
 *    checkpoint holding while everything under it goes.
 */

export const EYEBROW = "Go back rather than argue";
export const HEADLINE = ["Don't react.", "Prepare again."];

export const LEDE =
  "Your session, and the two buttons that are already in it. Everything in this pane is read again, every single turn.";

/** the rule that names T3 — see decision 5 */
export const CHECKPOINT = "last known good";

export interface Turn {
  /** T3, T4, T4′ … — the label the vendors' own UI shows */
  id: string;
  who: "you" | "agent";
  /** one line, read in a glance. NO code and no diffs: the room must read a
   *  card and then look back at the presenter (Atil, on the prototype). */
  text: string;
  mark?: "ok" | "bad";
}

/* ══ THE SESSION ═══════════════════════════════════════════════════════════
 *
 * One shared prefix, one wrong turn, two ways out. Deliberately ordinary work
 * — retries on an upload — so nobody has to know the domain to see who is at
 * fault. The mistake is PLAUSIBLY wrong, not stupidly wrong; a stupid mistake
 * lets the room off the hook, because nobody believes they would argue with it.
 */

/** Turns 1–3: the shared prefix. T3 is the checkpoint both paths hang off. */
export const PREFIX: Turn[] = [
  { id: "T1", who: "you", text: "the upload step should survive a flaky network" },
  { id: "T2", who: "agent", text: "found the upload call, added a retry", mark: "ok" },
  { id: "T3", who: "agent", text: "tests pass", mark: "ok" },
];

/** the prompt that goes wrong — underspecified in exactly two ways */
export const MISTAKE_PROMPT: Turn = {
  id: "T4",
  who: "you",
  text: "make it give up eventually",
};

/** T4 — the wrong turn */
export const MISTAKE: Turn = {
  id: "T4",
  who: "agent",
  text: "retries forever, and swallows the error",
  mark: "bad",
};

/** The red path. Each correction is reasonable in isolation — that is the
 *  point. The wrong turn is still in the window, and now so is the argument
 *  about it. Two steps only: a third would say "keep arguing", which
 *  Anthropic's published threshold forbids. */
export const RED: { you: Turn; agent: Turn; note: string }[] = [
  {
    you: { id: "T5", who: "you", text: "no — cap it at three tries" },
    agent: {
      id: "T5",
      who: "agent",
      text: "capped at three. still swallows the error",
      mark: "bad",
    },
    note: "Your correction and its first answer are both in the window now.",
  },
  {
    you: { id: "T6", who: "you", text: "don't swallow the error" },
    agent: {
      id: "T6",
      who: "agent",
      text: "re-raises — and now retries bad input too",
      mark: "bad",
    },
    note: "It is satisfying three instructions, one of which it wrote itself.",
  },
];

/** Anthropic's published threshold, surfaced by the SECOND correction — so the
 *  rule arrives as something the room has just watched, not as a bullet. */
export const THRESHOLD =
  "Two failed corrections. That is the published line — stop correcting.";

export const RESTORE = "Restore Checkpoint";

/** what the restore says as the wrong turns leave — the crux, in the vendors'
 *  own register: removed from the session, not hidden from the screen */
export const CRUX = "T4 and everything after it: removed from the session.";

/** The green path: same checkpoint, better brief. T4′ adds the retry ceiling
 *  and the error class — the two things T4's prompt never said. */
export const GREEN: Turn[] = [
  {
    id: "T4′",
    who: "you",
    text: "give up after 3 tries, 2s apart — only on timeouts. re-raise the rest",
  },
  { id: "T4′", who: "agent", text: "done, and the test names the case", mark: "ok" },
];

export const GREEN_NOTE = "Same checkpoint. A better brief. Nothing to argue with.";

/** What the rollback does NOT undo. Small type, and it keeps the slide honest —
 *  it also hands straight into the guardrails slide's commit line. */
export const SURVIVES =
  "What it ran in the terminal stays run. That is what the commit is for.";

/** the counter above the pane — TURNS, never money (decision 1) */
export const readsLabel = (n: number, clean: boolean) =>
  clean
    ? `it reads ${n} turns — the wrong one is not one of them`
    : `it reads all ${n} turns again, the wrong one included`;

/* ══ THE CLOSING BEAT ══════════════════════════════════════════════════════
 * The four names, in the audience's own vocabulary, so an attendee can read a
 * label off the wall and find it in their editor on Monday. Atil's call on the
 * prototype ticket: on screen, one fragment. The full escape ladder (nudge →
 * roll back → fork → compact → clear) stays in the presenter note, which is
 * what keeps the chapter at nine screens.
 *
 * All four are verbatim first-party (#48 §2). `/prune` does not exist — the
 * word is `/compact` (#45) — and no Cursor / Windsurf vocabulary appears here.
 * The first two are also drawn ON the wrong turn, where VS Code draws them, so
 * this row deliberately carries only what the pane cannot: where to find them.
 */
export const VOCAB: { name: string; where: string }[] = [
  { name: "Restore Checkpoint", where: "hover a request" },
  { name: "Edit a previous request", where: "click the bubble" },
  { name: "Fork Conversation", where: "keeps the old session alive" },
  { name: "/undo", where: "the CLI · Esc Esc" },
];
