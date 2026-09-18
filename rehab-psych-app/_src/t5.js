const { PDF } = require('./pdftext.js');
const { extractPage, runsToLines, tokenize } = require('./extract.js');
const pdf = new PDF(process.argv[2]);
const pages = pdf.pages();
console.log('pages', pages.length);
for (const idx of [0, 5, 10, 20]) {
  const p = pages[idx];
  const cref = p.Contents;
  const num = Array.isArray(cref) ? cref[0].num : cref.num;
  const o = pdf.objs.get(num);
  const d = pdf.streamData(num);
  console.log('page', idx+1, 'contents obj', num, 'rawlen', o && o.streamRaw ? o.streamRaw.length : null, 'decoded', d ? d.length : null, 'dict', JSON.stringify(pdf.dict(num)).slice(0,150));
  if (d) {
    const t = tokenize(d.toString('latin1'));
    console.log('  tokens', t.length, 'first ops:', t.filter(x=>x.t==='op').slice(0,25).map(x=>x.v).join(' '));
    console.log('  first 300 chars:', JSON.stringify(d.toString('latin1').slice(0,300)));
  }
}
