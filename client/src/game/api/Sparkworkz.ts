// Replacement for com.sparkworkz.Sparkworkz: the HTTP API of the original game, now plain JSON
// against this project's own server. Responses are adapted to the E4X-style access the game uses
// (response.Row.field for the first row, response.Row[i] for others, string values).
import { $reg } from '../refs.ts';
import { reportError } from '../../flash/utils.ts';

// Callbacks run outside the promise chain so their exceptions are reported, not swallowed.
function call(f: Function, ...a: any[]) { try { f(...a); } catch (e) { reportError(e); } }

export function xmlish(r: any) {
  if (!r) return r;
  const rows: any[] = Array.isArray(r.Row) ? r.Row : r.Row ? [r.Row] : [];
  const list: any = rows.slice();
  if (rows[0]) for (const [k, v] of Object.entries(rows[0])) if (!(k in list)) list[k] = v;
  return { ...r, Row: list, NumRows: r.NumRows ?? String(rows.length), toString: () => '' };
}

export class Sparkworkz {
  static SPARKWORKS_LOCATION = '/api/';
  static SPARKWORKZ_LIVE = 2;
  static mIsLoggedIn = false; static mUserID = -1; static mSavedUsername = '';
  static Initialize(..._a: any[]) {}
  static DataAccess(proc: string, params: any, callback: Function, ..._rest: any[]) {
    const body = JSON.stringify(params ?? {}, (_k, v) => (typeof v === 'number' || typeof v === 'boolean' ? String(v) : v));
    fetch(`${Sparkworkz.SPARKWORKS_LOCATION}data/${proc}`, { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin' })
      .then(r => r.json())
      .then(j => call(callback, xmlish(j), j.Error ?? ''), e => call(callback, null, String(e?.message ?? e)));
  }
  static IsLoggedIn(callback: Function) {
    fetch(`${Sparkworkz.SPARKWORKS_LOCATION}isloggedin`, { credentials: 'same-origin' }).then(r => r.json()).then(j => {
      Sparkworkz.mIsLoggedIn = j.IsLoggedIn === '1'; Sparkworkz.mUserID = +j.UserId; Sparkworkz.mSavedUsername = j.UserName;
      call(callback, j);
    }, () => call(callback, null));
  }
  static CheckInitialized() {}
  static CheckLoggedIn() { return Sparkworkz.mIsLoggedIn; }
}
$reg('com.sparkworkz.Sparkworkz', Sparkworkz);
