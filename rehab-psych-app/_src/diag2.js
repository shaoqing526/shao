const fs=require('fs'), zlib=require('zlib');
const S=fs.readFileSync(process.argv[2]).toString('latin1');
function extractObjects(S){
  const objs=new Map(); const re=/(\d+)\s+(\d+)\s+obj\b/g; let m;
  while((m=re.exec(S))){
    const num=+m[1],gen=+m[2],bodyStart=m.index+m[0].length;
    let e=S.indexOf('endobj',bodyStart), st=S.indexOf('stream',bodyStart);
    let dictText='',streamRaw=null;
    if(st!==-1&&(e===-1||st<e)){
      const after=S.slice(st+6,st+8);
      if(after==='\r\n'||after==='\n'||after==='\r'||/^\s/.test(after)){
        dictText=S.slice(bodyStart,st); let ds=st+6; if(S[ds]==='\r')ds++; if(S[ds]==='\n')ds++;
        const es=S.indexOf('endstream',ds); streamRaw=Buffer.from(S.slice(ds,es),'latin1'); e=S.indexOf('endobj',es);
      }
    }
    if(!dictText) dictText=S.slice(bodyStart,e===-1?bodyStart+500:e);
    if(!objs.has(num)) objs.set(num,{num,gen,dictText,streamRaw});
    re.lastIndex=(e===-1?bodyStart:e)+6;
  }
  return objs;
}
const objs=extractObjects(S);
const keys=[...objs.keys()].sort((a,b)=>a-b);
console.log('top-level keys count', keys.length, 'min', keys[0], 'max', keys[keys.length-1]);
console.log('first 40:', keys.slice(0,40).join(','));
// ObjStm expansion detail
function inflate(b){try{return zlib.inflateSync(b);}catch(e){return null;}}
for (const n of [2482,2483,2489,2735,2736]) {
  const o=objs.get(n); if(!o){console.log('no obj',n);continue;}
  const d=inflate(o.streamRaw); if(!d){console.log('no inflate',n);continue;}
  const N=+(o.dictText.match(/\/N\s+(\d+)/)||[])[1], First=+(o.dictText.match(/\/First\s+(\d+)/)||[])[1];
  const parts=d.slice(0,First).toString('latin1').trim().split(/\s+/).map(Number);
  const nums=[]; for(let i=0;i<N;i++) nums.push(parts[i*2]);
  console.log('ObjStm',n,'N',N,'First',First,'contains objs:',nums.slice(0,12).join(','),'...',nums.slice(-3).join(','));
}
