#!/usr/bin/env node
/*
 * Extract the text layer of a PDF.
 *
 *   node pdftext.js <file.pdf> [output.txt]
 *
 * Prints the metadata line to stderr and the text to stdout, or to a file.
 * The metadata often names the publisher and the copyright holder, which is
 * how the loose Drive PDFs were identified.
 *
 * A PDF of scanned pages has no text layer and returns almost nothing. That is
 * the signal to use ocr.js instead.
 */
const fs = require('fs');
const { PDFParse } = require('pdf-parse');

const input = process.argv[2];
const outFile = process.argv[3];
if (!input) {
  console.error('usage: node pdftext.js <file.pdf> [output.txt]');
  process.exit(1);
}

(async () => {
  const parser = new PDFParse({ data: fs.readFileSync(input) });
  const meta = (await parser.getInfo().catch(() => ({}))).info || {};
  const result = await parser.getText();
  console.error(
    `pages ${result.pages ? result.pages.length : '?'}  chars ${result.text.length}  ` +
    `title=${meta.Title || '-'}  author=${meta.Author || '-'}  producer=${meta.Producer || '-'}`,
  );
  if (outFile) fs.writeFileSync(outFile, result.text);
  else console.log(result.text);
  await parser.destroy();
})();
