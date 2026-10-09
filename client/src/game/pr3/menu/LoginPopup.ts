// Ported from com/jiggmin/pr3/menu/LoginPopup.as
import { Event } from '../../../flash/index.ts';
import { $b } from '../../../flash/as3.ts';
import { ButtonPopup } from '../../popup/ButtonPopup.ts';
import { BlossomEvent, Data, EditorPopupBGGraphic, ErrorPage, LobbyPage, LoginPopupGraphic, PR3Socket, Settings, SocketManager, Sparkworkz } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class LoginPopup extends ButtonPopup {
  static lastUsername: string = "";
  declare socket: PR3Socket;
  declare m: any;
  remove(): void {
         this.endLogin();
         super.remove();
      }
  getLoginToken(): void {
         var data: any= ({} as any);
         Sparkworkz.DataAccess("GetLoginToken2",data,$b(this, 'getLoginTokenCallback'));
      }
  clickCancel(): void {
         this.remove();
      }
  getLoginTokenCallback(data: any, errorMessage: string): void {
         var row: any= null;
         var loginToken: string= null;
         if(errorMessage != "")
         {
            this.handleError("Failed to retrieve login token: " + errorMessage);
         }
         else
         {
            if(data == null)
            {
               this.handleError("No data was received, internal error?");
               return;
            }
            row = data.Row;
            if(row == null)
            {
               this.handleError("Data row was missing, internal error?");
               return;
            }
            loginToken = row.login_token;
            if(loginToken == null || loginToken == "")
            {
               this.handleError("Received empty login token, are you logged in?");
            }
            else
            {
               this.startVerifiedLogin(row.login_token);
            }
         }
      }
  startGuestLogin(): void {
         this.socket = SocketManager.connect(Settings.server);
         this.socket.addEventListener(BlossomEvent.LOGIN_SUCCESS,$b(this, 'loginSuccessHandler'),false,0,true);
         this.socket.addEventListener(BlossomEvent.LOGIN_ERROR,$b(this, 'loginErrorHandler'),false,0,true);
         SocketManager.addEventListener(SocketManager.SOCKET_ERROR,$b(this, 'socketErrorHandler'),false,0,true);
         this.socket.pr3GuestLogin();
      }
  startVerifiedLogin(loginToken: string): void {
         this.socket = SocketManager.connect(Settings.server);
         this.socket.addEventListener(BlossomEvent.LOGIN_SUCCESS,$b(this, 'loginSuccessHandler'),false,0,true);
         this.socket.addEventListener(BlossomEvent.LOGIN_ERROR,$b(this, 'loginErrorHandler'),false,0,true);
         SocketManager.addEventListener(SocketManager.SOCKET_ERROR,$b(this, 'socketErrorHandler'),false,0,true);
         this.socket.pr3TokenLogin(loginToken);
      }
  endLogin(): void {
         if(this.socket != null)
         {
            this.socket.removeEventListener(BlossomEvent.LOGIN_SUCCESS,$b(this, 'loginSuccessHandler'));
            this.socket.removeEventListener(BlossomEvent.LOGIN_ERROR,$b(this, 'loginErrorHandler'));
            SocketManager.removeEventListener(SocketManager.SOCKET_ERROR,$b(this, 'socketErrorHandler'));
            this.socket = null;
         }
      }
  loginSuccessHandler(event: BlossomEvent): void {
         this.proceedToPage();
      }
  loginErrorHandler(event: BlossomEvent): void {
         this.handleError(event.error);
      }
  socketErrorHandler(event: Event): void {
         this.handleError(SocketManager.errorMessage);
      }
  handleError(errorMessage: string): void {
         this.setPage(new ErrorPage(errorMessage));
         this.endLogin();
      }
  proceedToPage(): void {
         if(LoginPopup.lastUsername != SocketManager.socket.me.userName)
         {
            LoginPopup.lastUsername = SocketManager.socket.me.userName;
            LobbyPage.displayedWelcome = false;
            this.setPage(new LobbyPage("customize"));
         }
         else
         {
            this.setPage(new LobbyPage());
         }
      }
  constructor() {
         super();
         this.setBG(new EditorPopupBGGraphic());
         this.m = new LoginPopupGraphic();
         this.addGraphic(this.m);
         if(Settings.loginType == Settings.LOGIN_TYPE_MEMBER)
         {
            this.getLoginToken();
         }
         else
         {
            this.startGuestLogin();
         }
         this.createButton($b(this, 'clickCancel'),"Cancel");
      }
}
$reg('com.jiggmin.pr3.menu.LoginPopup', LoginPopup);
