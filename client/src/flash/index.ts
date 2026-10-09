// flash-lite: the subset of the Flash Player API that PR3 uses, implemented on Canvas2D/WebAudio.
export * from './geom.ts';
export * from './events.ts';
export * from './display.ts';
export * from './text.ts';
export * from './utils.ts';
export * from './media.ts';
export * from './misc.ts';
export { pack, images, classes, registerClass, getDefinitionByName, loadPack } from './assets.ts';
export { stage, startPlayer, runtime, runFrame, render } from './player.ts';
import { setAutoBases } from './assets.ts';
import { MovieClip, SimpleButton, BitmapData } from './display.ts';
import { Sound } from './media.ts';
export class Font { fontName = ''; fontStyle = 'regular'; fontType = 'embedded'; static registerFont() {} static enumerateFonts() { return []; } }
setAutoBases({ sprite: MovieClip, button: SimpleButton, bitmap: BitmapData, sound: Sound, font: Font });
export { canvasStats } from './canvas.ts';
export { rasterCacheStats, setRasterCache } from './rastercache.ts';
