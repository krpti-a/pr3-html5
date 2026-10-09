// Ported from ExplosionEffectGraphic.as
import { MovieClip } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { $reg } from '../refs.ts';

export class ExplosionEffectGraphic extends MovieClip {
  static __sym = 'ExplosionEffectGraphic';
  frame27(): void {
         this.stop();
         if(this.parent != null)
         {
            this.parent.removeChild(this);
         }
      }
  constructor() {
         super();
         this.addFrameScript(26,$b(this, 'frame27'));
      }
}
$reg('ExplosionEffectGraphic', ExplosionEffectGraphic);
