// Headless entry (Node + fake DOM, see tools/headless): same boot as main.ts, but frames are driven by the harness.
import './flash/as3.ts';
import { loadPack, startPlayer, MovieClip, setErrorReporter, stage, getDefinitionByName, runFrame, render, clock } from './flash/index.ts';
import { initAll } from './game/all.ts';
import { $initSymbols, MainTimeline } from './game/refs.ts';

export const errors: string[] = [];
export async function boot(canvas: any) {
  setErrorReporter(e => errors.push(String(e?.stack ?? e).split('\n').slice(0, 6).join('\n  ')));
  await loadPack('assets/');
  $initSymbols();
  initAll();
  startPlayer(canvas, new MainTimeline() as MovieClip);
}
export { stage, getDefinitionByName, runFrame, render, clock };
export { zlibStats } from './flash/zlib.ts';
