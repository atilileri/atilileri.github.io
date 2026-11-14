/*
 * Tests for the Save code format: one line of text that carries a payload
 * and catches a typo.
 *
 *   node --test src/lib/bday26/savecode.test.ts
 *
 * Seam 1 of the spec (#192, "Testing Decisions"), the format alone: what goes
 * in comes out, a changed or cut code is refused, and the check code is the
 * one the Proof prints (#196, #197). The payload here is plain text; what
 * the ledger puts in it is the ledger's test's business (`ledger.test.ts`).
 * Nothing here looks at how the code is built, only at what a code does when
 * it is read back.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { decodeSaveCode, encodeSaveCode } from "./savecode.ts";

test("a payload comes back from its own Save code unchanged", async () => {
  const { code } = await encodeSaveCode('{"best":{"hafiza":100},"jackpot":false,"log":[]}');
  assert.deepEqual(await decodeSaveCode(code), {
    ok: true,
    payload: '{"best":{"hafiza":100},"jackpot":false,"log":[]}',
  });
});

test("the check code is the code's last 6 characters, in uppercase hex, and the same payload gives the same code twice", async () => {
  // What the Proof (#197) leans on: it prints `check` large and `code` small,
  // and Atıl compares the printed check code with the one on her live screen.
  const first = await encodeSaveCode("the same progress");
  const again = await encodeSaveCode("the same progress");
  assert.equal(first.check.length, 6);
  assert.match(first.check, /^[0-9A-F]{6}$/);
  assert.equal(first.code.slice(-6), first.check);
  assert.deepEqual(again, first);
});

test("a Save code is one line of URL-safe text: letters, digits, - and _ only", async () => {
  // Bytes that base64 would write with + / = : every one of them must be
  // spelled another way, so the code survives a chat message or a printout.
  const { code } = await encodeSaveCode("ÿþý??>>?? ğüşiöç İ");
  assert.match(code, /^[A-Za-z0-9_-]+$/);
  assert.deepEqual(await decodeSaveCode(code), { ok: true, payload: "ÿþý??>>?? ğüşiöç İ" });
});

/** The same code with the character at `at` swapped for another one. */
function withTypoAt(code: string, at: number): string {
  const swap = code[at] === "A" ? "B" : "A";
  return code.slice(0, at) + swap + code.slice(at + 1);
}

test("a Save code with one character changed is refused, wherever the change is", async () => {
  const { code } = await encodeSaveCode('{"best":{"milyoner":88,"wordle":95.5},"jackpot":true,"log":[]}');
  const inPayload = [0, 1, Math.floor(code.length / 2), code.length - 7];
  const inCheck = [code.length - 6, code.length - 4, code.length - 1];
  for (const at of [...inPayload, ...inCheck]) {
    const typo = withTypoAt(code, at);
    assert.notEqual(typo, code);
    assert.deepEqual(await decodeSaveCode(typo), { ok: false, reason: "check" }, `position ${at}`);
  }
});

test("a Save code cut short is refused, by one character or by half", async () => {
  const { code } = await encodeSaveCode('{"best":{"hafiza":100},"jackpot":false,"log":[{"kind":"buy","gift":"rocky","paid":260}]}');
  for (const keep of [code.length - 1, code.length - 6, Math.floor(code.length / 2), 7, 6, 1]) {
    assert.deepEqual(await decodeSaveCode(code.slice(0, keep)), { ok: false, reason: "check" }, `${keep} characters`);
  }
});

test("whitespace in a pasted code is ignored: the Proof wraps it over lines, a chat adds a newline", async () => {
  const { code } = await encodeSaveCode("wrapped on paper");
  const half = Math.floor(code.length / 2);
  const wrapped = `  ${code.slice(0, half)}\n${code.slice(half, -3)} ${code.slice(-3)}\r\n`;
  assert.deepEqual(await decodeSaveCode(wrapped), { ok: true, payload: "wrapped on paper" });
});

test("nothing pasted, or only whitespace, is 'empty' rather than a wrong code", async () => {
  assert.deepEqual(await decodeSaveCode(""), { ok: false, reason: "empty" });
  assert.deepEqual(await decodeSaveCode(" \n\t"), { ok: false, reason: "empty" });
});
