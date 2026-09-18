const fs = require('fs');
const txt = fs.readFileSync(process.argv[2], 'utf8');
const pages = txt.split(/<<<PAGE (\d+)>>>/);
// pages[0] is '' then pairs
const doc = [];
for (let i = 1; i < pages.length; i += 2) doc.push({ n: +pages[i], t: pages[i+1] || '' });
const q = process.argv[3];
const n = +(process.argv[4] || 3);
const re = new RegExp(q, 'gi');
let count = 0;
for (const p of doc) {
  let m;
  const pp = p.t.replace(/\s+/g, ' ');
  const r2 = new RegExp(q, 'gi');
  while ((m = r2.exec(pp)) && count < n) {
    const s = Math.max(0, m.index - 320), e = Math.min(pp.length, m.index + 420);
    console.log('### PDF page ' + p.n + ' (printed ~' + (p.n - 17) + ')');
    console.log(pp.slice(s, e));
    console.log('');
    count++;
  }
  if (count >= n) break;
}
if (!count) console.log('no match for ' + q);
