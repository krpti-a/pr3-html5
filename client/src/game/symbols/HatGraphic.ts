// Ported from HatGraphic.as
import { MovieClip } from '../../flash/index.ts';
import { $reg } from '../refs.ts';

export class HatGraphic extends MovieClip {
  static __sym = 'HatGraphic';
  declare colorMC: MovieClip;
  constructor() {
         super();
         this.gotoAndStop(1);
         this.colorMC.gotoAndStop(1);
      }
}
$reg('HatGraphic', HatGraphic);
