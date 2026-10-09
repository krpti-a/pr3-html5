// Ported from com/jiggmin/pr3/lobby/multiPlayer/QuickJoinPopup.as
import { $b } from '../../../../flash/as3.ts';
import { TextPopup } from '../../../popup/TextPopup.ts';
import { BlossomEvent, InMatchPopup, SocketManager } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class QuickJoinPopup extends TextPopup {
  clickCancel(): void {
         this.remove();
      }
  remove(): void {
         SocketManager.socket.stopQuickJoin();
         SocketManager.socket.removeEventListener("quickJoinSuccess",$b(this, 'successHandler'));
         super.remove();
      }
  successHandler(event: BlossomEvent): void {
         var _loc_2= event.raw;
         this.addPopup(new InMatchPopup(_loc_2));
         this.remove();
      }
  constructor() {
         super("Looking for a game to join...");
         SocketManager.socket.startQuickJoin();
         SocketManager.socket.addEventListener("quickJoinSuccess",$b(this, 'successHandler'),false,0,true);
         this.createButton($b(this, 'clickCancel'),"Cancel");
      }
}
$reg('com.jiggmin.pr3.lobby.multiPlayer.QuickJoinPopup', QuickJoinPopup);
