/*
 * Tests for the title-matching rule in oracle-refs.mjs.
 *
 *   node --test tools/dutch/oracle-refs.test.mjs
 *
 * Matching is the dangerous part of the swap. A wrong match replaces a source
 * with a different file and then deletes the original, so the tests below fix
 * the two properties that keep that from happening: a title and its Drive
 * filename must match despite the server's rewriting, and an episode's audio
 * must never match its transcript.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileKey, extFromType } from './oracle-refs.mjs';

test('the server rewriting hyphens does not break the match', () => {
  // Gemini Notebook turns "les 2026-09-07.mp3" into "les 2026 - 09 - 07.mp3".
  assert.equal(
    fileKey('NT2 Taaldiensten - les 2026 - 09 - 07.mp3'),
    fileKey('NT2 Taaldiensten - les 2026-09-07.mp3'),
  );
});

test('a hyphenated Drive name matches its spaced notebook title', () => {
  assert.equal(
    fileKey('afl - 550 - een - nieuwe - taal - micha - wertheim.mp3'),
    fileKey('afl-550-een-nieuwe-taal-micha-wertheim.mp3'),
  );
});

test('audio never matches its own transcript', () => {
  // Both share a stem. Swapping one for the other would replace a recording
  // with its text and then delete the recording.
  assert.notEqual(
    fileKey('06 - sport, topsport en voetbal.mp3'),
    fileKey('06 - sport, topsport en voetbal.txt'),
  );
});

test('case and underscores do not matter', () => {
  assert.equal(fileKey('Ali_Baba deel 01.txt'), fileKey('ali baba-deel-01.txt'));
});

test('a title with no extension takes one from its source type', () => {
  assert.equal(
    fileKey('NT2 Taaldiensten - tanisma dersi', extFromType('media')),
    fileKey('NT2 Taaldiensten - tanisma dersi.mp3'),
  );
  assert.equal(fileKey('2023 Luisteren I - 01 - instructie', extFromType('markdown')), fileKey('2023 Luisteren I - 01 - instructie.txt'));
});

test('a source type maps to the extension its files use', () => {
  assert.equal(extFromType('media'), 'mp3');
  assert.equal(extFromType('markdown'), 'txt');
  assert.equal(extFromType('pdf'), 'pdf');
  assert.equal(extFromType('google_drive'), '');
});

test('a double extension is kept in the stem', () => {
  // "0-trailer.asr.txt" is a machine transcript sitting beside a human one.
  // Only the last extension is the kind; ".asr" must stay part of the name.
  assert.notEqual(fileKey('0-trailer.asr.txt'), fileKey('0-trailer.txt'));
  assert.ok(fileKey('0-trailer.asr.txt').endsWith('|txt'));
});

test('different episodes never share a key', () => {
  assert.notEqual(fileKey('afl-550-een-nieuwe-taal.mp3'), fileKey('afl-551-verliefd.mp3'));
});
