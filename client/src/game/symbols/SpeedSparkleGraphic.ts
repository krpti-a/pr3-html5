// Ported from SpeedSparkleGraphic.as
import { MovieClip } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { $reg } from '../refs.ts';

export class SpeedSparkleGraphic extends MovieClip {
  static __sym = 'SpeedSparkleGraphic';
  declare col_mc: MovieClip;
  frame17(): void {
         this.stop();
         if(this.parent != null)
         {
            this.parent.removeChild(this);
         }
      }
  constructor() {
         super();
         this.addFrameScript(16,$b(this, 'frame17'));
      }
}
$reg('SpeedSparkleGraphic', SpeedSparkleGraphic);
