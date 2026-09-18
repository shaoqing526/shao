const fs = require('fs');
const buf = fs.readFileSync(process.argv[2]);
const s = buf.toString('latin1');
let idx = s.indexOf('2732 0 obj');
console.log('2732 top-level at', idx);
if (idx>=0) console.log(JSON.stringify(s.slice(idx, idx+400)));
// show tail of file
console.log('--- tail 1500 ---');
console.log(JSON.stringify(s.slice(-1500)));
