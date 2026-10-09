// Debug viewer: renders original SWF symbols with the flash-lite runtime (for visual verification).
import { loadPack, getDefinitionByName, startPlayer, Sprite, MovieClip, Bitmap, BitmapData, pack, TextField } from './flash/index.ts';
const q = new URLSearchParams(location.search);
await loadPack('assets/');
const root = new Sprite();
startPlayer(document.getElementById('c') as HTMLCanvasElement, root);
const names = (q.get('s') ?? 'MenuPageGraphic').split(',');
let x = 0;
for (const n of names) {
  const C = getDefinitionByName(n);
  const o = pack.chars[pack.symbols[n]]?.t === 'bitmap' ? new Bitmap(new C(0, 0)) : new C();
  if (q.get('f') && o instanceof MovieClip) o.gotoAndStop(+q.get('f')!);
  o.x = +(q.get('x') ?? 0) + x; o.y = +(q.get('y') ?? 0);
  if (q.get('sc')) o.scaleX = o.scaleY = +q.get('sc')!;
  root.addChild(o);
  x += +(q.get('dx') ?? 0);
}
(window as any).root = root;
(window as any).TF = TextField;
void BitmapData;
