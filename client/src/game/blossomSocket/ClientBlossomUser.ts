// Ported from com/jiggmin/blossomSocket/ClientBlossomUser.as
import { uint } from '../../flash/as3.ts';
import { BlossomUser } from './BlossomUser.ts';
import { BlossomSocket } from '../refs.ts';
import { $reg } from '../refs.ts';

export class ClientBlossomUser extends BlossomUser {
  declare _permissions: any[];
  get permissions(): any[] {
         return this._permissions;
      }
  set permissions(permissions: any[]) {
         this._permissions = permissions;
      }
  hasPermission(permission: string): boolean {
         return this._permissions.indexOf(permission) != -1;
      }
  constructor(socket: BlossomSocket, socketId: number, userId: number = 0, username: string = null, vars: any = null, permissions: any[] = null) {
    socketId = uint(socketId); userId = uint(userId);
         super(socket,socketId,userId,username,vars);
         this._permissions = permissions;
      }
}
$reg('com.jiggmin.blossomSocket.ClientBlossomUser', ClientBlossomUser);
