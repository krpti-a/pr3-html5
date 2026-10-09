// Ported from com/jiggmin/pr3/lobby/mod/ModPopup.as
import { LobbyPopup } from '../LobbyPopup.ts';
import { ModPages, SocketManager } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class ModPopup extends LobbyPopup {
  declare modPages: ModPages;
  remove(): void {
         this.modPages.remove();
         this.modPages = null;
         super.remove();
      }
  constructor() {
         super();
         this.modPages = new ModPages();
         if(SocketManager.socket.me.hasPermission("access_moderator_tools"))
         {
            this.addGraphic(this.modPages);
         }
      }
}
$reg('com.jiggmin.pr3.lobby.mod.ModPopup', ModPopup);
