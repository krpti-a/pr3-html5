// Ported from com/jiggmin/ui/MuteButton.as
import { MouseEvent } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { StateObject } from '../stateObject/StateObject.ts';
import { Mute } from '../refs.ts';
import { $reg } from '../refs.ts';

export class MuteButton extends StateObject {
  clickHandler(event: MouseEvent): void {
         Mute.doMute();
         var state: boolean= Boolean(Mute.getMuted());
         if(state)
         {
            this.setState("on");
         }
         else
         {
            this.setState("off");
         }
      }
  toggle(): void {
         this.clickHandler(new MouseEvent(MouseEvent.CLICK));
      }
  remove(): void {
         this.emoveEventListener(MouseEvent.CLICK,$b(this, 'clickHandler'));
         super.remove();
      }
  constructor() {
         super();
         this.prependString = "Mute";
         this.setState(Mute.getMuted() ? "on" : "off");
         this.buttonMode = true;
         this.useHandCursor = true;
         this.addEventListener(MouseEvent.CLICK,$b(this, 'clickHandler'),false,0,true);
      }
}
$reg('com.jiggmin.ui.MuteButton', MuteButton);
