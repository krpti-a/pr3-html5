// Ported from com/jiggmin/pr3/chat/LobbyChat.as
import { Event, KeyboardEvent, MovieClip } from '../../../flash/index.ts';
import { int, $b } from '../../../flash/as3.ts';
import { Chat } from './Chat.ts';
import { ChatDropdown, CreateRoomPopup, Data, DropdownEvent, MiscEvent, PlatformRacing3, Removable, SocketManager } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class LobbyChat extends Chat {
  static lastRoom: string = "chat-Home";
  declare chatDropdown: ChatDropdown;
  declare m: MovieClip;
  declare createRoomPopup: CreateRoomPopup;
  selectRoomHandler(event: DropdownEvent): void {
         var _loc_2= event.data;
         this.joinRoom(_loc_2.roomName);
      }
  removePopupHandler(event: Event): void {
         this.removeCreateRoomPopup();
      }
  remove(): void {
         this.m.inputBox.removeEventListener(KeyboardEvent.KEY_DOWN,$b(this, 'keyInput'));
         this.removeChild(this.m);
         this.m = null;
         this.removeCreateRoomPopup();
         this.chatDropdown.remove();
         this.chatDropdown.removeEventListener(Event.CHANGE,$b(this, 'selectRoomHandler'));
         this.chatDropdown = null;
         super.remove();
      }
  joinRoom(param1: string, param2: string = "", param3: string = "", autoJoin: boolean = true, autoLeave: boolean = true): void {
         var _loc_4= null;
         if(this.room == null || this.room.roomName != param1)
         {
            LobbyChat.lastRoom = param1;
            super.joinRoom(param1,param2,param3);
            _loc_4 = this.room.roomName.substr(5);
            this.addSystemMessage("Joining " + Data.cleanHTML(_loc_4) + "...");
            this.chatDropdown.setRoomName(this.room.roomName);
         }
      }
  setM(param1: MovieClip): void {
         this.m = param1;
         param1.sendButton.init("Send",$b(this, 'clickSend'));
         param1.createRoomButton.init("New",$b(this, 'clickCreateRoom'));
         param1.inputBox.addEventListener(KeyboardEvent.KEY_DOWN,$b(this, 'keyInput'),false,0,true);
         param1.inputBox.maxChars = 250;
         this.nameMaker.listenForLink(param1.textBox);
         if(param1.userBox != null)
         {
            this.nameMaker.listenForLink(param1.userBox);
            param1.userBox.selectable = true;
         }
         this.addChild(param1);
         this.chatDropdown = new ChatDropdown(SocketManager.socket,param1.roomDropdown);
         this.chatDropdown.addEventListener(Event.CHANGE,$b(this, 'selectRoomHandler'),false,0,true);
         this.joinRoom(LobbyChat.lastRoom);
      }
  removeCreateRoomPopup(): void {
         if(this.createRoomPopup != null)
         {
            this.createRoomPopup.removeEventListener("createRoom",$b(this, 'createRoomHandler'));
            this.createRoomPopup.removeEventListener(Removable.REMOVE,$b(this, 'removePopupHandler'));
            this.createRoomPopup = null;
         }
      }
  createRoomHandler(event: MiscEvent): void {
         var _loc_2= event.data;
         var _loc_3= "chat-" + _loc_2.roomName;
         this.joinRoom(_loc_3,_loc_2.pass,_loc_2.note);
      }
  getMessageToSend(): string {
         var _loc_1= this.m.inputBox.text;
         this.m.inputBox.text = "";
         return _loc_1;
      }
  showMessageText(param1: string): void {
         var _loc_2= false;
         if(this.m != null)
         {
            _loc_2 = false;
            if(this.m.textBox.scrollPerc > 0.98 || this.m.textBox.scrollPerc == 0)
            {
               _loc_2 = true;
            }
            this.m.textBox.htmlText = param1;
            if(_loc_2)
            {
               this.m.textBox.scrollPerc = 1;
            }
         }
      }
  clickCreateRoom(): void {
         this.createRoomPopup = new CreateRoomPopup(SocketManager.socket);
         this.createRoomPopup.addEventListener("createRoom",$b(this, 'createRoomHandler'),false,0,true);
         this.createRoomPopup.addEventListener(Removable.REMOVE,$b(this, 'removePopupHandler'),false,0,true);
         PlatformRacing3.addPopup(this.createRoomPopup);
      }
  constructor() {
         super();
         this.maxMessages = int(100);
      }
}
$reg('com.jiggmin.pr3.chat.LobbyChat', LobbyChat);
