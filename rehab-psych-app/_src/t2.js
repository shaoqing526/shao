const {extractTopLevelObjs, expandObjStms, inflateData} = require('./pdfobj.js');
const fs = require('fs');
const S = fs.readFileSync(process.argv[2]).toString('latin1');
const objs = extractTopLevelObjs(S);
console.log('top', objs.size);
const stms = [...objs.values()].filter(o=>/\/Type\s*\/ObjStm/.test(o.dictText));
console.log('objstm found', stms.length, stms.map(o=>o.num).join(','));
for (const o of stms) {
  console.log('obj', o.num, 'hasStream', !!o.streamRaw, o.streamRaw ? o.streamRaw.length : 0, 'dict:', JSON.stringify(o.dictText.slice(0,80)));
  const d = inflateData(o.streamRaw);
  console.log('   inflate ->', d ? d.length : null);
}
