// Ported from PlayerHurtGraphic.as
import { MovieClip } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { $reg } from '../refs.ts';

export class PlayerHurtGraphic extends MovieClip {
  static __sym = 'PlayerHurtGraphic';
  declare rFoot: MovieClip;
  declare lFoot: MovieClip;
  declare body: MovieClip;
  declare item: MovieClip;
  declare head: MovieClip;
  frame65(): void {
         this.gotoAndPlay(40);
      }
  constructor() {
         super();
         this.addFrameScript(64,$b(this, 'frame65'));
      }
}
$reg('PlayerHurtGraphic', PlayerHurtGraphic);
