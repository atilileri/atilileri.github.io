/*
 * Tests for the lesson-naming rule locked by issue #143.
 *
 *   node --test tools/dutch/course-lessons.test.mjs
 *
 * Naming is the only pure logic in the pipeline, and it is the part that would
 * fail silently: a wrong name makes the script believe a lesson is unprocessed
 * and derive it a second time under a second name.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lessonName } from './course-lessons.mjs';

test('a day-first date becomes ISO order', () => {
  assert.equal(lessonName('07-09-2026.mp4'), 'NT2 Taaldiensten - les 2026-09-07');
  assert.equal(lessonName('31-12-2026.mkv'), 'NT2 Taaldiensten - les 2026-12-31');
});

test('a date already in ISO order is kept', () => {
  assert.equal(lessonName('2026-09-07.mp4'), 'NT2 Taaldiensten - les 2026-09-07');
});

test('dots and underscores separate a date too', () => {
  assert.equal(lessonName('07.09.2026.mp4'), 'NT2 Taaldiensten - les 2026-09-07');
  assert.equal(lessonName('07_09_2026.mp4'), 'NT2 Taaldiensten - les 2026-09-07');
});

test('an impossible date is not a date', () => {
  // Month 13 cannot be a month, so the stem is kept verbatim rather than
  // producing a name that sorts into a month that does not exist.
  assert.equal(lessonName('07-13-2026.mp4'), 'NT2 Taaldiensten - 07-13-2026');
});

test('a name with no date keeps its own stem, untranslated', () => {
  assert.equal(
    lessonName('tanışma dersi A0-A2 - weer en klimaat.mp4'),
    'NT2 Taaldiensten - tanışma dersi A0-A2 - weer en klimaat',
  );
});

test('the extension never survives', () => {
  for (const ext of ['mp4', 'mkv', 'mov', 'webm', 'm4v', 'avi']) {
    assert.ok(!lessonName(`07-09-2026.${ext}`).includes(ext));
  }
});

test('the same file always gets the same name', () => {
  // The script tests "is this lesson done?" by looking for a file named from
  // the video. An unstable name would derive every lesson twice.
  assert.equal(lessonName('07-09-2026.mp4'), lessonName('07-09-2026.mp4'));
});
