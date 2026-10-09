// zlib/deflate for ByteArray.compress/uncompress, via fflate. Decompression errors map to Flash's #2058.
import { unzlibSync, inflateSync, zlibSync, deflateSync } from 'fflate';

const corrupt = () => new Error('Error #2058: There was an error decompressing the data.');
export const zlibStats = { calls: 0, bytesIn: 0, bytesOut: 0, ms: 0 };
export function inflate(src: Uint8Array, zlib = true): Uint8Array {
  const t = performance.now();
  try { const out = zlib ? unzlibSync(src) : inflateSync(src); zlibStats.calls++; zlibStats.bytesIn += src.length; zlibStats.bytesOut += out.length; zlibStats.ms += performance.now() - t; return out; }
  catch { throw corrupt(); }
}
export function deflate(d: Uint8Array, zlib = true): Uint8Array {
  return zlib ? zlibSync(d) : deflateSync(d);
}
