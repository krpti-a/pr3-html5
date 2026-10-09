// AS3 (FFDec output) -> TypeScript converter used to port the original PR3 client.
// It is a one-off migration tool: the generated files are then reviewed and edited by hand.
// Usage: node tools/as3ts/convert.ts <as3-root> <out-root> <file-list.txt>
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { tokenize, type Tok } from './lexer.ts';
import { RUNTIME_MEMBERS, RUNTIME_EXPORTS, RUNTIME_CLASS_BASES } from './runtime-api.ts';

const [asRoot, outRoot, listFile] = process.argv.slice(2);
const files = readFileSync(listFile, 'utf8').split('\n').map(s => s.trim()).filter(Boolean);

interface Member { name: string; static: boolean; kind: 'var' | 'const' | 'method' | 'get' | 'set'; type: string; init?: Tok[] }
interface ClassInfo {
  name: string; pkg: string; qname: string; base: string; file: string; out: string; isInterface: boolean;
  members: Map<string, Member[]>; toks: Tok[]; bodyStart: number; bodyEnd: number;
}
const classes = new Map<string, ClassInfo>();

// ---------------------------------------------------------------- phase 1: index
function skipBalanced(t: Tok[], i: number): number {
  const open = t[i].v, close = open === '(' ? ')' : open === '[' ? ']' : '}';
  let d = 0;
  for (; i < t.length; i++) { if (t[i].v === open) d++; else if (t[i].v === close && --d === 0) return i; }
  return i;
}
function sig(t: Tok[]) { return t.filter(x => x.k !== 'ws' && x.k !== 'com'); }
function readType(t: Tok[], i: number): [string, number] {
  // t[i] is first token of type (after ':')
  if (t[i].v === '*') return ['*', i + 1];
  let s = t[i].v; i++;
  while (t[i] && t[i].v === '.' && t[i + 1]) {
    if (t[i + 1].v === '<') { // Vector.<T>
      const [inner, j] = readType(t, i + 2);
      s = `Vector.<${inner}>`; i = j + 1; // skip '>'
    } else { s += '.' + t[i + 1].v; i += 2; }
  }
  return [s, i];
}
for (const f of files) {
  const src = readFileSync(join(asRoot, f), 'utf8').replace(/\r\n?/g, '\n');
  const all = tokenize(src);
  const t = sig(all);
  let i = 0, pkg = '';
  if (t[0]?.v === 'package') { i = 1; while (t[i].v !== '{') pkg += t[i++].v; }
  // find class/interface keyword at depth 1
  let ci = t.findIndex((x, k) => (x.v === 'class' || x.v === 'interface') && k > i);
  if (ci < 0) continue;
  const isInterface = t[ci].v === 'interface';
  const name = t[ci + 1].v;
  let base = '';
  let j = ci + 2;
  if (t[j].v === 'extends') { const [b, k] = readType(t, j + 1); base = b.slice(b.lastIndexOf('.') + 1); j = k; }
  while (t[j].v !== '{') j++;
  const bodyStart = j, bodyEnd = skipBalanced(t, j);
  const members = new Map<string, Member[]>();
  const add = (m: Member) => { (members.get(m.name) ?? members.set(m.name, []).get(m.name)!).push(m); };
  let k = bodyStart + 1;
  while (k < bodyEnd) {
    const mods = new Set<string>();
    if (t[k].v === '[') { k = skipBalanced(t, k) + 1; continue; }
    while (['public', 'private', 'protected', 'internal', 'static', 'override', 'final', 'native', 'dynamic'].includes(t[k].v) || (t[k].k === 'id' && t[k + 1]?.v === '::')) {
      if (t[k + 1]?.v === '::') { k += 2; continue; }
      mods.add(t[k].v); k++;
    }
    if (t[k].v === 'var' || t[k].v === 'const') {
      const kind = t[k].v as 'var' | 'const';
      const nm = t[k + 1].v;
      let type = '*', p = k + 2;
      if (t[p].v === ':') { [type, p] = readType(t, p + 1); }
      add({ name: nm, static: mods.has('static'), kind, type });
      while (p < bodyEnd && t[p].v !== ';') { if ('([{'.includes(t[p].v)) p = skipBalanced(t, p); p++; }
      k = p + 1; continue;
    }
    if (t[k].v === 'function') {
      let p = k + 1, kind: Member['kind'] = 'method';
      if ((t[p].v === 'get' || t[p].v === 'set') && t[p + 1].k === 'id' && t[p + 1].v !== '(') { kind = t[p].v as any; p++; }
      const nm = t[p].v; p++;
      p = skipBalanced(t, p) + 1;
      let type = '*';
      if (t[p].v === ':') [type, p] = readType(t, p + 1);
      if (!(nm === name && kind === 'method')) add({ name: nm, static: mods.has('static'), kind, type });
      if (t[p].v === '{') p = skipBalanced(t, p);
      k = p + 1; continue;
    }
    // static initializer statement
    let p = k;
    while (p < bodyEnd && t[p].v !== ';') { if ('([{'.includes(t[p].v)) p = skipBalanced(t, p); p++; }
    k = p + 1;
  }
  const rel = f.replace(/^com\/jiggmin\//, '').replace(/^net\/goldtreeservers\//, 'net/').replace(/^com\/sparkworkz\//, 'api/').replace(/^de\/polygonal\/math\//, 'util/').replace(/^com\/adobe\/utils\//, 'util/').replace(/\.as$/, '.ts');
  const out = /^(PlatformRacing3_fla|PlatformRacing3Client_fla)\//.test(f) ? 'symbols/' + rel.replace(/^[^/]+\//, '') : !f.includes('/') ? 'symbols/' + rel : rel;
  if (classes.has(name)) console.warn('duplicate class name', name, f, classes.get(name)!.file);
  classes.set(name, { name, pkg, qname: pkg ? pkg + '.' + name : name, base, file: f, out, isInterface, members, toks: all, bodyStart, bodyEnd });
}

// Handwritten replacement modules (not converted): name -> output path
const EXTRA: Record<string, string> = {
  Base64: 'util/codec.ts', Hex: 'util/codec.ts', MD5: 'util/codec.ts', Color: 'util/codec.ts',
  LuaState: 'lua/stubs.ts', GameLuaWrapper: 'lua/stubs.ts', PlayerLuaWrapper: 'lua/stubs.ts', LocalPlayerLuaWrapper: 'lua/stubs.ts',
  ProjectileEffectLuaWrapper: 'lua/stubs.ts', LockHandler: 'lua/stubs.ts', LockHolder: 'lua/stubs.ts', TypeLuaWrapper: 'lua/stubs.ts', LuaBufferUtils: 'lua/stubs.ts',
  BlockLuaWrapper: 'lua/stubs.ts', LevelLuaWrapper: 'lua/stubs.ts', GameEventLuaWrapper: 'lua/stubs.ts', LuaEventHandler: 'lua/stubs.ts',
  SpriteLuaWrapper: 'lua/stubs.ts', LuaReference: 'lua/stubs.ts',
  Encrypt: 'api/stubs.ts', DiscordHandler: 'api/stubs.ts', SWFWheel: 'api/stubs.ts', GameInput: 'api/stubs.ts', GameInputEvent: 'api/stubs.ts',
  Worker: 'api/stubs.ts', WorkerDomain: 'api/stubs.ts', WorkerState: 'api/stubs.ts', MessageChannel: 'api/stubs.ts', InternalWorker: 'api/stubs.ts',
  NativeProcess: 'api/stubs.ts', NativeProcessStartupInfo: 'api/stubs.ts', File: 'api/stubs.ts', FileStream: 'api/stubs.ts', FileMode: 'api/stubs.ts',
  Clipboard: 'api/stubs.ts', ClipboardFormats: 'api/stubs.ts', PNGEncoderOptions: 'api/stubs.ts', ContextMenuEvent: 'api/stubs.ts', TouchEvent: 'api/stubs.ts',
  TransformGestureEvent: 'api/stubs.ts', UncaughtErrorEvent: 'api/stubs.ts', Loader: 'api/stubs.ts', AESKey: 'api/stubs.ts', CBCMode: 'api/stubs.ts', IVMode: 'api/stubs.ts',
};
for (const [n, out] of Object.entries(EXTRA)) if (!classes.has(n)) classes.set(n, { name: n, pkg: 'extra', qname: n, base: '', file: '', out, isInterface: false, members: new Map(), toks: [], bodyStart: 0, bodyEnd: 0, extra: true } as any);
// SWF symbol classes without code are generated at runtime; expose them through refs too
const symbolNames: string[] = Object.keys(JSON.parse(readFileSync(join(dirname(listFile), '../../public/assets/pack.json'), 'utf8')).symbols)
  .filter(n => /^[A-Za-z_]\w*$/.test(n) && !classes.has(n));
for (const n of symbolNames) classes.set(n, { name: n, pkg: 'symbol', qname: n, base: '', file: '', out: '', isInterface: false, members: new Map(), toks: [], bodyStart: 0, bodyEnd: 0, symbol: true } as any);

// ---------------------------------------------------------------- member lookup through hierarchy
function lookup(cls: string, name: string, isStatic = false): { owner: string; m: Member } | null {
  // AS3 scope chain: instance traits (incl. inherited) shadow class statics in instance code
  if (!isStatic) { const r = lookup0(cls, name, false); if (r) return r; }
  return lookup0(cls, name, true);
}
function lookup0(cls: string, name: string, wantStatic: boolean): { owner: string; m: Member } | null {
  for (let c: string | undefined = cls; c;) {
    const info = classes.get(c);
    if (info) {
      const m = info.members.get(name)?.find(x => x.static === wantStatic);
      if (m) return { owner: c, m };
      c = info.base;
    } else {
      // runtime class chain
      const rm = RUNTIME_MEMBERS[c];
      if (!wantStatic && rm?.has(name)) return { owner: c, m: { name, static: false, kind: rm.get(name) as any, type: '*' } };
      c = RUNTIME_CLASS_BASES[c];
    }
  }
  return null;
}
const allMethods = new Set<string>(), allIntFields = new Set<string>(), nonIntFields = new Set<string>();
for (const c of classes.values()) for (const [n, ms] of c.members) for (const m of ms) {
  if (m.kind === 'method' && !m.static) allMethods.add(n);
  // instance fields only: statics (e.g. UpdateEnums.x:uint) say nothing about obj.x of an unknown obj
  if ((m.kind === 'var' || m.kind === 'set' || m.kind === 'get') && !m.static) (m.type === 'int' || m.type === 'uint' ? allIntFields : nonIntFields).add(n);
}
for (const [, rm] of Object.entries(RUNTIME_MEMBERS)) for (const [n, k] of rm) if (k === 'method') allMethods.add(n); else nonIntFields.add(n);
for (const n of allIntFields) if (nonIntFields.has(n)) allIntFields.delete(n);
const intFieldType = new Map<string, string>();
for (const c of classes.values()) for (const [n, ms] of c.members) for (const m of ms) if (allIntFields.has(n) && (m.type === 'int' || m.type === 'uint')) intFieldType.set(n, m.type);

// ---------------------------------------------------------------- phase 2: convert
const KW = new Set('as break case catch class const continue default delete do else extends false finally for function if implements import in instanceof interface internal is native new null package private protected public return super switch this throw to true try typeof use var void while with each get set namespace include dynamic final native override static undefined NaN Infinity arguments'.split(' '));
const GLOBALS = new Set('Math JSON Object Array String Number Boolean Date RegExp Error TypeError RangeError ReferenceError ArgumentError SyntaxError EvalError SecurityError isNaN isFinite parseInt parseFloat encodeURIComponent decodeURIComponent encodeURI decodeURI escape unescape int uint trace Function Class XML XMLList Vector undefined NaN Infinity'.split(' '));
const TSTYPE: Record<string, string> = { int: 'number', uint: 'number', Number: 'number', String: 'string', Boolean: 'boolean', void: 'void', '*': 'any', Object: 'any', Array: 'any[]', Function: 'Function', Class: 'any', XML: 'any', XMLList: 'any', Dictionary: 'any', Error: 'Error' };
const PRIM_IS: Record<string, string> = { int: '$int', uint: '$uint', Number: '$Number', String: '$String', Boolean: '$Boolean', Array: '$Array', Function: '$Function', Object: '$Object', Class: '$Class' };
const knownType = (t: string) => classes.has(t) || RUNTIME_EXPORTS.has(t);
function tsType(t: string): string {
  if (!t) return 'any';
  if (t.startsWith('Vector.<')) return tsType(t.slice(8, -1)) + '[]';
  const short = t.slice(t.lastIndexOf('.') + 1);
  if (TSTYPE[short]) return TSTYPE[short];
  if (classes.get(short)?.isInterface || (classes.get(short) as any)?.symbol) return 'any';
  return knownType(short) ? short : 'any';
}
function defaultFor(t: string) { return t === 'int' || t === 'uint' ? '0' : t === 'Number' ? 'NaN' : t === 'Boolean' ? 'false' : null; }

interface Ctx { cls: ClassInfo; isStatic: boolean; locals: Map<string, string>; used: Set<string>; needThis: boolean; warnings: string[]; undeclared?: Set<string> }

const join_ = (t: Tok[]) => t.map(x => x.v).join('');
function convertBody(toks: Tok[], ctx: Ctx, depth0 = 0): string {
  // toks: raw tokens (with ws) of a function body or initializer expression
  const out: string[] = [];
  const t = toks;
  const nextSig = (i: number) => { i++; while (i < t.length && (t[i].k === 'ws' || t[i].k === 'com')) i++; return i; };
  const prevSig = (i: number) => { i--; while (i >= 0 && (t[i].k === 'ws' || t[i].k === 'com')) i--; return i; };
  let fnDepth = depth0;
  const fnStack: number[] = []; // brace depth at which nested functions end
  let brace = 0;
  for (let i = 0; i < t.length; i++) {
    const x = t[i];
    if (x.v === '{') brace++;
    if (x.v === '}') { brace--; if (fnStack.length && fnStack[fnStack.length - 1] === brace) { fnStack.pop(); fnDepth--; } }
    if (x.k === 'xml') { out.push('({} as any)'); continue; }
    if (x.v === 'Object' && t[prevSig(i)]?.v === 'new' && t[nextSig(i)]?.v === '(' && t[nextSig(nextSig(i))]?.v === ')') {
      while (out.length && /^\s*$/.test(out[out.length - 1])) out.pop();
      if (out[out.length - 1] === 'new') out.pop();
      out.push('({} as any)'); i = nextSig(nextSig(i)); continue;
    }
    if (x.k !== 'id') { out.push(x.v); continue; }
    const v = x.v;
    const pi = prevSig(i), ni = nextSig(i);
    const prev = t[pi]?.v, next = t[ni]?.v;
    // var declarations: var name:Type
    if ((v === 'var' || v === 'const') && t[ni]?.k === 'id') {
      const nm = t[ni].v; let j = nextSig(ni), type = '*';
      if (t[j]?.v === ':') { const sj = nextSig(j); const st = sig(t.slice(sj, sj + 12)); const [ty, used] = readType(st, 0); type = ty; let c = 0, k = sj; while (c < used) { if (t[k].k !== 'ws' && t[k].k !== 'com') c++; k++; } j = k; while (t[j] && (t[j].k === 'ws')) j++; }
      ctx.locals.set(nm, type);
      noteType(type, ctx);
      const isForIn = t[j]?.v === 'in' || t[j]?.v === 'of';
      out.push(`var ${nm}${type !== '*' && !isForIn ? ': ' + tsType(type) : ''}`);
      const dflt = defaultFor(type);
      if (t[j]?.v !== '=' && !isForIn && dflt && t[j]?.v !== 'in') out.push(` = ${dflt}`);
      if (t[j]?.v === '=' && (type === 'int' || type === 'uint')) {
        // var x:int = expr;  -> coerce
        const end = stmtEnd(t, j + 1);
        out.push(` = ${type}(${convertBody(t.slice(j + 1, end), ctx, fnDepth).trim()})`);
        i = end - 1; continue;
      }
      i = j - 1; continue;
    }
    if (v === 'function' && prev !== '.') {
      // nested function expression: function name?(params):Type {
      let j = ni; let name = '';
      if (t[j]?.k === 'id') { name = t[j].v; ctx.locals.set(name, 'Function'); j = nextSig(j); }
      const pe = skipBalanced(t, j);
      const params = convertParams(t.slice(j + 1, pe), ctx);
      let k = nextSig(pe), ret = '';
      if (t[k]?.v === ':') { const sk = nextSig(k); const [ty, used] = readType(sig(t.slice(sk, sk + 12)), 0); ret = ': ' + tsType(ty); let c = 0, q = sk; while (c < used) { if (t[q].k !== 'ws' && t[q].k !== 'com') c++; q++; } k = q; while (t[k]?.k === 'ws') k++; }
      out.push(`function ${name}(${params.sig})${ret} `);
      if (params.coerce) { out.push('{' + params.coerce); fnDepth++; fnStack.push(brace); brace++; i = k; continue; }
      fnDepth++; fnStack.push(brace);
      i = k - 1; continue;
    }
    // for each ( ... in expr )
    if (v === 'for' && t[ni]?.v === 'each') {
      const po = nextSig(ni); const pe = skipBalanced(t, po);
      const inner = t.slice(po + 1, pe);
      const inIdx = findTop(inner, 'in');
      const lhs = convertBody(inner.slice(0, inIdx), ctx, fnDepth).trim().replace(/^(var\s+)?([\w$.]+)[\s\S]*$/, '$1$2');
      const rhs = convertBody(inner.slice(inIdx + 1), ctx, fnDepth).trim();
      ctx.used.add('$each');
      out.push(`for (${lhs} of $each(${rhs}))`);
      i = pe; continue;
    }
    if (v === 'for' && t[ni]?.v === '(') {
      const pe = skipBalanced(t, ni); const inner = t.slice(ni + 1, pe);
      const inIdx = findTop(inner, 'in');
      if (inIdx >= 0 && findTop(inner, ';') < 0) {
        const lhs = convertBody(inner.slice(0, inIdx), ctx, fnDepth).trim().replace(/^(var\s+)?([\w$.]+)[\s\S]*$/, '$1$2');
        const rhs = convertBody(inner.slice(inIdx + 1), ctx, fnDepth).trim();
        ctx.used.add('$keys');
        out.push(`for (${lhs} of $keys(${rhs}))`);
        i = pe; continue;
      }
    }
    if (v === 'catch' && t[ni]?.v === '(') {
      const pe = skipBalanced(t, ni); const nm = sig(t.slice(ni + 1, pe))[0]?.v ?? 'e';
      ctx.locals.set(nm, '*');
      out.push(`catch (${nm})`); i = pe; continue;
    }
    if (v === 'is' && prev !== '.') { const ty = t[ni].v; if (PRIM_IS[ty]) { ctx.used.add(PRIM_IS[ty]); out.push(`instanceof ${PRIM_IS[ty]}`); } else { out.push('instanceof '); out.push(convertTypeRef(ty, ctx)); } i = ni; continue; }
    if (v === 'as' && prev !== '.' && t[ni]?.k === 'id' && pi >= 0) {
      // rewrite "<operand> as T" -> $as(<operand>, T): operand = preceding postfix expression
      const ty = t[ni].v;
      let s = out.length - 1; while (s >= 0 && /^\s*$/.test(out[s])) s--;
      let e = s; let d = 0;
      for (; e >= 0; e--) {
        const o = out[e];
        if (o === ')' || o === ']') d++;
        else if (o === '(' || o === '[') { if (d === 0) break; d--; }
        else if (d === 0 && !/^[\w$.]+$/.test(o) && o !== '.') break;
      }
      const operand = out.splice(e + 1).join('');
      ctx.used.add('$as');
      out.push(`$as(${operand.trim()}, ${PRIM_IS[ty] ? (ctx.used.add(PRIM_IS[ty]), PRIM_IS[ty]) : convertTypeRef(ty, ctx)})`);
      i = ni; continue;
    }
    if (v === 'Vector' && next === '.') { // Vector.<T>(x) or new Vector.<T>()
      let j = nextSig(ni); // '<'
      let d = 0; for (; j < t.length; j++) { if (t[j].v === '<') d++; else if (t[j].v === '>' && --d === 0) break; else if (t[j].v === '>>') { d -= 2; if (d <= 0) break; } }
      const after = nextSig(j);
      if (prev === 'new') { out.splice(out.length - (out[out.length - 1] === ' ' ? 2 : 1), 1); if (out[out.length - 1]?.trim() === 'new') out.pop(); const pe = skipBalanced(t, after); const args = sig(t.slice(after + 1, pe)); out.push(args.length ? `new Array(${convertBody(t.slice(after + 1, pe), ctx, fnDepth)})` : '[]'); i = pe; continue; }
      if (t[after]?.v === '(') { const pe = skipBalanced(t, after); out.push(`(${convertBody(t.slice(after + 1, pe), ctx, fnDepth)})`); i = pe; continue; }
      i = j; out.push('Array'); continue;
    }
    if (prev === '.' || prev === '::') { // property access
      if (isAssignOp(next)) {
        // int/uint typed field assignment through a property chain -> coerce like AS3
        let e = out.length - 2; let d = 0;
        for (; e >= 0; e--) {
          const o = out[e];
          if (o === ')' || o === ']') d++;
          else if (o === '(' || o === '[') { if (d === 0) break; d--; }
          else if (d === 0 && !/^[\w$]+$/.test(o) && o !== '.') break;
        }
        const objExpr = out.slice(e + 1, out.length - 1).join('');
        let ty = '';
        const ot = exprType(objExpr, ctx);
        if (ot && classes.has(ot)) { const r = lookup(ot, v); if (r && (r.m.kind === 'var' || r.m.kind === 'set') && (r.m.type === 'int' || r.m.type === 'uint')) ty = r.m.type; }
        else if (allIntFields.has(v) && !/^[A-Z]/.test(objExpr) && !ot) ty = intFieldType.get(v) ?? 'int';
        else if (/^[A-Z]\w*$/.test(objExpr) && classes.has(objExpr)) { const m = classes.get(objExpr)!.members.get(v)?.find(x => x.static); if (m && (m.type === 'int' || m.type === 'uint')) ty = m.type; }
        if (ty) { out.splice(e + 1); emitCoercedAssign(t, i, ni, `${objExpr}.${v}`, ty, ctx, out, fnDepth); i = stmtEnd(t, nextSig(ni)) - 1; continue; }
      }
      if (allMethods.has(v) && next !== '(' && !isAssignTarget(t, ni) && t[pi - 1]) {
        // bind method reference: <obj>.<m> -> $b(<obj>, 'm')
        let s = out.length - 1; // out ends with '.'
        let e = s - 1; let d = 0;
        for (; e >= 0; e--) {
          const o = out[e];
          if (o === ')' || o === ']') d++;
          else if (o === '(' || o === '[') { if (d === 0) break; d--; }
          else if (d === 0 && !/^[\w$]+$/.test(o) && o !== '.') break;
        }
        const objExpr = out.splice(e + 1).join('').replace(/\.$/, '');
        if (objExpr && objExpr !== 'super' && !/^[A-Z]/.test(objExpr.split('.')[0]) || objExpr.startsWith('this')) {
          if (objExpr === 'super') out.push(`super.${v}.bind(this)`);
          else { ctx.used.add('$b'); out.push(`$b(${objExpr}, '${v}')`); }
        } else out.push(objExpr + '.' + v);
        continue;
      }
      out.push(v); continue;
    }
    if (KW.has(v) && !(v === 'get' || v === 'set' || v === 'each' || v === 'namespace' || v === 'include')) {
      if (v === 'this' && fnDepth > 0) { out.push('this'); continue; }
      out.push(v); continue;
    }
    if (t[ni]?.v === ':' && (prev === '{' || prev === ',') && isObjKey(t, i)) { out.push(v); continue; }
    if (ctx.locals.has(v)) {
      const ty = ctx.locals.get(v)!;
      if ((ty === 'int' || ty === 'uint') && isAssignOp(t[ni]?.v)) { emitCoercedAssign(t, i, ni, v, ty, ctx, out, fnDepth); i = stmtEnd(t, nextSig(ni)) - 1; continue; }
      out.push(v); continue;
    }
    // class casts: Block(x) -> (x); int(x) stays
    if (next === '(' && prev !== 'new' && (classes.has(v) || RUNTIME_EXPORTS.has(v)) && !['int', 'uint', 'Number', 'String', 'Boolean', 'Array', 'Object', 'Date', 'Error', 'RegExp', 'XML', 'XMLList', 'Function'].includes(v) && /^[A-Z]/.test(v) && !RUNTIME_FUNCS.has(v)) {
      noteRef(v, ctx); out.push(''); continue;
    }
    // member resolution
    const r = lookup(ctx.cls.name, v, ctx.isStatic);
    if (r) {
      const prefix = r.m.static ? (r.owner === ctx.cls.name ? ctx.cls.name : r.owner) : fnDepth > 0 ? (ctx.needThis = true, '$this') : 'this';
      if (r.m.static) noteRef(r.owner, ctx);
      const isInt = (r.m.type === 'int' || r.m.type === 'uint') && (r.m.kind === 'var' || r.m.kind === 'set');
      if (isInt && isAssignOp(t[ni]?.v) && !r.m.static) { emitCoercedAssign(t, i, ni, `${prefix}.${v}`, r.m.type, ctx, out, fnDepth); i = stmtEnd(t, nextSig(ni)) - 1; continue; }
      if (r.m.kind === 'method' && !r.m.static && next !== '(' && !isAssignTarget(t, ni)) { ctx.used.add('$b'); out.push(`$b(${prefix}, '${v}')`); continue; }
      out.push(`${prefix}.${v}`); continue;
    }
    if (classes.has(v) || RUNTIME_EXPORTS.has(v)) { noteRef(v, ctx); out.push(v); continue; }
    if (PRIM_IS[v] || GLOBALS.has(v)) { if (v === 'int' || v === 'uint') ctx.used.add(v); out.push(v); continue; }
    // unknown identifier: FFDec sometimes drops local declarations -> declare as function var
    if (/^[a-z_$]/.test(v) && t[ni]?.v !== '(') (ctx.undeclared ??= new Set()).add(v);
    else ctx.warnings.push(`unresolved identifier ${v}`);
    out.push(v);
  }
  // int coercion for assignments through property chains: obj.intField op= expr
  return out.join('');
}
// Static type of a simple dotted expression (this.a.b, local.c, Class.d), or '' if unknown.
function exprType(expr: string, ctx: Ctx): string {
  if (!/^[\w$]+(\.[\w$]+)*$/.test(expr)) return '';
  const parts = expr.split('.');
  let cur = '';
  const first = parts[0];
  if (first === 'this' || first === '$this') cur = ctx.cls.name;
  else if (ctx.locals.has(first)) cur = ctx.locals.get(first)!;
  else if (classes.has(first)) { if (parts.length === 1) return ''; const m = classes.get(first)!.members.get(parts[1])?.find(x => x.static); if (!m) return ''; cur = m.type; parts.shift(); }
  else { const r = lookup(ctx.cls.name, first, ctx.isStatic); if (!r) return ''; cur = r.m.type; }
  cur = cur.slice(cur.lastIndexOf('.') + 1);
  for (let i = 1; i < parts.length; i++) {
    if (!classes.has(cur)) return '';
    const r = lookup(cur, parts[i]); if (!r) return '';
    cur = r.m.type.slice(r.m.type.lastIndexOf('.') + 1);
  }
  return cur;
}
const RUNTIME_FUNCS = new Set(['getTimer', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 'getDefinitionByName', 'getQualifiedClassName', 'navigateToURL', 'trace']);
function findTop(t: Tok[], v: string) { let d = 0; for (let i = 0; i < t.length; i++) { const x = t[i].v; if ('([{'.includes(x)) d++; else if (')]}'.includes(x)) d--; else if (d === 0 && x === v) return i; } return -1; }
function stmtEnd(t: Tok[], i: number) { let d = 0; for (; i < t.length; i++) { const x = t[i].v; if ('([{'.includes(x)) d++; else if (')]}'.includes(x)) { if (d === 0) return i; d--; } else if (d === 0 && (x === ';' || x === ',')) return i; } return i; }
function isAssignOp(v: string | undefined) { return v === '=' || v === '+=' || v === '-=' || v === '*=' || v === '/=' || v === '%='; }
function isAssignTarget(t: Tok[], ni: number) { return isAssignOp(t[ni]?.v); }
function isObjKey(t: Tok[], i: number) { void t; void i; return true; }
function emitCoercedAssign(t: Tok[], _i: number, ni: number, target: string, ty: string, ctx: Ctx, out: string[], depth: number) {
  const op = t[ni].v;
  const s = ni + 1, e = stmtEnd(t, s);
  const rhs = convertBody(t.slice(s, e), ctx, depth).trim();
  ctx.used.add(ty);
  out.push(op === '=' ? `${target} = ${ty}(${rhs})` : `${target} = ${ty}(${target} ${op[0]} (${rhs}))`);
}
function convertTypeRef(ty: string, ctx: Ctx) { noteRef(ty, ctx); return ty; }
function noteRef(name: string, ctx: Ctx) { ctx.used.add(name); }
function noteType(type: string, ctx: Ctx) { const s = type.startsWith('Vector.<') ? type.slice(8, -1) : type; const short = s.slice(s.lastIndexOf('.') + 1); if (knownType(short) && !TSTYPE[short]) ctx.used.add(short); }

function convertParams(t: Tok[], ctx: Ctx) {
  // param:Type = default, ...rest
  const parts: Tok[][] = []; let cur: Tok[] = []; let d = 0;
  for (const x of t) { if ('([{'.includes(x.v)) d++; if (')]}'.includes(x.v)) d--; if (d === 0 && x.v === ',') { parts.push(cur); cur = []; } else cur.push(x); }
  if (sig(cur).length) parts.push(cur);
  const sigs: string[] = []; let coerce = '';
  for (const p of parts) {
    const s = sig(p);
    let k = 0, rest = '';
    if (s[0]?.v === '...') { rest = '...'; k = 1; }
    const name = s[k].v; let type = '*'; k++;
    if (s[k]?.v === ':') { const [ty, j] = readType(s, k + 1); type = ty; k = j; }
    ctx.locals.set(name, type);
    noteType(type, ctx);
    let dflt = '';
    if (s[k]?.v === '=') dflt = ' = ' + convertBody(p.slice(p.indexOf(s[k]) + 1), ctx).trim();
    sigs.push(`${rest}${name}${rest ? ': any[]' : dflt ? '' : ': ' + tsType(type)}${dflt ? `: ${tsType(type)}${dflt}` : ''}`);
    if ((type === 'int' || type === 'uint') && !rest) { ctx.used.add(type); coerce += ` ${name} = ${type}(${name});`; }
  }
  return { sig: sigs.join(', '), coerce };
}

const RESERVED_TS = new Set(['constructor']);
function convertClass(c: ClassInfo): { code: string; deps: Set<string>; warnings: string[] } {
  const t = c.toks;
  const st = sig(t);
  // map sig indices back to raw token indices
  const rawIdx: number[] = []; t.forEach((x, i) => { if (x.k !== 'ws' && x.k !== 'com') rawIdx.push(i); });
  const used = new Set<string>(); const warnings: string[] = []; const staticDeps = new Set<string>();
  const lines: string[] = [];
  const members: string[] = [];
  const staticInit: string[] = [];
  const deferredInit: string[] = [];
  const declared = new Set<string>();
  const accessors = new Map<string, { get?: boolean; set?: boolean; override?: boolean; static?: boolean }>();
  let ctor = '';
  let k = c.bodyStart + 1;
  const bodyEnd = c.bodyEnd;
  const mkCtx = (isStatic: boolean): Ctx => ({ cls: c, isStatic, locals: new Map(), used, needThis: false, warnings });
  while (k < bodyEnd) {
    const mods = new Set<string>();
    if (st[k].v === '[') { k = skipBalanced(st, k) + 1; continue; }
    while (['public', 'private', 'protected', 'internal', 'static', 'override', 'final', 'native', 'dynamic'].includes(st[k].v) || st[k + 1]?.v === '::') {
      if (st[k + 1]?.v === '::') { k += 2; continue; }
      mods.add(st[k].v); k++;
    }
    const isStatic = mods.has('static');
    if (st[k].v === 'var' || st[k].v === 'const') {
      const nm = st[k + 1].v; let type = '*', p = k + 2;
      if (st[p].v === ':') [type, p] = readType(st, p + 1);
      noteType(type, mkCtx(isStatic));
      let init = '';
      let deferred = false;
      if (st[p].v === '=') {
        const s = rawIdx[p] + 1; let q = p; while (q < bodyEnd && st[q].v !== ';') { if ('([{'.includes(st[q].v)) q = skipBalanced(st, q); q++; }
        const ctx = mkCtx(isStatic);
        ctx.used = new Set();
        init = convertBody(t.slice(s, rawIdx[q]), ctx).trim();
        for (const u of ctx.used) used.add(u);
        if (isStatic) for (const u of ctx.used) if (classes.has(u) && u !== c.name && !(classes.get(u) as any).symbol) { staticDeps.add(u); deferred = true; }
        if (isStatic && /\b[A-Z]\w*\(|new [A-Z]/.test(init) && [...ctx.used].some(u => (classes.get(u) as any)?.symbol)) deferred = true;
        p = q;
      } else while (p < bodyEnd && st[p].v !== ';') p++;
      if (deferred) { deferredInit.push(`${c.name}.${nm} = ${init};`); init = ''; }
      if (!init) { const d = defaultFor(type); if (d) init = d; }
      if (type === 'int' || type === 'uint') { if (init && !/^-?\d+$/.test(init)) init = `${type}(${init})`; if (init) used.add(type); }
      declared.add(nm);
      members.push(`  ${init ? '' : 'declare '}${isStatic ? 'static ' : ''}${nm}: ${tsType(type)}${init ? ' = ' + init : ''};`);
      k = p + 1; continue;
    }
    if (st[k].v === 'function') {
      let p = k + 1, kind = '';
      if ((st[p].v === 'get' || st[p].v === 'set') && st[p + 1].k === 'id' && st[p + 1].v !== '(') { kind = st[p].v; p++; }
      const nm = st[p].v; p++;
      const pe = skipBalanced(st, p);
      const ctx = mkCtx(isStatic);
      const params = convertParams(t.slice(rawIdx[p] + 1, rawIdx[pe]), ctx);
      p = pe + 1;
      let ret = '';
      if (st[p].v === ':') { const [ty, j] = readType(st, p + 1); ret = ty; noteType(ty, ctx); p = j; }
      if (st[p].v !== '{') { k = p + 1; continue; } // interface method
      const be = skipBalanced(st, p);
      // collect hoisted vars of the whole body for local resolution
      for (let q = p; q < be; q++) if ((st[q].v === 'var' || st[q].v === 'const') && st[q + 1]?.k === 'id') { let ty = '*'; if (st[q + 2]?.v === ':') ty = readType(st, q + 3)[0]; ctx.locals.set(st[q + 1].v, ty); }
      for (let q = p; q < be; q++) if (st[q].v === 'catch' && st[q + 1]?.v === '(') ctx.locals.set(st[q + 2].v, '*');
      let body = convertBody(t.slice(rawIdx[p] + 1, rawIdx[be]), ctx);
      if (ctx.undeclared?.size) { body = `\n    var ${[...ctx.undeclared].join(', ')}; // undeclared in decompiled source` + body; warnings.push(`auto-declared ${[...ctx.undeclared].join(',')} in ${nm}`); }
      if (ctx.needThis) body = '\n    const $this = this;' + body;
      if (params.coerce) body = '\n   ' + params.coerce + body;
      const isCtor = nm === c.name && !kind;
      const tret = ret && !isCtor && kind !== 'set' ? ': ' + tsType(ret) : '';
      if (isCtor && !c.base) body = body.replace(/^(\s*)super\(\);/m, '$1');
      if (isCtor && c.base) {
        const m = /^[ \t]*super\((.*)\);[ \t]*$/m.exec(body);
        if (m && body.slice(0, m.index).includes('this')) {
          if (/\bthis\b/.test(m[1])) warnings.push('ctor: super() args use this');
          body = body.slice(0, m.index) + body.slice(m.index + m[0].length);
          body = `\n         super(${m[1]});` + body;
        }
      }
      if (isCtor) ctor = `  constructor(${params.sig}) {${body}}`;
      else {
        if (kind) { const a = accessors.get(nm) ?? {}; a[kind as 'get' | 'set'] = true; if (mods.has('override')) a.override = true; a.static = isStatic; accessors.set(nm, a); }
        const name = RESERVED_TS.has(nm) ? `['${nm}']` : nm;
        members.push(`  ${isStatic ? 'static ' : ''}${kind ? kind + ' ' : ''}${name}(${params.sig})${tret} {${body}}`);
      }
      k = be + 1; continue;
    }
    // class-level statement -> static block
    let p = k; while (p < bodyEnd && st[p].v !== ';') { if ('([{'.includes(st[p].v)) p = skipBalanced(st, p); p++; }
    const ctx = mkCtx(true);
    staticInit.push(convertBody(t.slice(rawIdx[k], rawIdx[p] + 1), ctx).trim());
    for (const u of ctx.used) if (classes.has(u) && u !== c.name) staticDeps.add(u);
    k = p + 1;
  }
  // pair accessors overriding only one half
  for (const [nm, a] of accessors) {
    if (a.get && !a.set && (a.override || inheritsAccessor(c, nm))) members.push(`  ${a.static ? 'static ' : ''}set ${nm}(v: any) { super.${nm} = v; }`);
    if (a.set && !a.get && (a.override || inheritsAccessor(c, nm))) members.push(`  ${a.static ? 'static ' : ''}get ${nm}(): any { return super.${nm}; }`);
  }
  // fields shadowing an inherited accessor would break it; drop declare-only duplicates
  const base = c.base;
  staticInit.unshift(...deferredInit);
  if (staticInit.length) members.push(`  static __init() {\n    ${staticInit.join('\n    ')}\n  }`);
  const symbolLinked = !c.pkg || /_fla$/.test(c.pkg);
  if (symbolLinked) members.unshift(`  static __sym = '${c.pkg ? c.pkg + '.' + c.name : c.name}';`);
  for (const u of used) if (u === c.name) used.delete(u);
  const baseExpr = base ? base : '';
  if (baseExpr) used.add(baseExpr);
  lines.push(`export class ${c.name}${baseExpr ? ' extends ' + baseExpr : ''} {`);
  lines.push(...members.filter(m => !m.includes('declare ') || true));
  if (ctor) lines.push(ctor);
  lines.push('}');
  return { code: lines.join('\n'), deps: staticDeps, warnings };
}
function inheritsAccessor(c: ClassInfo, nm: string) { return !!c.base && !!lookup(c.base, nm); }

// ---------------------------------------------------------------- emit
const outputs: { c: ClassInfo; code: string; used: Set<string>; deps: Set<string> }[] = [];
const report: string[] = [];
for (const c of classes.values()) {
  if (c.isInterface || (c as any).extra || (c as any).symbol) continue;
  const used = new Set<string>();
  const r = convertClass(c);
  // recover the used set from code text (simplest, robust)
  for (const m of r.code.matchAll(/(?<![\w$.])([A-Za-z_$][\w$]*)/g)) used.add(m[1]);
  outputs.push({ c, code: r.code, used, deps: r.deps });
  if (r.warnings.length) report.push(`${c.file}: ${[...new Set(r.warnings)].join(', ')}`);
}
const HELPERS = ['int', 'uint', '$int', '$uint', '$Number', '$String', '$Boolean', '$Array', '$Function', '$Object', '$Class', '$as', '$each', '$keys', '$b'];
for (const o of outputs) {
  const file = join(outRoot, o.c.out);
  const dir = dirname(file);
  const relTo = (p: string) => { let r = relative(dir, join(outRoot, p)); if (!r.startsWith('.')) r = './' + r; return r; };
  const imp: string[] = [];
  const rt = [...o.used].filter(u => RUNTIME_EXPORTS.has(u) && !classes.has(u)).sort();
  const hp = HELPERS.filter(h => o.used.has(h));
  if (rt.length) imp.push(`import { ${rt.join(', ')} } from '${relTo('../flash/index.ts')}';`);
  if (hp.length) imp.push(`import { ${hp.join(', ')} } from '${relTo('../flash/as3.ts')}';`);
  const base = o.c.base && classes.has(o.c.base) ? o.c.base : '';
  if (base) imp.push(`import { ${base} } from '${relTo(classes.get(base)!.out)}';`);
  const refs = [...o.used].filter(u => classes.has(u) && u !== o.c.name && u !== base && !classes.get(u)!.isInterface).sort();
  const baseInfo = base ? classes.get(base) : null;
  if (baseInfo && ((baseInfo as any).symbol)) report.push(`symbol base ${o.c.name} extends ${base}`);
  if (refs.length) imp.push(`import { ${refs.join(', ')} } from '${relTo('refs.ts')}';`);
  const reg = `import { $reg } from '${relTo('refs.ts')}';`;
  // AS3 `new Number(x)` / `new String()` etc. are primitives; in JS they'd be wrapper objects (indexOf/=== fail)
  const body = o.code.replace(/(?<![\w$.])new (Number|String|Boolean|int|uint)\(/g, '$1(');
  const code = `// Ported from ${o.c.file}\n${imp.join('\n')}\n${reg}\n\n${body}\n$reg('${o.c.qname}', ${o.c.name});\n`;
  mkdirSync(dir, { recursive: true });
  if (existsSync(file)) {
    const old = readFileSync(file, 'utf8');
    // never overwrite handwritten replacements or converted files marked as hand-edited
    if (!process.env.FORCE || !old.startsWith('// Ported from') || old.includes('@edited')) { report.push(`SKIP existing ${o.c.out}`); continue; }
  }
  writeFileSync(file, code);
}
// refs.ts: lazily-bound class references (breaks import cycles)
const refLines = [`// Generated: lazily bound class references so modules can reference each other without import cycles.`, `import { registerClass, getDefinitionByName } from '../flash/assets.ts';`];
const extras = [...classes.values()].filter(c => (c as any).extra);
for (const o of outputs) refLines.push(`import type { ${o.c.name} as ${o.c.name}$ } from './${o.c.out}';`);
for (const c of extras) refLines.push(`import type { ${c.name} as ${c.name}$ } from './${c.out}';`);
for (const o of outputs) refLines.push(`export type ${o.c.name} = ${o.c.name}$; export let ${o.c.name}: typeof ${o.c.name}$;`);
for (const c of extras) refLines.push(`export type ${c.name} = ${c.name}$; export let ${c.name}: typeof ${c.name}$;`);
refLines.push(`// symbol classes generated from the asset pack at startup`);
refLines.push(`export let ${symbolNames.join(': any, ')}: any;`);
refLines.push(`export type ${symbolNames.join(' = any; export type ')} = any;`);
refLines.push(`export function $reg(qname: string, cls: any) {`, `  registerClass(qname, cls);`, `  switch (qname.slice(qname.lastIndexOf('.') + 1)) {`);
for (const o of [...outputs.map(o => o.c), ...extras]) refLines.push(`    case '${o.name}': ${o.name} = cls; break;`);
refLines.push('  }', '}');
refLines.push(`export function $initSymbols() {`);
for (const n of symbolNames) refLines.push(`  ${n} = getDefinitionByName('${n}');`);
refLines.push('}');
writeFileSync(join(outRoot, 'refs.ts'), refLines.join('\n') + '\n');
// all.ts: import order = inheritance + static-init dependencies
const order: string[] = []; const seen = new Set<string>();
const visit = (n: string, stack: string[] = []) => {
  if (seen.has(n) || !classes.has(n)) return;
  if (stack.includes(n)) { report.push(`static-init cycle: ${[...stack, n].join(' -> ')}`); return; }
  const o = outputs.find(x => x.c.name === n); if (!o) return;
  const c = classes.get(n)!;
  if (c.base) visit(c.base, [...stack, n]);
  for (const d of o.deps) visit(d, [...stack, n]);
  seen.add(n); order.push(n);
};
for (const o of outputs) visit(o.c.name);
const extraFiles = [...new Set(extras.map(c => c.out))];
const inits = order.filter(n => outputs.find(o => o.c.name === n)!.code.includes('static __init()'));
writeFileSync(join(outRoot, 'all.ts'), `// Generated: loads every ported class, then runs deferred static initializers in dependency order.\n` +
  [...extraFiles.map(f => `import './${f}';`), ...order.map(n => `import './${classes.get(n)!.out}';`)].join('\n') +
  `\nimport { ${inits.join(', ')} } from './refs.ts';\nexport function initAll() {\n` + inits.map(n => `  (${n} as any).__init();`).join('\n') + '\n}\n');
writeFileSync(join(outRoot, 'convert-report.txt'), report.join('\n') + '\n');
console.log(`converted ${outputs.length} classes; ${report.length} report lines`);
