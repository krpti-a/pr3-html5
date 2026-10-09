// Ported from PlatformRacing3_fla/swordAnim_177.as
import { MovieClip } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { $reg } from '../refs.ts';

export class swordAnim_177 extends MovieClip {
  static __sym = 'PlatformRacing3_fla.swordAnim_177';
  frame1(): void {
         this.stop();
      }
  frame2(): void {
         this.gotoAndPlay(3);
      }
  constructor() {
         super();
         this.addFrameScript(0,$b(this, 'frame1'),1,$b(this, 'frame2'));
      }
}
$reg('PlatformRacing3_fla.swordAnim_177', swordAnim_177);
