// Ported from com/jiggmin/popup/MessagePopup.as
import { Event } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { TextPopup } from './TextPopup.ts';
import { $reg } from '../refs.ts';

export class MessagePopup extends TextPopup {
  clickOK(): void {
         if(this.inputGraphic != null)
         {
            this.text = this.inputGraphic.textBox.text;
            TextPopup.inputMode = false;
         }
         this.dispatchEvent(new Event("SUBMITTED_INPUT"));
         this.remove();
      }
  constructor(param1: string, takesInput: boolean = false) {
         super(param1,takesInput);
         this.createButton($b(this, 'clickOK'),"OK");
         if(takesInput)
         {
            this.inputGraphic.y = this.buttonHolder.y;
         }
      }
}
$reg('com.jiggmin.popup.MessagePopup', MessagePopup);
