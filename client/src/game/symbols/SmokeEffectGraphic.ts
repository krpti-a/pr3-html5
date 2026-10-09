// Ported from SmokeEffectGraphic.as
import { MovieClip } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { $reg } from '../refs.ts';

export class SmokeEffectGraphic extends MovieClip {
  static __sym = 'SmokeEffectGraphic';
  frame41(): void {
         this.stop();
         if(this.parent != null)
         {
            this.parent.removeChild(this);
         }
      }
  constructor() {
         super();
         this.addFrameScript(40,$b(this, 'frame41'));
      }
}
$reg('SmokeEffectGraphic', SmokeEffectGraphic);
