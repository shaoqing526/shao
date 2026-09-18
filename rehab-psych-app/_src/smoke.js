const fs = require('fs'), vm = require('vm');
const code = fs.readFileSync(process.argv[2], 'utf8');

function mkEl(id){
  return {
    id, innerHTML:'', textContent:'', value:'', className:'', disabled:false,
    style:{}, dataset:{}, classList:{ add(){}, remove(){} },
    setAttribute(){}, getAttribute(){ return null; },
    onclick:null, onkeydown:null,
    querySelectorAll(){ return []; }
  };
}
const els = new Map();
function getEl(id){ if(!els.has(id)) els.set(id, mkEl(id)); return els.get(id); }

const choiceBtns = [0,1,2].map(i => { const e = mkEl('choice'+i); e.dataset.i = String(i); return e; });
const stage = getEl('stage');
stage.querySelectorAll = (sel) => sel === '.choice' ? choiceBtns : [];

const listeners = {};
const documentStub = {
  getElementById: getEl,
  addEventListener: (k,f) => { (listeners[k] = listeners[k]||[]).push(f); }
};
const windowStub = { scrollTo(){}, };
const sandbox = { document: documentStub, window: windowStub, console, setTimeout, clearTimeout, Math, String, Object, Array, JSON };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

let errors = [];
function step(label, fn){ try { fn(); console.log('  ok  ' + label); } catch(e){ errors.push(label + ' -> ' + e.message); console.log('  ERR ' + label + ' -> ' + e.message); } }

step('run bundle', () => vm.runInContext(code, sandbox, { filename:'app.js' }));

const $ = getEl;
step('intro rendered', () => { if (!getEl('stage').innerHTML.includes('五分钟同行')) throw new Error('intro missing'); if (!getEl('startBtn')) throw new Error('no startBtn'); });

step('set name + start', () => { $('nameInput').value = '小北'; $('startBtn').onclick(); });
step('breath rendered', () => { if (getEl('stage').innerHTML.indexOf('先安放一下自己') < 0) throw new Error('breath missing'); });
step('skip breath', () => { $('skipBreath').onclick(); });

for (let sc = 0; sc < 5; sc++){
  step('scene ' + (sc+1) + ' rendered', () => { if (!stage.innerHTML || stage.innerHTML.length < 100) throw new Error('empty scene'); });
  step('scene ' + (sc+1) + ' choose option ' + (sc % 3 === 0 ? 'B' : 'A'), () => { choiceBtns[sc % 3 === 0 ? 1 : 0].onclick(); });
  step('scene ' + (sc+1) + ' feedback rendered', () => { if (getEl('stage').innerHTML.indexOf('工具箱') < 0) throw new Error('no tool card'); });
  step('scene ' + (sc+1) + ' retry works', () => { $('retryBtn').onclick(); });
  step('scene ' + (sc+1) + ' re-choose', () => { choiceBtns[1].onclick(); });
  step('scene ' + (sc+1) + ' next', () => { $('nextBtn').onclick(); });
}
step('outro rendered', () => { if (getEl('stage').innerHTML.indexOf('你陪') < 0) throw new Error('no outro'); });
step('bonus scene', () => { $('bonusBtn').onclick(); });
step('bonus choose', () => { choiceBtns[0].onclick(); });
step('bonus next -> outro', () => { $('nextBtn').onclick(); });
step('care screen', () => { $('careBtn').onclick(); });
step('care done', () => { $('careDone').onclick(); });
step('done screen + restart', () => { $('againBtn2').onclick(); });
step('restart ok', () => { if (getEl('stage').innerHTML.indexOf('五分钟同行') < 0) throw new Error('restart failed'); });
step('drawer opens', () => { getEl('openToolbox').onclick(); });
step('keyboard 1 selects', () => { $('startBtn').onclick(); $('skipBreath').onclick(); (listeners.keydown||[]).forEach(f => f({ key:'1' })); });

console.log('\nERRORS: ' + errors.length);
errors.forEach(e => console.log(' - ' + e));
