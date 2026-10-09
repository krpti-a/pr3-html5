// Asset pack (converted from the original SWF) and class registry.
export const pack: { symbols: Record<string, number>; chars: Record<number, any> } = { symbols: {}, chars: {} };
export const images: Record<number, HTMLImageElement | HTMLCanvasElement> = {};
export const classes: Record<string, any> = {}; // AS3 class name (short and qualified) -> constructor
const charToClass: Record<number, string> = {};

export function registerClass(qname: string, cls: any) {
  classes[qname] = cls;
  const short = qname.slice(qname.lastIndexOf('.') + 1);
  classes[short] ??= cls;
  if (pack.symbols[short] !== undefined && !cls.hasOwnProperty('__sym')) cls.__sym = short;
}

let autoBase: Record<string, any> = {};
export function setAutoBases(b: Record<string, any>) { autoBase = b; }

// Returns the class linked to a symbol name, generating a plain subclass when the
// original had no code (most [Embed] graphics classes are empty).
export function getDefinitionByName(name: string): any {
  const short = name.slice(name.lastIndexOf('.') + 1);
  let c = classes[name] ?? classes[short];
  if (c) return c;
  const id = pack.symbols[short] ?? pack.symbols[name];
  if (id === undefined) throw new ReferenceError(`Variable ${name} is not defined.`);
  const def = pack.chars[id];
  const base = autoBase[def?.t] ?? autoBase.sprite;
  c = { [short]: class extends base {} }[short];
  c.__sym = short;
  classes[short] = c;
  return c;
}

export function classForChar(id: number): any {
  if (!Object.keys(charToClass).length) for (const [n, i] of Object.entries(pack.symbols)) charToClass[i] = n;
  const n = charToClass[id];
  return n ? getDefinitionByName(n) : null;
}

declare const __BUILD__: string;
export const BUILD = typeof __BUILD__ === 'string' ? __BUILD__ : '0';
export async function loadPack(base: string, onProgress?: (f: number) => void) {
  let json: any;
  try {
    const res = await fetch(base + 'pack.json.z?v=' + BUILD);
    if (!res.ok || !('DecompressionStream' in globalThis)) throw 0;
    const ds = res.body!.pipeThrough(new DecompressionStream('deflate'));
    json = JSON.parse(await new Response(ds).text());
  } catch {
    json = await (await fetch(base + 'pack.json?v=' + BUILD)).json();
  }
  pack.symbols = json.symbols;
  pack.chars = json.chars;
  const imgs = Object.entries(pack.chars).filter(([, c]: any) => c.t === 'bitmap' && c.src);
  let done = 0;
  await Promise.all(imgs.map(([id, c]: any) => new Promise<void>(res => {
    const im = new Image();
    im.onload = im.onerror = () => { images[+id] = im; onProgress?.(++done / imgs.length); res(); };
    im.src = base + c.src + '?v=' + BUILD;
  })));
}
