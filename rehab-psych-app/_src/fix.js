const fs = require('fs');
const f = process.argv[2];
let s = fs.readFileSync(f, 'utf8');
const LQ = String.fromCharCode(0x201C), RQ = String.fromCharCode(0x201D);
const before = (s.match(/~LQ~/g)||[]).length;
s = s.split('~LQ~').join(LQ).split('~RQ~').join(RQ);
fs.writeFileSync(f, s, 'utf8');
console.log('replaced LQ:', before, 'remaining placeholders:', (s.match(/~L[QR]~/g)||[]).length);
console.log('smart quotes now:', (s.match(/[\u201C\u201D]/g)||[]).length);
