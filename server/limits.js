// Abuse limits: token buckets keyed by ip/user, and per-ip connection counting. Everything here is bounded:
// idle entries are swept, and a full table refuses new keys instead of growing.
const MAX_KEYS = 50000;

export class RateLimiter {
  // `perMinute` tokens refill continuously; up to `burst` can be spent at once
  constructor(perMinute, burst = perMinute) {
    this.rate = perMinute / 60000; this.burst = burst;
    this.buckets = new Map();
    setInterval(() => this.sweep(), 60000).unref();
  }
  take(key, n = 1) {
    const now = Date.now();
    let b = this.buckets.get(key);
    if (!b) { if (this.buckets.size >= MAX_KEYS) return false; b = { tokens: this.burst, t: now }; this.buckets.set(key, b); }
    b.tokens = Math.min(this.burst, b.tokens + (now - b.t) * this.rate); b.t = now;
    if (b.tokens < n) return false;
    b.tokens -= n;
    return true;
  }
  sweep() { const now = Date.now(); for (const [k, b] of this.buckets) if (b.tokens + (now - b.t) * this.rate >= this.burst) this.buckets.delete(k); }
}

export class ConnectionCounter {
  constructor(perIp, total) { this.perIp = perIp; this.total = total; this.count = 0; this.byIp = new Map(); }
  // reserves a slot (false when the ip or the server is full); call the returned release function on close
  acquire(ip) {
    const n = this.byIp.get(ip) ?? 0;
    if (n >= this.perIp || this.count >= this.total) return null;
    this.byIp.set(ip, n + 1); this.count++;
    let done = false;
    return () => {
      if (done) return; done = true; this.count--;
      const m = (this.byIp.get(ip) ?? 1) - 1;
      if (m <= 0) this.byIp.delete(ip); else this.byIp.set(ip, m);
    };
  }
}
