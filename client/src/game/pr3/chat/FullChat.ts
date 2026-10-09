// Ported from com/jiggmin/pr3/chat/FullChat.as
import { clearInterval, setInterval } from '../../../flash/index.ts';
import { int, uint, $b } from '../../../flash/as3.ts';
import { LobbyChat } from './LobbyChat.ts';
import { BlossomEvent, FullChatGraphic, SocketManager } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class FullChat extends LobbyChat {
  memberListInterval: number = 0;
  memberListHandler(event: BlossomEvent): void {
         var member: any= null;
         var htmlText: string= "";
         var memberList: any= event.raw.list;
         for(var i: number = int(0); i < memberList.length; i++)
         {
            member = memberList[i];
            htmlText += this.nameMaker.makeNameFromParts(member["userName"],member["socketID"],member["userID"],member["nameColor"]) + "<br/>";
         }
         this.m.userBox.htmlText = htmlText;
      }
  remove(): void {
         clearInterval(this.memberListInterval);
         if(SocketManager.socket != null)
         {
            SocketManager.socket.removeEventListener("memberList",$b(this, 'memberListHandler'));
         }
         super.remove();
      }
  joinRoom(param1: string, param2: string = "", param3: string = "", autoJoin: boolean = true, autoLeave: boolean = true): void {
         super.joinRoom(param1,param2,param3);
         this.requestMemberList();
      }
  requestMemberList(): void {
         if(this.room != null)
         {
            SocketManager.socket.getMemberList(this.room.roomName);
         }
      }
  constructor() {
         super();
         this.setM(new FullChatGraphic());
         SocketManager.socket.addEventListener("memberList",$b(this, 'memberListHandler'),false,0,true);
         this.memberListInterval = uint(setInterval($b(this, 'requestMemberList'),10000));
      }
}
$reg('com.jiggmin.pr3.chat.FullChat', FullChat);
