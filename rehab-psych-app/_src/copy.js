const fs = require('fs');
const src = process.argv[2];
const dst = process.argv[3];
fs.copyFileSync(src, dst);
console.log('copied ->', dst, fs.statSync(dst).size);
