// Ported from RocketEffectGraphic.as
import { MovieClip } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { $reg } from '../refs.ts';

export class RocketEffectGraphic extends MovieClip {
  static __sym = 'RocketEffectGraphic';
  frame21(): void {
         this.stop();
      }
  constructor() {
         super();
         this.addFrameScript(20,$b(this, 'frame21'));
      }
}
$reg('RocketEffectGraphic', RocketEffectGraphic);
