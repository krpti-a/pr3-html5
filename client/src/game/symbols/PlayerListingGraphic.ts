// Ported from PlayerListingGraphic.as
import { MovieClip, TextField } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { PlayerListingButton } from '../refs.ts';
import { $reg } from '../refs.ts';

export class PlayerListingGraphic extends MovieClip {
  static __sym = 'PlayerListingGraphic';
  declare nameBox: TextField;
  declare button: PlayerListingButton;
  declare rankBox: TextField;
  frame1(): void {
         this.stop();
      }
  constructor() {
         super();
         this.addFrameScript(0,$b(this, 'frame1'));
      }
}
$reg('PlayerListingGraphic', PlayerListingGraphic);
