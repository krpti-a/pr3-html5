// Ported from PlatformRacing3_fla/inputBG_4.as
import { MovieClip } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { $reg } from '../refs.ts';

export class inputBG_4 extends MovieClip {
  static __sym = 'PlatformRacing3_fla.inputBG_4';
  frame2(): void {
         this.stop();
      }
  constructor() {
         super();
         this.addFrameScript(1,$b(this, 'frame2'));
      }
}
$reg('PlatformRacing3_fla.inputBG_4', inputBG_4);
