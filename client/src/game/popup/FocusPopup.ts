// Ported from com/jiggmin/popup/FocusPopup.as
import { Popup } from './Popup.ts';
import { $reg } from '../refs.ts';

export class FocusPopup extends Popup {
  constructor() {
         super();
         this.dieWithoutFocus = true;
         this.intrusive = false;
         this.autoPosition = false;
      }
}
$reg('com.jiggmin.popup.FocusPopup', FocusPopup);
