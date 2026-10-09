// Ported from com/jiggmin/pr3/lobby/multiPlayer/CreatingMatchPopup.as
import { $b } from '../../../../flash/as3.ts';
import { TextPopup } from '../../../popup/TextPopup.ts';
import { BlossomEvent, InMatchPopup, SocketManager } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class CreatingMatchPopup extends TextPopup {
  beVisible: boolean = false;
  clickCancel(): void {
         this.remove();
      }
  remove(): void {
         SocketManager.socket.removeEventListener("matchCreated",$b(this, 'matchCreatedHandler'));
         SocketManager.socket.removeEventListener("matchFailed",$b(this, 'matchFailedHandler'));
         super.remove();
      }
  matchCreatedHandler(event: BlossomEvent): void {
         var _loc_2= event.raw;
         var _loc_3= new InMatchPopup(_loc_2);
         _loc_3.visible = this.beVisible;
         this.addPopup(_loc_3);
         if(this.beVisible)
         {
            this.remove();
         }
      }
  matchFailedHandler(event: BlossomEvent): void {
         this.setText("The level could not be found. :(");
      }
  constructor(param1: boolean = true) {
         super("Creating Game...");
         this.beVisible = param1;
         this.createButton($b(this, 'clickCancel'),"Cancel");
         SocketManager.socket.addEventListener("matchCreated",$b(this, 'matchCreatedHandler'),false,0,true);
         SocketManager.socket.addEventListener("matchFailed",$b(this, 'matchFailedHandler'),false,0,true);
      }
}
$reg('com.jiggmin.pr3.lobby.multiPlayer.CreatingMatchPopup', CreatingMatchPopup);
