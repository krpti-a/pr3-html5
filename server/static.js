// Static file serving with precompressed (.gz) support and long-lived caching for assets.
import { createReadStream, statSync, existsSync } from 'node:fs';
import { join, normalize, extname } from 'node:path';

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.map': 'application/json', '.z': 'application/octet-stream', '.ico': 'image/x-icon',
};

export function serveStatic(root, req, res) {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = normalize(join(root, url));
  if (!file.startsWith(root)) return false;
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) return false;
  const st = statSync(file);
  const lm = st.mtime.toUTCString();
  if (req.headers['if-modified-since'] === lm) { res.writeHead(304); res.end(); return true; }
  const headers = { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache', 'Last-Modified': lm };
  const gz = file + '.gz';
  if (/\bgzip\b/.test(req.headers['accept-encoding'] ?? '') && existsSync(gz)) {
    headers['Content-Encoding'] = 'gzip';
    res.writeHead(200, headers);
    createReadStream(gz).pipe(res);
  } else {
    headers['Content-Length'] = st.size;
    res.writeHead(200, headers);
    createReadStream(file).pipe(res);
  }
  return true;
}
