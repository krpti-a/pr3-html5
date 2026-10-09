// Ported from com/jiggmin/blossomSocket/BlossomSocket.as
import { ByteArray, Event, clearInterval, realTimer, setInterval } from '../../flash/index.ts';
import { int, uint, $b } from '../../flash/as3.ts';
import { CommandSocket } from './CommandSocket.ts';
import { BlossomEvent, ClientBlossomUser } from '../refs.ts';
import { $reg } from '../refs.ts';

export class BlossomSocket extends CommandSocket {
  lastTime: number = 0;
  baseLocalTime: number = 0;
  _socketID: number = 0;
  declare _me: ClientBlossomUser;
  timeInterval: number = 0;
  pingInterval: number = 0;
  version: number = 1.2;
  baseServerTime: number = 0;
  testPingInterval: number = 0;
  testPingTime: number = NaN;
  ping: number = 0;
  connectHandler(event: Event): void {
         clearInterval(this.testPingInterval);
         this.testPingInterval = uint(setInterval($b(this, 'sendTestPing'),1000));
         super.connectHandler(event);
         this.sendTestPing();
      }
  deleteGlobalVars(param1: any): void {
         this.manageVars(param1,"global","delete","");
      }
  checkTime(): void {
         var _loc_2= null;
         var _loc_1= this.getMS();
         if(_loc_1 < this.lastTime)
         {
            _loc_2 = ({} as any);
            _loc_2.error = "Local Time Error. (Are you traveling faster than the speed of light?)";
            this.dispatchEvent(new BlossomEvent(BlossomEvent.ERROR,_loc_2));
         }
         if(this.lastTime > 0 && _loc_1 > this.lastTime + 5000)
         {
            _loc_2 = ({} as any);
            _loc_2.error = "Local Time Error. (Are you traveling slower than grandpa?)";
            this.dispatchEvent(new BlossomEvent(BlossomEvent.ERROR,_loc_2));
         }
         this.lastTime = _loc_1;
      }
  unlockRoomVars(param1: string): void {
         this.manageVars("","room","unlock",param1);
      }
  getUserVars(param1: any, param2: number): void {
    param2 = int(param2);
         this.manageVars(param1,"user","get",param2.toString());
      }
  initListeners(): void {
         this.addEventListener(BlossomEvent.RECEIVE_SOCKET_ID,$b(this, 'receiveSocketIDHandler'),false,0,true);
         this.addEventListener(BlossomEvent.RECEIVE_MESSAGE,$b(this, 'receiveMessageHandler'),false,0,true);
         this.addEventListener(BlossomEvent.RECEIVE_USER_VARS,$b(this, 'receiveUserVarsHandler'),false,0,true);
         this.addEventListener(BlossomEvent.RECEIVE_ROOM_VARS,$b(this, 'receiveRoomVarsHandler'),false,0,true);
         this.addEventListener(BlossomEvent.RECEIVE_VERSION,$b(this, 'receiveVersionHandler'),false,0,true);
         this.addEventListener(BlossomEvent.RECEIVE_USERS,$b(this, 'receiveUsersHandler'),false,0,true);
         this.addEventListener(BlossomEvent.USER_JOIN_ROOM,$b(this, 'userJoinRoomHandler'),false,0,true);
         this.addEventListener(BlossomEvent.USER_LEAVE_ROOM,$b(this, 'userLeaveRoomHandler'),false,0,true);
         this.addEventListener("updateUserRoomVars",$b(this, 'updateUserRoomVarsHandler'),false,0,true);
         this.addEventListener(BlossomEvent.LOGIN_SUCCESS,$b(this, 'loginSuccessHandler'),false,0,true);
         this.addEventListener(BlossomEvent.PING,$b(this, 'receivePing'),false,0,true);
         this.addEventListener("testPing",$b(this, 'receiveTestPing'),false,0,true);
      }
  loginSuccessHandler(event: BlossomEvent): void {
         this._me = new ClientBlossomUser(this,this.socketID,event.userID,event.userName,event.vars,event.raw.permissions);
      }
  remove(): void {
         this.removeEventListener(BlossomEvent.RECEIVE_SOCKET_ID,$b(this, 'receiveSocketIDHandler'));
         this.removeEventListener(BlossomEvent.RECEIVE_MESSAGE,$b(this, 'receiveMessageHandler'));
         this.removeEventListener(BlossomEvent.RECEIVE_USER_VARS,$b(this, 'receiveUserVarsHandler'));
         this.removeEventListener(BlossomEvent.RECEIVE_ROOM_VARS,$b(this, 'receiveRoomVarsHandler'));
         this.removeEventListener(BlossomEvent.RECEIVE_VERSION,$b(this, 'receiveVersionHandler'));
         this.removeEventListener(BlossomEvent.RECEIVE_USERS,$b(this, 'receiveUsersHandler'));
         this.removeEventListener(BlossomEvent.USER_JOIN_ROOM,$b(this, 'userJoinRoomHandler'));
         this.removeEventListener(BlossomEvent.USER_LEAVE_ROOM,$b(this, 'userLeaveRoomHandler'));
         this.removeEventListener("updateUserRoomVars",$b(this, 'updateUserRoomVarsHandler'));
         this.removeEventListener(BlossomEvent.PING,$b(this, 'receivePing'));
         this.removeEventListener(BlossomEvent.LOGIN_SUCCESS,$b(this, 'loginSuccessHandler'));
         this.removeEventListener("testPing",$b(this, 'receiveTestPing'));
         if(this._me != null)
         {
            this._me.remove();
            this._me = null;
         }
         clearInterval(this.pingInterval);
         clearInterval(this.timeInterval);
         clearInterval(this.testPingInterval);
         super.remove();
      }
  getMS(): number {
         var _loc_1= new Date();
         return _loc_1.time;
      }
  setRoomPass(param1: string, param2: string): void {
         var _loc_3= ({} as any);
         _loc_3.t = "rp";
         _loc_3.room_name = param1;
         _loc_3.pass = param2;
         this.send(_loc_3);
      }
  get me(): ClientBlossomUser {
         return this._me;
      }
  setUserVars(param1: any): void {
         this._me.addVars(param1);
         this.manageVars(param1,"user","set","");
      }
  sendPing(): void {
         var _loc_1= ({} as any);
         _loc_1.t = "ping";
         _loc_1.time = realTimer();
         this.send(_loc_1);
      }
  receiveVersionHandler(event: BlossomEvent): void {
         var _loc_2= null;
         if(event.version > this.version)
         {
            _loc_2 = ({} as any);
            _loc_2.error = "Platform Racing 3 has been updated! Please refresh this page to try to load the newer version.";
            this.dispatchEvent(new BlossomEvent(BlossomEvent.ERROR,_loc_2));
         }
      }
  getRoomVars(param1: any, param2: string): void {
         this.manageVars(param1,"room","get",param2);
      }
  sendToRoom(roomName: string, roomType: string, data: any, sendToSelf: boolean = false): void {
         var packet: any= ({} as any);
         packet.t = "sr";
         packet.room_name = roomName;
         packet.room_type = roomType;
         packet.send_to_self = sendToSelf;
         packet.data = data;
         this.send(packet);
      }
  userJoinRoomHandler(event: BlossomEvent): void {
         this.dispatchEvent(new BlossomEvent(BlossomEvent.USER_JOIN_ROOM + event.roomName,event.raw));
      }
  errorHandler(event: BlossomEvent): void {
         if(event.roomName != null)
         {
            this.dispatchEvent(new BlossomEvent(BlossomEvent.ERROR + event.roomName,event.raw));
         }
      }
  register(param1: string, param2: string, param3: string = ""): void {
         var _loc_4= ({} as any);
         _loc_4.t = "register";
         _loc_4.name = param1;
         _loc_4.pass = param2;
         _loc_4.email = param3;
         this.send(_loc_4);
      }
  joinRoom(param1: string, param2: string = "", param3: string = "", param4: string = "", chatId: number = 0): void {
    chatId = uint(chatId);
         var _loc_5= ({} as any);
         _loc_5.t = "jr";
         _loc_5.room_name = param1;
         _loc_5.room_type = param3;
         _loc_5.pass = param2;
         if(param4 != "" && param4 != null)
         {
            _loc_5.note = param4;
         }
         _loc_5.chatId = chatId;
         this.send(_loc_5);
      }
  sendToUser(param1: number, param2: any): void {
    param1 = int(param1);
         var _loc_3= ({} as any);
         _loc_3.t = "su";
         _loc_3.to_id = param1;
         _loc_3.data = param2;
         this.send(_loc_3);
      }
  receiveMessageHandler(event: BlossomEvent): void {
         if(event.roomName != null)
         {
            this.dispatchEvent(new BlossomEvent(BlossomEvent.RECEIVE_MESSAGE + event.roomName,event.raw));
         }
         if(event.socketID != 0)
         {
            this.dispatchEvent(new BlossomEvent(BlossomEvent.RECEIVE_MESSAGE + event.socketID,event.raw));
         }
      }
  setRoomVars(param1: any, param2: string): void {
         this.manageVars(param1,"room","set",param2);
      }
  userLeaveRoomHandler(event: BlossomEvent): void {
         this.dispatchEvent(new BlossomEvent(BlossomEvent.USER_LEAVE_ROOM + event.roomName,event.raw));
      }
  updateUserRoomVarsHandler(event: BlossomEvent): void {
         this.dispatchEvent(new BlossomEvent("updateUserRoomVars" + event.roomName,event.raw));
      }
  receiveUsersHandler(event: BlossomEvent): void {
         var _loc_3= 0;
         var _loc_5= null;
         var _loc_6= null;
         var _loc_2= event.userList;
         var _loc_4= _loc_2.length;
         _loc_3 = 0;
         while(_loc_3 < _loc_4)
         {
            _loc_5 = _loc_2[_loc_3];
            _loc_6 = ({} as any);
            _loc_6.type = BlossomEvent.USER_JOIN_ROOM;
            _loc_6.socketID = _loc_5.socketID;
            _loc_6.userID = _loc_5.userID;
            _loc_6.userName = _loc_5.userName;
            _loc_6.vars = _loc_5.vars;
            _loc_6.roomName = event.roomName;
            this.dispatchEvent(new BlossomEvent(BlossomEvent.USER_JOIN_ROOM,_loc_6));
            _loc_3++;
         }
      }
  manageVars(param1: any, param2: string, param3: string, param4: string): void {
         var _loc_5= ({} as any);
         _loc_5.t = "mv";
         _loc_5.user_vars = param1;
         _loc_5.location = param2;
         _loc_5.action = param3;
         _loc_5.id = param4;
         this.send(_loc_5);
      }
  closeHandler(event: Event): void {
         clearInterval(this.pingInterval);
         clearInterval(this.testPingInterval);
         super.closeHandler(event);
      }
  receiveSocketIDHandler(event: BlossomEvent): void {
         this._me = new ClientBlossomUser(this,event.socketID,0,null,({} as any),new Array());
         this._socketID = int(event.socketID);
         var _loc_2= new BlossomEvent(BlossomEvent.READY,event.raw);
         this.dispatchEvent(_loc_2);
      }
  leaveRoom(roomName: string, roomType: string): void {
         var _loc_2= ({} as any);
         _loc_2.t = "lr";
         _loc_2.room_name = roomName;
         _loc_2.room_type = roomType;
         this.send(_loc_2);
      }
  receiveRoomVarsHandler(event: BlossomEvent): void {
         this.dispatchEvent(new BlossomEvent(BlossomEvent.RECEIVE_ROOM_VARS + event.roomName,event.raw));
      }
  getRooms(): void {
         var _loc_1= ({} as any);
         _loc_1.t = "gr";
         this.send(_loc_1);
      }
  get socketID(): number {
         return this._socketID;
      }
  receiveUserVarsHandler(event: BlossomEvent): void {
         this.dispatchEvent(new BlossomEvent(BlossomEvent.RECEIVE_USER_VARS + event.socketID,event.raw));
      }
  unlockGlobalVars(): void {
         this.manageVars("","global","unlock","");
      }
  lockUserVars(): void {
         this.manageVars("","user","lock","");
      }
  getGlobalVars(param1: any): void {
         this.manageVars(param1,"global","get","");
      }
  deleteUserVars(param1: any): void {
         this.manageVars(param1,"user","delete","");
      }
  getSeconds(): number {
         var _loc_1= this.getMS();
         return Math.round(_loc_1 / 1000);
      }
  getStats(): void {
         var _loc_1= ({} as any);
         _loc_1.t = "get_stats";
         this.send(_loc_1);
      }
  setGlobalVars(param1: any): void {
         this.manageVars(param1,"global","set","");
      }
  deleteRoomVars(param1: any, param2: string): void {
         this.manageVars(param1,"room","delete",param2);
      }
  receivePing(event: BlossomEvent): void {
         var _loc_2= NaN;
         var _loc_3= NaN;
         var _loc_4= NaN;
         var _loc_5= null;
         if(this.baseServerTime == 0)
         {
            this.baseServerTime = event.raw.server_time;
            this.baseLocalTime = realTimer();
         }
         else
         {
            _loc_2 = event.raw.server_time - this.baseServerTime;
            _loc_3 = realTimer() - this.baseLocalTime;
            _loc_4 = _loc_2 - _loc_3;
            if(Math.abs(_loc_4) > 10)
            {
               _loc_5 = ({} as any);
               _loc_5.error = "Remote Time Error. (Are you located near a black hole?)";
               this.dispatchEvent(new BlossomEvent(BlossomEvent.ERROR,_loc_5));
               return;
            }
         }
      }
  sendTestPing(): void {
         this.testPingTime = realTimer();
         this.send({ t: 'test_ping' });
      }
  receiveTestPing(event: BlossomEvent): void {
         this.ping = uint(realTimer() - this.testPingTime);
         this.send({ t: 'report_ping', ping: this.ping });
      }
  login(param1: string, param2: string): void {
         var _loc_3= ({} as any);
         _loc_3.t = "login";
         _loc_3.name = param1;
         _loc_3.pass = param2;
         this.send(_loc_3);
      }
  lockRoomVars(param1: string): void {
         this.manageVars("","room","lock",param1);
      }
  lockGlobalVars(): void {
         this.manageVars("","global","lock","");
      }
  unlockUserVars(): void {
         this.manageVars("","user","unlock","");
      }
  constructor(param1: string, param2: number, param3: string) {
    param2 = int(param2);
         super();
         this.initListeners();
         this.setKey(param3);
         this.connect(param1,param2);
         this._me = new ClientBlossomUser(this,0,0,null,({} as any),new Array());
      }
}
$reg('com.jiggmin.blossomSocket.BlossomSocket', BlossomSocket);
