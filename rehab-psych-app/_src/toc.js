const { PDF } = require('./pdftext.js');
const pdf = new PDF(process.argv[2]);
// page lookup: map page object number -> index
const pages = pdf.pages();
const pageIndex = new Map();
pages.forEach((p, i) => { /* need object numbers */ });
// rebuild with numbers
const root = pdf.dict(2423);
const out = [];
const seen = new Set();
function walk(ref, depth, list) {
  let d = ref && ref.ref ? pdf.dict(ref.num) : ref;
  let cur = list;
  while (d && !seen.has(d)) {
    seen.add(d);
    out.push({ depth, title: d.Title, dest: JSON.stringify(d.Dest), a: JSON.stringify(d.A), num: null });
    if (d.First) walk(d.First, depth+1);
    d = d.Next ? (d.Next.ref ? pdf.dict(d.Next.num) : d.Next) : null;
  }
}
if (root.Outlines) walk(root.Outlines, 0);
console.log(out.map(o => '  '.repeat(o.depth) + '- ' + String(o.title).slice(0,90)).join('\n'));
console.log('total outline entries:', out.length);
