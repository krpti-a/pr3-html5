// flash.events equivalents with capture/target/bubble dispatch and ENTER_FRAME broadcast.
export class Event {
  static ENTER_FRAME = 'enterFrame'; static EXIT_FRAME = 'exitFrame'; static FRAME_CONSTRUCTED = 'frameConstructed';
  static ADDED = 'added'; static REMOVED = 'removed'; static ADDED_TO_STAGE = 'addedToStage'; static REMOVED_FROM_STAGE = 'removedFromStage';
  static CHANGE = 'change'; static COMPLETE = 'complete'; static OPEN = 'open'; static CLOSE = 'close'; static CONNECT = 'connect';
  static RESIZE = 'resize'; static ACTIVATE = 'activate'; static DEACTIVATE = 'deactivate'; static RENDER = 'render';
  static SELECT = 'select'; static CANCEL = 'cancel'; static SCROLL = 'scroll'; static INIT = 'init'; static UNLOAD = 'unload';
  static SOUND_COMPLETE = 'soundComplete'; static MOUSE_LEAVE = 'mouseLeave'; static TAB_CHILDREN_CHANGE = 'tabChildrenChange';
  static FULLSCREEN = 'fullScreen'; static CHANNEL_MESSAGE = 'channelMessage'; static WORKER_STATE = 'workerState';
  type: string; bubbles: boolean; cancelable: boolean;
  target: any = null; currentTarget: any = null; eventPhase = 2;
  _stop = 0; _prevented = false;
  constructor(type: string, bubbles = false, cancelable = false) { this.type = type; this.bubbles = bubbles; this.cancelable = cancelable; }
  stopPropagation() { this._stop = Math.max(this._stop, 1); }
  stopImmediatePropagation() { this._stop = 2; }
  preventDefault() { if (this.cancelable) this._prevented = true; }
  isDefaultPrevented() { return this._prevented; }
  clone(): Event { const e = Object.create(Object.getPrototypeOf(this)); Object.assign(e, this); e.target = e.currentTarget = null; e._stop = 0; return e; }
  toString() { return `[Event type="${this.type}"]`; }
}

export class MouseEvent extends Event {
  static CLICK = 'click'; static DOUBLE_CLICK = 'doubleClick'; static MOUSE_DOWN = 'mouseDown'; static MOUSE_UP = 'mouseUp';
  static MOUSE_MOVE = 'mouseMove'; static MOUSE_OVER = 'mouseOver'; static MOUSE_OUT = 'mouseOut'; static ROLL_OVER = 'rollOver';
  static ROLL_OUT = 'rollOut'; static MOUSE_WHEEL = 'mouseWheel'; static RIGHT_CLICK = 'rightClick';
  static RIGHT_MOUSE_DOWN = 'rightMouseDown'; static RIGHT_MOUSE_UP = 'rightMouseUp'; static MIDDLE_CLICK = 'middleClick';
  localX = 0; localY = 0; stageX = 0; stageY = 0; buttonDown = false; delta = 0;
  ctrlKey = false; shiftKey = false; altKey = false; relatedObject: any = null; clickCount = 0;
  constructor(type: string, bubbles = true, cancelable = false, localX = 0, localY = 0, relatedObject: any = null, ctrlKey = false, altKey = false, shiftKey = false, buttonDown = false, delta = 0) {
    super(type, bubbles, cancelable);
    Object.assign(this, { localX, localY, relatedObject, ctrlKey, altKey, shiftKey, buttonDown, delta });
  }
  updateAfterEvent() {}
}

export class KeyboardEvent extends Event {
  static KEY_DOWN = 'keyDown'; static KEY_UP = 'keyUp';
  charCode = 0; keyCode = 0; keyLocation = 0; ctrlKey = false; altKey = false; shiftKey = false;
  constructor(type: string, bubbles = true, cancelable = false, charCode = 0, keyCode = 0, keyLocation = 0, ctrlKey = false, altKey = false, shiftKey = false) {
    super(type, bubbles, cancelable);
    Object.assign(this, { charCode, keyCode, keyLocation, ctrlKey, altKey, shiftKey });
  }
}
export class FocusEvent extends Event {
  static FOCUS_IN = 'focusIn'; static FOCUS_OUT = 'focusOut'; static KEY_FOCUS_CHANGE = 'keyFocusChange'; static MOUSE_FOCUS_CHANGE = 'mouseFocusChange';
  relatedObject: any = null;
  constructor(type: string, bubbles = true, cancelable = false, relatedObject: any = null) { super(type, bubbles, cancelable); this.relatedObject = relatedObject; }
}
export class TextEvent extends Event {
  static TEXT_INPUT = 'textInput'; static LINK = 'link';
  text: string;
  constructor(type: string, bubbles = false, cancelable = false, text = '') { super(type, bubbles, cancelable); this.text = text; }
}
export class TimerEvent extends Event { static TIMER = 'timer'; static TIMER_COMPLETE = 'timerComplete'; updateAfterEvent() {} }
export class ErrorEvent extends TextEvent { static ERROR = 'error'; errorID = 0; }
export class IOErrorEvent extends ErrorEvent { static IO_ERROR = 'ioError'; }
export class SecurityErrorEvent extends ErrorEvent { static SECURITY_ERROR = 'securityError'; }
export class ProgressEvent extends Event {
  static PROGRESS = 'progress'; static SOCKET_DATA = 'socketData';
  bytesLoaded = 0; bytesTotal = 0;
  constructor(type: string, bubbles = false, cancelable = false, bytesLoaded = 0, bytesTotal = 0) { super(type, bubbles, cancelable); this.bytesLoaded = bytesLoaded; this.bytesTotal = bytesTotal; }
}
export class HTTPStatusEvent extends Event { static HTTP_STATUS = 'httpStatus'; status = 0; }
export class DataEvent extends TextEvent { static DATA = 'data'; data = ''; }

type L = { fn: Function; cap: boolean; pri: number };
// Broadcast events go to every registered dispatcher, in order of first registration (like Flash/Ruffle).
export const broadcast: Record<string, Set<EventDispatcher>> = { enterFrame: new Set(), exitFrame: new Set(), frameConstructed: new Set(), activate: new Set(), deactivate: new Set(), render: new Set() };

// AS3 Dictionary keys can be objects: dispatchers convert to a unique property key,
// which Dictionary iteration ($keys) maps back to the object.
let keySeq = 0;
export const objectKeys = new Map<string, WeakRef<object>>();
export class EventDispatcher {
  _ls: Record<string, L[]> | null = null;
  _key?: string;
  [Symbol.toPrimitive](hint: string) {
    if (hint === 'string') {
      if (!this._key) { this._key = '\u0001' + ++keySeq; objectKeys.set(this._key, new WeakRef(this)); }
      return this._key;
    }
    return this.toString();
  }
  toString() { return `[object ${this.constructor.name}]`; }
  addEventListener(type: string, fn: Function, useCapture = false, priority = 0, _weak = false) {
    if (!fn) return;
    const ls = (this._ls ??= {});
    const a = (ls[type] ??= []);
    if (a.some(l => l.fn === fn && l.cap === useCapture)) return;
    let i = a.length;
    while (i > 0 && a[i - 1].pri < priority) i--;
    a.splice(i, 0, { fn, cap: useCapture, pri: priority });
    broadcast[type]?.add(this);
  }
  removeEventListener(type: string, fn: Function, useCapture = false) {
    const a = this._ls?.[type];
    if (!a) return;
    const i = a.findIndex(l => l.fn === fn && l.cap === useCapture);
    if (i >= 0) a.splice(i, 1);
    if (!a.length) { delete this._ls![type]; broadcast[type]?.delete(this); }
  }
  hasEventListener(type: string) { return !!this._ls?.[type]?.length; }
  willTrigger(type: string): boolean {
    for (let o: any = this; o; o = o.parent) if (o.hasEventListener(type)) return true;
    return false;
  }
  _fire(e: Event, capture: boolean) {
    const a = this._ls?.[e.type];
    if (!a) return;
    e.currentTarget = this;
    for (const l of a.slice()) {
      if (l.cap !== capture) continue;
      l.fn.call(null, e);
      if (e._stop === 2) break;
    }
  }
  dispatchEvent(e: Event): boolean {
    if (e.target) e = e.clone();
    e.target = this;
    // build propagation path for display objects
    const path: EventDispatcher[] = [];
    for (let p = (this as any).parent; p; p = p.parent) path.push(p);
    if (path.length) {
      e.eventPhase = 1;
      for (let i = path.length - 1; i >= 0 && !e._stop; i--) path[i]._fire(e, true);
    }
    if (!e._stop) { e.eventPhase = 2; this._fire(e, false); }
    if (e.bubbles) {
      e.eventPhase = 3;
      for (let i = 0; i < path.length && !e._stop; i++) path[i]._fire(e, false);
    }
    return !e._prevented;
  }
}

export function broadcastEvent(type: string) {
  const set = broadcast[type];
  if (!set.size) return;
  for (const d of Array.from(set)) {
    if (!set.has(d)) continue;
    const e = new Event(type);
    e.target = d;
    d._fire(e, false);
  }
}
