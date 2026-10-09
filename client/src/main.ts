// PR3 HTML5 entry point: load the original assets, then start the ported game.
import './flash/as3.ts';
import { loadPack, startPlayer, preloadSounds, MovieClip, setErrorReporter, stage, getDefinitionByName, pack, runtime, rasterCacheStats, setRasterCache, canvasStats, BASE } from './flash/index.ts';
import { initAll } from './game/all.ts';
import { $initSymbols, MainTimeline } from './game/refs.ts';

setErrorReporter(e => { console.error(e); (window as any).__errs?.push(String(e?.stack ?? e).split('\n').slice(0, 5).join(' | ')); });
const bar = document.getElementById('bar') as HTMLElement | null;
await loadPack('assets/', f => { if (bar) bar.style.width = `${Math.round(f * 90)}%`; });
$initSymbols();
initAll();
preloadSounds();
document.getElementById('loading')?.remove();
startPlayer(document.getElementById('c') as HTMLCanvasElement, new MainTimeline() as MovieClip);
(window as any).pr3 = { stage, getDefinitionByName, pack, runtime, rasterCacheStats, setRasterCache, canvasStats, BASE };
