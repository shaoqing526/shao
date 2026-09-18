const fs = require('fs');
const s = fs.readFileSync(process.argv[2], 'utf8');
const blocks = [];
const re = /<script>([\s\S]*?)<\/script>/g;
let m;
while ((m = re.exec(s))) blocks.push(m[1]);
console.log('script blocks:', blocks.length);
fs.writeFileSync(process.argv[3], blocks.join('\n;\n'), 'utf8');
