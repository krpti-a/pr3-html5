// Ported from PlayerListingButton.as
import { $b } from '../../flash/as3.ts';
import { ButtonClass } from '../ui/ButtonClass.ts';
import { $reg } from '../refs.ts';

export class PlayerListingButton extends ButtonClass {
  static __sym = 'PlayerListingButton';
  frame2(): void {
         this.stop();
      }
  constructor() {
         super();
         this.addFrameScript(1,$b(this, 'frame2'));
      }
}
$reg('PlayerListingButton', PlayerListingButton);
