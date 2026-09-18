const fs = require('fs'), zlib = require('zlib');
const file = process.argv[2];
const buf = fs.readFileSync(file);
const S = buf.toString('latin1');
const L = buf.length;

// --- extract top-level objects ---
function extractObjects(S, len) {
  const objs = new Map();
  const re = /(\d+)\s+(\d+)\s+obj\b/g;
  let m;
  while ((m = re.exec(S))) {
    const num = +m[1], gen = +m[2];
    const bodyStart = m.index + m[0].length;
    // find endobj
    let e = S.indexOf('endobj', bodyStart);
    let st = S.indexOf('stream', bodyStart);
    let hasStream = false, dictText = '', streamRaw = null;
    if (st !== -1 && (e === -1 || st < e)) {
      // verify it is a real stream keyword
      const after = S.slice(st + 6, st + 8);
      if (after === '\r\n' || after === '\n' || after === '\r' || /^\s/.test(after)) {
        hasStream = true;
        dictText = S.slice(bodyStart, st);
        let ds = st + 6;
        if (S[ds] === '\r') ds++;
        if (S[ds] === '\n') ds++;
        const es = S.indexOf('endstream', ds);
        streamRaw = Buffer.from(S.slice(ds, es), 'latin1');
        e = S.indexOf('endobj', es);
      }
    }
    if (!dictText) dictText = S.slice(bodyStart, e === -1 ? bodyStart + 500 : e);
    objs.set(num, { num, gen, dictText, streamRaw, hasStream });
    re.lastIndex = (e === -1 ? bodyStart : e) + 6;
  }
  return objs;
}
const objs = extractObjects(S, L);
console.log('extracted objs:', objs.size);

// --- decompress ---
function inflate(b) { try { return zlib.inflateSync(b); } catch(e) { try { return zlib.inflateRawSync(b); } catch(e2) { return null; } } }

// --- expand object streams ---
function expandObjStm(objs) {
  let added = 0;
  const list = [...objs.values()].filter(o => /\/Type\s*\/ObjStm/.test(o.dictText));
  console.log('ObjStm count:', list.length);
  for (const o of list) {
    const data = inflate(o.streamRaw);
    if (!data) { console.log('fail inflate ObjStm', o.num); continue; }
    const N = +((o.dictText.match(/\/N\s+(\d+)/)||[])[1]||0);
    const First = +((o.dictText.match(/\/First\s+(\d+)/)||[])[1]||0);
    const head = data.slice(0, First).toString('latin1');
    const parts = head.trim().split(/\s+/).map(Number);
    for (let i = 0; i < N; i++) {
      const onum = parts[i*2], off = parts[i*2+1];
      const start = First + off;
      const end = (i+1 < N) ? First + parts[(i+1)*2+1] : data.length;
      const body = data.slice(start, end).toString('latin1');
      if (!objs.has(onum)) { objs.set(onum, {num: onum, gen: 0, inObjStm: o.num, dictText: body, hasStream: false, streamRaw: null}); added++; }
    }
  }
  console.log('objects added from ObjStm:', added, 'total', objs.size);
  return objs;
}
expandObjStm(objs);

// --- print encrypt dict & root ---
for (const n of [2732, 2423, 2421]) {
  const o = objs.get(n);
  console.log('=== obj', n, '===');
  console.log(o ? o.dictText.slice(0, 700) : 'MISSING');
}
const pg = [...objs.values()].filter(o=>/\/Type\s*\/Page[^s]/.test(o.dictText));
console.log('page objects:', pg.length);
const fonts = [...objs.values()].filter(o=>/\/Type\s*\/Font/.test(o.dictText));
console.log('fonts:', fonts.length);
const touni = [...objs.values()].filter(o=>/\/ToUnicode/.test(o.dictText));
console.log('ToUnicode refs:', touni.length);
const fnt = [...objs.values()].filter(o=>/\/FontFile[23]?\b/.test(o.dictText));
console.log('FontFile refs:', fnt.length);
console.log('obj keys sample:', [...objs.keys()].length);
