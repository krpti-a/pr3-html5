// Ported from BlockEffectGraphic.as
import { MovieClip } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { PortableBlockEffect } from '../refs.ts';
import { $reg } from '../refs.ts';

export class BlockEffectGraphic extends MovieClip {
  static __sym = 'BlockEffectGraphic';
  declare p: PortableBlockEffect;
  declare anim: MovieClip;
  frame33(): void {
         this.stop();
         if(this.parent != null)
         {
            this.p = (this.parent);
            this.p.createBlock();
            this.p.remove();
         }
      }
  constructor() {
         super();
         this.addFrameScript(32,$b(this, 'frame33'));
      }
}
$reg('BlockEffectGraphic', BlockEffectGraphic);
