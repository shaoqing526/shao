'use strict';
const fs = require('fs');
const { PDF, glyphNameToUnicode } = require('./pdftext.js');

// ---------- content stream tokenizer ----------
function tokenize(str) {
  const toks = []; let i = 0; const n = str.length;
  while (i < n) {
    const c = str[i];
    if (c === '%') { while (i < n && str[i] !== '\n' && str[i] !== '\r') i++; continue; }
    if (c === ' ' || c === '\n' || c === '\r' || c === '\t' || c === '\f' || c === '\0') { i++; continue; }
    if (c === '(') {
      i++; let depth = 1; const bytes = [];
      while (i < n) {
        let ch = str[i];
        if (ch === '\\') {
          const nx = str[i+1];
          const map = { n:10, r:13, t:9, b:8, f:12, '(':40, ')':41, '\\':92 };
          if (map[nx] !== undefined) { bytes.push(map[nx]); i += 2; }
          else if (nx === '\r') { i += 2; if (str[i] === '\n') i++; }
          else if (nx === '\n') { i += 2; }
          else if (nx >= '0' && nx <= '7') { let oct=''; i++; while (oct.length<3 && str[i]>='0' && str[i]<='7') { oct+=str[i]; i++; } bytes.push(parseInt(oct,8)&255); }
          else { bytes.push(nx.charCodeAt(0)&255); i += 2; }
          continue;
        }
        if (ch === '(') depth++;
        else if (ch === ')') { depth--; if (depth === 0) { i++; break; } }
        bytes.push(ch.charCodeAt(0) & 255); i++;
      }
      toks.push({ t: 'str', bytes });
      continue;
    }
    if (c === '<' && str[i+1] === '<') {
      i += 2; let depth = 1;
      while (i < n && depth > 0) { if (str[i] === '<' && str[i+1] === '<') { depth++; i += 2; } else if (str[i] === '>' && str[i+1] === '>') { depth--; i += 2; } else i++; }
      toks.push({ t: 'dict' }); continue;
    }
    if (c === '<') {
      i++; let hex = '';
      while (i < n && str[i] !== '>') { hex += str[i]; i++; }
      i++;
      hex = hex.replace(/[^0-9A-Fa-f]/g, ''); if (hex.length % 2) hex += '0';
      const bytes = []; for (let k = 0; k < hex.length; k += 2) bytes.push(parseInt(hex.substr(k,2),16));
      toks.push({ t: 'str', bytes }); continue;
    }
    if (c === '[') { toks.push({ t: '[' }); i++; continue; }
    if (c === ']') { toks.push({ t: ']' }); i++; continue; }
    if (c === '{') { toks.push({ t: '{' }); i++; continue; }
    if (c === '}') { toks.push({ t: '}' }); i++; continue; }
    if (c === '/') {
      i++; let s = '';
      while (i < n && !/[\s\0()<>[\]{}/%]/.test(str[i])) { s += str[i]; i++; }
      toks.push({ t: 'name', v: s.replace(/#([0-9A-Fa-f]{2})/g, (_,h)=>String.fromCharCode(parseInt(h,16))) });
      continue;
    }
    const numM = /^[+-]?(?:\d+\.?\d*|\.\d+)/.exec(str.slice(i, i+30));
    if (numM) { toks.push({ t: 'num', v: parseFloat(numM[0]) }); i += numM[0].length; continue; }
    const idM = /^[^\s\0()<>[\]{}/%]+/.exec(str.slice(i, i+40));
    if (idM) { toks.push({ t: 'op', v: idM[0] }); i += idM[0].length; continue; }
    i++;
  }
  return toks;
}

// ---------- CMap ----------
function parseCMap(buf) {
  const s = buf.toString('latin1');
  const map = new Map();
  const cidRange = [];
  const parseHex = (h) => { h = h.replace(/[^0-9A-Fa-f]/g,''); return { val: parseInt(h || '0', 16), len: h.length/2 }; };
  const utf16 = (h) => {
    h = h.replace(/[^0-9A-Fa-f]/g,''); if (h.length % 4) h = h.padStart(Math.ceil(h.length/4)*4, '0');
    let out = ''; for (let i = 0; i < h.length; i += 4) out += String.fromCharCode(parseInt(h.substr(i,4),16));
    return out;
  };
  let m;
  const bfchar = /beginbfchar([\s\S]*?)endbfchar/g;
  while ((m = bfchar.exec(s))) {
    const re = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]*)>/g; let x;
    while ((x = re.exec(m[1]))) { const src = parseHex(x[1]); map.set(src.val, utf16(x[2])); }
  }
  const bfrange = /beginbfrange([\s\S]*?)endbfrange/g;
  while ((m = bfrange.exec(s))) {
    const body = m[1];
    const re1 = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g; let x;
    while ((x = re1.exec(body))) {
      const lo = parseHex(x[1]).val, hi = parseHex(x[2]).val, dst = parseHex(x[3]).val;
      for (let c = lo; c <= hi && c - lo < 65536; c++) map.set(c, utf16(dst + (c - lo)).length ? String.fromCharCode(dst + (c-lo)) : '');
    }
    const re2 = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*\[([^\]]*)\]/g;
    while ((x = re2.exec(body))) {
      const lo = parseHex(x[1]).val; const items = x[3].match(/<[0-9A-Fa-f]*>/g) || [];
      items.forEach((it, k) => map.set(lo + k, utf16(it.slice(1,-1))));
    }
  }
  return map;
}

function buildFontDecoder(pdf, fontDict) {
  if (!fontDict) return null;
  const sub = fontDict.Subtype;
  let bytesPerCode = sub === 'Type0' ? 2 : 1;
  const cmap = new Map();
  let hasMap = false;
  if (fontDict.ToUnicode && fontDict.ToUnicode.ref) {
    const data = pdf.streamData(fontDict.ToUnicode.num);
    if (data) { const m2 = parseCMap(data); for (const [k,v] of m2) { cmap.set(k,v); hasMap = true; } }
  }
  const widths = new Map();
  if (fontDict.Widths && Array.isArray(fontDict.Widths)) {
    const fc = fontDict.FirstChar || 0;
    fontDict.Widths.forEach((w, k) => widths.set(fc + k, w));
  }
  let defaultWidth = 500;
  const desc = fontDict.FontDescriptor && fontDict.FontDescriptor.ref ? pdf.dict(fontDict.FontDescriptor.num) : null;
  if (desc && typeof desc.MissingWidth === 'number') defaultWidth = desc.MissingWidth;
  // simple-font fallback via Encoding Differences
  const encMap = new Map();
  let enc = fontDict.Encoding;
  if (enc && enc.ref) enc = pdf.dict(enc.num);
  if (enc && typeof enc === 'object' && Array.isArray(enc.Differences)) {
    let code = 0;
    for (const it of enc.Differences) {
      if (typeof it === 'number') code = it;
      else { encMap.set(code, glyphNameToUnicode(it)); code++; }
    }
  }
  return {
    bytesPerCode,
    decode(bytes) {
      let out = '';
      if (bytesPerCode === 2) {
        for (let i = 0; i + 1 < bytes.length; i += 2) {
          const code = (bytes[i] << 8) | bytes[i+1];
          out += cmap.has(code) ? cmap.get(code) : '';
        }
      } else {
        for (let i = 0; i < bytes.length; i++) {
          const code = bytes[i];
          if (cmap.has(code)) out += cmap.get(code);
          else if (encMap.has(code)) out += encMap.get(code);
          else if (code >= 32 && code < 127) out += String.fromCharCode(code);
          else if (code >= 160 && code < 256) out += String.fromCharCode(code);
          else out += '';
        }
      }
      return out;
    },
    width(code) {
      if (widths.has(code)) return widths.get(code) / 1000;
      return defaultWidth / 1000;
    },
    hasMap,
  };
}

// ---------- text extraction ----------
function extractPage(pdf, page) {
  const contentsRef = page.Contents;
  const refs = Array.isArray(contentsRef) ? contentsRef : [contentsRef];
  const chunks = [];
  for (const r of refs) {
    if (!r || !r.ref) continue;
    const d = pdf.streamData(r.num);
    if (d) chunks.push(d.toString('latin1'));
  }
  const content = chunks.join('\n');
  const res = page.Resources && page.Resources.ref ? pdf.dict(page.Resources.num) : page.Resources;
  const fontRes = res && res.Font ? (res.Font.ref ? pdf.dict(res.Font.num) : res.Font) : {};
  const decoders = new Map();
  const getDec = (name) => {
    if (decoders.has(name)) return decoders.get(name);
    let fd = fontRes ? fontRes[name] : null;
    if (fd && fd.ref) fd = pdf.dict(fd.num);
    const dec = buildFontDecoder(pdf, fd);
    decoders.set(name, dec);
    return dec;
  };

  const toks = tokenize(content);
  const stack = [];
  const runs = [];
  let Tm = [1,0,0,1,0,0], Tlm = [1,0,0,1,0,0];
  let Tfs = 12, Th = 100, Tc = 0, Tw = 0, TL = 0, Trise = 0;
  let curFont = null, curDec = null;
  let ctm = [1,0,0,1,0,0];
  const gs = [];
  let lastWasString = false;

  const mul = (a, b) => [a[0]*b[0]+a[1]*b[2], a[0]*b[1]+a[1]*b[3], a[2]*b[0]+a[3]*b[2], a[2]*b[1]+a[3]*b[3], a[4]*b[0]+a[5]*b[2]+b[4], a[4]*b[1]+a[5]*b[3]+b[5]];
  const apply = (m, x, y) => [m[0]*x + m[2]*y + m[4], m[1]*x + m[3]*y + m[5]];

  function showString(bytes, dec) {
    if (!dec) return;
    const text = dec.decode(bytes);
    const p = apply(mul(Tm, ctm), 0, 0);
    const size = Tfs * Math.hypot(ctm[2], ctm[3]);
    if (text.trim().length) runs.push({ x: p[0], y: p[1], size, text });
    else if (text.length) runs.push({ x: p[0], y: p[1], size, text });
    // advance
    let adv = 0;
    if (dec.bytesPerCode === 2) {
      for (let i = 0; i + 1 < bytes.length; i += 2) adv += dec.width((bytes[i]<<8)|bytes[i+1]);
    } else {
      for (let i = 0; i < bytes.length; i++) adv += dec.width(bytes[i]);
    }
    Tm = mul([1,0,0,1, adv * Tfs * Th/100 + (Tc + Tw) * (bytes.length ? 1 : 0), 0], Tm);
  }

  for (let i = 0; i < toks.length; i++) {
    const tk = toks[i];
    if (tk.t === 'num' || tk.t === 'name' || tk.t === 'str' || tk.t === '[' || tk.t === ']' || tk.t === 'dict' || tk.t === '{' || tk.t === '}') {
      if (tk.t === '[') { stack.push({ marker: true, arr: [] }); continue; }
      if (tk.t === ']') { const m = stack.pop(); if (m && m.marker) stack.push({ t: 'arr', arr: m.arr }); continue; }
      if (tk.t === 'dict' || tk.t === '{' || tk.t === '}') continue;
      const top = stack[stack.length-1];
      if (top && top.marker) top.arr.push(tk); else stack.push(tk);
      continue;
    }
    if (tk.t !== 'op') continue;
    const op = tk.v;
    const popNum = () => { const v = stack.pop(); return v && typeof v.v === 'number' ? v.v : 0; };
    const pop = () => stack.pop();
    switch (op) {
      case 'q': gs.push(ctm.slice()); break;
      case 'Q': if (gs.length) ctm = gs.pop(); break;
      case 'cm': { const f=popNum(), e=popNum(), d=popNum(), c=popNum(), b=popNum(), a=popNum(); ctm = mul([a,b,c,d,e,f], ctm); break; }
      case 'BT': Tm = [1,0,0,1,0,0]; Tlm = [1,0,0,1,0,0]; stack.length = 0; break;
      case 'ET': break;
      case 'Tf': { const size = popNum(); const nameTok = pop(); curFont = nameTok && nameTok.v; Tfs = size; curDec = getDec(curFont); break; }
      case 'Td': { const ty = popNum(), tx = popNum(); Tlm = mul([1,0,0,1,tx,ty], Tlm); Tm = Tlm.slice(); break; }
      case 'TD': { const ty = popNum(), tx = popNum(); TL = -ty; Tlm = mul([1,0,0,1,tx,ty], Tlm); Tm = Tlm.slice(); break; }
      case 'Tm': { const f=popNum(), e=popNum(), d=popNum(), c=popNum(), b=popNum(), a=popNum(); Tm = [a,b,c,d,e,f]; Tlm = Tm.slice(); break; }
      case 'T*': { Tlm = mul([1,0,0,1,0,-TL], Tlm); Tm = Tlm.slice(); break; }
      case 'TL': TL = popNum(); break;
      case 'Tc': Tc = popNum(); break;
      case 'Tw': Tw = popNum(); break;
      case 'Tz': Th = popNum(); break;
      case 'Ts': Trise = popNum(); break;
      case 'Tj': { const s = pop(); if (s && s.t === 'str') showString(s.bytes, curDec); break; }
      case "'": { Tlm = mul([1,0,0,1,0,-TL], Tlm); Tm = Tlm.slice(); const s = pop(); if (s && s.t === 'str') showString(s.bytes, curDec); break; }
      case '"': { const s = stack.pop(); const tc = popNum(), tw = popNum(); Tw = tw; Tc = tc; Tlm = mul([1,0,0,1,0,-TL], Tlm); Tm = Tlm.slice(); if (s && s.t === 'str') showString(s.bytes, curDec); break; }
      case 'TJ': {
        const arrTok = pop();
        const arr = arrTok && arrTok.arr ? arrTok.arr : (Array.isArray(arrTok) ? arrTok : []);
        for (const el of arr) {
          if (el.t === 'str') showString(el.bytes, curDec);
          else if (el.t === 'num') { Tm = mul([1,0,0,1, -el.v/1000 * Tfs * Th/100, 0], Tm); }
        }
        break;
      }
      default: break;
    }
    stack.length = 0;
  }
  return runs;
}

function runsToLines(runs) {
  const items = runs.filter(r => r.text !== undefined && r.text.length);
  if (!items.length) return [];
  items.sort((a,b) => (b.y - a.y) || (a.x - b.x));
  const lines = [];
  let cur = null;
  for (const r of items) {
    const tol = Math.max(2, (r.size || 10) * 0.45);
    if (!cur || Math.abs(cur.y - r.y) > tol) { cur = { y: r.y, size: r.size, parts: [r] }; lines.push(cur); }
    else cur.parts.push(r);
  }
  const out = [];
  for (const ln of lines) {
    ln.parts.sort((a,b) => a.x - b.x);
    let s = '';
    let prev = null;
    for (const p of ln.parts) {
      if (prev) {
        const gap = p.x - prev.endX;
        if (gap > (ln.size * 0.18) && !/\s$/.test(s) && !/^\s/.test(p.text)) s += ' ';
      }
      const txt = p.text.replace(/\u0000/g,'');
      s += txt;
      prev = { endX: p.x + txt.length * ln.size * 0.42 };
    }
    out.push({ y: ln.y, size: ln.size, text: s });
  }
  return out;
}

module.exports = { extractPage, runsToLines, tokenize, buildFontDecoder, parseCMap };

if (require.main === module) {
  const pdf = new PDF(process.argv[2]);
  const pages = pdf.pages();
  const start = +(process.argv[3] || 0), end = +(process.argv[4] || start+1);
  for (let i = start; i < Math.min(end, pages.length); i++) {
    const runs = extractPage(pdf, pages[i]);
    const lines = runsToLines(runs);
    console.log(`\n=========== PAGE ${i+1} ===========`);
    console.log(lines.map(l => l.text).join('\n'));
  }
}
