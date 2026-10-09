// Ported from com/jiggmin/pr3/lobby/chat/ChatPopup.as
import { LobbyPopup } from '../LobbyPopup.ts';
import { FullChat } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class ChatPopup extends LobbyPopup {
  declare chat: FullChat;
  init(): void {
         super.init();
         this.chat = new FullChat();
         this.addGraphic(this.chat);
      }
  remove(): void {
         this.chat.remove();
         this.chat = null;
         super.remove();
      }
  constructor() {
         super();
      }
}
$reg('com.jiggmin.pr3.lobby.chat.ChatPopup', ChatPopup);
