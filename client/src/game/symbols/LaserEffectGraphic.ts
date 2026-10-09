// Ported from LaserEffectGraphic.as
import { MovieClip } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { $reg } from '../refs.ts';

export class LaserEffectGraphic extends MovieClip {
  static __sym = 'LaserEffectGraphic';
  frame18(): void {
         this.stop();
         if(this.parent != null)
         {
            (this.parent).remove();
         }
      }
  frame2(): void {
         this.stop();
      }
  constructor() {
         super();
         this.addFrameScript(1,$b(this, 'frame2'),17,$b(this, 'frame18'));
      }
}
$reg('LaserEffectGraphic', LaserEffectGraphic);
