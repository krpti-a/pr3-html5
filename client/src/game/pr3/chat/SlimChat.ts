// Ported from com/jiggmin/pr3/chat/SlimChat.as
import { LobbyChat } from './LobbyChat.ts';
import { SlimChatGraphic } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class SlimChat extends LobbyChat {
  constructor() {
         super();
         this.setM(new SlimChatGraphic());
      }
}
$reg('com.jiggmin.pr3.chat.SlimChat', SlimChat);
