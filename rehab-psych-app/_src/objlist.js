const fs = require('fs');
const buf = fs.readFileSync(process.argv[2]);
const s = buf.toString('latin1');
const re = /(\d+)\s+(\d+)\s+obj/g;
let m, out=[];
while ((m = re.exec(s))) {
  const start = m.index;
  const head = s.slice(start, start+160).replace(/\r?\n/g,' ');
  out.push({num:+m[1], gen:+m[2], head});
}
console.log('total top-level objs:', out.length);
for (const o of out) {
  if (/\/Encrypt|\/ObjStm|\/XRef|\/Root|\/Info|trailer/i.test(o.head)) console.log(o.num, o.gen, '|', o.head.slice(0,150));
}
console.log('--- object numbers ---');
const nums = out.map(o=>o.num).sort((a,b)=>a-b);
console.log(nums.join(','));
