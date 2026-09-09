// PROTOTYPE for issue #141 - throwaway. A free, offline second signal for text difficulty.
// Reads docs/dutch/sources/frequency-nl-50k.txt and scores each text in the manifest.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';

const S = dirname(new URL(import.meta.url).pathname);
const REPO = '/home/neo/projects/atilileri.github.io';
const rank = new Map();
readFileSync(join(REPO, 'docs/dutch/sources/frequency-nl-50k.txt'), 'utf8')
  .split('\n').forEach((line, i) => {
    const w = line.split(/\s+/)[0];
    if (w && !rank.has(w)) rank.set(w, i + 1);
  });

const words = (t) => (t.toLowerCase().match(/[a-zäëïöüáéíóúà']+/g) || []);

function score(text) {
  const ws = words(text);
  const n = ws.length;
  const within = (k) => ws.filter((w) => (rank.get(w) ?? Infinity) <= k).length / n;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 1).length || 1;
  const unknown = ws.filter((w) => !rank.has(w)).length / n;
  return {
    n,
    top2000: within(2000),
    top5000: within(5000),
    offList: unknown,
    wordsPerSentence: n / sentences,
    longWords: ws.filter((w) => w.length >= 10).length / n,
  };
}

const manifest = readFileSync(join(S, 'manifest.tsv'), 'utf8').trim().split('\n');
console.log(['label', 'truth', 'words', 'top2000', 'top5000', 'offList', 'w/sent', 'long'].join('\t'));
const rows = [];
for (const line of manifest) {
  const [label, truth, rel] = line.split('\t');
  const s = score(readFileSync(join(S, 'cal', rel), 'utf8'));
  rows.push({ label, truth, s });
  console.log([
    label, truth, s.n,
    s.top2000.toFixed(3), s.top5000.toFixed(3), s.offList.toFixed(3),
    s.wordsPerSentence.toFixed(1), s.longWords.toFixed(3),
  ].join('\t'));
}
const mean = (t, k) => {
  const v = rows.filter((r) => r.truth === t).map((r) => r.s[k]);
  return v.reduce((a, b) => a + b, 0) / v.length;
};
console.log('\n-- means by certified level --');
for (const k of ['top2000', 'top5000', 'offList', 'wordsPerSentence', 'longWords']) {
  console.log(`${k}\tB1=${mean('B1', k).toFixed(3)}\tB2=${mean('B2', k).toFixed(3)}`);
}
