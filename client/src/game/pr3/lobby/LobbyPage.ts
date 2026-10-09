// Ported from com/jiggmin/pr3/lobby/LobbyPage.as
import { Dictionary, DisplayObject, MouseEvent } from '../../../flash/index.ts';
import { $keys, $b } from '../../../flash/as3.ts';
import { Page } from '../../page/Page.ts';
import { Chat, ChatPopup, CreatingMatchPopup, CustomizePopup, LobbyJumpMenu, LobbyPageGraphic, LobbyPopup, MenuMusic, ModPopup, MultiPlayerPopup, PMMenuPopup, PlatformRacing3, Player, Settings, SinglePlayerPopup, SocketManager, UsersPopup, WelcomePopup, YouAreSilencedPopup } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class LobbyPage extends Page {
  static displayedWelcome: boolean = false;
  static lastPopupName: string = "customize";
  declare buttonDic: any;
  declare selectedButton: DisplayObject;
  declare m: LobbyPageGraphic;
  declare curPopup: LobbyPopup;
  initButton(param1: DisplayObject, param2: string, param3: string, param4: Function, param5: string): void {
         param1.addEventListener(MouseEvent.CLICK,$b(this, 'clickButtonHandler'),false,0,true);
         param1.addEventListener(MouseEvent.MOUSE_OVER,$b(this, 'overButtonHandler'),false,0,true);
         param1.addEventListener(MouseEvent.MOUSE_OUT,$b(this, 'outButtonHandler'),false,0,true);
         this.buttonDic[param1] = {
            "title":param2,
            "description":param3,
            "func":param4,
            "popupName":param5
         };
      }
  overButtonHandler(event: MouseEvent): void {
         var _loc_2= (event.target);
         this.moveTab(_loc_2);
      }
  changeTab(param1: DisplayObject): void {
         this.selectedButton = param1;
         this.moveTab(param1);
         var _loc_2= this.buttonDic[param1];
         this.changePopup(_loc_2.popupName);
      }
  nameToPopup(param1: string): LobbyPopup {
         var _loc_2= null;
         if(param1 == "singlePlayer")
         {
            _loc_2 = new SinglePlayerPopup();
         }
         else if(param1 == "multiPlayer")
         {
            _loc_2 = new MultiPlayerPopup();
         }
         else if(param1 == "customize")
         {
            _loc_2 = new CustomizePopup();
         }
         else if(param1 == "chat")
         {
            _loc_2 = new ChatPopup();
         }
         else if(param1 == "players")
         {
            _loc_2 = new UsersPopup();
         }
         else if(param1 == "messages")
         {
            _loc_2 = new PMMenuPopup();
         }
         else if(param1 == "mod")
         {
            _loc_2 = new ModPopup();
         }
         return _loc_2;
      }
  outButtonHandler(event: MouseEvent): void {
         this.moveTab(this.selectedButton);
      }
  moveTab(param1: DisplayObject): void {
         this.m.bubble.tab.x = param1.x - 4 - this.m.bubble.x;
         var _loc_2= this.buttonDic[param1];
         this.setBubbleText(_loc_2.title,_loc_2.description);
      }
  selectButton(param1: DisplayObject): void {
         var _loc_2= this.buttonDic[param1];
         var _loc_3= _loc_2.func;
         this.moveTab(param1);
         _loc_3(param1);
      }
  init(): void {
         var button= undefined;
         var vars: any= null;
         super.init();
         for (button of $keys(this.buttonDic))
         {
            if(this.buttonDic[button].popupName == LobbyPage.lastPopupName)
            {
               this.selectButton(button);
               break;
            }
         }
         vars = SocketManager.socket.me.vars;
         if(Settings.autoPlayLevelID != -1)
         {
            SocketManager.socket.createMatch(Settings.autoPlayLevelID,0,0,99,1,false);
            this.addPopup(new CreatingMatchPopup(false));
            Settings.autoPlayLevelID = -1;
         }
         else if(vars.rank <= 0 && vars.campaign[225] == null && !LobbyPage.displayedWelcome)
         {
            LobbyPage.displayedWelcome = true;
            this.addPopup(new WelcomePopup());
         }
         if(vars.silencedMessage != "" && vars.silencedMessage != null)
         {
            vars.silencedMessage = "";
            this.addPopup(new YouAreSilencedPopup(vars.silencedMessage));
         }
         PlatformRacing3.instance.discord.updateTitle("In Multiplayer Lobby","As: " + vars.userName);
      }
  remove(): void {
         this.removeButton(this.m.singlePlayerButton);
         this.removeButton(this.m.multiPlayerButton);
         this.removeButton(this.m.customizeButton);
         this.removeButton(this.m.chatButton);
         this.removeButton(this.m.playersButton);
         this.removeButton(this.m.editorButton);
         this.removeButton(this.m.backButton);
         this.buttonDic = null;
         this.m = null;
         this.curPopup = null;
         super.remove();
      }
  removeButton(param1: DisplayObject): void {
         param1.removeEventListener(MouseEvent.CLICK,$b(this, 'clickButtonHandler'));
         param1.removeEventListener(MouseEvent.MOUSE_OVER,$b(this, 'overButtonHandler'));
         param1.removeEventListener(MouseEvent.MOUSE_OUT,$b(this, 'outButtonHandler'));
         delete this.buttonDic[param1];
      }
  clickButtonHandler(event: MouseEvent): void {
         var _loc_2= (event.target);
         this.selectButton(_loc_2);
      }
  changePopup(param1: string): void {
         var _loc_2= this.nameToPopup(param1);
         if(this.curPopup != null)
         {
            this.curPopup.remove();
            this.curPopup = null;
         }
         this.curPopup = _loc_2;
         this.addPopup(_loc_2);
         LobbyPage.lastPopupName = param1;
      }
  setBubbleText(param1: string, param2: string): void {
         this.m.bubble.titleBox.text = param1;
         this.m.bubble.textBox.text = param2;
      }
  openJumpMenu(param1: DisplayObject): void {
         var _loc_2= null;
         _loc_2 = new LobbyJumpMenu();
         _loc_2.x = 480;
         _loc_2.y = 100;
         this.addPopup(_loc_2);
      }
  constructor(param1: string = "") {
         super();
         this.w = Settings.gameWidth;
         this.h = Settings.gameHeight;
         this.buttonDic = new Dictionary(true);
         this.addChild(this.m = new LobbyPageGraphic());
         if(param1 != null && param1 != "")
         {
            LobbyPage.lastPopupName = param1;
         }
         if(Settings.musicOn > 0)
         {
            MenuMusic.glideToVolume(Settings.musicOn / 50 * 0.25);
         }
         else
         {
            MenuMusic.glideToVolume(0);
         }
         PlatformRacing3.mutePos2();
         if(SocketManager.socket.me.hasPermission("access_moderator_tools"))
         {
            this.m.gotoAndStop("modFrame");
            this.m.bubble.gotoAndStop("modFrame");
            this.initButton(this.m.modButton,"Moderate","Perform knightly tasks",$b(this, 'changeTab'),"mod");
         }
         this.initButton(this.m.singlePlayerButton,"Single Player Campaign","Beat levels to unlock new levels and items",$b(this, 'changeTab'),"singlePlayer");
         this.initButton(this.m.multiPlayerButton,"Multi-Player Lobby","Race, slice, and blast friends to victory",$b(this, 'changeTab'),"multiPlayer");
         this.initButton(this.m.customizeButton,"Customize","Choose a look or change your stats",$b(this, 'changeTab'),"customize");
         this.initButton(this.m.chatButton,"Chat","Mingle with the locals",$b(this, 'changeTab'),"chat");
         this.initButton(this.m.playersButton,"Players","Keep track of your friends",$b(this, 'changeTab'),"players");
         this.initButton(this.m.editorButton,"Messages","Read messages people have sent you",$b(this, 'changeTab'),"messages");
         this.initButton(this.m.backButton,"Menu","Jump to other areas of this game",$b(this, 'openJumpMenu'),"");
      }
}
$reg('com.jiggmin.pr3.lobby.LobbyPage', LobbyPage);
