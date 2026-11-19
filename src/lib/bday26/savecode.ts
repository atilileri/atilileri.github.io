/**
 * The Save code (*Yedek kodu*) format of the birthday games site
 * (/20261209/, spec #192 "Save code and Proof", built on #196): one line of
 * text that carries a payload and catches a typo. The ledger (`./ledger.ts`)
 * puts her serialised progress in it; this module does not know what the
 * payload says, only how to seal it and how to open it.
 *
 * THE FORMAT, as #175 decided on the storage research of #172:
 *
 *     <base64url of the payload's UTF-8 bytes><6-character check code>
 *
 *   - base64url (RFC 4648 §5, no padding): the alphabet is A–Z a–z 0–9 - _,
 *     so the code survives a chat message, a note, a URL field and a
 *     printout — no `+`, `/` or `=` to be eaten or line-wrapped away.
 *   - The check code is the first 6 characters of the SHA-256 (hex,
 *     UPPERCASE) of the base64url text, computed with `crypto.subtle`, which
 *     exists in every browser on HTTPS (GitHub Pages) and in Node 24 for the
 *     tests. 24 bits: a one-character slip, a cut-off tail or a stray edit
 *     is caught with odds of 1 in 16 million of slipping through. Hex rather
 *     than base32 because it is the alphabet people already read as "a
 *     code", and uppercase because the Proof (#197) prints it in large
 *     letters and `3F9A1C` reads better than `3f9a1c` on paper. The check
 *     code stands at the END so the Proof's "last 6 characters" rule is the
 *     code's own shape, with no separator to lose.
 *
 * WHAT IT PROTECTS AGAINST, AND WHAT NOT. Typos, truncation, a corrupted
 * paste. Not forgery: a public page cannot keep a secret, so an HMAC would
 * buy nothing over a plain hash (#172), and the trust model says Atıl checks
 * a Proof by comparing its printed check code with her live screen, not by
 * verifying the code (#175). The glossary says it in one line: "catches a
 * typo; it does not stop an edit made on purpose".
 *
 * READING IS FORGIVING ABOUT WHITESPACE, STRICT ABOUT EVERYTHING ELSE. The
 * Proof wraps the code over several lines and a chat app may add a trailing
 * newline, so every whitespace character is dropped before the code is read.
 * After that, the last 6 characters must equal the check code of the rest,
 * character for character (case included: base64url is case-sensitive, so
 * the check code is too). A code that fails is refused with a reason the
 * panel turns into one Turkish sentence:
 *   - "empty": nothing but whitespace was pasted;
 *   - "check": the check code does not match — a typo, a cut, or a code too
 *     short to hold a payload at all;
 *   - "payload": the check matches but the text is not base64url of UTF-8,
 *     which no code made here can produce; kept so the type is honest.
 *
 * Both functions are async only because `crypto.subtle.digest` is. They are
 * pure: same payload, same code, which is what lets the Proof's check code
 * and the Yedekle panel's agree.
 */

/** The length of the check code at the end of every Save code. */
export const CHECK_LENGTH = 6;

/** A sealed Save code and, for the Proof, its check code on its own. */
export type SaveCode = {
  /** The whole line, check code included: what she copies and pastes. */
  code: string;
  /** The last `CHECK_LENGTH` characters of `code`, in large letters on the Proof. */
  check: string;
};

export type SaveCodeProblem = "empty" | "check" | "payload";

export type DecodeOutcome =
  | { ok: true; payload: string }
  | { ok: false; reason: SaveCodeProblem };

/** Seal a payload into a Save code. */
export async function encodeSaveCode(payload: string): Promise<SaveCode> {
  const body = toBase64Url(new TextEncoder().encode(payload));
  const check = await checkOf(body);
  return { code: body + check, check };
}

/** Open a pasted Save code. Whitespace is ignored; anything else must match. */
export async function decodeSaveCode(text: string): Promise<DecodeOutcome> {
  const compact = text.replace(/\s+/g, "");
  if (compact.length === 0) return { ok: false, reason: "empty" };
  if (compact.length <= CHECK_LENGTH) return { ok: false, reason: "check" };

  const body = compact.slice(0, -CHECK_LENGTH);
  const check = compact.slice(-CHECK_LENGTH);
  if (check !== (await checkOf(body))) return { ok: false, reason: "check" };

  const bytes = fromBase64Url(body);
  if (!bytes) return { ok: false, reason: "payload" };
  try {
    return { ok: true, payload: new TextDecoder("utf-8", { fatal: true }).decode(bytes) };
  } catch {
    return { ok: false, reason: "payload" };
  }
}

/** The first `CHECK_LENGTH` hex characters, uppercase, of SHA-256(body). */
async function checkOf(body: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(body));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, CHECK_LENGTH)
    .toUpperCase();
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Null when the text is not base64url. */
function fromBase64Url(body: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]*$/.test(body)) return null;
  const base64 = body.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (body.length % 4)) % 4);
  let binary: string;
  try {
    binary = atob(base64);
  } catch {
    return null;
  }
  return Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
}
