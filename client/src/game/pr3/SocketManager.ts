// Ported from com/jiggmin/pr3/SocketManager.as
import { Event, EventDispatcher, IOErrorEvent, SecurityErrorEvent } from '../../flash/index.ts';
import { int } from '../../flash/as3.ts';
import { BlossomEvent, ErrorPage, PR3Socket, PlatformRacing3, Settings } from '../refs.ts';
import { $reg } from '../refs.ts';

export class SocketManager {
  declare static _server: any;
  declare static _socket: PR3Socket;
  declare static disp: EventDispatcher;
  static SOCKET_ERROR: string = "socketError";
  static errorMessage: string = "";
  static dispatchEvent(event: Event): void {
         if(SocketManager.disp == null)
         {
            return;
         }
         SocketManager.disp.dispatchEvent(event);
      }
  static get server(): any {
         return SocketManager._server;
      }
  static socketCloseHandler(event: Event): void {
         SocketManager.errorMessage = "Your connection to the server was lost.";
         SocketManager.handleClose();
      }
  static close(): void {
         if(SocketManager._socket != null)
         {
            SocketManager._socket.removeEventListener(Event.CLOSE,SocketManager.socketCloseHandler);
            SocketManager._socket.removeEventListener(BlossomEvent.ERROR,SocketManager.socketErrorHandler);
            SocketManager._socket.removeEventListener(IOErrorEvent.IO_ERROR,SocketManager.ioErrorHandler);
            SocketManager._socket.removeEventListener(SecurityErrorEvent.SECURITY_ERROR,SocketManager.securityErrorHandler);
            SocketManager._socket.remove();
            SocketManager._socket = null;
         }
         SocketManager._server = null;
      }
  static ioErrorHandler(event: IOErrorEvent): void {
         SocketManager.errorMessage = "Could not connect. This could be because: \nA: The server is broken. \nB: The internet is broken. \nC: Evil aliens.";
         SocketManager.handleClose();
      }
  static connect(param1: any): PR3Socket {
         SocketManager.close();
         SocketManager._server = param1;
         SocketManager._socket = new PR3Socket(param1.address,param1.port,param1.key);
         SocketManager._socket.addEventListener(Event.CLOSE,SocketManager.socketCloseHandler,false,0,true);
         SocketManager._socket.addEventListener(BlossomEvent.ERROR,SocketManager.socketErrorHandler,false,0,true);
         SocketManager._socket.addEventListener(IOErrorEvent.IO_ERROR,SocketManager.ioErrorHandler,false,0,true);
         SocketManager._socket.addEventListener(SecurityErrorEvent.SECURITY_ERROR,SocketManager.securityErrorHandler,false,0,true);
         if(Settings.traceTraffic)
         {
            SocketManager._socket.traceTraffic = true;
         }
         SocketManager.dispatchEvent(new Event(Event.CONNECT));
         return SocketManager._socket;
      }
  static addEventListener(param1: string, param2: Function, param3: boolean = false, param4: number = 0, param5: boolean = false): void {
    param4 = int(param4);
         if(SocketManager.disp == null)
         {
            SocketManager.disp = new EventDispatcher();
         }
         SocketManager.disp.addEventListener(param1,param2,param3,param4,param5);
      }
  static handleClose(): void {
         SocketManager.dispatchEvent(new Event(SocketManager.SOCKET_ERROR));
         PlatformRacing3.setPage(new ErrorPage(SocketManager.errorMessage));
         SocketManager.close();
      }
  static securityErrorHandler(event: SecurityErrorEvent): void {
         SocketManager.errorMessage = "Coulden\'t get permission to connect to server.";
         SocketManager.handleClose();
      }
  static get socket(): PR3Socket {
         return SocketManager._socket;
      }
  static socketErrorHandler(event: BlossomEvent): void {
         SocketManager.errorMessage = event.error;
         SocketManager.handleClose();
      }
  static removeEventListener(param1: string, param2: Function, param3: boolean = false): void {
         if(SocketManager.disp == null)
         {
            return;
         }
         SocketManager.disp.removeEventListener(param1,param2,param3);
      }
  constructor() {
         
      }
}
$reg('com.jiggmin.pr3.SocketManager', SocketManager);
