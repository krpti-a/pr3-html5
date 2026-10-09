// Ported from PlayerRecoverGraphic.as
import { MovieClip } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { $reg } from '../refs.ts';

export class PlayerRecoverGraphic extends MovieClip {
  static __sym = 'PlayerRecoverGraphic';
  declare rFoot: MovieClip;
  declare lFoot: MovieClip;
  declare body: MovieClip;
  declare item: MovieClip;
  declare head: MovieClip;
  frame20(): void {
         this.stop();
      }
  constructor() {
         super();
         this.addFrameScript(19,$b(this, 'frame20'));
      }
}
$reg('PlayerRecoverGraphic', PlayerRecoverGraphic);
