// Ported from MenuPageGraphic.as
import { MovieClip, SimpleButton } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { $reg } from '../refs.ts';

export class MenuPageGraphic extends MovieClip {
  static __sym = 'MenuPageGraphic';
  declare loginPanel: MovieClip;
  declare iphoneButton: SimpleButton;
  declare loadingPanel: MovieClip;
  declare logo: MovieClip;
  frame48(): void {
         this.stop();
      }
  constructor() {
         super();
         this.addFrameScript(47,$b(this, 'frame48'));
      }
}
$reg('MenuPageGraphic', MenuPageGraphic);
