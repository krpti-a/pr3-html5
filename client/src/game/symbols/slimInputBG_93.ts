// Ported from PlatformRacing3_fla/slimInputBG_93.as
import { MovieClip } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { $reg } from '../refs.ts';

export class slimInputBG_93 extends MovieClip {
  static __sym = 'PlatformRacing3_fla.slimInputBG_93';
  frame2(): void {
         this.stop();
      }
  constructor() {
         super();
         this.addFrameScript(1,$b(this, 'frame2'));
      }
}
$reg('PlatformRacing3_fla.slimInputBG_93', slimInputBG_93);
