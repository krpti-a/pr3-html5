// Flash/AIR platform APIs that have no role in the browser rebuild (workers, native files, Discord, gamepads...).
import { EventDispatcher, Event } from '../../flash/index.ts';
import { $reg } from '../refs.ts';

export class Encrypt { static encrypt(s: string) { return s; } static decrypt(s: string) { return s; } }
// Discord rich presence: no-op for any method the game calls
export class DiscordHandler { constructor() { return new Proxy(this, { get: (t: any, k) => (k in t ? t[k] : () => {}) }); } }
export const SWFWheel = { initialize() {}, browserScroll: false };
export class GameInput extends EventDispatcher { static numDevices = 0; static getDeviceAt() { return null; } }
export class GameInputEvent extends Event { static DEVICE_ADDED = 'deviceAdded'; static DEVICE_REMOVED = 'deviceRemoved'; device: any = null; }
export const WorkerDomain = { isSupported: false, current: null };
export const WorkerState = { RUNNING: 'running', NEW: 'new', TERMINATED: 'terminated' };
export class Worker { static current: any = null; static isSupported = false; }
export class MessageChannel extends EventDispatcher {}
export const InternalWorker = { shouldActivate: false, init() {} };
export class NativeProcess extends EventDispatcher { static isSupported = false; }
export class NativeProcessStartupInfo {}
export class File extends EventDispatcher { static applicationStorageDirectory: any = null; static documentsDirectory: any = null; exists = false; resolvePath() { return new File(); } }
export class FileStream extends EventDispatcher { open() {} close() {} readUTFBytes() { return ''; } writeUTFBytes() {} }
export const FileMode = { READ: 'read', WRITE: 'write', APPEND: 'append', UPDATE: 'update' };
export const Clipboard = { generalClipboard: { setData(_f: any, s: string) { navigator.clipboard?.writeText(String(s)).catch(() => {}); }, getData() { return ''; }, clear() {} } };
export const ClipboardFormats = { TEXT_FORMAT: 'air:text' };
export class PNGEncoderOptions { constructor(public fastCompression = false) {} }
export class ContextMenuEvent extends Event { static MENU_ITEM_SELECT = 'menuItemSelect'; static MENU_SELECT = 'menuSelect'; }
export class TouchEvent extends Event { static TOUCH_BEGIN = 'touchBegin'; static TOUCH_END = 'touchEnd'; static TOUCH_MOVE = 'touchMove'; stageX = 0; stageY = 0; touchPointID = 0; }
export class TransformGestureEvent extends Event { static GESTURE_ZOOM = 'gestureZoom'; static GESTURE_PAN = 'gesturePan'; scaleX = 1; scaleY = 1; offsetX = 0; offsetY = 0; }
export class UncaughtErrorEvent extends Event { static UNCAUGHT_ERROR = 'uncaughtError'; error: any = null; }
export class Loader extends EventDispatcher { contentLoaderInfo = new EventDispatcher(); content: any = null; load() {} loadBytes() {} unload() {} }
export class AESKey {} export class CBCMode {} export class IVMode {}
for (const [n, c] of Object.entries({ Encrypt, DiscordHandler, SWFWheel, GameInput, GameInputEvent, WorkerDomain, WorkerState, Worker, MessageChannel, InternalWorker,
  NativeProcess, NativeProcessStartupInfo, File, FileStream, FileMode, Clipboard, ClipboardFormats, PNGEncoderOptions, ContextMenuEvent, TouchEvent,
  TransformGestureEvent, UncaughtErrorEvent, Loader, AESKey, CBCMode, IVMode })) $reg(n, c);
