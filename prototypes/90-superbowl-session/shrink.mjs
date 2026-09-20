// PROTOTYPE #90 — the Oracle returns 2048px PNGs of 2-8 MB each. 20 of them is 90 MB,
// which is too much to commit even to a throwaway branch. 1100px webp keeps every label legible.
import sharp from 'sharp';
import { readdirSync, statSync, unlinkSync } from 'node:fs';
const dir = 'public/prototype/90-superbowl-session';
let before = 0, after = 0;
for (const f of readdirSync(dir).filter(f => f.endsWith('.png'))) {
  before += statSync(`${dir}/${f}`).size;
  const out = `${dir}/${f.replace(/\.png$/, '.webp')}`;
  await sharp(`${dir}/${f}`).resize(1100, 1100, { fit: 'inside' }).webp({ quality: 82 }).toFile(out);
  after += statSync(out).size;
  unlinkSync(`${dir}/${f}`);
}
console.log(`${(before/1e6).toFixed(1)} MB -> ${(after/1e6).toFixed(1)} MB`);
