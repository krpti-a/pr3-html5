// Ported from com/jiggmin/pr3/menu/MenuPage.as
import { Event, KeyboardEvent, MouseEvent, URLLoader, URLRequest, URLRequestMethod, URLVariables, clearInterval, navigateToURL, setInterval, setTimeout } from '../../../flash/index.ts';
import { int, uint, $b } from '../../../flash/as3.ts';
import { Page } from '../../page/Page.ts';
import { LevelEditorPage, ListCache, LoginPopup, MenuMusic, MenuPageGraphic, MessagePopup, PlatformRacing3, ServerManager, Settings, Sparkworkz } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class MenuPage extends Page {
  declare m: MenuPageGraphic;
  loginInterval: number = 0;
  loginToServerAutomatic: boolean = false;
  hitEnter(event: KeyboardEvent = null): void {
         if(event.keyCode == 13)
         {
            this.clickGo();
         }
      }
  clickGo(event: MouseEvent = null): void {
         var _loc_2= undefined;
         var _loc_1= undefined;
         var _loc_3= undefined;
         var _loc_4= undefined;
         var _loc_5= undefined;
         clearInterval(this.loginInterval);
         if(this.m.loginPanel.currentFrame == 2)
         {
            _loc_2 = null;
            _loc_1 = this.m.loginPanel.serverDropdown;
            if(_loc_1.selectedOption != null)
            {
               Settings.server = _loc_1.selectedOption.data;
               _loc_2 = new LoginPopup();
               this.addPopup(_loc_2);
            }
         }
         else if(this.m.loginPanel.currentFrame == 3)
         {
            this.m.loginPanel.mouseEnabled = false;
            _loc_3 = new URLLoader();
            _loc_3.addEventListener(Event.COMPLETE,$b(this, 'registerCallback'));
            _loc_4 = new URLRequest(Sparkworkz.SPARKWORKS_LOCATION + "register");
            _loc_5 = new URLVariables();
            _loc_5.username = this.m.loginPanel.userNameField.textBox.text;
            _loc_5.password = this.m.loginPanel.passwordField.textBox.text;
            _loc_5.retype_password = this.m.loginPanel.retypePasswordField.textBox.text;
            _loc_5.email = this.m.loginPanel.emailField.textBox.text;
            _loc_4.data = _loc_5;
            _loc_4.method = URLRequestMethod.POST;
            _loc_3.load(_loc_4);
         }
         else
         {
            this.showLoadingPanel();
            Settings.clearLoginInfo();
            _loc_3 = new URLLoader();
            _loc_3.addEventListener(Event.COMPLETE,$b(this, 'loginCallback'));
            _loc_4 = new URLRequest(Sparkworkz.SPARKWORKS_LOCATION + "login");
            _loc_5 = new URLVariables();
            _loc_5.username = this.m.loginPanel.userNameField.textBox.text;
            _loc_5.password = this.m.loginPanel.passwordField.textBox.text;
            _loc_4.data = _loc_5;
            _loc_4.method = URLRequestMethod.POST;
            _loc_3.load(_loc_4);
         }
      }
  loginCallback(event: Event): void {
         if(event.target.data == "")
         {
            this.loginToServerAutomatic = true;
         }
         else
         {
            this.addPopup(new MessagePopup(event.target.data));
         }
         Sparkworkz.IsLoggedIn($b(this, 'isLoggedInCallback'));
      }
  registerCallback(event: Event): void {
         this.m.loginPanel.mouseEnabled = true;
         if(event.target.data == "")
         {
            this.loginToServerAutomatic = true;
            this.showLoadingPanel();
            Settings.clearLoginInfo();
            Sparkworkz.IsLoggedIn($b(this, 'isLoggedInCallback'));
         }
         else
         {
            this.addPopup(new MessagePopup(event.target.data));
         }
      }
  showLoadingPanel(): void {
         if(this.m != null)
         {
            this.m.loginPanel.visible = false;
            this.m.loadingPanel.visible = true;
            ServerManager.stopRefreshing();
         }
      }
  clickEditor(): void {
         this.setPage(new LevelEditorPage());
      }
  clickLogoff(): void {
         clearInterval(this.loginInterval);
         this.showLoadingPanel();
         Settings.clearLoginInfo();
         var _loc_3= new URLLoader();
         _loc_3.addEventListener(Event.COMPLETE,$b(this, 'logoutCallback'));
         var _loc_4= new URLRequest(Sparkworkz.SPARKWORKS_LOCATION + "logout");
         _loc_3.load(_loc_4);
      }
  logoutCallback(event: Event): void {
         Sparkworkz.IsLoggedIn($b(this, 'isLoggedInCallback'));
      }
  clickRegister(event: MouseEvent): void {
         this.m.loginPanel.gotoAndStop(3);
         this.showLoginPanel();
      }
  clickPlayAsGuest(event: MouseEvent): void {
         this.m.loginPanel.gotoAndStop(2);
         this.showLoginPanel();
      }
  clickBack(event: MouseEvent): void {
         this.m.loginPanel.gotoAndStop(1);
         this.showLoginPanel();
      }
  isLoggedInCallback(result: any): void {
    const $this = this;
         var displayName: string= null;
         if(this.removed)
         {
            return;
         }
         if(result == null)
         {
            setTimeout(function (): any {
               Sparkworkz.IsLoggedIn($b($this, 'isLoggedInCallback'));
            },3333);
         }
         else
         {
            if(result.IsLoggedIn == 1)
            {
               Settings.loginType = Settings.LOGIN_TYPE_MEMBER;
               this.m.loginPanel.gotoAndStop(2);
            }
            else
            {
               Settings.loginType = Settings.LOGIN_TYPE_GUEST;
               this.loginToServerAutomatic = false;
               this.m.loginPanel.gotoAndStop(Settings.autoPlayLevelID != -1 ? 2 : 1);
            }
            Settings.userName = result.UserName;
            Settings.userID = result.UserId;
            if(Settings.loginType == Settings.LOGIN_TYPE_MEMBER)
            {
               displayName = "Welcome " + Settings.userName;
            }
            else
            {
               displayName = "Welcome Guest!";
            }
            if(this.m.loginPanel.nameBox != null)
            {
               this.m.loginPanel.nameBox.text = displayName;
            }
            this.showLoginPanel();
            if(Settings.autoPlayLevelID != -1)
            {
               clearInterval(this.loginInterval);
               this.loginInterval = uint(setInterval($b(this, 'clickGo'),100));
            }
            else if(this.loginToServerAutomatic)
            {
               this.loginToServerAutomatic = false;
               this.clickGo();
            }
         }
      }
  showLoginPanel(): void {
         if(this.m != null)
         {
            this.m.loginPanel.visible = true;
            this.m.loadingPanel.visible = false;
            ServerManager.setDisplayTarget(this.m.loginPanel.serverDropdown);
            ServerManager.startRefreshing();
            if(this.m.loginPanel.currentFrame == 1)
            {
               this.m.loginPanel.serverDropdown.y = 55.6;
               this.m.loginPanel.registerBtn.addEventListener(MouseEvent.CLICK,$b(this, 'clickRegister'),false,0,true);
               this.m.loginPanel.playAsGuestBtn.addEventListener(MouseEvent.CLICK,$b(this, 'clickPlayAsGuest'),false,0,true);
            }
            else if(this.m.loginPanel.currentFrame == 2)
            {
               this.m.loginPanel.serverDropdown.y = 37.1;
               this.m.loginPanel.logoffButton.init("Log off",$b(this, 'clickLogoff'));
            }
            else if(this.m.loginPanel.currentFrame == 3)
            {
               this.m.loginPanel.serverDropdown.y = 65.6;
               this.m.loginPanel.backBtn.addEventListener(MouseEvent.CLICK,$b(this, 'clickBack'),false,0,true);
            }
            if(this.m.loginPanel.userNameField)
            {
               this.m.loginPanel.userNameField.placeholder = "Username...";
            }
            if(this.m.loginPanel.emailField)
            {
               this.m.loginPanel.emailField.placeholder = "Email...";
            }
            if(this.m.loginPanel.passwordField)
            {
               this.m.loginPanel.passwordField.displayAsPassword = true;
               this.m.loginPanel.passwordField.placeholder = "Password...";
            }
            if(this.m.loginPanel.retypePasswordField)
            {
               this.m.loginPanel.retypePasswordField.displayAsPassword = true;
               this.m.loginPanel.retypePasswordField.placeholder = "Retype Password...";
            }
         }
      }
  remove(): void {
         clearInterval(this.loginInterval);
         ServerManager.clearDisplayTarget();
         ServerManager.stopRefreshing();
         if(this.m.loginPanel.currentFrame != 2)
         {
            this.m.iphoneButton.removeEventListener(MouseEvent.CLICK,$b(this, 'clickIphoneHandler'));
            this.m.loginPanel.joinServerButton.removeEventListener(MouseEvent.CLICK,$b(this, 'clickGo'));
         }
         this.m = null;
         super.remove();
      }
  clickIphoneHandler(event: MouseEvent): void {
         navigateToURL(new URLRequest("http://itunes.apple.com/us/app/platform-racing-3/id437364752?mt=8"),"_blank");
      }
  getRandomElementOf(array: any[]): any {
         var idx: number = int(Math.floor(Math.random() * array.length));
         return array[idx];
      }
  init(): void {
         super.init();
         PlatformRacing3.instance.discord.updateTitle("In Menu");
      }
  constructor() {
         super();
         this.m = new MenuPageGraphic();
         this.m.iphoneButton.addEventListener(MouseEvent.CLICK,$b(this, 'clickIphoneHandler'),false,0,true);
         this.m.addEventListener(KeyboardEvent.KEY_DOWN,$b(this, 'hitEnter'),false,0,true);
         this.m.removeChild(this.m.iphoneButton);
         this.addChild(this.m);
         ListCache.deleteEntireCache();
         this.w = Settings.gameWidth;
         this.h = Settings.gameHeight;
         if(!MenuMusic.isPlaying())
         {
            MenuMusic.start();
            MenuMusic.setVolume(0);
         }
         MenuMusic.glideToVolume(Settings.musicOn / 50 * 0.75);
         PlatformRacing3.mutePos1();
         this.m.loginPanel.serverDropdown.label = "Loading Servers...";
         this.m.loginPanel.gotoEditorButton.init("Goto Level Editor",$b(this, 'clickEditor'));
         this.m.loginPanel.joinServerButton.addEventListener(MouseEvent.CLICK,$b(this, 'clickGo'),false,0,true);
         this.showLoadingPanel();
         Settings.clearLoginInfo();
         Sparkworkz.IsLoggedIn($b(this, 'isLoggedInCallback'));
      }
}
$reg('com.jiggmin.pr3.menu.MenuPage', MenuPage);
