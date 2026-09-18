const fs = require('fs');
const { PDF } = require('./pdftext.js');
const { extractPage, runsToLines } = require('./extract.js');
const pdf = new PDF(process.argv[2]);
const pages = pdf.pages();
const out = [];
for (let i = 0; i < pages.length; i++) {
  let lines = [];
  try { lines = runsToLines(extractPage(pdf, pages[i])); } catch (e) { lines = [{text:'[ERR '+e.message+']'}]; }
  out.push('<<<PAGE ' + (i+1) + '>>>\n' + lines.map(l => l.text).join('\n'));
}
fs.writeFileSync(process.argv[3], out.join('\n\n'), 'utf8');
console.log('pages written:', pages.length);
console.log('chars:', out.join('').length);
// outline
const ol = pdf.dict(2227);
console.log('outline dict:', JSON.stringify(ol).slice(0,300));
