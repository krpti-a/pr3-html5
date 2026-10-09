// Ported from com/jiggmin/ui/MobileControls.as
import { Keyboard } from '../../flash/index.ts';
import { uint } from '../../flash/as3.ts';
import { GamePage, Joystick, MobileDownButtonGraphic, MobileLeftButtonGraphic, MobileRightButtonGraphic, MobileUpButtonGraphic, PlatformRacing3, Settings, TouchEvent } from '../refs.ts';
import { $reg } from '../refs.ts';

export class MobileControls {
  static keysDown: any = ({} as any);
  static useJoyStick: boolean = false;
  static initialized: boolean = false;
  declare static joyStick: Joystick;
  declare static rightButton: any;
  declare static leftButton: any;
  declare static upButton: any;
  declare static downButton: any;
  static init(): void {
         if(!MobileControls.initialized)
         {
            MobileControls.initialized = true;
            MobileControls.rightButton.x = Settings.gameWidth - MobileControls.rightButton.width / 2;
            MobileControls.rightButton.y = 395;
            MobileControls.rightButton.addEventListener(TouchEvent.TOUCH_BEGIN,MobileControls.touchBeginListener);
            MobileControls.rightButton.addEventListener(TouchEvent.TOUCH_OVER,MobileControls.touchBeginListener);
            MobileControls.leftButton.x = Settings.gameWidth - MobileControls.rightButton.width - MobileControls.leftButton.width / 2;
            MobileControls.leftButton.y = 395;
            MobileControls.leftButton.addEventListener(TouchEvent.TOUCH_BEGIN,MobileControls.touchBeginListener);
            MobileControls.leftButton.addEventListener(TouchEvent.TOUCH_OVER,MobileControls.touchBeginListener);
            MobileControls.upButton.x = MobileControls.upButton.width / 2;
            MobileControls.upButton.y = 275;
            MobileControls.upButton.addEventListener(TouchEvent.TOUCH_BEGIN,MobileControls.touchBeginListener);
            MobileControls.upButton.addEventListener(TouchEvent.TOUCH_OVER,MobileControls.touchBeginListener);
            MobileControls.downButton.x = MobileControls.downButton.width / 2;
            MobileControls.downButton.y = 395;
            MobileControls.downButton.addEventListener(TouchEvent.TOUCH_BEGIN,MobileControls.touchBeginListener);
            MobileControls.downButton.addEventListener(TouchEvent.TOUCH_OVER,MobileControls.touchBeginListener);
            PlatformRacing3.instance.stage.addEventListener(TouchEvent.TOUCH_BEGIN,MobileControls.useItemListener);
            PlatformRacing3.instance.stage.addEventListener(TouchEvent.TOUCH_OVER,MobileControls.useItemListener);
            PlatformRacing3.instance.stage.addEventListener(TouchEvent.TOUCH_OUT,MobileControls.touchEndListener);
            PlatformRacing3.instance.stage.addEventListener(TouchEvent.TOUCH_END,MobileControls.touchEndListener);
         }
      }
  static touchBeginListener(event: TouchEvent): void {
         if(event.currentTarget instanceof MobileRightButtonGraphic)
         {
            if(MobileControls.keysDown[Keyboard.RIGHT] == null)
            {
               MobileControls.keysDown[Keyboard.RIGHT] = event.touchPointID;
            }
         }
         else if(event.currentTarget instanceof MobileLeftButtonGraphic)
         {
            if(MobileControls.keysDown[Keyboard.LEFT] == null)
            {
               MobileControls.keysDown[Keyboard.LEFT] = event.touchPointID;
            }
         }
         else if(event.currentTarget instanceof MobileUpButtonGraphic)
         {
            if(MobileControls.keysDown[Keyboard.UP] == null)
            {
               MobileControls.keysDown[Keyboard.UP] = event.touchPointID;
            }
         }
         else if(event.currentTarget instanceof MobileDownButtonGraphic)
         {
            if(MobileControls.keysDown[Keyboard.DOWN] == null)
            {
               MobileControls.keysDown[Keyboard.DOWN] = event.touchPointID;
            }
         }
      }
  static touchEndListener(event: TouchEvent): void {
         if(MobileControls.keysDown[Keyboard.RIGHT] == event.touchPointID)
         {
            delete MobileControls.keysDown[Keyboard.RIGHT];
         }
         else if(MobileControls.keysDown[Keyboard.LEFT] == event.touchPointID)
         {
            delete MobileControls.keysDown[Keyboard.LEFT];
         }
         else if(MobileControls.keysDown[Keyboard.UP] == event.touchPointID)
         {
            delete MobileControls.keysDown[Keyboard.UP];
         }
         else if(MobileControls.keysDown[Keyboard.DOWN] == event.touchPointID)
         {
            delete MobileControls.keysDown[Keyboard.DOWN];
         }
         else if(MobileControls.keysDown[Keyboard.SPACE] == event.touchPointID)
         {
            delete MobileControls.keysDown[Keyboard.SPACE];
         }
      }
  static showPlayerControls(): void {
         if(MobileControls.useJoyStick)
         {
            GamePage.instance.stage.addChild(MobileControls.joyStick);
         }
         else
         {
            GamePage.instance.stage.addChild(MobileControls.rightButton);
            GamePage.instance.stage.addChild(MobileControls.leftButton);
            GamePage.instance.stage.addChild(MobileControls.upButton);
            GamePage.instance.stage.addChild(MobileControls.downButton);
         }
      }
  static hidePlayerControls(): void {
         if(GamePage.instance == null || GamePage.instance.stage == null)
         {
            return;
         }
         if(MobileControls.useJoyStick)
         {
            GamePage.instance.stage.removeChild(MobileControls.joyStick);
         }
         else
         {
            if(GamePage.instance.stage.contains(MobileControls.rightButton))
            {
               GamePage.instance.stage.removeChild(MobileControls.rightButton);
            }
            if(GamePage.instance.stage.contains(MobileControls.leftButton))
            {
               GamePage.instance.stage.removeChild(MobileControls.leftButton);
            }
            if(GamePage.instance.stage.contains(MobileControls.upButton))
            {
               GamePage.instance.stage.removeChild(MobileControls.upButton);
            }
            if(GamePage.instance.stage.contains(MobileControls.downButton))
            {
               GamePage.instance.stage.removeChild(MobileControls.downButton);
            }
         }
      }
  static useItemListener(event: TouchEvent): void {
         var target: any= event.target;
         if(target instanceof MobileRightButtonGraphic || target instanceof MobileLeftButtonGraphic || target instanceof MobileUpButtonGraphic || target instanceof MobileDownButtonGraphic)
         {
            return;
         }
         if(MobileControls.keysDown[Keyboard.SPACE] == null)
         {
            MobileControls.keysDown[Keyboard.SPACE] = event.touchPointID;
         }
      }
  static isDown(id: number): boolean {
    id = uint(id);
         return MobileControls.keysDown[id] != null;
      }
  static __init() {
    MobileControls.joyStick = new Joystick(500,55);
    MobileControls.rightButton = new MobileRightButtonGraphic();
    MobileControls.leftButton = new MobileLeftButtonGraphic();
    MobileControls.upButton = new MobileUpButtonGraphic();
    MobileControls.downButton = new MobileDownButtonGraphic();
  }
  constructor() {
         
      }
}
$reg('com.jiggmin.ui.MobileControls', MobileControls);
