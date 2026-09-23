/**
 * Guard for the CV print sheet.
 *
 * Nobody prints a page by accident, so a broken print stylesheet ships
 * unnoticed. This renders the built CV in print mode and asserts the few
 * facts the printed PDF must carry. See docs/adr/0002-the-cv-page-is-the-pdf.md.
 *
 *   npm run build && node tools/cv/check-print.mjs
 *
 * Pass --pdf <path> to keep the rendered file and read it yourself.
 */
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ROOT = "dist";
const PORT = 4333;
const MAX_PAGES = 3;

const TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".xml": "application/xml",
};

function serve() {
  return http.createServer((req, res) => {
    let file = path.join(ROOT, decodeURI(req.url.split("?")[0]));
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      file = path.join(file, "index.html");
    }
    if (!fs.existsSync(file)) {
      res.writeHead(404);
      return res.end();
    }
    res.writeHead(200, {
      "content-type": TYPES[path.extname(file)] ?? "application/octet-stream",
    });
    fs.createReadStream(file).pipe(res);
  });
}

const failures = [];
function check(name, ok) {
  if (ok) {
    console.log(`  ok    ${name}`);
  } else {
    console.log(`  FAIL  ${name}`);
    failures.push(name);
  }
}

if (!fs.existsSync(path.join(ROOT, "cv", "index.html"))) {
  console.error(`No build found at ${ROOT}/cv/. Run "npm run build" first.`);
  process.exit(2);
}

const pdfArg = process.argv.indexOf("--pdf");
const pdfPath =
  pdfArg === -1
    ? path.join(fs.mkdtempSync(path.join(os.tmpdir(), "cv-")), "cv.pdf")
    : process.argv[pdfArg + 1];

const server = serve();
await new Promise((resolve) => server.listen(PORT, resolve));
const browser = await chromium.launch();

try {
  const page = await browser.newPage();
  await page.goto(`http://localhost:${PORT}/cv/`, { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print" });

  console.log("CV print sheet");
  check("the top bar is hidden", !(await page.locator("nav").first().isVisible()));
  check("the footer is hidden", !(await page.locator("footer").first().isVisible()));
  check("the download button is hidden", !(await page.locator("#print-cv").isVisible()));
  check("the thesis picture is hidden", !(await page.locator("#thesis-figure").isVisible()));

  const text = await page.locator("#cv").innerText();
  check("the name is printed", text.includes("İLERİALKAN"));
  check("the email is printed", text.includes("atil@live.it"));
  check("the LinkedIn address is printed", text.includes("linkedin.com/in/atililerialkan"));
  check("the summary is printed", (await page.locator("#cv-summary").innerText()).length > 100);
  check("the languages line is printed", text.includes("Dutch"));
  check(
    "the oldest roles print as one line",
    !(await page.locator("[data-compact-in-print] > p").first().isVisible()),
  );
  check("the awards print as one line", text.includes("02:01:22 (2025)"));
  check("the technical stack is screen only", !text.includes("TECHNICAL STACK"));

  await page.pdf({ path: pdfPath, format: "A4", printBackground: true });
  const pdf = fs.readFileSync(pdfPath, "latin1");
  const pages = (pdf.match(/\/Type\s*\/Page[^s]/g) ?? []).length;
  check(`the PDF is at most ${MAX_PAGES} pages (is ${pages})`, pages <= MAX_PAGES);
  if (pdfArg !== -1) console.log(`\n  PDF written to ${pdfPath}`);
} finally {
  await browser.close();
  server.close();
}

if (failures.length > 0) {
  console.error(`\n${failures.length} check(s) failed.`);
  process.exit(1);
}
console.log("\nAll checks passed.");
