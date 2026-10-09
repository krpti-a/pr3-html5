// flash.media via WebAudio. Embedded sounds are decoded up front; streamed music via load().
import { EventDispatcher, Event } from './events.ts';
import { pack, BUILD } from './assets.ts';

let ac: AudioContext | null = null;
let master: GainNode | null = null;
export function audio() {
  if (!ac) {
    ac = new (window.AudioContext || (window as any).webkitAudioContext)();
    master = ac.createGain(); master.connect(ac.destination);
  }
  return ac;
}
export function resumeAudio() { if (ac && ac.state !== 'running') ac.resume().catch(() => {}); }
const buffers: Record<number, AudioBuffer | null> = {};
const loading: Record<number, Promise<void>> = {};
let assetBase = 'assets/';
export function setSoundBase(b: string) { assetBase = b; }
function loadChar(id: number) {
  return (loading[id] ??= fetch(assetBase + pack.chars[id].src + '?v=' + BUILD).then(r => r.arrayBuffer())
    .then(b => audio().decodeAudioData(b)).then(buf => { buffers[id] = buf; }).catch(() => { buffers[id] = null; }));
}
export async function preloadSounds() {
  await Promise.all(Object.entries(pack.chars).filter(([, c]: any) => c.t === 'sound' && c.src).map(([id]) => loadChar(+id)));
}

export class SoundTransform {
  volume: number; pan: number; leftToLeft = 1; leftToRight = 0; rightToLeft = 0; rightToRight = 1;
  constructor(volume = 1, pan = 0) { this.volume = volume; this.pan = pan; }
}
export class SoundLoaderContext { constructor(public bufferTime = 1000, public checkPolicyFile = false) {} }

export class SoundChannel extends EventDispatcher {
  _src: AudioBufferSourceNode | null = null; _gain: GainNode | null = null; _pan: StereoPannerNode | null = null;
  _st = new SoundTransform(); _start = 0; _offset = 0; _el: HTMLAudioElement | null = null;
  get position() { return this._el ? this._el.currentTime * 1000 : ac ? (ac.currentTime - this._start) * 1000 + this._offset : 0; }
  get soundTransform() { return new SoundTransform(this._st.volume, this._st.pan); }
  set soundTransform(t: SoundTransform) { this._st = new SoundTransform(t?.volume ?? 1, t?.pan ?? 0); this._apply(); }
  get leftPeak() { return 0; } get rightPeak() { return 0; }
  _apply() {
    const v = Math.max(0, this._st.volume) * SoundMixer._st.volume;
    if (this._gain) this._gain.gain.value = v;
    if (this._pan) this._pan.pan.value = Math.max(-1, Math.min(1, this._st.pan));
    if (this._el) this._el.volume = Math.max(0, Math.min(1, v));
  }
  stop() {
    try { this._src?.stop(); } catch {}
    this._src?.disconnect(); this._src = null;
    if (this._el) { this._el.pause(); this._el.src = ''; this._el = null; }
    SoundMixer._ch.delete(this);
  }
}

export class Sound extends EventDispatcher {
  _id: number | undefined; _url: string | null = null; _el: HTMLAudioElement | null = null;
  bytesLoaded = 0; bytesTotal = 0; isBuffering = false; id3: any = {};
  constructor(req: any = null, _ctx: any = null) {
    super();
    const sym = (new.target as any).__sym;
    this._id = typeof sym === 'number' ? sym : sym !== undefined ? pack.symbols[sym] : undefined;
    if (req) this.load(req);
  }
  get length() { return this._id !== undefined ? (buffers[this._id]?.duration ?? 0) * 1000 : (this._el?.duration ?? 0) * 1000; }
  get url() { return this._url; }
  load(req: any, _ctx: any = null) {
    this._url = typeof req === 'string' ? req : req.url;
    this._el = new Audio(this._url!);
    this._el.preload = 'auto';
    this._el.addEventListener('canplaythrough', () => this.dispatchEvent(new Event(Event.COMPLETE)), { once: true });
    this._el.addEventListener('error', () => this.dispatchEvent(new Event('ioError')), { once: true });
  }
  close() { if (this._el) { this._el.src = ''; this._el = null; } }
  play(startTime = 0, loops = 0, st: SoundTransform | null = null): SoundChannel | null {
    const ch = new SoundChannel();
    if (st) ch._st = new SoundTransform(st.volume, st.pan);
    if (this._el && this._url) {
      const el = new Audio(this._url);
      el.loop = loops > 1;
      el.currentTime = startTime / 1000;
      ch._el = el; ch._apply();
      el.play().catch(() => {});
      el.addEventListener('ended', () => { SoundMixer._ch.delete(ch); ch.dispatchEvent(new Event(Event.SOUND_COMPLETE)); });
      SoundMixer._ch.add(ch);
      return ch;
    }
    if (this._id === undefined) return null;
    const buf = buffers[this._id];
    const a = audio();
    if (!buf || a.state !== 'running') { if (buf === undefined) loadChar(this._id); return ch; }
    const src = a.createBufferSource();
    src.buffer = buf;
    if (loops > 1) { src.loop = true; }
    const gain = a.createGain();
    const pan = a.createStereoPanner ? a.createStereoPanner() : null;
    src.connect(gain);
    if (pan) { gain.connect(pan); pan.connect(master!); } else gain.connect(master!);
    ch._src = src; ch._gain = gain; ch._pan = pan; ch._start = a.currentTime; ch._offset = startTime;
    ch._apply();
    src.onended = () => { if (ch._src === src) { SoundMixer._ch.delete(ch); ch.dispatchEvent(new Event(Event.SOUND_COMPLETE)); } };
    const off = Math.max(0, startTime / 1000);
    if (loops > 1) { src.start(0, off); const total = buf.duration * loops - off; src.stop(a.currentTime + Math.max(0, total)); }
    else src.start(0, off);
    SoundMixer._ch.add(ch);
    return ch;
  }
}

export class SoundMixer {
  static _st = new SoundTransform();
  static _ch = new Set<SoundChannel>();
  static get soundTransform() { return new SoundTransform(this._st.volume, this._st.pan); }
  static set soundTransform(t: SoundTransform) { this._st = new SoundTransform(t.volume, t.pan); for (const c of this._ch) c._apply(); }
  static stopAll() { for (const c of [...this._ch]) c.stop(); }
  static bufferTime = 1000;
}
