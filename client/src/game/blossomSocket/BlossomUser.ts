// Ported from com/jiggmin/blossomSocket/BlossomUser.as
import { Sprite } from '../../flash/index.ts';
import { uint, $keys, $b } from '../../flash/as3.ts';
import { BlossomEvent, BlossomSocket } from '../refs.ts';
import { $reg } from '../refs.ts';

export class BlossomUser extends Sprite {
  declare socket: BlossomSocket;
  _socketID: number = 0;
  _userID: number = 0;
  declare _userName: string;
  declare _vars: any;
  remove(): void {
         this.socket.removeEventListener(BlossomEvent.RECEIVE_USER_VARS + this.socketID,$b(this, 'receiveUserVarsHandler'));
         this.socket.removeEventListener(BlossomEvent.RECEIVE_MESSAGE + this.socketID,$b(this, 'receiveMessageHandler'));
         this.socket = null;
      }
  get socketID(): number {
         return this._socketID;
      }
  set socketID(socketId: number) {
    socketId = uint(socketId);
         this._socketID = uint(socketId);
      }
  get userID(): number {
         return this._userID;
      }
  set userID(userId: number) {
    userId = uint(userId);
         this._userID = uint(userId);
      }
  get userName(): string {
         return this._userName;
      }
  set userName(username: string) {
         this._userName = username;
      }
  get vars(): any {
         return this._vars;
      }
  set vars(vars: any) {
         this._vars = vars;
      }
  send(data: any): void {
         this.socket.sendToUser(this.socketID,data);
      }
  receiveMessageHandler(event: BlossomEvent): void {
         this.dispatchEvent(new BlossomEvent(BlossomEvent.RECEIVE_MESSAGE,event.data));
      }
  receiveUserVarsHandler(event: BlossomEvent): void {
         this.addVars(event.vars);
         this.dispatchEvent(new BlossomEvent(BlossomEvent.RECEIVE_USER_VARS,event.vars));
      }
  getVars(key: any): void {
         this.socket.getUserVars(this.socketID,key);
      }
  addVars(vars: any): void {
         var value: any= null;
         for (value of $keys(vars))
         {
            this._vars[value] = vars[value];
         }
      }
  constructor(socket: BlossomSocket, socketId: number, userId: number = 0, username: string = null, vars: any = null) {
    socketId = uint(socketId); userId = uint(userId);
         super();
         this.socket = socket;
         this._socketID = uint(socketId);
         this._userID = uint(userId);
         this._userName = username;
         this._vars = vars;
         socket.addEventListener(BlossomEvent.RECEIVE_USER_VARS + this.socketID,$b(this, 'receiveUserVarsHandler'),false,0,true);
         socket.addEventListener(BlossomEvent.RECEIVE_MESSAGE + this.socketID,$b(this, 'receiveMessageHandler'),false,0,true);
      }
}
$reg('com.jiggmin.blossomSocket.BlossomUser', BlossomUser);
