// Minimal RFC 6455 WebSocket server (text/binary frames, fragmentation, ping/pong, close).
import { createHash } from 'node:crypto';
import { EventEmitter } from 'node:events';

const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
// game messages are small JSON (levels/blocks go through the HTTP API), so a modest cap is plenty
const MAX_MESSAGE = 256 * 1024;
const HEARTBEAT_TIMEOUT = 60000;
// a client that stops reading while we keep sending would otherwise queue unbounded memory on the server
const MAX_BUFFERED = 2 * 1024 * 1024;

export class WebSocket extends EventEmitter {
  constructor(socket) {
    super();
    this.socket = socket;
    this.chunks = []; this.buffered = 0; // received bytes not parsed yet (joined only once a frame is complete)
    this.frags = []; this.fragBytes = 0;
    this.fragOp = 0;
    this.open = true;
    socket.setNoDelay(true);
    socket.on('data', d => this.onData(d));
    // http.Server sockets are half-open capable: a client's FIN only emits 'end', never 'close' on its own
    socket.on('end', () => this.terminate());
    socket.on('close', () => this.terminate());
    socket.on('error', () => this.terminate());
    // heartbeat: ping every 20 s; a client that sends nothing for 60 s (sleep, network drop) is dropped
    this.lastSeen = Date.now();
    this.heartbeat = setInterval(() => {
      if (Date.now() - this.lastSeen > HEARTBEAT_TIMEOUT) return this.terminate();
      this.frame(0x9, Buffer.alloc(0));
    }, 20000);
    this.heartbeat.unref?.();
  }
  // the first n buffered bytes (joining chunks only when a frame needs them)
  peek(n) {
    if (this.chunks[0].length < n) this.chunks = [Buffer.concat(this.chunks)];
    return this.chunks[0];
  }
  consume(n) {
    const b = this.peek(n);
    this.chunks[0] = b.subarray(n); this.buffered -= n;
    if (!this.chunks[0].length) this.chunks.shift();
  }
  onData(d) {
    this.lastSeen = Date.now();
    this.chunks.push(d); this.buffered += d.length;
    while (this.open && this.buffered >= 2) {
      let b = this.peek(2);
      const fin = b[0] & 0x80, op = b[0] & 0x0f, masked = b[1] & 0x80;
      let len = b[1] & 0x7f, p = 2;
      if (len === 126) { if (this.buffered < 4) return; len = this.peek(4).readUInt16BE(2); p = 4; }
      else if (len === 127) { if (this.buffered < 10) return; len = Number(this.peek(10).readBigUInt64BE(2)); p = 10; }
      if (len > MAX_MESSAGE) return this.close(1009);
      if (!masked) return this.close(1002);
      if (this.buffered < p + 4 + len) return;
      b = this.peek(p + 4 + len);
      const mask = b.subarray(p, p + 4);
      const data = Buffer.from(b.subarray(p + 4, p + 4 + len));
      for (let i = 0; i < data.length; i++) data[i] ^= mask[i & 3];
      this.consume(p + 4 + len);
      if (op === 0x8) return this.close(1000);
      if (op === 0x9) { this.frame(0xa, data); continue; }
      if (op === 0xa) continue;
      if (op === 0) { this.frags.push(data); this.fragBytes += data.length; } else { this.fragOp = op; this.frags = [data]; this.fragBytes = data.length; }
      if (this.fragBytes > MAX_MESSAGE) return this.close(1009);
      if (fin) {
        const msg = this.frags.length === 1 ? this.frags[0] : Buffer.concat(this.frags);
        this.frags = []; this.fragBytes = 0;
        this.emit('message', this.fragOp === 1 ? msg.toString('utf8') : msg);
      }
    }
  }
  frame(op, data) {
    if (!this.open || this.socket.destroyed || !this.socket.writable) return;
    const len = data.length;
    const head = len < 126 ? Buffer.from([0x80 | op, len]) : len < 65536 ? Buffer.from([0x80 | op, 126, len >> 8, len & 255]) : (() => { const h = Buffer.alloc(10); h[0] = 0x80 | op; h[1] = 127; h.writeBigUInt64BE(BigInt(len), 2); return h; })();
    if (this.socket.writableLength > MAX_BUFFERED) return this.terminate();
    this.socket.write(Buffer.concat([head, data]));
  }
  send(msg) { this.frame(typeof msg === 'string' ? 1 : 2, typeof msg === 'string' ? Buffer.from(msg) : msg); }
  close(code = 1000) {
    if (!this.open) return;
    const b = Buffer.alloc(2); b.writeUInt16BE(code);
    this.frame(0x8, b);
    this.open = false;
    clearInterval(this.heartbeat);
    this.socket.end();
    setTimeout(() => this.socket.destroy(), 5000).unref?.(); // don't wait forever for the peer's FIN
    this.emit('close');
  }
  terminate() { if (!this.open) return; this.open = false; clearInterval(this.heartbeat); this.socket.destroy(); this.emit('close'); }
}

export function acceptUpgrade(req, socket) {
  const key = req.headers['sec-websocket-key'];
  if (!key || req.headers.upgrade?.toLowerCase() !== 'websocket') { socket.destroy(); return null; }
  const accept = createHash('sha1').update(key + GUID).digest('base64');
  socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);
  return new WebSocket(socket);
}
