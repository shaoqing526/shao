const fs = require('fs');
const f = process.argv[2];
let s = fs.readFileSync(f, 'utf8');
const oldLine = "  timePill.textContent = state.screen === 'intro' ? fmt(INTRO_SEC + BREATH_SEC + sumSecs(state.list) + OUTRO_SEC) : ('还剩 ' + fmt(remainSec()));";
const newLine = "  if (state.screen === 'care' || state.screen === 'done') { timePill.textContent = '已完成'; }\n  else if (state.screen === 'intro') { timePill.textContent = fmt(INTRO_SEC + BREATH_SEC + sumSecs(state.list) + OUTRO_SEC); }\n  else { timePill.textContent = '还剩 ' + fmt(remainSec()); }";
if (s.indexOf(oldLine) === -1) { console.log('PATTERN NOT FOUND'); process.exit(1); }
s = s.replace(oldLine, newLine);
fs.writeFileSync(f, s, 'utf8');
console.log('patched chrome');
