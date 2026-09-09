import { chromium } from 'playwright';
const out = process.argv[2];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 900, height: 1200 } });
for (const v of ['A','B','C']) {
  await p.goto(`http://localhost:4331/prototype/listening-embed?variant=${v}`, { waitUntil: 'load' });
  await p.waitForTimeout(4500);
  await p.screenshot({ path: `${out}/variant-${v}.png`, fullPage: true });
  console.log('shot', v);
}
await b.close();
