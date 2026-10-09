// Ported from com/jiggmin/pr3/lobby/userList/UsersPopup.as
import { LobbyPopup } from '../LobbyPopup.ts';
import { UserLists } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class UsersPopup extends LobbyPopup {
  declare userLists: UserLists;
  remove(): void {
         this.userLists.remove();
         this.userLists = null;
         super.remove();
      }
  constructor() {
         super();
         this.userLists = new UserLists();
         this.addGraphic(this.userLists);
      }
}
$reg('com.jiggmin.pr3.lobby.userList.UsersPopup', UsersPopup);
