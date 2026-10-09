// Ported from com/jiggmin/popup/ConfirmPopup.as
import { $Function, $b } from '../../flash/as3.ts';
import { TextPopup } from './TextPopup.ts';
import { $reg } from '../refs.ts';

export class ConfirmPopup extends TextPopup {
  declare func: Function;
  clickCancel(): void {
         this.remove();
      }
  clickOK(): void {
         if(this.func instanceof $Function)
         {
            this.func();
         }
         this.remove();
      }
  constructor(param1: Function, param2: string = "Are you sure?") {
         super(param2);
         this.func = param1;
         this.createButton($b(this, 'clickOK'),"OK");
         this.createButton($b(this, 'clickCancel'),"Cancel");
      }
}
$reg('com.jiggmin.popup.ConfirmPopup', ConfirmPopup);
