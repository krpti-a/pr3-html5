// Ported from LoadingGraphic.as
import { MovieClip } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { $reg } from '../refs.ts';

export class LoadingGraphic extends MovieClip {
  static __sym = 'LoadingGraphic';
  declare loadingAnim: MovieClip;
  frame51(): void {
         this.stop();
      }
  constructor() {
         super();
         this.addFrameScript(50,$b(this, 'frame51'));
      }
}
$reg('LoadingGraphic', LoadingGraphic);
