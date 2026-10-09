// Ported from com/jiggmin/pr3/PlatformRacing3.as
import { Event, ExternalInterface, Keyboard, KeyboardEvent, Stage, StageDisplayState, Timer, setInterval, stage, trace } from '../../flash/index.ts';
import { $as, $b } from '../../flash/as3.ts';
import { PageHolder } from '../page/PageHolder.ts';
import { BlockEditorPage, BlockManager, Cursor, Data, DiscordHandler, DoughnutGraphic, ErrorPage, Items, Key, LastActive, LevelEditorPage, LocalPlayer, LocalPlayerLuaWrapper, LuaBufferUtils, LuaState, MapManager, MenuPage, MobileControls, MuteButton, Page, Player, PlayerLuaWrapper, Popup, ProjectileEffectLuaWrapper, SWFWheel, Settings, SocketManager, Sounds, Sparkworkz, StampManager, TypeLuaWrapper } from '../refs.ts';
import { $reg } from '../refs.ts';

export class PlatformRacing3 extends PageHolder {
  declare static instance: PlatformRacing3;
  static SPARKWORKZ_DEBUG: boolean = false;
  static SPARKWORKZ_GAME_ID: string = "f1c25e3bd3523110394b5659c68d8092";
  static universalTimerEvent: string = "universalTimer";
  static lua: LuaState = null;
  declare mute: MuteButton;
  declare universalTimer: Timer;
  lastFrame: number = -1;
  declare discord: DiscordHandler;
  static startLuaState(): void {
         if(PlatformRacing3.lua != null)
         {
            PlatformRacing3.lua.close();
         }
         PlatformRacing3.lua = new LuaState();
         PlatformRacing3.lua.setGlobal("instanceof",TypeLuaWrapper.testType);
         PlatformRacing3.lua.setGlobal("Player",new TypeLuaWrapper(PlayerLuaWrapper));
         PlatformRacing3.lua.setGlobal("LocalPlayer",new TypeLuaWrapper(LocalPlayerLuaWrapper));
         PlatformRacing3.lua.setGlobal("Projectile",new TypeLuaWrapper(ProjectileEffectLuaWrapper));
         PlatformRacing3.lua.setGlobal("BufferUtils",LuaBufferUtils);
      }
  static setPage(param1: Page): void {
         PlatformRacing3.instance.setPage(param1);
      }
  static mutePos1(): void {
         PlatformRacing3.instance.mute.x = 30;
         PlatformRacing3.instance.mute.y = Settings.gameHeight - 40;
      }
  static mutePos2(): void {
         PlatformRacing3.instance.mute.x = Settings.gameWidth - 49;
         PlatformRacing3.instance.mute.y = 26;
      }
  static mutePos3(): void {
         PlatformRacing3.instance.mute.x = Settings.gameWidth - 45;
         PlatformRacing3.instance.mute.y = Settings.gameHeight - 37;
      }
  static addPopup(param1: Popup): void {
         if(PlatformRacing3.instance.curPage != null)
         {
            PlatformRacing3.instance.curPage.addPopup(param1);
         }
      }
  static handleFullscreen(evt: Event): void {
         var stage: Stage= null;
         if(evt.keyCode == Keyboard.F11)
         {
            stage = $as(evt.currentTarget, Stage);
            if(stage.displayState != StageDisplayState.FULL_SCREEN_INTERACTIVE)
            {
               stage.displayState = StageDisplayState.FULL_SCREEN_INTERACTIVE;
            }
            else
            {
               stage.displayState = StageDisplayState.NORMAL;
            }
         }
      }
  UserLoggedInJavaScriptCallback(): void {
         if(this.curPage instanceof MenuPage)
         {
            this.setPage(new MenuPage());
         }
         else
         {
            Sparkworkz.IsLoggedIn($b(this, 'isLoggedInCallback'));
         }
      }
  isLoggedInCallback(param1: any): void {
         var _loc_2= null;
         var _loc_3= NaN;
         if(param1.IsLoggedIn == 1)
         {
            _loc_2 = param1.UserName;
            _loc_3 = param1.UserId;
            Settings.loginType = Settings.LOGIN_TYPE_MEMBER;
            if(this.curPage instanceof LevelEditorPage || this.curPage instanceof BlockEditorPage)
            {
               (this.curPage).removeGuestNote();
            }
         }
         else
         {
            this.UserLoggedOutJavaScriptCallback();
         }
      }
  checkInactive(): void {
         if(SocketManager.socket != null && SocketManager.socket.me != null)
         {
            if(!SocketManager.socket.me.hasPermission("access_no_idle_kick") && LastActive.elapsed / 1000 / 60 > 20)
            {
               this.setPage(new ErrorPage("You were logged out due to being inactive for more than 20 minutes."));
            }
         }
         else
         {
            LastActive.reset();
         }
      }
  UserLoggedOutJavaScriptCallback(): void {
         this.setPage(new MenuPage());
         if(SocketManager.socket != null)
         {
            SocketManager.socket.close();
         }
         Settings.loginType = Settings.LOGIN_TYPE_GUEST;
      }
  addedToStageHandler(event: Event): void {
         var e= event;
         this.removeEventListener(Event.ADDED_TO_STAGE,$b(this, 'addedToStageHandler'));
         Key.init(this.stage);
         this.stage.addEventListener(KeyboardEvent.KEY_DOWN,PlatformRacing3.handleFullscreen,false,0,true);
         Settings.init();
         MobileControls.init();
         BlockManager.init();
         StampManager.init();
         MapManager.init();
         Sounds.init();
         Items.init();
         LastActive.init(this.stage);
         Cursor.stageRef = this.stage;
         SWFWheel.initialize(this.stage);
         SWFWheel.browserScroll = false;
         Sparkworkz.Initialize(PlatformRacing3.SPARKWORKZ_GAME_ID,Sparkworkz.SPARKWORKZ_LIVE,PlatformRacing3.SPARKWORKZ_DEBUG);
         this.mute = new MuteButton();
         this.stage.addChild(this.mute);
         PlatformRacing3.mutePos1();
         if(Settings.startMuted)
         {
            this.mute.toggle();
         }
         setInterval($b(this, 'checkInactive'),20000);
         try
         {
            ExternalInterface.addCallback("UserLoggedIn",$b(this, 'UserLoggedInJavaScriptCallback'));
            ExternalInterface.addCallback("UserLoggedOut",$b(this, 'UserLoggedOutJavaScriptCallback'));
         }
         catch (error)
         {
         }
         var paramObj= this.root.loaderInfo.parameters;
         var autoPlayLevelID= paramObj.levelId;
         if(!isNaN(autoPlayLevelID) && autoPlayLevelID != 0 && autoPlayLevelID != false)
         {
            Settings.autoPlayLevelID = autoPlayLevelID;
         }
         this.parent.addChild(new DoughnutGraphic());
         this.setPage(new MenuPage());
         this.universalTimer = new Timer(1000 / Settings.gameFPS);
         this.lastFrame = Data.getMS();
         this.universalTimer.start();
         try
         {
         }
         catch (error)
         {
         }
      }
  constructor() {
         super();
         PlatformRacing3.instance = this;
         PlatformRacing3.startLuaState();
         this.addEventListener(Event.ADDED_TO_STAGE,$b(this, 'addedToStageHandler'),false,0,true);
         try
         {
            this.discord = new DiscordHandler();
            this.discord.init();
         }
         catch (e)
         {
            trace(e.getStackTrace());
         }
      }
}
$reg('com.jiggmin.pr3.PlatformRacing3', PlatformRacing3);
