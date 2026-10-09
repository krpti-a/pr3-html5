// Ported from com/jiggmin/pr3/chat/Chat.as
import { Keyboard, KeyboardEvent, clearInterval, setInterval } from '../../../flash/index.ts';
import { int, uint, $b } from '../../../flash/as3.ts';
import { Removable } from '../../basic/Removable.ts';
import { BlockManager, BlossomEvent, BlossomRoom, Data, GameChat, Key, MatchPage, NameMaker, PlatformRacing3, SocketManager } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class Chat extends Removable {
  declare static instance: Chat;
  static nextChatId: number = 0;
  chatId: number = uint(Chat.nextChatId++);
  messagesSent: number = 0;
  declare messageObjArray: any[];
  maxMessages: number = 10;
  declare messageArray: any[];
  declare room: BlossomRoom;
  clearSentInterval: number = 0;
  declare nameMaker: NameMaker;
  receiveRoomVarsHandler(event: BlossomEvent): void {
         if(event.raw.chatId != this.chatId)
         {
            return;
         }
         this.room.addEventListener("chat",$b(this, 'receiveChatHandler'),false,0,true);
         this.room.addEventListener("ban",$b(this, 'receiveBanHandler'),false,0,true);
         var _loc_2= event.vars;
         if(_loc_2["banned_" + SocketManager.socket.me.userName] == true)
         {
            this.leaveRoom();
            this.addSystemMessage("You have been banned from this room.");
         }
         else
         {
            if(_loc_2.creator != null)
            {
               this.addSystemMessage("This room is brought to you by: " + Data.filterSwearing(Data.cleanHTML(_loc_2.creator)));
            }
            if(_loc_2.note != null)
            {
               this.addSystemMessage(Data.filterSwearing(Data.cleanHTML(_loc_2.note)));
            }
         }
      }
  leaveRoom(): void {
         if(this.room != null)
         {
            this.room.removeEventListener("chat",$b(this, 'receiveChatHandler'));
            this.room.removeEventListener("ban",$b(this, 'receiveBanHandler'));
            this.room.removeEventListener(BlossomEvent.RECEIVE_ROOM_VARS,$b(this, 'receiveRoomVarsHandler'));
            this.room.remove();
            this.room = null;
            this.clearMessages();
         }
      }
  remove(): void {
         if(Chat.instance == this)
         {
            Chat.instance = null;
         }
         clearInterval(this.clearSentInterval);
         this.leaveRoom();
         this.nameMaker.remove();
         this.nameMaker = null;
         this.messageArray = null;
         this.messageObjArray = null;
         super.remove();
      }
  getLog(): string {
         var _loc_6= null;
         var _loc_1= 25;
         var _loc_2= this.messageObjArray;
         var _loc_3= "";
         if(_loc_2.length > _loc_1)
         {
            _loc_2 = _loc_2.slice(_loc_2.length - 25);
         }
         var _loc_4= _loc_2.length;
         var _loc_5= 0;
         while(_loc_5 < _loc_4)
         {
            _loc_6 = _loc_2[_loc_5];
            _loc_3 += "\n" + _loc_6.name + ": " + _loc_6.message;
            _loc_5++;
         }
         return _loc_3;
      }
  clearMessages(): void {
         this.messageArray = new Array();
         this.showMessages();
      }
  getMessageToSend(): string {
         return "";
      }
  showMessageText(param1: string): void {
      }
  addChatObj(data: any): void {
         var message: string= null;
         if(SocketManager.socket.ignoredArray.indexOf(data.userID) == -1)
         {
            message = Data.filterSwearing(Data.cleanHTML(data.message));
            message = this.nameMaker.makeNameFromParts(data.name,data.socketID,data.userID,data.nameColor) + ": <font size=\'10\'>" + message + "</font>";
            if(!data.highlight)
            {
               this.addMessage(message);
            }
            else
            {
               this.addMessage("<font color=\"#ff0000\">>></font> " + message);
            }
         }
         this.messageObjArray.push(data);
         if(this.messageObjArray.length > this.maxMessages)
         {
            this.messageObjArray.shift();
         }
      }
  sendMessage(): void {
         var count: number = int(0);
         var _loc_4= undefined;
         var _loc_5= undefined;
         var _loc_3= null;
         var _loc_1= SocketManager.socket;
         var message: string= this.getMessageToSend();
         var messageLower: string= message.toLowerCase();
         if(messageLower.indexOf("/setworkers ") == 0)
         {
            count = int(int(message.substring(12)));
            BlockManager.createWorkers(PlatformRacing3.instance.stage.loaderInfo,count);
            this.addSystemMessage("Workers are now set to: " + count);
            this.addSystemMessage("Please note that works should not be more CPU Cores * 2");
            this.addSystemMessage("Also every new worker uses about ~20MB RAM so be careful");
            return;
         }
         if(messageLower.indexOf("/alerts") == 0)
         {
            if(MatchPage.instance != null && MatchPage.instance.localPlayer != null)
            {
               MatchPage.instance.localPlayer.allowAlerts = !MatchPage.instance.localPlayer.allowAlerts;
               if(MatchPage.instance.localPlayer.allowAlerts)
               {
                  this.addSystemMessage("You have allowed alerts in this match");
               }
               else
               {
                  this.addSystemMessage("You have disabled alerts in this match");
               }
            }
            else
            {
               this.addSystemMessage("You may only use this command in match");
            }
            return;
         }
         if(!_loc_1.me.vars.guest)
         {
            if(Boolean(SocketManager.socket.me.hasPermission("access_bypass_chat_flood")) || this.messagesSent < 6)
            {
               if(message != "")
               {
                  _loc_3 = ({} as any);
                  _loc_3.message = message;
                  this.room.sendToRoom(_loc_3,true,"chat");
                  _loc_4 = this;
                  _loc_5 = this.messagesSent + 1;
                  _loc_4.messagesSent = _loc_5;
               }
            }
            else
            {
               this.addSystemMessage("Please wait a few moments before sending another chat.");
            }
         }
         else
         {
            this.getMessageToSend();
            this.addSystemMessage("Guests can not chat. :(");
         }
      }
  joinRoom(param1: string, param2: string = "", param3: string = "", autoJoin: boolean = true, autoLeave: boolean = true): void {
         if(this.room == null || this.room.roomName != param1)
         {
            this.leaveRoom();
            this.room = new BlossomRoom(SocketManager.socket,param1,param2,"chat",autoJoin,autoLeave,param3,this.chatId);
            if(this instanceof GameChat)
            {
               this.room.addEventListener("chat",$b(this, 'receiveChatHandler'),false,0,true);
               this.room.addEventListener("ban",$b(this, 'receiveBanHandler'),false,0,true);
            }
            else
            {
               this.room.addEventListener(BlossomEvent.RECEIVE_ROOM_VARS,$b(this, 'receiveRoomVarsHandler'),false,0,true);
            }
         }
      }
  addMessage(param1: string): void {
         this.messageArray.push(param1);
         if(this.messageArray.length > this.maxMessages)
         {
            this.messageArray.shift();
         }
         this.showMessages();
      }
  showMessages(): void {
         var _loc_1= null;
         if(!Key.isDown(Keyboard.CONTROL) || !Key.isDown(Keyboard.ALTERNATE))
         {
            _loc_1 = this.messageArray.join("<br/>");
            this.showMessageText(_loc_1);
         }
      }
  keyInput(event: KeyboardEvent): void {
         if(event.keyCode == 13)
         {
            this.sendMessage();
         }
      }
  receiveChatHandler(event: BlossomEvent): void {
         var _loc_2= event.data;
         this.addChatObj(_loc_2);
      }
  clickSend(): void {
         this.sendMessage();
      }
  clearMessagesSent(): void {
         this.messagesSent = int(0);
      }
  addSystemMessage(param1: string, color: number = 1922199): void {
    color = uint(color);
         param1 = "# <font color=\"#" + color.toString(16) + "\" size=\"10\"><i>" + param1 + "</i></font>";
         this.addMessage(param1);
      }
  receiveBanHandler(event: BlossomEvent): void {
      }
  constructor() {
         super();
         this.messageArray = new Array();
         this.messageObjArray = new Array();
         this.nameMaker = new NameMaker();
         Chat.instance = this;
         this.clearSentInterval = uint(setInterval($b(this, 'clearMessagesSent'),15000));
      }
}
$reg('com.jiggmin.pr3.chat.Chat', Chat);
