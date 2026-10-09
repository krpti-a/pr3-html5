// Ported from com/jiggmin/pr3/lobby/multiPlayer/MultiPlayerPopup.as
import { LobbyPopup } from '../LobbyPopup.ts';
import { MatchList, SlimChat } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class MultiPlayerPopup extends LobbyPopup {
  declare chat: SlimChat;
  declare matchList: MatchList;
  declare quickLevel: any;
  init(): void {
         super.init();
         this.chat = new SlimChat();
         this.chat.x = 0;
         this.addGraphic(this.chat);
         this.matchList = new MatchList();
         this.matchList.x = this.chat.width + 5;
         this.addGraphic(this.matchList);
      }
  remove(): void {
         this.chat.remove();
         this.chat = null;
         this.matchList.remove();
         this.matchList = null;
         super.remove();
      }
  constructor() {
         super();
      }
}
$reg('com.jiggmin.pr3.lobby.multiPlayer.MultiPlayerPopup', MultiPlayerPopup);
