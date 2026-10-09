// Ported from DirectionArrowGraphic.as
import { MovieClip } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { $reg } from '../refs.ts';

export class DirectionArrowGraphic extends MovieClip {
  static __sym = 'DirectionArrowGraphic';
  declare arrow: MovieClip;
  frame5(): void {
         this.stop();
      }
  constructor() {
         super();
         this.addFrameScript(4,$b(this, 'frame5'));
      }
}
$reg('DirectionArrowGraphic', DirectionArrowGraphic);
