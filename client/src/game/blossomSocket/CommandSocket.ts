// JSON message socket: dispatches each received message as a BlossomEvent named by its type.
import { BasicSocket } from './BasicSocket.ts';
import { reportError } from '../../flash/utils.ts';
import { BlossomEvent, NestedError } from '../refs.ts';
import { $reg } from '../refs.ts';

export class CommandSocket extends BasicSocket {
  sendBuffer: any[] = [];
  traceTraffic = false;
  wrapped = new Map<Function, Function>();
  constructor() {
    super();
    this.addEventListener(BlossomEvent.READY, (_e: any) => { const b = this.sendBuffer; this.sendBuffer = []; for (const p of b) this.send(p); });
  }
  connectHandler(e: any) { super.connectHandler(e); this.send({ type: 'confirm_connection' }); }
  send(packet: any) {
    if (!this.connected) { this.sendBuffer.push(packet); return; }
    this.write(JSON.stringify(packet));
  }
  receive(s: string) {
    let packet: any;
    try { packet = JSON.parse(s); } catch { return; }
    this.handleMessage(packet);
  }
  setKey(_k: string) {}
  handleMessage(packet: any) {
    const type = packet.type || packet.t || BlossomEvent.RECEIVE_MESSAGE;
    this.dispatchEvent(new BlossomEvent(type, packet, null));
  }
  addEventListener(type: string, fn: Function, useCapture = false, priority = 0, weak = false) {
    let w = this.wrapped.get(fn);
    if (!w) {
      w = (event: any) => {
        // report and carry on (like the Flash player with an uncaught listener error) so one failing
        // handler, e.g. a stale room object, doesn't stop the others for the same message
        try { fn(event); } catch (e: any) {
          reportError(event instanceof BlossomEvent ? new NestedError('There was a problem handling blossom event: ' + event.type + ' (' + JSON.stringify(event.raw) + ')', e) : e);
        }
      };
      this.wrapped.set(fn, w);
    }
    super.addEventListener(type, w, useCapture, priority, weak);
  }
  removeEventListener(type: string, fn: Function, useCapture = false) {
    const w = this.wrapped.get(fn);
    if (w) super.removeEventListener(type, w, useCapture);
  }
}
$reg('com.jiggmin.blossomSocket.CommandSocket', CommandSocket);
