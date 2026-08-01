/**
 * The deck's hand-rolled pseudo-tokenizer and pseudo-embedding placement.
 *
 * Not BPE, and deliberately not a dependency (wayfinder #20 rules a real
 * tokenizer out of scope): whitespace/punctuation split, a leading space rides
 * with its word GPT-style, peel common affixes, chop long stems into 4-6 char
 * pieces, FNV hash to an ID in a ~200k vocabulary.
 *
 * The bar is "convincing on words nobody rehearsed", and it clears it (#24):
 * Veldh|oven, lithog|raphy, wafer|s, throu|ghput, un|plann|ed, non|sense.
 *
 * Placement is a pure function of the token text, so a slide replays
 * identically on every re-entry with no stored state — the deck's rule.
 */

const PREFIX = ["un", "re", "pre", "dis", "non", "over", "under", "inter", "sub", "mis"];
const SUFFIX = [
  "ing", "tion", "ness", "ment", "able", "ible", "ally",
  "ed", "ly", "er", "est", "ful", "ize", "ise", "ity", "es", "s",
];

export function hash32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** ~200,000 entries — the size hedged as "around" on screen, never printed exactly. */
const tokenId = (piece: string) => hash32(piece) % 199_998;

function splitWord(word: string): string[] {
  const out: string[] = [];
  let w = word;
  if (w.length > 6) {
    for (const p of PREFIX) {
      if (w.toLowerCase().startsWith(p) && w.length - p.length >= 3) {
        out.push(w.slice(0, p.length));
        w = w.slice(p.length);
        break;
      }
    }
  }
  let tail = "";
  if (w.length > 5) {
    for (const s of SUFFIX) {
      if (w.toLowerCase().endsWith(s) && w.length - s.length >= 3) {
        tail = w.slice(w.length - s.length);
        w = w.slice(0, w.length - s.length);
        break;
      }
    }
  }
  // chop what's left into believable 4-6 char stems
  while (w.length > 7) {
    const n = 4 + (hash32(w) % 3);
    out.push(w.slice(0, n));
    w = w.slice(n);
  }
  if (w) out.push(w);
  if (tail) out.push(tail);
  return out;
}

export type Tok = { text: string; id: number };

export function tokenize(text: string): Tok[] {
  const toks: Tok[] = [];
  const parts = text.match(/\s+|[A-Za-z]+|\d+|[^\sA-Za-z\d]/g) ?? [];
  let pendingSpace = "";
  for (const part of parts) {
    if (/^\s+$/.test(part)) {
      // newlines are their own token; a single space rides along with the word
      if (part.includes("\n")) {
        toks.push({ text: "\\n", id: tokenId("\n") });
        pendingSpace = "";
      } else {
        pendingSpace = " ";
        if (part.length > 1) {
          toks.push({ text: "␣".repeat(part.length - 1), id: tokenId(part) });
        }
      }
      continue;
    }
    const pieces = /^[A-Za-z]+$/.test(part) ? splitWord(part) : [part];
    pieces.forEach((p, i) => {
      const t = i === 0 ? pendingSpace + p : p;
      toks.push({ text: t, id: tokenId(t.trim().toLowerCase()) });
    });
    pendingSpace = "";
  }
  return toks;
}

/* ── pseudo-embedding placement ───────────────────────────────────────────
   Pure hash scatter, no seeded clustering (#24): a seed table only clusters
   words it was seeded with, so it silently degrades to this the moment
   anything unrehearsed is typed while the caption goes on claiming otherwise.
   Per #22 an honest scatter is a visually faithful rendering anyway — random
   high-dimensional data projects to apparent clusters too.

   The volume is landscape — wide and deep, shallow in height — to match the
   panel it sits in. */

const R = 150; // base radius in cloud-space units
export const SPREAD_XZ = R * 1.29;
export const SPREAD_Y = R * 0.58;

/** Deterministic position for a token: same text, same point, every replay. */
export function place(tok: Tok): [number, number, number] {
  const word = tok.text.trim().toLowerCase();
  const h = hash32(word || tok.text);
  const u = ((h >>> 0) % 1000) / 1000;
  const v = ((h >>> 10) % 1000) / 1000;
  const w = ((h >>> 20) % 1000) / 1000;
  const th = u * Math.PI * 2;
  const ph = Math.acos(2 * v - 1);
  // a hollow shell reads as a volume; a solid ball just clumps at the centre
  const rad = 0.58 + 0.42 * Math.cbrt(w);
  return [
    rad * Math.sin(ph) * Math.cos(th) * SPREAD_XZ,
    rad * Math.cos(ph) * SPREAD_Y,
    rad * Math.sin(ph) * Math.sin(th) * SPREAD_XZ,
  ];
}
