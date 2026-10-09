// Ported from PlayerJumpGraphic.as
import { MovieClip } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { $reg } from '../refs.ts';

export class PlayerJumpGraphic extends MovieClip {
  static __sym = 'PlayerJumpGraphic';
  declare rFoot: MovieClip;
  declare body: MovieClip;
  declare item: MovieClip;
  declare head: MovieClip;
  declare lFoot: MovieClip;
  frame50(): void {
         this.stop();
      }
  constructor() {
         super();
         this.addFrameScript(49,$b(this, 'frame50'));
      }
}
$reg('PlayerJumpGraphic', PlayerJumpGraphic);
