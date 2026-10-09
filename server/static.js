// Static file serving with precompressed (.gz) support and long-lived caching for assets.
import { createReadStream, statSync } from 'node:fs';
import { join, normalize, extname, sep } from 'node:path';

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.map': 'application/json', '.z': 'application/octet-stream', '.ico': 'image/x-icon',
};
// sent with every response (see server/index.js): no MIME sniffing, no framing by other sites, no referrer leaks;
// the page itself only runs this origin's scripts (the background ticker is a blob: worker)
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'same-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; worker-src 'self' blob:; img-src 'self' data: blob:; media-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; connect-src 'self' ws: wss:; object-src 'none'; base-uri 'none'; frame-ancestors 'self'",
};

const stat = f => { try { return statSync(f); } catch { return null; } };

export function serveStatic(root, req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return false;
  let url;
  try { url = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400, { 'Content-Type': 'text/plain' }).end('Bad request'); return true; }
  if (url.includes('\0')) return false;
  let file = normalize(join(root, url));
  // inside the public folder only (a plain prefix check would also accept a sibling like "public-old")
  if (file !== root && !file.startsWith(root + sep)) return false;
  let st = stat(file);
  if (st?.isDirectory()) { file = join(file, 'index.html'); st = stat(file); }
  if (!st?.isFile()) return false;
  const lm = st.mtime.toUTCString();
  if (req.headers['if-modified-since'] === lm) { res.writeHead(304); res.end(); return true; }
  const headers = { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache', 'Last-Modified': lm };
  const gz = stat(file + '.gz');
  const body = gz?.isFile() && /\bgzip\b/.test(req.headers['accept-encoding'] ?? '') ? (headers['Content-Encoding'] = 'gzip', file + '.gz') : (headers['Content-Length'] = st.size, file);
  res.writeHead(200, headers);
  if (req.method === 'HEAD') { res.end(); return true; }
  createReadStream(body).on('error', () => res.destroy()).pipe(res);
  return true;
}
