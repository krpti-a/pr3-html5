// Ported from com/jiggmin/popup/PopupEvent.as
import { Event } from '../../flash/index.ts';
import { Popup } from '../refs.ts';
import { $reg } from '../refs.ts';

export class PopupEvent extends Event {
  static ADD_POPUP: string = "addPopup";
  declare popup: Popup;
  clone(): Event {
         return new PopupEvent(this.type,this.popup,this.bubbles,this.cancelable);
      }
  getPopup(): Popup {
         return this.popup;
      }
  constructor(param1: string, param2: Popup, param3: boolean = false, param4: boolean = false) {
         super(param1,param3,param4);
         this.popup = param2;

      }
}
$reg('com.jiggmin.popup.PopupEvent', PopupEvent);
