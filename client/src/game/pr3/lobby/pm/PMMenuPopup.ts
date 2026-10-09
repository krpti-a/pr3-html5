// Ported from com/jiggmin/pr3/lobby/pm/PMMenuPopup.as
import { $b } from '../../../../flash/as3.ts';
import { LobbyPopup } from '../LobbyPopup.ts';
import { CreateAccountPMGraphic, EasyButton, PMList, SendPMPopup, SocketManager } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class PMMenuPopup extends LobbyPopup {
  declare list: PMList;
  remove(): void {
         if(this.list != null)
         {
            this.list.remove();
            this.list = null;
         }
         super.remove();
      }
  clickCompose(): void {
         this.addPopup(new SendPMPopup());
      }
  clickDelete(): void {
         this.list.deleteSelected();
      }
  constructor() {
         var _loc_5= undefined;
         super();
         var _loc_2= null;
         var _loc_3= undefined;
         var _loc_4= undefined;
         if(SocketManager.socket.me.vars.guest)
         {
            _loc_2 = new CreateAccountPMGraphic();
            _loc_5 = false;
            _loc_2.mouseChildren = false;
            _loc_2.mouseEnabled = _loc_5;
            this.addGraphic(_loc_2);
         }
         else
         {
            this.list = new PMList();
            this.addGraphic(this.list);
            _loc_3 = new EasyButton();
            _loc_3.y = 2;
            this.addGraphic(_loc_3);
            _loc_3.init("Compose",$b(this, 'clickCompose'));
            _loc_4 = new EasyButton();
            _loc_4.y = 2;
            _loc_4.x = _loc_3.x + _loc_3.width + 5;
            this.addGraphic(_loc_4);
            _loc_4.init("Delete Selected",$b(this, 'clickDelete'));
         }
      }
}
$reg('com.jiggmin.pr3.lobby.pm.PMMenuPopup', PMMenuPopup);
