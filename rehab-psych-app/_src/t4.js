const { PDF } = require('./pdftext.js');
const pdf = new PDF(process.argv[2]);
for (const n of [2708,2709,2710,2716,2717,2423]) {
  const d = pdf.dict(n);
  console.log('=== obj', n, '===');
  console.log(JSON.stringify(d).slice(0, 500));
}
// a font with ToUnicode
let shown=0;
for (const [num,o] of pdf.objs) {
  const d = pdf.dict(num);
  if (d && d.Type === 'Font' && d.ToUnicode && shown < 5) { console.log('--- font', num, JSON.stringify(d).slice(0,400)); shown++; }
}
