const fs = require('fs');
const buf = fs.readFileSync(process.argv[2]);
const s = buf.toString('latin1');
console.log('size', buf.length);
console.log('header', JSON.stringify(s.slice(0,20)));
const count = (re) => (s.match(re)||[]).length;
console.log('obj count', count(/\d+\s+\d+\s+obj/g));
console.log('endobj', count(/endobj/g));
console.log('stream', count(/\bstream\b/g));
console.log('/FlateDecode', count(/\/FlateDecode/g));
console.log('/ObjStm', count(/\/ObjStm/g));
console.log('/XRef', count(/\/XRef/g));
console.log('/Encrypt', count(/\/Encrypt/g));
console.log('/Page', count(/\/Type\s*\/Page[^s]/g));
console.log('/Pages', count(/\/Type\s*\/Pages/g));
console.log('/Font', count(/\/Type\s*\/Font/g));
console.log('/ToUnicode', count(/\/ToUnicode/g));
console.log('/FontFile2', count(/\/FontFile2/g));
console.log('startxref count', count(/startxref/g));
const i = s.lastIndexOf('startxref');
console.log('tail:', JSON.stringify(s.slice(i, i+120)));
// trailer dicts
const tr = s.match(/trailer[\s\S]{0,400}/g);
console.log('trailers:', tr ? tr.length : 0);
if (tr) console.log(JSON.stringify(tr[tr.length-1].slice(0,400)));
// first object sample
const m = s.match(/\d+\s+\d+\s+obj[\s\S]{0,300}/);
console.log('first obj sample:', JSON.stringify(m && m[0].slice(0,300)));
