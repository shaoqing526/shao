const fs = require('fs'), vm = require('vm');
const code = fs.readFileSync(process.argv[2], 'utf8');
function mkEl(id){ return { id, innerHTML:'', textContent:'', value:'', className:'', disabled:false, style:{}, dataset:{}, classList:{add(){},remove(){}}, setAttribute(){}, onclick:null, onkeydown:null, querySelectorAll(){return [];} }; }
const els = new Map();
const getEl = (id) => { if(!els.has(id)) els.set(id, mkEl(id)); return els.get(id); };
const choiceBtns = [0,1,2].map(i => { const e = mkEl('c'+i); e.dataset.i = String(i); return e; });
const stage = getEl('stage'); stage.querySelectorAll = (s) => s === '.choice' ? choiceBtns : [];
const sandbox = { document:{ getElementById:getEl, addEventListener(){} }, window:{ scrollTo(){} }, console, setTimeout, clearTimeout, Math, String, Object, Array, JSON };
sandbox.globalThis = sandbox; vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const txt = () => stage.innerHTML.replace(/<br\s*\/?>/g,'\n').replace(/<\/(p|div|h1|h2|h3|button|label)>/g,'\n').replace(/<[^>]+>/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/\n{2,}/g,'\n').trim();
const $ = getEl;
function show(t){ console.log('\n=================== ' + t + ' ===================\n' + txt()); }
show('INTRO');
$('nameInput').value='小北'; $('startBtn').onclick(); show('BREATH');
$('skipBreath').onclick();
for (let i=0;i<5;i++){
  show('SCENE ' + (i+1));
  choiceBtns[i===1?1:0].onclick();
  show('FEEDBACK ' + (i+1));
  $('nextBtn').onclick();
}
show('OUTRO');
$('bonusBtn').onclick(); show('BONUS'); choiceBtns[0].onclick(); $('nextBtn').onclick();
$('careBtn').onclick(); show('CARE');
$('careDone').onclick(); show('DONE');
