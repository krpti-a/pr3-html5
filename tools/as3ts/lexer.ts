// Tokenizer for AS3 source (FFDec output). Keeps whitespace/comments as tokens so code can be re-emitted.
export interface Tok { k: 'id' | 'num' | 'str' | 're' | 'ws' | 'com' | 'p' | 'xml'; v: string }

const PUNCT = ['>>>=', '===', '!==', '>>>', '<<=', '>>=', '...', '::', '==', '!=', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<', '>>'];
const REGEX_PREV = new Set(['(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';', '+', '-', '*', '%', '<', '>', '~', '^', 'return', 'typeof', 'case', 'in', 'of', 'new', 'delete', 'void', 'throw', '==', '!=', '===', '!==', '&&', '||', '+=', '-=']);

export function tokenize(s: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  const lastSig = () => { for (let k = out.length - 1; k >= 0; k--) if (out[k].k !== 'ws' && out[k].k !== 'com') return out[k]; return null; };
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { let j = i; while (j < s.length && /\s/.test(s[j])) j++; out.push({ k: 'ws', v: s.slice(i, j) }); i = j; continue; }
    if (c === '/' && s[i + 1] === '/') { let j = s.indexOf('\n', i); if (j < 0) j = s.length; out.push({ k: 'com', v: s.slice(i, j) }); i = j; continue; }
    if (c === '/' && s[i + 1] === '*') { let j = s.indexOf('*/', i + 2); j = j < 0 ? s.length : j + 2; out.push({ k: 'com', v: s.slice(i, j) }); i = j; continue; }
    if (/[A-Za-z_$§]/.test(c)) { let j = i; while (j < s.length && /[\w$§]/.test(s[j])) j++; out.push({ k: 'id', v: s.slice(i, j) }); i = j; continue; }
    if (/\d/.test(c) || (c === '.' && /\d/.test(s[i + 1]))) {
      let j = i;
      if (c === '0' && /[xX]/.test(s[i + 1])) { j += 2; while (/[0-9a-fA-F]/.test(s[j])) j++; }
      else { while (/[\d.]/.test(s[j])) j++; if (/[eE]/.test(s[j])) { j++; if (/[+-]/.test(s[j])) j++; while (/\d/.test(s[j])) j++; } }
      out.push({ k: 'num', v: s.slice(i, j) }); i = j; continue;
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < s.length && s[j] !== c) { if (s[j] === '\\') j++; j++; }
      out.push({ k: 'str', v: s.slice(i, j + 1) }); i = j + 1; continue;
    }
    if (c === '/') {
      const p = lastSig();
      if (!p || (p.k === 'p' && REGEX_PREV.has(p.v)) || (p.k === 'id' && REGEX_PREV.has(p.v))) {
        let j = i + 1, cls = false;
        while (j < s.length) { if (s[j] === '\\') { j += 2; continue; } if (s[j] === '[') cls = true; else if (s[j] === ']') cls = false; else if (s[j] === '/' && !cls) break; else if (s[j] === '\n') break; j++; }
        j++;
        while (/[gimsxy]/.test(s[j])) j++;
        out.push({ k: 're', v: s.slice(i, j) }); i = j; continue;
      }
    }
    if (c === '<' && /[A-Za-z]/.test(s[i + 1])) {
      const p = lastSig();
      if (p && (p.v === '=' || p.v === '(' || p.v === ',' || p.v === 'return')) {
        const m = /^<([A-Za-z]\w*)[^>]*?(\/>|>[\s\S]*?<\/\1>)/.exec(s.slice(i));
        if (m) { out.push({ k: 'xml', v: m[0] }); i += m[0].length; continue; }
      }
    }
    const p = PUNCT.find(x => s.startsWith(x, i));
    if (p) { out.push({ k: 'p', v: p }); i += p.length; continue; }
    out.push({ k: 'p', v: c }); i++;
  }
  return out;
}
