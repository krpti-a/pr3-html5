// Ported from PlatformRacing3_fla/angelWings_179.as
import { MovieClip } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { $reg } from '../refs.ts';

export class angelWings_179 extends MovieClip {
  static __sym = 'PlatformRacing3_fla.angelWings_179';
  frame1(): void {
         this.stop();
      }
  constructor() {
         super();
         this.addFrameScript(0,$b(this, 'frame1'));
      }
}
$reg('PlatformRacing3_fla.angelWings_179', angelWings_179);
