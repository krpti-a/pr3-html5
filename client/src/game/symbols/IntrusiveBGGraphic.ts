// Ported from IntrusiveBGGraphic.as
import { MovieClip } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { $reg } from '../refs.ts';

export class IntrusiveBGGraphic extends MovieClip {
  static __sym = 'IntrusiveBGGraphic';
  frame1(): void {
         this.stop();
      }
  constructor() {
         super();
         this.addFrameScript(0,$b(this, 'frame1'));
      }
}
$reg('IntrusiveBGGraphic', IntrusiveBGGraphic);
