import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage();
p.on('console', m => { if (m.type()==='error') console.log('CONSOLE ERR:', m.text().slice(0,120)); });
await p.goto('http://localhost:4331/prototype/listening-embed?variant=B', { waitUntil: 'load' });
const r = await p.evaluate(() => new Promise(res => {
  const a = document.querySelector('audio');
  const done = () => res({ duration: a.duration, networkState: a.networkState, readyState: a.readyState, currentTime: a.currentTime, error: a.error && a.error.code });
  a.addEventListener('loadedmetadata', done, { once: true });
  a.addEventListener('error', done, { once: true });
  setTimeout(done, 15000);
}));
console.log('AUDIO:', JSON.stringify(r));
await b.close();
