import { chromium } from 'playwright';
const out = process.argv[2] || '/tmp/claude-1000/-home-neo-projects-atilileri-github-io/b8bf14b4-43ff-4132-87d7-168f15da8b3c/scratchpad';
const b = await chromium.launch();
for (const v of ['A','B','C','D','E']) {
  const p = await b.newPage({ viewport: { width: 900, height: 1200 } });
  await p.goto(`http://localhost:4331/prototype/90-superbowl-session/?variant=${v}`, { waitUntil: 'networkidle' });
  await p.screenshot({ path: `${out}/v${v}.png`, fullPage: true });
  const h = await p.evaluate(() => document.body.scrollHeight);
  console.log(v, h + 'px');
  await p.close();
}
await b.close();
