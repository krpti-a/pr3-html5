// Socket transport for the game server: one JSON message per WebSocket frame
// (replaces the original length-prefixed TCP socket with obfuscation/encryption).
import { EventDispatcher, Event, IOErrorEvent } from '../../flash/index.ts';
import { $reg } from '../refs.ts';

export class BasicSocket extends EventDispatcher {
  ws: WebSocket | null = null;
  get connected() { return this.ws?.readyState === WebSocket.OPEN; }
  connect(_host: string, _port: number) {
    const url = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`;
    const ws = (this.ws = new WebSocket(url));
    ws.onopen = () => this.connectHandler(new Event(Event.CONNECT));
    ws.onmessage = e => { if (typeof e.data === 'string') this.receive(e.data); };
    ws.onerror = () => { if (ws.readyState !== WebSocket.OPEN) this.dispatchEvent(new IOErrorEvent(IOErrorEvent.IO_ERROR)); };
    ws.onclose = () => { if (this.ws === ws) { this.ws = null; this.dispatchEvent(new Event(Event.CLOSE)); } };
  }
  connectHandler(_e: Event) {}
  receive(_s: string) {}
  write(s: string) { if (this.connected) this.ws!.send(s); }
  close() { const ws = this.ws; this.ws = null; ws?.close(); }
  remove() { this.close(); }
}
$reg('com.jiggmin.blossomSocket.BasicSocket', BasicSocket);
