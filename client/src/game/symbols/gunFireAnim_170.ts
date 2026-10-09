// Ported from PlatformRacing3_fla/gunFireAnim_170.as
import { MovieClip } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { $reg } from '../refs.ts';

export class gunFireAnim_170 extends MovieClip {
  static __sym = 'PlatformRacing3_fla.gunFireAnim_170';
  frame1(): void {
         this.stop();
      }
  constructor() {
         super();
         this.addFrameScript(0,$b(this, 'frame1'));
      }
}
$reg('PlatformRacing3_fla.gunFireAnim_170', gunFireAnim_170);
