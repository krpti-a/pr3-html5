// Ported from com/jiggmin/blossomSocket/BlossomRoom.as
import { Sprite } from '../../flash/index.ts';
import { int, uint, $each, $b } from '../../flash/as3.ts';
import { BlossomEvent, BlossomSocket, BlossomUser } from '../refs.ts';
import { $reg } from '../refs.ts';

export class BlossomRoom extends Sprite {
  declare _userArray: any[];
  declare socket: BlossomSocket;
  declare _roomName: string;
  declare _roomType: string;
  autoJoin: boolean = false;
  autoLeave: boolean = false;
  declare _vars: any;
  receiveRoomVarsHandler(event: BlossomEvent): void {
         this._vars = event.vars;
         this.dispatchEvent(new BlossomEvent(BlossomEvent.RECEIVE_ROOM_VARS,event.raw));
      }
  leaveRoom(): void {
         this.remove();
      }
  remove(): void {
         var user: BlossomUser= null;
         if(this.socket != null)
         {
            if(this.autoLeave)
            {
               this.socket.leaveRoom(this._roomName,this._roomType);
            }
            this.socket.removeEventListener(BlossomEvent.ERROR + this._roomName,$b(this, 'errorHandler'));
            this.socket.removeEventListener(BlossomEvent.RECEIVE_ROOM_VARS + this._roomName,$b(this, 'receiveRoomVarsHandler'));
            this.socket.removeEventListener(BlossomEvent.USER_JOIN_ROOM + this._roomName,$b(this, 'userJoinRoomHandler'));
            this.socket.removeEventListener(BlossomEvent.USER_LEAVE_ROOM + this._roomName,$b(this, 'userLeaveRoomHandler'));
            this.socket.removeEventListener(BlossomEvent.RECEIVE_MESSAGE + this._roomName,$b(this, 'receiveMessageHandler'));
            this.socket.removeEventListener("updateUserRoomVars" + this._roomName,$b(this, 'updateUserRoomVarsHandler'));
            this.socket = null;
         }
         for (user of $each(this._userArray))
         {
            user.remove();
         }
         this._userArray = null;
      }
  get roomName(): string {
         return this._roomName;
      }
  receiveMessageHandler(event: BlossomEvent): void {
         var _loc_5= null;
         var _loc_2= event.data;
         var _loc_3= event.socketID;
         var _loc_4= this._userArray[_loc_3];
         _loc_2.socketID = _loc_3;
         if(_loc_2.type == null || _loc_2.type == "")
         {
            _loc_5 = BlossomEvent.RECEIVE_MESSAGE;
         }
         else
         {
            _loc_5 = _loc_2.type;
         }
         this.dispatchEvent(new BlossomEvent(_loc_5,_loc_2,_loc_4));
      }
  updateUserRoomVarsHandler(event: BlossomEvent): void {
         var user: BlossomUser= this._userArray[event.socketID];
         if(user != null)
         {
            user.userID = event.userID;
            user.userName = event.userName;
            user.vars = event.vars;
            this.dispatchEvent(new BlossomEvent("updateUserRoomVars",event.raw,user));
         }
      }
  get userArray(): any[] {
         var _loc_2= null;
         var _loc_1= new Array();
         for (_loc_2 of $each(this._userArray))
         {
            if(_loc_2 != null)
            {
               _loc_1.push(_loc_2);
            }
         }
         return _loc_1;
      }
  setPass(param1: string): void {
         this.socket.setRoomPass(this._roomName,param1);
      }
  socketIDToUser(param1: number): BlossomUser {
    param1 = int(param1);
         return this._userArray[param1];
      }
  unlockVars(): void {
         this.socket.unlockRoomVars(this._roomName);
      }
  userJoinRoomHandler(event: BlossomEvent): void {
         if(this._userArray[event.socketID] != null)
         {
            return;
         }
         var _loc_2= new BlossomUser(this.socket,event.socketID,event.userID,event.userName,event.vars);
         this._userArray[event.socketID] = _loc_2;
         this.dispatchEvent(new BlossomEvent(BlossomEvent.USER_JOIN_ROOM,event.raw,_loc_2));
      }
  sendToRoom(data: any, sendToSelf: boolean = true, type: string = null): void {
         var data_: any= ({} as any);
         if(type != null)
         {
            data_.type = type;
         }
         data_.data = data;
         this.socket.sendToRoom(this._roomName,this._roomType,data_,sendToSelf);
      }
  getVars(param1: any): void {
         this.socket.getRoomVars(param1,this._roomName);
      }
  userLeaveRoomHandler(event: BlossomEvent): void {
         var _loc_2= event.socketID;
         var _loc_3= this._userArray[_loc_2];
         delete this._userArray[_loc_2];
         if(_loc_3 != null)
         {
            this.dispatchEvent(new BlossomEvent(BlossomEvent.USER_LEAVE_ROOM,event.raw,_loc_3));
            _loc_3.remove();
         }
         if(this.socket != null)
         {
            if(_loc_2 == this.socket.socketID)
            {
               this.remove();
            }
         }
      }
  errorHandler(event: BlossomEvent): void {
         var _loc_2= event.error;
         this.dispatchEvent(new BlossomEvent(BlossomEvent.ERROR,event.raw));
      }
  get vars(): any {
         return this._vars;
      }
  setVars(param1: any): void {
         this.socket.setRoomVars(param1,this._roomName);
      }
  lockVars(): void {
         this.socket.lockRoomVars(this._roomName);
      }
  userIDToUser(param1: number): BlossomUser {
    param1 = int(param1);
         var _loc_2= null;
         var _loc_4= null;
         var _loc_3= this.userArray;
         for (_loc_4 of $each(_loc_3))
         {
            if(_loc_4.userID == param1)
            {
               _loc_2 = _loc_4;
               break;
            }
         }
         return _loc_2;
      }
  deleteVars(param1: any): void {
         this.socket.deleteRoomVars(param1,this._roomName);
      }
  set _autoLeave(autoLeave: boolean) {
         this.autoLeave = autoLeave;
      }
  constructor(socket: BlossomSocket, roomName: string, pass: string = "", roomType: string = "", autoJoin: boolean = true, autoLeave: boolean = true, note: string = "", chatId: number = 0) {
    chatId = uint(chatId);
         super();
         this._userArray = new Array();
         this.socket = socket;
         this._roomName = roomName;
         this._roomType = roomType;
         this.autoJoin = autoJoin;
         this.autoLeave = autoLeave;
         socket.addEventListener(BlossomEvent.ERROR + roomName,$b(this, 'errorHandler'),false,0,true);
         socket.addEventListener(BlossomEvent.RECEIVE_ROOM_VARS + roomName,$b(this, 'receiveRoomVarsHandler'),false,0,true);
         socket.addEventListener(BlossomEvent.USER_JOIN_ROOM + roomName,$b(this, 'userJoinRoomHandler'),false,0,true);
         socket.addEventListener(BlossomEvent.USER_LEAVE_ROOM + roomName,$b(this, 'userLeaveRoomHandler'),false,0,true);
         socket.addEventListener(BlossomEvent.RECEIVE_MESSAGE + roomName,$b(this, 'receiveMessageHandler'),false,0,true);
         socket.addEventListener("updateUserRoomVars" + roomName,$b(this, 'updateUserRoomVarsHandler'),false,0,true);
         if(autoJoin)
         {
            socket.joinRoom(this._roomName,pass,roomType,note,chatId);
         }
      }
}
$reg('com.jiggmin.blossomSocket.BlossomRoom', BlossomRoom);
