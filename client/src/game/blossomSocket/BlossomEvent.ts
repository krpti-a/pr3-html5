// Ported from com/jiggmin/blossomSocket/BlossomEvent.as
import { Event } from '../../flash/index.ts';
import { int } from '../../flash/as3.ts';
import { BlossomUser } from '../refs.ts';
import { $reg } from '../refs.ts';

export class BlossomEvent extends Event {
  static PING: string = "ping";
  static READY: string = "ready";
  static RECEIVE_STATS: string = "receiveStats";
  static RECEIVE_GLOBAL_VARS: string = "receiveGdlobalVars";
  static REGISTER_SUCCESS: string = "registerSuccess";
  static REGISTER_ERROR: string = "registerError";
  static RECEIVE_ROOM_VARS: string = "receiveRoomVars";
  static RECEIVE_ROOMS: string = "receiveRooms";
  static USER_JOIN_ROOM: string = "userJoinRoom";
  static RECEIVE_USER_VARS: string = "receiveUserVars";
  static ERROR: string = "error";
  static RECEIVE_IV: string = "receiveIV";
  static RECEIVE_SOCKET_ID: string = "receiveSocketID";
  static RECEIVE_USERS: string = "receiveUsers";
  static LOGIN_SUCCESS: string = "loginSuccess";
  static RECEIVE_MESSAGE: string = "receiveMessage";
  static USER_LEAVE_ROOM: string = "userLeaveRoom";
  static LOGIN_ERROR: string = "loginError";
  static RECEIVE_VERSION: string = "receiveVersion";
  _userID: number = 0;
  _moderator: boolean = false;
  declare _data: any;
  declare _vars: any;
  declare _error: string;
  declare _iv: string;
  declare _userName: string;
  _version: number = NaN;
  declare _roomName: string;
  declare _raw: any;
  _time: number = 0;
  _socketID: number = 0;
  declare _userList: any[];
  declare _fromUser: BlossomUser;
  declare _roomList: any[];
  get error(): string {
         return this._error;
      }
  get roomName(): string {
         return this._roomName;
      }
  get socketID(): number {
         return this._socketID;
      }
  get iv(): string {
         return this._iv;
      }
  get fromUser(): BlossomUser {
         return this._fromUser;
      }
  get userID(): number {
         return this._userID;
      }
  get version(): number {
         return this._version;
      }
  get userList(): any[] {
         return this._userList;
      }
  get data(): any {
         return this._data;
      }
  get userName(): string {
         return this._userName;
      }
  get raw(): any {
         return this._raw;
      }
  get time(): number {
         return this._time;
      }
  get vars(): any {
         return this._vars;
      }
  get roomList(): any[] {
         return this._roomList;
      }
  constructor(param1: string, param2: any, param3: BlossomUser = null, param4: boolean = false, param5: boolean = false) {
         super(param1,param4,param5);
         this._raw = param2;
         this._fromUser = param3;
         this._socketID = int(param2.socketID);
         this._roomName = param2.roomName;
         this._data = param2.data;
         this._vars = param2.vars;
         this._error = param2.error;
         this._roomList = param2.roomList;
         this._userList = param2.userList;
         this._userName = param2.userName;
         this._userID = int(param2.userID);
         this._iv = param2.iv;
         this._version = param2.version;
         this._time = int(param2.time);

      }
}
$reg('com.jiggmin.blossomSocket.BlossomEvent', BlossomEvent);
