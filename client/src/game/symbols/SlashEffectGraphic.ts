// Ported from SlashEffectGraphic.as
import { MovieClip } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { $reg } from '../refs.ts';

export class SlashEffectGraphic extends MovieClip {
  static __sym = 'SlashEffectGraphic';
  frame7(): void {
         this.stop();
      }
  constructor() {
         super();
         this.addFrameScript(6,$b(this, 'frame7'));
      }
}
$reg('SlashEffectGraphic', SlashEffectGraphic);
