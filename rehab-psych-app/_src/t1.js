const {extractTopLevelObjs, expandObjStms, inflateData, parseValue} = require('./pdfobj.js');
const fs = require('fs');
const S = fs.readFileSync(process.argv[2]).toString('latin1');
const objs = expandObjStms(extractTopLevelObjs(S));
console.log('total objs', objs.size);
const missing=[]; for(let i=1;i<2738;i++) if(!objs.has(i)) missing.push(i);
console.log('missing', missing.length, missing.join(','));
// root
const rootDict = parseValue(S.slice(0,0)+objs.get(2423).dictText).v;
console.log('root:', JSON.stringify(rootDict));
const pagesDict = parseValue(objs.get(rootDict.Pages.num).dictText).v;
console.log('pages dict:', JSON.stringify(pagesDict).slice(0,400));
console.log('encrypt dict 2732 present?', objs.has(2732));
const o2733 = objs.get(2733);
console.log('2733 dict:', o2733 ? o2733.dictText.slice(0,600) : 'none');
