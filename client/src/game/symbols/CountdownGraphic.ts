// Ported from CountdownGraphic.as
import { MovieClip } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { $reg } from '../refs.ts';

export class CountdownGraphic extends MovieClip {
  static __sym = 'CountdownGraphic';
  declare textHolder: any;
  frame50(): void {
         this.stop();
         if(this.parent != null)
         {
            this.parent.removeChild(this);
         }
      }
  constructor() {
         super();
         this.addFrameScript(49,$b(this, 'frame50'));
      }
}
$reg('CountdownGraphic', CountdownGraphic);
