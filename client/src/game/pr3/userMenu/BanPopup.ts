// Ported from com/jiggmin/pr3/userMenu/BanPopup.as
import { int, $b } from '../../../flash/as3.ts';
import { ButtonPopup } from '../../popup/ButtonPopup.ts';
import { BanPopupGraphic, SocketManager } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class BanPopup extends ButtonPopup {
  userID: number = 0;
  declare banType: string;
  declare log: string;
  declare m: any;
  socketID: number = 0;
  clickCancel(): void {
         this.remove();
      }
  clickOK(): void {
         var _loc_1= this.m.durationDropdown.selectedOption.data;
         if(_loc_1 != -1)
         {
            _loc_1 *= this.m.duration.text;
         }
         var _loc_2= this.m.inputBox.text;
         SocketManager.socket.banUser(this.socketID,this.userID,_loc_1,this.banType,_loc_2,this.log);
         this.remove();
      }
  quickCommit(param1: number, param2: string): void {
         SocketManager.socket.banUser(this.socketID,this.userID,param1,this.banType,param2,this.log);
         this.remove();
      }
  remove(): void {
         this.m = null;
         super.remove();
      }
  constructor(param1: string, param2: string, param3: number, param4: number, param5: string = "") {
    param3 = int(param3); param4 = int(param4);
         super();
         this.m = new BanPopupGraphic();
         this.banType = param2;
         this.socketID = int(param3);
         this.userID = int(param4);
         this.log = param5;
         this.m.duration.text = "0";
         this.m.duration.restrict = "0-9.";
         this.createButton($b(this, 'clickOK'),"OK");
         this.createButton($b(this, 'clickCancel'),"Cancel");
         if(param2 == "silence")
         {
            this.m.titleBox.text = "Silence " + param1;
         }
         else
         {
            this.m.titleBox.text = "Ban " + param1;
         }
         this.m.inputBox.multiline = true;
         this.m.inputBox.wordWrap = true;
         this.m.inputBox.maxChars = 500;
         this.m.durationDropdown.addOption("Second(s)",1);
         this.m.durationDropdown.addOption("Minute(s)",60,true);
         this.m.durationDropdown.addOption("Hour(s)",60 * 60);
         this.m.durationDropdown.addOption("Day(s)",60 * 60 * 24);
         this.m.durationDropdown.addOption("Week(s)",60 * 60 * 24 * 7);
         this.m.durationDropdown.addOption("Month(s)",60 * 60 * 24 * 30);
         this.m.durationDropdown.addOption("Year(s)",60 * 60 * 24 * 365);
         this.m.durationDropdown.addOption("Permament",-1);
         this.addGraphic(this.m);
      }
}
$reg('com.jiggmin.pr3.userMenu.BanPopup', BanPopup);
