'use strict';
const fs = require('fs');
const zlib = require('zlib');

// ============ low level object scanner ============
function extractTopLevelObjs(S) {
  const objs = new Map();
  const re = /(\d+)\s+(\d+)\s+obj\b/g;
  let m;
  while ((m = re.exec(S))) {
    const num = +m[1], gen = +m[2], bodyStart = m.index + m[0].length;
    let e = S.indexOf('endobj', bodyStart);
    let st = S.indexOf('stream', bodyStart);
    let dictText = '', streamRaw = null, hasStream = false;
    if (st !== -1 && (e === -1 || st < e)) {
      const after = S.slice(st + 6, st + 8);
      if (after[0] === '\r' || after[0] === '\n') {
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
    if (!dictText) dictText = S.slice(bodyStart, e === -1 ? bodyStart + 800 : e);
    if (!objs.has(num)) objs.set(num, { num, gen, dictText, streamRaw, hasStream });
    re.lastIndex = (e === -1 ? bodyStart : e) + 6;
  }
  return objs;
}

function inflateData(b) {
  if (!b) return null;
  try { return zlib.inflateSync(b); } catch (e) {}
  try { return zlib.inflateRawSync(b); } catch (e) {}
  // maybe raw deflate without zlib header or with trailing junk
  try { return zlib.inflateSync(b.subarray(2)); } catch (e) {}
  return null;
}

function expandObjStms(objs) {
  const list = [...objs.values()].filter(o => /\/Type\s*\/ObjStm/.test(o.dictText));
  for (const o of list) {
    const data = inflateData(o.streamRaw);
    if (!data) continue;
    const N = +((o.dictText.match(/\/N\s+(\d+)/) || [])[1] || 0);
    const First = +((o.dictText.match(/\/First\s+(\d+)/) || [])[1] || 0);
    const head = data.slice(0, First).toString('latin1');
    const parts = head.trim().split(/\s+/).map(Number);
    for (let i = 0; i < N; i++) {
      const onum = parts[i * 2], off = parts[i * 2 + 1];
      if (onum === undefined || off === undefined) continue;
      const start = First + off;
      const end = (i + 1 < N && parts[(i + 1) * 2 + 1] !== undefined) ? First + parts[(i + 1) * 2 + 1] : data.length;
      if (!objs.has(onum)) {
        objs.set(onum, { num: onum, gen: 0, inObjStm: o.num, dictText: data.slice(start, end).toString('latin1'), streamRaw: null, hasStream: false });
      }
    }
  }
  return objs;
}

// ============ object body parser ============
class Lexer {
  constructor(s, i) { this.s = s; this.i = i === undefined ? 0 : i; }
  ws() { while (this.i < this.s.length && /[\s\0]/.test(this.s[this.i])) this.i++; }
  peek() { this.ws(); return this.s[this.i]; }
}

const DELIMS = '()<>[]{}/%';

function parseValue(s, i) {
  const L = new Lexer(s, i);
  return parseVal(L);
}

function parseVal(L) {
  L.ws();
  const s = L.s;
  if (L.i >= s.length) return { v: null, end: L.i };
  const c = s[L.i];
  if (c === '<') {
    if (s[L.i + 1] === '<') return parseDict(L);
    return parseHexString(L);
  }
  if (c === '(') return parseLiteralString(L);
  if (c === '[') return parseArray(L);
  if (c === '/') return parseName(L);
  if (c === ']' || c === '>' || c === ')') { L.i++; return { v: null, end: L.i }; }
  // number / keyword / reference
  const numMatch = /^[+-]?(\d+\.?\d*|\.\d+)/.exec(s.slice(L.i, L.i + 40));
  if (numMatch) {
    const start = L.i;
    L.i += numMatch[0].length;
    const save = L.i;
    // check for "num gen R"
    L.ws();
    const m2 = /^(\d+)\s+R\b/.exec(s.slice(L.i, L.i + 40));
    if (m2) {
      L.i += m2[0].length;
      return { v: { ref: true, num: parseInt(numMatch[0], 10), gen: parseInt(m2[1], 10) }, end: L.i };
    }
    L.i = save;
    return { v: parseFloat(numMatch[0]), end: L.i };
  }
  // keyword
  const kw = /^[A-Za-z*'"]+/.exec(s.slice(L.i, L.i + 20));
  if (kw) {
    L.i += kw[0].length;
    if (kw[0] === 'true') return { v: true, end: L.i };
    if (kw[0] === 'false') return { v: false, end: L.i };
    if (kw[0] === 'null') return { v: null, end: L.i };
    return { v: { keyword: kw[0] }, end: L.i };
  }
  L.i++;
  return { v: null, end: L.i };
}

function parseDict(L) {
  L.i += 2;
  const d = {};
  for (;;) {
    L.ws();
    if (L.i >= L.s.length) break;
    if (L.s[L.i] === '>' && L.s[L.i + 1] === '>') { L.i += 2; break; }
    if (L.s[L.i] !== '/') { const r = parseVal(L); if (r.end <= L.i) break; continue; }
    const k = parseName(L).v;
    const v = parseVal(L).v;
    d[k] = v;
  }
  return { v: d, end: L.i };
}

function parseName(L) {
  L.i++; // skip /
  let out = '';
  while (L.i < L.s.length && !/[\s\0()<>[\]{}/%]/.test(L.s[L.i])) { out += L.s[L.i]; L.i++; }
  // handle #xx escapes
  out = out.replace(/#([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  return { v: out, end: L.i };
}

function parseLiteralString(L) {
  L.i++; // skip (
  let depth = 1, out = '';
  while (L.i < L.s.length) {
    const c = L.s[L.i];
    if (c === '\\') {
      const n = L.s[L.i + 1];
      const map = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', '(': '(', ')': ')', '\\': '\\' };
      if (n in map) { out += map[n]; L.i += 2; }
      else if (n === '\r') { L.i += 2; if (L.s[L.i] === '\n') L.i++; }
      else if (n === '\n') { L.i += 2; }
      else if (/[0-7]/.test(n)) {
        let oct = '';
        L.i++;
        while (oct.length < 3 && /[0-7]/.test(L.s[L.i])) { oct += L.s[L.i]; L.i++; }
        out += String.fromCharCode(parseInt(oct, 8));
      } else { out += n; L.i += 2; }
      continue;
    }
    if (c === '(') depth++;
    if (c === ')') { depth--; if (depth === 0) { L.i++; break; } }
    out += c; L.i++;
  }
  return { v: out, end: L.i };
}

function parseHexString(L) {
  L.i++; // skip <
  let hex = '';
  while (L.i < L.s.length && L.s[L.i] !== '>') { hex += L.s[L.i]; L.i++; }
  L.i++; // skip >
  hex = hex.replace(/[^0-9A-Fa-f]/g, '');
  if (hex.length % 2) hex += '0';
  return { v: hex, end: L.i, hex: true };
}

function parseArray(L) {
  L.i++; // skip [
  const a = [];
  for (;;) {
    L.ws();
    if (L.i >= L.s.length) break;
    if (L.s[L.i] === ']') { L.i++; break; }
    const before = L.i;
    const r = parseVal(L);
    a.push(r.v);
    if (L.i <= before) { L.i++; }
  }
  return { v: a, end: L.i };
}

module.exports = { extractTopLevelObjs, expandObjStms, inflateData, parseValue, parseVal, Lexer };
