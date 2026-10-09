// Ported from com/jiggmin/pr3/lobby/chat/ChatDropdown.as
import { Event } from '../../../../flash/index.ts';
import { $b } from '../../../../flash/as3.ts';
import { Removable } from '../../../basic/Removable.ts';
import { BlossomEvent, BlossomSocket, DropdownEvent, EasyDropdown } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class ChatDropdown extends Removable {
  declare m: EasyDropdown;
  roomName: string = "";
  declare socket: BlossomSocket;
  remove(): void {
         this.socket.removeEventListener(BlossomEvent.RECEIVE_ROOMS,$b(this, 'recieveRoomsHandler'));
         this.m.removeEventListener(DropdownEvent.SELECT,$b(this, 'selectDropdownHandler'));
         this.m.removeEventListener(Event.OPEN,$b(this, 'openDropdownHandler'));
         this.m.removeEventListener(Event.CLOSE,$b(this, 'closeDropdownHandler'));
         this.m.remove();
         this.m = null;
         this.socket = null;
         super.remove();
      }
  closeDropdownHandler(event: Event): void {
         this.m.clearOptions();
         this.m.label = this.roomName.substr(5);
      }
  set width(param1: number) {
         this.m.width = param1;
      }
  recieveRoomsHandler(event: BlossomEvent): void {
         this.m.clearOptions();
         var _loc_4= 0;
         var _loc_5= null;
         var _loc_7= null;
         var _loc_2= event.roomList;
         var _loc_3= _loc_2.length;
         var _loc_6= _loc_2.sortOn("members",Array.DESCENDING | Array.NUMERIC);
         _loc_4 = 0;
         while(_loc_4 < _loc_3)
         {
            _loc_5 = _loc_6[_loc_4];
            _loc_7 = _loc_5.roomName;
            if(_loc_7.indexOf("chat-") == 0)
            {
               _loc_7 = _loc_7.substr(5);
               this.m.addOption(_loc_7 + " - " + _loc_5.members,_loc_5);
            }
            _loc_4++;
         }
      }
  set height(param1: number) {
         this.m.height = param1;
      }
  openDropdownHandler(event: Event): void {
         this.socket.getRooms();
      }
  setRoomName(param1: string): void {
         this.roomName = param1;
         this.m.label = param1.substr(5);
      }
  selectDropdownHandler(event: DropdownEvent): void {
         var _loc_2= event.data.roomName;
         if(_loc_2 != this.roomName)
         {
            this.roomName = _loc_2;
            this.dispatchEvent(new DropdownEvent(Event.CHANGE,event.option));
         }
      }
  get width(): any { return super.width; }
  get height(): any { return super.height; }
  constructor(param1: BlossomSocket, param2: EasyDropdown) {
         super();
         this.socket = param1;
         this.m = param2;
         param2.label = "Home";
         param1.addEventListener(BlossomEvent.RECEIVE_ROOMS,$b(this, 'recieveRoomsHandler'),false,0,true);
         param2.addEventListener(DropdownEvent.SELECT,$b(this, 'selectDropdownHandler'),false,0,true);
         param2.addEventListener(Event.OPEN,$b(this, 'openDropdownHandler'),false,0,true);
         param2.addEventListener(Event.CLOSE,$b(this, 'closeDropdownHandler'),false,0,true);
      }
}
$reg('com.jiggmin.pr3.lobby.chat.ChatDropdown', ChatDropdown);
