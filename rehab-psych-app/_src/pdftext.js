'use strict';
const fs = require('fs');
const { extractTopLevelObjs, expandObjStms, inflateData, parseValue } = require('./pdfobj.js');

const MAC_ROMAN = { 0x81:0x201A,0x8D:0x201C,0x8E:0x201D,0x8F:0x2018,0x90:0x2019,0x91:0x201C,0x92:0x201D,0x93:0x201C,0x94:0x201D,0x95:0x2022,0x96:0x2013,0x97:0x2014,0x98:0x02DC,0x99:0x2122,0x9A:0x0161,0x9B:0x203A,0x9C:0x0153,0x9D:0x2039,0x9E:0x017E,0x9F:0x0178 };
const WIN_ANSI_HIGH = { 0x80:0x20AC,0x82:0x201A,0x83:0x0192,0x84:0x201E,0x85:0x2026,0x86:0x2020,0x87:0x2021,0x88:0x02C6,0x89:0x2030,0x8A:0x0160,0x8B:0x2039,0x8C:0x0152,0x8E:0x017D,0x91:0x2018,0x92:0x2019,0x93:0x201C,0x94:0x201D,0x95:0x2022,0x96:0x2013,0x97:0x2014,0x98:0x02DC,0x99:0x2122,0x9A:0x0161,0x9B:0x203A,0x9C:0x0153,0x9E:0x017E,0x9F:0x0178 };
const GLYPH = { space:32,exclam:33,quotedbl:34,numbersign:35,dollar:36,percent:37,ampersand:38,quotesingle:39,parenleft:40,parenright:41,asterisk:42,plus:43,comma:44,hyphen:45,period:46,slash:47,zero:48,one:49,two:50,three:51,four:52,five:53,six:54,seven:55,eight:56,nine:57,colon:58,semicolon:59,less:60,equal:61,greater:62,question:63,at:64,bracketleft:91,backslash:92,bracketright:93,asciicircum:94,underscore:95,grave:96,braceleft:123,bar:124,braceright:125,asciitilde:126,quoteright:8217,quoteleft:8216,quotedblleft:8220,quotedblright:8221,quotesinglbase:8218,quotedblbase:8222,endash:8211,emdash:8212,bullet:8226,periodcentered:183,ellipsis:8230,fi:64257,fl:64258,ff:64256,ffi:64259,ffl:64260,AE:198,ae:230,OE:338,oe:339,oslash:248,Oslash:216,degree:176,adieresis:228,odieresis:246,udieresis:252,Adieresis:196,Odieresis:214,Udieresis:220,ssharp:223,acute:180,cedilla:184,circumflex:710,tilde:732,ogonek:731,macron:175,breve:728,caron:711,dotaccent:729,ring:730,hungarumlaut:733,dieresis:168,sterling:163,section:167,paragraph:182,dagger:8224,daggerdbl:8225,perthousand:8240,guilsinglleft:8249,guilsinglright:8250,fraction:8260,currency:164,cent:162,yen:165,florin:402,minus:8722,mu:181,multiply:215,divide:247,notequal:8800,infinity:8734,lessequal:8804,greaterequal:8805,partialdiff:8706,summation:8721,product:8719,pi:960,integral:8747,radical:8730,approxequal:8776,Delta:916,Omega:937,lozenge:9674,euro:8364,trademark:8482,onehalf:189,onequarter:188,threequarters:190,onesuperior:185,twosuperior:178,threesuperior:179,Agrave:192,Aacute:193,Acircumflex:194,Atilde:195,Aring:197,Ccedilla:199,Egrave:200,Eacute:201,Ecircumflex:202,Edieresis:203,Igrave:204,Iacute:205,Icircumflex:206,Idieresis:207,Ntilde:209,Ograve:210,Oacute:211,Ocircumflex:212,Otilde:213,Ugrave:217,Uacute:218,Ucircumflex:219,Yacute:221,agrave:224,aacute:225,acircumflex:226,atilde:227,aring:229,ccedilla:231,egrave:232,eacute:233,ecircumflex:234,edieresis:235,igrave:236,iacute:237,icircumflex:238,idieresis:239,ntilde:241,ograve:242,oacute:243,ocircumflex:244,otilde:245,ugrave:249,uacute:250,ucircumflex:251,yacute:253,ydieresis:255,Ydieresis:376 };
function glyphNameToUnicode(n) {
  if (GLYPH[n] !== undefined) return String.fromCodePoint(GLYPH[n]);
  let m = /^uni([0-9A-Fa-f]{4})$/.exec(n); if (m) return String.fromCodePoint(parseInt(m[1],16));
  m = /^u([0-9A-Fa-f]{4,6})$/.exec(n); if (m) return String.fromCodePoint(parseInt(m[1],16));
  if (n.length === 1) return n;
  return '';
}

// ---------------- PDF document ----------------
class PDF {
  constructor(file) {
    this.buf = fs.readFileSync(file);
    this.S = this.buf.toString('latin1');
    this.objs = expandObjStms(extractTopLevelObjs(this.S));
    this.cache = new Map();
  }
  raw(num) { return this.objs.get(num); }
  dict(num) {
    if (this.cache.has(num)) return this.cache.get(num);
    const o = this.objs.get(num);
    let d = null;
    if (o) { try { d = parseValue(o.dictText).v; } catch (e) { d = null; } }
    this.cache.set(num, d);
    return d;
  }
  resolve(v, depth) {
    depth = depth || 0;
    if (v && v.ref) return this.dict(v.num);
    return v;
  }
  streamData(num) {
    const o = this.objs.get(num);
    if (!o || !o.streamRaw) return null;
    let data = o.streamRaw;
    const d = this.dict(num) || {};
    const filters = d.Filter;
    const fl = filters ? (Array.isArray(filters) ? filters : [filters]) : [];
    for (const f of fl) {
      if (f === 'FlateDecode' || f === 'Fl') { const n = inflateData(data); if (n) data = n; else return null; }
      else if (f === 'ASCIIHexDecode') { data = Buffer.from(data.toString('latin1').replace(/[^0-9A-Fa-f]/g,''), 'hex'); }
      else if (f === 'ASCII85Decode') { /* rare */ }
    }
    return data;
  }
  pages() {
    const root = this.dict(2423) || this.findCatalog();
    const out = [];
    const seen = new Set();
    const walk = (ref) => {
      const d = ref && ref.ref ? this.dict(ref.num) : ref;
      if (!d || d.__seen) return;
      if (d.Type === 'Page') { out.push(d); return; }
      const kids = d.Kids || [];
      for (const k of kids) walk(k);
    };
    walk(root && root.Pages);
    return out;
  }
  findCatalog() {
    for (const [num, o] of this.objs) {
      if (/\/Type\s*\/Catalog/.test(o.dictText)) return this.dict(num);
    }
    return null;
  }
}

module.exports = { PDF, glyphNameToUnicode, MAC_ROMAN, WIN_ANSI_HIGH };
