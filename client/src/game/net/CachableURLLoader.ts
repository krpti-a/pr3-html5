// GET request returning an API response (used for versioned level loads).
import { xmlish } from '../api/Sparkworkz.ts';
import { $reg } from '../refs.ts';

export class CachableURLLoader {
  url: string; callback: Function;
  constructor(url: string, callback: Function) { this.url = url; this.callback = callback; }
  static loadAndCallback(url: string, callback: Function) { new CachableURLLoader(url, callback).load(); }
  load() {
    fetch(this.url, { credentials: 'same-origin' }).then(r => r.json())
      .then(j => this.callback(xmlish(j), j.Error ?? ''), e => this.callback(null, String(e?.message ?? e)));
  }
}
$reg('net.goldtreeservers.CachableURLLoader', CachableURLLoader);
