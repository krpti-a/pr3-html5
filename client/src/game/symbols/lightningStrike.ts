// Ported from lightningStrike.as
import { MovieClip } from '../../flash/index.ts';
import { $reg } from '../refs.ts';

export class lightningStrike extends MovieClip {
  static __sym = 'lightningStrike';
  constructor() {
         super();
      }
}
$reg('lightningStrike', lightningStrike);
