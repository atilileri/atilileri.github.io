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
import { lessonName, supplementName, supplementKind, ocrDocument, deckSlides } from './course-lessons.mjs';

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

// ---------------------------------------------------------------- supplements (#145)

test('a supplement keeps the teacher\'s stem behind the word "supplement"', () => {
  assert.equal(supplementName('Les 1.1.pptx'), 'NT2 Taaldiensten - supplement Les 1.1');
  assert.equal(supplementName('Twee spelalfabetten.jpg'), 'NT2 Taaldiensten - supplement Twee spelalfabetten');
});

test('a supplement with no extension keeps its whole name', () => {
  assert.equal(supplementName('De stamboom'), 'NT2 Taaldiensten - supplement De stamboom');
});

test('a dot inside the stem is not an extension', () => {
  // Stripping any last dot would turn "Les 1.1" into "Les 1", and two decks
  // would then claim the same OCR file.
  assert.equal(supplementName('Les 1.1'), 'NT2 Taaldiensten - supplement Les 1.1');
  assert.notEqual(supplementName('Les 1.1.pptx'), supplementName('Les 1.2.pptx'));
});

test('a supplement never sorts into the dated lesson series', () => {
  assert.ok(!supplementName('07-09-2026.png').startsWith('NT2 Taaldiensten - les'));
});

test('the kind comes from the mime type, and anything unknown is skipped', () => {
  assert.equal(
    supplementKind('application/vnd.openxmlformats-officedocument.presentationml.presentation'),
    'deck',
  );
  assert.equal(supplementKind('image/png'), 'image');
  assert.equal(supplementKind('image/jpeg'), 'image');
  assert.equal(supplementKind('application/pdf'), null);
  assert.equal(supplementKind(undefined), null);
});

const xml = (s) => Buffer.from(s, 'utf8');
const deck = new Map([
  [
    'ppt/presentation.xml',
    xml('<p:sldIdLst><p:sldId id="257" r:id="rId3"/><p:sldId id="256" r:id="rId2"/></p:sldIdLst>'),
  ],
  [
    'ppt/_rels/presentation.xml.rels',
    xml(
      '<Relationship Id="rId2" Type="x/slide" Target="slides/slide1.xml"/>' +
        '<Relationship Target="slides/slide2.xml" Type="x/slide" Id="rId3"/>',
    ),
  ],
  ['ppt/slides/slide1.xml', xml('<p:sld><a:p><a:r><a:t>Tot ziens!</a:t></a:r></a:p></p:sld>')],
  [
    'ppt/slides/slide2.xml',
    xml(
      '<p:sld show="0"><a:p><a:r><a:t>Warming-up </a:t></a:r><a:r><a:t>&amp; Leerdoelen</a:t></a:r></a:p>' +
        '<a:p></a:p><p:blip r:embed="rId5"/></p:sld>',
    ),
  ],
  ['ppt/slides/_rels/slide2.xml.rels', xml('<Relationship Id="rId5" Type="x/image" Target="../media/image4.png"/>')],
]);

test('slides come in presentation order, not file order', () => {
  const slides = deckSlides(deck);
  assert.deepEqual(
    slides.map((s) => s.paragraphs),
    [['Warming-up & Leerdoelen'], ['Tot ziens!']],
  );
  assert.deepEqual(slides.map((s) => s.number), [1, 2]);
});

test('a slide lists its pictures and says when it is hidden', () => {
  const [first, second] = deckSlides(deck);
  assert.deepEqual(first.pictures, ['ppt/media/image4.png']);
  assert.equal(first.hidden, true);
  assert.equal(second.hidden, false);
});

test('the OCR file says what it is, and marks every block', () => {
  const doc = ocrDocument({
    file: 'De stamboom',
    kind: 'image',
    date: '2026-09-19',
    blocks: [{ label: 'page', parts: [{ head: 'ocr, confidence 85%', body: 'schoonzus\ngörümce\n' }] }],
  });
  assert.match(doc, /^Machine reading of the NT2 course supplement "De stamboom" \(one-page sheet\)\./);
  assert.match(doc, /the original in Drive is the authority/);
  assert.match(doc, /\[page\]\nocr, confidence 85%:\n  schoonzus\n  görümce\n$/);
});

test('an empty reading says so instead of leaving a blank', () => {
  const doc = ocrDocument({
    file: 'Les 1.1.pptx',
    kind: 'deck',
    date: '2026-09-19',
    blocks: [{ label: 'slide 1', parts: [{ head: 'text', body: '  ' }] }],
  });
  assert.match(doc, /\(deck, 1 slide\)/);
  assert.match(doc, /\[slide 1\]\ntext:\n  \(nothing\)/);
});
