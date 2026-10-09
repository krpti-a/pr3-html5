// flash.net / flash.filters / flash.ui / flash.system odds and ends.
import { EventDispatcher, Event, IOErrorEvent } from './events.ts';

// ---------- SharedObject (localStorage-backed)
export class SharedObject extends EventDispatcher {
  static _all: Record<string, SharedObject> = {};
  data: any = {}; private key: string;
  constructor(key: string) { super(); this.key = key; try { this.data = JSON.parse(localStorage.getItem(key) ?? '{}') ?? {}; } catch { this.data = {}; } }
  static getLocal(name: string, _path: string | null = null, _secure = false) { const k = 'pr3so:' + name; return (this._all[k] ??= new SharedObject(k)); }
  flush(_min = 0) { try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch {} return 'flushed'; }
  clear() { this.data = {}; try { localStorage.removeItem(this.key); } catch {} }
  setProperty(k: string, v: any) { this.data[k] = v; this.flush(); }
  get size() { return JSON.stringify(this.data).length; }
  close() { this.flush(); }
  static flushAll() { for (const s of Object.values(this._all)) s.flush(); }
}
addEventListener('pagehide', () => SharedObject.flushAll());

// ---------- URL loading (only used by code paths that still fetch plain URLs)
export class URLRequest { url: string; method = 'GET'; data: any = null; contentType: string | null = null; requestHeaders: any[] = []; constructor(url = '') { this.url = url; } }
export class URLRequestHeader { constructor(public name = '', public value = '') {} }
export const URLRequestMethod = { GET: 'GET', POST: 'POST' };
export const URLLoaderDataFormat = { TEXT: 'text', BINARY: 'binary', VARIABLES: 'variables' };
export class URLVariables {
  [k: string]: any;
  constructor(s: string | null = null) { if (s) this.decode(s); }
  decode(s: string) { for (const [k, v] of new URLSearchParams(s)) this[k] = v; }
  toString() { const p = new URLSearchParams(); for (const k of Object.keys(this)) if (typeof this[k] !== 'function') p.append(k, String(this[k])); return p.toString(); }
}
export class URLLoader extends EventDispatcher {
  data: any = null; dataFormat = 'text'; bytesLoaded = 0; bytesTotal = 0;
  constructor(req: URLRequest | null = null) { super(); if (req) this.load(req); }
  load(req: URLRequest) {
    const init: RequestInit = { method: req.method };
    if (req.method === 'POST' && req.data) init.body = String(req.data);
    fetch(req.url, init).then(r => (r.ok ? r.text() : Promise.reject(r.status))).then(t => {
      this.data = this.dataFormat === 'variables' ? new URLVariables(t) : t;
      this.dispatchEvent(new Event(Event.COMPLETE));
    }).catch(() => this.dispatchEvent(new IOErrorEvent(IOErrorEvent.IO_ERROR)));
  }
  close() {}
}

// ---------- filters (rendered approximately via canvas filters)
export class BitmapFilter { _t = ''; clone(): any { return Object.assign(Object.create(Object.getPrototypeOf(this)), this); } }
export class GlowFilter extends BitmapFilter {
  _t = 'glow';
  constructor(public color = 0xff0000, public alpha = 1, public blurX = 6, public blurY = 6, public strength = 2, public quality = 1, public inner = false, public knockout = false) { super(); }
}
export class DropShadowFilter extends BitmapFilter {
  _t = 'shadow';
  constructor(public distance = 4, public angle = 45, public color = 0, public alpha = 1, public blurX = 4, public blurY = 4, public strength = 1, public quality = 1, public inner = false, public knockout = false, public hideObject = false) { super(); }
}
export class BlurFilter extends BitmapFilter { _t = 'blur'; constructor(public blurX = 4, public blurY = 4, public quality = 1) { super(); } }
export class ColorMatrixFilter extends BitmapFilter { _t = 'cm'; matrix: number[]; constructor(matrix: number[] | null = null) { super(); this.matrix = matrix ?? [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0]; } }
export class BevelFilter extends BitmapFilter { _t = 'bevel'; constructor(public distance = 4, public angle = 45) { super(); } }
export const BitmapFilterQuality = { LOW: 1, MEDIUM: 2, HIGH: 3 };

// ---------- ui / system
export const Keyboard = {
  BACKSPACE: 8, TAB: 9, ENTER: 13, SHIFT: 16, CONTROL: 17, ALTERNATE: 18, CAPS_LOCK: 20, ESCAPE: 27, SPACE: 32,
  PAGE_UP: 33, PAGE_DOWN: 34, END: 35, HOME: 36, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, INSERT: 45, DELETE: 46,
  NUMBER_0: 48, NUMBER_1: 49, NUMBER_2: 50, NUMBER_3: 51, NUMBER_4: 52, NUMBER_5: 53, NUMBER_6: 54, NUMBER_7: 55, NUMBER_8: 56, NUMBER_9: 57,
  A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83,
  T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90, F1: 112, F2: 113, F11: 122, F12: 123, NUMPAD_ADD: 107, NUMPAD_SUBTRACT: 109,
  EQUAL: 187, MINUS: 189, COMMA: 188, PERIOD: 190, SLASH: 191, SEMICOLON: 186, BACKQUOTE: 192, LEFTBRACKET: 219, RIGHTBRACKET: 221, BACKSLASH: 220, QUOTE: 222,
};
export const KeyLocation = { STANDARD: 0, LEFT: 1, RIGHT: 2, NUM_PAD: 3 };
export const Mouse = {
  _hidden: false, _cursor: 'auto',
  hide() { this._hidden = true; }, show() { this._hidden = false; },
  get cursor() { return this._cursor; }, set cursor(v: string) { this._cursor = v; },
  supportsCursor: true, supportsNativeCursor: false,
};
export const MouseCursor = { AUTO: 'auto', ARROW: 'arrow', BUTTON: 'button', HAND: 'hand', IBEAM: 'ibeam' };
export class ContextMenu extends EventDispatcher { customItems: any[] = []; hideBuiltInItems() {} }
export class ContextMenuItem extends EventDispatcher { constructor(public caption = '', public separatorBefore = false, public enabled = true, public visible = true) { super(); } }
export const Capabilities = { version: 'WIN 32,0,0,0', playerType: 'PlugIn', isDebugger: false, os: navigator.platform, language: navigator.language?.slice(0, 2) ?? 'en', screenResolutionX: screen.width, screenResolutionY: screen.height, hasAudio: true, manufacturer: 'Adobe Windows' };
export const System = { gc() {}, totalMemory: 0, setClipboard(s: string) { navigator.clipboard?.writeText(s).catch(() => {}); }, pause() {}, resume() {} };
export const Security = { allowDomain() {}, loadPolicyFile() {}, sandboxType: 'remote' };
export const Multitouch = { inputMode: 'none', supportsTouchEvents: 'ontouchstart' in window };
export const MultitouchInputMode = { NONE: 'none', TOUCH_POINT: 'touchPoint', GESTURE: 'gesture' };
export const StageDisplayState = { NORMAL: 'normal', FULL_SCREEN: 'fullScreen', FULL_SCREEN_INTERACTIVE: 'fullScreenInteractive' };
export const StageQuality = { LOW: 'low', MEDIUM: 'medium', HIGH: 'high', BEST: 'best' };
export const BlendMode = { NORMAL: 'normal', LAYER: 'layer', MULTIPLY: 'multiply', SCREEN: 'screen', LIGHTEN: 'lighten', DARKEN: 'darken', DIFFERENCE: 'difference', ADD: 'add', SUBTRACT: 'subtract', INVERT: 'invert', ALPHA: 'alpha', ERASE: 'erase', OVERLAY: 'overlay', HARDLIGHT: 'hardlight' };
export const PixelSnapping = { NEVER: 'never', ALWAYS: 'always', AUTO: 'auto' };
export const GradientType = { LINEAR: 'linear', RADIAL: 'radial' };
export const SpreadMethod = { PAD: 'pad', REFLECT: 'reflect', REPEAT: 'repeat' };
export const InterpolationMethod = { RGB: 'rgb', LINEAR_RGB: 'linearRGB' };
export const LineScaleMode = { NORMAL: 'normal', NONE: 'none', VERTICAL: 'vertical', HORIZONTAL: 'horizontal' };
export const CapsStyle = { NONE: 'none', ROUND: 'round', SQUARE: 'square' };
export const JointStyle = { BEVEL: 'bevel', MITER: 'miter', ROUND: 'round' };
export const ExternalInterface = { available: false, addCallback() {}, call() { return null; } };
