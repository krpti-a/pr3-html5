// Ported from PlatformRacing3_fla/MainTimeline.as
import { Capabilities, ErrorEvent, Event, Keyboard, MovieClip, Multitouch, MultitouchInputMode, setInterval } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { ErrorPage, InternalWorker, Key, MenuPage, MessagePopup, Mute, PlatformRacing3, Removable, Settings, SiteLock, SocketManager, Sparkworkz, Stats, UncaughtErrorEvent } from '../refs.ts';
import { $reg } from '../refs.ts';

export class MainTimeline extends MovieClip {
  static __sym = 'PlatformRacing3_fla.MainTimeline';
  declare stats: Stats;
  errorPopups: any = ({} as any);
  isLoggedInCallback(param1: any): void {
      }
  frame1(): void {
         if(!this.isWorker)
         {
            if(SiteLock.canPlay(this.stage) || Settings.disableSiteLock)
            {
               this.addChild(new PlatformRacing3());
            }
            if(Settings.showStats)
            {
               this.stats = new Stats();
               this.stats.alpha = 0.5;
               this.addChild(this.stats);
            }
         }
         else
         {
            this.stage.frameRate = 0;
            this.stage.stageWidth = 0;
            this.stage.stageHeight = 0;
            this.stage.mouseChildren = false;
         }
      }
  hotkeyListener(event: Event): void {
         if(!Key.isReady)
         {
            return;
         }
         if(Key.isDown(Keyboard.SHIFT) && Key.isDown(Keyboard.CONTROL))
         {
            if(Key.isPressed(Keyboard.D) && Settings.isSoftDebug)
            {
               SocketManager.close();
               if(Sparkworkz.SPARKWORKS_LOCATION != "http://localhost:50010/")
               {
                  Sparkworkz.SPARKWORKS_LOCATION = "http://localhost:50010/";
               }
               else
               {
                  Sparkworkz.SPARKWORKS_LOCATION = "http://localhost:50010/";
               }
               PlatformRacing3.instance.setPage(new MenuPage());
            }
         }
      }
  uncaughtErrorHandler(event: UncaughtErrorEvent): void {
    const $this = this;
         var stackTrace: string= null;
         var error= undefined;
         var count= undefined;
         var popup: MessagePopup= null;
         stackTrace = null;
         var preventDefault: boolean= false;
         try
         {
            error = event.error;
            if(error instanceof Error)
            {
               stackTrace = error.getStackTrace();
               preventDefault = true;
            }
            else if(error instanceof ErrorEvent)
            {
               stackTrace = error.text;
            }
            else if(error != null)
            {
               stackTrace = error.toString();
            }
         }
         catch (e)
         {
         }
         try
         {
            if(PlatformRacing3 != null && PlatformRacing3.instance != null && !(PlatformRacing3.instance.curPage instanceof ErrorPage))
            {
               PlatformRacing3.setPage(new ErrorPage("There was an unrecoverable error!\n\n" + stackTrace));
               if(preventDefault)
               {
                  event.preventDefault();
               }
            }
         }
         catch (e)
         {
         }
         try
         {
            count = this.errorPopups[stackTrace];
            if(count == null)
            {
               this.errorPopups[stackTrace] = 1;
            }
            else
            {
               if(count >= 3)
               {
                  return;
               }
               this.errorPopups[stackTrace] = count + 1;
            }
            popup = new MessagePopup("Exception! Looks like something went wrong! To help resolve this issue please report it to the discord server channel #pr3_bugs and explain what you did before you received this message. Please also include the steps to reproduce this issue! Thank you!\n\n" + stackTrace);
            popup.addEventListener(Removable.REMOVE,function (): any {
               --$this.errorPopups[stackTrace];
            },false,0,true);
            this.addChild(popup);
            if(preventDefault)
            {
               event.preventDefault();
            }
         }
         catch (e)
         {
            try
            {
               this.addChild(new MessagePopup("Something went horribly wrong! The client is most likely in corrupted state!"));
            }
            catch (e)
            {
            }
         }
      }
  get isWorker(): boolean {
         var _loc2_;
         try
         {
            _loc2_ = InternalWorker.shouldActivate === true;
         }
         catch (e)
         {
            -1;
         }
         finally
         {
            return false;
         }
      }
  constructor() {
         super();
         if(!this.isWorker)
         {
            this.loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,$b(this, 'uncaughtErrorHandler'),false,0,true);
         }
         var params: any= this.loaderInfo.parameters;
         if(params != null && (params.softDebug == "true" || Capabilities.isDebugger))
         {
            Settings.isSoftDebug = true;
         }
         this.addFrameScript(0,$b(this, 'frame1'));
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'hotkeyListener'));
         if(!this.isWorker)
         {
            if(Capabilities.playerType == "Desktop" || Capabilities.playerType == "StandAlone" || Capabilities.playerType == "External" || this.loaderInfo.url != null && this.loaderInfo.url.indexOf("https:") == 0 || params != null && params.useHttps == "true")
            {
               Settings.shouldUseHttps = true;
            }
            Mute.doMute(true);
            Multitouch.inputMode = MultitouchInputMode.TOUCH_POINT;
            setInterval(Sparkworkz.IsLoggedIn,1000 * 60 * 25,$b(this, 'isLoggedInCallback'));
         }
         else
         {
            InternalWorker.init();
         }
      }
}
$reg('PlatformRacing3_fla.MainTimeline', MainTimeline);
