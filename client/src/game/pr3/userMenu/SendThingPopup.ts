// Ported from com/jiggmin/pr3/userMenu/SendThingPopup.as
import { int, $b } from '../../../flash/as3.ts';
import { ButtonPopup } from '../../popup/ButtonPopup.ts';
import { Block, MyBlockSelector, MyLevelSelector, Selector, SocketManager, TitlePopupGraphic } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class SendThingPopup extends ButtonPopup {
  toUserID: number = 0;
  declare m: any;
  declare thing: string;
  declare userName: string;
  declare selector: Selector;
  clickCancel(): void {
         this.remove();
      }
  clickSend(): void {
         var _loc_1= this.getSelectedID();
         if(_loc_1 > 0)
         {
            SocketManager.socket.sendThing(this.thing,_loc_1,this.selector.selectedButton.label,this.toUserID);
            this.remove();
         }
      }
  getSelectedID(): number {
         var _loc_2= null;
         var _loc_1= -1;
         if(this.selector instanceof MyLevelSelector)
         {
            _loc_2 = this.selector.selectedData;
            _loc_1 = _loc_2.levelID;
         }
         else if(this.selector instanceof MyBlockSelector)
         {
            _loc_1 = int(this.selector.selectedData);
         }
         return _loc_1;
      }
  constructor(param1: number, param2: string, param3: string) {
    param1 = int(param1);
         super();
         this.m = new TitlePopupGraphic();
         this.toUserID = int(param1);
         this.userName = param2;
         this.thing = param3;
         if(param3 == "level")
         {
            this.selector = new MyLevelSelector();
            this.m.textBox.text = "Share Level";
         }
         if(param3 == "block")
         {
            this.selector = new MyBlockSelector();
            this.m.textBox.text = "Share Block";
         }
         this.selector.y = 40;
         this.addGraphic(this.m);
         this.addGraphic(this.selector);
         this.createButton($b(this, 'clickSend'),"Send");
         this.createButton($b(this, 'clickCancel'),"Cancel");
      }
}
$reg('com.jiggmin.pr3.userMenu.SendThingPopup', SendThingPopup);
