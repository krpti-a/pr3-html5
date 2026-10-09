// Ported from PlayerRunGraphic.as
import { MovieClip } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { $reg } from '../refs.ts';

export class PlayerRunGraphic extends MovieClip {
  static __sym = 'PlayerRunGraphic';
  declare rFoot: MovieClip;
  declare lFoot: MovieClip;
  declare body: MovieClip;
  declare item: MovieClip;
  declare head: MovieClip;
  frame21(): void {
         this.gotoAndPlay(1);
      }
  constructor() {
         super();
         this.addFrameScript(20,$b(this, 'frame21'));
      }
}
$reg('PlayerRunGraphic', PlayerRunGraphic);
