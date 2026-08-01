/**
 * The agent-loop slide's step script and number model (deck /decks/asml-ai,
 * chapter 04, slide 8). Settled by wayfinder prototype #26 (variant C, "the
 * ledger") and built by #28 — the figures below are locked, not illustrative
 * defaults to tune.
 *
 * Task: (3 + 5) × 2 − 4 = 12, run by an agent that cannot do arithmetic, with
 * two tools. Legibility over realism — a real coding task was rejected.
 *
 * The billing rule the slide exists to teach: an API call bills the WHOLE
 * context. Tokens already sent in a previous call bill at the cached rate;
 * only the delta since the last call bills at full input price. Tool results
 * are produced locally and cost nothing until the next call re-sends them.
 *
 * TWELVE steps, FOUR billing events. The bars sit still while the agent
 * reasons and while a tool returns, then jump when a request goes out. That
 * asymmetry is the teaching — do NOT "fix" it by billing every step.
 *
 * Model is GPT-5.4, deliberately not an Anthropic one: #23 keeps Anthropic's
 * 1.25× cache-WRITE rate off-screen, which is invisible on the cost dial but
 * would silently overstate the cache saving this slide puts on screen. OpenAI
 * carries no write surcharge. Slides 5 and 8 therefore default to different
 * models — deliberate (#26), and a presenter note, not a bug.
 */

/** GPT-5.4, AI credits per 1M tokens — from #21's verified rate table. */
export const RATE = { in: 250, cached: 25, out: 1500 };

/** Documented flat 10% auto-model-selection discount (#21). Nothing more:
 *  the routing-efficiency saving is real but never quantified, so no number
 *  on screen may be attributed to it. */
export const AUTO_DISCOUNT = 0.1;

export type Role = "system" | "user" | "assistant" | "tool";

export type Step = {
  role: Role;
  /** Ledger text. Contains inline markup (<code>, <b>) — trusted, authored here. */
  text: string;
  /** Context blocks this step appends to the window. */
  block: { label: string; tokens: number; kind: BlockKind }[];
  /** A model call fires here: the whole window is billed, fresh vs cached. */
  call?: boolean;
  /** Output tokens billed at this step. */
  out?: number;
};

export type BlockKind = "harness" | "tools" | "user" | "assistant" | "tool";

export const SCRIPT: Step[] = [
  {
    role: "system",
    text: "Harness bundle and two tool schemas are loaded before anything is said.",
    block: [
      { label: "Harness bundle", tokens: 1840, kind: "harness" },
      { label: "Tool schemas ×2", tokens: 620, kind: "tools" },
    ],
  },
  {
    role: "user",
    text: "What is (3 + 5) × 2 − 4?",
    block: [{ label: "User message", tokens: 26, kind: "user" }],
  },
  {
    role: "assistant",
    text: "I can’t do arithmetic myself. Start inside the brackets: 3 + 5.",
    block: [{ label: "Assistant · reasoning", tokens: 34, kind: "assistant" }],
    call: true,
    out: 34,
  },
  {
    role: "assistant",
    text: '<code>add_subtract(3, 5, "+")</code>',
    block: [{ label: "Tool call · add_subtract", tokens: 28, kind: "assistant" }],
    out: 28,
  },
  {
    role: "tool",
    text: "<code>→ 8</code>",
    block: [{ label: "Tool result · 8", tokens: 12, kind: "tool" }],
  },
  {
    role: "assistant",
    text: "Now multiply that by 2.",
    block: [{ label: "Assistant · reasoning", tokens: 32, kind: "assistant" }],
    call: true,
    out: 32,
  },
  {
    role: "assistant",
    text: '<code>multiply_divide(8, 2, "×")</code>',
    block: [{ label: "Tool call · multiply_divide", tokens: 26, kind: "assistant" }],
    out: 26,
  },
  {
    role: "tool",
    text: "<code>→ 16</code>",
    block: [{ label: "Tool result · 16", tokens: 11, kind: "tool" }],
  },
  {
    role: "assistant",
    text: "Then subtract 4.",
    block: [{ label: "Assistant · reasoning", tokens: 30, kind: "assistant" }],
    call: true,
    out: 30,
  },
  {
    role: "assistant",
    text: '<code>add_subtract(16, 4, "−")</code>',
    block: [{ label: "Tool call · add_subtract", tokens: 25, kind: "assistant" }],
    out: 25,
  },
  {
    role: "tool",
    text: "<code>→ 12</code>",
    block: [{ label: "Tool result · 12", tokens: 12, kind: "tool" }],
  },
  {
    role: "assistant",
    text: "(3 + 5) × 2 − 4 = <b>12</b>",
    block: [{ label: "Assistant · answer", tokens: 19, kind: "assistant" }],
    call: true,
    out: 19,
  },
];

/** 12 — the fragment spine adds one more for the bridge. */
export const STEP_COUNT = SCRIPT.length;

export type Frame = {
  step: number;
  /** Every block in the window, in the order it landed. */
  blocks: { label: string; tokens: number; kind: BlockKind; sentAt: number }[];
  contextTokens: number;
  billedInput: number;
  billedCached: number;
  billedOutput: number;
  credits: number;
  /** The same run with a cold cache on every call — the counterfactual. */
  creditsNoCache: number;
  callIndex: number;
};

/** Replay the script from step 0 up to `upTo` inclusive. Pure — no state kept
 *  between calls, which is what lets the slide replay from reveal's fragment
 *  state instead of a counter it would have to keep in sync. */
export function frameAt(upTo: number): Frame {
  const blocks: Frame["blocks"] = [];
  let ctx = 0;
  let sentCtx = 0; // already sent in a previous call → bills at the cached rate
  let bi = 0;
  let bc = 0;
  let bo = 0;
  let calls = 0;
  for (let i = 0; i <= upTo && i < STEP_COUNT; i++) {
    const s = SCRIPT[i];
    if (s.call) {
      bi += ctx - sentCtx;
      bc += sentCtx;
      sentCtx = ctx;
      calls++;
    }
    for (const b of s.block) {
      blocks.push({ ...b, sentAt: calls });
      ctx += b.tokens;
    }
    if (s.out) bo += s.out;
  }
  const credits =
    ((bi * RATE.in + bc * RATE.cached + bo * RATE.out) / 1e6) * (1 - AUTO_DISCOUNT);
  const creditsNoCache =
    (((bi + bc) * RATE.in + bo * RATE.out) / 1e6) * (1 - AUTO_DISCOUNT);
  return {
    step: upTo,
    blocks,
    contextTokens: ctx,
    billedInput: bi,
    billedCached: bc,
    billedOutput: bo,
    credits,
    creditsNoCache,
    callIndex: calls,
  };
}

/** The end of the run: 2,715-token window; 2,696 / 7,675 / 194 billed;
 *  1.04 AIC against 2.60 cold — the cache doing 60% of the work. */
export const FINAL = frameAt(STEP_COUNT - 1);

/** Bars are scaled against the largest count the run reaches, so the three
 *  are comparable to each other rather than each self-normalised. */
export const MAX_TOKENS = Math.max(
  FINAL.billedInput,
  FINAL.billedCached,
  FINAL.billedOutput,
);
