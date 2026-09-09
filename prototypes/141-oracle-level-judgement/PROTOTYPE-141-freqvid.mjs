// PROTOTYPE for issue #141 - throwaway. Frequency measure over the five video transcripts.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
const S = dirname(new URL(import.meta.url).pathname);
const rank = new Map();
readFileSync('/home/neo/projects/atilileri.github.io/docs/dutch/sources/frequency-nl-50k.txt', 'utf8')
  .split('\n').forEach((l, i) => { const w = l.split(/\s+/)[0]; if (w && !rank.has(w)) rank.set(w, i + 1); });
const rows = readFileSync(join(S, 'vid/final.tsv'), 'utf8').trim().split('\n');
console.log(['tag', 'expected', 'words', 'top2000', 'top5000', 'offList'].join('\t'));
for (const r of rows) {
  const [tag, exp] = r.split('\t');
  const ws = (readFileSync(join(S, `vid/${tag}-clean.txt`), 'utf8').toLowerCase().match(/[a-zäëïöüáéíóúà']+/g) || []);
  const w = (k) => (ws.filter((x) => (rank.get(x) ?? Infinity) <= k).length / ws.length).toFixed(3);
  const off = (ws.filter((x) => !rank.has(x)).length / ws.length).toFixed(3);
  console.log([tag, exp, ws.length, w(2000), w(5000), off].join('\t'));
}
