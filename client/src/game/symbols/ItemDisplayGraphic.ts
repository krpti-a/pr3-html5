// Ported from ItemDisplayGraphic.as
import { MovieClip } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { $reg } from '../refs.ts';

export class ItemDisplayGraphic extends MovieClip {
  static __sym = 'ItemDisplayGraphic';
  declare ammoDisplay: MovieClip;
  declare holder1: MovieClip;
  declare holder2: MovieClip;
  frame1(): void {
         this.stop();
      }
  constructor() {
         super();
         this.addFrameScript(0,$b(this, 'frame1'));
      }
}
$reg('ItemDisplayGraphic', ItemDisplayGraphic);
