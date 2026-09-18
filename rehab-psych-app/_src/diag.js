const fs = require('fs'), zlib = require('zlib');
const file = process.argv[2];
const buf = fs.readFileSync(file);
const S = buf.toString('latin1');
function extractObjects(S) {
  const objs = new Map();
  const re = /(\d+)\s+(\d+)\s+obj\b/g; let m;
  while ((m = re.exec(S))) {
    const num=+m[1], gen=+m[2], bodyStart=m.index+m[0].length;
    let e=S.indexOf('endobj', bodyStart), st=S.indexOf('stream', bodyStart);
    let hasStream=false, dictText='', streamRaw=null;
    if (st!==-1 && (e===-1||st<e)) {
      const after=S.slice(st+6, st+8);
      if (after==='\r\n'||after==='\n'||after==='\r'||/^\s/.test(after)) {
        hasStream=true; dictText=S.slice(bodyStart, st);
        let ds=st+6; if(S[ds]==='\r')ds++; if(S[ds]==='\n')ds++;
        const es=S.indexOf('endstream', ds);
        streamRaw=Buffer.from(S.slice(ds,es),'latin1'); e=S.indexOf('endobj', es);
      }
    }
    if(!dictText) dictText=S.slice(bodyStart, e===-1?bodyStart+500:e);
    objs.set(num,{num,gen,dictText,streamRaw,hasStream});
    re.lastIndex=(e===-1?bodyStart:e)+6;
  }
  return objs;
}
const objs = extractObjects(S);
const present = new Set(objs.keys());
const missing=[]; for(let i=1;i<2738;i++) if(!present.has(i)) missing.push(i);
console.log('missing count', missing.length);
console.log('missing:', missing.join(','));
console.log('--- test inflate of a few streams ---');
function tryInflate(b){ const r={}; try{r.inflate=zlib.inflateSync(b).length}catch(e){r.inflateErr=e.message} try{r.raw=zlib.inflateRawSync(b).length}catch(e){r.rawErr=e.message} return r; }
for (const n of [2,6,2482,2541,2735]) { const o=objs.get(n); if(!o){console.log(n,'missing');continue;} console.log(n, 'len', o.streamRaw?o.streamRaw.length:'-', JSON.stringify(tryInflate(o.streamRaw))); }
console.log('--- all ObjStm ---');
for (const o of objs.values()) if(/\/Type\s*\/ObjStm/.test(o.dictText)) console.log('ObjStm obj', o.num, o.dictText.slice(0,120).replace(/\s+/g,' '));
