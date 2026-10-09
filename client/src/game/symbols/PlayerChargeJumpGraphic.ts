// Ported from PlayerChargeJumpGraphic.as
import { MovieClip } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { $reg } from '../refs.ts';

export class PlayerChargeJumpGraphic extends MovieClip {
  static __sym = 'PlayerChargeJumpGraphic';
  declare rFoot: MovieClip;
  declare body: MovieClip;
  declare item: MovieClip;
  declare charge: MovieClip;
  declare head: MovieClip;
  declare lFoot: MovieClip;
  frame122(): void {
         this.stop();
      }
  constructor() {
         super();
         this.addFrameScript(121,$b(this, 'frame122'));
      }
}
$reg('PlayerChargeJumpGraphic', PlayerChargeJumpGraphic);
