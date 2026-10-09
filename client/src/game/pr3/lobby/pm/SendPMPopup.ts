// Ported from com/jiggmin/pr3/lobby/pm/SendPMPopup.as
import { $b } from '../../../../flash/as3.ts';
import { ButtonPopup } from '../../../popup/ButtonPopup.ts';
import { EditorPopupBGGraphic, PMPopupGraphic, SocketManager } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class SendPMPopup extends ButtonPopup {
  declare m: any;
  init(): void {
         super.init();
         this.m.messageBox.aquireFocus();
      }
  clickCancel(): void {
         this.remove();
      }
  remove(): void {
         this.m = null;
         super.remove();
      }
  clickSend(): void {
         SocketManager.socket.sendPM(this.m.toBox.text,this.m.titleTextBox.text,this.m.messageBox.text);
         this.remove();
      }
  constructor(param1: string = "", param2: string = "", param3: string = "") {
         super();
         this.setBG(new EditorPopupBGGraphic());
         this.m = new PMPopupGraphic();
         this.m.toBox.maxChars = 40;
         this.m.titleTextBox.maxChars = 40;
         this.m.messageBox.maxChars = 1000;
         this.m.messageBox.multiline = true;
         this.m.messageBox.wordWrap = true;
         this.m.toBox.text = param1;
         this.m.titleTextBox.text = param2;
         if(param3 != "")
         {
            param3 = param3.replace(/\r/gi,"\n");
            this.m.messageBox.text = "\n-------------------\n" + param3;
         }
         this.addGraphic(this.m);
         this.createButton($b(this, 'clickSend'),"Send");
         this.createButton($b(this, 'clickCancel'),"Cancel");
      }
}
$reg('com.jiggmin.pr3.lobby.pm.SendPMPopup', SendPMPopup);
