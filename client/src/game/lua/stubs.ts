// Level Lua scripting (a PR3 Reborn addition) is intentionally not supported in this rebuild.
// These stand-ins keep the original call sites working as no-ops.
import { $reg } from '../refs.ts';

const noop: any = new Proxy(function () {}, {
  get: (_t, k) => (k === 'hasListeners' ? false : k === Symbol.toPrimitive ? () => '' : noop),
  apply: () => [null, null],
  construct: () => noop,
});
class LuaObject {
  constructor(..._a: any[]) { return noop; }
  static wrap() { return noop; }
  static testType() { return false; }
}
export class LuaState extends LuaObject { close() {} setGlobal() {} doString() {} callGlobal(..._a: any[]): any[] { return [null, null]; } }
export class GameLuaWrapper extends LuaObject {}
export class PlayerLuaWrapper extends LuaObject {}
export class LocalPlayerLuaWrapper extends LuaObject {}
export class ProjectileEffectLuaWrapper extends LuaObject {}
export class TypeLuaWrapper extends LuaObject {}
export class BlockLuaWrapper extends LuaObject {}
export class LevelLuaWrapper extends LuaObject {}
export class GameEventLuaWrapper extends LuaObject {}
export class SpriteLuaWrapper extends LuaObject {}
export class LuaEventHandler extends LuaObject {}
export class LuaReference extends LuaObject {}
export const LuaBufferUtils = {};
// Lock handling is used by the drawing pipeline and must work.
export class LockHandler {
  callback: Function; locks: LockHolder[] = [];
  constructor(callback: Function) { this.callback = callback; }
  acquireLock() { const h = new LockHolder(this); this.locks.push(h); return h; }
  releaseLock(h: LockHolder) { h.dispose(); }
  releaseLockInternal(h: LockHolder) { const i = this.locks.indexOf(h); if (i >= 0) this.locks.splice(i, 1); if (!this.locks.length) this.callback(); }
}
export class LockHolder {
  handler: LockHandler | null; disposed = false;
  constructor(h: LockHandler) { this.handler = h; }
  dispose() { if (this.disposed) throw new Error('Double Dispose'); this.disposed = true; this.handler!.releaseLockInternal(this); this.handler = null; }
}
for (const [n, c] of Object.entries({ LuaState, GameLuaWrapper, PlayerLuaWrapper, LocalPlayerLuaWrapper, ProjectileEffectLuaWrapper, TypeLuaWrapper, BlockLuaWrapper,
  LevelLuaWrapper, GameEventLuaWrapper, SpriteLuaWrapper, LuaEventHandler, LuaReference, LuaBufferUtils, LockHandler, LockHolder })) $reg('com.jiggmin.pr3.lua.' + n, c);
