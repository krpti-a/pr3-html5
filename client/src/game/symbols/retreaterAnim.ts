// Ported from PlatformRacing3_fla/retreaterAnim.as
import { MovieClip } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { $reg } from '../refs.ts';

export class retreaterAnim extends MovieClip {
  static __sym = 'PlatformRacing3_fla.retreaterAnim';
  frame1(): void {
         this.stop();
      }
  frame2(): void {
         this.gotoAndStop(2);
      }
  constructor() {
         super();
         this.addFrameScript(0,$b(this, 'frame1'),1,$b(this, 'frame2'));
      }
}
$reg('PlatformRacing3_fla.retreaterAnim', retreaterAnim);
