#!/usr/bin/env node
/*
 * Read text off an image, for pages that carry no text layer.
 *
 *   node ocr.js <image> [output.txt]
 *
 * Set OCR_LANG to the Tesseract language codes, joined by "+".
 * It defaults to "nld+tur+eng".
 *
 * Reach for this only when pdftext.js returns almost nothing, which means the
 * PDF holds scanned pages. Render the page to an image first:
 *
 *   ~/bin/ffmpeg -i page.pdf page.png     # single page
 *
 * On first run Tesseract downloads its language data, so it needs the network
 * once. After that it works offline.
 */
const fs = require('fs');
const { createWorker } = require('tesseract.js');

const input = process.argv[2];
const outFile = process.argv[3];
const langs = process.env.OCR_LANG || 'nld+tur+eng';
if (!input) {
  console.error('usage: node ocr.js <image> [output.txt]');
  process.exit(1);
}

(async () => {
  const worker = await createWorker(langs.split('+'));
  const { data } = await worker.recognize(input);
  await worker.terminate();
  console.error(`confidence ${Math.round(data.confidence)}%  chars ${data.text.length}  lang=${langs}`);
  if (outFile) fs.writeFileSync(outFile, data.text);
  else console.log(data.text);
})();
