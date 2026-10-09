// Ported from PlatformRacing3_fla/tabBG_136.as
import { MovieClip } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { $reg } from '../refs.ts';

export class tabBG_136 extends MovieClip {
  static __sym = 'PlatformRacing3_fla.tabBG_136';
  frame1(): void {
         this.stop();
      }
  constructor() {
         super();
         this.addFrameScript(0,$b(this, 'frame1'));
      }
}
$reg('PlatformRacing3_fla.tabBG_136', tabBG_136);
